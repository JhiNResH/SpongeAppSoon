"use client";
import { Input } from "../ui/Input";
import React, { useEffect } from "react";
import Image from "next/image";
import { TokenInfo } from "@/store/useTokenStore";
import { Select, SelectItem } from "../ui/Select";
import PercentageButtons from "../ui/PercentageButtons";
import { Spinner } from "../ui/Spinner";
import { getMockQuote } from "@/lib/borrow";

interface TokenDataProps {
  isBorrow?: boolean;
  symbol: string;
  amount: number;
  setAmount: (amount: number) => void;
  balance: number;
  loading: boolean;
  selectedToken: TokenInfo;
  setSelectedToken: (token: TokenInfo) => void;
  supportedTokens: TokenInfo[];
}

export default function TokenData({
  isBorrow,
  symbol,
  amount,
  setAmount,
  balance,
  loading,
  selectedToken,
  setSelectedToken,
  supportedTokens,
}: TokenDataProps) {
  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "ETH":
        return "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png";
      case "SOL":
        return "/solana_token.png";
      case "JupSOL":
        return "/jupsol.png";
      case "JitoSOL":
        return "/jitosol.png";
      case "BNSOL":
        return "/bnsol.png";
      default:
        return "";
    }
  };

  return (
    <div>
      <div className="grid gap-1">
        <section className="flex items-center justify-between">
          <div className="text-xs font-medium">
            {isBorrow ? "You supply: " : "You withdraw: "}
          </div>
        </section>
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
                  <div className="grid gap-0">
                    {token.symbol}
                    {isBorrow ? (
                      <div className="text-xs font-normal text-green-lightest">
                        8% APY
                      </div>
                    ) : null}
                  </div>
                </div>
              </SelectItem>
            ))}
          </Select>
          <Input
            id="stake-amount"
            type="number"
            value={amount}
            disabled={!isBorrow || loading}
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
        <section className="mt-1 flex items-center justify-between text-sm dark:text-gray-400">
          <p className="font-medium">
            {isBorrow ? "Max borrow " : "Available to withdraw "}:
          </p>
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-1">
              {loading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <span className="font-bold ml-1">
                  {parseFloat(balance.toFixed(5))}
                </span>
              )}
              <span className="ml-1">
                {isBorrow ? selectedToken.symbol : ""}
              </span>
            </div>
            <PercentageButtons
              balance={isBorrow ? getMockQuote(balance) : balance}
              setAmount={setAmount}
              disabled={!isBorrow}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
