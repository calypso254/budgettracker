import {
  formatAmount,
  formatDateLabel,
  getDepositCopy,
  getStatusTone,
} from '../lib/finance.js'
import { StatusPill } from './Display.jsx'

function IncomeSection({
  incomeSnapshots,
  receiptAmount,
  receiptIncome,
  setReceiptAmount,
  setReceiptIncome,
  submitting,
  onMarkReceived,
  onOpenReceipt,
  onSubmitReceipt,
}) {
  return (
    <section className="border border-[#2D3436] bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Income</p>
          <h3 className="mt-2 text-3xl font-bold">Recurring income</h3>
        </div>
        <p className="text-sm text-[#6B777A]">
          {incomeSnapshots.filter((income) => income.remaining > 0).length} sources pending
        </p>
      </div>

      {incomeSnapshots.length ? (
        <div className="mt-6 space-y-4">
          {incomeSnapshots.map((income) => (
            <article key={income.Income_Name} className="border border-[#2D3436] bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold">{income.Income_Name}</h3>
                    <StatusPill toneClassName={getStatusTone(income.displayStatus)}>
                      {income.displayStatus}
                    </StatusPill>
                    <span className="status-pill border-[#2D3436] bg-[#F0F4F8] text-[#2D3436]">
                      Deposit {income.depositDay}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B777A]">
                    {income.Category} | {getDepositCopy(income.daysUntilDeposit)} | Remaining{' '}
                    {formatAmount(income.remaining)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => onMarkReceived(income)}
                    disabled={income.remaining <= 0 || submitting}
                  >
                    Mark Received
                  </button>
                  <button
                    className="button-primary"
                    type="button"
                    onClick={() =>
                      receiptIncome === income.Income_Name
                        ? setReceiptIncome(null)
                        : onOpenReceipt(income)
                    }
                    disabled={submitting}
                  >
                    {receiptIncome === income.Income_Name ? 'Close Receipt' : 'Log Receipt'}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
                  <span>
                    Received {formatAmount(income.receivedCapped)} of{' '}
                    {formatAmount(income.expected)}
                  </span>
                  <span className="text-[#6B777A]">
                    Latest receipt:{' '}
                    {income.latestReceiptDate
                      ? formatDateLabel(income.latestReceiptDate)
                      : 'No receipt yet'}
                  </span>
                </div>
                <div className="h-4 overflow-hidden border border-[#2D3436] bg-[#F0F4F8]">
                  <div
                    className="h-full bg-[#006D77]"
                    style={{ width: `${income.progress * 100}%` }}
                  />
                </div>
              </div>

              {receiptIncome === income.Income_Name ? (
                <form
                  className="mt-5 grid gap-3 border-t border-[#2D3436]/15 pt-5 md:grid-cols-[1fr_auto_auto]"
                  onSubmit={(event) => onSubmitReceipt(event, income)}
                >
                  <label className="block">
                    <span className="label">Receipt amount</span>
                    <input
                      className="field mt-2"
                      type="number"
                      min="0"
                      step="0.01"
                      value={receiptAmount}
                      onChange={(event) => setReceiptAmount(event.target.value)}
                      placeholder="1000.00"
                    />
                  </label>
                  <button className="button-primary self-end" type="submit" disabled={submitting}>
                    Save Receipt
                  </button>
                  <button
                    className="button-secondary self-end"
                    type="button"
                    onClick={() => setReceiptIncome(null)}
                  >
                    Cancel
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-[#2D3436] bg-[#F8FBFC] px-4 py-5 text-sm text-[#6B777A]">
          Add recurring income in the Data Entry section to track receipts here.
        </div>
      )}
    </section>
  )
}

export default IncomeSection
