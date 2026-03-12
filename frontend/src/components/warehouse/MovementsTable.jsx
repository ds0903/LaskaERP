const TYPE_BADGE = {
  in:         'bg-[#d4edda] text-[#155724]',
  out:        'bg-[#f8d7da] text-[#721c24]',
  adjustment: 'bg-[#fff3cd] text-[#856404]',
}
const TYPE_LABELS = { in: 'Прихід', out: 'Витрата', adjustment: 'Коригування' }

export default function MovementsTable({ movements }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-crm-border bg-crm-bg-light">
        <h2 className="text-sm font-semibold text-crm-text uppercase tracking-wide">Журнал рухів</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header pl-4">Дата</th>
              <th className="table-header">Тип</th>
              <th className="table-header">Товар</th>
              <th className="table-header">Склад</th>
              <th className="table-header">Кількість</th>
              <th className="table-header">Причина</th>
              <th className="table-header pr-4">Статус</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id} className="table-row">
                <td className="table-cell pl-4 text-crm-muted whitespace-nowrap">
                  {new Date(m.created_at).toLocaleString('uk-UA')}
                </td>
                <td className="table-cell">
                  <span className={`badge ${TYPE_BADGE[m.movement_type]}`}>
                    {TYPE_LABELS[m.movement_type]}
                  </span>
                </td>
                <td className="table-cell font-medium">
                  {m.product?.name ?? `#${m.product_id}`}
                </td>
                <td className="table-cell">{m.warehouse?.name ?? `#${m.warehouse_id}`}</td>
                <td className="table-cell font-medium">
                  {Number(m.quantity).toFixed(3)} {m.product?.unit ?? ''}
                </td>
                <td className="table-cell text-crm-muted">{m.reason || '—'}</td>
                <td className="table-cell pr-4">
                  {m._pending ? (
                    <span className="badge bg-[#fff3cd] text-[#856404]">в черзі</span>
                  ) : (
                    <span className="text-crm-success text-xs font-medium">✓ синхр.</span>
                  )}
                </td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-crm-subtle text-sm">
                  Немає операцій
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
