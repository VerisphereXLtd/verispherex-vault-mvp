import { useEffect, useState } from "react";
import { Contract, BrowserProvider } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../abi";

export default function useVaultContract(signer, provider) {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const setupContract = async () => {
      let signerOrProvider = signer ?? provider;

      if (!signerOrProvider && typeof window !== "undefined" && window.ethereum) {
        try {
          const browserProvider = new BrowserProvider(window.ethereum);
          signerOrProvider = await browserProvider.getSigner();
        } catch (err) {
          console.error("Failed to create BrowserProvider signer:", err);
          return;
        }
      }

      if (!signerOrProvider || !CONTRACT_ADDRESS || !ABI) {
        console.warn("Vault contract dependencies not ready.");
        return;
      }

      try {
        const vault = new Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
        console.log("Vault contract initialized:", vault);
        setContract(vault);
      } catch (err) {
        console.error("Contract instantiation failed:", err);
        setContract(null);
      }
    };

    setupContract();
  }, [signer, provider]);

  return contract;
}
