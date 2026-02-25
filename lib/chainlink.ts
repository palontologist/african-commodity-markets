/**
 * Chainlink integration helpers
 *
 * Provides typed wrappers around the Chainlink PoR contract ABI for
 * use with wagmi / viem in the Next.js frontend.
 *
 * Usage:
 *   import { commodityPoRConfig } from '@/lib/chainlink'
 *   const { data } = useReadContract({ ...commodityPoRConfig, functionName: 'isVerified', args: [ipfsHashBytes32] })
 */

import CommodityPoRABI from '@/abis/CommodityPoR.json'

/**
 * Wagmi contract config for CommodityPoR.
 * The address is read from the NEXT_PUBLIC_POR_CONTRACT env variable.
 */
export const commodityPoRConfig = {
  address: (process.env.NEXT_PUBLIC_POR_CONTRACT ?? '') as `0x${string}`,
  abi: CommodityPoRABI,
} as const

/**
 * Chainlink PoR feed addresses for Polygon mainnet.
 * Reference: https://docs.chain.link/data-feeds/proof-of-reserve/addresses
 *
 * For commodity-specific PoR you will need to deploy a custom feed or
 * use one of the Chainlink partner integrations.
 */
export const CHAINLINK_POR_FEEDS = {
  polygon: {
    /** Wrapped Bitcoin Proof of Reserve (example – replace with your feed) */
    WBTC_POR: '0xBC36FdE44A7FD8f545d459452EF9539d7A14dd63',
  },
  polygonAmoy: {
    /** Use a custom deployed mock feed on the Amoy testnet */
    MOCK_POR: process.env.NEXT_PUBLIC_POR_FEED_ADDR ?? '',
  },
} as const
