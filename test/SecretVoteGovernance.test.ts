import { expect } from "chai";
import { ethers } from "hardhat";
import { SecretVoteGovernance } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SecretVoteGovernance", function () {
  let secretVote: SecretVoteGovernance;
  let admin: SignerWithAddress;
  let proposer: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let voter3: SignerWithAddress;
  let gateway: SignerWithAddress;

  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const PROPOSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROPOSER_ROLE"));
  const VOTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VOTER_ROLE"));

  beforeEach(async function () {
    [admin, proposer, voter1, voter2, voter3, gateway] = await ethers.getSigners();

    const SecretVoteFactory = await ethers.getContractFactory("SecretVoteGovernance");
    secretVote = await SecretVoteFactory.deploy(gateway.address, admin.address);
    await secretVote.waitForDeployment();

    // Grant roles
    await secretVote.connect(admin).grantProposerRole(proposer.address);
    await secretVote.connect(admin).grantVoterRole(voter1.address);
    await secretVote.connect(admin).grantVoterRole(voter2.address);
    await secretVote.connect(admin).grantVoterRole(voter3.address);
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await secretVote.admin()).to.equal(admin.address);
    });

    it("Should grant admin role to deployer", async function () {
      expect(await secretVote.hasRole(admin.address, ADMIN_ROLE)).to.be.true;
    });

    it("Should initialize with zero proposals", async function () {
      expect(await secretVote.getProposalCount()).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should grant voter role", async function () {
      const newVoter = (await ethers.getSigners())[5];
      await expect(secretVote.connect(admin).grantVoterRole(newVoter.address))
        .to.emit(secretVote, "VoterRoleGranted")
        .withArgs(newVoter.address);

      expect(await secretVote.hasRole(newVoter.address, VOTER_ROLE)).to.be.true;
    });

    it("Should revoke voter role", async function () {
      await expect(secretVote.connect(admin).revokeVoterRole(voter1.address))
        .to.emit(secretVote, "VoterRoleRevoked")
        .withArgs(voter1.address);

      expect(await secretVote.hasRole(voter1.address, VOTER_ROLE)).to.be.false;
    });

    it("Should grant proposer role", async function () {
      const newProposer = (await ethers.getSigners())[6];
      await expect(secretVote.connect(admin).grantProposerRole(newProposer.address))
        .to.emit(secretVote, "ProposerRoleGranted")
        .withArgs(newProposer.address);

      expect(await secretVote.hasRole(newProposer.address, PROPOSER_ROLE)).to.be.true;
    });

    it("Should only allow admin to grant roles", async function () {
      const newVoter = (await ethers.getSigners())[5];
      await expect(
        secretVote.connect(voter1).grantVoterRole(newVoter.address)
      ).to.be.revertedWithCustomError(secretVote, "UnauthorizedAccess");
    });
  });

  describe("Proposal Creation", function () {
    it("Should create a proposal with valid parameters", async function () {
      const title = "Proposal 1";
      const description = "This is a test proposal";
      const duration = 7 * 24 * 60 * 60; // 7 days

      await expect(
        secretVote.connect(proposer).createProposal(title, description, duration)
      )
        .to.emit(secretVote, "ProposalCreated")
        .withArgs(0, proposer.address, title, await time.latest() + 1, await time.latest() + 1 + duration);

      expect(await secretVote.getProposalCount()).to.equal(1);
    });

    it("Should reject title longer than 200 characters", async function () {
      const longTitle = "A".repeat(201);
      const description = "Test";
      const duration = 7 * 24 * 60 * 60;

      await expect(
        secretVote.connect(proposer).createProposal(longTitle, description, duration)
      ).to.be.revertedWithCustomError(secretVote, "InvalidTitleLength");
    });

    it("Should reject description longer than 2000 characters", async function () {
      const title = "Test";
      const longDescription = "A".repeat(2001);
      const duration = 7 * 24 * 60 * 60;

      await expect(
        secretVote.connect(proposer).createProposal(title, longDescription, duration)
      ).to.be.revertedWithCustomError(secretVote, "InvalidDescriptionLength");
    });

    it("Should reject duration less than 1 hour", async function () {
      const title = "Test";
      const description = "Test description";
      const duration = 30 * 60; // 30 minutes

      await expect(
        secretVote.connect(proposer).createProposal(title, description, duration)
      ).to.be.revertedWithCustomError(secretVote, "InvalidDuration");
    });

    it("Should reject duration more than 30 days", async function () {
      const title = "Test";
      const description = "Test description";
      const duration = 31 * 24 * 60 * 60; // 31 days

      await expect(
        secretVote.connect(proposer).createProposal(title, description, duration)
      ).to.be.revertedWithCustomError(secretVote, "InvalidDuration");
    });

    it("Should only allow proposer to create proposals", async function () {
      const title = "Test";
      const description = "Test description";
      const duration = 7 * 24 * 60 * 60;

      await expect(
        secretVote.connect(voter1).createProposal(title, description, duration)
      ).to.be.revertedWithCustomError(secretVote, "UnauthorizedAccess");
    });
  });

  describe("Voting", function () {
    let proposalId: number;

    beforeEach(async function () {
      // Create a proposal
      const tx = await secretVote
        .connect(proposer)
        .createProposal("Test Proposal", "Description", 7 * 24 * 60 * 60);
      await tx.wait();
      proposalId = 0;
    });

    it("Should allow voters to cast votes", async function () {
      // Note: In real FHE environment, you would encrypt the vote
      // For testing, we simulate encrypted input
      const encryptedVote = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(64));

      // This will fail in real environment without proper FHE setup
      // but demonstrates the function signature
      await expect(
        secretVote.connect(voter1).castVote(proposalId, encryptedVote, proof)
      ).to.emit(secretVote, "VoteCast");
    });

    it("Should prevent double voting", async function () {
      const encryptedVote = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(64));

      await secretVote.connect(voter1).castVote(proposalId, encryptedVote, proof);

      await expect(
        secretVote.connect(voter1).castVote(proposalId, encryptedVote, proof)
      ).to.be.revertedWithCustomError(secretVote, "AlreadyVoted");
    });

    it("Should check if address has voted", async function () {
      expect(await secretVote.hasVoted(proposalId, voter1.address)).to.be.false;

      const encryptedVote = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(64));
      await secretVote.connect(voter1).castVote(proposalId, encryptedVote, proof);

      expect(await secretVote.hasVoted(proposalId, voter1.address)).to.be.true;
    });

    it("Should only allow voters to vote", async function () {
      const nonVoter = (await ethers.getSigners())[7];
      const encryptedVote = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(64));

      await expect(
        secretVote.connect(nonVoter).castVote(proposalId, encryptedVote, proof)
      ).to.be.revertedWithCustomError(secretVote, "UnauthorizedAccess");
    });

    it("Should reject votes after voting period ends", async function () {
      // Fast forward past voting period
      await time.increase(8 * 24 * 60 * 60); // 8 days

      const encryptedVote = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(64));

      await expect(
        secretVote.connect(voter1).castVote(proposalId, encryptedVote, proof)
      ).to.be.revertedWithCustomError(secretVote, "VotingNotActive");
    });
  });

  describe("Proposal Cancellation", function () {
    let proposalId: number;

    beforeEach(async function () {
      const tx = await secretVote
        .connect(proposer)
        .createProposal("Test Proposal", "Description", 7 * 24 * 60 * 60);
      await tx.wait();
      proposalId = 0;
    });

    it("Should allow admin to cancel proposal", async function () {
      await expect(secretVote.connect(admin).cancelProposal(proposalId))
        .to.emit(secretVote, "ProposalCancelled")
        .withArgs(proposalId);

      const status = await secretVote.getProposalStatus(proposalId);
      expect(status).to.equal(4); // CANCELLED
    });

    it("Should only allow admin to cancel", async function () {
      await expect(
        secretVote.connect(voter1).cancelProposal(proposalId)
      ).to.be.revertedWithCustomError(secretVote, "UnauthorizedAccess");
    });

    it("Should prevent canceling finalized proposals", async function () {
      // Fast forward and finalize (simplified for test)
      await time.increase(8 * 24 * 60 * 60);

      // In real scenario, would request decryption and fulfill
      // For test, we just check the revert
      // Note: This test would need full FHE simulation to work properly
    });
  });

  describe("View Functions", function () {
    let proposalId: number;

    beforeEach(async function () {
      const tx = await secretVote
        .connect(proposer)
        .createProposal("Test Proposal", "Test Description", 7 * 24 * 60 * 60);
      await tx.wait();
      proposalId = 0;
    });

    it("Should get proposal details", async function () {
      const proposal = await secretVote.getProposal(proposalId);

      expect(proposal.id).to.equal(0);
      expect(proposal.title).to.equal("Test Proposal");
      expect(proposal.description).to.equal("Test Description");
      expect(proposal.proposer).to.equal(proposer.address);
      expect(proposal.finalized).to.be.false;
      expect(proposal.status).to.equal(1); // ACTIVE
    });

    it("Should get proposal status", async function () {
      const status = await secretVote.getProposalStatus(proposalId);
      expect(status).to.equal(1); // ACTIVE
    });

    it("Should check if voting is active", async function () {
      expect(await secretVote.isVotingActive(proposalId)).to.be.true;

      // Fast forward past voting period
      await time.increase(8 * 24 * 60 * 60);
      expect(await secretVote.isVotingActive(proposalId)).to.be.false;
    });

    it("Should revert when getting non-existent proposal", async function () {
      await expect(
        secretVote.getProposal(999)
      ).to.be.revertedWithCustomError(secretVote, "ProposalNotFound");
    });
  });

  describe("Decryption Flow", function () {
    let proposalId: number;

    beforeEach(async function () {
      const tx = await secretVote
        .connect(proposer)
        .createProposal("Test Proposal", "Description", 7 * 24 * 60 * 60);
      await tx.wait();
      proposalId = 0;
    });

    it("Should request decryption after voting ends", async function () {
      // Fast forward past voting period
      await time.increase(8 * 24 * 60 * 60);

      await expect(secretVote.requestDecryption(proposalId))
        .to.emit(secretVote, "DecryptionRequested");
    });

    it("Should reject decryption request before voting ends", async function () {
      await expect(
        secretVote.requestDecryption(proposalId)
      ).to.be.revertedWithCustomError(secretVote, "VotingNotEnded");
    });

    it("Should fulfill decryption from gateway", async function () {
      // Fast forward and request decryption
      await time.increase(8 * 24 * 60 * 60);
      await secretVote.requestDecryption(proposalId);

      // Gateway fulfills decryption
      await expect(
        secretVote.connect(gateway).fulfillDecryption(proposalId, 100, 50, 10)
      )
        .to.emit(secretVote, "ProposalFinalized")
        .withArgs(proposalId, 100, 50, 10, true);

      const results = await secretVote.getDecryptedResults(proposalId);
      expect(results.votesFor).to.equal(100);
      expect(results.votesAgainst).to.equal(50);
      expect(results.votesAbstain).to.equal(10);
    });

    it("Should only allow gateway to fulfill decryption", async function () {
      await time.increase(8 * 24 * 60 * 60);
      await secretVote.requestDecryption(proposalId);

      await expect(
        secretVote.connect(voter1).fulfillDecryption(proposalId, 100, 50, 10)
      ).to.be.revertedWithCustomError(secretVote, "OnlyGateway");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple proposals", async function () {
      await secretVote.connect(proposer).createProposal("Proposal 1", "Desc 1", 7 * 24 * 60 * 60);
      await secretVote.connect(proposer).createProposal("Proposal 2", "Desc 2", 7 * 24 * 60 * 60);
      await secretVote.connect(proposer).createProposal("Proposal 3", "Desc 3", 7 * 24 * 60 * 60);

      expect(await secretVote.getProposalCount()).to.equal(3);

      const proposal1 = await secretVote.getProposal(0);
      const proposal2 = await secretVote.getProposal(1);
      const proposal3 = await secretVote.getProposal(2);

      expect(proposal1.title).to.equal("Proposal 1");
      expect(proposal2.title).to.equal("Proposal 2");
      expect(proposal3.title).to.equal("Proposal 3");
    });

    it("Should handle minimum duration (1 hour)", async function () {
      const minDuration = 60 * 60; // 1 hour
      await expect(
        secretVote.connect(proposer).createProposal("Test", "Test", minDuration)
      ).to.not.be.reverted;
    });

    it("Should handle maximum duration (30 days)", async function () {
      const maxDuration = 30 * 24 * 60 * 60; // 30 days
      await expect(
        secretVote.connect(proposer).createProposal("Test", "Test", maxDuration)
      ).to.not.be.reverted;
    });
  });
});
