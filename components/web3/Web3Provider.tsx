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

  async function handleAccountsChanged(accounts: string[]) {
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
  }

  function handleChainChanged(chainIdHex: string) {
    setChainId(parseInt(chainIdHex, 16));
    window.location.reload();
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { ethereum } = window as any;
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { ethereum } = window as any;
    if (!ethereum) {
      setError("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Initialize BrowserProvider correctly for ethers v6 without invalid 'any' network and staticNetwork configuration
      const _provider = new ethers.BrowserProvider(ethereum);
      await _provider.send("eth_requestAccounts", []);
      
      const _signer = await _provider.getSigner();
      const _address = await _signer.getAddress();
      const network = await _provider.getNetwork();

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      setChainId(Number(network.chainId));

      // Allow Hardhat (31337) and Sepolia Testnet (11155111)
      const currentChainId = Number(network.chainId);
      if (currentChainId !== 31337 && currentChainId !== 11155111) {
        // Default to Sepolia if they are on an unsupported network
        await switchToNetwork(11155111);
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToNetwork = async (targetChainId: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { ethereum } = window as any;
    if (!ethereum) return;

    const hexChainId = "0x" + targetChainId.toString(16);

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (switchError: any) {
      // Code 4902 indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          if (targetChainId === 31337) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hexChainId,
                  chainName: "Hardhat Localhost",
                  rpcUrls: ["http://127.0.0.1:8545"],
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                },
              ],
            });
          } else if (targetChainId === 11155111) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hexChainId,
                  chainName: "Sepolia Test Network",
                  rpcUrls: ["https://rpc.sepolia.org"],
                  nativeCurrency: {
                    name: "Sepolia Ether",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          }
        } catch (addError) {
          console.error("Failed to add network", addError);
        }
      } else {
        console.error("Failed to switch network", switchError);
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
