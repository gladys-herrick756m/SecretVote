# SecretVote - Backend Development Documentation

## Overview

This document provides comprehensive backend development specifications for SecretVote, a DAO governance voting system using Zama's fhEVM technology for privacy-preserving votes.

## Smart Contract Architecture

### Contract Name: `SecretVoteGovernance`

### Core Features

1. **Encrypted Vote Storage**: Uses `euint32` for storing encrypted votes
2. **Vote Aggregation**: Implements `FHE.add()` for tallying encrypted votes
3. **Gateway Decryption**: Integrates Zama Gateway for revealing final results
4. **Access Control**: Role-based permissions for proposal creation and voting
5. **Time-Lock Mechanism**: Enforces voting periods

## Data Structures

### Proposal Structure
```solidity
struct Proposal {
    uint256 id;                    // Unique proposal identifier
    string title;                  // Proposal title
    string description;            // Detailed description
    address proposer;              // Address of proposal creator
    uint256 startTime;             // Voting start timestamp
    uint256 endTime;               // Voting end timestamp
    euint32 votesFor;              // Encrypted votes in favor
    euint32 votesAgainst;          // Encrypted votes against
    euint32 votesAbstain;          // Encrypted abstain votes
    bool finalized;                // Whether results are decrypted
    uint256 decryptedFor;          // Final decrypted for votes
    uint256 decryptedAgainst;      // Final decrypted against votes
    uint256 decryptedAbstain;      // Final decrypted abstain votes
    ProposalStatus status;         // Current proposal state
}
```

### Vote Choice Enum
```solidity
enum VoteChoice {
    FOR,      // Vote in favor (0)
    AGAINST,  // Vote against (1)
    ABSTAIN   // Abstain from voting (2)
}
```

### Proposal Status Enum
```solidity
enum ProposalStatus {
    PENDING,    // Voting not started
    ACTIVE,     // Voting in progress
    ENDED,      // Voting ended, awaiting finalization
    FINALIZED,  // Results decrypted and final
    CANCELLED   // Proposal cancelled
}
```

## Smart Contract Functions

### Administrative Functions

#### `createProposal`
```solidity
function createProposal(
    string memory _title,
    string memory _description,
    uint256 _votingDuration
) external onlyRole(PROPOSER_ROLE) returns (uint256)
```

**Description**: Creates a new voting proposal

**Parameters**:
- `_title`: Proposal title (max 200 characters)
- `_description`: Detailed description (max 2000 characters)
- `_votingDuration`: Duration in seconds (minimum 1 hour, maximum 30 days)

**Returns**: Proposal ID

**Emits**: `ProposalCreated(uint256 proposalId, address proposer, string title)`

**Access Control**: Requires `PROPOSER_ROLE`

#### `cancelProposal`
```solidity
function cancelProposal(uint256 _proposalId) external onlyRole(ADMIN_ROLE)
```

**Description**: Cancels an active proposal

**Requirements**:
- Proposal must exist
- Proposal must not be finalized
- Only admin can cancel

**Emits**: `ProposalCancelled(uint256 proposalId)`

### Voting Functions

#### `castVote`
```solidity
function castVote(
    uint256 _proposalId,
    einput _encryptedVote,
    bytes calldata _inputProof
) external onlyRole(VOTER_ROLE)
```

**Description**: Submits an encrypted vote for a proposal

**Parameters**:
- `_proposalId`: ID of the proposal
- `_encryptedVote`: Encrypted vote choice (0=FOR, 1=AGAINST, 2=ABSTAIN)
- `_inputProof`: FHE encryption proof from fhevmjs

**Requirements**:
- Proposal must be active
- Voter has not already voted
- Current time within voting period
- Vote value must be 0, 1, or 2

**Process**:
1. Verify proposal is active
2. Check voter has not voted before
3. Validate encrypted input with proof
4. Convert to `euint32` type
5. Add to corresponding vote counter using `FHE.add()`
6. Mark voter as voted

**Emits**: `VoteCast(uint256 proposalId, address voter)`

**Gas Optimization**: Uses bitmap for tracking voters

#### `hasVoted`
```solidity
function hasVoted(uint256 _proposalId, address _voter)
    external
    view
    returns (bool)
```

**Description**: Checks if an address has voted on a proposal

**Returns**: Boolean indicating vote status

### Result Finalization

#### `requestDecryption`
```solidity
function requestDecryption(uint256 _proposalId)
    external
    returns (uint256[] memory)
```

**Description**: Requests Gateway to decrypt final vote counts

**Requirements**:
- Voting period must be ended
- Proposal not already finalized
- Called by admin or proposer

**Process**:
1. Verify voting has ended
2. Request Gateway decryption for all three vote types
3. Store decryption request IDs
4. Set proposal status to pending finalization

**Returns**: Array of Gateway request IDs `[forRequestId, againstRequestId, abstainRequestId]`

**Emits**: `DecryptionRequested(uint256 proposalId, uint256[] requestIds)`

