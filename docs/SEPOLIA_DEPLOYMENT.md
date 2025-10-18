# Sepolia Testnet Deployment Guide

This guide explains how to deploy the SecretVote governance contract to Sepolia testnet with Zama FHE support.

## Prerequisites

1. **Sepolia ETH**: Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
2. **RPC Provider**: Alchemy, Infura, or public RPC
3. **Private Key**: Your deployer wallet private key

## Setup

### 1. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Your deployer private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL (recommended: Alchemy)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Get Sepolia RPC URL

**Option A: Alchemy (Recommended)**
1. Sign up at [Alchemy](https://www.alchemy.com/)
2. Create a new app for Sepolia
3. Copy the HTTPS URL

**Option B: Public RPC**
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### 3. Export Your Private Key from MetaMask

1. Open MetaMask
2. Click account menu → Account Details
3. Click "Show Private Key"
4. Enter password and copy the key
5. Paste into `.env` (without `0x` prefix)

## Deployment

### Deploy Contract

```bash
npx hardhat run scripts/deploy-sepolia.cjs --network sepolia
```

Expected output:
```
Starting Sepolia deployment...
Deploying with account: 0x...
Account balance: ...

Deploying SecretVoteGovernance...
SecretVoteGovernance deployed to: 0x...

Granting roles to deployer...
PROPOSER_ROLE granted to: 0x...
VOTER_ROLE granted to: 0x...

Updated src/config/contract.ts

=== Deployment Summary ===
Network: Sepolia
Contract: 0x...
Gateway: 0x33347831500F1e73f0ccCBcFc83F5F06F78780c1
Deployer: 0x...
```

The script automatically:
- Deploys the contract with Zama's Sepolia Gateway address
- Grants PROPOSER_ROLE and VOTER_ROLE to deployer
- Updates `src/config/contract.ts` with new address

### Verify Contract on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "0x33347831500F1e73f0ccCBcFc83F5F06F78780c1"
```

## Testing FHE Voting on Sepolia

### 1. Connect MetaMask to Sepolia

1. Open MetaMask
2. Click network dropdown
3. Select "Sepolia"
4. Ensure you have test ETH

### 2. Start Frontend

```bash
npm run dev
```

### 3. Test Voting Flow

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Switch to Sepolia**: Select Sepolia network in MetaMask
3. **Create Proposal**:
   - Click "Create Proposal"
   - Fill in title, description, voting duration
   - Confirm transaction in MetaMask
4. **Cast Vote**:
   - Open proposal detail
   - Click "Cast Your Vote"
   - Select For/Against/Abstain
   - Vote will be encrypted client-side using Zama FHE
   - Confirm transaction in MetaMask
5. **Finalize Tally** (after voting period ends):
   - Wait for voting period to end
   - Zama Gateway will decrypt the tally
   - View final results

## Zama FHE Architecture on Sepolia

### Components

1. **Gateway Contract** (`0x33347831500F1e73f0ccCBcFc83F5F06F78780c1`)
   - Handles FHE decryption requests
   - Relays results back to your contract

2. **KMS (Key Management Service)**
   - Manages FHE encryption keys
   - Performs decryption operations

3. **Coprocessor**
   - Executes FHE computations
   - Processes encrypted votes

### How FHE Voting Works

```
1. User selects vote → Frontend encrypts with FHE → Submit to contract
2. Contract stores encrypted vote (euint32)
3. Contract tallies encrypted votes (FHE addition)
4. Request decryption via Gateway
5. Gateway → KMS → Decryption → Callback to contract
6. Contract stores decrypted results
```

## Grant Additional Roles

To allow other addresses to create proposals or vote:

```bash
# Edit scripts/grant-roles.cjs and add addresses
node scripts/grant-roles.cjs
```

## Troubleshooting

### "Insufficient funds"
- Get more Sepolia ETH from [faucet](https://sepoliafaucet.com/)

### "Invalid API Key"
- Verify your Alchemy API key in `.env`
- Try using public RPC: `https://rpc.sepolia.org`

### "Nonce too high"
- Reset MetaMask account: Settings → Advanced → Clear Activity Tab Data

### "FHE operations failing"
- Ensure you're on Sepolia (not localhost)
- Verify Gateway address: `0x33347831500F1e73f0ccCBcFc83F5F06F78780c1`

## Resources

- [Zama fhEVM Docs](https://docs.zama.ai/fhevm)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy](https://www.alchemy.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
