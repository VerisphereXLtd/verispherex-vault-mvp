
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

export default function useProvider() {
  const { library } = useWeb3React();

  // Use wallet-connected provider if available
  if (library) return library;

  // Fallback read-only provider (Sepolia testnet)
  return ethers.getDefaultProvider("sepolia");
}
