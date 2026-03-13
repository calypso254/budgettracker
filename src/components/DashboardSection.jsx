import { formatAmount, formatMonthLabel } from '../lib/finance.js'
import { MetricCard } from './Display.jsx'

function DashboardSection({
  currentMonthExpenses,
  currentMonthIncome,
  currentMonthKey,
  totalExpected,
  totalBillsOpen,
  totalBillsPaid,
  totalPaid,
  totalUnpaid,
}) {
  return (
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

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Paid this month"
          value={formatAmount(totalPaid)}
          detail={`${totalBillsPaid} bills fully closed`}
          accent="text-[#006D77]"
        />
        <MetricCard
          label="Still unpaid"
          value={formatAmount(totalUnpaid)}
          detail={`${totalBillsOpen} bills still active`}
          accent="text-[#FF6F61]"
        />
        <MetricCard
          label="Income this month"
          value={formatAmount(currentMonthIncome)}
          detail="Income actually received and logged this month"
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
  )
}

export default DashboardSection
