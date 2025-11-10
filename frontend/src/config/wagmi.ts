// Enhanced wagmi configuration for fitness data with FHE support
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, localhost } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Health Lock',
  projectId: 'ef3325a718834a2b1b4134d3f520933d', // WalletConnect Project ID
  chains: [
    sepolia,
    {
      ...localhost,
      id: 31337,
      rpcUrls: {
        default: { http: ['http://localhost:8545'] },
        public: { http: ['http://localhost:8545'] },
      },
    }
  ],
  ssr: false,
});
