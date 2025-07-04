
import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ethers } from "ethers";

import useEthersSigner from "./hooks/useEthersSigner";
import useVaultContract from "./hooks/useVaultContract";

import logo from "./assets/MvpLogo3.png";

function formatCountdown(seconds) {
  return `${seconds}s`;  // Directly display seconds
}


const injected = new InjectedConnector({
  supportedChainIds: [1, 137, 80001, 11155111],
});

function App() {
  const { activate, deactivate, active, account, provider } = useWeb3React();
  const signer = useEthersSigner();
  const vaultContract = useVaultContract(signer, provider);

  const [balance, setBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [networkName, setNetworkName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [amountToLock, setAmountToLock] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [owner, setOwner] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userLockedBalance, setUserLockedBalance] = useState("0");
  const [showTransactions, setShowTransactions] = useState(false);
  const [hasCheckedBalance, setHasCheckedBalance] = useState(false);
  const [showUserBalance, setShowUserBalance] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [newDuration, setNewDuration] = useState("");
  const [showDurationInput, setShowDurationInput] = useState(false);

  useEffect(() => {
    if (signer && vaultContract) {
      vaultContract.owner().then(setOwner).catch(console.error);
    }
  }, [signer, vaultContract]);

  const saveTransactions = (txs) => {
    setTransactions(txs);
    localStorage.setItem("vaultTransactions", JSON.stringify(txs));
  };

  async function connectWallet() {
  try {
    if (!window.ethereum) {
      setStatusMessage("Please install MetaMask.");
      return;
    }

    //This prevents multiple simultaneous connection attempts
    if (window.__isConnectingWallet) {
      setStatusMessage("MetaMask is already processing a request.");
      return;
    }

    window.__isConnectingWallet = true;

    await activate(injected); // web3-react's wallet activation
    localStorage.setItem("walletConnected", "true");
    setStatusMessage("Wallet connected successfully.");
    setTimeout(() => setStatusMessage(""), 3000);
  } catch (err) {
    if (err.code === -32002) {
      setStatusMessage("Connection request already pending in MetaMask.");
    } else {
      console.error("Wallet connection failed", err);
      setStatusMessage("Connection failed. Please try again.");
    }
  } finally {
    window.__isConnectingWallet = false;
  }
}

    const disconnectWallet = () => {
  deactivate();
  localStorage.removeItem("walletConnected");
  setStatusMessage("Wallet disconnected.");
  setTimeout(() => setStatusMessage(""), 3000);
};


  const handleAsyncCall = async (callback, errorMessage) => {
    setIsLoading(true);
    try {
      await callback();
    } catch (err) {
      console.error(errorMessage, err);
      setErrorMessage(err.reason || err.message || errorMessage);
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const lockFunds = async () => {
    if (!vaultContract || !signer) {
      setErrorMessage("Vault contract or signer not ready. Try reconnecting your wallet.");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    if (!amountToLock || isNaN(amountToLock) || Number(amountToLock) <= 0) {
      setErrorMessage("Enter a valid ETH amount.");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    await handleAsyncCall(async () => {
      const tx = await vaultContract.lock({
        value: ethers.parseEther(amountToLock),
      });
      await tx.wait();
      const unlockAt = Date.now() + 3 * 60 * 1000;
      localStorage.setItem("unlockTime", unlockAt);
      setCountdown(unlockAt);
      const newTx = {
        amount: amountToLock,
        hash: tx.hash,
        timestamp: new Date().toLocaleString(),
        type: "LOCK",
      };
      saveTransactions([...transactions, newTx]);
      setStatusMessage(`${amountToLock} ETH locked successfully!`);
      setTimeout(() => setStatusMessage(""), 4000);
      setAmountToLock("");
    }, "Locking failed");
  };

  const withdrawFunds = async () => {
  // This checks if vaultContract or autoWithdraw method is not available
  if (!vaultContract || !vaultContract.autoWithdraw) {
    console.error("Vault contract or autoWithdraw function is not available.");
    setErrorMessage("Vault contract or autoWithdraw function is not available.");
    setTimeout(() => setErrorMessage(""), 4000);
    return; // This is to exit the function early if the contract is not available
  }

  await handleAsyncCall(async () => {
    try {
      //This ensures interactions with the contract and withdraws successfully
      const tx = await vaultContract.autoWithdraw();
      await tx.wait();  // Wait for the transaction to be mined

      const newTx = {
        amount: "AUTO-WITHDRAW", //This can be adjusted based on actual amount withdrawn
        hash: tx.hash,
        timestamp: new Date().toLocaleString(),
        type: "WITHDRAW",
      };

      saveTransactions([...transactions, newTx]);  //Saves the new transaction in local state
      setStatusMessage("Funds auto-withdrawn to your wallet.");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (err) {
      console.error("Withdraw failed", err);
      setErrorMessage("Failed to withdraw funds.");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  }, "Withdraw failed");
};



  async function getBalance() {
    try {
      const result = await vaultContract.getLockedBalance();
      setBalance(ethers.formatEther(result));
      setHasCheckedBalance(true);
    } catch (err) {
      console.error("Balance error", err);
      setErrorMessage("Could not fetch total locked balance.");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  }

  async function getUserBalance() {
    try {
      const result = await vaultContract.getUserLockedBalance(account);
      setUserLockedBalance(ethers.formatEther(result));
      setShowUserBalance(true);
      setStatusMessage("Fetched your locked balance.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error("User balance error", err);
      setErrorMessage("Could not fetch your locked balance.");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  }

  const handleCheckBothBalances = async () => {
    await getUserBalance();
    await getBalance();
  };

  async function fetchTransactionsForDisplay() {
    if (!vaultContract || !provider || !account) return;

    try {
      setIsLoading(true);
      const logs = [];
      const isOwner = account.toLowerCase() === owner.toLowerCase();
      const lockedFilter = isOwner ? vaultContract.filters.Locked() : vaultContract.filters.Locked(account);
      const lockedEvents = await vaultContract.queryFilter(lockedFilter, 0, "latest");

      for (let event of lockedEvents) {
        logs.push({
          type: "LOCK",
          user: event.args.user,
          amount: ethers.formatEther(event.args.amount),
          hash: event.transactionHash,
          timestamp: new Date((await provider.getBlock(event.blockNumber)).timestamp * 1000).toLocaleString(),
        });
      }

      const withdrawFilter = isOwner ? vaultContract.filters.Withdrawn() : vaultContract.filters.Withdrawn(account);
      const withdrawEvents = await vaultContract.queryFilter(withdrawFilter, 0, "latest");

      for (let event of withdrawEvents) {
        logs.push({
          type: "WITHDRAW",
          user: event.args.user,
          amount: ethers.formatEther(event.args.amount),
          hash: event.transactionHash,
          timestamp: new Date((await provider.getBlock(event.blockNumber)).timestamp * 1000).toLocaleString(),
        });
      }

      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setTransactions(logs);
      setShowTransactions(true);
    } catch (err) {
      console.error("Fetching transactions failed", err);
      setErrorMessage("Failed to fetch transactions");
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchNetworkAndBalance = async () => {
    try {
      if (signer && account) {
        const balance = await signer.provider.getBalance(account);
        setEthBalance(ethers.formatEther(balance));
        const network = await signer.provider.getNetwork();
        setNetworkName(network.name);
      }
    } catch (err) {
      console.error("Failed to fetch network/balance:", err);
    }
  };

  useEffect(() => {
    fetchNetworkAndBalance();
  }, [signer, account]);

  useEffect(() => {
  const reconnect = async () => {
    const previouslyConnected = localStorage.getItem("walletConnected");

    if (previouslyConnected === "true" && window.ethereum) {
      try {
        const unlocked = await window.ethereum._metamask.isUnlocked();
        if (unlocked) {
          await activate(injected);
        }
      } catch (err) {
        console.warn("MetaMask reconnect error:", err);
      }
    }
  };

  reconnect();

  
  const saved = localStorage.getItem("vaultTransactions");
  if (saved) {
    setTransactions(JSON.parse(saved));
  }
}, [activate]);


  useEffect(() => {
  // Log the VaultContract when the contract runs
  console.log("Vault Contract:", vaultContract);

  const interval = setInterval(() => {
    const stored = localStorage.getItem("unlockTime");
    if (!stored) return;

    let unlockTime = parseInt(stored);

    //Debugging logs
    console.log("Stored unlock time:", stored); //Logss the stored value from localStorage
    console.log("Unlock time in ms before conversion:", unlockTime); //Logs the value in seconds (before conversion)

    //Ensure unlockTime is in milliseconds
    if (unlockTime < 1e12) {
      unlockTime *= 1000; //Converts secs to millisecs if necessary
    }

    // Debugging log for unlockTime in milliseconds
    console.log("Unlock time in ms after conversion:", unlockTime); // Log the value in milliseconds

    const timeLeft = unlockTime - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval); // Stop the interval after auto-withdrawal
      setCountdown(null);
      withdrawFunds();  //Calls withdraw function after the countdown ends
    } else {
      setCountdown(Math.floor(timeLeft / 1000));  // Convert to secs and set the countdown
    }
  }, 1000);

  return () => clearInterval(interval);  // Clear interval on unmount
}, [vaultContract]);  // Dependency to re-run just in case vaultContract changes



  return (
    <div className="min-h-screen bg-[#0a1f44] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-5 text-center">
        <img src={logo} alt="VerisphereX Logo" className="h-20 mx-auto mb-2" />
        <h1 className="text-2xl font-bold" style={{ color: "#0ae1f5" }}>VerisphereX Vault</h1>
        {isLoading && <div className="text-sm">Processing...</div>}
        {errorMessage && <div className="bg-red-600 px-4 py-2 rounded">{errorMessage}</div>}
        {statusMessage && <div className="bg-green-600 px-4 py-2 rounded">{statusMessage}</div>}
        {!active ? (
          <button onClick={connectWallet} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded">
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-left text-sm bg-[#091a3e] p-3 rounded">
              <p className="truncate">Connected: {account}</p>
              <p>Network: {networkName}</p>
              <p>Wallet ETH: {ethBalance?.slice(0, 6)} ETH</p>
              <p onClick={handleCheckBothBalances} className="underline cursor-pointer text-[#00ff88]">
                Check Your Locked Balance
              </p>
              {showUserBalance && (
                <p>Your Locked Balance: <span className="text-[#00ff88]">{userLockedBalance} ETH</span></p>
              )}
              {countdown !== null && (
               <p>Auto-withdraw in: {formatCountdown(countdown)}</p>

              )}

            </div>

            <input
              type="number"
              placeholder="Enter ETH amount"
              value={amountToLock}
              onChange={(e) => setAmountToLock(e.target.value)}
              className="w-full p-2 text-black rounded"
            />
            <button onClick={lockFunds} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Lock ETH
            </button>
            <button onClick={handleCheckBothBalances} className="w-full py-2 bg-gray-700 hover:bg-gray-800 rounded">
              Refresh Locked Balance
            </button>
            {account?.toLowerCase() === owner?.toLowerCase() && (
              <>
                <button onClick={withdrawFunds} className="w-full py-2 bg-vsxblue hover:bg-[#09c2d5] rounded">
                  Withdraw Funds (Owner Only)
                </button>
                <button onClick={fetchTransactionsForDisplay} className="w-full py-2 bg-vsxgreen hover:bg-[#00e676] rounded">
                  View Transaction History
                </button>
                {showTransactions && (
                  <div className="mt-4 text-left text-sm bg-[#091a3e] p-4 rounded max-h-64 overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-2 text-white">Transaction History</h2>
                    {transactions.length === 0 ? (
                      <p className="text-gray-400">No transactions found.</p>
                    ) : (
                      transactions.map((tx, idx) => (
                        <div key={idx} className="mb-3 border-b border-gray-700 pb-2">
                          <p className="text-white font-bold">{tx.type} | {tx.amount} ETH</p>
                          <p className="text-gray-400 truncate">Hash: {tx.hash}</p>
                          <p className="text-gray-500">Time: {tx.timestamp}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
            <button onClick={disconnectWallet} className="w-full py-2 bg-red-600 hover:bg-red-700 rounded">
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
