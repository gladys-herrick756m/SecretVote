import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus, Shield, AlertCircle, Lock } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VoteChoice } from '@/types/proposal';
import { toast } from 'sonner';
import { useCastVote } from '@/hooks/useCastVote';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalTitle: string;
}

export function VoteModal({ isOpen, onClose, proposalId, proposalTitle }: VoteModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(null);
  const [voteStep, setVoteStep] = useState<string>('ready');
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { castConfidentialVote } = useCastVote();

  const isMockMode = chainId !== 11155111;
  const isProcessing = voteStep !== 'ready' && voteStep !== 'success' && voteStep !== 'error';

  const handleVote = async () => {
    if (selectedChoice === null) return;
    if (!isConnected) {
      toast.error('Please connect wallet first');
      return;
    }

    try {
      await castConfidentialVote({
        proposalId,
        voteChoice: selectedChoice,
        setVoteStep,
        onCastVote: () => {
          toast.success('Vote submitted successfully!', {
            description: 'Your encrypted vote has been recorded on-chain.',
          });
          onClose();
          setSelectedChoice(null);
          setVoteStep('ready');
        },
      });
    } catch (err) {
      toast.error('Failed to submit vote', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
      setVoteStep('ready');
    }
  };

  const getButtonText = () => {
    if (voteStep === 'initializing') return 'Initializing FHE...';
    if (voteStep === 'encrypting') return 'Encrypting...';
    if (voteStep === 'casting') return 'Submitting...';
    if (voteStep === 'confirming') return 'Confirming...';
    return 'Submit Vote';
  };

  const voteOptions = [
    { choice: VoteChoice.FOR, label: 'For', icon: ThumbsUp, color: 'success' },
    { choice: VoteChoice.AGAINST, label: 'Against', icon: ThumbsDown, color: 'destructive' },
    { choice: VoteChoice.ABSTAIN, label: 'Abstain', icon: Minus, color: 'secondary' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Cast Your Vote
          </DialogTitle>
          <DialogDescription>{proposalTitle}</DialogDescription>
        </DialogHeader>

        {!isConnected && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/50 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4" />
              Please connect your wallet to vote
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {voteOptions.map(({ choice, label, icon: Icon, color }) => (
              <button
                key={choice}
                onClick={() => setSelectedChoice(choice)}
                disabled={!isConnected || isProcessing}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  !isConnected || isProcessing
                    ? 'opacity-50 cursor-not-allowed'
                    : selectedChoice === choice
                    ? `border-primary bg-primary/10`
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    color === 'success'
                      ? 'bg-green-500/10 text-green-600'
                      : color === 'destructive'
                      ? 'bg-red-500/10 text-red-600'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>

          {selectedChoice !== null && (
            <div className={`rounded-lg border p-4 ${
              isMockMode
                ? 'bg-blue-500/10 border-blue-500/50'
                : 'bg-green-500/10 border-green-500/50'
            }`}>
              <div className="flex items-center gap-2 text-sm mb-1">
                <Lock className="h-4 w-4" />
                <span className="font-medium">
                  {isMockMode ? 'Mock Encryption (Local Testing)' : 'FHE Encryption Enabled'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isMockMode
                  ? 'Your vote will be encrypted using mock FHE for local testing. On Sepolia testnet, real Zama FHE encryption would be used.'
                  : 'Your vote will be encrypted client-side using Zama FHE. Only the final tally will be decrypted.'}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVote}
            disabled={!isConnected || selectedChoice === null || isProcessing}
            className="flex-1"
          >
            {getButtonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
