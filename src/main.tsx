import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { getDefaultConfig, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const config = getDefaultConfig({
  appName: 'SecretVote',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(undefined, {
      timeout: 60000,
      retryCount: 3,
    }),
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={config}>
      <RainbowKitProvider
        locale="en-US"
        theme={lightTheme({
          accentColor: '#ef4444',
          accentColorForeground: '#ffffff',
          borderRadius: 'medium',
        })}
      >
        <App />
      </RainbowKitProvider>
    </WagmiProvider>
  </QueryClientProvider>
);
