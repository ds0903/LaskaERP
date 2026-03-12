import { useState } from 'react'
import { createWarehouse, deleteWarehouse } from '../../api/warehouse'

export default function WarehouseList({ warehouses, onRefresh, onSelect, selectedId }) {
  const [form, setForm] = useState({ name: '', address: '', description: '' })
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    await createWarehouse(form)
    setForm({ name: '', address: '', description: '' })
    setShowForm(false)
    onRefresh()
  }

  async function handleDelete(id) {
    if (!confirm('Видалити склад?')) return
    await deleteWarehouse(id)
    onRefresh()
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-crm-border bg-crm-bg-light">
        <h2 className="text-sm font-semibold text-crm-text uppercase tracking-wide">Склади</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs px-3 py-1">
          + Додати
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-3 border-b border-crm-border space-y-2 bg-[#eff6ff]">
          <input required placeholder="Назва *" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="input" />
          <input placeholder="Адреса" value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="input" />
          <input placeholder="Опис" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="input" />
          <div className="flex gap-2">
            <button type="submit" className="btn-success text-xs">Зберегти</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-xs text-crm-muted hover:text-crm-text">Скасувати</button>
          </div>
        </form>
      )}

      <ul>
        {warehouses.map(w => (
          <li key={w.id}
            onClick={() => onSelect(w.id === selectedId ? null : w.id)}
            className={`flex justify-between items-center px-4 py-2.5 cursor-pointer
              border-b border-crm-border last:border-0 text-sm transition-colors
              ${w.id === selectedId
                ? 'bg-[#eff6ff] border-l-2 border-l-crm-primary font-medium text-crm-primary'
                : 'hover:bg-crm-bg text-crm-text'
              }`}
          >
            <span>{w.name}</span>
            <button
              onClick={e => { e.stopPropagation(); handleDelete(w.id) }}
              className="text-crm-subtle hover:text-crm-danger text-xs transition-colors"
            >✕</button>
          </li>
        ))}
        {warehouses.length === 0 && (
          <li className="px-4 py-4 text-sm text-crm-subtle text-center">Немає складів</li>
        )}
      </ul>
    </div>
  )
}
