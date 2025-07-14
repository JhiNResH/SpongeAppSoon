"use client";

import { MemeButton } from "../ui/MemeButton";
import TokenData from "./TokenData";
import ReceiveCard from "./ReceiveCard";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Separator } from "radix-ui";
import { useState, useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import useNetworkStore from "@/store/useNetworkStore";
import useStakeStore from "@/store/useStakeStore";
import { lendCash } from "@/lib/lendCash";
import toast, { Toaster } from "react-hot-toast";
import { CASH_MINT } from "@/core/setting";

export default function StakeCard({ callback }: { callback: () => void }) {
  const { currentNetwork } = useNetworkStore();
  const wallet = useAnchorWallet();
  const [stakeAmount, setStakeAmount] = useState(0);
  const [stakeValue, setStakeValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create connection using useMemo to prevent recreation on every render
  const connection = useMemo(() => {
    return new Connection(currentNetwork.rpcUrl, "confirmed");
  }, [currentNetwork.rpcUrl]);

  // Get token data from store
  const {
    selectedToken,
    supportedTokens,
    setSelectedToken,
    balance,
    setBalance,
    setStakedAmount,
    getTokenMint,
    isLoading,
  } = useStakeStore();

  // Define svmUSD token for staking
  const svmUSDToken = {
    symbol: "svmUSD",
    mint: CASH_MINT.toBase58(),
    decimals: 6,
    isNative: false,
  };

  const tokenSymbol = svmUSDToken.symbol;
  const currentPrice = svmUSDToken.decimals;

  const handleStakeToken = async () => {
    if (!wallet || !connection) {
      setError("Wallet not connected");
      return;
    }

    if (!stakeAmount || stakeAmount <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const signature = await lendCash(
        wallet,
        connection,
        new PublicKey("3y53jbCNMgjbVLFDnw1KkD6TRnoXidaSo6KubxtR2HV1"),
        stakeAmount,
      );

      toast.success("Stake successful!");
      setStakeAmount(0);
      callback();
    } catch (error) {
      console.error("Error staking tokens:", error);
      setError("Failed to stake tokens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-light dark:bg-[#0A0F1C] grid gap-4">
      <Toaster position="top-right" />
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <section className="grid gap-4">
        <div className="relative bg-green-dark border-4 border-black px-3 py-2 rounded-3xl">
          <TokenData
            symbol={tokenSymbol}
            amount={stakeAmount}
            setAmount={setStakeAmount}
            value={stakeValue}
            setValue={setStakeValue}
            currentPrice={currentPrice}
            balance={balance}
            loading={loading || isLoading}
            selectedToken={svmUSDToken}
            setSelectedToken={() => {}} // svmUSD is fixed, no need to change
            supportedTokens={[svmUSDToken]}
            hideSelector={true}
          />
          <div className="absolute bottom-[-30px] left-1/2 bg-[url('/swap.png')] bg-contain w-10 h-10 transform -translate-x-1/2" />
        </div>
        <ReceiveCard />
      </section>
      <div className="-mt-1 space-y-0">
        <div className="flex justify-between items-center text-gray-dark/70 font-medium dark:text-gray-400 ">
          <span className=" dark:text-gray-400">Supply</span>
          <span className=" dark:text-gray-400">20M</span>
        </div>
        <div className="flex justify-between items-center text-gray-dark/70 font-medium">
          <span className=" dark:text-gray-400">Projected APY</span>
          <span className=" dark:text-gray-400">8.49%</span>
        </div>
      </div>
      <Separator.Root className="bg-green-dark w-full h-1" />
      <MemeButton
        className="mt-0 w-full bg-yellow-light hover:bg-yellow-dark border-black"
        onClick={handleStakeToken}
        disabled={loading || stakeAmount <= 0}
      >
        {loading ? "Processing..." : "Stake"}
      </MemeButton>
    </div>
  );
}
