// Based on Zamabelief reference implementation
// Using Relayer SDK 0.2.0 from CDN to bypass bundling issues

let fheInstance: any = null;

export interface EncryptedValue {
  data: string;
  inputProof: string;
}

export async function initializeFheInstance() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
  }

  console.log('[FHE] Loading Relayer SDK from CDN...');
  const sdk: any = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
  const { initSDK, createInstance, SepoliaConfig } = sdk as any;

  console.log('[FHE] Initializing WASM...');
  await initSDK();

  console.log('[FHE] Creating FHE instance with Sepolia config:', {
    aclContract: SepoliaConfig.aclContractAddress,
    kmsContract: SepoliaConfig.kmsContractAddress,
    chainId: SepoliaConfig.chainId,
    network: SepoliaConfig.network,
  });

  // Use SepoliaConfig's default RPC instead of MetaMask to avoid provider issues
  const config = SepoliaConfig;

  try {
    fheInstance = await createInstance(config);
    console.log('[FHE] Instance created successfully');
    return fheInstance;
  } catch (err: any) {
    console.error('[FHE] Instance creation failed:', err);
    console.error('[FHE] Error details:', {
      message: err.message,
      code: err.code,
      data: err.data,
    });
    throw new Error(`FHE initialization failed: ${err.message || 'Unknown error'}`);
  }
}

export function getFheInstance() {
  return fheInstance;
}

export async function encryptUint32(
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<EncryptedValue> {
  let fhe = getFheInstance();
  if (!fhe) {
    fhe = await initializeFheInstance();
  }
  if (!fhe) throw new Error('Failed to initialize FHE instance');

  const ciphertext = await fhe.createEncryptedInput(contractAddress, userAddress);
  ciphertext.add32(BigInt(value));
  const { handles, inputProof } = await ciphertext.encrypt();

  return {
    data: handles[0] as string,
    inputProof: inputProof as string,
  };
}

export async function mockEncryptUint32(value: number): Promise<EncryptedValue> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const hexValue = value.toString(16).padStart(64, '0');
  const mockProof = '0'.repeat(64);
  return {
    data: '0x' + hexValue,
    inputProof: '0x' + mockProof,
  };
}

export async function encryptVote(
  value: number,
  chainId: number,
  contractAddress: string,
  userAddress?: string
): Promise<EncryptedValue> {
  if (chainId === 11155111 && userAddress) {
    return encryptUint32(value, contractAddress, userAddress);
  }
  return mockEncryptUint32(value);
}
