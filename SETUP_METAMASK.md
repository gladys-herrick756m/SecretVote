# MetaMask Setup Guide for Local Development

## Problem
When testing locally, you may see "Insufficient ETH for network fees" or permission errors. This is because your MetaMask account is not the admin account on the local Hardhat node.

## Solution: Import Hardhat Test Account

### Step 1: Add Localhost Network to MetaMask

1. Open MetaMask
2. Click network dropdown → Add Network → Add a network manually
3. Fill in:
   - **Network Name**: Localhost 8545
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
4. Click "Save"

### Step 2: Import Hardhat Account #0 (Admin Account)

1. In MetaMask, click account icon → Import Account
2. Select "Private Key"
3. Paste this private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Import"

**This account has:**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Balance: 10,000 ETH (on localhost)
- Roles: ADMIN, PROPOSER, VOTER

### Step 3: Switch Network and Account

1. Switch MetaMask to "Localhost 8545" network
2. Switch to the imported account (Account #0)
3. Refresh the browser at http://localhost:8081

### Step 4: Test

1. Connect wallet on the SecretVote app
2. Navigate to "Create" page
3. Fill in proposal form and submit
4. MetaMask should prompt for transaction signature
5. After confirmation, proposal should be created successfully

---

## Alternative: Grant Roles to Your Current Account

If you prefer to use your existing MetaMask account, you need to grant it permissions:

1. Get your MetaMask address (e.g., `0x32ec95ff39425bd7f2c98d078a0b4afb03641521`)
2. Run this script with the imported Account #0:

```bash
cd /Users/lishuai/Documents/crypto/zama-developer-program/projects/SecretVote
node scripts/grant-roles.cjs <YOUR_METAMASK_ADDRESS>
```

This will grant PROPOSER_ROLE and VOTER_ROLE to your account.

---

## Security Warning

⚠️ **NEVER use Hardhat test accounts on mainnet or real testnets!** These private keys are publicly known. Any funds sent to these addresses on real networks will be lost.

Only use these accounts for local development with the Hardhat node.
