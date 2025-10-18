const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Quick Contract Test\n");

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const [admin] = await ethers.getSigners();

  console.log("Testing account:", admin.address);
  console.log("Contract address:", contractAddress);

  // Get contract instance
  const contract = await ethers.getContractAt("SecretVoteGovernance", contractAddress);

  // Test basic reads
  console.log("\n1. Testing basic reads:");
  const count = await contract.getProposalCount();
  console.log("   Proposal count:", count.toString());

  const PROPOSER_ROLE = await contract.PROPOSER_ROLE();
  console.log("   PROPOSER_ROLE:", PROPOSER_ROLE);

  // Check if admin has proposer role
  console.log("\n2. Checking roles:");
  try {
    const roles = await contract.roles(admin.address);
    console.log("   Admin roles hash:", roles);
    console.log("   Has PROPOSER_ROLE?", roles === PROPOSER_ROLE);
  } catch (e) {
    console.log("   Error checking roles:", e.message);
  }

  // Try to create a proposal with admin account
  console.log("\n3. Creating proposal with admin account:");
  try {
    const tx = await contract.createProposal(
      "Test Proposal",
      "This is a test proposal",
      7 * 24 * 60 * 60 // 7 days
    );
    console.log("   Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("   ✅ Transaction confirmed!");
    console.log("   Gas used:", receipt.gasUsed.toString());

    const newCount = await contract.getProposalCount();
    console.log("   New proposal count:", newCount.toString());
  } catch (e) {
    console.log("   ❌ Error:", e.message);
    if (e.data) {
      console.log("   Error data:", e.data);
    }
  }

  console.log("\n✅ Quick test complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
