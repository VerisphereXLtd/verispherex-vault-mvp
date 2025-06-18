import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { Web3ReactProvider } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ethers } from "ethers";

// 1. Set up Injected Connector (MetaMask)
const injected = new InjectedConnector({
  supportedChainIds: [1, 137, 80001], // Ethereum, Polygon, Mumbai
});

// 2. Required getLibrary function for Web3ReactProvider
function getLibrary(provider) {
  return new ethers.BrowserProvider(provider);
}

// 3. Required connectors function (added in latest versions)
const connectors = () => [[injected, {}]];

// 4. Wrap your app with Web3ReactProvider properly
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Web3ReactProvider connectors={connectors} getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>
);

