import { formatAmount } from '../lib/finance.js'

export function PixelMark({ size = 'h-14 w-14' }) {
  const cells = [
    'bg-transparent',
    'bg-[#006D77]',
    'bg-transparent',
    'bg-[#FF6F61]',
    'bg-[#006D77]',
    'bg-[#006D77]',
    'bg-transparent',
    'bg-[#FF6F61]',
    'bg-transparent',
    'bg-[#006D77]',
    'bg-[#006D77]',
    'bg-[#FF6F61]',
    'bg-[#006D77]',
    'bg-transparent',
    'bg-transparent',
    'bg-[#FF6F61]',
  ]

  return (
    <div className={`grid grid-cols-4 gap-1 ${size}`} aria-hidden="true">
      {cells.map((tone, index) => (
        <span
          key={index}
          className={`block aspect-square border border-[#2D3436] ${tone}`}
        />
      ))}
    </div>
  )
}

export function MetricCard({ label, value, detail, accent }) {
  return (
    <article className="metric-card">
      <p className="label">{label}</p>
      <p
        className={`mt-3 font-['Space_Grotesk'] text-3xl font-bold sm:text-4xl ${accent}`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-[#6B777A]">{detail}</p>
    </article>
  )
}

export function StatusPill({ children, toneClassName }) {
  return <span className={`status-pill ${toneClassName}`}>{children}</span>
}

export function NoticeBar({ notice }) {
  if (!notice?.text) {
    return null
  }

  const toneClassName =
    notice.tone === 'success'
      ? 'border-[#006D77] bg-[#006D77] text-white'
      : notice.tone === 'danger'
        ? 'border-[#FF6F61] bg-[#FF6F61] text-[#2D3436]'
        : 'border-[#2D3436] bg-white text-[#2D3436]'

  return (
    <div className={`border px-4 py-3 text-sm font-medium ${toneClassName}`}>
      {notice.text}
    </div>
  )
}

export function ChartTooltip({ active, label, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="border border-[#2D3436] bg-white px-3 py-2 shadow-[6px_6px_0_0_#2D3436]">
      <p className="font-['Space_Grotesk'] text-sm font-bold">{label}</p>
      <div className="mt-2 flex flex-col gap-1 text-sm">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.name}
            </span>
            <span>{formatAmount(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmptyChartState({ text }) {
  return (
    <div className="grid h-[320px] place-items-center border border-[#2D3436] bg-white px-6 text-center">
      <div>
        <p className="font-['Space_Grotesk'] text-2xl font-bold">No chart data yet</p>
        <p className="mt-2 max-w-md text-sm text-[#6B777A]">{text}</p>
      </div>
    </div>
  )
}
