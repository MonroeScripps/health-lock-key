#!/usr/bin/env node

/**
 * Health Lock - Development Environment Manager
 * Handles Hardhat node management, contract deployment, and environment setup
 */

// Development setup script for fitness data storage project
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DevManager {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.contractsDir = path.join(this.rootDir, 'contracts');
    this.frontendDir = path.join(this.rootDir, 'frontend');
    this.deploymentFile = path.join(this.rootDir, 'deployments', 'localhost', 'FitnessDataStorageSimple.json');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  // Check if Hardhat node is running
  checkNodeStatus() {
    try {
      const output = execSync('netstat -ano | findstr :8545', { encoding: 'utf8' });
      return output.includes('8545');
    } catch (error) {
      return false;
    }
  }

  // Start Hardhat node
  startNode() {
    this.log('Starting Hardhat local node...');
    const nodeProcess = spawn('npx', ['hardhat', 'node'], {
      cwd: this.rootDir,
      stdio: 'inherit',
      detached: true
    });

    // Wait for node to be ready
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.checkNodeStatus()) {
          this.log('✅ Hardhat node started successfully', 'success');
          resolve(nodeProcess);
        } else {
          this.log('❌ Failed to start Hardhat node', 'error');
          resolve(null);
        }
      }, 3000);
    });
  }

  // Clean build cache
  cleanCache() {
    this.log('Cleaning build cache...');

    try {
      // Remove Hardhat cache
      execSync('npx hardhat clean', { cwd: this.rootDir });
      this.log('✅ Hardhat cache cleaned', 'success');
    } catch (error) {
      this.log('⚠️ Hardhat cache clean failed, continuing...', 'warning');
    }

    try {
      // Remove node_modules/.cache if it exists
      const cacheDir = path.join(this.rootDir, 'node_modules', '.cache');
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        this.log('✅ Node cache cleaned', 'success');
      }
    } catch (error) {
      this.log('⚠️ Node cache clean failed, continuing...', 'warning');
    }

    try {
      // Clean frontend build
      execSync('npm run clean', { cwd: this.frontendDir });
      this.log('✅ Frontend cache cleaned', 'success');
    } catch (error) {
      this.log('⚠️ Frontend cache clean failed, continuing...', 'warning');
    }
  }

  // Compile contracts
  compileContracts() {
    this.log('Compiling contracts...');
    try {
      execSync('npx hardhat compile', { cwd: this.rootDir, stdio: 'inherit' });
      this.log('✅ Contracts compiled successfully', 'success');
      return true;
    } catch (error) {
      this.log('❌ Contract compilation failed', 'error');
      console.error(error.message);
      return false;
    }
  }

  // Deploy contracts
  deployContracts() {
    this.log('Deploying contracts...');
    try {
      const output = execSync('npx hardhat deploy --network localhost --reset', {
        cwd: this.rootDir,
        encoding: 'utf8'
      });

      // Extract contract address from output
      const addressMatch = output.match(/FitnessDataStorageSimple contract:\s+(0x[a-fA-F0-9]{40})/);
      if (addressMatch) {
        const contractAddress = addressMatch[1];
        this.log(`✅ Contract deployed at: ${contractAddress}`, 'success');
        return contractAddress;
      } else {
        // Try alternative pattern for newer deployment output
        const altMatch = output.match(/deployed at (0x[a-fA-F0-9]{40})/);
        if (altMatch) {
          const contractAddress = altMatch[1];
          this.log(`✅ Contract deployed at: ${contractAddress}`, 'success');
          return contractAddress;
        }
        this.log('⚠️ Contract deployed but address not found in output', 'warning');
        return null;
      }
    } catch (error) {
      this.log('❌ Contract deployment failed', 'error');
      console.error(error.message);
      return null;
    }
  }

  // Update frontend configuration
  updateFrontendConfig(contractAddress) {
    if (!contractAddress) {
      this.log('❌ No contract address provided', 'error');
      return false;
    }

    const configPath = path.join(this.frontendDir, 'src', 'config', 'contracts.ts');

    try {
      let configContent = fs.readFileSync(configPath, 'utf8');

      // Update contract address for localhost (31337)
      const addressRegex = /(31337:\s*)'0x[a-fA-F0-9]{40}'/;
      configContent = configContent.replace(addressRegex, `$1'${contractAddress}'`);

      fs.writeFileSync(configPath, configContent);
      this.log(`✅ Frontend config updated with address: ${contractAddress}`, 'success');

      // Generate new ABI if needed
      this.generateABI();

      return true;
    } catch (error) {
      this.log('❌ Failed to update frontend config', 'error');
      console.error(error.message);
      return false;
    }
  }

  // Generate ABI (TypeChain)
  generateABI() {
    this.log('Generating TypeChain bindings...');
    try {
      execSync('npm run typechain', { cwd: this.rootDir, stdio: 'inherit' });
      this.log('✅ TypeChain bindings generated', 'success');
      return true;
    } catch (error) {
      this.log('⚠️ TypeChain generation failed, continuing...', 'warning');
      return false;
    }
  }

  // Verify deployment
  verifyDeployment(contractAddress) {
    if (!contractAddress) {
      this.log('❌ No contract address to verify', 'error');
      return false;
    }

    this.log('Verifying deployment...');
    try {
      // Check if deployment file exists
      if (!fs.existsSync(this.deploymentFile)) {
        this.log('❌ Deployment file not found', 'error');
        return false;
      }

      const deploymentData = JSON.parse(fs.readFileSync(this.deploymentFile, 'utf8'));

      if (deploymentData.address.toLowerCase() === contractAddress.toLowerCase()) {
        this.log('✅ Deployment verification passed', 'success');
        return true;
      } else {
        this.log('❌ Deployment address mismatch', 'error');
        return false;
      }
    } catch (error) {
      this.log('❌ Deployment verification failed', 'error');
      console.error(error.message);
      return false;
    }
  }

  // Test contract connection
  async testContractConnection() {
    this.log('Testing contract connection...');
    try {
      execSync('npx hardhat run scripts/test-contract-connection.js --network localhost', {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
      this.log('✅ Contract connection test passed', 'success');
      return true;
    } catch (error) {
      this.log('❌ Contract connection test failed', 'error');
      return false;
    }
  }

  // Full development setup
  async fullSetup(options = {}) {
    const { skipNode = false, skipDeploy = false, skipVerify = false } = options;

    this.log('🚀 Starting full development environment setup...', 'info');

    // Clean cache
    this.cleanCache();

    // Start node if requested
    let nodeProcess = null;
    if (!skipNode) {
      nodeProcess = await this.startNode();
    }

    // Compile contracts
    if (!this.compileContracts()) {
      return false;
    }

    let contractAddress = null;

    // Deploy contracts
    if (!skipDeploy) {
      contractAddress = this.deployContracts();
      if (!contractAddress) {
        return false;
      }
    }

    // Update frontend config
    if (contractAddress && !this.updateFrontendConfig(contractAddress)) {
      return false;
    }

    // Verify deployment
    if (!skipVerify && contractAddress) {
      if (!this.verifyDeployment(contractAddress)) {
        return false;
      }
    }

    // Test connection
    if (contractAddress && !await this.testContractConnection()) {
      return false;
    }

    this.log('🎉 Development environment setup completed successfully!', 'success');

    if (nodeProcess) {
      this.log('💡 Hardhat node is running in background. Use Ctrl+C to stop when done.', 'info');
    }

    return true;
  }

  // Quick status check
  status() {
    this.log('🔍 Checking development environment status...', 'info');

    // Check node status
    const nodeRunning = this.checkNodeStatus();
    this.log(`Hardhat Node: ${nodeRunning ? '🟢 Running' : '🔴 Stopped'}`, nodeRunning ? 'success' : 'warning');

    // Check contract deployment
    let contractDeployed = false;
    let contractAddress = null;

    try {
      if (fs.existsSync(this.deploymentFile)) {
        const deploymentData = JSON.parse(fs.readFileSync(this.deploymentFile, 'utf8'));
        contractAddress = deploymentData.address;
        contractDeployed = true;
      }
    } catch (error) {
      // Ignore errors
    }

    this.log(`Contract Deployed: ${contractDeployed ? '🟢 Yes' : '🔴 No'}`, contractDeployed ? 'success' : 'warning');
    if (contractAddress) {
      this.log(`Contract Address: ${contractAddress}`, 'info');
    }

    // Check frontend config
    const configPath = path.join(this.frontendDir, 'src', 'config', 'contracts.ts');
    let configUpdated = false;

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      // Match the localhost address in CONTRACT_ADDRESSES object
      const configMatch = configContent.match(/31337:\s*'([^']+)'/);
      if (configMatch && contractAddress) {
        configUpdated = configMatch[1].toLowerCase() === contractAddress.toLowerCase();
      }
    } catch (error) {
      // Ignore errors
    }

    this.log(`Frontend Config: ${configUpdated ? '🟢 Synced' : '🔴 Outdated'}`, configUpdated ? 'success' : 'warning');

    return {
      nodeRunning,
      contractDeployed,
      contractAddress,
      configUpdated
    };
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const manager = new DevManager();

  switch (command) {
    case 'setup':
      await manager.fullSetup();
      break;

    case 'node':
      await manager.startNode();
      break;

    case 'clean':
      manager.cleanCache();
      break;

    case 'compile':
      manager.compileContracts();
      break;

    case 'deploy':
      const address = manager.deployContracts();
      if (address) {
        manager.updateFrontendConfig(address);
        manager.verifyDeployment(address);
      }
      break;

    case 'verify':
      const status = manager.status();
      if (status.contractAddress) {
        manager.verifyDeployment(status.contractAddress);
      }
      break;

    case 'status':
      manager.status();
      break;

    case 'test':
      await manager.testContractConnection();
      break;

    case 'help':
    default:
      console.log(`
🤖 Health Lock Development Manager

USAGE:
  node scripts/dev-setup.js <command>

COMMANDS:
  setup     Full development environment setup (recommended)
  node      Start Hardhat node
  clean     Clean all build caches
  compile   Compile contracts
  deploy    Deploy contracts and update frontend
  verify    Verify current deployment
  status    Check environment status
  test      Test contract connection
  help      Show this help message

EXAMPLES:
  node scripts/dev-setup.js setup    # Complete setup
  node scripts/dev-setup.js status   # Check current status
  node scripts/dev-setup.js deploy   # Just deploy contracts

TIPS:
- Run 'setup' after restarting your computer
- Use 'status' to check if everything is in sync
- Run 'clean' if you encounter compilation issues
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DevManager;
