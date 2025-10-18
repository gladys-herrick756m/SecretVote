import { useState, useMemo } from 'react';
import { ProposalCard } from '@/components/proposal/ProposalCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProposalStatus } from '@/types/proposal';
import { useProposals, useProposalData } from '@/hooks/useProposals';

const Index = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const { proposalIds, isLoading, totalCount } = useProposals();

  console.log('Index - proposalIds:', proposalIds, 'isLoading:', isLoading, 'totalCount:', totalCount);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8" data-testid="proposal-list">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">DAO Governance</h1>
          <p className="text-lg text-muted-foreground">
            Vote on proposals with privacy-preserving encryption
          </p>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Proposals</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="ended">Ended</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center py-12" role="status">
              <p className="text-muted-foreground">Loading proposals...</p>
            </div>
          ) : proposalIds.length === 0 ? (
            <div className="text-center py-12" role="status">
              <p className="text-muted-foreground">No proposals yet. Be the first to create one!</p>
            </div>
          ) : (
            proposalIds.map(id => <ProposalItem key={id.toString()} proposalId={id} filter={filter} />)
          )}
        </div>
      </main>
    </div>
  );
};

function ProposalItem({ proposalId, filter }: { proposalId: bigint; filter: string }) {
  const { proposal, isLoading } = useProposalData(proposalId);

  const shouldShow = useMemo(() => {
    if (!proposal || filter === 'all') return true;
    if (filter === 'active') return proposal.status === ProposalStatus.ACTIVE;
    if (filter === 'ended') return proposal.status === ProposalStatus.FINALIZED || proposal.status === ProposalStatus.ENDED;
    return true;
  }, [proposal, filter]);

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;
  if (!proposal || !shouldShow) return null;

  return <ProposalCard proposal={proposal} />;
}

export default Index;
