import {
  formatAmount,
  formatDateLabel,
  formatMonthLabel,
  getDaysCopy,
  getStatusTone,
} from '../lib/finance.js'
import { MetricCard, StatusPill } from './Display.jsx'

function DashboardSection({
  billSnapshots,
  currentMonthExpenses,
  currentMonthIncome,
  currentMonthKey,
  partialPaymentAmount,
  partialPaymentBill,
  setPartialPaymentAmount,
  setPartialPaymentBill,
  submitting,
  totalExpected,
  totalPaid,
  totalUnpaid,
  onMarkPaid,
  onOpenPartialPayment,
  onSubmitPartialPayment,
}) {
  return (
    <div className="space-y-6">
      <section className="border border-[#2D3436] bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">{formatMonthLabel(currentMonthKey)}</p>
            <h3 className="mt-2 text-3xl font-bold">Dashboard</h3>
          </div>
          <p className="text-sm text-[#6B777A]">
            {formatAmount(totalPaid)} paid of {formatAmount(totalExpected)} this month
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="Paid this month"
            value={formatAmount(totalPaid)}
            detail={`${billSnapshots.filter((bill) => bill.displayStatus === 'Paid').length} bills fully closed`}
            accent="text-[#006D77]"
          />
          <MetricCard
            label="Still unpaid"
            value={formatAmount(totalUnpaid)}
            detail={`${billSnapshots.filter((bill) => bill.remaining > 0).length} bills still active`}
            accent="text-[#FF6F61]"
          />
          <MetricCard
            label="Income logged"
            value={formatAmount(currentMonthIncome)}
            detail="Current month total across all income entries"
            accent="text-[#006D77]"
          />
          <MetricCard
            label="Net flow"
            value={formatAmount(currentMonthIncome - currentMonthExpenses)}
            detail={`${formatAmount(currentMonthExpenses)} already logged as outgoing`}
            accent="text-[#2D3436]"
          />
        </div>

        <div className="mt-6 border border-[#2D3436] bg-[#F8FBFC] p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label">Bill progress</p>
              <h4 className="mt-2 text-2xl font-bold">Paid vs unpaid total</h4>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#6B777A]">
              {totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0}% closed
            </p>
          </div>
          <div className="mt-4 h-5 overflow-hidden border border-[#2D3436] bg-white">
            <div
              className="h-full bg-[#006D77]"
              style={{
                width: `${totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="border border-[#2D3436] bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">Bills</p>
            <h3 className="mt-2 text-3xl font-bold">Active bills</h3>
          </div>
          <p className="text-sm text-[#6B777A]">
            {billSnapshots.filter((bill) => bill.remaining > 0).length} open bills
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {billSnapshots.map((bill) => (
            <article key={bill.Bill_Name} className="border border-[#2D3436] bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold">{bill.Bill_Name}</h3>
                    <StatusPill toneClassName={getStatusTone(bill.displayStatus)}>
                      {bill.displayStatus}
                    </StatusPill>
                    <span className="status-pill border-[#2D3436] bg-[#F0F4F8] text-[#2D3436]">
                      Due {bill.dueDay}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B777A]">
                    {bill.Category} | {getDaysCopy(bill.daysUntilDue)} | Remaining{' '}
                    {formatAmount(bill.remaining)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => onMarkPaid(bill)}
                    disabled={bill.remaining <= 0 || submitting}
                  >
                    Mark as Paid
                  </button>
                  <button
                    className="button-primary"
                    type="button"
                    onClick={() =>
                      partialPaymentBill === bill.Bill_Name
                        ? setPartialPaymentBill(null)
                        : onOpenPartialPayment(bill)
                    }
                    disabled={bill.remaining <= 0 || submitting}
                  >
                    {partialPaymentBill === bill.Bill_Name ? 'Close Partial' : '+ Partial Payment'}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
                  <span>
                    Paid {formatAmount(bill.paidCapped)} of {formatAmount(bill.expected)}
                  </span>
                  <span className="text-[#6B777A]">
                    Latest payment:{' '}
                    {bill.latestPaymentDate
                      ? formatDateLabel(bill.latestPaymentDate)
                      : 'No payment yet'}
                  </span>
                </div>
                <div className="h-4 overflow-hidden border border-[#2D3436] bg-[#F0F4F8]">
                  <div
                    className="h-full bg-[#006D77]"
                    style={{ width: `${bill.progress * 100}%` }}
                  />
                </div>
              </div>

              {partialPaymentBill === bill.Bill_Name ? (
                <form
                  className="mt-5 grid gap-3 border-t border-[#2D3436]/15 pt-5 md:grid-cols-[1fr_auto_auto]"
                  onSubmit={(event) => onSubmitPartialPayment(event, bill)}
                >
                  <label className="block">
                    <span className="label">Partial amount</span>
                    <input
                      className="field mt-2"
                      type="number"
                      min="0"
                      max={bill.remaining}
                      step="0.01"
                      value={partialPaymentAmount}
                      onChange={(event) => setPartialPaymentAmount(event.target.value)}
                      placeholder="650.00"
                    />
                  </label>
                  <button className="button-primary self-end" type="submit" disabled={submitting}>
                    Apply Payment
                  </button>
                  <button
                    className="button-secondary self-end"
                    type="button"
                    onClick={() => setPartialPaymentBill(null)}
                  >
                    Cancel
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardSection
