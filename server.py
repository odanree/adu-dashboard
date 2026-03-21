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
    """Build a Sheets API client.

    Credential resolution order:
    1. GOOGLE_SERVICE_ACCOUNT_JSON env var (production / CI)
    2. Local file at GOOGLE_APPLICATION_CREDENTIALS path (local dev)
    3. Local file at ./.gcp-service-account.json (local dev fallback)
    """
    if not SHEET_ID:
        raise ValueError('GOOGLE_SHEET_ID environment variable not set')

    sa_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
    if sa_json:
        sa_info = json.loads(sa_json)
        creds = service_account.Credentials.from_service_account_info(sa_info, scopes=SCOPES)
    else:
        key_file = (
            os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            or str(Path(__file__).parent / '.gcp-service-account.json')
        )
        if not Path(key_file).exists():
            raise ValueError(
                'No Google credentials found. Set GOOGLE_SERVICE_ACCOUNT_JSON, '
                'GOOGLE_APPLICATION_CREDENTIALS, or place key at .gcp-service-account.json'
            )
        creds = service_account.Credentials.from_service_account_file(key_file, scopes=SCOPES)

    return build('sheets', 'v4', credentials=creds)


# ---------------------------------------------------------------------------
# Canonical phase/budget data — source of truth (Sheets phase structure was
# corrupted; expenses are hardcoded to the agreed contract breakdown).
# Only the Payment Schedule (dynamic payment dates) is pulled from Sheets.
# ---------------------------------------------------------------------------
CANONICAL_EXPENSES = [
    {
        'category': 'Phase 1: Site Mobilization',
        'items': [
            {'task': 'Architect and Engineering', 'cost': 8000},
            {'task': 'Porta Potty', 'cost': 2100},
            {'task': 'Trash Fee', 'cost': 2600},
            {'task': 'Demo', 'cost': 4500},
            {'task': 'Clearing and Grubbing', 'cost': 2100},
            {'task': 'Excavation and Grading', 'cost': 2500},
        ],
        'total': 21800,
        'phase': 1,
    },
    {
        'category': 'Phase 2: Foundation',
        'items': [
            {'task': 'Footings', 'cost': 26000},
        ],
        'total': 26000,
        'phase': 2,
    },
    {
        'category': 'Phase 3: Rough MEP',
        'items': [
            {'task': 'Plumbing, gas, and electrical', 'cost': 9500},
            {'task': 'HVAC & Mechanical', 'cost': 7400},
            {'task': 'Electrical', 'cost': 12000},
            {'task': 'Plumbing', 'cost': 5200},
        ],
        'total': 34100,
        'phase': 3,
    },
    {
        'category': 'Phase 4: Framing',
        'items': [
            {'task': 'Framing', 'cost': 28000},
        ],
        'total': 28000,
        'phase': 4,
    },
    {
        'category': 'Phase 5: Exterior',
        'items': [
            {'task': 'Roofing', 'cost': 17000},
            {'task': 'Doors and Windows', 'cost': 11500},
            {'task': 'Exterior Stucco', 'cost': 12000},
            {'task': 'Insulation', 'cost': 4000},
            {'task': 'Drywall', 'cost': 11500},
        ],
        'total': 56000,
        'phase': 5,
    },
    {
        'category': 'Phase 6: Final Completion',
        'items': [
            {'task': 'Interior Painting', 'cost': 4400},
            {'task': 'Flooring', 'cost': 6576},
            {'task': 'ADU Kitchen', 'cost': 5500},
            {'task': 'ADU Bathroom 1', 'cost': 9500},
            {'task': 'Powder Room', 'cost': 5800},
            {'task': 'Lighting', 'cost': 4500},
            {'task': 'Baseboards', 'cost': 2700},
            {'task': 'Door Trim', 'cost': 2600},
            {'task': 'Exterior Stairs', 'cost': 3000},
            {'task': 'Paving', 'cost': 2500},
            {'task': 'Deputy Inspection', 'cost': 1500},
        ],
        'total': 48176,
        'phase': 6,
    },
    {
        'category': 'OHP (Overhead & Profit)',
        'items': [
            {'task': 'General Contractor Overhead', 'cost': 6000},
            {'task': 'General Contractor Profit', 'cost': 5124},
        ],
        'total': 11124,
        'phase': 7,
    },
]


def fetch_from_sheets() -> dict:
    """Pull Phase Canonical (expenses) and Payment Schedule from Google Sheets."""
    service = get_sheets_service()
    sheet = service.spreadsheets()

    # --- Phase Canonical: A=phase#, B=category, C=task, D=cost ---
    canonical_result = sheet.values().get(
        spreadsheetId=SHEET_ID,
        range="'Phase Canonical'!A1:D60"
    ).execute()
    canonical_rows = canonical_result.get('values', [])[1:]  # skip header

    phases: dict = {}
    phase_order: list = []
    for row in canonical_rows:
        if len(row) < 3:
            continue
        phase_num = row[0].strip()
        category = row[1].strip()
        task = row[2].strip()
        cost = parse_currency(row[3]) if len(row) > 3 else 0.0

        if not phase_num or not task:
            continue
        if phase_num not in phases:
            phases[phase_num] = {'category': category, 'items': [], 'total': 0.0}
            phase_order.append(phase_num)
        phases[phase_num]['items'].append({'task': task, 'cost': cost})
        phases[phase_num]['total'] += cost

    expenses = []
    for i, ph in enumerate(phase_order, 1):
        expenses.append({
            'category': phases[ph]['category'],
            'items': phases[ph]['items'],
            'total': round(phases[ph]['total'], 2),
            'phase': i,
        })

    # --- Payment Schedule: A=num, B=title, C=planned, D=cumulative, E=actual, F=dateCompleted ---
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
    """Fetch from Phase Canonical + Payment Schedule sheets; fall back to hardcoded canonical on error."""
    try:
        data = fetch_from_sheets()
        # Persist to cache for offline fallback (payments only — expenses are canonical)
        try:
            with open(DATA_FILE, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Warning: could not write cache: {e}")
        return data
    except Exception as e:
        print(f"Sheets fetch failed: {e} — using canonical expenses + empty payments")
        return {
            'expenses': CANONICAL_EXPENSES,
            'payments': [],
            'lastUpdated': datetime.now().isoformat(),
            'source': 'canonical_fallback',
        }


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

