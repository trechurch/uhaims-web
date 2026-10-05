import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Item {
  key: string           // primary identifier (also used as display name)
  description: string   // human-readable item name
  pack_type?: string    // e.g. "6/24/.5 oz"
  per?: string          // e.g. "Case"
  gl_name?: string      // category, e.g. "Dairy"
  cost?: number
  cost_center?: string
  record_status?: string
}

export interface PullSheet {
  id: number
  cost_center: string
  event_name?: string
  event_date?: string
  status: 'open' | 'submitted' | 'fulfilled'
  created_at: string
  created_by?: string
}

export interface PullSheetItem {
  id: number
  pull_sheet_id: number
  item_key: string
  quantity_requested: number
  quantity_fulfilled?: number
  notes?: string
  item?: Item
}

export interface ServiceTemplate {
  id: number
  name: string
  cost_center: string
  description?: string
}
