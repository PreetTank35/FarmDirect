"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  error: null,
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { ethereum } = window as any;
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== address) {
      if (provider) {
        const _signer = await provider.getSigner();
        setSigner(_signer);
        setAddress(accounts[0]);
      } else {
        connect();
      }
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    setChainId(parseInt(chainIdHex, 16));
    window.location.reload();
  };

  const connect = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      setError("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const _provider = new ethers.BrowserProvider(ethereum);
      await _provider.send("eth_requestAccounts", []);
      
      const _signer = await _provider.getSigner();
      const _address = await _signer.getAddress();
      const network = await _provider.getNetwork();

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      setChainId(Number(network.chainId));

      if (Number(network.chainId) !== 31337) {
        await switchToHardhatNetwork();
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToHardhatNetwork = async () => {
    const { ethereum } = window as any;
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7A69',
                chainName: 'Hardhat Localhost',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add hardhat network", addError);
        }
      }
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
  };

  return (
    <Web3Context.Provider value={{ provider, signer, address, chainId, connect, disconnect, isConnecting, error }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
