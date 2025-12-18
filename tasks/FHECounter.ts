import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the FitnessDataStorage contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the FitnessDataStorage contract
 *
 *   npx hardhat --network localhost task:fitness-address
 *   npx hardhat --network localhost task:add-workout --steps 8500 --distance 5200 --calories 450 --duration 60 --heartrate 140 --name "Alice"
 *   npx hardhat --network localhost task:decrypt-steps
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the FitnessDataStorage contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the FitnessDataStorage contract
 *
 *   npx hardhat --network sepolia task:fitness-address
 *   npx hardhat --network sepolia task:add-workout --steps 8500 --distance 5200 --calories 450 --duration 60 --heartrate 140 --name "Alice"
 *   npx hardhat --network sepolia task:decrypt-steps
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:fitness-address
 *   - npx hardhat --network sepolia task:fitness-address
 */
task("task:fitness-address", "Prints the FitnessDataStorage address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const fitnessDataStorage = await deployments.get("FitnessDataStorage");

  console.log("FitnessDataStorage address is " + fitnessDataStorage.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-steps
 *   - npx hardhat --network sepolia task:decrypt-steps
 */
task("task:decrypt-steps", "Decrypts and displays the encrypted steps from FitnessDataStorage")
  .addOptionalParam("address", "Optionally specify the FitnessDataStorage contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const FitnessDataStorageDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FitnessDataStorage");
    console.log(`FitnessDataStorage: ${FitnessDataStorageDeployment.address}`);

    const signers = await ethers.getSigners();

    const fitnessDataContract = await ethers.getContractAt("FitnessDataStorage", FitnessDataStorageDeployment.address);

    const encryptedSteps = await fitnessDataContract.getSteps(signers[0].address);
    if (encryptedSteps === ethers.ZeroHash) {
      console.log(`No fitness data found for ${signers[0].address}`);
      return;
    }

    const clearSteps = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedSteps,
      FitnessDataStorageDeployment.address,
      signers[0],
    );
    console.log(`Encrypted steps: ${encryptedSteps}`);
    console.log(`Clear steps    : ${clearSteps}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:add-workout --steps 8500 --distance 5200 --calories 450 --duration 60 --heartrate 140 --name "Alice"
 *   - npx hardhat --network sepolia task:add-workout --steps 8500 --distance 5200 --calories 450 --duration 60 --heartrate 140 --name "Alice"
 */
task("task:add-workout", "Adds encrypted fitness data to FitnessDataStorage Contract")
  .addOptionalParam("address", "Optionally specify the FitnessDataStorage contract address")
  .addParam("steps", "Daily steps count")
  .addParam("distance", "Running distance in meters")
  .addParam("calories", "Calories burned")
  .addParam("duration", "Workout duration in minutes")
  .addParam("heartrate", "Average heart rate")
  .addParam("name", "User identifier name")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const steps = parseInt(taskArguments.steps);
    const distance = parseInt(taskArguments.distance);
    const calories = parseInt(taskArguments.calories);
    const duration = parseInt(taskArguments.duration);
    const heartrate = parseInt(taskArguments.heartrate);
    const name = taskArguments.name;

    if (!Number.isInteger(steps) || !Number.isInteger(distance) || !Number.isInteger(calories) ||
        !Number.isInteger(duration) || !Number.isInteger(heartrate)) {
      throw new Error(`All numeric arguments must be integers`);
    }

    await fhevm.initializeCLIApi();

    const FitnessDataStorageDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FitnessDataStorage");
    console.log(`FitnessDataStorage: ${FitnessDataStorageDeployment.address}`);

    const signers = await ethers.getSigners();

    const fitnessDataContract = await ethers.getContractAt("FitnessDataStorage", FitnessDataStorageDeployment.address);

    // Encrypt all fitness data values
    const encryptedData = await fhevm
      .createEncryptedInput(FitnessDataStorageDeployment.address, signers[0].address)
      .add64(steps)
      .add64(distance)
      .add64(calories)
      .add64(duration)
      .add64(heartrate)
      .encrypt();

    console.log(`Adding workout data for ${name}:`);
    console.log(`- Steps: ${steps}`);
    console.log(`- Distance: ${distance}m`);
    console.log(`- Calories: ${calories}`);
    console.log(`- Duration: ${duration}min`);
    console.log(`- Heart Rate: ${heartrate}bpm`);

    const tx = await fitnessDataContract
      .connect(signers[0])
      .setFitnessData(
        encryptedData.handles[0], // steps
        encryptedData.handles[1], // distance
        encryptedData.handles[2], // calories
        encryptedData.handles[3], // duration
        encryptedData.handles[4], // heartrate
        encryptedData.inputProof,
        name
      );
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`FitnessDataStorage workout logging succeeded for ${name}!`);
  });

