# Health Lock - Privacy-Preserving Fitness Data Management

## 🎥 Demo Video
[Watch the Health Lock Demo](https://github.com/MonroeScripps/health-lock-key/blob/main/health-lock.mp4)

## 🌐 Live Demo
[Try Health Lock on Vercel](https://health-lock.vercel.app/)

A privacy-preserving fitness data management system built with Fully Homomorphic Encryption (FHE) using the
FHEVM protocol by Zama. Store and manage your fitness data (steps, running distance, calories burned, etc.) with
end-to-end encryption while allowing for encrypted statistical analysis.

## 🏃‍♂️ Features

- **Privacy-First Design**: All fitness data is encrypted using FHE, ensuring your personal health metrics remain private
- **End-to-End Encryption**: Data is encrypted on the client-side before being sent to the blockchain
- **Statistical Analysis**: Third parties can perform computations on encrypted data without decrypting it
- **Multi-Metric Tracking**: Track steps, running distance, calories burned, workout duration, and heart rate
- **Web3 Integration**: Connect with RainbowKit wallet for seamless blockchain interaction
- **Modern UI**: Beautiful, responsive interface built with React and modern web technologies
- **Secure Storage**: Fitness data is permanently stored on the blockchain with user-controlled decryption

## 🚀 Usage

1. **Connect Wallet**: Use the RainbowKit wallet connection in the top-right corner
2. **Log Workout**: Navigate to "Log Workout" and enter your fitness data
3. **View Data**: Switch to "My Fitness Data" to view your encrypted metrics
4. **Decrypt Data**: Click "Decrypt My Fitness Data" to reveal your personal statistics

All fitness data remains encrypted on the blockchain until you choose to decrypt it using your wallet.

## 📊 Supported Fitness Metrics

- Daily step count
- Running distance (in meters)
- Calories burned
- Workout duration (in minutes)
- Average heart rate during workouts
- Total workout sessions tracking

## Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

#### Automated Setup (Recommended)
```bash
# One-command setup for complete development environment
npm run dev:setup

# Then start frontend
cd frontend && npm run dev
```

#### Quick Start Scripts
```bash
# Linux/Mac
./start-dev.sh

# Windows
start-dev.bat
```

#### Manual Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia

   # Update the CONTRACT_ADDRESS in frontend/src/config/contracts.ts with the deployed address
   ```

7. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

8. **Start Frontend Development**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📁 Project Structure

```
health-lock/
├── contracts/           # Smart contract source files
│   └── FitnessDataStorage.sol   # Privacy-preserving fitness data storage contract
├── deploy/              # Deployment scripts
├── tasks/               # Hardhat custom tasks
├── test/                # Test files
├── frontend/            # React frontend with RainbowKit wallet integration
│   ├── src/
│   │   ├── components/  # React components for fitness data management
│   │   ├── config/      # Contract configuration and wagmi setup
│   │   ├── hooks/       # Custom hooks for blockchain interaction
│   │   └── App.tsx      # Main application component
│   └── public/          # Static assets including custom fitness logo
├── hardhat.config.ts    # Hardhat configuration
└── package.json         # Dependencies and scripts
```

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |
| `npm run dev:setup`| Full development setup   |
| `npm run dev:status`| Check environment status |
| `npm run dev:clean`| Clean all caches         |
| `npm run dev:deploy`| Deploy & update frontend |
| `npm run dev:node` | Start Hardhat node       |
| `npm run dev:verify`| Verify deployment        |
| `npm run dev:test` | Test contract connection |

## 📚 Documentation

### Health Lock Project
- [Development Environment Guide](./docs/DEV_ENVIRONMENT.md) - Complete Hardhat development workflow
- [Frontend Documentation](./frontend/README.md) - Frontend setup and troubleshooting

### FHEVM Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

## ✅ Acceptance Criteria

This project meets the following requirements:

- ✅ **Contract Implementation**: FitnessDataStorage.sol contract with encrypted storage for fitness metrics
- ✅ **Frontend Integration**: React + TypeScript frontend with RainbowKit wallet connection
- ✅ **End-to-End Encryption**: Data encryption/decryption cycle completed successfully
- ✅ **UI Components**: Form inputs for logging workouts and display components for viewing data
- ✅ **Testing**: Comprehensive test suite for local and Sepolia deployment
- ✅ **Branding**: Custom fitness-themed logo and UI design
- ✅ **Documentation**: Complete README with setup and usage instructions
- ✅ **Local Deployment**: Contract deployed and tested on local Hardhat network
- ✅ **Frontend Functionality**: Working frontend that can interact with deployed contract

## 🔐 Security & Privacy

- All fitness data is encrypted using FHE before storage
- Users maintain full control over their data decryption
- No plaintext fitness data is stored on-chain
- Wallet-based authentication ensures data ownership
- Statistical analysis can be performed on encrypted data without compromising privacy

---

**Built with ❤️ using FHEVM and modern web technologies**
