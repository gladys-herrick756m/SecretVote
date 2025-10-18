import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VoteModal } from '@/components/voting/VoteModal';
import { ProposalStatus } from '@/types/proposal';
import { useProposalData } from '@/hooks/useProposals';
import { useProposalVotes, useHasVoted } from '@/hooks/useProposalVotes';
import { useAccount } from 'wagmi';

const ProposalDetail = () => {
  const { id } = useParams();
  const proposalId = id ? BigInt(id) : undefined;
  const { address } = useAccount();
  const { proposal, isLoading, error } = useProposalData(proposalId);
  const { votes } = useProposalVotes(proposalId || 0n);
  const { hasVoted } = useHasVoted(proposalId || 0n, address);
  const [voteModalOpen, setVoteModalOpen] = useState(false);

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.ACTIVE: return 'default';
      case ProposalStatus.ENDED: return 'secondary';
      case ProposalStatus.FINALIZED: return 'outline';
      default: return 'destructive';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRemainingTime = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading proposal...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Proposal not found</p>
            <Link to="/" className="inline-flex items-center gap-2 mt-4 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Proposals
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Link>

        <Card className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={getStatusColor(proposal.status)}>
                {ProposalStatus[proposal.status]}
              </Badge>
              {proposal.status === ProposalStatus.ACTIVE && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{getRemainingTime(proposal.endTime)}</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none mb-8" data-testid="proposal-description">
            {proposal.description.split('\n').map((line, i) => (
              <p key={i} className="mb-4">{line}</p>
            ))}
          </div>

          {proposal.status === ProposalStatus.ACTIVE && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Your vote will be encrypted with FHE technology</span>
              </div>
              {hasVoted && (
                <div className="flex items-center gap-2 mb-4 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>You have already voted on this proposal</span>
                </div>
              )}
              <Button
                onClick={() => setVoteModalOpen(true)}
                size="lg"
                className="w-full sm:w-auto"
                disabled={hasVoted}
              >
                {hasVoted ? 'Already Voted' : 'Cast Your Vote'}
              </Button>
            </div>
          )}

          {votes?.isFinalized && (
            <div className="mb-8 p-6 bg-muted rounded-lg space-y-6">
              <h3 className="font-semibold text-lg">Final Voting Results</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">For</span>
                    <span className="font-semibold text-green-600">{Number(votes.votesFor)} votes</span>
                  </div>
                  <Progress value={Number(votes.votesFor) * 100 / Math.max(Number(votes.votesFor + votes.votesAgainst + votes.votesAbstain), 1)} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Against</span>
                    <span className="font-semibold text-red-600">{Number(votes.votesAgainst)} votes</span>
                  </div>
                  <Progress
                    value={Number(votes.votesAgainst) * 100 / Math.max(Number(votes.votesFor + votes.votesAgainst + votes.votesAbstain), 1)}
                    className="h-3 [&>div]:bg-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Abstain</span>
                    <span className="font-semibold text-gray-600">{Number(votes.votesAbstain)} votes</span>
                  </div>
                  <Progress
                    value={Number(votes.votesAbstain) * 100 / Math.max(Number(votes.votesFor + votes.votesAgainst + votes.votesAbstain), 1)}
                    className="h-3 [&>div]:bg-gray-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border text-sm text-muted-foreground">
                Total votes: {Number(votes.votesFor + votes.votesAgainst + votes.votesAbstain)}
              </div>
            </div>
          )}

          {!votes?.isFinalized && proposal.status === ProposalStatus.ACTIVE && (
            <div className="mb-8 p-6 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-5 w-5" />
                <div>
                  <div className="font-medium mb-1">Voting in Progress</div>
                  <div>All votes are encrypted using FHE technology. Results will be decrypted and published after voting ends.</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Proposer</div>
                <div className="font-mono text-sm">
                  {proposal.proposer.slice(0, 10)}...{proposal.proposer.slice(-8)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="text-sm">{formatDate(proposal.startTime)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">End Date</div>
                <div className="text-sm">{formatDate(proposal.endTime)}</div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <VoteModal
        isOpen={voteModalOpen}
        onClose={() => setVoteModalOpen(false)}
        proposalId={proposal.id}
        proposalTitle={proposal.title}
      />
    </div>
  );
};

export default ProposalDetail;
