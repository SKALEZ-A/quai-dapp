"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

export type CurrentUser = {
  name: string;
  username: string;
  address: string | null;
  short_address: string;
  profileImg: string;
  coverImg: string;
  about: string;
  date_joined: string;
  followers: number;
  following: number;
};

const DEFAULT_PROFILE_IMG = "/assets/avatars/alice-chen.png";
const DEFAULT_COVER_IMG = "/assets/pattern.png";

export function useCurrentUser(): CurrentUser {
  const [directAddress, setDirectAddress] = useState<string | null>(null);

  // Try to get wallet address directly from Pelagus
  useEffect(() => {
    const checkDirectWallet = async () => {
      try {
        const eth = (globalThis as any)?.ethereum;
        if (eth) {
          // First try to get existing accounts
          try {
            const accounts = await eth.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setDirectAddress(accounts[0]);
              return;
            }
          } catch (ethError) {
            console.log('eth_accounts failed:', ethError);
          }

          // If no accounts, try to request them
          try {
            const accounts = await eth.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              setDirectAddress(accounts[0]);
            }
          } catch (requestError) {
            console.log('eth_requestAccounts failed:', requestError);
          }
        }
      } catch (error) {
        console.log('Direct wallet check failed:', error);
      }
    };

    checkDirectWallet();
  }, []);

  try {
    const { address } = useAccount();

    // Use direct connection if available, fallback to wagmi
    const finalAddress = directAddress || address;

    const short = finalAddress
      ? `${finalAddress.slice(0, 6)}...${finalAddress.slice(-4)}`
      : "Not connected";

    return {
      name: finalAddress ? "Quai User" : "Guest User",
      username: finalAddress ? (finalAddress.slice(2, 8) + ".quai") : "guest",
      address: finalAddress ?? null,
      short_address: short,
      profileImg: DEFAULT_PROFILE_IMG,
      coverImg: DEFAULT_COVER_IMG,
      about: "Exploring Quai Network and the Synq Superapp.",
      date_joined: "Joined Sep 2025",
      followers: 120,
      following: 85,
    };
  } catch (error) {
    // Fallback if useAccount fails
    const short = directAddress
      ? `${directAddress.slice(0, 6)}...${directAddress.slice(-4)}`
      : "Not connected";

    return {
      name: directAddress ? "Quai User" : "Guest User",
      username: directAddress ? (directAddress.slice(2, 8) + ".quai") : "guest",
      address: directAddress ?? null,
      short_address: short,
      profileImg: DEFAULT_PROFILE_IMG,
      coverImg: DEFAULT_COVER_IMG,
      about: "Exploring Quai Network and the Synq Superapp.",
      date_joined: "Joined Sep 2025",
      followers: 120,
      following: 85,
    };
  }
}
