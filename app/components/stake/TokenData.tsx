"use client";
import { Input } from "../ui/Input";
import React, { useEffect } from "react";
import Image from "next/image";
import { TokenInfo } from "@/store/useTokenStore";
import { Select, SelectItem } from "../ui/Select";
import { Spinner } from "../ui/Spinner";
import { formatAmount } from "@/lib/amount";
import PercentageButtons from "../ui/PercentageButtons";

interface TokenDataProps {
  isUnstake?: boolean;
  symbol: string;
  amount: number;
  setAmount: (amount: number) => void;
  value: number;
  setValue: (amount: number) => void;
  currentPrice: number;
  balance: number;
  loading: boolean;
  selectedToken: TokenInfo;
  setSelectedToken: (token: TokenInfo) => void;
  supportedTokens: TokenInfo[];
}

export default function TokenData({
  isUnstake,
  amount,
  setAmount,
  setValue,
  currentPrice,
  balance,
  loading,
  selectedToken,
  setSelectedToken,
  supportedTokens,
}: TokenDataProps) {
  useEffect(() => {
    setValue(amount * currentPrice);
  }, [amount, currentPrice]);

  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "svmUSD":
      case "stsvmUSD":
        return "/cash.png";
      case "USD*":
        return "/usd.png";
      default:
        return "";
    }
  };

  return (
    <div>
      <div className="grid gap-1">
        <section className="flex items-center justify-between">
          <div className="text-xs font-medium">
            {isUnstake ? "You unstake: " : "You stake: "}
          </div>
        </section>
        <section className="flex items-center justify-between gap-2">
          <Select
            className="min-w-[148px] max-w-[168px] rounded-md"
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
                    width={20}
                    height={20}
                    className="pointer-events-none"
                  />
                  {token.symbol}
                </div>
              </SelectItem>
            ))}
          </Select>
          <Input
            id="stake-amount"
            type="number"
            value={amount}
            disabled={isUnstake || loading}
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
          <p className="font-medium">Wallet:</p>
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-1">
              {loading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <span className="font-bold ml-1">
                  {formatAmount(parseFloat((balance).toFixed(5)))}
                </span>
              )}
            </div>
            <PercentageButtons
              balance={balance}
              setAmount={setAmount}
              disabled={isUnstake}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
