const { ethers } = require("ethers");

const key = "f46ebb5e6a258959ce2026dba3e61a4e4aaf54666e2f01f97edfd7b811806123";
const wallet = new ethers.Wallet(key);
console.log(`Address: ${wallet.address}`);
