import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, SecretVoteABI } from '@/config/abi';
import { useChainId } from 'wagmi';

// Sepolia gas cap workaround
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_MAX_GAS = 10000000n; // Safe limit below 16777216 cap

export function useProposalCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SecretVoteABI,
    functionName: 'getProposalCount',
  });
}

export function useProposal(proposalId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SecretVoteABI,
    functionName: 'getProposal',
    args: proposalId !== undefined ? [proposalId] : undefined,
    query: { enabled: proposalId !== undefined },
  });
}

export function useCreateProposal() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const chainId = useChainId();

  const createProposal = (title: string, description: string, votingPeriod: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: SecretVoteABI,
      functionName: 'createProposal',
      args: [title, description, votingPeriod],
      ...(chainId === SEPOLIA_CHAIN_ID && { gas: SEPOLIA_MAX_GAS }),
    });
  };

  return { createProposal, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useCastVote() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const chainId = useChainId();

  const castVote = (proposalId: bigint, encryptedVote: `0x${string}`, inputProof: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: SecretVoteABI,
      functionName: 'castVote',
      args: [proposalId, encryptedVote, inputProof],
      ...(chainId === SEPOLIA_CHAIN_ID && { gas: SEPOLIA_MAX_GAS }),
    });
  };

  return { castVote, isPending: isPending || isConfirming, isSuccess, error, hash };
}

export function useFinalizeTally() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const chainId = useChainId();

  const finalizeTally = (proposalId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: SecretVoteABI,
      functionName: 'finalizeTally',
      args: [proposalId],
      ...(chainId === SEPOLIA_CHAIN_ID && { gas: SEPOLIA_MAX_GAS }),
    });
  };

  return { finalizeTally, isPending: isPending || isConfirming, isSuccess, error, hash };
}
