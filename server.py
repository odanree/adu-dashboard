#!/usr/bin/env python3
"""
ADU Dashboard Backend - Syncs with Google Sheets
Provides API endpoints for real-time data
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Load environment variables from .env file (for local dev only)
try:
    load_dotenv()
except Exception:
    pass

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SHEET_ID = os.getenv('GOOGLE_SHEET_ID', '')
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
DATA_FILE = Path(__file__).parent / 'data.json'

app = FastAPI(title="ADU Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_currency(value) -> float:
    """Convert '$1,234.56' or TBD/Excluded strings to float."""
    if not isinstance(value, str):
        return float(value) if value else 0.0
    cleaned = value.replace('$', '').replace(',', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0  # TBD / Excluded / empty


def get_sheets_service():
    """Build a Sheets API client from GOOGLE_SERVICE_ACCOUNT_JSON env var."""
    if not SHEET_ID:
        raise ValueError('GOOGLE_SHEET_ID environment variable not set')
    sa_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
    if not sa_json:
        raise ValueError('GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set')
    sa_info = json.loads(sa_json)
    creds = service_account.Credentials.from_service_account_info(sa_info, scopes=SCOPES)
    return build('sheets', 'v4', credentials=creds)


def fetch_from_sheets() -> dict:
    """Pull Phase Details and Payment Schedule from Google Sheets."""
    service = get_sheets_service()
    sheet = service.spreadsheets()

    # --- Phase Details: budget line items grouped by phase ---
    phase_result = sheet.values().get(
        spreadsheetId=SHEET_ID,
        range="'Phase Details'!A1:H60"
    ).execute()
    phase_rows = phase_result.get('values', [])[1:]  # skip header

    phases: dict = {}
    PHASE_NAMES = {
        '1': 'Phase 1: Pre-Construction & Site Preparation',
        '2': 'Phase 2: Foundation & Underground Rough-ins',
        '3': 'Phase 3: Framing & Exterior Shell',
        '4': 'Phase 4: Insulation & Exterior Finishes',
        '5': 'Phase 5: Interior Finishes',
        '6': 'Phase 6: Site Work & Final Touches',
        'Special': 'Phase Special: As-Needed Inspection',
    }
    PHASE_ORDER = ['1', '2', '3', '4', '5', '6', 'Special']

    for row in phase_rows:
        if len(row) < 6:
            continue
        phase_num = row[0].strip()
        task = row[3].strip() if len(row) > 3 else ''
        price_str = row[5].strip() if len(row) > 5 else ''

        if not phase_num or phase_num not in PHASE_NAMES:
            continue
        if not task:
            continue

        cost = parse_currency(price_str)
        if phase_num not in phases:
            phases[phase_num] = {'items': [], 'total': 0.0}
        phases[phase_num]['items'].append({'task': task, 'cost': cost})
        phases[phase_num]['total'] += cost

    expenses = []
    for i, ph in enumerate(PHASE_ORDER, 1):
        if ph not in phases:
            continue
        expenses.append({
            'category': PHASE_NAMES[ph],
            'items': phases[ph]['items'],
            'total': round(phases[ph]['total'], 2),
            'phase': i,
        })

    # --- Payment Schedule: milestone payments with completion dates ---
    pay_result = sheet.values().get(
        spreadsheetId=SHEET_ID,
        range="'Payment Schedule'!A1:F10"
    ).execute()
    pay_rows = pay_result.get('values', [])[1:]  # skip header

    payments = []
    for row in pay_rows:
        if len(row) < 3:
            continue
        payments.append({
            'num': int(row[0]) if row[0].isdigit() else 0,
            'title': row[1] if len(row) > 1 else '',
            'planned': parse_currency(row[2]) if len(row) > 2 else 0.0,
            'cumulative': parse_currency(row[3]) if len(row) > 3 else 0.0,
            'actual': parse_currency(row[4]) if len(row) > 4 else 0.0,
            'dateCompleted': row[5].strip() if len(row) > 5 else '',
        })

    return {
        'expenses': expenses,
        'payments': payments,
        'lastUpdated': datetime.now().isoformat(),
        'source': 'google_sheets',
    }


def get_cached_data() -> Optional[dict]:
    """Return data.json contents if valid, else None."""
    try:
        if DATA_FILE.exists():
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                if data.get('expenses') and len(data['expenses']) > 0:
                    return data
    except Exception as e:
        print(f"Warning: could not load data.json: {e}")
    return None


def fetch_adu_data() -> dict:
    """Fetch from Google Sheets; fall back to data.json cache on error."""
    try:
        data = fetch_from_sheets()
        # Persist to cache for offline fallback
        try:
            with open(DATA_FILE, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Warning: could not write cache: {e}")
        return data
    except Exception as e:
        print(f"Sheets fetch failed: {e} — falling back to cache")
        cached = get_cached_data()
        if cached:
            cached['lastUpdated'] = datetime.now().isoformat()
            cached['source'] = 'cache'
            return cached
        print("No cache available — returning empty")
        return {'expenses': [], 'payments': [], 'lastUpdated': datetime.now().isoformat(), 'source': 'empty'}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
@app.get("/health")
@app.head("/")
@app.head("/health")
def health():
    return JSONResponse(
        content={'status': 'ok', 'message': 'ADU Dashboard API is running'},
        headers={'Cache-Control': 'no-store'}
    )


@app.get("/debug/env")
def debug_env():
    sa_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON', '')
    return {
        'WHITELISTED_EMAILS': os.getenv('VITE_WHITELISTED_EMAILS') or os.getenv('WHITELISTED_EMAILS', 'NOT SET'),
        'PORT': os.getenv('PORT', 'NOT SET'),
        'GOOGLE_SHEET_ID': 'set' if os.getenv('GOOGLE_SHEET_ID') else 'NOT SET',
        'GOOGLE_SERVICE_ACCOUNT_JSON': f'set ({len(sa_json)} chars)' if sa_json else 'NOT SET',
    }


@app.get("/api/data")
def get_data():
    return fetch_adu_data()


@app.get("/api/refresh")
def refresh_data():
    return fetch_adu_data()


@app.get("/api/sheets-link")
def sheets_link(email: str = ""):
    user_email = email.strip().lower()
    whitelisted_str = os.getenv('VITE_WHITELISTED_EMAILS') or os.getenv('WHITELISTED_EMAILS', '')
    allowed_emails = [e.strip().lower() for e in whitelisted_str.split(',') if e.strip()]

    print(f"Extracted email: {user_email}")
    print(f"Allowed emails: {allowed_emails}")
    print(f"Email in whitelist: {user_email in allowed_emails}")

    if user_email in allowed_emails:
        return {'authorized': True, 'url': 'https://docs.google.com/spreadsheets/d/1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk/edit?gid=361465694'}
    return {'authorized': False, 'message': 'Access denied. Only authorized users can access the expense sheet.'}


@app.get("/api/expenses-signoff")
def expenses_signoff():
    return {
        'success': True,
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'signOff': {
            'totalAmount': '$9,494.51',
            'signedOffAmount': '$0.00',
            'pendingAmount': '$9,494.51',
            'signedOffCount': 0,
            'pendingCount': 7,
            'totalCount': 7,
            'percentComplete': 0
        }
    }


@app.post("/api/data")
def save_data(data: dict):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"✅ Data saved at {datetime.now().isoformat()}")
        return {'success': True, 'message': 'Data saved'}
    except Exception as e:
        print(f"Error saving data: {e}")
        return JSONResponse(status_code=400, content={'error': str(e)})


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 8888))
    print(f"🚀 Starting ADU Dashboard Server (FastAPI) on port {port}")
    uvicorn.run('server:app', host='0.0.0.0', port=port, reload=False)
