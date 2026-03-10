import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTooltip, EmptyChartState } from './Display.jsx'

function TrendsSection({
  billOptions,
  chartData,
  chartDefinition,
  chartLines,
  chartView,
  selectedChartBill,
  setChartView,
  setSelectedBill,
  options,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="block">
          <span className="label">Chart view</span>
          <select
            className="select-field mt-2"
            value={chartView}
            onChange={(event) => setChartView(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Bill filter</span>
          <select
            className="select-field mt-2"
            value={selectedChartBill}
            onChange={(event) => setSelectedBill(event.target.value)}
            disabled={chartView !== 'billHistory' || !billOptions.length}
          >
            {billOptions.length ? (
              billOptions.map((billName) => (
                <option key={billName} value={billName}>
                  {billName}
                </option>
              ))
            ) : (
              <option value="">No bills available</option>
            )}
          </select>
        </label>
      </div>

      <div className="border border-[#2D3436] bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label">Trend summary</p>
            <h3 className="mt-2 text-2xl font-bold">{chartDefinition?.label}</h3>
            <p className="mt-2 text-sm text-[#6B777A]">{chartDefinition?.description}</p>
          </div>
          <div className="text-sm text-[#6B777A]">Thick lines and monthly grouping via Recharts</div>
        </div>

        <div className="mt-6">
          {chartData.length ? (
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#D3DDE5" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#2D3436', fontSize: 12 }}
                    axisLine={{ stroke: '#2D3436' }}
                    tickLine={{ stroke: '#2D3436' }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                    tick={{ fill: '#2D3436', fontSize: 12 }}
                    axisLine={{ stroke: '#2D3436' }}
                    tickLine={{ stroke: '#2D3436' }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  {chartLines.map((line) => (
                    <Line
                      key={line.dataKey}
                      type="monotone"
                      dataKey={line.dataKey}
                      name={line.name}
                      stroke={line.stroke}
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState text="Log a few transactions to see the historical trend lines populate." />
          )}
        </div>
      </div>
    </div>
  )
}

export default TrendsSection
