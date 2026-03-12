# FinPixel

FinPixel is a React + Vite budgeting app with:

- a password gate
- a local preview mode
- optional Google Sheets sync
- recurring bill tracking
- recurring income setup
- partial payments
- trend charts with Recharts

## Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

## Quick Start

These steps get the app running in local preview mode without Google Sheets.

1. Install dependencies:

```powershell
npm install
```

2. Create a local environment file:

```powershell
Copy-Item .env.example .env
```

3. Open `.env` and set a password if you want something other than the default:

```dotenv
VITE_FINPIXEL_PASSWORD=finpixel
```

4. Start the dev server:

```powershell
npm run dev
```

5. Open the local URL printed by Vite. It is usually:

```text
http://localhost:5173
```

6. Unlock the app with the password from `.env`.
   If you did not change it, use `finpixel`.

## Local Preview Mode

If the Google environment variables are blank, the app still runs.
It loads preview data and lets you test the interface without a live spreadsheet connection.

## Google Sheets Setup

If you want live sync, fill in the full `.env` file:

```dotenv
VITE_FINPIXEL_PASSWORD=finpixel
VITE_GOOGLE_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_SHEET_ID=
VITE_GOOGLE_SCOPES=https://www.googleapis.com/auth/spreadsheets
```

The Google account you sign in with in the browser must have access to the target spreadsheet.

## Required Google Sheet Tabs

The app reads from and appends to these exact tabs.

### `Transactions`

Required headers:

```text
Date, Type, Category, Payee_Source, Amount, Applied_To_Bill, Notes
```

### `Recurring_Bills`

Required headers:

```text
Bill_Name, Category, Expected_Amount, Due_Day, Status
```

### `Recurring_Income`

Add this tab if you want to use the recurring income form.

Required headers:

```text
Income_Name, Category, Expected_Amount, Deposit_Day, Status, Notes
```

## Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## Troubleshooting

### Password does not work

- Confirm `VITE_FINPIXEL_PASSWORD` in `.env`
- Restart `npm run dev` after changing `.env`
- If you never changed it, the default password is `finpixel`

### Google Sheets does not sync

- Confirm `VITE_GOOGLE_API_KEY`, `VITE_GOOGLE_CLIENT_ID`, and `VITE_GOOGLE_SHEET_ID` are set
- Make sure the spreadsheet is shared with the Google account you use in the browser
- Confirm the sheet tabs exist with the exact header names shown above

### The app starts but uses local data

That means the Google Sheets variables are missing or incomplete.
The UI can still be used in preview mode until you finish the Google setup.
