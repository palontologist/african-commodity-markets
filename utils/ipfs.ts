/**
 * IPFS upload utility
 * Uploads files to IPFS via a public gateway or Pinata if configured.
 * Returns the IPFS CID (Content Identifier) as a hex-encoded bytes32 string
 * suitable for use in the CommodityPoR smart contract.
 */

/**
 * Convert an IPFS CID string to a bytes32 hex string for the smart contract.
 * Takes the first 32 bytes of the UTF-8 encoded CID.
 */
export function cidToBytes32(cid: string): `0x${string}` {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(cid)
  const padded = new Uint8Array(32)
  padded.set(bytes.slice(0, 32))
  const hex = Array.from(padded)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `0x${hex}`
}

/**
 * Upload files to IPFS.
 * Uses Pinata if NEXT_PUBLIC_PINATA_JWT is set, otherwise falls back to
 * the public web3.storage / nft.storage compatible endpoint.
 *
 * @param files Array of File objects to upload
 * @returns IPFS CID string (e.g. "bafybeig...")
 */
export async function uploadToIPFS(files: File[]): Promise<string> {
  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT

  if (pinataJwt) {
    return uploadViaPinata(files, pinataJwt)
  }

  // Fallback: use the browser's built-in fetch to a public IPFS pinning service
  // In production, replace this with your preferred IPFS pinning service.
  throw new Error(
    'No IPFS gateway configured. Set NEXT_PUBLIC_PINATA_JWT in your environment variables.'
  )
}

async function uploadViaPinata(files: File[], jwt: string): Promise<string> {
  const formData = new FormData()

  if (files.length === 1) {
    formData.append('file', files[0])
  } else {
    // Multiple files: wrap in a directory
    for (const file of files) {
      formData.append('file', file, `commodity-proof/${file.name}`)
    }
  }

  const metadata = JSON.stringify({ name: `commodity-proof-${Date.now()}` })
  formData.append('pinataMetadata', metadata)
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Pinata upload failed: ${error}`)
  }

  const data: { IpfsHash: string } = await response.json()
  return data.IpfsHash
}
