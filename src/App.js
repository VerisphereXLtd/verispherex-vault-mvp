import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./abi";
import logo from "./assets/VXS.png";

const injected = new InjectedConnector({
  supportedChainIds: [1, 137, 80001, 11155111], // include Sepolia
});

function App() {
  const { activate, deactivate, active, account, library } = useWeb3React();

  const [balance, setBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [networkName, setNetworkName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [amountToLock, setAmountToLock] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [owner, setOwner] = useState("");

  const saveTransactions = (txs) => {
    setTransactions(txs);
    localStorage.setItem("vaultTransactions", JSON.stringify(txs));
  };

  async function connectWallet() {
    try {
      await activate(injected);
      localStorage.setItem("walletConnected", "true");
      setStatusMessage("Wallet connected successfully.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error("Wallet connection failed", err);
      setStatusMessage("Connection failed. Please try again.");
    }
  }

  function disconnectWallet() {
    try {
      deactivate();
      localStorage.setItem("walletConnected", "false");
      setBalance("0");
      setEthBalance("0");
      setStatusMessage("Wallet disconnected.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error("Disconnect failed", err);
      setStatusMessage("Disconnect failed.");
    }
  }

  async function lockFunds() {
    if (!amountToLock || isNaN(amountToLock) || Number(amountToLock) <= 0) {
      alert("Enter a valid ETH amount");
      return;
    }

    setIsLoading(true);
    try {
      const signer = await library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.lock({
        value: ethers.parseEther(amountToLock),
      });
      await tx.wait();

      const newTx = {
        amount: amountToLock,
        hash: tx.hash,
        timestamp: new Date().toLocaleString(),
      };

      saveTransactions([...transactions, newTx]);

      alert(`${amountToLock} ETH locked successfully!`);
      setAmountToLock("");
    } catch (err) {
      console.error("Locking failed", err);
      alert("Transaction failed");
    }
    setIsLoading(false);
  }

  async function getBalance() {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, library);
      const result = await contract.getLockedBalance();
      setBalance(ethers.formatEther(result));
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
    setIsLoading(false);
  }

  async function withdrawFunds() {
    if (!library) return;
    setIsLoading(true);
    try {
      const signer = await library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.withdraw();
      await tx.wait();

      const newTx = {
        amount: "WITHDRAW",
        hash: tx.hash,
        timestamp: new Date().toLocaleString(),
      };

      saveTransactions([...transactions, newTx]);

      alert("Funds withdrawn by owner.");
    } catch (err) {
      console.error("Withdraw failed", err);
      alert("Withdraw failed or unauthorized");
    }
    setIsLoading(false);
  }

  async function fetchNetworkAndBalance() {
    try {
      if (library && account) {
        const network = await library.getNetwork();
        setNetworkName(network.name);

        const walletBalance = await library.getBalance(account);
        setEthBalance(ethers.formatEther(walletBalance));

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, library);
        const fetchedOwner = await contract.owner();
        setOwner(fetchedOwner.toLowerCase());
      }
    } catch (err) {
      console.error("Error getting network or balance", err);
    }
  }

  useEffect(() => {
    const previouslyConnected = localStorage.getItem("walletConnected");
    if (previouslyConnected === "true") {
      activate(injected);
    }

    const saved = localStorage.getItem("vaultTransactions");
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, [activate]);

  useEffect(() => {
    if (active && account) {
      fetchNetworkAndBalance();
    }
  }, [active, account]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a1f44] text-white px-4">
      <div className="w-full max-w-md space-y-5 text-center">
        <img src={logo} alt="VerisphereX Logo" className="h-20 mx-auto mb-2" />

        {statusMessage && (
          <div className="bg-black text-yellow-400 border border-yellow-500 px-4 py-2 rounded">
            {statusMessage}
          </div>
        )}

        <h1 className="text-3xl font-bold text-[#00ff88] drop-shadow-[0_0_5px_#00ff88]">
          VerisphereX Vault
        </h1>

        {isLoading && (
          <p className="text-yellow-300 text-sm animate-pulse">Processing...</p>
        )}

        {!active ? (
          <button
            onClick={connectWallet}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition rounded shadow-md"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="text-left space-y-1 text-sm text-gray-300 bg-[#091a3e] p-3 rounded shadow-inner">
              <p className="truncate">Connected: {account}</p>
              <p>Network: {networkName}</p>
              <p>Wallet ETH: {Number(ethBalance).toFixed(4)} ETH</p>
            </div>

            <input
              type="number"
              placeholder="Enter ETH amount"
              value={amountToLock}
              onChange={(e) => setAmountToLock(e.target.value)}
              className="w-full p-2 text-black rounded shadow-inner"
            />

            <button
              onClick={lockFunds}
              className="w-full py-2 bg-green-600 hover:bg-green-700 transition rounded shadow-md"
              disabled={isLoading}
            >
              Lock ETH
            </button>

            <button
              onClick={getBalance}
              className="w-full py-2 bg-gray-700 hover:bg-gray-800 transition rounded shadow-md"
              disabled={isLoading}
            >
              Check Locked Balance
            </button>

            {account?.toLowerCase() === owner && (
              <button
                onClick={withdrawFunds}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 transition rounded shadow-md"
                disabled={isLoading}
              >
                Withdraw Funds (Owner Only)
              </button>
            )}

            <button
              onClick={disconnectWallet}
              className="w-full py-2 bg-red-600 hover:bg-red-700 transition rounded shadow-md"
            >
              Disconnect Wallet
            </button>
          </>
        )}

        <p className="text-lg text-white font-mono">
          Locked: {Number(balance).toFixed(4)} ETH
        </p>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div className="text-left mt-4 bg-[#091a3e] p-3 rounded shadow-inner">
            <h3 className="text-[#00ff88] font-bold mb-2">Recent Transactions</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              {transactions.map((tx, index) => (
                <li key={index}>
                  <span className="text-yellow-400">
                    {tx.amount === "WITHDRAW" ? "Withdraw" : `${tx.amount} ETH`}
                  </span>{" "}
                  — {tx.timestamp}
                  <br />
                  <a
                    href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                    className="text-blue-400 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Etherscan
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


