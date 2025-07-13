"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CardContainer } from "../ui/Container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import SwapCard from "./SwapCard";
import { Connection } from "@solana/web3.js";
import useNetworkStore from "@/store/useNetworkStore";
import useSwapStore from "@/store/useSwapStore";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import toast, { Toaster } from "react-hot-toast";
import { getSwapBalance } from "@/lib/swap";
import { getPoolList } from "@/lib/getPoolList";
const tabs = [
  {
    label: "Swap",
    value: "swap",
  },
  {
    label: "Redeem",
    value: "redeem",
  },
];

export const SwapTabs = () => {
  const wallet = useAnchorWallet();

  const [selectedTab, setSelectedTab] = useState("swap");
  const { currentNetwork } = useNetworkStore();
  const {
    balance,
    setPools,
    selectedPool,
    selectedToken,
    setBalance,
    setMaxAAmount,
    setIsLoading,
  } = useSwapStore();
  const { publicKey: walletPublicKey } = useWallet();

  const connection = useMemo(() => {
    return new Connection(currentNetwork.rpcUrl, "confirmed");
  }, [currentNetwork.rpcUrl]);

  const getBalance = useCallback(async () => {
    if (!wallet || !walletPublicKey) return;
    setIsLoading(true);
    try {
      const balance = await getSwapBalance(
        connection,
        walletPublicKey,
        selectedToken.symbol
      );
      setBalance(balance ? Number(balance) : 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedPool.poolPk,
    selectedTab,
    wallet,
    connection,
    walletPublicKey,
    setBalance,
  ]);

  useEffect(() => {
    if (selectedToken.symbol && wallet) {
      getBalance();
    } else {
      setBalance(0);
    }
  }, [selectedToken.symbol, selectedToken.mint, wallet]);

  useEffect(() => {
    const fetchPools = async () => {
      if (wallet && connection) {
        setIsLoading(true);
        try {
          const poolList = await getPoolList(wallet, connection);
          setPools(poolList);
          // console.log("pool list", poolList);
        } catch (error) {
          setPools([]);
          console.error("Error fetching pools:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchPools();
  }, [wallet, connection]);

  return (
    <CardContainer>
      <Toaster position="top-right" />
      <Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val)}>
        <TabsList className="w-auto mb-6 bg-green-dark p-2 rounded-2xl border-4 border-black text-black/60 text-[15px]">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="px-2 py-1 data-[state=active]:bg-green-light data-[state=active]:shadow-inner-green data-[state=active]:border-green-lighter data-[state=active]:text-black font-bold"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={"swap"} className="mt-0">
          <SwapCard callback={getBalance} />
        </TabsContent>
        <TabsContent value={"redeem"} className="mt-0">
          {/* <WithdrawCard connected={connected} callback={fetchDetails} /> */}
        </TabsContent>
      </Tabs>
    </CardContainer>
  );
};
