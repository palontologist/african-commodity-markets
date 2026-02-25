'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { useWriteContract, useAccount } from 'wagmi'
import { uploadToIPFS, cidToBytes32 } from '@/utils/ipfs'
import CommodityPoRABI from '@/abis/CommodityPoR.json'

interface ProofUploaderProps {
  /** Identifier for the deal or lot this proof is for */
  dealId: string
  /** Claimed quantity in base units (e.g. kg × 10^3) */
  defaultQuantity?: number
  /** Called when a proof is successfully submitted and verified */
  onVerified?: (ipfsHash: string, quantity: number) => void
}

type Status = 'idle' | 'uploading' | 'submitting' | 'polling' | 'verified' | 'pending' | 'error'

/**
 * ProofUploader
 * Allows a seller to upload commodity certificates/photos to IPFS and
 * submit a Chainlink Proof of Reserve to the CommodityPoR smart contract.
 *
 * Requirements:
 *   - NEXT_PUBLIC_PINATA_JWT – Pinata JWT for IPFS uploads
 *   - NEXT_PUBLIC_POR_CONTRACT – deployed CommodityPoR contract address
 */
export default function ProofUploader({ dealId, defaultQuantity = 1000, onVerified }: ProofUploaderProps) {
  const { isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [ipfsHash, setIpfsHash] = useState('')
  const [quantity, setQuantity] = useState(defaultQuantity)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contractAddress = process.env.NEXT_PUBLIC_POR_CONTRACT as `0x${string}` | undefined

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (!isConnected) {
      setErrorMsg('Please connect your wallet first.')
      setStatus('error')
      return
    }
    if (!contractAddress) {
      setErrorMsg('NEXT_PUBLIC_POR_CONTRACT is not configured.')
      setStatus('error')
      return
    }
    if (files.length === 0) {
      setErrorMsg('Please select at least one file to upload.')
      setStatus('error')
      return
    }

    setErrorMsg('')

    try {
      // 1. Upload photos/certs to IPFS
      setStatus('uploading')
      const cid = await uploadToIPFS(files)
      setIpfsHash(cid)

      // 2. Submit to Chainlink PoR contract
      setStatus('submitting')
      const ipfsHashBytes32 = cidToBytes32(cid)

      await writeContractAsync({
        address: contractAddress,
        abi: CommodityPoRABI,
        functionName: 'submitProof',
        args: [ipfsHashBytes32, BigInt(quantity)],
      })

      // 3. Poll verification status via the API route
      setStatus('polling')
      const res = await fetch(`/api/por/${cid}`)
      const data: { verified: boolean; quantity: string } = await res.json()

      if (data.verified) {
        setStatus('verified')
        onVerified?.(cid, quantity)
      } else {
        setStatus('pending')
      }
    } catch (err) {
      console.error('ProofUploader error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setStatus('error')
    }
  }

  const statusConfig: Record<Status, { label: string; color: string }> = {
    idle: { label: 'Ready', color: 'outline' },
    uploading: { label: 'Uploading to IPFS…', color: 'secondary' },
    submitting: { label: 'Submitting to chain…', color: 'secondary' },
    polling: { label: 'Checking verification…', color: 'secondary' },
    verified: { label: 'PoR Verified ✓', color: 'default' },
    pending: { label: 'Pending Chainlink', color: 'outline' },
    error: { label: 'Error', color: 'destructive' },
  }

  const isLoading = ['uploading', 'submitting', 'polling'].includes(status)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <CardTitle>Chainlink Proof of Reserve</CardTitle>
        </div>
        <CardDescription>
          Upload commodity certificates or warehouse receipts to IPFS and submit
          a Chainlink Proof of Reserve for deal <strong>{dealId}</strong>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={statusConfig[status].color as 'default' | 'secondary' | 'outline' | 'destructive'}>
            {statusConfig[status].label}
          </Badge>
        </div>

        {/* Quantity input */}
        <div className="space-y-1">
          <Label htmlFor="por-qty">Claimed Quantity (base units)</Label>
          <Input
            id="por-qty"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            disabled={isLoading || status === 'verified'}
          />
          <p className="text-xs text-muted-foreground">
            E.g. 1200 = 1.2 metric tonnes (in kg). Must not exceed the Chainlink PoR reserve value.
          </p>
        </div>

        {/* File picker */}
        <div className="space-y-1">
          <Label>Proof Documents / Photos</Label>
          <div
            className="border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {files.length > 0
                ? `${files.length} file(s) selected`
                : 'Click or drop warehouse receipts, photos, or grade certificates'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading || status === 'verified'}
          />
        </div>

        {/* IPFS hash display */}
        {ipfsHash && (
          <div className="bg-muted rounded-md p-3 text-xs break-all">
            <span className="font-semibold">IPFS CID: </span>
            <a
              href={`https://ipfs.io/ipfs/${ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {ipfsHash}
            </a>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && (
          <div className="flex items-start gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success */}
        {status === 'verified' && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Proof of Reserve successfully verified on-chain.</span>
          </div>
        )}

        {/* Submit button */}
        <Button
          onClick={handleUpload}
          disabled={isLoading || status === 'verified' || files.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {statusConfig[status].label}
            </>
          ) : status === 'verified' ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Verified
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Submit Proof of Reserve
            </>
          )}
        </Button>

        {!isConnected && (
          <p className="text-xs text-center text-muted-foreground">
            Connect your wallet to submit a Proof of Reserve.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
