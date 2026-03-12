import { useEffect, useState, useCallback } from 'react'
import { getWarehouses, getProducts, getStock, getMovements } from '../api/warehouse'
import WarehouseList from '../components/warehouse/WarehouseList'
import ProductList from '../components/warehouse/ProductList'
import StockTable from '../components/warehouse/StockTable'
import MovementForm from '../components/warehouse/MovementForm'
import MovementsTable from '../components/warehouse/MovementsTable'

const TABS = ['Залишки', 'Товари', 'Журнал']

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [stock, setStock] = useState([])
  const [movements, setMovements] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [tab, setTab] = useState('Залишки')

  const loadWarehouses = useCallback(async () => setWarehouses(await getWarehouses()), [])
  const loadProducts   = useCallback(async () => setProducts(await getProducts()), [])
  const loadStock      = useCallback(async () => setStock(await getStock(selectedWarehouse)), [selectedWarehouse])
  const loadMovements  = useCallback(async () => {
    setMovements(await getMovements(selectedWarehouse ? { warehouse_id: selectedWarehouse } : {}))
  }, [selectedWarehouse])

  useEffect(() => { loadWarehouses() }, [loadWarehouses])
  useEffect(() => { loadProducts()   }, [loadProducts])
  useEffect(() => { loadStock()      }, [loadStock])
  useEffect(() => { loadMovements()  }, [loadMovements])

  const refreshAll = () => { loadStock(); loadMovements() }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-crm-text">Склад</h1>
        <span className="text-sm text-crm-muted">
          {warehouses.length} склад(-ів) · {products.length} товар(-ів)
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <WarehouseList
            warehouses={warehouses}
            onRefresh={loadWarehouses}
            onSelect={setSelectedWarehouse}
            selectedId={selectedWarehouse}
          />
        </div>

        <div className="col-span-3 space-y-4">
          <MovementForm warehouses={warehouses} products={products} onRefresh={refreshAll} />

          <div className="flex gap-0 border-b border-crm-border">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t
                    ? 'border-crm-primary text-crm-primary'
                    : 'border-transparent text-crm-muted hover:text-crm-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Залишки' && <StockTable stock={stock} />}
          {tab === 'Товари'  && <ProductList products={products} onRefresh={loadProducts} />}
          {tab === 'Журнал'  && <MovementsTable movements={movements} />}
        </div>
      </div>
    </div>
  )
}
