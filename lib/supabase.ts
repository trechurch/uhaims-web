import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Item {
  id: number
  name: string
  unit: string
  category?: string
  par_level?: number
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
  item_id: number
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
