import { useMemo } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { CONTRACT_ADDRESS, ABI } from "../abi";
import useEthersSigner from "./useEthersSigner";

export default function useVaultContract() {
  const signer = useEthersSigner();
  const { provider } = useWeb3React();

  return useMemo(() => {
    const fallbackProvider = new JsonRpcProvider(process.env.REACT_APP_SEPOLIA_RPC_URL);

    const signerOrProvider = signer ?? provider ?? fallbackProvider;

    if (!signerOrProvider || !CONTRACT_ADDRESS || !ABI) {
      console.warn("Vault contract not ready", { signer, provider });
      return null;
    }

    try {
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
      console.log("Vault contract initialized:", contract);
      return contract;
    } catch (err) {
      console.error("Contract creation failed:", err);
      return null;
    }
  }, [signer, provider]);
}
