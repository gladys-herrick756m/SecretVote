import { useMemo } from 'react';
import { getGovernanceContract } from '@/utils/getContract';
import { useWalletClient } from 'wagmi';

export function useGovernanceContract(signerOrProvider?: any) {
  const { data: walletClient } = useWalletClient();
  const effectiveSigner = signerOrProvider || walletClient;
  return useMemo(() => getGovernanceContract(effectiveSigner), [effectiveSigner]);
}
