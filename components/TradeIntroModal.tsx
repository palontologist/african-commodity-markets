'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Handshake, Mail, Phone, MessageSquare, ShieldCheck } from 'lucide-react'

interface TradeIntroModalProps {
  open: boolean
  onClose: () => void
  deal: {
    id: number
    title: string
    askingPrice: number
    currency: string
    location?: string | null
  }
  inquiry: {
    id: number
    inquirerName?: string | null
    inquirerEmail: string
    inquirerPhone?: string | null
    message: string
    offerAmount?: number | null
  }
  /** Called when the seller confirms they want to proceed with this trade */
  onConfirm?: () => void
}

/**
 * TradeIntroModal
 * Displayed to the seller when they accept a buyer inquiry.
 * Shows the buyer's contact details and offer, and confirms the trade intro.
 */
export default function TradeIntroModal({
  open,
  onClose,
  deal,
  inquiry,
  onConfirm,
}: TradeIntroModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Handshake className="w-6 h-6 text-primary" />
            <DialogTitle>Trade Introduction</DialogTitle>
          </div>
          <DialogDescription>
            You are about to connect with a verified buyer for{' '}
            <strong>{deal.title}</strong>. Review their details below before
            proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Deal summary */}
          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Deal</p>
            <p className="font-semibold">{deal.title}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">
                {deal.currency} {deal.askingPrice.toLocaleString()}
              </span>
              {deal.location && (
                <Badge variant="outline" className="text-xs">
                  {deal.location}
                </Badge>
              )}
            </div>
          </div>

          {/* Buyer details */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Buyer</p>

            {inquiry.inquirerName && (
              <p className="font-semibold">{inquiry.inquirerName}</p>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a
                href={`mailto:${inquiry.inquirerEmail}`}
                className="text-primary underline"
              >
                {inquiry.inquirerEmail}
              </a>
            </div>

            {inquiry.inquirerPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{inquiry.inquirerPhone}</span>
              </div>
            )}

            {inquiry.offerAmount && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Offer:</span>
                <span className="font-semibold text-green-600">
                  {deal.currency} {inquiry.offerAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-muted-foreground">{inquiry.message}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
            <span>
              All sellers on this platform go through KYC verification. By
              proceeding you agree to our trade terms and conditions.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm?.()
              onClose()
            }}
          >
            <Handshake className="w-4 h-4 mr-2" />
            Confirm Trade Intro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
