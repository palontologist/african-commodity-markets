import { ethers } from 'ethers'
import CommodityPoRABI from '@/abis/CommodityPoR.json'

export const dynamic = 'force-dynamic'

/**
 * GET /api/por/[hash]
 * Queries the CommodityPoR smart contract to check whether a given IPFS hash
 * has a verified Proof of Reserve.
 *
 * @param hash  The IPFS CID (will be converted to bytes32 for the contract call)
 */
export async function GET(
  _req: Request,
  { params }: { params: { hash: string } }
) {
  const { hash } = params

  const rpcUrl = process.env.POLYGON_RPC
  const contractAddr = process.env.POR_CONTRACT_ADDR

  if (!rpcUrl || !contractAddr) {
    return Response.json(
      { error: 'POLYGON_RPC or POR_CONTRACT_ADDR environment variables not set' },
      { status: 500 }
    )
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(contractAddr, CommodityPoRABI, provider)

    // Convert IPFS CID to bytes32 (first 32 UTF-8 bytes, zero-padded)
    const encoder = new TextEncoder()
    const bytes = encoder.encode(hash)
    const padded = new Uint8Array(32)
    padded.set(bytes.slice(0, 32))
    const ipfsHashBytes32 = `0x${Array.from(padded)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}`

    const reserveQty: bigint = await contract.reserves(ipfsHashBytes32)
    const quantity = reserveQty.toString()

    return Response.json({
      verified: reserveQty > 0n,
      quantity,
      ipfsHash: hash,
    })
  } catch (error) {
    console.error('PoR contract query failed:', error)
    return Response.json(
      { error: 'Failed to query PoR contract', details: String(error) },
      { status: 500 }
    )
  }
}
