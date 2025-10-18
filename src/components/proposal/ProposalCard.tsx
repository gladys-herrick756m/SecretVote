import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Proposal, ProposalStatus } from '@/types/proposal';
import { useProposalVotes } from '@/hooks/useProposalVotes';
import { useAccount } from 'wagmi';

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const { address } = useAccount();
  const { votes } = useProposalVotes(proposal.id);

  const getStatusInfo = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.ACTIVE:
        return { label: 'Active', variant: 'default' as const, icon: Clock };
      case ProposalStatus.ENDED:
        return { label: 'Ended', variant: 'secondary' as const, icon: CheckCircle };
      case ProposalStatus.FINALIZED:
        return { label: 'Finalized', variant: 'outline' as const, icon: CheckCircle };
      case ProposalStatus.CANCELLED:
        return { label: 'Cancelled', variant: 'destructive' as const, icon: Ban };
      default:
        return { label: 'Unknown', variant: 'outline' as const, icon: XCircle };
    }
  };

  const statusInfo = getStatusInfo(proposal.status);
  const StatusIcon = statusInfo.icon;

  const getTimeRemaining = () => {
    if (proposal.status !== ProposalStatus.ACTIVE) return null;

    const now = Date.now() / 1000;
    const remaining = proposal.endTime - now;

    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const timeRemaining = getTimeRemaining();

  const totalVotes = votes ? Number(votes.votesFor + votes.votesAgainst + votes.votesAbstain) : 0;
  const forPercent = totalVotes > 0 ? Number((votes?.votesFor || 0n) * 100n / BigInt(totalVotes)) : 0;

  return (
    <article>
      <Card className="p-6 hover:shadow-lg transition-shadow animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
            {timeRemaining && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeRemaining}
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
          <p className="text-muted-foreground line-clamp-2">{proposal.description}</p>
        </div>
      </div>

      {votes?.isFinalized && totalVotes > 0 && (
        <div className="mb-4 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Voting Results</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">For</span>
              <span className="font-medium text-green-600">{Number(votes.votesFor)} votes</span>
            </div>
            <Progress value={forPercent} className="h-2" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Against: {Number(votes.votesAgainst)}</span>
            <span>Abstain: {Number(votes.votesAbstain)}</span>
            <span>Total: {totalVotes}</span>
          </div>
        </div>
      )}

      {!votes?.isFinalized && totalVotes === 0 && proposal.status === ProposalStatus.ACTIVE && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">Voting in progress, data encrypted</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
        </div>
        <Link to={`/proposal/${proposal.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
    </article>
  );
}
