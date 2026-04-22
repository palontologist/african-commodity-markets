async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`\n💰 Wallet: ${deployer.address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} POL (Amoy)`);
}

main().catch(console.error);
