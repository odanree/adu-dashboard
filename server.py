#!/usr/bin/env python3
"""
ADU Dashboard Backend - Syncs with Google Sheets
Provides API endpoints for real-time data
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import subprocess
import os
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Email whitelist - loaded from environment variable
WHITELISTED_EMAILS_STR = os.getenv('VITE_WHITELISTED_EMAILS', '')
ALLOWED_EMAILS = [email.strip().lower() for email in WHITELISTED_EMAILS_STR.split(',') if email.strip()]

if not ALLOWED_EMAILS:
    print("WARNING: No whitelisted emails configured. Set VITE_WHITELISTED_EMAILS environment variable.")

# Path to data file
DATA_FILE = Path(__file__).parent / 'data.json'

class ADUHandler(SimpleHTTPRequestHandler):
    def send_json_response(self, data, status=200):
        """Helper to send JSON with CORS headers"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_GET(self):
        if self.path == '/' or self.path == '/health':
            # Health check endpoint for Railway
            self.send_json_response({'status': 'ok', 'message': 'ADU Dashboard API is running'})
        elif self.path == '/api/data':
            self.get_adu_data()
        elif self.path == '/api/refresh':
            self.refresh_data()
        elif self.path.startswith('/api/sheets-link'):
            self.get_sheets_link()
        elif self.path == '/api/expenses-signoff':
            self.get_expenses_signoff()
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_POST(self):
        if self.path == '/api/data':
            self.save_adu_data()
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def get_sheets_link(self):
        """Check email whitelist and return Google Sheets link if authorized"""
        try:
            # Extract email from query parameter
            query_string = self.path.split('?')[1] if '?' in self.path else ''
            params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
            user_email = unquote(params.get('email', '')).lower()
            
            # Debug logging
            print(f"Query string: {query_string}")
            print(f"Raw email param: {params.get('email', '')}")
            print(f"Extracted email: {user_email}")
            print(f"Allowed emails: {ALLOWED_EMAILS}")
            print(f"Email in whitelist: {user_email in ALLOWED_EMAILS}")
            
            if user_email in ALLOWED_EMAILS:
                response = {
                    'authorized': True,
                    'url': 'https://docs.google.com/spreadsheets/d/1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk/edit?gid=361465694'
                }
            else:
                response = {
                    'authorized': False,
                    'message': 'Access denied. Only authorized users can access the expense sheet.'
                }
            
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)}, 400)
    
    def get_expenses_signoff(self):
        """Return mock expense sign-off status for testing"""
        try:
            response = {
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
            self.send_json_response(response)
        except Exception as e:
            self.send_json_response({'error': str(e)}, 500)
    
    def get_adu_data(self):
        """Fetch ADU data from Google Sheets"""
        try:
            # Skip Google Sheets fetch for now - use fallback directly
            raise Exception("Using fallback data")
            # Get Payment Schedule data
            account_email = os.getenv('GOG_ACCOUNT', '')
            if not account_email:
                raise ValueError('GOG_ACCOUNT environment variable not set')
            payments_cmd = [
                'gog', 'sheets', 'get', 
                '1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk',
                "'Payment Schedule'!A1:E10",
                '--account', account_email,
                '--json'
            ]
            
            payments_result = subprocess.run(payments_cmd, capture_output=True, text=True)
            
            # Get Expenses data
            expenses_cmd = [
                'gog', 'sheets', 'get',
                '1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk',
                "'Expenses'!A1:C30",
                '--account', account_email,
                '--json'
            ]
            
            expenses_result = subprocess.run(expenses_cmd, capture_output=True, text=True)
            
            if payments_result.returncode == 0 and expenses_result.returncode == 0:
                payments_data = json.loads(payments_result.stdout)
                expenses_data = json.loads(expenses_result.stdout)
                
                # Parse payments
                payments = []
                if 'values' in payments_data:
                    for i, row in enumerate(payments_data['values'][1:], 1):  # Skip header
                        if len(row) >= 4:
                            payments.append({
                                'num': i,
                                'title': row[1],
                                'planned': self.parse_currency(row[2]),
                                'actual': self.parse_currency(row[4]) if len(row) > 4 else 0
                            })
                
                # Parse expenses
                expenses = []
                if 'values' in expenses_data:
                    for row in expenses_data['values'][1:]:  # Skip header
                        if len(row) >= 2:
                            expenses.append({
                                'category': row[0],
                                'cost': self.parse_currency(row[1])
                            })
                
                data = {
                    'payments': payments,
                    'expenses': expenses,
                    'lastUpdated': datetime.now().isoformat()
                }
                
                self.send_json_response(data)
                return
        
        except Exception as e:
            print(f"Error fetching data: {e}")
        
        # Fallback to cached data
        fallback = self.get_fallback_data()
        self.send_json_response(fallback)
    
    def save_adu_data(self):
        """Save ADU data to JSON file"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            # Save to file
            with open(DATA_FILE, 'w') as f:
                json.dump(data, f, indent=2)
            
            self.send_json_response({'success': True, 'message': 'Data saved'})
            print(f"✅ Data saved at {datetime.now().isoformat()}")
        except Exception as e:
            print(f"Error saving data: {e}")
            self.send_json_response({'error': str(e)}, 400)
    
    def get_fallback_data(self):
        """Load fallback data from file or return defaults"""
        try:
            if DATA_FILE.exists():
                with open(DATA_FILE, 'r') as f:
                    data = json.load(f)
                    data['lastUpdated'] = datetime.now().isoformat()
                    return data
        except Exception as e:
            print(f"Error loading data file: {e}")
        
        # Return default fallback data
        return {
            'expenses': [
                {'category': 'Phase 1: Site Mobilization', 'items': [{'task': 'Architect and Engineering', 'cost': 8000}, {'task': 'Porta Potty', 'cost': 2100}, {'task': 'Trash Fee', 'cost': 2600}, {'task': 'Demo', 'cost': 4500}, {'task': 'Clearing and Grubbing', 'cost': 2100}, {'task': 'Excavation and Grading', 'cost': 2500}], 'total': 21800, 'phase': 1},
                {'category': 'Phase 2: Foundation', 'items': [{'task': 'Footings', 'cost': 26000}], 'total': 26000, 'phase': 2},
                {'category': 'Phase 3: Rough MEP', 'items': [{'task': 'Plumbing, gas, and electrical', 'cost': 9500}, {'task': 'HVAC & Mechanical', 'cost': 7400}, {'task': 'Electrical', 'cost': 12000}, {'task': 'Plumbing', 'cost': 5200}], 'total': 34100, 'phase': 3},
                {'category': 'Phase 4: Framing', 'items': [{'task': 'Framing', 'cost': 28000}], 'total': 28000, 'phase': 4},
                {'category': 'Phase 5: Exterior', 'items': [{'task': 'Roofing', 'cost': 17000}, {'task': 'Doors and Windows', 'cost': 11500}, {'task': 'Exterior Stucco', 'cost': 12000}, {'task': 'Exterior Stairs', 'cost': 3000}, {'task': 'Insulation', 'cost': 4000}, {'task': 'Drywall', 'cost': 11500}], 'total': 59000, 'phase': 5},
                {'category': 'Phase 6: Final Completion', 'items': [{'task': 'Interior Painting', 'cost': 4400}, {'task': 'Flooring', 'cost': 6576}, {'task': 'ADU Kitchen', 'cost': 5500}, {'task': 'ADU Bathroom 1', 'cost': 9500}, {'task': 'Powder Room', 'cost': 5800}, {'task': 'Lighting', 'cost': 4500}, {'task': 'Baseboards', 'cost': 2700}, {'task': 'Door Trim', 'cost': 2600}, {'task': 'Paving', 'cost': 2500}, {'task': 'Deputy Inspection', 'cost': 1500}], 'total': 45176, 'phase': 6},
                {'category': 'OHP (Overhead & Profit)', 'items': [{'task': 'General Contractor Overhead', 'cost': 6000}, {'task': 'General Contractor Profit', 'cost': 5124}], 'total': 11124, 'phase': 7}
            ],
            'lastUpdated': datetime.now().isoformat()
        }
    
    def refresh_data(self):
        """Manually refresh data from Google Sheets"""
        self.get_adu_data()
    
    def parse_currency(self, value):
        """Convert currency string to number"""
        if isinstance(value, str):
            return float(value.replace('$', '').replace(',', ''))
        return float(value) if value else 0
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(Path(__file__).parent)
    # Use PORT env variable (Railway sets this), default to 8888 for local dev
    port = int(os.getenv('PORT', 8888))
    # Always bind to 0.0.0.0 in production (Railway, Render, etc.)
    # Check for any common cloud environment variables
    is_cloud = any([
        os.getenv('RAILWAY_ENVIRONMENT'),
        os.getenv('RAILWAY_STATIC_URL'),
        os.getenv('PORT'),  # PORT being set usually means cloud deployment
        os.getenv('RENDER'),
        os.getenv('DYNO')  # Heroku
    ])
    host = '0.0.0.0' if is_cloud else 'localhost'
    
    print(f"🚀 Starting ADU Dashboard Server")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   Environment: {'Cloud' if is_cloud else 'Local'}")
    print(f"   Data file: {DATA_FILE}")
    print(f"   Environment variables: PORT={os.getenv('PORT')}, RAILWAY_ENVIRONMENT={os.getenv('RAILWAY_ENVIRONMENT')}")
    
    try:
        server = HTTPServer((host, port), ADUHandler)
        print(f"✅ Server initialized at http://{host}:{port}")
        print("📊 API endpoints:")
        print("   - GET / → Health check")
        print("   - GET /health → Health check")
        print("   - GET /api/data → Latest ADU data")
        print("   - GET /api/refresh → Force refresh")
        print("   - GET /api/sheets-link → Google Sheets link")
        print("   - GET /api/expenses-signoff → Expense sign-off status")
        print(f"   - POST /api/data → Save ADU data")
        print("\n🔄 Server is running and ready to accept requests...")
        print("\n🔄 Server is running and ready to accept requests...")
        server.serve_forever()
    except OSError as e:
        print(f"❌ Failed to bind to {host}:{port}")
        print(f"   Error: {e}")
        exit(1)
    except KeyboardInterrupt:
        print("\n✅ Server stopped")
