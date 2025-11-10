import { DeployFunction } from "hardhat-deploy/types";
// Enhanced deployment script for fitness data storage contracts with improved error handling
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFitnessDataStorage = await deploy("FitnessDataStorageSimple", {
    from: deployer,
    log: true,
  });

  console.log(`FitnessDataStorageSimple contract: `, deployedFitnessDataStorage.address);
};
export default func;
func.id = "deploy_fitnessDataStorage"; // id required to prevent reexecution
func.tags = ["FitnessDataStorage"];
