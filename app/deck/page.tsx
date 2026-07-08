import React from 'react'

export default function DeckPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 w-full h-full p-4 md:p-8">
        <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden">
          <iframe
            src="/afrifutures.pdf"
            className="w-full h-full border-none"
            title="Afrifutures Pitch Deck"
          />
        </div>
      </div>
    </div>
  )
}
