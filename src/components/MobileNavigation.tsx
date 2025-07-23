'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/review', label: 'Review', icon: '📚' },
  { href: '/flashcards', label: 'Cards', icon: '🃏' },
  { href: '/profile', label: 'Profile', icon: '👤' }
]

export default function MobileNavigation() {
  const pathname = usePathname()

  return (
    <nav className="mobile-nav md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'mobile-nav-item',
            pathname === item.href && 'active'
          )}
        >
          <span className="text-lg mb-1">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
