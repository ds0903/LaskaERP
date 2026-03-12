import { useState } from 'react'
import { createProduct, deleteProduct } from '../../api/warehouse'

const EMPTY = { name: '', sku: '', unit: 'шт', description: '', price: '', category: '' }

export default function ProductList({ products, onRefresh }) {
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    await createProduct({ ...form, price: parseFloat(form.price) || 0 })
    setForm(EMPTY)
    setShowForm(false)
    onRefresh()
  }

  async function handleDelete(id) {
    if (!confirm('Видалити товар?')) return
    await deleteProduct(id)
    onRefresh()
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-crm-border bg-crm-bg-light">
        <h2 className="text-sm font-semibold text-crm-text uppercase tracking-wide">Товари</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs px-3 py-1">
          + Додати
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-crm-border bg-[#eff6ff]">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input required placeholder="Назва *" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input col-span-2" />
            <input required placeholder="SKU *" value={form.sku}
              onChange={e => setForm({ ...form, sku: e.target.value })}
              className="input" />
            <input placeholder="Одиниця" value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              className="input" />
            <input placeholder="Ціна" type="number" step="0.01" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="input" />
            <input placeholder="Категорія" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="input" />
            <input placeholder="Опис" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input col-span-3" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-success text-xs">Зберегти</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-xs text-crm-muted hover:text-crm-text">Скасувати</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header pl-4">Назва</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Одиниця</th>
              <th className="table-header">Ціна</th>
              <th className="table-header">Категорія</th>
              <th className="table-header pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="table-row">
                <td className="table-cell pl-4 font-medium">{p.name}</td>
                <td className="table-cell text-crm-muted">{p.sku}</td>
                <td className="table-cell">{p.unit}</td>
                <td className="table-cell">{Number(p.price).toFixed(2)}</td>
                <td className="table-cell text-crm-muted">{p.category || '—'}</td>
                <td className="table-cell pr-4">
                  <button onClick={() => handleDelete(p.id)}
                    className="text-crm-subtle hover:text-crm-danger text-xs transition-colors">✕</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-crm-subtle text-sm">Немає товарів</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
