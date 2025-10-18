// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SecretVoteGovernanceTestable
 * @notice Testable version without FHE for local development
 * @dev Removes FHE dependencies for Hardhat testing
 */
contract SecretVoteGovernanceTestable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    uint256 public constant MIN_VOTING_DURATION = 1 hours;
    uint256 public constant MAX_VOTING_DURATION = 30 days;

    enum VoteChoice { FOR, AGAINST, ABSTAIN }
    enum ProposalStatus { PENDING, ACTIVE, ENDED, FINALIZED, CANCELLED }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        bool finalized;
        ProposalStatus status;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => bool)) public roles;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 private _proposalCount;
    address public gateway;

    error AccessControlUnauthorized(address account, bytes32 neededRole);
    error ProposalDoesNotExist(uint256 proposalId);
    error VotingNotActive(uint256 proposalId);
    error AlreadyVoted(uint256 proposalId, address voter);

    event ProposalCreated(uint256 indexed proposalId, string title, address proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event TallyFinalized(uint256 indexed proposalId, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes);

    modifier onlyRole(bytes32 role) {
        if (!roles[role][msg.sender]) {
            revert AccessControlUnauthorized(msg.sender, role);
        }
        _;
    }

    modifier proposalExists(uint256 _proposalId) {
        if (_proposalId >= _proposalCount) {
            revert ProposalDoesNotExist(_proposalId);
        }
        _;
    }

    constructor(address _gateway, address _admin) {
        gateway = _gateway;
        roles[ADMIN_ROLE][_admin] = true;
        roles[PROPOSER_ROLE][_admin] = true;
        roles[VOTER_ROLE][_admin] = true;
    }

    function grantRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        roles[role][account] = true;
    }

    function createProposal(
        string calldata _title,
        string calldata _description,
        uint256 _votingPeriod
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        require(_votingPeriod >= MIN_VOTING_DURATION && _votingPeriod <= MAX_VOTING_DURATION, "Invalid duration");

        uint256 proposalId = _proposalCount++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _votingPeriod;

        proposals[proposalId] = Proposal({
            id: proposalId,
            title: _title,
            description: _description,
            proposer: msg.sender,
            startTime: startTime,
            endTime: endTime,
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
            finalized: false,
            status: ProposalStatus.ACTIVE
        });

        emit ProposalCreated(proposalId, _title, msg.sender);
        return proposalId;
    }

    function castVote(
        uint256 _proposalId,
        uint8 _choice
    ) external onlyRole(VOTER_ROLE) proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];

        if (proposal.status != ProposalStatus.ACTIVE) revert VotingNotActive(_proposalId);
        if (block.timestamp < proposal.startTime || block.timestamp >= proposal.endTime) {
            revert VotingNotActive(_proposalId);
        }
        if (hasVoted[_proposalId][msg.sender]) {
            revert AlreadyVoted(_proposalId, msg.sender);
        }

        hasVoted[_proposalId][msg.sender] = true;

        if (_choice == uint8(VoteChoice.FOR)) {
            proposal.votesFor++;
        } else if (_choice == uint8(VoteChoice.AGAINST)) {
            proposal.votesAgainst++;
        } else {
            proposal.votesAbstain++;
        }

        emit VoteCast(_proposalId, msg.sender);
    }

    function finalizeTally(uint256 _proposalId) external proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.finalized, "Already finalized");
        require(block.timestamp >= proposal.endTime, "Voting not ended");

        proposal.finalized = true;
        proposal.status = ProposalStatus.FINALIZED;

        emit TallyFinalized(_proposalId, proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain);
    }

    function getProposal(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (
            uint256 id,
            string memory title,
            string memory description,
            address proposer,
            uint256 startTime,
            uint256 endTime,
            bool finalized,
            uint256 decryptedFor,
            uint256 decryptedAgainst,
            uint256 decryptedAbstain,
            ProposalStatus status
        )
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.proposer,
            proposal.startTime,
            proposal.endTime,
            proposal.finalized,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.votesAbstain,
            proposal.status
        );
    }

    function getProposalCount() external view returns (uint256) {
        return _proposalCount;
    }
}
