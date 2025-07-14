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
import { CASH_MINT, USDC_MINT, USDT_MINT } from "@/core/setting";

interface RedeemCardProps {
  callback?: () => void;
}

export default function RedeemCard({ callback }: RedeemCardProps) {
  const wallet = useAnchorWallet();
  const { currentNetwork, connected } = useNetworkStore();
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState(0);
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

  // Define svmUSD token for redeeming
  const svmUSDToken: TokenInfo = {
    symbol: "svmUSD",
    mint: CASH_MINT.toBase58(),
    decimals: 6,
    isNative: false,
  };

  // Define supported receive tokens (USDC, USDT)
  const supportedReceiveTokens: TokenInfo[] = [
    {
      symbol: "USDC",
      mint: USDC_MINT.toBase58(),
      decimals: 6,
      isNative: false,
    },
    {
      symbol: "USDT",
      mint: USDT_MINT.toBase58(),
      decimals: 6,
      isNative: false,
    },
  ];

  useEffect(() => {
    setRedeemAmount(0);
  }, [selectedToken.symbol]);

  useEffect(() => {
    setReceiveAmount(redeemAmount);
  }, [redeemAmount])

  useEffect(() => {
    setRedeemAmount(receiveAmount);
  }, [receiveAmount])

  // Set default receive token to USDC on component mount
  useEffect(() => {
    if (!selectedBuyToken.symbol) {
      setSelectedBuyToken(supportedReceiveTokens[0]); // Set USDC as default
    }
  }, []);

  const handleSelectReceiveToken = (token: TokenInfo) => {
    setSelectedBuyToken(token);
  }

  const handleRedeem = async () => {
    if (!wallet || !connection) {
      setError("Wallet not connected");
      return;
    }
    if (!selectedBuyToken.symbol) {
      setError('Select token to receive');
      return;
    }
    if (!selectedPool.mintB || !selectedPool.mintA) {
      setError('Pool is not ready, please try again');
      return;
    }
    const inputAmount = Math.round(redeemAmount);

    if (!inputAmount || inputAmount <= 0) {
      setError("Please enter a valid redeem amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);      
      const slippageMultiplier = (100 - parseFloat('1.0')) / 100;
      // 确保所有数值都被转换为整数
      const minOutputAmount = Math.round(
        receiveAmount * slippageMultiplier
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
      toast.success("Redeem successful!");
      callback?.();
      setRedeemAmount(0);
    } catch (error) {
      console.error('Redeem error', error)
      setError("Failed to redeem. Please try again.");
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
            topText="Selling"
            symbol="svmUSD"
            amount={redeemAmount}
            setAmount={setRedeemAmount}
            balance={balance || 0}
            maxAmount={maxAAmount}
            loading={loading || isLoading}
            selectedToken={svmUSDToken}
            setSelectedToken={() => {}} // svmUSD is fixed, no need to change
            supportedTokens={[svmUSDToken]}
            showPercentage
            hideSelector={true}
          />
          <div className="absolute bottom-[-30px] left-1/2 bg-[url('/swap.png')] bg-contain w-10 h-10 transform -translate-x-1/2" />
        </div>
        <div className="bg-green-dark border-4 border-black px-3 py-2 rounded-3xl">
          <TokenData
            isSwap
            hideBalance
            topText="Buying"
            symbol={selectedBuyToken.symbol || "Select token"}
            amount={receiveAmount}
            setAmount={setReceiveAmount}
            balance={(receiveAmount || 0) / Math.pow(10, 6)}
            maxAmount={maxAAmount}
            loading={loading || isLoading}
            selectedToken={selectedBuyToken}
            setSelectedToken={handleSelectReceiveToken}
            supportedTokens={supportedReceiveTokens}
          />
        </div>
      </section>
      <Separator.Root className="bg-green-dark w-full h-1" />
      <BottomBtn
        text="Redeem"
        loading={loading}
        connected={connected}
        handleClick={handleRedeem}
        disabled={loading || redeemAmount === 0}
      />
    </div>
  );
}
