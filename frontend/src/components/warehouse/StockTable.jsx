export default function StockTable({ stock }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-crm-border bg-crm-bg-light">
        <h2 className="text-sm font-semibold text-crm-text uppercase tracking-wide">
          Залишки на складі
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header pl-4">Товар</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Склад</th>
              <th className="table-header">Кількість</th>
              <th className="table-header">Одиниця</th>
            </tr>
          </thead>
          <tbody>
            {stock.map(s => (
              <tr key={s.id} className="table-row">
                <td className="table-cell pl-4 font-medium">{s.product.name}</td>
                <td className="table-cell text-crm-muted">{s.product.sku}</td>
                <td className="table-cell">{s.warehouse.name}</td>
                <td className="table-cell">
                  <span className={`font-semibold ${
                    Number(s.quantity) === 0
                      ? 'text-crm-danger'
                      : Number(s.quantity) < 5
                      ? 'text-crm-warning'
                      : 'text-crm-success'
                  }`}>
                    {Number(s.quantity).toFixed(3)}
                  </span>
                </td>
                <td className="table-cell">{s.product.unit}</td>
              </tr>
            ))}
            {stock.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-crm-subtle text-sm">Немає залишків</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
