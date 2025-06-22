import { Web3ReactProvider } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ethers } from "ethers";

const injected = new InjectedConnector({
  supportedChainIds: [1, 137, 80001, 11155111], // Mainnet, Polygon, Mumbai, Sepolia
});

function getLibrary(provider) {
  return new ethers.BrowserProvider(provider);
}

const connectors = [[injected, {}]];

export default function ProviderWrapper({ children }) {
  return (
    <Web3ReactProvider connectors={connectors} getLibrary={getLibrary}>
      {children}
    </Web3ReactProvider>
  );
}
