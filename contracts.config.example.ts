/**
 * Contract Configuration Template
 *
 * After deploying the contract, copy this file to contracts.config.ts
 * and fill in the deployed contract address.
 */

export const CONTRACT_CONFIG = {
  // SecretVoteGovernance contract address (deployed)
  secretVote: {
    address: "0x...", // Fill this after deployment
    chainId: 11155111, // Sepolia testnet
    // or
    // chainId: 9000, // Zama devnet
  },

  // Zama Gateway configuration
  gateway: {
    address: "0x...", // Provided by Zama
    url: "https://gateway.zama.ai",
  },

  // Network configuration
  networks: {
    sepolia: {
      chainId: 11155111,
      name: "Sepolia",
      rpcUrl: "https://rpc.sepolia.org",
      explorer: "https://sepolia.etherscan.io",
    },
    zamaDevnet: {
      chainId: 9000,
      name: "Zama Devnet",
      rpcUrl: "https://devnet.zama.ai",
      explorer: "https://explorer.zama.ai", // If available
    },
  },

  // Role constants (computed from contract)
  roles: {
    ADMIN_ROLE: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
    PROPOSER_ROLE: "0x7804d923f43a17d325d77e781528e0793b2edd9890ab45fc64efd7b4b427744c",
    VOTER_ROLE: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
  },

  // Constants
  constants: {
    MIN_VOTING_DURATION: 3600, // 1 hour in seconds
    MAX_VOTING_DURATION: 2592000, // 30 days in seconds
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 2000,
  },

  // Vote choices
  voteChoice: {
    FOR: 0,
    AGAINST: 1,
    ABSTAIN: 2,
  },

  // Proposal status
  proposalStatus: {
    PENDING: 0,
    ACTIVE: 1,
    ENDED: 2,
    FINALIZED: 3,
    CANCELLED: 4,
  },
} as const;

export type VoteChoice = 0 | 1 | 2;
export type ProposalStatus = 0 | 1 | 2 | 3 | 4;
