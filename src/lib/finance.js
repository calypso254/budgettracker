import { createDemoSeed } from './demoSeed.js'

export const DEFAULT_CATEGORIES = [
  'Utilities',
  'Housing',
  'Auto',
  'Salary',
  'Rental Property',
  'Business',
]

export const CHART_OPTIONS = [
  {
    value: 'billHistory',
    label: "Specific bill's history",
    description: 'Track a single bill across monthly payments.',
  },
  {
    value: 'overallExpenses',
    label: 'Overall expenses',
    description: 'Monthly expenses across every payment entry.',
  },
  {
    value: 'overallIncome',
    label: 'Overall income',
    description: 'Monthly income trend from every source.',
  },
  {
    value: 'incomeVsExpenses',
    label: 'Income vs expenses',
    description: 'Compare both lines over time.',
  },
]

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

export const DEMO_SEED = createDemoSeed()

export function getStoredUnlockState() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem('finpixel-unlocked') === 'true'
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function parseAmount(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.-]/g, '')
  const parsed = Number.parseFloat(cleaned)

  return Number.isFinite(parsed) ? parsed : 0
}

function padNumber(value) {
  return String(value).padStart(2, '0')
}

export function getLocalIsoDate(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate(),
  )}`
}

function parseDateInput(value) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  const normalized = String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.valueOf()) ? null : parsed
}

export function getMonthKey(value) {
  const date = parseDateInput(value)

  if (!date) {
    return ''
  }

  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`
}

export function formatAmount(value) {
  return CURRENCY_FORMATTER.format(Number.isFinite(value) ? value : 0)
}

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return MONTH_FORMATTER.format(new Date(year, month - 1, 1))
}

export function formatDateLabel(value) {
  const date = parseDateInput(value)
  return date ? DATE_FORMATTER.format(date) : 'No date'
}

function startOfDay(value) {
  const date = parseDateInput(value)

  if (!date) {
    return null
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayDifference(fromValue, toValue) {
  const from = startOfDay(fromValue)
  const to = startOfDay(toValue)

  if (!from || !to) {
    return 0
  }

  return Math.round((to - from) / 86400000)
}

export function isExpense(transaction) {
  return normalizeText(transaction.Type) === 'expense'
}

export function isIncome(transaction) {
  return normalizeText(transaction.Type) === 'income'
}

function matchesBill(transaction, billName) {
  const normalizedBillName = normalizeText(billName)

  return (
    normalizeText(transaction.Applied_To_Bill) === normalizedBillName ||
    normalizeText(transaction.Payee_Source) === normalizedBillName
  )
}

export function sortTransactionsNewestFirst(rows) {
  return [...rows].sort((left, right) =>
    String(right.Date).localeCompare(String(left.Date)),
  )
}

function clampDueDay(year, monthIndex, dueDay) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  return Math.min(Math.max(Number(dueDay) || 1, 1), lastDay)
}

export function buildBillSnapshots(recurringBills, transactions, today) {
  const currentMonthKey = getMonthKey(today)

  return recurringBills
    .filter((bill) => !['inactive', 'archived', 'paused'].includes(normalizeText(bill.Status)))
    .map((bill) => {
      const expected = parseAmount(bill.Expected_Amount)
      const dueDay = clampDueDay(today.getFullYear(), today.getMonth(), bill.Due_Day)
      const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)
      const monthlyPayments = transactions
        .filter((transaction) => {
          return (
            getMonthKey(transaction.Date) === currentMonthKey &&
            isExpense(transaction) &&
            matchesBill(transaction, bill.Bill_Name)
          )
        })
        .sort((left, right) => String(right.Date).localeCompare(String(left.Date)))
      const paid = monthlyPayments.reduce(
        (total, transaction) => total + parseAmount(transaction.Amount),
        0,
      )
      const paidCapped = Math.min(expected, paid)
      const remaining = Math.max(expected - paidCapped, 0)
      const daysUntilDue = dayDifference(today, dueDate)

      let displayStatus = 'Unpaid'

      if (remaining <= 0) {
        displayStatus = 'Paid'
      } else if (paidCapped > 0) {
        displayStatus = daysUntilDue < 0 ? 'Overdue' : 'Partially Paid'
      } else if (daysUntilDue < 0) {
        displayStatus = 'Overdue'
      }

      return {
        ...bill,
        expected,
        paidCapped,
        remaining,
        progress: expected > 0 ? Math.min(paidCapped / expected, 1) : 0,
        dueDay,
        daysUntilDue,
        displayStatus,
        latestPaymentDate: monthlyPayments[0]?.Date ?? '',
      }
    })
    .sort((left, right) => {
      if (left.remaining === 0 && right.remaining > 0) {
        return 1
      }

      if (left.remaining > 0 && right.remaining === 0) {
        return -1
      }

      return left.daysUntilDue - right.daysUntilDue
    })
}

export function buildChartData(transactions, selectedBill) {
  const buckets = new Map()

  transactions.forEach((transaction) => {
    const monthKey = getMonthKey(transaction.Date)

    if (!monthKey) {
      return
    }

    if (!buckets.has(monthKey)) {
      buckets.set(monthKey, {
        monthKey,
        month: formatMonthLabel(monthKey),
        income: 0,
        expenses: 0,
        billTotal: 0,
      })
    }

    const bucket = buckets.get(monthKey)
    const amount = parseAmount(transaction.Amount)

    if (isIncome(transaction)) {
      bucket.income += amount
    }

    if (isExpense(transaction)) {
      bucket.expenses += amount

      if (selectedBill && matchesBill(transaction, selectedBill)) {
        bucket.billTotal += amount
      }
    }
  })

  return [...buckets.values()]
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey))
    .map((bucket) => ({
      month: bucket.month,
      income: bucket.income,
      expenses: bucket.expenses,
      billTotal: bucket.billTotal,
    }))
}

export function getStatusTone(status) {
  if (status === 'Paid') {
    return 'bg-[#006D77] text-white'
  }

  if (status === 'Partially Paid') {
    return 'bg-[#F0F4F8] text-[#2D3436]'
  }

  return 'bg-[#FF6F61] text-[#2D3436]'
}

export function getDaysCopy(daysUntilDue) {
  if (daysUntilDue === 0) {
    return 'Due today'
  }

  if (daysUntilDue < 0) {
    return `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'} overdue`
  }

  return `${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'} until due`
}

export function buildNotificationMessage(sheetConfigured) {
  return sheetConfigured
    ? {
        tone: 'info',
        text: 'Google Sheets credentials detected. Sync to pull your live Transactions and Recurring_Bills tabs.',
      }
    : {
        tone: 'info',
        text: 'Running with local preview data. Add VITE_GOOGLE_API_KEY, VITE_GOOGLE_CLIENT_ID, and VITE_GOOGLE_SHEET_ID to connect your sheet.',
      }
}