#### `fulfillDecryption`
```solidity
function fulfillDecryption(
    uint256 _proposalId,
    uint256 _decryptedFor,
    uint256 _decryptedAgainst,
    uint256 _decryptedAbstain
) external onlyGateway
```

**Description**: Gateway callback to store decrypted results

**Requirements**:
- Only callable by Gateway contract
- Proposal must be in decryption pending state

**Process**:
1. Store decrypted vote counts
2. Mark proposal as finalized
3. Determine outcome (passed/rejected based on votes)

**Emits**: `ProposalFinalized(uint256 proposalId, uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain)`

### View Functions

#### `getProposal`
```solidity
function getProposal(uint256 _proposalId)
    external
    view
    returns (Proposal memory)
```

**Description**: Retrieves complete proposal information

**Returns**: Proposal struct with all details

#### `getProposalStatus`
```solidity
function getProposalStatus(uint256 _proposalId)
    external
    view
    returns (ProposalStatus)
```

**Description**: Gets current status of a proposal

**Returns**: ProposalStatus enum value

#### `isVotingActive`
```solidity
function isVotingActive(uint256 _proposalId)
    external
    view
    returns (bool)
```

**Description**: Checks if voting is currently open

**Returns**: True if current time is within voting period

#### `getDecryptedResults`
```solidity
function getDecryptedResults(uint256 _proposalId)
    external
    view
    returns (uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain)
```

**Description**: Retrieves final decrypted vote counts

**Requirements**: Proposal must be finalized

**Returns**: Tuple of vote counts

## Access Control

### Roles

```solidity
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
```

### Role Management

#### `grantVoterRole`
```solidity
function grantVoterRole(address _voter) external onlyRole(ADMIN_ROLE)
```

**Description**: Grants voting rights to an address

#### `revokeVoterRole`
```solidity
function revokeVoterRole(address _voter) external onlyRole(ADMIN_ROLE)
```

**Description**: Revokes voting rights from an address

#### `grantProposerRole`
```solidity
function grantProposerRole(address _proposer) external onlyRole(ADMIN_ROLE)
```

**Description**: Grants proposal creation rights

## Events

```solidity
event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    string title,
    uint256 startTime,
    uint256 endTime
);

event VoteCast(
    uint256 indexed proposalId,
    address indexed voter
);

event DecryptionRequested(
    uint256 indexed proposalId,
    uint256[] requestIds
);

event ProposalFinalized(
    uint256 indexed proposalId,
    uint256 votesFor,
    uint256 votesAgainst,
    uint256 votesAbstain,
    bool passed
);

event ProposalCancelled(
    uint256 indexed proposalId
);

event VoterRoleGranted(address indexed voter);
event VoterRoleRevoked(address indexed voter);
```

## FHE Operations

### Vote Encryption
- Client-side encryption using fhevmjs library
- Vote choice (0, 1, or 2) encrypted to `euint32`
- Encryption proof generated and verified on-chain

### Vote Aggregation
```solidity
// Initialize counters
euint32 votesFor = TFHE.asEuint32(0);
euint32 votesAgainst = TFHE.asEuint32(0);
euint32 votesAbstain = TFHE.asEuint32(0);

// Add encrypted vote based on choice
euint32 encryptedVote = TFHE.asEuint32(_encryptedVote, _inputProof);
ebool isFor = TFHE.eq(encryptedVote, TFHE.asEuint32(0));
ebool isAgainst = TFHE.eq(encryptedVote, TFHE.asEuint32(1));
ebool isAbstain = TFHE.eq(encryptedVote, TFHE.asEuint32(2));

// Conditional addition using FHE.select
euint32 toAddFor = TFHE.select(isFor, TFHE.asEuint32(1), TFHE.asEuint32(0));
votesFor = TFHE.add(votesFor, toAddFor);

// Similar for votesAgainst and votesAbstain
```

### Gateway Decryption
```solidity
// Request decryption
uint256[] memory requestIds = Gateway.requestDecryption(
    votesFor,
    votesAgainst,
    votesAbstain,
    this.fulfillDecryption.selector
);
```

## Security Considerations

### Vote Privacy
- All votes stored as encrypted `euint32` on-chain
- Individual votes never decrypted
- Only aggregate counts revealed after voting ends
- No way to trace vote to voter address

### Access Control
- Role-based permissions prevent unauthorized actions
- Voter must be granted VOTER_ROLE before voting
- Proposer must have PROPOSER_ROLE to create proposals
- Admin controls role assignments

### Time-Lock Security
- Votes only accepted during active voting period
- Decryption only possible after voting ends
- Prevents late vote manipulation

### Double Voting Prevention
- Mapping tracks voted addresses per proposal
- `hasVoted` check before accepting vote
- One address = one vote per proposal

### Input Validation
- Vote choice must be 0, 1, or 2
- Encryption proof verified via TFHE
- Proposal ID existence validated
- Duration limits enforced (1 hour - 30 days)

## Gas Optimization

