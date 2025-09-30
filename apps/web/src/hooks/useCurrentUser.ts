"use client";

import { useAccount } from "wagmi";

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
  const { address } = useAccount();

  const short = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  return {
    name: address ? "Quai User" : "Guest User",
    username: address ? (address.slice(2, 8) + ".quai") : "guest",
    address: address ?? null,
    short_address: short,
    profileImg: DEFAULT_PROFILE_IMG,
    coverImg: DEFAULT_COVER_IMG,
    about: "Exploring Quai Network and the Synq Superapp.",
    date_joined: "Joined Sep 2025",
    followers: 120,
    following: 85,
  };
}
