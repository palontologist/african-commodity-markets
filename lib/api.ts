// API client utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new ApiError(response.status, errorData.error || 'Request failed')
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error')
  }
}

// Market API functions
export const marketApi = {
  getMarkets: () => apiRequest<any[]>('/markets'),
  
  getMarket: (commodity: string) => 
    apiRequest<any>(`/markets?commodity=${commodity}`),
    
  getPredictions: (commodity: string) =>
    apiRequest<any>(`/markets/${commodity}/predictions`),
    
  createMarket: (data: any) =>
    apiRequest<any>('/markets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Trading API functions
export const tradingApi = {
  executeTrade: (data: any) =>
    apiRequest<any>('/trades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getTradeHistory: (userId?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (limit) params.append('limit', limit.toString())
    
    return apiRequest<any>(`/trades?${params.toString()}`)
  },
}

// Portfolio API functions
export const portfolioApi = {
  getPortfolio: (userId: string) =>
    apiRequest<any>(`/portfolio?userId=${userId}`),
    
  initializePortfolio: (userId: string) =>
    apiRequest<any>('/portfolio', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
    
  updatePortfolio: (userId: string) =>
    apiRequest<any>(`/portfolio?userId=${userId}`, {
      method: 'PATCH',
    }),
}

// Authentication API functions
export const authApi = {
  connectWallet: (walletAddress: string) =>
    apiRequest<any>('/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'connect',
        walletAddress,
      }),
    }),
    
  verifyToken: (token: string) =>
    apiRequest<any>('/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'verify',
        token,
      }),
    }),
    
  disconnectWallet: () =>
    apiRequest<any>('/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'disconnect',
      }),
    }),
    
  getDemoWallet: () =>
    apiRequest<any>('/auth?action=demo-wallet'),
    
  getAuthStats: () =>
    apiRequest<any>('/auth?action=stats'),
}

// Stats API functions
export const statsApi = {
  getOverview: () =>
    apiRequest<any>('/stats?type=overview'),
    
  getHistoricalData: (period: string = '7d') =>
    apiRequest<any>(`/stats?type=historical&period=${period}`),
    
  getCommodityPerformance: () =>
    apiRequest<any>('/stats?type=commodities'),
    
  getActiveMarkets: () =>
    apiRequest<any>('/stats?type=markets'),
    
  updateVolume: (amount: number) =>
    apiRequest<any>('/stats', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update-volume',
        data: { amount },
      }),
    }),
    
  updateTraders: () =>
    apiRequest<any>('/stats', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update-traders',
      }),
    }),
}