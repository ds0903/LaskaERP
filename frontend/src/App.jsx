import { Routes, Route, NavLink } from 'react-router-dom'
import { SyncProvider, useSync } from './contexts/SyncContext'
import WarehousePage from './pages/WarehousePage'

function StatusBar() {
  const { online, pendingCount, syncing, lastSync, runSync } = useSync()

  return (
    <div className="flex items-center gap-3 text-xs ml-auto">
      {syncing && (
        <span className="text-white/60 animate-pulse">синхронізація...</span>
      )}
      {pendingCount > 0 && (
        <span className="bg-crm-warning text-white px-2 py-0.5 rounded-full font-medium">
          {pendingCount} в черзі
        </span>
      )}
      <button
        onClick={runSync}
        title="Синхронізувати зараз"
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-crm-danger'}`} />
        <span className="text-white/80">{online ? 'онлайн' : 'офлайн'}</span>
      </button>
      {lastSync && (
        <span className="text-white/50">{lastSync.toLocaleTimeString('uk-UA')}</span>
      )}
    </div>
  )
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-crm-sidebar text-white px-6 py-0 flex items-center h-14 shadow-md">
        <span className="font-bold text-base tracking-wide mr-8">
          Laska<span className="text-crm-primary">ERP</span>
        </span>
        <div className="flex items-center h-full gap-1">
          <NavLink
            to="/warehouse"
            className={({ isActive }) =>
              `h-full flex items-center px-4 text-sm transition-colors border-b-2 ${
                isActive
                  ? 'border-crm-primary text-white font-medium'
                  : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
              }`
            }
          >
            Склад
          </NavLink>
        </div>
        <StatusBar />
      </nav>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<WarehousePage />} />
          <Route path="/warehouse" element={<WarehousePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <SyncProvider>
      <Layout />
    </SyncProvider>
  )
}
