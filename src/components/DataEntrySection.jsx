import { StatusPill } from './Display.jsx'

function DataEntrySection({
  billForm,
  incomeForm,
  submitting,
  transactionForm,
  onBillFormChange,
  onBillSubmit,
  onIncomeFormChange,
  onIncomeSubmit,
  onTransactionFormChange,
  onTransactionSubmit,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_0.95fr_1.15fr]">
      <section className="border border-[#2D3436] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">Recurring bills</p>
            <h3 className="mt-2 text-2xl font-bold">Add a new monthly bill</h3>
          </div>
          <StatusPill toneClassName="bg-[#F0F4F8] text-[#2D3436]">
            Recurring_Bills
          </StatusPill>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={onBillSubmit}>
          <label className="block">
            <span className="label">Bill name</span>
            <input
              className="field mt-2"
              name="billName"
              value={billForm.billName}
              onChange={onBillFormChange}
              placeholder="Rent"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label">Category</span>
              <input
                className="field mt-2"
                list="category-options"
                name="category"
                value={billForm.category}
                onChange={onBillFormChange}
                placeholder="Housing"
              />
            </label>

            <label className="block">
              <span className="label">Expected amount</span>
              <input
                className="field mt-2"
                type="number"
                min="0"
                step="0.01"
                name="expectedAmount"
                value={billForm.expectedAmount}
                onChange={onBillFormChange}
                placeholder="1300.00"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label">Due day</span>
              <input
                className="field mt-2"
                type="number"
                min="1"
                max="31"
                name="dueDay"
                value={billForm.dueDay}
                onChange={onBillFormChange}
              />
            </label>

            <label className="block">
              <span className="label">Status</span>
              <select
                className="select-field mt-2"
                name="status"
                value={billForm.status}
                onChange={onBillFormChange}
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Seasonal">Seasonal</option>
              </select>
            </label>
          </div>

          <button className="button-primary mt-2" type="submit" disabled={submitting}>
            Append recurring bill
          </button>
        </form>
      </section>

      <section className="border border-[#2D3436] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">Recurring income</p>
            <h3 className="mt-2 text-2xl font-bold">Add a new monthly income</h3>
          </div>
          <StatusPill toneClassName="bg-[#F0F4F8] text-[#2D3436]">
            Recurring_Income
          </StatusPill>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={onIncomeSubmit}>
          <label className="block">
            <span className="label">Income name</span>
            <input
              className="field mt-2"
              name="incomeName"
              value={incomeForm.incomeName}
              onChange={onIncomeFormChange}
              placeholder="Design Retainer"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label">Category</span>
              <input
                className="field mt-2"
                list="category-options"
                name="category"
                value={incomeForm.category}
                onChange={onIncomeFormChange}
                placeholder="Salary"
              />
            </label>

            <label className="block">
              <span className="label">Expected amount</span>
              <input
                className="field mt-2"
                type="number"
                min="0"
                step="0.01"
                name="expectedAmount"
                value={incomeForm.expectedAmount}
                onChange={onIncomeFormChange}
                placeholder="2450.00"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label">Deposit day</span>
              <input
                className="field mt-2"
                type="number"
                min="1"
                max="31"
                name="depositDay"
                value={incomeForm.depositDay}
                onChange={onIncomeFormChange}
              />
            </label>

            <label className="block">
              <span className="label">Status</span>
              <select
                className="select-field mt-2"
                name="status"
                value={incomeForm.status}
                onChange={onIncomeFormChange}
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Seasonal">Seasonal</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="label">Notes</span>
            <textarea
              className="textarea-field mt-2"
              name="notes"
              value={incomeForm.notes}
              onChange={onIncomeFormChange}
              placeholder="Optional paycheck or source notes"
            />
          </label>

          <button className="button-primary mt-2" type="submit" disabled={submitting}>
            Append recurring income
          </button>
        </form>
      </section>

      <section className="border border-[#2D3436] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">Transactions</p>
            <h3 className="mt-2 text-2xl font-bold">Add income or expense</h3>
          </div>
          <StatusPill toneClassName="bg-[#F0F4F8] text-[#2D3436]">
            Transactions
          </StatusPill>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={onTransactionSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label">Date</span>
              <input
                className="field mt-2"
                type="date"
                name="date"
                value={transactionForm.date}
                onChange={onTransactionFormChange}
              />
            </label>

            <label className="block">
              <span className="label">Type</span>
              <select
                className="select-field mt-2"
                name="type"
                value={transactionForm.type}
                onChange={onTransactionFormChange}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label">Category</span>
              <input
                className="field mt-2"
                list="category-options"
                name="category"
                value={transactionForm.category}
                onChange={onTransactionFormChange}
                placeholder="Utilities"
              />
            </label>

            <label className="block">
              <span className="label">Amount</span>
              <input
                className="field mt-2"
                type="number"
                min="0"
                step="0.01"
                name="amount"
                value={transactionForm.amount}
                onChange={onTransactionFormChange}
                placeholder="650.00"
              />
            </label>
          </div>

          <label className="block">
            <span className="label">Payee / source</span>
            <input
              className="field mt-2"
              name="payeeSource"
              value={transactionForm.payeeSource}
              onChange={onTransactionFormChange}
              placeholder="Maple Duplex"
            />
          </label>

          <label className="block">
            <span className="label">Applied to bill</span>
            <input
              className="field mt-2"
              list="bill-options"
              name="appliedToBill"
              value={transactionForm.appliedToBill}
              onChange={onTransactionFormChange}
              disabled={transactionForm.type === 'Income'}
              placeholder={
                transactionForm.type === 'Income' ? 'Not used for income' : 'Rent'
              }
            />
          </label>

          <label className="block">
            <span className="label">Notes</span>
            <textarea
              className="textarea-field mt-2"
              name="notes"
              value={transactionForm.notes}
              onChange={onTransactionFormChange}
              placeholder="Optional details, property, tenant, or business notes"
            />
          </label>

          <button className="button-primary mt-2" type="submit" disabled={submitting}>
            Append transaction
          </button>
        </form>
      </section>
    </div>
  )
}

export default DataEntrySection
