import { ethers } from 'ethers';
import { SecretVoteABI } from '@/config/abi';
import { CONTRACT_ADDRESS } from '@/config/contract';

export function getGovernanceContract(providerOrSigner?: any) {
  if (!CONTRACT_ADDRESS) throw new Error('CONTRACT_ADDRESS not configured');

  let runner: any = providerOrSigner;
  
  // If runner is not provided, create BrowserProvider from window.ethereum
  const isEthersRunner = runner && typeof runner === 'object' && (
    'provider' in runner || // Signer
    'getBlockNumber' in runner || // Provider
    'call' in runner
  );
  
  if (!isEthersRunner) {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      runner = new ethers.BrowserProvider((window as any).ethereum);
    } else {
      throw new Error('No ethereum provider found');
    }
  }

  return new ethers.Contract(CONTRACT_ADDRESS, SecretVoteABI, runner);
}
