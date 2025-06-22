import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function useEthersSigner() {
  const { account, provider } = useWeb3React();
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    const loadSigner = async () => {
      if (typeof window !== "undefined" && window.ethereum && account) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const _signer = await browserProvider.getSigner(account);
          setSigner(_signer);
          console.log("Signer initialized:", _signer);
        } catch (err) {
          console.error("Failed to create signer:", err);
          setSigner(null);
        }
      } else {
        console.warn("⚠️ Missing Ethereum provider or account");
        setSigner(null);
      }
    };

    loadSigner();
  }, [account]);

  return signer;
}
