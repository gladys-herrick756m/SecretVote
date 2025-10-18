const hre = require("hardhat");

async function main() {
  const contractAddress = '0x9601411c00f3C3365686912deCDb61080dC7232b';
  console.log('Checking contract:', contractAddress);

  const contract = await hre.ethers.getContractAt('SecretVoteGovernance', contractAddress);

  console.log('\n=== Checking proposal count ===');
  const count = await contract.getProposalCount();
  console.log('Total proposals:', count.toString());

  if (count > 0n) {
    for (let i = 0n; i < count; i++) {
      console.log(`\n=== Proposal ${i} ===`);
      try {
        const proposal = await contract.getProposal(i);
        console.log('ID:', proposal[0].toString());
        console.log('Title:', proposal[1]);
        console.log('Description:', proposal[2]);
        console.log('Proposer:', proposal[3]);
        console.log('Start Time:', new Date(Number(proposal[4]) * 1000).toISOString());
        console.log('End Time:', new Date(Number(proposal[5]) * 1000).toISOString());
        console.log('Status:', proposal[10]);
      } catch(e) {
        console.error('Error fetching proposal:', e.message);
      }
    }
  } else {
    console.log('\nNo proposals found in contract.');
  }
}

main().catch(console.error);
