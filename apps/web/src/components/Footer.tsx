import React from 'react';
import Link from 'next/link';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const Footer = () => {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const currentUser = useCurrentUser();

  return (
    <footer className="bg-black text-white px-4 sm:px-6 md:px-12 lg:px-20 xl:px-40 pt-12 sm:pt-16 md:pt-20 pb-6 md:pb-8">
      {/* Main footer section */}
      <div className="flex flex-col md:flex-row justify-between gap-6 sm:gap-8 md:gap-10 border-b border-gray-700 pb-6 md:pb-8">
        {/* Left: Logo and description */}
        <div className="w-full md:w-1/3">
          <img src="/assets/logo.png" alt="Synq Logo" className="h-7 sm:h-8 md:h-10 mb-3 md:mb-4" />
          <p className="text-xs sm:text-sm md:text-sm text-gray-400 leading-relaxed">
            The unified Web3 platform for social interaction, identity, and cross-chain transfers on Quai Network
          </p>
        </div>

        {/* Right: Footer links */}
        <div className="w-full md:w-2/3 flex flex-wrap justify-between gap-4 sm:gap-6">
          {/* Column: Platform */}
          <div className="mb-6 sm:mb-6">
            <h4 className="font-semibold text-base sm:text-lg md:text-lg mb-3 md:mb-4">Platform</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <Link
                  href={isConnected && currentUser.address ? "/dashboard/social" : "#"}
                  onClick={!isConnected || !currentUser.address ? (e) => { e.preventDefault(); open(); } : undefined}
                >Social Hub</Link>
              </li>
              <li>
                <Link
                  href={isConnected && currentUser.address ? "/qns/profile" : "#"}
                  onClick={!isConnected || !currentUser.address ? (e) => { e.preventDefault(); open(); } : undefined}
                >QNS System</Link>
              </li>
              <li>
                <Link
                  href={isConnected && currentUser.address ? "/dashboard/bridge" : "#"}
                  onClick={!isConnected || !currentUser.address ? (e) => { e.preventDefault(); open(); } : undefined}
                >Bridge</Link>
              </li>
              <li><Link href="#">Documentation</Link></li>
            </ul>
          </div>

          {/* Column: Community */}
          <div className="mb-6 sm:mb-6">
            <h4 className="font-semibold text-base sm:text-lg md:text-lg mb-3 md:mb-4">Community</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><a href="https://x.com/synq_web3?s=20" target="_blank" rel="noreferrer">Twitter</a></li>
              <li><a href="https://t.me/synq_web3" target="_blank" rel="noreferrer">Telegram</a></li>
              <li><a href="#" target="_blank" rel="noreferrer">Discord</a></li>
              <li><a href="https://github.com/SKALEZ-A/quai-dapp" target="_blank" rel="noreferrer">Github</a></li>
            </ul>
          </div>

          {/* Column: Resources */}
          <div className="mb-6 sm:mb-6">
            <h4 className="font-semibold text-base sm:text-lg md:text-lg mb-3 md:mb-4">Resources</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link href="mailto:synqafrica1.0@gmail.com">Help Center</Link></li>
              <li><Link href="#">API Doc</Link></li>
              <li><Link href="#">Status</Link></li>
              <li><Link href="/terms" target='_blank'>Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="mt-4 md:mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 text-xs sm:text-sm text-gray-500">
        <p className="mb-3 sm:mb-0 text-center sm:text-left text-xs">&copy; {new Date().getFullYear()} Synq. All rights reserved.</p>
        <div className="flex gap-4 sm:gap-6 text-xs">
          <Link href="/privacy" target='_blank'>Privacy</Link>
          <Link href="/terms" target='_blank'>Terms</Link>
          <Link href="/security" target='_blank'>Security</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
