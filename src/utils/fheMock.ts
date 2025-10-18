/**
 * Mock FHE encryption for local testing
 * In production, use @zama-fhe/fhevmjs
 */

export interface EncryptedValue {
  data: `0x${string}`;
  inputProof: `0x${string}`;
}

/**
 * Mock encrypt function - simulates FHE encryption
 * In local testing, we just encode the plaintext value
 * In production with real Zama infrastructure, this would call fhevmjs.encrypt()
 */
export async function mockEncryptUint32(value: number): Promise<EncryptedValue> {
  // Simulate encryption delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // For local testing: encode value as bytes32
  // Format: pad value to 64 hex characters (32 bytes)
  const hexValue = value.toString(16).padStart(64, '0');
  const data = `0x${hexValue}` as `0x${string}`;

  // Mock proof (32 bytes of zeros)
  const inputProof = `0x${'00'.repeat(32)}` as `0x${string}`;

  return { data, inputProof };
}

/**
 * Check if we're in local mock mode
 * True if not on Sepolia testnet with real Zama infrastructure
 */
export function isLocalMockMode(chainId: number): boolean {
  // Sepolia chainId is 11155111
  return chainId !== 11155111;
}
