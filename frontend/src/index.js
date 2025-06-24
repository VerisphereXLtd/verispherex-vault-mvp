// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";

//Ethers v6-compatible BrowserProvider
function getLibrary(provider) {
  try {
    const lib = new ethers.BrowserProvider(provider);
    console.log("BrowserProvider initialized:", lib);
    return lib;
  } catch (err) {
    console.error("Failed to initialize BrowserProvider:", err);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>
);
