import { DeployFunction } from "hardhat-deploy/types";
// Enhanced deployment script for fitness data storage contracts with improved error handling
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(`🚀 Deploying FitnessDataStorageSimple with deployer: ${deployer}`);

  const deployedFitnessDataStorage = await deploy("FitnessDataStorageSimple", {
    from: deployer,
    log: true,
    args: [],
    gasLimit: 8000000,
  });

  console.log(`✅ FitnessDataStorageSimple deployed at: ${deployedFitnessDataStorage.address}`);

  // Verify deployment on live networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: deployedFitnessDataStorage.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error);
    }
  }

  console.log("📊 Deployment summary:");
  console.log(`   - Network: ${hre.network.name}`);
  console.log(`   - Contract: FitnessDataStorageSimple`);
  console.log(`   - Address: ${deployedFitnessDataStorage.address}`);
  console.log(`   - Deployer: ${deployer}`);
};
export default func;
func.id = "deploy_fitnessDataStorage"; // id required to prevent reexecution
func.tags = ["FitnessDataStorage"];
