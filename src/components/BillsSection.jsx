import {
  formatAmount,
  formatDateLabel,
  getDaysCopy,
  getStatusTone,
} from '../lib/finance.js'
import { StatusPill } from './Display.jsx'

function BillsSection({
  billSnapshots,
  paymentAmount,
  paymentBill,
  setPaymentAmount,
  setPaymentBill,
  submitting,
  onMarkPaid,
  onOpenPayment,
  onSubmitPayment,
}) {
  return (
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

      {billSnapshots.length ? (
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
                      paymentBill === bill.Bill_Name
                        ? setPaymentBill(null)
                        : onOpenPayment(bill)
                    }
                    disabled={submitting}
                  >
                    {paymentBill === bill.Bill_Name ? 'Close Payment' : 'Log Payment'}
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

              {paymentBill === bill.Bill_Name ? (
                <form
                  className="mt-5 grid gap-3 border-t border-[#2D3436]/15 pt-5 md:grid-cols-[1fr_auto_auto]"
                  onSubmit={(event) => onSubmitPayment(event, bill)}
                >
                  <label className="block">
                    <span className="label">Payment amount</span>
                    <input
                      className="field mt-2"
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      placeholder="140.00"
                    />
                  </label>
                  <button className="button-primary self-end" type="submit" disabled={submitting}>
                    Save Payment
                  </button>
                  <button
                    className="button-secondary self-end"
                    type="button"
                    onClick={() => setPaymentBill(null)}
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
          Add recurring bills in the Data Entry section to track payments here.
        </div>
      )}
    </section>
  )
}

export default BillsSection
