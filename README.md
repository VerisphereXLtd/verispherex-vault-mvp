# VerisphereX Vault – v2 Escrow & Auto-Withdrawal Update

This version introduces core escrow mechanics and auto-withdrawal functionality into the VerisphereX Vault MVP. Users can now lock ETH, and the contract automatically releases funds after the lock duration expires — creating a trustless escrow experience with zero user friction.

## Stack
- React (Frontend)
- Ethers.js (Blockchain Interaction)
- Hardhat (Smart Contract Dev)
- Sepolia Testnet

## Core Features V2
Escrow-based ETH Locking
Users can lock ETH into the smart contract, which holds funds securely for a preset time (default: 3 minutes).

Auto Withdrawal on Unlock
Once the lock time elapses, the contract automatically triggers a withdrawal back to the user wallet, no manual interaction needed from the user at all.

Transaction History
Owners can view all LOCK and WITHDRAW events pulled directly from on-chain logs via filters.

User-Specific Balance Queries
Users can fetch their own locked balances and unlock timestamps.


## Licensing & Usage Notice

This repository contains a public demo of VerisphereX Vault infrastructure and is intended solely for educational and non-commercial demonstration purposes.

**Commercial use, resale, or production deployment of this code (especially escrow or auto-withdrawal logic) is not permitted without express permission from VerisphereX Limited.**

For integration requests, licensing, or commercial partnership, contact: **verispherex@gmail.com**

## License

This project is covered under the **VerisphereX Vault – Restricted License**.

Permission is granted to use, study, and modify this code **only for non-commercial and educational purposes**.  
Use in live production systems or commercial platforms requires prior written consent.

See the [`LICENSE`](./Vsx-Restricted-License) file for full terms.