### Storage Optimization
- Use bitmap for voter tracking instead of array
- Pack proposal fields efficiently
- Use uint256 for IDs and timestamps (native word size)

### Computation Optimization
- Batch role grants when possible
- Minimize FHE operations (expensive)
- Cache proposal status calculations
- Use view functions to read data off-chain

## Error Handling

```solidity
error ProposalNotFound(uint256 proposalId);
error VotingNotActive(uint256 proposalId);
error AlreadyVoted(uint256 proposalId, address voter);
error InvalidVoteChoice(uint32 choice);
error ProposalAlreadyFinalized(uint256 proposalId);
error VotingNotEnded(uint256 proposalId);
error UnauthorizedAccess(address caller, bytes32 requiredRole);
error InvalidDuration(uint256 duration);
```

## Testing Requirements

### Unit Tests
1. Proposal creation with valid parameters
2. Vote casting with encrypted inputs
3. Double voting prevention
4. Role-based access control
5. Time-lock enforcement
6. Vote aggregation accuracy
7. Gateway decryption flow
8. Edge case handling

### Integration Tests
1. End-to-end voting flow
2. Multiple proposals simultaneously
3. Gateway interaction
4. Role management workflows
5. Proposal cancellation

### Security Tests
1. Unauthorized access attempts
2. Invalid vote choices
3. Vote manipulation attempts
4. Reentrancy attack vectors
5. Integer overflow/underflow

## Deployment Configuration

### Constructor Parameters
```solidity
constructor(
    address _gatewayAddress,
    address _admin
)
```

### Initial Setup Steps
1. Deploy contract with Gateway address
2. Grant admin role to deployer
3. Grant proposer roles to designated addresses
4. Grant voter roles to DAO members
5. Set initial parameters (if any)

### Network Configuration

#### Zama Testnet
- Network: Zama Devnet
- Gateway: 0x... (provided by Zama)
- Chain ID: 9000
- Gas Price: Dynamic

#### Mainnet (Future)
- Network: Zama Mainnet
- Gateway: TBD
- Chain ID: TBD

## API Reference

### Read Operations (No Gas)
- `getProposal(uint256)`
- `getProposalStatus(uint256)`
- `isVotingActive(uint256)`
- `hasVoted(uint256, address)`
- `getDecryptedResults(uint256)`

### Write Operations (Gas Required)
- `createProposal(string, string, uint256)`
- `castVote(uint256, einput, bytes)`
- `requestDecryption(uint256)`
- `cancelProposal(uint256)`
- `grantVoterRole(address)`
- `revokeVoterRole(address)`

## Code Style Guidelines

### Naming Conventions
- Contract: PascalCase (`SecretVoteGovernance`)
- Functions: camelCase (`castVote`)
- Variables: camelCase with underscore prefix for parameters (`_proposalId`)
- Constants: UPPER_SNAKE_CASE (`VOTER_ROLE`)
- Events: PascalCase (`ProposalCreated`)

### Documentation
- NatSpec comments for all public functions
- Inline comments for complex logic
- English only for all documentation
- Parameter descriptions with types and constraints

### Code Organization
1. Pragma statements
2. Imports
3. Interfaces
4. Libraries
5. Contract declaration
6. State variables
7. Events
8. Modifiers
9. Constructor
10. External functions
11. Public functions
12. Internal functions
13. Private functions
14. View/Pure functions

## Maintenance & Upgrades

### Upgradeability
- Current version: Non-upgradeable for security
- Future: Consider proxy pattern for upgrades
- State migration planning required

### Monitoring
- Event emission for all state changes
- Off-chain indexing recommended
- Alert on suspicious voting patterns

### Backup & Recovery
- All data on-chain (immutable)
- No off-chain dependencies
- Gateway availability critical

## Dependencies

```json
{
  "fhevm": "^0.5.0",
  "fhevm-core-contracts": "^0.5.0",
  "@openzeppelin/contracts": "^5.0.0",
  "@openzeppelin/contracts-upgradeable": "^5.0.0"
}
```

## Build & Compilation

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Generate TypeScript bindings
npx hardhat typechain

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network zamaTestnet
```

## Hardhat Configuration

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-fhevm";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    zamaTestnet: {
      url: "https://devnet.zama.ai",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 9000
    }
  },
  fhevm: {
    gateway: process.env.GATEWAY_URL
  }
};

export default config;
```

## Contract Address Registry

### Testnet Deployments
- Contract: `0x...` (to be deployed)
- Gateway: `0x...` (provided by Zama)
- Admin: `0x...` (deployer address)

### Verification
```bash
npx hardhat verify --network zamaTestnet DEPLOYED_CONTRACT_ADDRESS "GATEWAY_ADDRESS" "ADMIN_ADDRESS"
```

## Support & Resources

- Zama fhEVM Docs: https://docs.zama.ai/fhevm
- GitHub Repository: [Link to repo]
- Technical Support: [Support channel]
- Community Discord: [Discord invite]
