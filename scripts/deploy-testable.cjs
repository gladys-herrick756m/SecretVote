const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 Deploying SecretVoteGovernanceTestable (for local testing)...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  console.log(`Account balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  const gatewayAddress = deployer.address; // Use deployer as mock gateway
  const adminAddress = deployer.address;

  const SecretVoteGovernanceTestable = await hre.ethers.getContractFactory("SecretVoteGovernanceTestable");
  const secretVote = await SecretVoteGovernanceTestable.deploy(gatewayAddress, adminAddress);

  await secretVote.waitForDeployment();
  const contractAddress = await secretVote.getAddress();

  console.log(`✅ SecretVoteGovernanceTestable deployed to: ${contractAddress}`);
  console.log(`   Gateway: ${gatewayAddress}`);
  console.log(`   Admin: ${adminAddress}\n`);

  // Export deployment info
  const deploymentInfo = {
    address: contractAddress,
    gateway: gatewayAddress,
    admin: adminAddress,
    network: "localhost",
    chainId: 31337,
    timestamp: new Date().toISOString(),
    accounts: [
      { address: deployer.address, roles: ["ADMIN", "PROPOSER", "VOTER"] }
    ]
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment-testable.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Export contract address for frontend
  const contractConfig = `export const CONTRACT_ADDRESS = "${contractAddress}";
export const CONTRACT_CHAIN_ID = 31337;
export const GATEWAY_ADDRESS = "${gatewayAddress}";
`;

  fs.writeFileSync(
    path.join(__dirname, "../src/config/contract.ts"),
    contractConfig
  );

  // Export ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/SecretVoteGovernanceTestable.sol/SecretVoteGovernanceTestable.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  fs.writeFileSync(
    path.join(__dirname, "../src/config/SecretVoteGovernance.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("✅ Contract config exported to src/config/");
  console.log("✅ ABI exported to src/config/SecretVoteGovernance.json\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
