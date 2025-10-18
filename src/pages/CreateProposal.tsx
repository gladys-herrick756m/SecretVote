import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCreateProposal } from '@/hooks/useContract';

const CreateProposal = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { createProposal, isPending, isSuccess, error } = useCreateProposal();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    votingDuration: '7',
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Proposal created successfully!');
      navigate('/');
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to create proposal');
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect wallet first');
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    const votingPeriod = BigInt(Number(formData.votingDuration) * 24 * 60 * 60);
    createProposal(formData.title, formData.description, votingPeriod);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Proposal</h1>
          <p className="text-muted-foreground">
            Submit a proposal for the DAO to vote on
          </p>
        </div>

        {!isConnected && (
          <Card className="p-6 mb-6 border-yellow-500/50 bg-yellow-500/10">
            <p className="text-yellow-700 dark:text-yellow-300">
              Please connect your wallet to create a proposal
            </p>
          </Card>
        )}

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Create proposal form">
            <div className="space-y-2">
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                placeholder="Enter proposal title (10-200 characters)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
                required
                disabled={!isConnected}
              />
              <p className="text-sm text-muted-foreground">
                {formData.title.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your proposal (supports Markdown)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={12}
                maxLength={2000}
                required
                disabled={!isConnected}
              />
              <p className="text-sm text-muted-foreground">
                {formData.description.length}/2000 characters • Markdown supported
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Voting Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="30"
                value={formData.votingDuration}
                onChange={(e) => setFormData({ ...formData, votingDuration: e.target.value })}
                required
                disabled={!isConnected}
              />
              <p className="text-sm text-muted-foreground">
                Voting will end {formData.votingDuration} days after proposal creation
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isConnected || isPending}
                className="flex-1"
              >
                {isPending ? 'Creating...' : 'Create Proposal'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CreateProposal;
