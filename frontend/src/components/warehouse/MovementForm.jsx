import { useState } from 'react'
import { createMovement } from '../../api/warehouse'

const EMPTY = { warehouse_id: '', product_id: '', movement_type: 'in', quantity: '', reason: '' }

const TYPE_OPTIONS = [
  { value: 'in',         label: 'Прихід',      color: 'text-crm-success' },
  { value: 'out',        label: 'Витрата',     color: 'text-crm-danger'  },
  { value: 'adjustment', label: 'Коригування', color: 'text-crm-warning' },
]

export default function MovementForm({ warehouses, products, onRefresh }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await createMovement({
        ...form,
        warehouse_id: parseInt(form.warehouse_id),
        product_id:   parseInt(form.product_id),
        quantity:     parseFloat(form.quantity),
      })
      setForm(EMPTY)
      setOpen(false)
      onRefresh()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Помилка')
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-crm-border bg-crm-bg-light">
        <h2 className="text-sm font-semibold text-crm-text uppercase tracking-wide">Рух товарів</h2>
        <button onClick={() => setOpen(!open)} className="btn-primary text-xs px-3 py-1">
          + Нова операція
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="p-4 bg-[#eff6ff] border-b border-crm-border">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <select required value={form.warehouse_id}
              onChange={e => setForm({ ...form, warehouse_id: e.target.value })}
              className="select">
              <option value="">Склад *</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>

            <select required value={form.product_id}
              onChange={e => setForm({ ...form, product_id: e.target.value })}
              className="select">
              <option value="">Товар *</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>

            <select value={form.movement_type}
              onChange={e => setForm({ ...form, movement_type: e.target.value })}
              className="select">
              {TYPE_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <input required type="number" step="0.001" min="0.001" placeholder="Кількість *"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="input" />

            <input placeholder="Причина / коментар" value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              className="input col-span-2" />
          </div>

          {error && (
            <p className="text-xs text-crm-danger bg-red-50 border border-red-200 rounded px-3 py-1.5 mb-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn-success text-xs">Провести</button>
            <button type="button"
              onClick={() => { setOpen(false); setError('') }}
              className="text-xs text-crm-muted hover:text-crm-text">Скасувати</button>
          </div>
        </form>
      )}
    </div>
  )
}
