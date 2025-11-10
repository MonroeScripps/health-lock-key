# Health Lock - Frontend

Privacy-preserving fitness data management frontend built with React, TypeScript, and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

### Wallet Configuration

**Current Setup**: Simplified MetaMask-only configuration for reliable local development.

**Why Simplified?**
- Avoids WalletConnect cloud configuration complexity
- Eliminates CORS and project ID issues
- Provides stable MetaMask connection
- Suitable for development and testing

**For Production Deployment**:
1. Install RainbowKit: `npm install @rainbow-me/rainbowkit`
2. Get WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com/)
3. Update `src/config/wagmi.ts` to use full RainbowKit configuration
4. Configure allowed domains in WalletConnect project settings

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# For production with WalletConnect (optional for current setup)
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here

# Infura API Key for Sepolia network (optional)
VITE_INFURA_API_KEY=your-infura-api-key-here
```

### Troubleshooting Common Issues

#### 1. MetaMask Connection Issues

**Problem**: MetaMask button not working or connection fails

**Solution**:
- Ensure MetaMask extension is installed and unlocked
- Make sure you're connected to the correct network (localhost:8545 for development)
- Try refreshing the page and reconnecting
- Check browser console for detailed error messages

#### 2. FHEVM Relayer Connection Errors

**Problem**: `relayer.testnet.zama.cloud` connection fails with `ERR_CONNECTION_CLOSED`

**Solution**:
- This is normal for development - the app automatically falls back to mock mode
- Real FHEVM encryption will work when deployed to Sepolia with proper relayer access
- Check browser console for "FHEVM service unavailable, using demo mode" message

#### 3. SharedArrayBuffer / Thread Support Issues

**Problem**: "This browser does not support threads" or COOP/COEP header errors

**Solution**:
- The app automatically detects browser capabilities
- Falls back to demo mode if SharedArrayBuffer is not available
- For full FHEVM support, enable these Chrome flags:
  - `chrome://flags/#enable-experimental-web-platform-features`
  - `chrome://flags/#enable-webassembly-threads`
- Or use Chrome with `--enable-features=SharedArrayBuffer`
- Check browser console for "Browser does not support FHEVM threads" message

#### 4. Chrome Third-Party Cookies Warning

**Problem**: Chrome shows warnings about third-party cookies

**Solution**:
- This is a browser security feature, not an error
- The app will still work normally
- No action needed

#### 2. FHEVM Relayer Connection Issues

**Problem**: "FHEVM service unavailable, using demo mode"

**Solution**:
- This is normal for development - FHEVM relayer may be temporarily unavailable
- The app automatically falls back to demo mode
- Real FHEVM encryption works when deployed to supported networks
- Check console for detailed error messages

#### 3. Build Errors After Configuration Changes

**Problem**: Build fails after updating configuration

**Solution**:
- Run `npm install` to update dependencies
- Clear node_modules: `rm -rf node_modules && npm install`
- Check that all imports are correct in updated files
- Restart the development server

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── CreateProfile.tsx    # Workout logging form
│   │   └── Profile.tsx          # Fitness data display
│   ├── config/
│   │   ├── contracts.ts         # Contract addresses and ABI
│   │   └── wagmi.ts            # Simplified MetaMask configuration
│   ├── hooks/
│   │   ├── useEthersSigner.ts   # Ethers signer hook
│   │   └── useZamaInstance.ts   # FHEVM instance hook
│   ├── App.tsx                 # Main app component with custom wallet UI
│   └── main.tsx               # App entry point
├── public/                    # Static assets
└── dist/                     # Build output
```

## 🔐 Security Features

- **FHEVM Integration**: Fully Homomorphic Encryption for fitness data
- **Wallet Connection**: Secure wallet-based authentication
- **Encrypted Storage**: All fitness metrics stored encrypted on blockchain
- **Privacy-First**: Users control their own data decryption

## 🏃‍♂️ Features

- **Workout Logging**: Log daily steps, running distance, calories, duration, and heart rate
- **Encrypted Display**: View encrypted fitness data with option to decrypt
- **Multi-Network Support**: Works on localhost (development) and Sepolia (production)
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data synchronization with blockchain

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **RainbowKit** - Wallet connection
- **Wagmi** - Ethereum interactions
- **Zama FHEVM** - Homomorphic encryption
- **Tailwind CSS** - Styling

## 🔗 Integration Points

### Smart Contract
- **Address**: Configured in `src/config/contracts.ts`
- **ABI**: Auto-generated from contract compilation
- **Network**: Supports localhost (31337) and Sepolia (11155111)

### FHEVM Relayer
- **Localhost**: Uses mock implementation for development
- **Sepolia**: Uses Zama's testnet relayer service
- **Fallback**: Automatically degrades to demo mode if relayer unavailable

## 🚨 Error Handling

The app includes comprehensive error handling for:

- Network connection issues
- Wallet disconnection
- FHEVM service unavailability
- Contract interaction failures
- Invalid user inputs

Errors are displayed to users with clear, actionable messages.
