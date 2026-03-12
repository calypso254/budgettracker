import { lazy, Suspense, startTransition, useState } from 'react'
import Accordion from './components/Accordion.jsx'
import DashboardSection from './components/DashboardSection.jsx'
import DataEntrySection from './components/DataEntrySection.jsx'
import { NoticeBar, PixelMark } from './components/Display.jsx'
import {
  appendRecurringBill,
  appendRecurringIncome,
  appendTransaction,
  fetchFinPixelData,
  isSheetsConfigured,
} from './lib/sheets.js'
import {
  buildBillSnapshots,
  buildChartData,
  buildNotificationMessage,
  CHART_OPTIONS,
  DEFAULT_CATEGORIES,
  DEMO_SEED,
  formatAmount,
  getLocalIsoDate,
  getMonthKey,
  getStoredUnlockState,
  isExpense,
  isIncome,
  parseAmount,
  sortTransactionsNewestFirst,
} from './lib/finance.js'

const APP_PASSWORD = import.meta.env.VITE_FINPIXEL_PASSWORD || 'finpixel'
const TrendsSection = lazy(() => import('./components/TrendsSection.jsx'))

function App() {
  const today = new Date()
  const sheetConfigured = isSheetsConfigured()
  const [isUnlocked, setIsUnlocked] = useState(getStoredUnlockState)
  const [passwordEntry, setPasswordEntry] = useState('')
  const [authError, setAuthError] = useState('')
  const [transactions, setTransactions] = useState(DEMO_SEED.transactions)
  const [recurringBills, setRecurringBills] = useState(DEMO_SEED.recurringBills)
  const [recurringIncome, setRecurringIncome] = useState(DEMO_SEED.recurringIncome ?? [])
  const [dataSource, setDataSource] = useState('demo')
  const [syncing, setSyncing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const [notice, setNotice] = useState(buildNotificationMessage(sheetConfigured))
  const [chartView, setChartView] = useState('incomeVsExpenses')
  const [selectedBill, setSelectedBill] = useState(
    DEMO_SEED.recurringBills[0]?.Bill_Name ?? '',
  )
  const [partialPaymentBill, setPartialPaymentBill] = useState(null)
  const [partialPaymentAmount, setPartialPaymentAmount] = useState('')
  const [billForm, setBillForm] = useState({
    billName: '',
    category: 'Housing',
    expectedAmount: '',
    dueDay: '15',
    status: 'Active',
  })
  const [incomeForm, setIncomeForm] = useState({
    incomeName: '',
    category: 'Salary',
    expectedAmount: '',
    depositDay: '1',
    status: 'Active',
    notes: '',
  })
  const [transactionForm, setTransactionForm] = useState({
    date: getLocalIsoDate(today),
    type: 'Expense',
    category: 'Utilities',
    payeeSource: '',
    amount: '',
    appliedToBill: '',
    notes: '',
  })

  const categoryOptions = [
    ...new Set(
      [
        ...DEFAULT_CATEGORIES,
        ...recurringBills.map((bill) => bill.Category),
        ...recurringIncome.map((income) => income.Category),
        ...transactions.map((transaction) => transaction.Category),
      ]
        .map((category) => String(category ?? '').trim())
        .filter(Boolean),
    ),
  ].sort((left, right) => left.localeCompare(right))
  const billSnapshots = buildBillSnapshots(recurringBills, transactions, today)
  const billOptions = billSnapshots.map((bill) => bill.Bill_Name)
  const currentMonthKey = getMonthKey(today)
  const selectedChartBill = billOptions.includes(selectedBill)
    ? selectedBill
    : billOptions[0] ?? ''
  const currentMonthIncome = transactions
    .filter(
      (transaction) =>
        getMonthKey(transaction.Date) === currentMonthKey && isIncome(transaction),
    )
    .reduce((total, transaction) => total + parseAmount(transaction.Amount), 0)
  const currentMonthExpenses = transactions
    .filter(
      (transaction) =>
        getMonthKey(transaction.Date) === currentMonthKey && isExpense(transaction),
    )
    .reduce((total, transaction) => total + parseAmount(transaction.Amount), 0)
  const totalExpected = billSnapshots.reduce((total, bill) => total + bill.expected, 0)
  const totalPaid = billSnapshots.reduce((total, bill) => total + bill.paidCapped, 0)
  const totalUnpaid = billSnapshots.reduce((total, bill) => total + bill.remaining, 0)
  const chartData = buildChartData(transactions, selectedChartBill)
  const chartDefinition = CHART_OPTIONS.find((option) => option.value === chartView)
  const chartLines =
    chartView === 'overallExpenses'
      ? [{ dataKey: 'expenses', name: 'Expenses', stroke: '#FF6F61' }]
      : chartView === 'overallIncome'
        ? [{ dataKey: 'income', name: 'Income', stroke: '#006D77' }]
        : chartView === 'billHistory'
          ? [
              {
                dataKey: 'billTotal',
                name: selectedChartBill || 'Selected Bill',
                stroke: '#006D77',
              },
            ]
          : [
              { dataKey: 'income', name: 'Income', stroke: '#006D77' },
              { dataKey: 'expenses', name: 'Expenses', stroke: '#FF6F61' },
            ]
  const dataSourceLabel =
    dataSource === 'live' ? 'Connected' : sheetConfigured ? 'Ready to sync' : 'Preview'
  const lastSyncLabel = lastSyncedAt
    ? lastSyncedAt.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Pending'

  async function syncFromSheets({
    successMessage = 'Google Sheets synced successfully.',
    showSuccessNotice = false,
  } = {}) {
    if (!sheetConfigured) {
      setNotice(buildNotificationMessage(false))
      return false
    }

    setSyncing(true)

    try {
      const sheetData = await fetchFinPixelData()

      startTransition(() => {
        setTransactions(sortTransactionsNewestFirst(sheetData.transactions))
        setRecurringBills(sheetData.recurringBills)
        setRecurringIncome(sheetData.recurringIncome ?? [])
        setDataSource('live')
        setLastSyncedAt(new Date())
      })

      setNotice(
        showSuccessNotice && successMessage
          ? { tone: 'success', text: successMessage }
          : null,
      )
      return true
    } catch (error) {
      setNotice({
        tone: 'danger',
        text:
          error instanceof Error
            ? error.message
            : 'Google Sheets sync failed. Confirm the sheet is shared with the signed-in Google account.',
      })
      return false
    } finally {
      setSyncing(false)
    }
  }

  async function persistTransaction(payload, successMessage) {
    if (!sheetConfigured) {
      setTransactions((current) => sortTransactionsNewestFirst([payload, ...current]))
      setDataSource('demo')
      setNotice({
        tone: 'info',
        text: `${successMessage} Saved locally for preview mode. Add Google Sheet credentials to switch this into live append mode.`,
      })
      return true
    }

    setSubmitting(true)
    try {
      await appendTransaction(payload)
      return await syncFromSheets({ successMessage, showSuccessNotice: true })
    } catch (error) {
      setNotice({
        tone: 'danger',
        text:
          error instanceof Error
            ? error.message
            : 'Unable to append the transaction to Google Sheets.',
      })
      return false
    } finally {
      setSubmitting(false)
    }
  }

  async function persistRecurringBill(payload, successMessage) {
    if (!sheetConfigured) {
      setRecurringBills((current) => [...current, payload])
      setDataSource('demo')
      setNotice({
        tone: 'info',
        text: `${successMessage} Saved locally for preview mode. Add Google Sheet credentials to switch this into live append mode.`,
      })
      return true
    }

    setSubmitting(true)
    try {
      await appendRecurringBill(payload)
      return await syncFromSheets({ successMessage, showSuccessNotice: true })
    } catch (error) {
      setNotice({
        tone: 'danger',
        text:
          error instanceof Error
            ? error.message
            : 'Unable to append the recurring bill to Google Sheets.',
      })
      return false
    } finally {
      setSubmitting(false)
    }
  }

  async function persistRecurringIncome(payload, successMessage) {
    if (!sheetConfigured) {
      setRecurringIncome((current) => [...current, payload])
      setDataSource('demo')
      setNotice({
        tone: 'info',
        text: `${successMessage} Saved locally for preview mode. Add Google Sheet credentials to switch this into live append mode.`,
      })
      return true
    }

    setSubmitting(true)
    try {
      await appendRecurringIncome(payload)
      return await syncFromSheets({ successMessage, showSuccessNotice: true })
    } catch (error) {
      setNotice({
        tone: 'danger',
        text:
          error instanceof Error
            ? error.message
            : 'Unable to append the recurring income to Google Sheets.',
      })
      return false
    } finally {
      setSubmitting(false)
    }
  }

  function handleUnlock(event) {
    event.preventDefault()

    if (passwordEntry !== APP_PASSWORD) {
      setAuthError(
        'Password mismatch. Update VITE_FINPIXEL_PASSWORD or enter the current shared password.',
      )
      return
    }

    window.sessionStorage.setItem('finpixel-unlocked', 'true')
    setIsUnlocked(true)
    setAuthError('')
    setPasswordEntry('')
  }

  function handleLock() {
    window.sessionStorage.removeItem('finpixel-unlocked')
    setIsUnlocked(false)
    setNotice(buildNotificationMessage(sheetConfigured))
  }

  function handleBillFormChange(event) {
    const { name, value } = event.target
    setBillForm((current) => ({ ...current, [name]: value }))
  }

  function handleIncomeFormChange(event) {
    const { name, value } = event.target
    setIncomeForm((current) => ({ ...current, [name]: value }))
  }

  function handleTransactionFormChange(event) {
    const { name, value } = event.target
    setTransactionForm((current) =>
      name === 'type' && value === 'Income'
        ? { ...current, type: value, appliedToBill: '' }
        : { ...current, [name]: value },
    )
  }

  async function handleBillSubmit(event) {
    event.preventDefault()
    const payload = {
      Bill_Name: billForm.billName.trim(),
      Category: billForm.category.trim(),
      Expected_Amount: parseAmount(billForm.expectedAmount).toFixed(2),
      Due_Day: String(Math.max(1, Math.min(31, Number(billForm.dueDay) || 1))),
      Status: billForm.status.trim() || 'Active',
    }

    if (!payload.Bill_Name || !payload.Category || parseAmount(payload.Expected_Amount) <= 0) {
      setNotice({
        tone: 'danger',
        text: 'Recurring bills need a bill name, category, positive amount, and due day.',
      })
      return
    }

    const saved = await persistRecurringBill(
      payload,
      `${payload.Bill_Name} added to Recurring_Bills.`,
    )
    if (!saved) return

    setSelectedBill(payload.Bill_Name)
    setBillForm({
      billName: '',
      category: payload.Category,
      expectedAmount: '',
      dueDay: payload.Due_Day,
      status: 'Active',
    })
  }

  async function handleIncomeSubmit(event) {
    event.preventDefault()
    const payload = {
      Income_Name: incomeForm.incomeName.trim(),
      Category: incomeForm.category.trim(),
      Expected_Amount: parseAmount(incomeForm.expectedAmount).toFixed(2),
      Deposit_Day: String(
        Math.max(1, Math.min(31, Number(incomeForm.depositDay) || 1)),
      ),
      Status: incomeForm.status.trim() || 'Active',
      Notes: incomeForm.notes.trim(),
    }

    if (!payload.Income_Name || !payload.Category || parseAmount(payload.Expected_Amount) <= 0) {
      setNotice({
        tone: 'danger',
        text: 'Recurring income needs a name, category, positive amount, and deposit day.',
      })
      return
    }

    const saved = await persistRecurringIncome(
      payload,
      `${payload.Income_Name} added to Recurring_Income.`,
    )
    if (!saved) return

    setIncomeForm({
      incomeName: '',
      category: payload.Category,
      expectedAmount: '',
      depositDay: payload.Deposit_Day,
      status: 'Active',
      notes: '',
    })
  }

  async function handleTransactionSubmit(event) {
    event.preventDefault()
    const cleanedType = transactionForm.type === 'Income' ? 'Income' : 'Expense'
    const amount = parseAmount(transactionForm.amount)
    const payload = {
      Date: transactionForm.date || getLocalIsoDate(new Date()),
      Type: cleanedType,
      Category: transactionForm.category.trim(),
      Payee_Source: transactionForm.payeeSource.trim(),
      Amount: amount.toFixed(2),
      Applied_To_Bill:
        cleanedType === 'Expense'
          ? transactionForm.appliedToBill.trim() || transactionForm.payeeSource.trim()
          : '',
      Notes: transactionForm.notes.trim(),
    }

    if (!payload.Category || !payload.Payee_Source || amount <= 0) {
      setNotice({
        tone: 'danger',
        text: 'Transactions need a source, category, and positive amount before they can be appended.',
      })
      return
    }

    const saved = await persistTransaction(
      payload,
      `${payload.Type} entry for ${payload.Payee_Source} appended to Transactions.`,
    )
    if (!saved) return

    setTransactionForm({
      date: getLocalIsoDate(new Date()),
      type: cleanedType,
      category: payload.Category,
      payeeSource: '',
      amount: '',
      appliedToBill: '',
      notes: '',
    })
  }

  function openPartialPayment(bill) {
    setPartialPaymentBill(bill.Bill_Name)
    setPartialPaymentAmount(Math.max(bill.remaining / 2, 1).toFixed(2))
  }

  async function handleMarkPaid(bill) {
    if (bill.remaining <= 0) return
    await persistTransaction(
      {
        Date: getLocalIsoDate(new Date()),
        Type: 'Expense',
        Category: bill.Category,
        Payee_Source: bill.Bill_Name,
        Amount: bill.remaining.toFixed(2),
        Applied_To_Bill: bill.Bill_Name,
        Notes: 'Marked paid from dashboard',
      },
      `${bill.Bill_Name} marked paid.`,
    )
  }

  async function handlePartialPaymentSubmit(event, bill) {
    event.preventDefault()
    const amount = parseAmount(partialPaymentAmount)
    if (amount <= 0 || amount > bill.remaining) {
      setNotice({
        tone: 'danger',
        text: `Enter a partial payment above $0.00 and no larger than ${formatAmount(
          bill.remaining,
        )}.`,
      })
      return
    }

    const saved = await persistTransaction(
      {
        Date: getLocalIsoDate(new Date()),
        Type: 'Expense',
        Category: bill.Category,
        Payee_Source: bill.Bill_Name,
        Amount: amount.toFixed(2),
        Applied_To_Bill: bill.Bill_Name,
        Notes: 'Partial payment from dashboard',
      },
      `${formatAmount(amount)} applied to ${bill.Bill_Name}.`,
    )
    if (!saved) return

    setPartialPaymentBill(null)
    setPartialPaymentAmount('')
  }

  if (!isUnlocked) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface overflow-hidden p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
              <PixelMark size="h-20 w-20" />
              <div>
                <p className="label">Protected finance cockpit</p>
                <h1 className="mt-4 text-5xl font-bold sm:text-6xl">FinPixel</h1>
                <p className="mt-4 max-w-2xl text-lg text-[#6B777A]">
                  A sharp-edged personal finance SPA for recurring bills, recurring income,
                  direct Google Sheets logging, and high-contrast trend views.
                </p>
              </div>
            </div>
          </section>

          <aside className="surface p-8 sm:p-10">
            <p className="label">Password gate</p>
            <h2 className="mt-4 text-3xl font-bold">Unlock the dashboard</h2>
            <p className="mt-3 text-sm text-[#6B777A]">
              Set <code>VITE_FINPIXEL_PASSWORD</code> in your local environment to
              replace the default preview password.
            </p>
            <form className="mt-8 space-y-5" onSubmit={handleUnlock}>
              <label className="block">
                <span className="label">Password</span>
                <input
                  className="field mt-2"
                  type="password"
                  value={passwordEntry}
                  onChange={(event) => setPasswordEntry(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </label>
              {authError ? (
                <p className="border border-[#FF6F61] bg-[#FF6F61] px-3 py-2 text-sm font-medium text-[#2D3436]">
                  {authError}
                </p>
              ) : null}
              <button className="button-primary w-full" type="submit">
                Enter FinPixel
              </button>
            </form>
          </aside>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <datalist id="category-options">
        {categoryOptions.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <datalist id="bill-options">
        {billOptions.map((billName) => (
          <option key={billName} value={billName} />
        ))}
      </datalist>

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="surface overflow-hidden p-6 sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <PixelMark />
                <div>
                  <p className="label">by Calypso Pixels</p>
                  <h1 className="mt-2 text-5xl font-bold sm:text-6xl">FinPixel</h1>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-lg text-[#6B777A]">
                A brutalist budget command center with sharp edges, live monthly bill
                progress, recurring income setup, direct spreadsheet logging, and
                high-contrast trend lines.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="border border-[#2D3436] bg-white px-4 py-3">
                  <p className="label">Data source</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`h-3 w-3 border border-[#2D3436] ${
                        dataSource === 'live' ? 'bg-[#006D77]' : 'bg-white'
                      }`}
                    />
                    <p className="font-['Space_Grotesk'] text-lg font-bold">
                      {dataSourceLabel}
                    </p>
                  </div>
                </article>

                <article className="border border-[#2D3436] bg-white px-4 py-3">
                  <p className="label">Last sync</p>
                  <p className="mt-2 font-['Space_Grotesk'] text-lg font-bold">
                    {lastSyncLabel}
                  </p>
                </article>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className="button-primary w-full text-sm"
                  type="button"
                  onClick={() => syncFromSheets()}
                  disabled={syncing || submitting}
                >
                  {syncing ? 'Syncing...' : 'Sync Google Sheet'}
                </button>
                <button
                  className="button-secondary w-full text-sm"
                  type="button"
                  onClick={handleLock}
                >
                  Lock Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        <NoticeBar notice={notice} />

        <Accordion
          defaultOpenItems={['dashboard']}
          items={[
            {
              id: 'dashboard',
              eyebrow: 'Section 1',
              title: 'Dashboard and Active Bills',
              subtitle: 'Monthly totals up top, bill actions below.',
              meta: `${billSnapshots.filter((bill) => bill.remaining > 0).length} open bills`,
              content: (
                <DashboardSection
                  billSnapshots={billSnapshots}
                  currentMonthExpenses={currentMonthExpenses}
                  currentMonthIncome={currentMonthIncome}
                  currentMonthKey={currentMonthKey}
                  partialPaymentAmount={partialPaymentAmount}
                  partialPaymentBill={partialPaymentBill}
                  setPartialPaymentAmount={setPartialPaymentAmount}
                  setPartialPaymentBill={setPartialPaymentBill}
                  submitting={submitting}
                  totalExpected={totalExpected}
                  totalPaid={totalPaid}
                  totalUnpaid={totalUnpaid}
                  onMarkPaid={handleMarkPaid}
                  onOpenPartialPayment={openPartialPayment}
                  onSubmitPartialPayment={handlePartialPaymentSubmit}
                />
              ),
            },
            {
              id: 'entry',
              eyebrow: 'Section 2',
              title: 'Data Entry',
              subtitle:
                'Append recurring bills, recurring income, and transaction rows into the connected Google Sheet.',
              meta: 'Transactions + Recurring_Bills + Recurring_Income',
              content: (
                <DataEntrySection
                  billForm={billForm}
                  incomeForm={incomeForm}
                  submitting={submitting}
                  transactionForm={transactionForm}
                  onBillFormChange={handleBillFormChange}
                  onBillSubmit={handleBillSubmit}
                  onIncomeFormChange={handleIncomeFormChange}
                  onIncomeSubmit={handleIncomeSubmit}
                  onTransactionFormChange={handleTransactionFormChange}
                  onTransactionSubmit={handleTransactionSubmit}
                />
              ),
            },
            {
              id: 'trends',
              eyebrow: 'Section 3',
              title: 'Trends and Visuals',
              subtitle:
                'Bold line charts for bill history, overall expenses, income, and income versus expenses.',
              meta: `${chartData.length} monthly points`,
              content: (
                <Suspense
                  fallback={
                    <div className="border border-[#2D3436] bg-white px-4 py-6 text-sm font-medium">
                      Loading chart section...
                    </div>
                  }
                >
                  <TrendsSection
                    billOptions={billOptions}
                    chartData={chartData}
                    chartDefinition={chartDefinition}
                    chartLines={chartLines}
                    chartView={chartView}
                    options={CHART_OPTIONS}
                    selectedChartBill={selectedChartBill}
                    setChartView={setChartView}
                    setSelectedBill={setSelectedBill}
                  />
                </Suspense>
              ),
            },
          ]}
        />
      </div>
    </main>
  )
}

export default App
