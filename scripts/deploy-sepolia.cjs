const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting Sepolia deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy SecretVoteGovernance with FHE support
  console.log("\nDeploying SecretVoteGovernance...");
  const SecretVoteGovernance = await hre.ethers.getContractFactory("SecretVoteGovernance");

  // SepoliaConfig auto-configures Oracle/Coprocessor addresses
  const contract = await SecretVoteGovernance.deploy(deployer.address);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("SecretVoteGovernance deployed to:", contractAddress);

  // Grant roles to deployer
  console.log("\nGranting roles to deployer...");
  const tx1 = await contract.grantProposerRole(deployer.address);
  await tx1.wait();
  console.log("PROPOSER_ROLE granted to:", deployer.address);

  const tx2 = await contract.grantVoterRole(deployer.address);
  await tx2.wait();
  console.log("VOTER_ROLE granted to:", deployer.address);

  // Update contract.ts with new address
  const contractConfigPath = path.join(__dirname, "../src/config/contract.ts");
  const contractConfig = `export const CONTRACT_ADDRESS = "${contractAddress}";
export const CONTRACT_CHAIN_ID = 11155111; // Sepolia
`;
  fs.writeFileSync(contractConfigPath, contractConfig);
  console.log("\nUpdated src/config/contract.ts");

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Sepolia");
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("\nVerify contract on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress} "${deployer.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
