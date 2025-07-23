'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DashboardStats {
  dueToday: number
  totalCards: number
  reviewsToday: number
  currentStreak: number
  weeklyGoal: number
  completionRate: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    dueToday: 0,
    totalCards: 0,
    reviewsToday: 0,
    currentStreak: 0,
    weeklyGoal: 50,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        
        // Calculate completion rate
        const completionRate = data.reviewsToday > 0 && data.dueToday > 0 
          ? Math.round((data.reviewsToday / (data.dueToday + data.reviewsToday)) * 100)
          : 0

        setStats({
          dueToday: data.due_today || 0,
          totalCards: data.total_cards || 0,
          reviewsToday: data.reviews_today || 0,
          currentStreak: data.current_streak || 0,
          weeklyGoal: 50,
          completionRate
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Due Today
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-red-600">
            {stats.dueToday}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Cards to review
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Cards
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalCards}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            In your collection
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Reviewed Today
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-600">
            {stats.reviewsToday}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Cards completed
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-orange-600">
            {stats.currentStreak}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Days in a row
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-purple-600">
            {stats.reviewsToday}/{stats.weeklyGoal}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This week&apos;s progress
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-indigo-600">
            {stats.completionRate}%
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Today&apos;s success
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
