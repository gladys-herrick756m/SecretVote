// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {externalEuint32} from "encrypted-types/EncryptedTypes.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title SecretVoteGovernance
 * @notice DAO governance voting system with FHE-encrypted votes
 * @dev Uses Zama fhEVM for privacy-preserving voting
 */
contract SecretVoteGovernance is SepoliaConfig {

    // ========== Constants ==========
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    uint256 public constant MIN_VOTING_DURATION = 1 hours;
    uint256 public constant MAX_VOTING_DURATION = 30 days;
    uint256 public constant MAX_TITLE_LENGTH = 200;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 2000;

    // ========== Enums ==========
    enum VoteChoice {
        FOR,      // 0
        AGAINST,  // 1
        ABSTAIN   // 2
    }

    enum ProposalStatus {
        PENDING,    // Voting not started
        ACTIVE,     // Voting in progress
        ENDED,      // Voting ended, awaiting finalization
        FINALIZED,  // Results decrypted and final
        CANCELLED   // Proposal cancelled
    }

    // ========== Structs ==========
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        euint32 votesFor;
        euint32 votesAgainst;
        euint32 votesAbstain;
        bool finalized;
        uint256 decryptedFor;
        uint256 decryptedAgainst;
        uint256 decryptedAbstain;
        ProposalStatus status;
        uint256[] decryptionRequestIds;
    }

    // ========== State Variables ==========
    uint256 private _proposalIdCounter;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => bytes32) public roles;
    mapping(uint256 => uint256) public requestIdToProposalId;

    address public admin;

    // ========== Events ==========
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter
    );

    event DecryptionRequested(
        uint256 indexed proposalId,
        uint256[] requestIds
    );

    event ProposalFinalized(
        uint256 indexed proposalId,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 votesAbstain,
        bool passed
    );

    event ProposalCancelled(uint256 indexed proposalId);
    event VoterRoleGranted(address indexed voter);
    event VoterRoleRevoked(address indexed voter);
    event ProposerRoleGranted(address indexed proposer);
    event ProposerRoleRevoked(address indexed proposer);

    // ========== Errors ==========
    error ProposalNotFound(uint256 proposalId);
    error VotingNotActive(uint256 proposalId);
    error AlreadyVoted(uint256 proposalId, address voter);
    error InvalidVoteChoice(uint32 choice);
    error ProposalAlreadyFinalized(uint256 proposalId);
    error VotingNotEnded(uint256 proposalId);
    error UnauthorizedAccess(address caller, bytes32 requiredRole);
    error InvalidDuration(uint256 duration);
    error InvalidTitleLength(uint256 length);
    error InvalidDescriptionLength(uint256 length);
    error ProposalNotFinalized(uint256 proposalId);

    // ========== Modifiers ==========
    modifier onlyRole(bytes32 role) {
        if (roles[msg.sender] != role && msg.sender != admin) {
            revert UnauthorizedAccess(msg.sender, role);
        }
        _;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert UnauthorizedAccess(msg.sender, ADMIN_ROLE);
        }
        _;
    }

    // Removed: Oracle callback mechanism handles decryption in new fhEVM

    modifier proposalExists(uint256 _proposalId) {
        if (_proposalId >= _proposalIdCounter) {
            revert ProposalNotFound(_proposalId);
        }
        _;
    }

    // ========== Constructor ==========
    constructor(address _admin) {
        admin = _admin;
        roles[_admin] = ADMIN_ROLE;
    }

    // ========== Administrative Functions ==========

    /**
     * @notice Creates a new voting proposal
     * @param _title Proposal title (max 200 characters)
     * @param _description Detailed description (max 2000 characters)
     * @param _votingDuration Duration in seconds (1 hour - 30 days)
     * @return proposalId The ID of the created proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _votingDuration
    ) external returns (uint256) {
        if (bytes(_title).length > MAX_TITLE_LENGTH) {
            revert InvalidTitleLength(bytes(_title).length);
        }
        if (bytes(_description).length > MAX_DESCRIPTION_LENGTH) {
            revert InvalidDescriptionLength(bytes(_description).length);
        }
        if (_votingDuration < MIN_VOTING_DURATION || _votingDuration > MAX_VOTING_DURATION) {
            revert InvalidDuration(_votingDuration);
        }

        uint256 proposalId = _proposalIdCounter++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _votingDuration;

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.title = _title;
        proposal.description = _description;
        proposal.proposer = msg.sender;
        proposal.startTime = startTime;
        proposal.endTime = endTime;
        proposal.votesFor = FHE.asEuint32(0);
        proposal.votesAgainst = FHE.asEuint32(0);
        proposal.votesAbstain = FHE.asEuint32(0);
        proposal.finalized = false;
        proposal.status = ProposalStatus.ACTIVE;

        FHE.allowThis(proposal.votesFor);
        FHE.allowThis(proposal.votesAgainst);
        FHE.allowThis(proposal.votesAbstain);

        emit ProposalCreated(proposalId, msg.sender, _title, startTime, endTime);

        return proposalId;
    }

    /**
     * @notice Cancels an active proposal
     * @param _proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 _proposalId)
        external
        onlyAdmin
        proposalExists(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];

        if (proposal.finalized) {
            revert ProposalAlreadyFinalized(_proposalId);
        }

        proposal.status = ProposalStatus.CANCELLED;

        emit ProposalCancelled(_proposalId);
    }

    // ========== Voting Functions ==========

    /**
     * @notice Submits an encrypted vote for a proposal
     * @param _proposalId ID of the proposal
     * @param _encryptedVote Encrypted vote choice (0=FOR, 1=AGAINST, 2=ABSTAIN)
     * @param _inputProof FHE encryption proof
     */
    function castVote(
        uint256 _proposalId,
        externalEuint32 _encryptedVote,
        bytes calldata _inputProof
    ) external proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];

        // Verify voting is active
        if (proposal.status != ProposalStatus.ACTIVE) {
            revert VotingNotActive(_proposalId);
        }
        if (block.timestamp < proposal.startTime || block.timestamp >= proposal.endTime) {
            revert VotingNotActive(_proposalId);
        }

        // Check double voting
        if (hasVoted[_proposalId][msg.sender]) {
            revert AlreadyVoted(_proposalId, msg.sender);
        }

        // Convert encrypted input to euint32
        euint32 encryptedChoice = FHE.fromExternal(_encryptedVote, _inputProof);

        // Create comparison booleans for each vote type
        ebool isFor = FHE.eq(encryptedChoice, FHE.asEuint32(uint32(VoteChoice.FOR)));
        ebool isAgainst = FHE.eq(encryptedChoice, FHE.asEuint32(uint32(VoteChoice.AGAINST)));
        ebool isAbstain = FHE.eq(encryptedChoice, FHE.asEuint32(uint32(VoteChoice.ABSTAIN)));

        // Use FHE.select to add 1 to the appropriate counter
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);

        euint32 toAddFor = FHE.select(isFor, one, zero);
        euint32 toAddAgainst = FHE.select(isAgainst, one, zero);
        euint32 toAddAbstain = FHE.select(isAbstain, one, zero);

        // Add to vote counters
        proposal.votesFor = FHE.add(proposal.votesFor, toAddFor);
        proposal.votesAgainst = FHE.add(proposal.votesAgainst, toAddAgainst);
        proposal.votesAbstain = FHE.add(proposal.votesAbstain, toAddAbstain);

        // Allow contract to access updated values
        FHE.allowThis(proposal.votesFor);
        FHE.allowThis(proposal.votesAgainst);
        FHE.allowThis(proposal.votesAbstain);

        // Mark as voted
        hasVoted[_proposalId][msg.sender] = true;

        emit VoteCast(_proposalId, msg.sender);
    }

    // ========== Result Finalization ==========

    /**
     * @notice Requests Gateway to decrypt final vote counts
     * @param _proposalId ID of the proposal
     * @return requestIds Array of Gateway request IDs
     */
    function requestDecryption(uint256 _proposalId)
        external
        proposalExists(_proposalId)
        returns (uint256[] memory requestIds)
    {
        Proposal storage proposal = proposals[_proposalId];

        // Verify voting has ended
        if (block.timestamp < proposal.endTime) {
            revert VotingNotEnded(_proposalId);
        }
        if (proposal.finalized) {
            revert ProposalAlreadyFinalized(_proposalId);
        }
        if (proposal.status == ProposalStatus.CANCELLED) {
            revert ProposalNotFound(_proposalId);
        }

        // Update status
        proposal.status = ProposalStatus.ENDED;

        // Prepare ciphertexts for decryption
        bytes32[] memory cts = new bytes32[](3);
        cts[0] = FHE.toBytes32(proposal.votesFor);
        cts[1] = FHE.toBytes32(proposal.votesAgainst);
        cts[2] = FHE.toBytes32(proposal.votesAbstain);

        // Request Gateway decryption
        uint256 requestId = FHE.requestDecryption(
            cts,
            this.resolveTallyCallback.selector
        );

        // Store request ID
        requestIds = new uint256[](1);
        requestIds[0] = requestId;
        proposal.decryptionRequestIds = requestIds;
        requestIdToProposalId[requestId] = _proposalId;

        emit DecryptionRequested(_proposalId, requestIds);
    }

    /**
     * @notice Gateway callback to store decrypted results
     * @param requestId The decryption request ID
     * @param decryptedValues The decrypted values [votesFor, votesAgainst, votesAbstain]
     */
    function resolveTallyCallback(
        uint256 requestId,
        uint32[] calldata decryptedValues
    ) external {
        require(decryptedValues.length == 3, "Invalid decrypted values length");

        uint256 _proposalId = requestIdToProposalId[requestId];
        require(_proposalId > 0, "Invalid request ID");

        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.ENDED, "Invalid proposal status");

        // Store decrypted results
        proposal.decryptedFor = decryptedValues[0];
        proposal.decryptedAgainst = decryptedValues[1];
        proposal.decryptedAbstain = decryptedValues[2];
        proposal.finalized = true;
        proposal.status = ProposalStatus.FINALIZED;

        // Determine if proposal passed
        bool passed = decryptedValues[0] > decryptedValues[1];

        emit ProposalFinalized(
            _proposalId,
            decryptedValues[0],
            decryptedValues[1],
            decryptedValues[2],
            passed
        );
    }

    // ========== View Functions ==========

    /**
     * @notice Retrieves complete proposal information
     * @param _proposalId ID of the proposal
     * @return id Proposal ID
     * @return title Proposal title
     * @return description Proposal description
     * @return proposer Proposer address
     * @return startTime Voting start time
     * @return endTime Voting end time
     * @return finalized Whether results are finalized
     * @return decryptedFor Decrypted FOR votes
     * @return decryptedAgainst Decrypted AGAINST votes
     * @return decryptedAbstain Decrypted ABSTAIN votes
     * @return status Proposal status
     */
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
            proposal.decryptedFor,
            proposal.decryptedAgainst,
            proposal.decryptedAbstain,
            proposal.status
        );
    }

    /**
     * @notice Gets current status of a proposal
     * @param _proposalId ID of the proposal
     * @return ProposalStatus enum value
     */
    function getProposalStatus(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (ProposalStatus)
    {
        return proposals[_proposalId].status;
    }

    /**
     * @notice Checks if voting is currently open
     * @param _proposalId ID of the proposal
     * @return True if voting period is active
     */
    function isVotingActive(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (bool)
    {
        Proposal storage proposal = proposals[_proposalId];
        return proposal.status == ProposalStatus.ACTIVE &&
               block.timestamp >= proposal.startTime &&
               block.timestamp < proposal.endTime;
    }

    /**
     * @notice Retrieves final decrypted vote counts
     * @param _proposalId ID of the proposal
     * @return votesFor Decrypted FOR votes
     * @return votesAgainst Decrypted AGAINST votes
     * @return votesAbstain Decrypted ABSTAIN votes
     */
    function getDecryptedResults(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain)
    {
        Proposal storage proposal = proposals[_proposalId];

        if (!proposal.finalized) {
            revert ProposalNotFinalized(_proposalId);
        }

        return (
            proposal.decryptedFor,
            proposal.decryptedAgainst,
            proposal.decryptedAbstain
        );
    }

    /**
     * @notice Gets total number of proposals
     * @return Total proposal count
     */
    function getProposalCount() external view returns (uint256) {
        return _proposalIdCounter;
    }

    // ========== Role Management ==========

    /**
     * @notice Grants voting rights to an address
     * @param _voter Address to grant role
     */
    function grantVoterRole(address _voter) external onlyAdmin {
        roles[_voter] = VOTER_ROLE;
        emit VoterRoleGranted(_voter);
    }

    /**
     * @notice Revokes voting rights from an address
     * @param _voter Address to revoke role
     */
    function revokeVoterRole(address _voter) external onlyAdmin {
        delete roles[_voter];
        emit VoterRoleRevoked(_voter);
    }

    /**
     * @notice Grants proposal creation rights
     * @param _proposer Address to grant role
     */
    function grantProposerRole(address _proposer) external onlyAdmin {
        roles[_proposer] = PROPOSER_ROLE;
        emit ProposerRoleGranted(_proposer);
    }

    /**
     * @notice Revokes proposal creation rights
     * @param _proposer Address to revoke role
     */
    function revokeProposerRole(address _proposer) external onlyAdmin {
        delete roles[_proposer];
        emit ProposerRoleRevoked(_proposer);
    }

    /**
     * @notice Checks if address has specific role
     * @param _account Address to check
     * @param _role Role to verify
     * @return True if account has role
     */
    function hasRole(address _account, bytes32 _role) external view returns (bool) {
        return roles[_account] == _role || _account == admin;
    }
}
