'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, DollarSign, ArrowLeftRight, Settings } from 'lucide-react'

const sidebarLinks = [
  {
    route: '/',
    label: 'Home',
    icon: Home,
  },
  {
    route: '/my-banks',
    label: 'My Banks',
    icon: DollarSign,
  },
  {
    route: '/transaction-history',
    label: 'Transaction History',
    icon: ArrowLeftRight,
  },
  {
    route: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <section className="sidebar">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer items-center gap-2 flex">
          <h1 className="sidebar-logo">ManageNow</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)
          const Icon = item.icon
          
          return (
            <Link
              href={item.route}
              key={item.label}
              className={`sidebar-link ${isActive ? 'bg-blue-600 text-white' : ''}`}
            >
              <div className="relative size-6">
                <Icon className="w-6 h-6" />
              </div>
              <p className="sidebar-label">{item.label}</p>
            </Link>
          )
        })}
      </nav>

      <footer className="footer">
        <div className="footer_name">
          <p className="text-xl font-bold text-gray-700">U</p>
        </div>
        <div className="footer_email">
          <h1 className="text-14 truncate font-semibold text-gray-700">User</h1>
          <p className="text-14 truncate font-normal text-gray-600">user@email.com</p>
        </div>
      </footer>
    </section>
  )
}
