// Shared data store for the application
// In production, this would be replaced with a proper database

// Create global stores that persist in memory
declare global {
  var __userPortfolios: Record<string, any> | undefined
  var __transactionHistory: any[] | undefined
  var __users: Record<string, any> | undefined
  var __platformStats: any | undefined
}

// Initialize global stores if they don't exist
if (!global.__userPortfolios) {
  global.__userPortfolios = {}
}
if (!global.__transactionHistory) {
  global.__transactionHistory = []
}
if (!global.__users) {
  global.__users = {}
}
if (!global.__platformStats) {
  global.__platformStats = {
    totalVolume: 5540000, // $5.54M
    activeMarkets: 12,
    totalTraders: 2847,
    averageReturn: 12.4,
    last24hVolume: 890000, // $890K
    last24hTrades: 156,
    topPerformingCommodity: 'avocado',
    mostActiveCommodity: 'coffee',
    marketSentiment: 'bullish', // bullish, bearish, neutral
    lastUpdated: new Date().toISOString(),
  }
}

// Export references to global stores
export const userPortfolios = global.__userPortfolios
export const transactionHistory = global.__transactionHistory
export const users = global.__users
export const platformStats = global.__platformStats

// Market predictions data
export const marketPredictions = {
  tea: [
    {
      id: 1,
      question: "Will Kenya Tea Board auction average exceed $2.50/kg by Jan 15, 2025?",
      yesPrice: 0.67,
      noPrice: 0.33,
      volume: "$450K",
      participants: 156,
      deadline: "Jan 15, 2025",
      description: "Based on CTC BOP grade tea from Mombasa auctions",
      status: "active",
      totalVolume: 450000,
      yesShares: 295000,
      noShares: 155000,
    },
    {
      id: 2,
      question: "Will Tanzania Tea Board report >85% Grade 1 tea by Feb 1, 2025?",
      yesPrice: 0.42,
      noPrice: 0.58,
      volume: "$380K",
      participants: 98,
      deadline: "Feb 1, 2025",
      description: "Quality grade percentage from Tanzania Tea Board monthly reports",
      status: "active",
      totalVolume: 380000,
      yesShares: 159600,
      noShares: 220400,
    },
  ],
  coffee: [
    {
      id: 1,
      question: "Will Ethiopian coffee average SCA score exceed 85 by Mar 20, 2025?",
      yesPrice: 0.73,
      noPrice: 0.27,
      volume: "$1.1M",
      participants: 234,
      deadline: "Mar 20, 2025",
      description: "Based on Ethiopian Commodity Exchange specialty coffee auctions",
      status: "active",
      totalVolume: 1100000,
      yesShares: 803000,
      noShares: 297000,
    },
    {
      id: 2,
      question: "Will Kenyan AA coffee price exceed $6.00/lb by Feb 28, 2025?",
      yesPrice: 0.38,
      noPrice: 0.62,
      volume: "$890K",
      participants: 189,
      deadline: "Feb 28, 2025",
      description: "Nairobi Coffee Exchange auction prices for AA grade",
      status: "active",
      totalVolume: 890000,
      yesShares: 338200,
      noShares: 551800,
    },
  ],
  avocado: [
    {
      id: 1,
      question: "Will Kenya avocado exports exceed 50,000 tons by Apr 30, 2025?",
      yesPrice: 0.55,
      noPrice: 0.45,
      volume: "$520K",
      participants: 123,
      deadline: "Apr 30, 2025",
      description: "Based on Kenya Plant Health Inspectorate Service export data",
      status: "active",
      totalVolume: 520000,
      yesShares: 286000,
      noShares: 234000,
    },
  ],
  macadamia: [
    {
      id: 1,
      question: "Will South African macadamia price exceed $13.00/kg by May 15, 2025?",
      yesPrice: 0.61,
      noPrice: 0.39,
      volume: "$650K",
      participants: 145,
      deadline: "May 15, 2025",
      description: "Based on South African Macadamia Growers Association pricing",
      status: "active",
      totalVolume: 650000,
      yesShares: 396500,
      noShares: 253500,
    },
  ],
}

// Mock market prices for calculating current values
export const currentMarketPrices = {
  'tea_1_yes': 0.67,
  'tea_1_no': 0.33,
  'tea_2_yes': 0.42,
  'tea_2_no': 0.58,
  'coffee_1_yes': 0.73,
  'coffee_1_no': 0.27,
  'coffee_2_yes': 0.38,
  'coffee_2_no': 0.62,
  'avocado_1_yes': 0.55,
  'avocado_1_no': 0.45,
  'macadamia_1_yes': 0.61,
  'macadamia_1_no': 0.39,
}