import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

async function main() {
  console.log("📦 Exporting contract ABIs...\n");

  // Import artifact
  const SecretVoteGovernance = await import(
    "../artifacts/contracts/SecretVoteGovernance.sol/SecretVoteGovernance.json"
  );

  // Create output directory
  const outputDir = join(__dirname, "../src/contracts");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Export ABI
  const abiPath = join(outputDir, "SecretVoteGovernance.json");
  writeFileSync(
    abiPath,
    JSON.stringify(
      {
        contractName: "SecretVoteGovernance",
        abi: SecretVoteGovernance.abi,
      },
      null,
      2
    )
  );

  console.log("✅ ABI exported to:", abiPath);

  // Create TypeScript constant file
  const tsContent = `// Auto-generated file - do not edit manually
import SecretVoteGovernanceABI from "./SecretVoteGovernance.json";

export const SECRET_VOTE_ABI = SecretVoteGovernanceABI.abi;

export const SECRET_VOTE_CONTRACT = {
  address: process.env.VITE_CONTRACT_ADDRESS || "",
  abi: SECRET_VOTE_ABI,
} as const;

export type VoteChoice = 0 | 1 | 2; // FOR, AGAINST, ABSTAIN
export type ProposalStatus = 0 | 1 | 2 | 3 | 4; // PENDING, ACTIVE, ENDED, FINALIZED, CANCELLED

export const VOTE_CHOICE = {
  FOR: 0,
  AGAINST: 1,
  ABSTAIN: 2,
} as const;

export const PROPOSAL_STATUS = {
  PENDING: 0,
  ACTIVE: 1,
  ENDED: 2,
  FINALIZED: 3,
  CANCELLED: 4,
} as const;

export const ROLES = {
  ADMIN: "0x" + "ADMIN_ROLE".split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
  PROPOSER: "0x" + "PROPOSER_ROLE".split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
  VOTER: "0x" + "VOTER_ROLE".split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
} as const;
`;

  const tsPath = join(outputDir, "index.ts");
  writeFileSync(tsPath, tsContent);

  console.log("✅ TypeScript constants exported to:", tsPath);
  console.log("\n📋 Import in your frontend:");
  console.log('   import { SECRET_VOTE_CONTRACT, VOTE_CHOICE } from "./contracts";\n');
}

main()
  .then(() => {
    console.log("✨ Export completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Export failed:", error);
    process.exit(1);
  });
