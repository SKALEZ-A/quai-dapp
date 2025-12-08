"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const Header: React.FC = () => {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const currentUser = useCurrentUser();
  const { disconnect } = useDisconnect();

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
    "inline-flex items-center px-3 md:px-6 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out text-white";

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      // We only care if menu is actually open (visible)
      if (
        showMenu &&
        menuRef.current &&
        btnRef.current &&
        !menuRef.current.contains(target) &&
        !btnRef.current.contains(target)
      ) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <header className="fixed top-4 md:top-5 w-full z-50 flex justify-center">
      <div className="relative flex justify-between items-center w-[92%] md:w-[84%] lg:w-[70%] bg-[rgba(17,25,40,0.83)] backdrop-blur-md rounded-xl shadow-lg px-3 md:px-6 py-3 md:py-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/assets/logo.png" alt="Synq Logo" className="h-6 md:h-8" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6 lg:gap-8">
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

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2">
          <button
            ref={btnRef}
            type="button"
            aria-label="Toggle menu"
            aria-expanded={showMenu}
            aria-controls="mobile-menu"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
            onClick={() => setShowMenu((s) => !s)}
          >
            <FontAwesomeIcon icon={showMenu ? faTimes : faBars} className="text-lg" />
          </button>

          <div className="hidden md:block">
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
                  <FontAwesomeIcon icon={faWallet} className="text-white mr-2 text-base md:text-lg" />
                  Connect Wallet
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
            ref={menuRef}
            id="mobile-menu"
            role="menu"
            className={`
                md:hidden absolute top-full right-0 mt-2 w-full 
                bg-[rgba(17,25,40,0.83)] backdrop-blur-xl border-white/10 rounded-xl shadow-lg p-3 
                flex flex-col gap-2 z-50
                transition-all duration-300 ease-in-out transform origin-top
                ${showMenu 
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible" 
                    : "opacity-0 -translate-y-5 scale-95 pointer-events-none invisible"
                }
            `}
        >
            {navItems.map((item) => (
            <Link
                key={item.label}
                href={isConnected && currentUser.address ? item.path : '#'}
                onClick={!isConnected || !currentUser.address ? (e) => { e.preventDefault(); open(); setShowMenu(false); } : () => setShowMenu(false)}
                className={`text-sm font-medium text-gray-200 hover:text-white px-2 py-2 rounded ${navLinkClasses}`}
            >
                {item.label}
            </Link>
            ))}
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
                <FontAwesomeIcon icon={faWallet} className="text-white mr-2 text-base md:text-lg" />
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