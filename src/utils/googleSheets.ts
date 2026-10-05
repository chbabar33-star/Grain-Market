/**
 * Google Workspace Integration - Google Sheets API
 * Follows workspace-integration skill: in-memory token cache, popup sign-in, explicit confirmation
 */

import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { Business, Voucher, StockClosingSummary } from '../types';

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain access token from Google sign in');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Creates a brand new Google Spreadsheet with Mandi records
 */
export async function createMandiBackupSpreadsheet(
  business: Business,
  vouchers: Voucher[],
  stockSummary: StockClosingSummary[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = cachedAccessToken;
  if (!token) throw new Error('Not authenticated with Google');

  const title = `Mandi Backup - ${business.name} - ${new Date().toISOString().slice(0, 10)}`;

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: 'Vouchers Register' } },
        { properties: { title: 'Closing Stock' } }
      ]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Voucher Data
  const voucherRows: any[][] = [
    [`Business: ${business.name} (${business.nameUrdu}) - NTN: ${business.ntn}`],
    [`Date Exported: ${new Date().toLocaleString('en-PK')} | Currency: PKR (Rs.)`],
    [],
    [
      'Voucher No', 'Type', 'Date', 'Party Name (Eng)', 'Party Name (Urdu)', 
      'Item (Eng)', 'Item (Urdu)', 'Godown', 'Gross (KG)', 'Tare (KG)', 
      'First Weight (KG)', 'Bardana (KG)', 'Moisture (KG)', 'Net Weight (KG)', 
      'Bags', 'Rate/40KG', 'Base Amount (Rs)', 'Total Expenses (Rs)', 'Net Amount (Rs)', 'Status'
    ]
  ];

  vouchers.forEach(v => {
    voucherRows.push([
      v.voucherNo, v.type, v.date, v.partyName, v.partyNameUrdu,
      v.itemName, v.itemNameUrdu, v.godownName, v.grossWeight, v.tareWeight,
      v.firstWeight, v.bardanaKg, v.moistureKg, v.netWeight,
      v.bags, v.ratePer40Kg, v.baseAmount, v.totalExpenses, v.totalAmount, v.status
    ]);
  });

  // 3. Prepare Stock Summary Data
  const stockRows: any[][] = [
    [`Closing Stock Summary - ${business.name}`],
    [],
    [
      'Item Name', 'Item (Urdu)', 'Opening First Wt (KG)', 'Purchased First Wt (KG)', 
      'Sold First Wt (KG)', 'Closing First Wt (KG)', 'Opening Bags', 'Purchased Bags', 
      'Sold Bags', 'Closing Bags', 'Avg Rate/40KG (Rs)', 'Closing Value (Rs)'
    ]
  ];

  stockSummary.forEach(s => {
    stockRows.push([
      s.itemName, s.itemNameUrdu, s.openingFirstWeight, s.purchaseFirstWeight,
      s.soldFirstWeight, s.closingFirstWeight, s.openingBags, s.purchaseBags,
      s.soldBags, s.closingBags, s.avgCostPer40Kg, s.closingValue
    ]);
  });

  // 4. Batch Update Values
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'Vouchers Register'!A1",
          values: voucherRows
        },
        {
          range: "'Closing Stock'!A1",
          values: stockRows
        }
      ]
    })
  });

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Failed to populate Google Sheets data');
  }

  return { spreadsheetId, spreadsheetUrl };
}
