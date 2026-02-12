/**
 * ADU Dashboard - Expenses Sign-Off API
 * Reads Google Sheet Expenses tab using Service Account credentials
 * Returns live sign-off status
 */

import { google } from 'googleapis';

const SHEET_ID = '1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk';
const SHEET_NAME = 'Expenses';

// Parse service account from environment
function getServiceAccountAuth() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  return new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

// Helper to parse Google Sheets data
function parseExpenses(values) {
  if (!values || values.length < 2) {
    return { total: 0, signedOff: 0, pending: 0, expenses: [] };
  }

  const header = values[0];
  const expectedColumnCount = header.length;
  
  // Find columns by name (flexible to handle different layouts)
  let categoryIdx = header.findIndex(h => h && h.toLowerCase().includes('category'));
  let costIdx = header.findIndex(h => h && h.toLowerCase().includes('cost'));
  let dateIdx = header.findIndex(h => h && h.toLowerCase().includes('date'));
  let signOffIdx = header.findIndex(h => h && (h.toLowerCase().includes('contractor') || h.toLowerCase().includes('johnny') || h.toLowerCase().includes('sign')));
  
  console.log('Column indices - category:', categoryIdx, 'cost:', costIdx, 'date:', dateIdx, 'signOff:', signOffIdx);
  console.log('Header:', header);

  if (categoryIdx === -1 || costIdx === -1 || dateIdx === -1 || signOffIdx === -1) {
    console.error('Missing required columns');
    return { total: 0, signedOff: 0, pending: 0, expenses: [] };
  }

  let totalAmount = 0;
  let signedOffAmount = 0;
  let expenses = [];
  let paidCount = 0;

  for (let i = 1; i < values.length; i++) {
    let row = values[i];
    
    // Google Sheets API doesn't return trailing empty cells, so pad the row
    while (row.length < expectedColumnCount) {
      row.push('');
    }
    
    if (!row[categoryIdx] || !row[costIdx]) continue;

    const category = row[categoryIdx].trim();
    const costStr = row[costIdx].toString().replace(/[$,]/g, '');
    const cost = parseFloat(costStr) || 0;
    const date = row[dateIdx] ? row[dateIdx].trim() : '';
    const signOff = row[signOffIdx] ? row[signOffIdx].trim() : '';
    
    // Key insight: Rows WITHOUT a date in Column D are already paid
    // Rows WITH dates are unpaid and need sign-off tracking
    const hasDate = date.length > 0;
    
    if (!hasDate) {
      paidCount++;
      console.log(`Row ${i}: ${category} $${cost} - ALREADY PAID (no date)`);
      continue; // Skip paid items (no date = already invoiced/paid)
    }
    
    // Only count unpaid expenses (those with dates)
    if (cost > 0) {
      totalAmount += cost;
      const isSignedOff = signOff.length > 0;
      if (isSignedOff) {
        signedOffAmount += cost;
      }

      expenses.push({
        category,
        cost,
        date,
        signOff: isSignedOff,
        signOffValue: signOff
      });
    }
  }

  console.log(`Parsed: ${paidCount} already paid, ${expenses.length} unpaid`);

  return {
    total: totalAmount,
    signedOff: signedOffAmount,
    pending: totalAmount - signedOffAmount,
    count: expenses.length,
    signedOffCount: expenses.filter(e => e.signOff).length,
    pendingCount: expenses.filter(e => !e.signOff).length,
    expenses
  };
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Authenticate with service account
    const auth = getServiceAccountAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch sheet data explicitly from A1 downward
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:G`,
      majorDimension: 'ROWS'
    });

    const values = response.data.values || [];
    
    const signOffStatus = parseExpenses(values);
    
    console.log('Parsed status:', signOffStatus);

    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      debug: {
        rowCount: values.length,
        header: values.length > 0 ? values[0] : null
      },
      signOff: {
        totalAmount: `$${signOffStatus.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        signedOffAmount: `$${signOffStatus.signedOff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pendingAmount: `$${signOffStatus.pending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        signedOffCount: signOffStatus.signedOffCount,
        pendingCount: signOffStatus.pendingCount,
        totalCount: signOffStatus.count,
        percentComplete: signOffStatus.total > 0 ? Math.round((signOffStatus.signedOff / signOffStatus.total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      message: error.message,
      stack: error.stack
    });
  }
}
