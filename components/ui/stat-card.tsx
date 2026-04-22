import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  className?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'default' | 'emerald' | 'cyan' | 'amber' | 'purple'
}

const colorClasses = {
  default: {
    icon: 'text-muted-foreground',
    bg: 'bg-muted',
  },
  emerald: {
    icon: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  cyan: {
    icon: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  amber: {
    icon: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  purple: {
    icon: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  trend,
  color = 'default',
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <Icon className={cn('h-5 w-5', colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  stats: StatCardProps[]
  className?: string
  columns?: 1 | 2 | 3 | 4
}

export function StatsGrid({ stats, className, columns = 4 }: StatsGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
