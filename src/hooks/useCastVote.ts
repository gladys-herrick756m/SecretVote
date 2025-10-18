import { getFheInstance, initializeFheInstance } from '@/utils/fheEncrypt';
import { ethers, getAddress, hexlify } from 'ethers';
import { CONTRACT_ADDRESS } from '@/config/contract';
import { SecretVoteABI } from '@/config/abi';

export function useCastVote() {
  const castConfidentialVote = async ({
    proposalId,
    voteChoice,
    signer,
    setVoteStep,
    onCastVote,
  }: {
    proposalId: string | bigint;
    voteChoice: number;
    signer?: ethers.Signer;
    setVoteStep?: (step: string) => void;
    onCastVote?: (choice: number) => void;
  }) => {
    try {
      console.log('[Vote] Starting confidential vote', { proposalId, voteChoice });
      
      // Initialize FHEVM if not already initialized
      let fhe = getFheInstance();
      if (!fhe) {
        if (setVoteStep) setVoteStep('initializing');
        console.log('[Vote] Initializing FHE instance...');
        fhe = await initializeFheInstance();
        if (setVoteStep) setVoteStep('ready');
      }
      if (!fhe) throw new Error('Failed to initialize FHE instance');

      const contractAddressChecksum = getAddress(CONTRACT_ADDRESS);
      
      // Get signer
      let effectiveSigner = signer;
      if (!effectiveSigner) {
        if (typeof window === 'undefined' || !(window as any).ethereum) {
          throw new Error('No signer available and no injected provider found');
        }
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        effectiveSigner = await provider.getSigner();
      }
      const userAddress = await effectiveSigner.getAddress();
      console.log('[Vote] User address:', userAddress);

      // Encrypt the vote choice
      if (setVoteStep) setVoteStep('encrypting');
      console.log('[Vote] Encrypting vote choice...');
      const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
      ciphertext.add32(BigInt(voteChoice));
      const { handles, inputProof } = await ciphertext.encrypt();
      const encryptedHex = hexlify(handles[0]);
      const proofHex = hexlify(inputProof);
      console.log('[Vote] Encryption complete', {
        encryptedLength: encryptedHex.length,
        proofLength: proofHex.length,
      });

      // Call the contract's castVote function
      if (setVoteStep) setVoteStep('casting');
      console.log('[Vote] Calling contract castVote...');
      const contract = new ethers.Contract(contractAddressChecksum, SecretVoteABI, effectiveSigner);
      const tx = await contract.castVote(
        BigInt(proposalId),
        encryptedHex,
        proofHex,
        { gasLimit: 1000000 }
      );
      console.log('[Vote] Transaction sent:', tx.hash);
      
      if (setVoteStep) setVoteStep('confirming');
      await tx.wait();
      console.log('[Vote] Transaction confirmed');

      if (onCastVote) onCastVote(voteChoice);
      if (setVoteStep) setVoteStep('success');
    } catch (err) {
      console.error('[Vote] Error in castConfidentialVote:', err);
      if (setVoteStep) setVoteStep('error');
      throw err;
    }
  };
  
  return { castConfidentialVote };
}
