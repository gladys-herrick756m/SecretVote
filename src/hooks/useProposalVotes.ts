import { useState, useEffect } from 'react';
import { getGovernanceContract } from '@/utils/getContract';

export interface ProposalVotes {
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  isFinalized: boolean;
}

export function useProposalVotes(proposalId: bigint | number) {
  const [votes, setVotes] = useState<ProposalVotes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const contract = getGovernanceContract();
        const proposal = await contract.getProposal(BigInt(proposalId));

        // proposal返回: [id, title, description, proposer, startTime, endTime, finalized, decryptedFor, decryptedAgainst, decryptedAbstain, status]
        setVotes({
          votesFor: BigInt(proposal[7] || 0),
          votesAgainst: BigInt(proposal[8] || 0),
          votesAbstain: BigInt(proposal[9] || 0),
          isFinalized: proposal[6] || false,
        });
      } catch (err) {
        console.error('[useProposalVotes] Error fetching votes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [proposalId]);

  return { votes, loading };
}

export function useHasVoted(proposalId: bigint | number, userAddress?: string) {
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVoted = async () => {
      if (!userAddress) {
        setLoading(false);
        return;
      }

      try {
        const contract = getGovernanceContract();
        const voted = await contract.hasVoted(BigInt(proposalId), userAddress);
        setHasVoted(voted);
      } catch (err) {
        console.error('[useHasVoted] Error checking vote status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkVoted();
  }, [proposalId, userAddress]);

  return { hasVoted, loading };
}
