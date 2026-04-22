const { ethers } = require("ethers");

const wallets = [
  { name: "Wallet A (Oracle)", address: "0x1EA37E2Fb76Aa396072204C90fcEF88093CEb920" },
  { name: "Wallet B (Deployer)", address: "0xCfC37a6903837ea042D9595387a6501576c84E7D" }
];

const networks = [
  { name: "Base (L2)", rpc: "https://mainnet.base.org", symbol: "ETH" },
  { name: "Polygon Amoy (Testnet)", rpc: "https://rpc-amoy.polygon.technology", symbol: "POL" },
  { name: "Ethereum Mainnet (L1)", rpc: "https://eth.llamarpc.com", symbol: "ETH" }
];

async function main() {
  console.log("🔍 Scanning Wallets...\n");

  for (const net of networks) {
    console.log(`--- ${net.name} ---`);
    try {
      const provider = new ethers.JsonRpcProvider(net.rpc);
      // Test connection
      await provider.getNetwork(); 

      for (const wallet of wallets) {
        try {
          // Normalize address to fix checksum errors
          const normalizedAddress = ethers.getAddress(wallet.address);
          const balance = await provider.getBalance(normalizedAddress);
          const formatted = ethers.formatEther(balance);
          const symbol = net.symbol;
          
          // Only show non-zero or relevant zero balances
          if (balance > 0n) {
            console.log(`✅ ${wallet.name}: ${formatted} ${symbol}`);
          } else {
            console.log(`❌ ${wallet.name}: 0.00 ${symbol}`);
          }
        } catch (err) {
          // If normalization fails, try lowercasing as a fallback
          try {
             const lowerAddr = wallet.address.toLowerCase();
             const balance = await provider.getBalance(lowerAddr);
             console.log(`✅ ${wallet.name} (Fixed): ${ethers.formatEther(balance)} ${net.symbol}`);
          } catch (e2) {
             console.log(`⚠️ Error checking ${wallet.name}: ${err.message}`);
          }
        }
      }
    } catch (e) {
      console.log(`⚠️ Could not connect to ${net.name}: ${e.message}\n`);
    }
    console.log(""); // Empty line between networks
  }
}

main();
