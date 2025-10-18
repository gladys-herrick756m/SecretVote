# SecretVote - DAO Governance Voting System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://secretvote-dao.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/gladys-herrick756m/SecretVote)
[![Contract](https://img.shields.io/badge/Sepolia-Contract-orange?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/address/0x9601411c00f3C3365686912deCDb61080dC7232b)

🔗 **Live Application**: https://secretvote-dao.vercel.app

## Project Overview

SecretVote is a privacy-preserving DAO governance voting platform built on Zama's fhEVM technology. It enables DAO members to cast encrypted votes on proposals while keeping individual voting choices private. Only the final aggregated results are revealed after the voting period ends.

## Key Features

- **Private Voting**: Individual votes remain encrypted on-chain using FHE
- **Public Results**: Final vote counts are decrypted via Gateway after voting ends
- **Proposal Management**: Create and manage multiple proposals
- **Access Control**: Only eligible DAO members can vote
- **Time-locked Voting**: Votes are locked during the voting period

## Technical Architecture

### Smart Contract (Solidity + fhEVM)
- Encrypted vote storage using `euint32`
- Vote aggregation with `FHE.add()`
- Gateway integration for result decryption
- Role-based access control

### Frontend (Next.js + Wagmi + RainbowKit)
- Modern, professional UI with ❤️ theme
- Wallet connection via RainbowKit
- Vote encryption before submission
- Real-time proposal status

### Privacy Implementation
- Votes stored as encrypted ciphertexts
- No plaintext vote data on-chain
- Gateway-based decryption for results

## Technology Stack

- **Smart Contracts**: Solidity 0.8.24, fhevmjs
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: Wagmi v2, RainbowKit, Viem
- **Development**: Hardhat, fhEVM
- **Testing**: Hardhat, Chai

## Project Structure

```
SecretVote/
├── contracts/
│   └── SecretVoteGovernance.sol    # Main voting contract
├── scripts/
│   └── deploy.ts                    # Deployment script
├── test/
│   └── SecretVoteGovernance.test.ts # Test cases
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Main voting page
│   ├── components/
│   │   ├── ProposalCard.tsx        # Proposal display
│   │   ├── VoteModal.tsx           # Voting interface
│   │   └── ConnectButton.tsx       # Wallet connection
│   ├── hooks/
│   │   └── useSecretVote.ts        # Contract interaction
│   └── lib/
│       └── fhevm.ts                # FHE encryption utils
├── hardhat.config.ts               # Hardhat configuration
├── package.json
└── README.md
```

## Dependencies

### Smart Contract Dependencies
```json
{
  "fhevm": "^0.5.0",
  "fhevm-core-contracts": "^0.5.0",
  "@openzeppelin/contracts": "^5.0.0"
}
```

### Frontend Dependencies
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "wagmi": "^2.9.0",
  "@rainbow-me/rainbowkit": "^2.0.0",
  "viem": "^2.13.0",
  "fhevmjs": "^0.5.0",
  "tailwindcss": "^3.4.0"
}
```

## Installation & Setup

### 1. Install Dependencies
```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
PRIVATE_KEY=your_private_key
GATEWAY_URL=https://gateway.devnet.zama.ai
```

### 3. Compile Contracts
```bash
npx hardhat compile
```

### 4. Run Tests
```bash
npx hardhat test
```

### 5. Deploy Contract
```bash
# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost

# Deploy to Zama testnet
npx hardhat run scripts/deploy.ts --network zamaTestnet
```

### 6. Start Frontend
```bash
cd frontend
npm run dev
```

## Usage Guide

### For DAO Administrators

1. **Create Proposal**
   - Connect wallet as admin
   - Click "Create Proposal"
   - Enter proposal details
   - Set voting duration
   - Submit transaction

2. **End Voting**
   - Wait for voting period to end
   - Click "Finalize Results"
   - Gateway will decrypt final vote counts

### For DAO Members

1. **View Proposals**
   - Connect wallet
   - Browse active proposals
   - Read proposal descriptions

2. **Cast Vote**
   - Click "Vote" on a proposal
   - Select your choice (For/Against/Abstain)
   - Your vote is encrypted locally
   - Submit encrypted vote transaction

3. **View Results**
   - After voting ends, view decrypted results
   - Individual votes remain private

## Security Considerations

- All votes encrypted with FHE before submission
- No plaintext voting data stored on-chain
- Gateway decryption only after voting period
- Access control prevents unauthorized voting
- Time-locks prevent vote manipulation

## Testing

Run comprehensive test suite:
```bash
npm test
```

Tests cover:
- Proposal creation and management
- Encrypted vote submission
- Vote aggregation
- Gateway decryption
- Access control
- Edge cases

## Deployment

### Testnet Deployment
```bash
npx hardhat run scripts/deploy.ts --network zamaTestnet
```

### Mainnet Deployment
```bash
npx hardhat run scripts/deploy.ts --network zamaMainnet
```

## License

MIT License

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Documentation: [Zama fhEVM Docs](https://docs.zama.ai/fhevm)
