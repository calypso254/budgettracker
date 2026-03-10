import { gapi } from 'google-api-javascript-client'

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID
const GOOGLE_SCOPES =
  import.meta.env.VITE_GOOGLE_SCOPES || 'https://www.googleapis.com/auth/spreadsheets'
const SHEETS_DISCOVERY_DOC =
  'https://sheets.googleapis.com/$discovery/rest?version=v4'

export const TRANSACTIONS_HEADERS = [
  'Date',
  'Type',
  'Category',
  'Payee_Source',
  'Amount',
  'Applied_To_Bill',
  'Notes',
]

export const RECURRING_BILLS_HEADERS = [
  'Bill_Name',
  'Category',
  'Expected_Amount',
  'Due_Day',
  'Status',
]

let gisScriptPromise
let clientInitPromise
let tokenClient

function loadGoogleApiClient(apiName) {
  return new Promise((resolve) => {
    window.gapi.load(apiName, resolve)
  })
}

function assertSheetsConfiguration() {
  if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID || !GOOGLE_SHEET_ID) {
    throw new Error(
      'Missing Google Sheets configuration. Set VITE_GOOGLE_API_KEY, VITE_GOOGLE_CLIENT_ID, and VITE_GOOGLE_SHEET_ID in your .env file.',
    )
  }
}

function normalizeRows(values) {
  if (!values?.length) {
    return []
  }

  const headerEntries = values[0]
    .map((header, index) => [String(header ?? '').trim(), index])
    .filter(([header]) => header)

  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => {
    return Object.fromEntries(
      headerEntries.map(([header, index]) => [header, row[index] ?? '']),
    )
  })
}

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }

  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      )

      if (existingScript) {
        existingScript.addEventListener('load', resolve, { once: true })
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Google Identity Services failed to load.')),
          { once: true },
        )

        if (window.google?.accounts?.oauth2) {
          resolve()
        }

        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = () =>
        reject(new Error('Google Identity Services failed to load.'))
      document.head.appendChild(script)
    })
  }

  return gisScriptPromise
}

async function initializeSheetsClient() {
  assertSheetsConfiguration()

  if (!clientInitPromise) {
    clientInitPromise = (async () => {
      await loadGoogleApiClient('client')
      await gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: [SHEETS_DISCOVERY_DOC],
      })
      await loadGoogleIdentityServices()

      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: () => {},
      })
    })()
  }

  return clientInitPromise
}

function requestAccessToken() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response?.error) {
        reject(new Error(response.error))
        return
      }

      resolve(response)
    }

    tokenClient.requestAccessToken({
      prompt: gapi.client.getToken() ? '' : 'consent',
    })
  })
}

async function ensureSheetsAccess() {
  await initializeSheetsClient()
  await requestAccessToken()
}

async function listSheetRows(sheetName) {
  await ensureSheetsAccess()

  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${sheetName}!A:Z`,
  })

  return normalizeRows(response.result.values || [])
}

async function appendRow(sheetName, headers, row) {
  await ensureSheetsAccess()

  const values = [headers.map((header) => row[header] ?? '')]

  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values,
    },
  })
}

export function isSheetsConfigured() {
  return Boolean(GOOGLE_API_KEY && GOOGLE_CLIENT_ID && GOOGLE_SHEET_ID)
}

export async function fetchFinPixelData() {
  const [transactions, recurringBills] = await Promise.all([
    listSheetRows('Transactions'),
    listSheetRows('Recurring_Bills'),
  ])

  return {
    transactions,
    recurringBills,
  }
}

export async function appendTransaction(transaction) {
  await appendRow('Transactions', TRANSACTIONS_HEADERS, transaction)
}

export async function appendRecurringBill(recurringBill) {
  await appendRow('Recurring_Bills', RECURRING_BILLS_HEADERS, recurringBill)
}

export async function signOutSheets() {
  const token = gapi.client.getToken()

  if (!token) {
    return
  }

  window.google.accounts.oauth2.revoke(token.access_token)
  gapi.client.setToken(null)
}
