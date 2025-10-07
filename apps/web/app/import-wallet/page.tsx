"use client";

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getUserDomains } from '@/lib/qns';
import { useEffect } from 'react';

export default function ImportWalletPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const currentUser = useCurrentUser();
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState('8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802');
  const [showKey, setShowKey] = useState(false);

  const loadDomains = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const userDomains = await getUserDomains(address);
      setDomains(userDomains);
    } catch (error) {
      console.error("Error loading domains:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadDomains();
    }
  }, [address]);

  const handleImportWallet = () => {
    // This would typically use a wallet connector that supports private key import
    // For now, we'll show instructions
    alert(`To import this wallet:
    
1. Install MetaMask or Pelagus browser extension
2. Click "Import Account" 
3. Select "Private Key" option
4. Paste this private key: ${privateKey}
5. The wallet address should be: 0x003DAC94805c77d7fD485cd415F8078414d171e4
6. Come back to this page and connect the wallet

This wallet owns the domain: testdomain.qns`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Import Wallet to View Domains</h1>
        
        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Instructions</h2>
          <div className="space-y-3 text-sm">
            <p>You have a registered domain <strong>testdomain.qns</strong> that needs to be displayed on your dashboard.</p>
            <p>To view it, you need to import the wallet that owns this domain into your browser.</p>
            <p>The wallet address is: <code className="bg-gray-800 px-2 py-1 rounded">0x003DAC94805c77d7fD485cd415F8078414d171e4</code></p>
          </div>
        </div>

        {/* Private Key Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Private Key for Import</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Private Key:</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showKey ? "text" : "password"}
                  value={privateKey}
                  readOnly
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 font-mono text-sm"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(privateKey)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={handleImportWallet}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Get Import Instructions
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
            <p><strong>Address:</strong> {address || 'Not connected'}</p>
            <p><strong>Expected Address:</strong> 0x003DAC94805c77d7fD485cd415F8078414d171e4</p>
            <p><strong>Address Match:</strong> {address?.toLowerCase() === '0x003dac94805c77d7fd485cd415f8078414d171e4' ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        {/* Wallet Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Actions</h2>
          <div className="space-x-4">
            {!isConnected ? (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={() => disconnect()}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Disconnect
              </button>
            )}
            <button
              onClick={loadDomains}
              disabled={!address || loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              {loading ? 'Loading...' : 'Load Domains'}
            </button>
          </div>
        </div>

        {/* Available Connectors */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Connectors</h2>
          <div className="space-y-2">
            {connectors.map((connector) => (
              <div key={connector.uid} className="flex items-center justify-between">
                <span>{connector.name}</span>
                <button
                  onClick={() => connect({ connector })}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Domains */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Domains</h2>
          {loading ? (
            <p>Loading domains...</p>
          ) : domains.length === 0 ? (
            <p>No domains found. Make sure you're connected with the correct wallet.</p>
          ) : (
            <div className="space-y-2">
              {domains.map((domain, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded">
                  {domain}.qns
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expected Domain */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Expected Domain</h2>
          <p>You should see: <strong>testdomain.qns</strong></p>
          <p>Once connected, go to: <a href="/dashboard/overview" className="text-blue-400 hover:underline">Dashboard Overview</a></p>
        </div>
      </div>
    </div>
  );
}
