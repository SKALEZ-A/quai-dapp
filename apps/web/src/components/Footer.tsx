import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black text-white px-8 md:px-20 lg:px-40 pt-20 pb-8">
      {/* Main footer section */}
      <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-gray-700 pb-8">
        {/* Left: Logo and description */}
        <div className="w-full md:w-1/3">
          <img src="/assets/logo.png" alt="Synq Logo" className="h-10 mb-4" />
          <p className="text-sm text-gray-400 leading-relaxed">
            The unified Web3 platform for social interaction, identity, and cross-chain transfers on Quai Network
          </p>
        </div>

        {/* Right: Footer links */}
        <div className="w-full md:w-2/3 flex flex-wrap justify-between">
          {/* Column: Platform */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/qns">QNS Domain</Link></li>
              <li><Link href="/bridge">Cross-Chain Bridge</Link></li>
              <li><Link href="/socials">Social Hub</Link></li>
              <li><Link href="#">Documentation</Link></li>
            </ul>
          </div>

          {/* Column: Community */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" target="_blank" rel="noreferrer">Discord</a></li>
              <li><a href="#" target="_blank" rel="noreferrer">Twitter</a></li>
              <li><a href="#" target="_blank" rel="noreferrer">Telegram</a></li>
              <li><a href="#" target="_blank" rel="noreferrer">Github</a></li>
            </ul>
          </div>

          {/* Column: Resources */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">API Doc</Link></li>
              <li><Link href="#">Status</Link></li>
              <li><Link href="#">Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="mt-6 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} Synq. All rights reserved.</p>
        <div className="flex space-x-6">
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
          <Link href="#">Security</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
