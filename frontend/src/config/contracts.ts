// FitnessDataStorageSimple contract configuration (without FHE)
export const CONTRACT_ADDRESSES = {
  // Localhost deployment (chainId: 31337) - Simplified contract
  31337: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  // Sepolia deployment (chainId: 11155111) - Placeholder
  11155111: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Placeholder - update with actual Sepolia deployment
} as const;

export const getContractAddress = (chainId: number): string => {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!address) {
    throw new Error(`No contract deployed on network with chainId ${chainId}`);
  }
  return address;
};

// Check if network supports FHEVM
export const isFhevmSupported = (chainId: number): boolean => {
  return chainId === 31337 || chainId === 11155111; // Both localhost and Sepolia support FHEVM
};

// Get appropriate ABI (same ABI for both networks)
export const getContractABI = (_chainId: number) => {
  return CONTRACT_ABI; // Same FHEVM-enabled ABI for both networks
};

// Simplified ABI for FitnessDataStorageSimple contract (without FHE)
export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "FitnessDataUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getAllFitnessData",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "steps",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "runningDistance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "caloriesBurned",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "workoutDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "heartRateAvg",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWorkouts",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastUpdate",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getCaloriesBurned",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getHeartRateAvg",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getLastUpdate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getName",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getRunningDistance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getSteps",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getTotalWorkouts",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getWorkoutDuration",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasFitnessData",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "steps",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "runningDistance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "caloriesBurned",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "workoutDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "heartRateAvg",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "setFitnessData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
