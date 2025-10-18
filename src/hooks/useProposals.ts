import { useMemo } from 'react';
import { useProposalCount, useProposal } from './useContract';
import { Proposal, ProposalStatus } from '@/types/proposal';

export function useProposals() {
  const { data: count, isLoading: isLoadingCount, error: countError } = useProposalCount();

  console.log('useProposals - count:', count, 'isLoading:', isLoadingCount, 'error:', countError);

  const proposalIds = useMemo(() => {
    if (!count) return [];
    const ids = Array.from({ length: Number(count) }, (_, i) => BigInt(Number(count) - 1 - i));
    console.log('useProposals - generated ids (newest first):', ids);
    return ids;
  }, [count]);

  return {
    proposalIds,
    totalCount: count ? Number(count) : 0,
    isLoading: isLoadingCount,
    error: countError,
  };
}

export function useProposalData(proposalId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useProposal(proposalId);

  const proposal = useMemo((): Proposal | null => {
    if (!data || proposalId === undefined) return null;

    // getProposal returns: (id, title, description, proposer, startTime, endTime, finalized, decryptedFor, decryptedAgainst, decryptedAbstain, status)
    const [id, title, description, proposer, startTime, endTime, finalized, decryptedFor, decryptedAgainst, decryptedAbstain, status] = data as any[];

    const statusValue = Number(status);
    let proposalStatus: ProposalStatus;
    switch (statusValue) {
      case 0: proposalStatus = ProposalStatus.PENDING; break;
      case 1: proposalStatus = ProposalStatus.ACTIVE; break;
      case 2: proposalStatus = ProposalStatus.ENDED; break;
      case 3: proposalStatus = ProposalStatus.FINALIZED; break;
      case 4: proposalStatus = ProposalStatus.CANCELLED; break;
      default: proposalStatus = ProposalStatus.PENDING;
    }

    return {
      id: proposalId.toString(),
      title,
      description,
      proposer,
      startTime: Number(startTime),
      endTime: Number(endTime),
      status: proposalStatus,
      votesFor: finalized ? Number(decryptedFor) : undefined,
      votesAgainst: finalized ? Number(decryptedAgainst) : undefined,
      votesAbstain: finalized ? Number(decryptedAbstain) : undefined,
    };
  }, [data, proposalId]);

  return { proposal, isLoading, error, refetch };
}
