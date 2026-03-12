import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { syncAll, checkServerOnline } from '../services/syncManager'

const SyncContext = createContext(null)

const SYNC_INTERVAL_MS = 30_000

export function SyncProvider({ children }) {
  const [online, setOnline] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const timerRef = useRef(null)

  const runSync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    try {
      const result = await syncAll()
      setOnline(result.online)
      if (result.online) setLastSync(new Date())
      // оновити лічильник черги
      const { getDb } = await import('../db/index')
      const db = await getDb()
      const rows = await db.select('SELECT COUNT(*) as cnt FROM sync_queue')
      setPendingCount(rows[0]?.cnt ?? 0)
    } finally {
      setSyncing(false)
    }
  }, [syncing])

  useEffect(() => {
    runSync()
    timerRef.current = setInterval(runSync, SYNC_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <SyncContext.Provider value={{ online, pendingCount, lastSync, syncing, runSync }}>
      {children}
    </SyncContext.Provider>
  )
}

export const useSync = () => useContext(SyncContext)
