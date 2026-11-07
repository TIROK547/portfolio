'use client'

import { useEffect, useRef, useState } from 'react'

/** Session-local recovery covers links, browser Back, reloads, and failed saves. */
export function useDraftRecovery(key: string, snapshot: string, restore: (value: string) => void) {
  const [baseline, setBaseline] = useState(snapshot)
  const restoreRef = useRef(restore)
  const first = useRef(true)
  const [notice, setNotice] = useState('')
  useEffect(() => { restoreRef.current = restore })
  const dirty = snapshot !== baseline

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(key)
      if (stored && stored !== baseline) {
        restoreRef.current(stored)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotice('Recovered unsaved changes from this browser session.')
      }
    } catch { setNotice('Draft recovery is unavailable. Save before leaving this page.') }
    // Recovery runs once per editor identity, not after every edit/save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (first.current) { first.current = false; return }
    try {
      if (snapshot === baseline) sessionStorage.removeItem(key)
      else sessionStorage.setItem(key, snapshot)
    } catch { /* The unload guard still warns when storage is unavailable. */ }
  }, [key, snapshot, baseline])

  useEffect(() => {
    if (!dirty) return
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', unload)
    return () => window.removeEventListener('beforeunload', unload)
  }, [dirty])

  function markSaved(value = snapshot) {
    setBaseline(value)
    try { sessionStorage.removeItem(key) } catch {}
    setNotice('')
  }
  return { notice, markSaved }
}
