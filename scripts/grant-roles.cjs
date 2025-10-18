const hre = require("hardhat");
const { CONTRACT_ADDRESS } = require("../src/config/contract");

async function main() {
  const targetAddress = process.argv[2];

  if (!targetAddress) {
    console.error("Usage: node scripts/grant-roles.cjs <ADDRESS>");
    console.error("Example: node scripts/grant-roles.cjs 0x32ec95ff39425bd7f2c98d078a0b4afb03641521");
    process.exit(1);
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
    console.error("Invalid Ethereum address");
    process.exit(1);
  }

  const [admin] = await hre.ethers.getSigners();
  console.log(`Admin address: ${admin.address}`);
  console.log(`Target address: ${targetAddress}`);
  console.log(`Contract address: ${CONTRACT_ADDRESS}\n`);

  const SecretVote = await hre.ethers.getContractAt("SecretVoteGovernance", CONTRACT_ADDRESS);

  const PROPOSER_ROLE = await SecretVote.PROPOSER_ROLE();
  const VOTER_ROLE = await SecretVote.VOTER_ROLE();

  console.log("Granting PROPOSER_ROLE...");
  const tx1 = await SecretVote.connect(admin).grantRole(PROPOSER_ROLE, targetAddress);
  await tx1.wait();
  console.log(`✅ PROPOSER_ROLE granted (tx: ${tx1.hash})`);

  console.log("Granting VOTER_ROLE...");
  const tx2 = await SecretVote.connect(admin).grantRole(VOTER_ROLE, targetAddress);
  await tx2.wait();
  console.log(`✅ VOTER_ROLE granted (tx: ${tx2.hash})`);

  console.log(`\n✅ Roles successfully granted to ${targetAddress}`);
  console.log("The account can now create proposals and vote.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
