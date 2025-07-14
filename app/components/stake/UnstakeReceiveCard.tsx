"use client";

import TokenData from "./TokenData";
import { TokenInfo } from "@/store/useTokenStore";
import { CASH_MINT } from "@/core/setting";

export default function UnstakeReceiveCard() {
  // Define svmUSD token
  const svmUSDToken: TokenInfo = {
    symbol: "svmUSD",
    mint: CASH_MINT.toBase58(), // 使用相同的 mint，实际项目中可能需要不同的 mint
    decimals: 6,
    isNative: false,
  };

  return (
    <div className="bg-green-dark border-4 border-black p-3 rounded-3xl">
      <TokenData
        symbol="svmUSD"
        amount={0}
        setAmount={() => {}} // 只读，不需要设置
        value={0}
        setValue={() => {}} // 只读，不需要设置
        currentPrice={1}
        balance={0}
        loading={false}
        selectedToken={svmUSDToken}
        setSelectedToken={() => {}} // 固定，不需要设置
        supportedTokens={[svmUSDToken]}
        hideSelector={true}
        isReceive={true}
        hideWallet={true}
      />
    </div>
  );
} 