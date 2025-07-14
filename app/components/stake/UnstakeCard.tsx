"use client";

import { MemeButton } from "../ui/MemeButton";
import TokenData from "./TokenData";
import UnstakeReceiveCard from "./UnstakeReceiveCard";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import useNetworkStore from "@/store/useNetworkStore";
import { Separator } from "radix-ui";
import useStakeStore from "@/store/useStakeStore";
import toast, { Toaster } from "react-hot-toast";
import { redeemCash } from "@/lib/stake";
import { CASH_MINT } from "@/core/setting";

export default function UnstakeCard({ callback }: { callback: () => void }) {
  const {
    selectedToken,
    supportedUnstakeTokens,
    setSelectedToken,
    balance,
    isLoading,
  } = useStakeStore();
  const { currentNetwork } = useNetworkStore();
  const wallet = useAnchorWallet();
  const [unstakeAmount, setUnstakeAmount] = useState(balance);
  const [unstakeValue, setUnstakeValue] = useState(balance);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentPrice = 1;

  // Define stsvmUSD token for unstaking
  const stsvmUSDToken = {
    symbol: "stsvmUSD",
    mint: CASH_MINT.toBase58(),
    decimals: 6,
    isNative: false,
  };

  // Create connection using useMemo to prevent recreation on every render
  const connection = useMemo(() => {
    return new Connection(currentNetwork.rpcUrl, "confirmed");
  }, [currentNetwork.rpcUrl]);

  // Reset amount when token changes and fetch updated staked amount
  useEffect(() => {
    setUnstakeAmount(balance);
    setUnstakeValue(balance);
  }, [selectedToken, balance]);

  const handleUnstake = async () => {
    if (!wallet) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (unstakeAmount <= 0) {
        setError("Please enter a valid amount");
        return;
      }
      await redeemCash(
        // unstake
        wallet,
        connection,
        new PublicKey("3y53jbCNMgjbVLFDnw1KkD6TRnoXidaSo6KubxtR2HV1"),
        unstakeAmount,
      );
      toast.success("Unstake successful!");
      callback();
      setUnstakeAmount(0);
    } catch (error) {
      console.error("Error unstaking:", error);
      setError(
        error instanceof Error ? error.message : "Failed to unstake tokens",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-light dark:bg-[#0A0F1C] grid gap-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <Toaster position="top-right" />
      <section className="grid gap-4">
        <div className="relative bg-green-dark border-4 border-black px-3 py-2 rounded-3xl">
          <TokenData
            isUnstake
            symbol="stsvmUSD"
            amount={unstakeAmount}
            setAmount={setUnstakeAmount}
            value={unstakeValue}
            setValue={setUnstakeValue}
            currentPrice={currentPrice}
            balance={balance}
            loading={loading || isLoading}
            selectedToken={stsvmUSDToken}
            setSelectedToken={() => {}} // stsvmUSD is fixed, no need to change
            supportedTokens={supportedUnstakeTokens}
            hideSelector={true}
          />
          <div className="absolute bottom-[-30px] left-1/2 bg-[url('/swap.png')] bg-contain w-10 h-10 transform -translate-x-1/2" />
        </div>
        <UnstakeReceiveCard />
      </section>
      <div className="-mt-1 space-y-0">
        <div className="flex justify-between items-center text-gray-dark/70 font-medium">
          <span className=" dark:text-gray-400">Supply</span>
          <span className=" dark:text-gray-400">20M</span>
        </div>
        <div className="flex justify-between items-center text-gray-dark/70 font-medium">
          <span className="dark:text-gray-400">Current Price</span>
          <span className="font-bold ml-1">1 svmUSD = 1 USD</span>
        </div>
      </div>
      <Separator.Root className="bg-green-dark w-full h-1" />
      <MemeButton
        className="w-full bg-yellow-light hover:bg-yellow-dark border-black"
        onClick={handleUnstake}
        disabled={loading || unstakeAmount <= 0 || unstakeAmount > balance}
      >
        {loading ? "Processing..." : "Unstake"}
      </MemeButton>
    </div>
  );
}
