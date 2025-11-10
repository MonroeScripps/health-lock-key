import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { FitnessDataStorage } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("FitnessDataStorageSepolia", function () {
  let signers: Signers;
  let fitnessDataContract: FitnessDataStorage;
  let fitnessDataContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const FitnessDataStorageDeployment = await deployments.get("FitnessDataStorage");
      fitnessDataContractAddress = FitnessDataStorageDeployment.address;
      fitnessDataContract = await ethers.getContractAt("FitnessDataStorage", FitnessDataStorageDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("store and retrieve fitness data on Sepolia", async function () {
    steps = 8;

    this.timeout(4 * 40000);

    // Test fitness data
    const testData = {
      name: "Alice Fitness Sepolia",
      steps: 9500,
      runningDistance: 6200, // 6.2 km in meters
      caloriesBurned: 520,
      workoutDuration: 75, // 75 minutes
      heartRateAvg: 145
    };

    progress(`Encrypting fitness data for ${testData.name}...`);
    const encryptedInput = await fhevm
      .createEncryptedInput(fitnessDataContractAddress, signers.alice.address)
      .add64(testData.steps)
      .add64(testData.runningDistance)
      .add64(testData.caloriesBurned)
      .add64(testData.workoutDuration)
      .add64(testData.heartRateAvg)
      .encrypt();

    progress(
      `Call setFitnessData() FitnessDataStorage=${fitnessDataContractAddress} signer=${signers.alice.address}...`,
    );
    const tx = await fitnessDataContract
      .connect(signers.alice)
      .setFitnessData(
        encryptedInput.handles[0], // steps
        encryptedInput.handles[1], // runningDistance
        encryptedInput.handles[2], // caloriesBurned
        encryptedInput.handles[3], // workoutDuration
        encryptedInput.handles[4], // heartRateAvg
        encryptedInput.inputProof,
        testData.name
      );
    await tx.wait();

    progress(`Verifying data was stored...`);
    const hasData = await fitnessDataContract.hasFitnessData(signers.alice.address);
    expect(hasData).to.be.true;

    const name = await fitnessDataContract.getName(signers.alice.address);
    expect(name).to.eq(testData.name);
    progress(`Name verified: ${name}`);

    progress(`Retrieving and decrypting steps data...`);
    const encryptedSteps = await fitnessDataContract.getSteps(signers.alice.address);
    const clearSteps = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedSteps,
      fitnessDataContractAddress,
      signers.alice,
    );
    progress(`Decrypted steps: ${clearSteps}`);
    expect(clearSteps).to.eq(testData.steps);

    progress(`Retrieving and decrypting running distance...`);
    const encryptedDistance = await fitnessDataContract.getRunningDistance(signers.alice.address);
    const clearDistance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedDistance,
      fitnessDataContractAddress,
      signers.alice,
    );
    progress(`Decrypted distance: ${clearDistance}`);
    expect(clearDistance).to.eq(testData.runningDistance);

    progress(`Retrieving and decrypting calories burned...`);
    const encryptedCalories = await fitnessDataContract.getCaloriesBurned(signers.alice.address);
    const clearCalories = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedCalories,
      fitnessDataContractAddress,
      signers.alice,
    );
    progress(`Decrypted calories: ${clearCalories}`);
    expect(clearCalories).to.eq(testData.caloriesBurned);

    progress(`Checking total workouts...`);
    const totalWorkouts = await fitnessDataContract.getTotalWorkouts(signers.alice.address);
    expect(totalWorkouts).to.eq(1);
    progress(`Total workouts: ${totalWorkouts}`);
  });
});
