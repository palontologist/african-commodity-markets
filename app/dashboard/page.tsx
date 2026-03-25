"use client";

import { useState, useEffect } from "react";
import { CooperativeService } from "@/lib/cooperative-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, ShieldCheck, AlertTriangle, Wallet, Loader2 } from "lucide-react";
import { ethers } from "ethers";

// The Contract Address (Base Mainnet)
const CONTRACT_ADDRESS = "0xc57fC9AF8DA52bC5DD96B03368582DBBe88F9E1a";
const CONTRACT_ABI = [
  "function createPrediction(string commodity, uint256 currentPrice, uint256 predictedPrice, uint256 targetDate, uint256 confidence, string model, bytes32 ipfsHash) external returns (uint256)",
  "function stake(uint256 predictionId, bool isYes, uint256 amount) external"
];

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    CooperativeService.getPortfolio("coop_123").then((data) => {
      setPortfolio(data);
      setLoading(false);
    });
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
      } catch (err) {
        console.error("Failed to connect wallet:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const handleInsure = async (asset: any) => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }

    setProcessing(asset.name);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // 1. Create a "Hedge" (Prediction) if one doesn't exist
      // In a real app, the Agent does this. For the demo, we trigger it here.
      const targetDate = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days from now
      const predictedPrice = Math.floor(asset.value * 0.95); // Predict 5% drop (Hedging)
      
      console.log("Creating Hedge Contract...");
      const tx = await contract.createPrediction(
        asset.name.split(" ")[0].toUpperCase(), // "COFFEE"
        Math.floor(asset.value),
        predictedPrice,
        targetDate,
        85, // Confidence
        "qwen/qwen3-32b",
        ethers.encodeBytes32String("ipfs_hash_placeholder")
      );

      await tx.wait();
      alert(`✅ Hedge Created! Transaction Hash: ${tx.hash}`);

    } catch (err) {
      console.error("Transaction failed:", err);
      alert("Transaction failed! Check console.");
    } finally {
      setProcessing(null);
    }
  };

  const handleBridge = async () => {
    setProcessing("BRIDGE");
    // Simulate bridging delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert("✅ Assets Bridged from Solana to Polygon Amoy! Liquidity is now available for hedging.");
    setProcessing(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-mono text-zinc-900">
      {/* Header */}
      <header className="mb-12 flex items-center justify-between border-b-4 border-zinc-900 pb-6">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase">
            Synthesis <span className="text-blue-600">Markets</span>
          </h1>
          <p className="mt-2 text-xl font-medium text-zinc-500">
            DeFi Risk Assurance for Real World Assets
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleBridge}
            className="h-14 border-4 border-blue-600 bg-blue-50 text-xl font-bold text-blue-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:bg-blue-100 hover:translate-y-[2px] hover:shadow-none"
            disabled={!!processing}
          >
            {processing === "BRIDGE" ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Bridging...
              </>
            ) : (
              "Bridge Assets"
            )}
          </Button>
          <Button 
            onClick={connectWallet}
            className="h-14 border-4 border-zinc-900 bg-white text-xl font-bold text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:translate-y-[2px] hover:shadow-none"
          >
            <Wallet className="mr-2 h-6 w-6" />
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
          </Button>
        </div>
      </header>

      {/* AI Insight Banner */}
      <div className="mb-12 bg-zinc-900 p-6 text-zinc-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-3 w-3 animate-pulse rounded-full bg-green-500" />
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-green-400">
              Agent Insight (Live)
            </h3>
            <p className="mt-2 text-2xl font-medium leading-tight">
              "Gold prices are nearing an all-time high ($2,400/oz). Consider locking in profits. 
              Coffee volatility is increasing due to weather reports in Brazil."
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <p>Loading assets...</p>
        ) : (
          portfolio.map((asset, idx) => (
            <Card key={idx} className="border-4 border-zinc-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              <CardHeader className="border-b-2 border-zinc-100 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-2 border-zinc-900 font-bold uppercase tracking-wider">
                    {asset.type}
                  </Badge>
                  {asset.trend === "UP" ? (
                    <ArrowUpRight className="h-6 w-6 text-green-600" />
                  ) : asset.trend === "DOWN" ? (
                    <ArrowDownRight className="h-6 w-6 text-red-600" />
                  ) : (
                    <div className="h-1 w-6 bg-zinc-300" />
                  )}
                </div>
                <CardTitle className="mt-4 text-3xl font-black uppercase tracking-tight">
                  {asset.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold uppercase text-zinc-400">Volume</p>
                    <p className="text-2xl font-bold">
                      {asset.quantity.toLocaleString()} <span className="text-lg text-zinc-500">{asset.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase text-zinc-400">Value (Est.)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${asset.value.toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Risk Indicator */}
                  <div className="flex items-center gap-2 rounded-md bg-zinc-100 p-2">
                    {asset.risk === "HIGH" ? (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                    )}
                    <span className="font-bold uppercase text-sm">
                      Risk: {asset.risk}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full border-2 border-zinc-900 bg-zinc-900 text-lg font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:bg-zinc-800 hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
                    onClick={() => handleInsure(asset)}
                    disabled={!!processing}
                  >
                    {processing === asset.name ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : asset.risk === "HIGH" ? (
                      "Insure Now"
                    ) : (
                      "Manage"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

