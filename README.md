# E-Voting System Using Blockchain Technology

A working educational mini-project based on the uploaded report's voting-system sections: Solidity smart contract, Ethereum-compatible local blockchain, MetaMask wallet, and browser frontend.

> **Important:** This is a classroom demo for local testing only, not a production or government election system. Wallet addresses are pseudonymous, but votes on a public chain are not inherently secret. Do not use real voter data or real funds.

## Features
- Connect/disconnect MetaMask
- Owner can add candidates and end voting
- One vote per wallet address
- Candidate list and live vote totals
- Transaction status / errors shown in the UI
- Deploy script automatically writes the contract address and ABI to `frontend/contract-config.js`
- Local Hardhat network for safe testing

## Requirements
- Node.js 18+ and npm
- MetaMask browser extension
- VS Code (recommended)

## Run on Windows PowerShell or terminal

1. Extract this ZIP and open the extracted `EVoting_Blockchain_Mini_Project` folder in VS Code.
2. Install packages:
   ```bash
   npm install
   ```
3. Start a local blockchain in terminal 1:
   ```bash
   npx hardhat node
   ```
   Keep this terminal running. It prints test accounts and private keys. **Use these accounts only on the local test network. Never import them for real funds.**
4. In terminal 2, deploy the contract:
   ```bash
   npm run deploy:local
   ```
   This generates `frontend/contract-config.js`.
5. Add the local network to MetaMask:
   - Network name: Hardhat Local
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency symbol: `ETH`
6. Import one of the test accounts shown by `npx hardhat node` into MetaMask (local testing only).
7. Serve the frontend from terminal 2:
   ```bash
   npm run frontend
   ```
8. Open `http://127.0.0.1:8080` in your browser and connect MetaMask.

## Demo flow
- The account used to deploy the contract is the owner.
- As owner, add candidates using the form.
- Connect a different local test account to cast a vote.
- Each wallet can vote once. Switch to another test account to test a second vote.
- Owner can end voting. After voting ends, no further votes can be cast.

## Troubleshooting
- If MetaMask says wrong network, select Hardhat Local (Chain ID 31337).
- If transactions fail after restarting `npx hardhat node`, deploy again with `npm run deploy:local`; the local chain resets.
- If the page says config missing, deploy first and refresh.
- If port 8080 is busy, change the port in the `frontend` script in `package.json`.

## Project structure
```
contracts/Voting.sol       Solidity voting contract
scripts/deploy.js          Deploys contract and writes frontend config
frontend/index.html        Voting UI
frontend/styles.css        Responsive styling
frontend/app.js            MetaMask + contract interactions
hardhat.config.js          Local development setup
```

## Academic note
The supplied report's abstract and scope contain some donation/animal-shelter text that conflicts with the title and voting sections. This implementation follows the **E-voting** requirements shown in the introduction, architecture, results, and conclusion: candidate registration, wallet connection, voting, vote totals, and ending an election.
