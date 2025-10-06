/**
 * Background Scheduler for Commodity Predictions
 * Runs periodic price predictions for all commodities
 */

import { generatePrediction } from './agent'
import type { CommoditySymbol, Region } from '@/lib/live-prices'

// Simple console logger fallback
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error),
  success: (msg: string, ...args: any[]) => console.log(`[SUCCESS] ${msg}`, ...args)
}

export type ScheduleInterval = 'hourly' | 'daily' | 'weekly'

interface SchedulerConfig {
  interval: ScheduleInterval
  commodities: CommoditySymbol[]
  regions: Region[]
  enabled: boolean
}

const DEFAULT_CONFIG: SchedulerConfig = {
  interval: 'daily',
  commodities: ['COCOA', 'COFFEE', 'TEA', 'GOLD', 'AVOCADO', 'MACADAMIA'],
  regions: ['AFRICA', 'LATAM'],
  enabled: false // Disabled by default, enable via environment variable
}

/**
 * Convert interval to milliseconds
 */
function intervalToMs(interval: ScheduleInterval): number {
  switch (interval) {
    case 'hourly':
      return 60 * 60 * 1000 // 1 hour
    case 'daily':
      return 24 * 60 * 60 * 1000 // 24 hours
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}

/**
 * Scheduler instance
 */
class CommodityPredictionScheduler {
  private config: SchedulerConfig
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  
  constructor(config?: Partial<SchedulerConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      enabled: config?.enabled ?? process.env.ENABLE_PREDICTION_SCHEDULER === 'true'
    }
  }
  
  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Scheduler already running')
      return
    }
    
    if (!this.config.enabled) {
      logger.info('Prediction scheduler is disabled. Set ENABLE_PREDICTION_SCHEDULER=true to enable.')
      return
    }
    
    const intervalMs = intervalToMs(this.config.interval)
    
    logger.info(`Starting prediction scheduler with ${this.config.interval} interval`)
    logger.info(`Tracking ${this.config.commodities.length} commodities across ${this.config.regions.length} regions`)
    
    // Run immediately on start
    this.runPredictionCycle().catch(error => {
      logger.error('Error in initial prediction cycle:', error)
    })
    
    // Then run on interval
    this.intervalId = setInterval(() => {
      this.runPredictionCycle().catch(error => {
        logger.error('Error in scheduled prediction cycle:', error)
      })
    }, intervalMs)
    
    this.isRunning = true
    logger.success('Prediction scheduler started')
  }
  
  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      logger.warn('Scheduler not running')
      return
    }
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    this.isRunning = false
    logger.success('Prediction scheduler stopped')
  }
  
  /**
   * Run a complete prediction cycle for all commodities and regions
   */
  private async runPredictionCycle(): Promise<void> {
    logger.info('Starting prediction cycle...')
    const startTime = Date.now()
    
    let successCount = 0
    let errorCount = 0
    
    for (const commodity of this.config.commodities) {
      for (const region of this.config.regions) {
        try {
          // Generate short-term prediction using simplified agent
          await generatePrediction({
            symbol: commodity,
            region,
            horizon: 'SHORT_TERM'
          })
          
          successCount++
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          logger.error(`Failed to generate prediction for ${commodity} (${region}):`, error)
          errorCount++
        }
      }
    }
    
    const duration = Date.now() - startTime
    logger.success(
      `Prediction cycle completed in ${(duration / 1000).toFixed(1)}s: ${successCount} successful, ${errorCount} errors`
    )
  }
  
  /**
   * Get scheduler status
   */
  getStatus(): {
    enabled: boolean
    running: boolean
    interval: ScheduleInterval
    commoditiesCount: number
    regionsCount: number
  } {
    return {
      enabled: this.config.enabled,
      running: this.isRunning,
      interval: this.config.interval,
      commoditiesCount: this.config.commodities.length,
      regionsCount: this.config.regions.length
    }
  }
  
  /**
   * Update scheduler configuration
   */
  updateConfig(config: Partial<SchedulerConfig>): void {
    const wasRunning = this.isRunning
    
    if (wasRunning) {
      this.stop()
    }
    
    this.config = {
      ...this.config,
      ...config
    }
    
    logger.info(`Scheduler configuration updated: ${JSON.stringify(this.config)}`)
    
    if (wasRunning && this.config.enabled) {
      this.start()
    }
  }
}

/**
 * Global scheduler instance
 */
let schedulerInstance: CommodityPredictionScheduler | null = null

/**
 * Get or create the scheduler instance
 */
export function getScheduler(config?: Partial<SchedulerConfig>): CommodityPredictionScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new CommodityPredictionScheduler(config)
  }
  return schedulerInstance
}

/**
 * Start the global scheduler
 */
export function startScheduler(config?: Partial<SchedulerConfig>): void {
  const scheduler = getScheduler(config)
  scheduler.start()
}

/**
 * Stop the global scheduler
 */
export function stopScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop()
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return schedulerInstance?.getStatus() ?? {
    enabled: false,
    running: false,
    interval: 'daily' as ScheduleInterval,
    commoditiesCount: 0,
    regionsCount: 0
  }
}

export default {
  getScheduler,
  startScheduler,
  stopScheduler,
  getSchedulerStatus
}
