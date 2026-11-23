export default function Breakdown({ items, total, money, activeId, onPick, monthName }) {
  return (
    <section className="section" aria-labelledby="breakdown-title">
      <div className="section-head">
        <h3 id="breakdown-title" className="section-title">
          Where it went
        </h3>
        <p className="section-sub">{total > 0 ? `${money(total)} spent in ${monthName}` : `No spending in ${monthName}`}</p>
      </div>

      {items.length === 0 ? (
        <p className="empty-note">Add an expense to see which categories take the most.</p>
      ) : (
        <>
          <div className="ribbon" role="img" aria-label="Share of spending by category">
            {items.map((item) => (
              <span key={item.id} style={{ flexGrow: item.value, background: item.color }} />
            ))}
          </div>

          <ul className="cat-list">
            {items.map((item) => {
              const Icon = item.icon;
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`cat-row ${active ? 'is-active' : ''}`}
                    style={{ '--c': item.color }}
                    onClick={() => onPick(item.id)}
                    aria-pressed={active}
                    title={active ? 'Show all entries' : `Show only ${item.label}`}
                  >
                    <span className="swatch">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="cat-name">{item.label}</span>
                    <span className="cat-amount">{money(item.value)}</span>
                    <span className="cat-share">{Math.round(item.share * 100)}%</span>
                    <span className="cat-bar" aria-hidden="true">
                      <span style={{ width: `${Math.max(item.share * 100, 2)}%` }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
