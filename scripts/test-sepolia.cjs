const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log('Testing with account:', signer.address);

  const contract = await hre.ethers.getContractAt('SecretVoteGovernance', '0x78E5C3bc097CcB0323D9674E8f80B3C385792187', signer);

  // Check admin
  const admin = await contract.admin();
  console.log('Contract admin:', admin);

  // Check roles
  const PROPOSER_ROLE = await contract.PROPOSER_ROLE();
  const VOTER_ROLE = await contract.VOTER_ROLE();
  console.log('PROPOSER_ROLE:', PROPOSER_ROLE);
  console.log('VOTER_ROLE:', VOTER_ROLE);

  // Check if signer has roles
  const signerRole = await contract.roles(signer.address);
  console.log('Signer role:', signerRole);
  console.log('Has PROPOSER_ROLE:', signerRole === PROPOSER_ROLE);

  // Try to estimate gas
  try {
    const gas = await contract.createProposal.estimateGas('Test', 'Test Description', 86400);
    console.log('Estimated gas:', gas.toString());
  } catch(e) {
    console.error('Gas estimation failed:', e.shortMessage || e.message);
    if (e.data) console.error('Error data:', e.data);
  }
}

main().catch(console.error);
