'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase, type Item, type PullSheet } from '@/lib/supabase'

const COST_CENTERS = [
  'All Locations',
  'TDECU Main Concourse',
  'TDECU Club Level',
  'TDECU Suites',
  'Fertitta Center',
  'Team Dining',
  'Catering / FOC',
]

interface DraftLine {
  item: Item
  qty: number
}

export default function PullSheetsPage() {
  const [tab, setTab] = useState<'active' | 'new' | 'templates'>('active')
  const [costCenter, setCostCenter] = useState(COST_CENTERS[0])
  const [activePulls, setActivePulls] = useState<PullSheet[]>([])
  const [loading, setLoading] = useState(false)

  // New Pull state
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Item[]>([])
  const [draft, setDraft] = useState<DraftLine[]>([])
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  // Load active pull sheets
  useEffect(() => {
    const fetchActive = async () => {
      setLoading(true)
      let q = supabase.from('pull_sheets').select('*').eq('status','open').order('created_at',{ascending:false})
      if (costCenter !== 'All Locations') q = q.eq('cost_center', costCenter)
      const { data } = await q
      setActivePulls(data ?? [])
      setLoading(false)
    }
    fetchActive()
  }, [costCenter])

  // Live search — searches `description` column
  const handleSearch = useCallback(async (val: string) => {
    setSearch(val)
    if (val.trim().length < 2) { setSearchResults([]); return }
    const { data } = await supabase
      .from('items')
      .select('key, description, pack_type, per, gl_name, cost_center')
      .ilike('description', `%${val}%`)
      .eq('record_status', 'active')
      .limit(12)
    setSearchResults(data ?? [])
  }, [])

  // Draft helpers
  const addItem = (item: Item) => {
    setDraft((prev) => {
      const exists = prev.find((l) => l.item.key === item.key)
      if (exists) return prev.map((l) => l.item.key === item.key ? { ...l, qty: l.qty + 1 } : l)
      return [...prev, { item, qty: 1 }]
    })
    setSearch('')
    setSearchResults([])
  }

  const updateQty = (key: string, delta: number) =>
    setDraft((prev) => prev.map((l) => l.item.key === key ? { ...l, qty: Math.max(1, l.qty + delta) } : l))

  const removeLine = (key: string) => setDraft((prev) => prev.filter((l) => l.item.key !== key))

  // Submit pull sheet
  const submitPull = async () => {
    if (!draft.length) return
    setSubmitting(true)
    setSubmitMsg('')
    const cc = costCenter === 'All Locations' ? 'General' : costCenter
    const { data: ps, error } = await supabase
      .from('pull_sheets')
      .insert({ cost_center: cc, event_name: eventName || null, event_date: eventDate || null, status: 'open' })
      .select('id').single()
    if (error || !ps) {
      setSubmitMsg('❌ Error: ' + (error?.message ?? 'Unknown'))
      setSubmitting(false)
      return
    }
    const lines = draft.map((l) => ({ pull_sheet_id: ps.id, item_key: l.item.key, quantity_requested: l.qty }))
    await supabase.from('pull_sheet_items').insert(lines)
    setDraft([])
    setEventName('')
    setEventDate('')
    setSubmitMsg(`✅ Pull sheet #${ps.id} submitted!`)
    setSubmitting(false)
    const { data } = await supabase.from('pull_sheets').select('*').eq('status','open').order('created_at',{ascending:false})
    setActivePulls(data ?? [])
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/" className="text-gray-400 hover:text-white text-2xl">←</Link>
          <div>
            <h1 className="text-2xl font-bold">Pull Sheets</h1>
            <p className="text-gray-400 text-sm">Create and track event pull requests</p>
          </div>
        </div>

        {/* Cost Center */}
        <select value={costCenter} onChange={(e) => setCostCenter(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-5 text-sm">
          {COST_CENTERS.map((cc) => <option key={cc}>{cc}</option>)}
        </select>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-6">
          {(['active','new','templates'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all
                ${tab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t === 'new' ? '+ New Pull' : t === 'active' ? 'Active' : 'Templates'}
            </button>
          ))}
        </div>

        {/* ACTIVE TAB */}
        {tab === 'active' && (
          <div>
            {loading && <p className="text-gray-500 text-sm">Loading…</p>}
            {!loading && activePulls.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-400">No open pull sheets</p>
                <button onClick={() => setTab('new')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl text-sm font-medium">
                  Create one
                </button>
              </div>
            )}
            <div className="space-y-3">
              {activePulls.map((ps) => (
                <div key={ps.id} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{ps.event_name || `Pull #${ps.id}`}</div>
                      <div className="text-sm text-gray-400 mt-1">{ps.cost_center}</div>
                      {ps.event_date && <div className="text-xs text-gray-500 mt-1">📅 {ps.event_date}</div>}
                    </div>
                    <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded-lg">{ps.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{new Date(ps.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW PULL TAB */}
        {tab === 'new' && (
          <div>
            <div className="space-y-3 mb-5">
              <input value={eventName} onChange={(e) => setEventName(e.target.value)}
                placeholder="Event name (optional)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500" />
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white" />
            </div>

            {/* Live search */}
            <div className="relative mb-2">
              <input value={search} onChange={(e) => handleSearch(e.target.value)}
                placeholder="🔍 Type to search items…"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500" />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-xl mt-1 max-h-64 overflow-y-auto shadow-2xl">
                  {searchResults.map((item) => (
                    <button key={item.key} onClick={() => addItem(item)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0">
                      <div className="font-medium text-sm">{item.description}</div>
                      <div className="text-xs text-gray-400">{item.pack_type ?? item.per ?? '—'} · {item.gl_name ?? '—'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Draft list */}
            {draft.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Pull List ({draft.length} item{draft.length !== 1 ? 's' : ''})</div>
                {draft.map((line) => (
                  <div key={line.item.key} className="bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-800">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{line.item.description}</div>
                      <div className="text-xs text-gray-400">{line.item.pack_type ?? line.item.per ?? '—'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(line.item.key, -1)}
                        className="w-9 h-9 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold flex items-center justify-center">−</button>
                      <span className="w-8 text-center font-semibold text-lg">{line.qty}</span>
                      <button onClick={() => updateQty(line.item.key, 1)}
                        className="w-9 h-9 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold flex items-center justify-center">+</button>
                      <button onClick={() => removeLine(line.item.key)}
                        className="w-9 h-9 bg-red-900/50 hover:bg-red-800 rounded-lg text-sm flex items-center justify-center">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {draft.length > 0 && (
              <div className="mt-6">
                {submitMsg && <p className="text-sm mb-3 text-center">{submitMsg}</p>}
                <button onClick={submitPull} disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95">
                  {submitting ? 'Submitting…' : `Submit Pull (${draft.length} item${draft.length !== 1 ? 's' : ''})`}
                </button>
              </div>
            )}
            {draft.length === 0 && !search && (
              <p className="text-center text-gray-600 text-sm mt-8">Search for items above to build your pull list</p>
            )}
          </div>
        )}

        {/* TEMPLATES TAB */}
        {tab === 'templates' && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🗂️</div>
            <p className="text-gray-400">Templates coming soon</p>
          </div>
        )}
      </div>
    </main>
  )
}
