export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual contract address

export const PROPOSAL_STATUS = {
  ACTIVE: 0,
  ENDED: 1,
  FINALIZED: 2,
  CANCELLED: 3,
} as const;

export const VOTE_CHOICE = {
  FOR: 0,
  AGAINST: 1,
  ABSTAIN: 2,
} as const;

export const VOTE_CHOICE_LABELS = {
  [VOTE_CHOICE.FOR]: 'For',
  [VOTE_CHOICE.AGAINST]: 'Against',
  [VOTE_CHOICE.ABSTAIN]: 'Abstain',
} as const;
