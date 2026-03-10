<<<<<<< HEAD
# budgettracker
=======
# FinPixel

FinPixel is a React + Vite + Tailwind CSS budgeting SPA with a brutalist UI, password gate, Google Sheets sync, recurring bill tracking, partial payments, and Recharts trend views.

## Commands

```powershell
npm create vite@latest . -- --template react
npm install
npm install recharts google-api-javascript-client
npm install -D tailwindcss @tailwindcss/vite
npm run dev
```

## Environment

Copy `.env.example` to `.env` and fill in the Google credentials for the browser-based Sheets flow:

```dotenv
VITE_FINPIXEL_PASSWORD=finpixel
VITE_GOOGLE_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_SHEET_ID=
VITE_GOOGLE_SCOPES=https://www.googleapis.com/auth/spreadsheets
```

The Google account you authenticate with must have access to the target spreadsheet.

## Google Sheet tabs

The app reads and appends against these exact tabs and headers:

- `Transactions`: `Date, Type, Category, Payee_Source, Amount, Applied_To_Bill, Notes`
- `Recurring_Bills`: `Bill_Name, Category, Expected_Amount, Due_Day, Status`

## Structure

```text
.
|-- .env.example
|-- index.html
|-- package.json
|-- src
|   |-- App.jsx
|   |-- components
|   |   `-- Accordion.jsx
|   |-- index.css
|   |-- lib
|   |   `-- sheets.js
|   `-- main.jsx
`-- vite.config.js
```
>>>>>>> dbcd9cd (Initial build.)
