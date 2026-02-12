import json
from datetime import datetime
import subprocess

def handler(request):
    """Vercel serverless function for ADU data"""
    
    if request.path == '/api/data':
        return get_adu_data()
    elif request.path == '/api/refresh':
        return get_adu_data()
    
    return {
        'statusCode': 404,
        'body': json.dumps({'error': 'Not found'})
    }

def get_adu_data():
    """Fetch ADU data from Google Sheets"""
    try:
        # Get Payment Schedule data
        payments_cmd = [
            'gog', 'sheets', 'get', 
            '1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk',
            "'Payment Schedule'!A1:E10",
            '--account', 'dtle82@gmail.com',
            '--json'
        ]
        
        payments_result = subprocess.run(payments_cmd, capture_output=True, text=True, timeout=10)
        
        # Get Expenses data
        expenses_cmd = [
            'gog', 'sheets', 'get',
            '1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk',
            "'Expenses'!A1:C30",
            '--account', 'dtle82@gmail.com',
            '--json'
        ]
        
        expenses_result = subprocess.run(expenses_cmd, capture_output=True, text=True, timeout=10)
        
        if payments_result.returncode == 0 and expenses_result.returncode == 0:
            payments_data = json.loads(payments_result.stdout)
            expenses_data = json.loads(expenses_result.stdout)
            
            # Parse payments
            payments = []
            if 'values' in payments_data:
                for i, row in enumerate(payments_data['values'][1:], 1):
                    if len(row) >= 4:
                        payments.append({
                            'num': i,
                            'title': row[1],
                            'planned': parse_currency(row[2]),
                            'actual': parse_currency(row[4]) if len(row) > 4 else 0
                        })
            
            # Parse expenses
            expenses = []
            if 'values' in expenses_data:
                for row in expenses_data['values'][1:]:
                    if len(row) >= 2:
                        expenses.append({
                            'category': row[0],
                            'cost': parse_currency(row[1])
                        })
            
            data = {
                'payments': payments,
                'expenses': expenses,
                'lastUpdated': datetime.now().isoformat()
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(data)
            }
    
    except Exception as e:
        print(f"Error: {e}")
    
    # Fallback
    fallback = {
        'payments': [
            {'num': 1, 'title': 'Initial Deposit & Site Mobilization', 'planned': 21800, 'actual': 13800},
            {'num': 2, 'title': 'Foundation & Under-Slab Inspection', 'planned': 35500, 'actual': 49300},
            {'num': 3, 'title': 'Rough MEP Inspection', 'planned': 24600, 'actual': 73900},
            {'num': 4, 'title': 'Framing Inspection / Dry-In', 'planned': 56500, 'actual': 130400},
            {'num': 5, 'title': 'Insulation & Drywall Inspections', 'planned': 30500, 'actual': 160900},
            {'num': 6, 'title': 'Final Inspection & Completion', 'planned': 56300, 'actual': 217200}
        ],
        'expenses': [
            {'category': 'Architect and Engineering', 'cost': 650.13},
            {'category': 'Architect and Engineering', 'cost': 5306.43},
            {'category': 'Footings', 'cost': 849.81},
            {'category': 'Footings', 'cost': 360.73},
            {'category': 'Footings', 'cost': 895.07},
            {'category': 'Plumbing', 'cost': 1396.30},
            {'category': 'Plumbing', 'cost': 365.48},
            {'category': 'Framing', 'cost': 5203.17},
            {'category': 'Architect and Engineering', 'cost': 411.42},
            {'category': 'Architect and Engineering', 'cost': 308.69},
            {'category': 'Architect and Engineering', 'cost': 380.51},
            {'category': 'Framing', 'cost': 423.95},
            {'category': 'Landscaping', 'cost': 1300.00}
        ],
        'lastUpdated': datetime.now().isoformat()
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(fallback)
    }

def parse_currency(value):
    """Convert currency string to number"""
    if isinstance(value, str):
        return float(value.replace('$', '').replace(',', ''))
    return float(value) if value else 0
