import Link from 'next/link'

const modules = [
  {
    href: '/pull-sheets',
    label: 'Pull Sheets',
    icon: '📋',
    description: 'Create & manage event pull requests',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: '📦',
    description: 'Browse & count warehouse stock',
    color: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    href: '/par-levels',
    label: 'Par Levels',
    icon: '⚖️',
    description: 'Set min/max thresholds by location',
    color: 'bg-violet-600 hover:bg-violet-700',
  },
  {
    href: '/order-cycles',
    label: 'Order Cycles',
    icon: '🔄',
    description: 'Manage delivery & ordering schedules',
    color: 'bg-amber-600 hover:bg-amber-700',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">UHAIMS</h1>
          <p className="text-gray-400 mt-1 text-sm">
            UHA Inventory &amp; Asset Management System — TDECU Stadium
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {modules.map((mod) => (
            <Link key={mod.href} href={mod.href}>
              <div
                className={`${mod.color} rounded-2xl p-6 transition-all active:scale-95 cursor-pointer`}
              >
                <div className="text-4xl mb-3">{mod.icon}</div>
                <div className="text-xl font-semibold">{mod.label}</div>
                <div className="text-sm mt-1 text-white/70">{mod.description}</div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-12">
          Compass Group · TDECU Stadium · Fertitta Center
        </p>
      </div>
    </main>
  )
}
