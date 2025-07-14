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
  hideSelector?: boolean;
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
  hideSelector,
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
        return "/usdc.png";
      case "USDT":
        return "/usdt.png";
      case "svmUSD":
        return "/cash.png";
      default:
        return "";
    }
  };

  return (
    <div className="grid gap-1">
      <section className="flex items-center justify-between">
        <div className="text-xs font-medium">{topText}</div>
        {selectedToken.symbol && !hideBalance ? (
          <div className="flex items-center gap-1/2">
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
          </div>
        ) : null}
      </section>
      <section className="flex items-center justify-between gap-2">
        {hideSelector ? (
          <div className="group flex items-center justify-between relative h-[45px] w-full rounded shadow-inner-green bg-green-light px-3.5 text-left text-black outline-none transition-colors duration-150 ease-linear focus-within:border-blue focus-within:shadow-field disabled:cursor-not-allowed disabled:bg-grey-hover disabled:text-grey-dark data-[state=open]:bg-grey-light data-[placeholder]:text-grey-dark data-[placeholder]:font-xl data-[placeholder]:font-medium disabled:data-[placeholder]:text-grey-tertiary min-w-[158px] max-w-[180px]">
            <div className="font-semibold flex items-center gap-2">
              <Image
                src={getTokenIcon(selectedToken.symbol)}
                alt={selectedToken.symbol}
                width={26}
                height={26}
                className="pointer-events-none"
              />
              <div className="grid gap-0 font-semibold leading-none">{selectedToken.symbol}</div>
            </div>
          </div>
        ) : (
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
        )}
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
      {showPercentage ? (
        <section
          className="flex items-center justify-end text-sm dark:text-gray-400"
        >
          <PercentageButtons balance={Math.min(maxAmount, balance)} setAmount={setAmount} />
        </section>
      ) : null}
    </div>
  );
}
