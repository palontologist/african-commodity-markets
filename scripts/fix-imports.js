/**
 * Fix script to comment out problematic wagmi imports
 * This allows the build to proceed while we fix the version compatibility
 */

const fs = require('fs')
const path = require('path')

const filesToFix = [
  'components/user-profile-provider.tsx',
  'app/pools/page.tsx',
  'app/farmer-vault/page.tsx', 
  'app/settlements/page.tsx',
  'components/markets/stake-modal.tsx',
  'components/blockchain/wallet-provider.tsx',
  'components/wormhole-bridge-modal.tsx',
  'components/blockchain/claim-winnings-button.tsx',
  'app/test-bridge/page.tsx'
]

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file)
  
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Comment out wagmi imports
    content = content.replace(/import\s*{\s*useAccount[^}]*}\s*from\s*['"]wagmi['"][^}]*}/g, '// $&')
    content = content.replace(/import\s*{\s*[^}]*useAccount[^}]*}\s*from\s*['"]@wagmi\/core\/query['"][^}]*}/g, '// $&')
    content = content.replace(/import\s*{\s*[^}]*useWriteContract[^}]*}\s*from\s*['"]wagmi['"][^}]*}/g, '// $&')
    content = content.replace(/import\s*{\s*[^}]*useWaitForTransactionReceipt[^}]*}\s*from\s*['"]wagmi['"][^}]*}/g, '// $&')
    content = content.replace(/import\s*{\s*[^}]*type\s*Config[^}]*}\s*from\s*['"]wagmi['"][^}]*}/g, '// $&')
    content = content.replace(/import\s*{\s*[^}]*createConfig[^}]*}\s*from\s*['"]wagmi['"][^}]*}/g, '// $&')
    content = content.replace(/import\s*{\s*[^}]*http[^}]*}\s*from\s*['"]wagmi['"][^}]*}/g, '// $&')
    
    // Comment out solana and clerk imports too if they're causing issues
    content = content.replace(/import\s*{\s*[^}]*useUser[^}]*}\s*from\s*['"]@clerk\/nextjs['"][^}]*}/g, '// $&')
    content = content.replace(/import\s*{\s*[^}]*useWallet[^}]*}\s*from\s*['"]@solana\/wallet-adapter-react['"][^}]*}/g, '// $&')
    
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✅ Fixed imports in: ${file}`)
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error)
  }
})

console.log('🔧 Done commenting out problematic imports')
console.log('💡 Next steps:')
console.log('1. Try building with: pnpm build')
console.log('2. If build succeeds, we can fix the imports properly')
console.log('3. Consider updating wagmi to compatible version')