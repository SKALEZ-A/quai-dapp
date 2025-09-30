"use client";

import React from 'react';
import Link from 'next/link';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const Header: React.FC = () => {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const currentUser = useCurrentUser();

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Bridge", path: "/dashboard/bridge" },
    { label: "QNS", path: "/qns/profile" },
    { label: "Social", path: "/dashboard/social" },
  ];

  // Common classes
  const navLinkClasses =
    "text-sm font-medium transition-colors duration-200 text-gray-500 hover:text-gray-100";

  const walletBtnClasses =
    "inline-flex items-center px-6 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out text-white";

  return (
    <header className="fixed top-5 w-full z-50 flex justify-center">
      <div className="flex justify-between items-center w-[84%] bg-[rgba(17,25,40,0.83)] backdrop-blur-md rounded-xl shadow-lg px-6 py-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/assets/logo.png" alt="Synq Logo" className="h-8" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={isConnected && currentUser.address ? item.path : "#"}
              onClick={!isConnected || !currentUser.address ? (e) => { e.preventDefault(); open(); } : undefined}
              className={navLinkClasses}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Wallet / Dashboard Button */}
        <div>
          <button
            className={`${walletBtnClasses} ${
              isConnected && currentUser.address ? 'btn-primary' : 'btn-gradient'
            }`}
            onClick={() => { if (isConnected && currentUser.address) { disconnect(); } else { open(); } }}
            title={isConnected && currentUser.address ? 'Click to disconnect' : 'Connect Wallet'}
          >
            {isConnected && currentUser.address ? (
              currentUser.short_address
            ) : (
              <>
                <FontAwesomeIcon icon={faWallet} className="text-white mr-2 text-lg" />
                Connect Wallet
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
