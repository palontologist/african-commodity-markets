"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TradingModal } from "@/components/trading-modal"

type HomeInlineTradeProps = {
  commodityName: string
  market: {
    id: number
    question: string
    yesPrice: number
    noPrice: number
    volume: string
    participants: number
    deadline: string
    description: string
  }
}

export function HomeInlineTrade({ commodityName, market }: HomeInlineTradeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialType, setInitialType] = useState<"yes" | "no">("yes")

  const openTrade = (type: "yes" | "no") => {
    setInitialType(type)
    setIsOpen(true)
  }

  return (
    <div className="flex items-center gap-3">
      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => openTrade("yes")}>
        Buy YES • ${market.yesPrice.toFixed(2)}
      </Button>
      <Button variant="destructive" className="flex-1" onClick={() => openTrade("no")}>
        Buy NO • ${market.noPrice.toFixed(2)}
      </Button>

      {isOpen && (
        <TradingModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          market={market}
          commodity={commodityName}
          initialTradeType={initialType}
        />
      )}
    </div>
  )
}

