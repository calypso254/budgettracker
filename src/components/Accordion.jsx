import { useState } from 'react'

function normalizeOpenItems(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string' && value) {
    return [value]
  }

  return []
}

function Accordion({
  items,
  allowMultiple = true,
  defaultOpenItems = [],
  openItems,
  onChange,
  className = '',
}) {
  const [internalOpenItems, setInternalOpenItems] = useState(() =>
    normalizeOpenItems(defaultOpenItems),
  )
  const currentOpenItems =
    openItems === undefined ? internalOpenItems : normalizeOpenItems(openItems)

  function toggleItem(itemId) {
    const isOpen = currentOpenItems.includes(itemId)
    const nextOpenItems = allowMultiple
      ? isOpen
        ? currentOpenItems.filter((openItemId) => openItemId !== itemId)
        : [...currentOpenItems, itemId]
      : isOpen
        ? []
        : [itemId]

    if (openItems === undefined) {
      setInternalOpenItems(nextOpenItems)
    }

    onChange?.(nextOpenItems)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => {
        const isOpen = currentOpenItems.includes(item.id)

        return (
          <section
            key={item.id}
            className="border border-[#2D3436] bg-white shadow-[10px_10px_0_0_#2D3436]"
          >
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-[#F7FAFC]"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.id}`}
            >
              <div className="space-y-2">
                {item.eyebrow ? (
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6B777A]">
                    {item.eyebrow}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold sm:text-3xl">{item.title}</h2>
                  {item.meta ? (
                    <span className="border border-[#2D3436] bg-[#F0F4F8] px-2 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2D3436]">
                      {item.meta}
                    </span>
                  ) : null}
                </div>
                {item.subtitle ? (
                  <p className="max-w-3xl text-sm text-[#6B777A]">{item.subtitle}</p>
                ) : null}
              </div>

              <span className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center border border-[#2D3436] bg-white">
                <svg
                  className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>

            <div
              id={`accordion-panel-${item.id}`}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden border-t border-[#2D3436]/15">
                <div className="px-5 py-5">{item.content}</div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default Accordion
