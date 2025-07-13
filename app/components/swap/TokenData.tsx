"use client";
import { Input } from "../ui/Input";
import React from "react";
import Image from "next/image";
import { TokenInfo } from "@/store/useTokenStore";
import { Select, SelectItem } from "../ui/Select";
import PercentageButtons from "../ui/PercentageButtons";
import { Spinner } from "../ui/Spinner";

interface TokenDataProps {
  isSwap?: boolean;
  topText?: string;
  symbol: string;
  amount: number;
  hideBalance?: boolean;
  setAmount: (amount: number) => void;
  balance: number;
  loading: boolean;
  maxAmount: number;
  selectedToken: TokenInfo;
  setSelectedToken: (token: TokenInfo) => void;
  supportedTokens: TokenInfo[];
  showPercentage?: boolean;
}

export default function TokenData({
  isSwap,
  topText,
  amount,
  setAmount,
  balance,
  loading,
  maxAmount,
  hideBalance,
  selectedToken,
  setSelectedToken,
  supportedTokens,
  showPercentage,
}: TokenDataProps) {
  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "SOL":
        return "/solana.png";
      case "USDC":
        return "./usdc.png";
      case "USDT":
        return "./usdt.svg";
      case "svmUSD":
        return "/cash.png";
      default:
        return "";
    }
  };

  return (
    <div className="grid gap-1">
      {selectedToken.symbol ? (
        <section className="flex items-center justify-between">
          <div className="text-xs font-medium">{topText}</div>
          {hideBalance ? null : <div className="flex items-center gap-1/2">
            {loading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <span className="font-medium ml-1 text-xs">
                {parseFloat(balance?.toFixed(5))}
              </span>
            )}
            <span className="ml-1 text-xs">
              {isSwap ? selectedToken.symbol : ""}
            </span>
          </div>}
        </section>
      ) : null}
      <section className="flex items-center justify-between gap-2">
        <Select
          className="min-w-[158px] max-w-[180px] rounded-md"
          placeholder="Select token"
          onValueChange={(value) => {
            const newToken = supportedTokens.find((t) => t.symbol === value)!;
            setSelectedToken(newToken);
          }}
        >
          {supportedTokens.map((token) => (
            <SelectItem key={token.symbol} value={token.symbol}>
              <div className="flex items-center gap-2 font-semibold leading-none">
                <Image
                  src={getTokenIcon(token.symbol)}
                  alt={token.symbol}
                  width={26}
                  height={26}
                  className="pointer-events-none"
                />
                <div className="grid gap-0">{token.symbol}</div>
              </div>
            </SelectItem>
          ))}
        </Select>
        <Input
          id="stake-amount"
          type="number"
          value={amount}
          disabled={!isSwap || loading}
          onFocus={(e) => {
            if (e.target.value === "0") setAmount("" as unknown as number);
          }}
          onBlur={(e) => {
            if (e.target.value.trim() === "") setAmount(0);
          }}
          onChange={(e) => {
            const newAmount = parseFloat(e.target.value);
            setAmount(isNaN(newAmount) ? 0 : newAmount);
          }}
          className="text-right text-xl"
        />
      </section>
      {selectedToken.symbol ? (
        <section
          className={
            showPercentage
              ? "flex items-center justify-end text-sm dark:text-gray-400"
              : "hidden"
          }
        >
          <PercentageButtons balance={Math.min(maxAmount, balance)} setAmount={setAmount} />
        </section>
      ) : null}
    </div>
  );
}
