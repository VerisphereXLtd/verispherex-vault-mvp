import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

export default function useEthersSigner() {
  const { account } = useWeb3React();
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    const loadSigner = async () => {
      if (!account || !window.ethereum) {
        setSigner(null);
        return;
      }

      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await browserProvider.getSigner(account);
        setSigner(_signer);
        console.log("Signer set:", _signer);
      } catch (error) {
        console.error("Error creating signer:", error);
        setSigner(null);
      }
    };

    loadSigner();
  }, [account]);

  return signer;
}
