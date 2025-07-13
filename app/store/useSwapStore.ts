import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";
import {
  CASH_MINT,
  SOL_MINT,
  USDC_MINT,
  USDT_MINT,
} from "@/core/setting";
import { PoolInfo } from "@/lib/getPoolList";

export interface TokenInfo {
  symbol: string;
  mint: string;
  decimals: number;
  isNative: boolean;
}

interface TokenState {
  pools: PoolInfo[];
  selectedPool: PoolInfo;
  selectedPoolDetails: any;
  // Available tokens in the application
  supportedTokens: TokenInfo[];
  supportedBuyTokens: TokenInfo[];

  // Currently selected token
  selectedToken: TokenInfo;
  selectedBuyToken: TokenInfo;

  // User balances
  balance: number;
  maxAAmount: number;
  swapAmount: number;
  buyAmount: number;
  isLoading: boolean;

  // Actions
  setPools: (pool: PoolInfo[]) => void;
  setSelectedPool: (pool: PoolInfo) => void;
  setSelectedPoolDetails: (pool: any) => void;

  setIsLoading: (isLoading: boolean) => void;
  setSelectedToken: (token: TokenInfo) => void;
  setSelectedBuyToken: (token: TokenInfo) => void;
  setBalance: (balance: number) => void;
  setSwapAmount: (amount: number) => void;
  setBuyAmount: (amount: number) => void;
  getTokenMint: (symbol: string) => PublicKey;
  setMaxAAmount: (maxAAmount: number) => void,
  // getBuyTokenMin: (symbol: string) => PublicKey;
}

// Define initial supported tokens
const initialSupportedTokens: TokenInfo[] = [
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

const initialSupportedBuyTokens: TokenInfo[] = [
  {
    symbol: "svmUSD",
    mint: CASH_MINT.toBase58(),
    decimals: 6,
    isNative: false,
  },
];

const useSwapStore = create<TokenState>((set, get) => ({
  supportedTokens: initialSupportedTokens,
  supportedBuyTokens: initialSupportedBuyTokens,
  selectedBuyToken: {} as TokenInfo,
  selectedToken: {} as TokenInfo, // Default to first token
  balance: 0,
  maxAAmount: 0,
  swapAmount: 0,
  buyAmount: 0,
  isLoading: false,

  pools: [],
  selectedPool: {} as PoolInfo,
  selectedPoolDetails: {},
  setMaxAAmount: (maxAAmount) => set({ maxAAmount }),
  setPools: (pools) => set({ pools }),
  setSelectedPool: (selectedPool) => set({ selectedPool }),
  setSelectedPoolDetails: (selectedPoolDetails) => set({ selectedPoolDetails }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedBuyToken: (token) => set({ selectedBuyToken: token }),
  setSelectedToken: (token) => set({ selectedToken: token }),
  setBalance: (balance) => set({ balance }),
  setSwapAmount: (swapAmount) => set({ swapAmount }),
  setBuyAmount: (buyAmount) => set({ buyAmount }),

  getTokenMint: (symbol) => {
    switch (symbol) {
      case "SOL":
        return SOL_MINT;
      case "USDC":
        return USDC_MINT;
      case 'USDT':
        return USDT_MINT;
      case 'svmUSD':
        return CASH_MINT;
      default:
        const tokenInfo = get().supportedTokens.find(
          (t) => t.symbol === symbol,
        );
        return tokenInfo ? new PublicKey(tokenInfo.mint) : SOL_MINT;
    }
  },
}));

export default useSwapStore;
