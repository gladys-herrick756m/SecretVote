import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Starting SecretVoteGovernance deployment...\n");

  // Get deployment parameters from environment
  const gatewayAddress = process.env.GATEWAY_ADDRESS;
  const adminAddress = process.env.ADMIN_ADDRESS;

  if (!gatewayAddress) {
    throw new Error("GATEWAY_ADDRESS not set in .env file");
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Use deployer as admin if not specified
  const admin = adminAddress || deployer.address;
  console.log("👤 Admin address:", admin);
  console.log("🔐 Gateway address:", gatewayAddress, "\n");

  // Deploy contract
  console.log("📦 Deploying SecretVoteGovernance contract...");
  const SecretVoteGovernance = await ethers.getContractFactory("SecretVoteGovernance");
  const secretVote = await SecretVoteGovernance.deploy(gatewayAddress, admin);

  await secretVote.waitForDeployment();
  const contractAddress = await secretVote.getAddress();

  console.log("✅ SecretVoteGovernance deployed to:", contractAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const proposalCount = await secretVote.getProposalCount();
  console.log("   Initial proposal count:", proposalCount.toString());

  // Check admin role
  const ADMIN_ROLE = await secretVote.ADMIN_ROLE();
  const hasAdminRole = await secretVote.hasRole(admin, ADMIN_ROLE);
  console.log("   Admin has ADMIN_ROLE:", hasAdminRole);

  console.log("\n✨ Deployment completed successfully!\n");

  // Print deployment summary
  console.log("📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", contractAddress);
  console.log("Gateway Address:", gatewayAddress);
  console.log("Admin Address:", admin);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  console.log("💾 Save the following to your frontend configuration:");
  console.log(`
export const SECRET_VOTE_CONTRACT = {
  address: "${contractAddress}",
  network: "${(await ethers.provider.getNetwork()).name}",
  chainId: ${(await ethers.provider.getNetwork()).chainId},
};
  `);

  console.log("\n📚 Next steps:");
  console.log("1. Grant VOTER_ROLE to DAO members:");
  console.log(`   await contract.grantVoterRole("0x...")`);
  console.log("\n2. Grant PROPOSER_ROLE to proposal creators:");
  console.log(`   await contract.grantProposerRole("0x...")`);
  console.log("\n3. Verify contract on explorer:");
  console.log(`   npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${contractAddress} "${gatewayAddress}" "${admin}"`);

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n✅ Deployment script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
