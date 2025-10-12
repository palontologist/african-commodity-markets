'use client'

import { useChain } from './chain-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ChainSelector() {
  const { activeChain, setActiveChain, isPolygon, isSolana } = useChain()
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Chain:</span>
      <div className="flex gap-1 p-1 bg-muted rounded-md">
        <Button
          size="sm"
          variant={isPolygon ? 'default' : 'ghost'}
          onClick={() => setActiveChain('polygon')}
          className="h-7 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPolygon ? 'bg-white' : 'bg-purple-500'}`} />
            Polygon
          </span>
        </Button>
        <Button
          size="sm"
          variant={isSolana ? 'default' : 'ghost'}
          onClick={() => setActiveChain('solana')}
          className="h-7 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSolana ? 'bg-white' : 'bg-blue-500'}`} />
            Solana
          </span>
        </Button>
      </div>
      {isPolygon && <Badge variant="outline" className="text-xs">USDC (ERC-20)</Badge>}
      {isSolana && <Badge variant="outline" className="text-xs">USDC (SPL)</Badge>}
    </div>
  )
}
