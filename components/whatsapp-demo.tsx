"use client"

import { useState } from "react"
import { Send, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function WhatsAppDemo() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Welcome to African Commodity Markets! 🌍\nSend: PRICE [COMMODITY] [MARKET]" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg = { role: "user", text: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    // Simulate API delay
    setTimeout(async () => {
      try {
        // Call our API route (even if Twilio is mocked)
        const formData = new FormData()
        formData.append("Body", userMsg.text)
        formData.append("From", "whatsapp:+1234567890")

        const res = await fetch("/api/whatsapp", {
          method: "POST",
          body: formData,
        })
        
        const xmlText = await res.text()
        // Parse TwiML to get the message content
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "text/xml")
        const botReply = xmlDoc.getElementsByTagName("Message")[0]?.textContent || "Error processing request."

        setMessages(prev => [...prev, { role: "bot", text: botReply }])
      } catch (err) {
        setMessages(prev => [...prev, { role: "bot", text: "Error connecting to service." }])
      } finally {
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-[#ECE5DD] border-none shadow-xl">
      <CardHeader className="bg-[#075E54] text-white p-4 rounded-t-lg flex flex-row items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-lg">Commodity Bot</CardTitle>
          <p className="text-xs opacity-80">Online</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-[400px] overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-[#DCF8C6] self-end text-black"
                : "bg-white self-start text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="bg-white self-start p-3 rounded-lg text-sm text-gray-500 italic">
            Typing...
          </div>
        )}
      </CardContent>
      <div className="p-3 bg-[#F0F0F0] flex gap-2 rounded-b-lg">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="bg-white border-none focus-visible:ring-0"
        />
        <Button 
          onClick={handleSend} 
          className="bg-[#075E54] hover:bg-[#128C7E] text-white rounded-full w-10 h-10 p-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  )
}
