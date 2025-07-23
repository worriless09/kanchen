'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  HomeIcon, 
  BookOpenIcon, 
  RectangleStackIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/review', label: 'Review Cards', icon: BookOpenIcon },
  { href: '/flashcards', label: 'My Cards', icon: RectangleStackIcon },
  { href: '/tests', label: 'MCQ Tests', icon: DocumentTextIcon },
  { href: '/videos', label: 'Video Library', icon: PlayIcon },
  { href: '/analytics', label: 'Analytics', icon: ChartBarIcon },
  { href: '/profile', label: 'Profile', icon: UserIcon },
  { href: '/settings', label: 'Settings', icon: CogIcon }
]

export default function DesktopNavigation() {
  const pathname = usePathname()

  return (
    <nav className="desktop-nav lg:block md:block hidden">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-blue-600 lg:block md:hidden">
          Kanchen Academy
        </h1>
        <div className="w-8 h-8 bg-blue-600 rounded-lg lg:hidden md:block">
          <span className="text-white font-bold text-lg flex items-center justify-center h-full">
            K
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'desktop-nav-item',
                isActive && 'active'
              )}
            >
              <Icon className="w-5 h-5 mr-3 lg:block md:block" />
              <span className="lg:block md:hidden">{item.label}</span>
            </Link>
          )
        })}
      </div>
      
      <div className="mt-auto pt-8">
        <div className="p-4 bg-blue-50 rounded-lg lg:block md:hidden">
          <h3 className="font-medium text-blue-900 mb-2">Upgrade to Premium</h3>
          <p className="text-sm text-blue-700 mb-3">
            Unlock unlimited flashcards and AI features
          </p>
          <button className="w-full bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      </div>
    </nav>
  )
}
