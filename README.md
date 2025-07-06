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

 Commercial use, resale, or production deployment of this code (especially escrow or auto-withdrawal logic) is **not permitted** without express permission from VerisphereX Limited.

 For integration requests, licensing, or commercial partnership, contact: verispherex@gmail.com


## MIT Licence

Note: The MIT License applies only to non-commercial and non-production use of this code.

Copyright (c) 2025 VerisphereX Limited

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.