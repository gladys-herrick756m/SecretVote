export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  startTime: number;
  endTime: number;
  proposer: string;
  votesFor?: number;
  votesAgainst?: number;
  votesAbstain?: number;
  hasVoted?: boolean;
}

export enum ProposalStatus {
  ACTIVE = 0,
  ENDED = 1,
  FINALIZED = 2,
  CANCELLED = 3,
}

export enum VoteChoice {
  FOR = 0,
  AGAINST = 1,
  ABSTAIN = 2,
}
