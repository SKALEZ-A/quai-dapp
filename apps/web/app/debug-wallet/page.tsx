"use client";

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useWeb3Modal } from 'wagmi';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function DebugWalletPage() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const currentUser = useCurrentUser();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('Page loaded');
    addLog(`Available connectors: ${connectors.length}`);
    connectors.forEach((conn, index) => {
      addLog(`Connector ${index}: ${conn.name} (${conn.type})`);
    });
  }, [connectors]);

  useEffect(() => {
    if (isConnected) {
      addLog(`Connected with address: ${address}`);
      addLog(`Connector: ${connector?.name || 'Unknown'}`);
    } else {
      addLog('Not connected');
    }
  }, [isConnected, address, connector]);

  useEffect(() => {
    if (connectError) {
      addLog(`Connection error: ${connectError.message}`);
    }
  }, [connectError]);

  const testWeb3Modal = () => {
    addLog('Opening Web3Modal...');
    try {
      open();
    } catch (error) {
      addLog(`Web3Modal error: ${error.message}`);
    }
  };

  const testDirectConnect = (connectorIndex: number) => {
    const selectedConnector = connectors[connectorIndex];
    if (selectedConnector) {
      addLog(`Attempting direct connection to: ${selectedConnector.name}`);
      try {
        connect({ connector: selectedConnector });
      } catch (error) {
        addLog(`Direct connection error: ${error.message}`);
      }
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Connection Debug</h1>
        
        {/* Status Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Address:</strong> {address || 'Not connected'}</p>
              <p><strong>Connector:</strong> {connector?.name || 'None'}</p>
            </div>
            <div>
              <p><strong>Current User Address:</strong> {currentUser.address || 'Not connected'}</p>
              <p><strong>Short Address:</strong> {currentUser.short_address}</p>
              <p><strong>Available Connectors:</strong> {connectors.length}</p>
            </div>
          </div>
        </div>

        {/* Available Connectors */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Connectors</h2>
          <div className="space-y-2">
            {connectors.map((connector, index) => (
              <div key={connector.uid} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <div>
                  <span className="font-medium">{connector.name}</span>
                  <span className="text-gray-400 ml-2">({connector.type})</span>
                </div>
                <button
                  onClick={() => testDirectConnect(index)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testWeb3Modal}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Open Web3Modal
            </button>
            <button
              onClick={() => disconnect()}
              disabled={!isConnected}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              Disconnect
            </button>
            <button
              onClick={clearLogs}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Error Display */}
        {connectError && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-300">Connection Error</h2>
            <p className="text-red-200">{connectError.message}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-red-300">Error Details</summary>
              <pre className="mt-2 text-xs text-red-200 bg-red-900/30 p-2 rounded overflow-auto">
                {JSON.stringify(connectError, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Debug Logs */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Browser Info */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Platform:</strong> {navigator.platform}</p>
            </div>
            <div>
              <p><strong>Window Size:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</p>
              <p><strong>Web3 Available:</strong> {typeof window !== 'undefined' && window.ethereum ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
