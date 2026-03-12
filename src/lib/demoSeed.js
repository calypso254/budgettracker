function padNumber(value) {
  return String(value).padStart(2, '0')
}

function getLocalIsoDate(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate(),
  )}`
}

function buildOffsetDate(monthOffset, day) {
  const today = new Date()
  const target = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const lastDayOfMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate()

  return getLocalIsoDate(
    new Date(target.getFullYear(), target.getMonth(), Math.min(day, lastDayOfMonth)),
  )
}

function sortTransactionsNewestFirst(rows) {
  return [...rows].sort((left, right) =>
    String(right.Date).localeCompare(String(left.Date)),
  )
}

export function createDemoSeed() {
  const recurringBills = [
    {
      Bill_Name: 'Rent',
      Category: 'Housing',
      Expected_Amount: '1300',
      Due_Day: '15',
      Status: 'Active',
    },
    {
      Bill_Name: 'Electric',
      Category: 'Utilities',
      Expected_Amount: '120',
      Due_Day: '11',
      Status: 'Active',
    },
    {
      Bill_Name: 'Water',
      Category: 'Utilities',
      Expected_Amount: '68',
      Due_Day: '15',
      Status: 'Active',
    },
    {
      Bill_Name: 'Auto Insurance',
      Category: 'Auto',
      Expected_Amount: '190',
      Due_Day: '22',
      Status: 'Active',
    },
    {
      Bill_Name: 'Studio Tools',
      Category: 'Business',
      Expected_Amount: '45',
      Due_Day: '27',
      Status: 'Active',
    },
  ]
  const recurringIncome = [
    {
      Income_Name: 'Design Retainer',
      Category: 'Salary',
      Expected_Amount: '2450',
      Deposit_Day: '1',
      Status: 'Active',
      Notes: 'Monthly operating draw',
    },
    {
      Income_Name: 'Maple Duplex',
      Category: 'Rental Property',
      Expected_Amount: '950',
      Deposit_Day: '5',
      Status: 'Active',
      Notes: 'Rental income',
    },
  ]

  const transactions = []

  for (let monthOffset = -5; monthOffset <= 0; monthOffset += 1) {
    const utilitiesAmount = 106 + (monthOffset + 5) * 4
    const waterAmount = 62 + ((monthOffset + 5) % 3) * 2

    transactions.push(
      {
        Date: buildOffsetDate(monthOffset, 1),
        Type: 'Income',
        Category: 'Salary',
        Payee_Source: 'Design Retainer',
        Amount: '2450',
        Applied_To_Bill: '',
        Notes: 'Monthly operating draw',
      },
      {
        Date: buildOffsetDate(monthOffset, 5),
        Type: 'Income',
        Category: 'Rental Property',
        Payee_Source: 'Maple Duplex',
        Amount: '950',
        Applied_To_Bill: '',
        Notes: 'Rental income',
      },
      {
        Date: buildOffsetDate(monthOffset, 9),
        Type: 'Expense',
        Category: 'Auto',
        Payee_Source: 'Auto Insurance',
        Amount: '190',
        Applied_To_Bill: 'Auto Insurance',
        Notes: 'Policy renewal',
      },
      {
        Date: buildOffsetDate(monthOffset, 12),
        Type: 'Expense',
        Category: 'Utilities',
        Payee_Source: 'Water',
        Amount: String(waterAmount),
        Applied_To_Bill: 'Water',
        Notes: 'Utility autopay',
      },
      {
        Date: buildOffsetDate(monthOffset, 25),
        Type: 'Expense',
        Category: 'Business',
        Payee_Source: 'Studio Tools',
        Amount: '45',
        Applied_To_Bill: 'Studio Tools',
        Notes: 'Workspace software',
      },
    )

    if (monthOffset === 0) {
      transactions.push(
        {
          Date: buildOffsetDate(0, 3),
          Type: 'Expense',
          Category: 'Housing',
          Payee_Source: 'Rent',
          Amount: '650',
          Applied_To_Bill: 'Rent',
          Notes: 'First half of rent',
        },
        {
          Date: buildOffsetDate(0, 8),
          Type: 'Expense',
          Category: 'Utilities',
          Payee_Source: 'Electric',
          Amount: '84',
          Applied_To_Bill: 'Electric',
          Notes: 'Partial utility payment',
        },
      )
    } else {
      transactions.push(
        {
          Date: buildOffsetDate(monthOffset, 3),
          Type: 'Expense',
          Category: 'Housing',
          Payee_Source: 'Rent',
          Amount: '1300',
          Applied_To_Bill: 'Rent',
          Notes: 'Monthly rent',
        },
        {
          Date: buildOffsetDate(monthOffset, 8),
          Type: 'Expense',
          Category: 'Utilities',
          Payee_Source: 'Electric',
          Amount: String(utilitiesAmount),
          Applied_To_Bill: 'Electric',
          Notes: 'Electric bill',
        },
      )
    }
  }

  return {
    recurringBills,
    recurringIncome,
    transactions: sortTransactionsNewestFirst(transactions),
  }
}
