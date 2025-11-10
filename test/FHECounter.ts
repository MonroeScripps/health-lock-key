import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FitnessDataStorage, FitnessDataStorage__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FitnessDataStorage")) as FitnessDataStorage__factory;
  const fitnessDataContract = (await factory.deploy()) as FitnessDataStorage;
  const fitnessDataContractAddress = await fitnessDataContract.getAddress();

  return { fitnessDataContract, fitnessDataContractAddress };
}

describe("FitnessDataStorage", function () {
  let signers: Signers;
  let fitnessDataContract: FitnessDataStorage;
  let fitnessDataContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ fitnessDataContract, fitnessDataContractAddress } = await deployFixture());
  });

  it("should deploy with no initial data", async function () {
    const hasData = await fitnessDataContract.hasFitnessData(signers.alice.address);
    expect(hasData).to.be.false;

    const totalWorkouts = await fitnessDataContract.getTotalWorkouts(signers.alice.address);
    expect(totalWorkouts).to.eq(0);
  });

  it("should store and retrieve encrypted fitness data", async function () {
    // Test data
    const testData = {
      name: "Alice Fitness",
      steps: 8500,
      runningDistance: 5200, // 5.2 km in meters
      caloriesBurned: 450,
      workoutDuration: 60, // 60 minutes
      heartRateAvg: 140
    };

    // Encrypt fitness data
    const encryptedInput = await fhevm
      .createEncryptedInput(fitnessDataContractAddress, signers.alice.address)
      .add64(testData.steps)
      .add64(testData.runningDistance)
      .add64(testData.caloriesBurned)
      .add64(testData.workoutDuration)
      .add64(testData.heartRateAvg)
      .encrypt();

    // Set fitness data
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

    // Verify data was stored
    const hasData = await fitnessDataContract.hasFitnessData(signers.alice.address);
    expect(hasData).to.be.true;

    const totalWorkouts = await fitnessDataContract.getTotalWorkouts(signers.alice.address);
    expect(totalWorkouts).to.eq(1);

    const name = await fitnessDataContract.getName(signers.alice.address);
    expect(name).to.eq(testData.name);

    // Decrypt and verify encrypted data
    const encryptedSteps = await fitnessDataContract.getSteps(signers.alice.address);
    const decryptedSteps = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedSteps,
      fitnessDataContractAddress,
      signers.alice,
    );
    expect(decryptedSteps).to.eq(testData.steps);

    const encryptedDistance = await fitnessDataContract.getRunningDistance(signers.alice.address);
    const decryptedDistance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedDistance,
      fitnessDataContractAddress,
      signers.alice,
    );
    expect(decryptedDistance).to.eq(testData.runningDistance);

    const encryptedCalories = await fitnessDataContract.getCaloriesBurned(signers.alice.address);
    const decryptedCalories = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedCalories,
      fitnessDataContractAddress,
      signers.alice,
    );
    expect(decryptedCalories).to.eq(testData.caloriesBurned);
  });

  it("should allow users to update their fitness data", async function () {
    // First set of data
    const initialData = {
      name: "Alice Fitness",
      steps: 5000,
      runningDistance: 3000,
      caloriesBurned: 250,
      workoutDuration: 30,
      heartRateAvg: 130
    };

    const encryptedInput1 = await fhevm
      .createEncryptedInput(fitnessDataContractAddress, signers.alice.address)
      .add64(initialData.steps)
      .add64(initialData.runningDistance)
      .add64(initialData.caloriesBurned)
      .add64(initialData.workoutDuration)
      .add64(initialData.heartRateAvg)
      .encrypt();

    await fitnessDataContract
      .connect(signers.alice)
      .setFitnessData(
        encryptedInput1.handles[0],
        encryptedInput1.handles[1],
        encryptedInput1.handles[2],
        encryptedInput1.handles[3],
        encryptedInput1.handles[4],
        encryptedInput1.inputProof,
        initialData.name
      );

    // Updated data
    const updatedData = {
      name: "Alice Fitness Updated",
      steps: 10000,
      runningDistance: 8000,
      caloriesBurned: 600,
      workoutDuration: 90,
      heartRateAvg: 150
    };

    const encryptedInput2 = await fhevm
      .createEncryptedInput(fitnessDataContractAddress, signers.alice.address)
      .add64(updatedData.steps)
      .add64(updatedData.runningDistance)
      .add64(updatedData.caloriesBurned)
      .add64(updatedData.workoutDuration)
      .add64(updatedData.heartRateAvg)
      .encrypt();

    await fitnessDataContract
      .connect(signers.alice)
      .setFitnessData(
        encryptedInput2.handles[0],
        encryptedInput2.handles[1],
        encryptedInput2.handles[2],
        encryptedInput2.handles[3],
        encryptedInput2.handles[4],
        encryptedInput2.inputProof,
        updatedData.name
      );

    // Verify updated data
    const totalWorkouts = await fitnessDataContract.getTotalWorkouts(signers.alice.address);
    expect(totalWorkouts).to.eq(2); // Should increment workout count

    const name = await fitnessDataContract.getName(signers.alice.address);
    expect(name).to.eq(updatedData.name);

    const encryptedSteps = await fitnessDataContract.getSteps(signers.alice.address);
    const decryptedSteps = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedSteps,
      fitnessDataContractAddress,
      signers.alice,
    );
    expect(decryptedSteps).to.eq(updatedData.steps);
  });

  it("should isolate data between different users", async function () {
    // Alice's data
    const aliceData = {
      name: "Alice",
      steps: 7000,
      runningDistance: 4000,
      caloriesBurned: 350,
      workoutDuration: 45,
      heartRateAvg: 135
    };

    const aliceEncrypted = await fhevm
      .createEncryptedInput(fitnessDataContractAddress, signers.alice.address)
      .add64(aliceData.steps)
      .add64(aliceData.runningDistance)
      .add64(aliceData.caloriesBurned)
      .add64(aliceData.workoutDuration)
      .add64(aliceData.heartRateAvg)
      .encrypt();

    await fitnessDataContract
      .connect(signers.alice)
      .setFitnessData(
        aliceEncrypted.handles[0],
        aliceEncrypted.handles[1],
        aliceEncrypted.handles[2],
        aliceEncrypted.handles[3],
        aliceEncrypted.handles[4],
        aliceEncrypted.inputProof,
        aliceData.name
      );

    // Bob's data
    const bobData = {
      name: "Bob",
      steps: 12000,
      runningDistance: 10000,
      caloriesBurned: 800,
      workoutDuration: 120,
      heartRateAvg: 160
    };

    const bobEncrypted = await fhevm
      .createEncryptedInput(fitnessDataContractAddress, signers.bob.address)
      .add64(bobData.steps)
      .add64(bobData.runningDistance)
      .add64(bobData.caloriesBurned)
      .add64(bobData.workoutDuration)
      .add64(bobData.heartRateAvg)
      .encrypt();

    await fitnessDataContract
      .connect(signers.bob)
      .setFitnessData(
        bobEncrypted.handles[0],
        bobEncrypted.handles[1],
        bobEncrypted.handles[2],
        bobEncrypted.handles[3],
        bobEncrypted.handles[4],
        bobEncrypted.inputProof,
        bobData.name
      );

    // Verify data isolation
    expect(await fitnessDataContract.getName(signers.alice.address)).to.eq(aliceData.name);
    expect(await fitnessDataContract.getName(signers.bob.address)).to.eq(bobData.name);

    const aliceSteps = await fitnessDataContract.getSteps(signers.alice.address);
    const decryptedAliceSteps = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      aliceSteps,
      fitnessDataContractAddress,
      signers.alice,
    );
    expect(decryptedAliceSteps).to.eq(aliceData.steps);

    const bobSteps = await fitnessDataContract.getSteps(signers.bob.address);
    const decryptedBobSteps = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      bobSteps,
      fitnessDataContractAddress,
      signers.bob,
    );
    expect(decryptedBobSteps).to.eq(bobData.steps);
  });
});
