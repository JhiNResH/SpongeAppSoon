"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Separator } from "radix-ui";
import { useState, useMemo, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import useNetworkStore from "@/store/useNetworkStore";
import TokenData from "./TokenData";
import toast, { Toaster } from "react-hot-toast";
import { BottomBtn } from "./BottomBtn";
import useSwapStore, { TokenInfo } from "@/store/useSwapStore";
import { PoolInfo } from "@/lib/getPoolList";
import { swap } from "@/lib/swap";

interface SwapCardProps {
  callback?: () => void;
}

export default function SwapCard({ callback }: SwapCardProps) {
  const wallet = useAnchorWallet();
  const { currentNetwork, connected } = useNetworkStore();
  const [swapAmount, setSwapAmount] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create connection using useMemo to prevent recreation on every render
  const connection = useMemo(() => {
    return new Connection(currentNetwork.rpcUrl, "confirmed");
  }, [currentNetwork.rpcUrl]);

  const {
    pools,
    selectedToken,
    supportedTokens,
    setSelectedToken,
    balance,
    maxAAmount,
    isLoading,
    selectedPool,
    setSelectedPool,
    setMaxAAmount,
    selectedBuyToken,
    supportedBuyTokens,
    setSelectedBuyToken,
  } = useSwapStore();

  useEffect(() => {
    setSwapAmount(0);
  }, [selectedToken.symbol]);

  useEffect(() => {
    setBuyAmount(swapAmount);
  }, [swapAmount])

  useEffect(() => {
    setSwapAmount(buyAmount);
  }, [buyAmount])

  const tokenSymbol = selectedToken.symbol;

  const handleSelectToken = (token: TokenInfo) => {
    setSelectedToken(token);
    const pool = pools.find(pool => pool.displayName === token.symbol);
    setSelectedPool(pool ?? {} as PoolInfo);
    const max = pool?.tokenAAmount ? Number(pool?.tokenAAmount) : 0;
    setMaxAAmount(max);
  }

  const handleSwap = async () => {
    if (!wallet || !connection) {
      setError("Wallet not connected");
      return;
    }
    if (!selectedToken.symbol) {
      setError('Select a token');
      return;
    }
    if (!selectedBuyToken.symbol) {
      setError('Select buying token');
      return;
    }
    if (!selectedPool.mintB || !selectedPool.mintA) {
      setError('Pool is not ready, please try again');
      return;
    }
    const inputAmount = Math.round(swapAmount);

    if (!inputAmount || inputAmount <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);      
      const slippageMultiplier = (100 - parseFloat('1.0')) / 100;
      // 确保所有数值都被转换为整数
      const minOutputAmount = Math.round(
        buyAmount * slippageMultiplier
      );
      await swap(
        wallet,
        connection,
        new PublicKey(selectedPool.poolPk),
        new PublicKey(selectedPool.amm),
        new PublicKey(selectedPool.mintA),
        new PublicKey(selectedPool.mintB),
        false,
        inputAmount,
        minOutputAmount,
      )
      toast.success("Swap successful!");
      callback?.();
      setSwapAmount(0);
    } catch (error) {
      console.error('Swap error', error)
      setError("Failed to swap. Please try again.");
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
            isSwap
            topText="Wallet balance"
            symbol={tokenSymbol}
            amount={swapAmount}
            setAmount={setSwapAmount}
            balance={balance || 0}
            maxAmount={maxAAmount}
            loading={loading || isLoading}
            selectedToken={selectedToken}
            setSelectedToken={handleSelectToken}
            supportedTokens={supportedTokens}
            showPercentage
          />
          <div className="absolute bottom-[-30px] left-1/2 bg-[url('/swap.png')] bg-contain w-10 h-10 transform -translate-x-1/2" />
        </div>
        <div className="bg-green-dark border-4 border-black px-3 py-2 rounded-3xl">
          <TokenData
            isSwap
            hideBalance
            topText="Buying"
            symbol={tokenSymbol}
            amount={buyAmount}
            setAmount={setBuyAmount}
            balance={(buyAmount || 0) / Math.pow(10, 6)}
            maxAmount={maxAAmount}
            loading={loading || isLoading}
            selectedToken={selectedBuyToken}
            setSelectedToken={setSelectedBuyToken}
            supportedTokens={supportedBuyTokens}
          />
        </div>
      </section>
      <Separator.Root className="bg-green-dark w-full h-1" />
      <BottomBtn
        text="Swap"
        loading={loading}
        connected={connected}
        handleClick={handleSwap}
        disabled={loading || swapAmount === 0}
      />
    </div>
  );
}
