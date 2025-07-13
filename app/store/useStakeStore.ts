import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";
import { CASH_MINT, USDC_MINT } from "@/core/setting";

export interface TokenInfo {
  symbol: string;
  mint: string;
  decimals: number;
  isNative: boolean;
}

interface TokenState {
  // Available tokens in the application
  supportedTokens: TokenInfo[];
  supportedUnstakeTokens: TokenInfo[];
  // Currently selected token
  selectedToken: TokenInfo;

  // User balances
  balance: number;
  stakedAmount: number;
  isLoading: boolean;

  // Actions
  setIsLoading: (isLoading: boolean) => void;
  setSelectedToken: (token: TokenInfo) => void;
  setBalance: (balance: number) => void;
  setStakedAmount: (amount: number) => void;
  getTokenMint: (symbol: string) => PublicKey;
}

// Define initial supported tokens
const initialSupportedTokens: TokenInfo[] = [
  {
    symbol: "svmUSD",
    mint: CASH_MINT.toBase58(),
    decimals: 6,
    isNative: false,
  },
  // {
  //   symbol: 'USD*',
  //   mint: USDC_MINT.toBase58(),
  //   decimals: 6,
  //   isNative: false
  // }
];

const initialUnstakeSupportedTokens: TokenInfo[] = [
  {
    symbol: "stsvmUSD",
    mint: CASH_MINT.toBase58(),
    decimals: 6,
    isNative: false,
  },
];

const useStakeStore = create<TokenState>((set, get) => ({
  supportedTokens: initialSupportedTokens,
  supportedUnstakeTokens: initialUnstakeSupportedTokens,
  selectedToken: {} as TokenInfo, // Default to {}
  balance: 0,
  stakedAmount: 0,
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  setSelectedToken: (token) => set({ selectedToken: token }),
  setBalance: (balance) => set({ balance }),
  setStakedAmount: (stakedAmount) => set({ stakedAmount }),

  getTokenMint: (symbol) => {
    switch (symbol) {
      case "svmUSD":
      case "stsvmUSD":
        return CASH_MINT;
      case "USD*":
        return USDC_MINT;
      default:
        const tokenInfo = get().supportedTokens.find(
          (t) => t.symbol === symbol,
        );
        return tokenInfo ? new PublicKey(tokenInfo.mint) : CASH_MINT;
    }
  },
}));

export default useStakeStore;
