const { ethers, deployments } = require("hardhat");

async function main() {
  console.log("🔗 Testing FitnessDataStorage contract connection...\n");

  try {
    // Get contract address from deployments
    const FitnessDataStorageDeployment = await deployments.get("FitnessDataStorage");
    const contractAddress = FitnessDataStorageDeployment.address;

    console.log(`📍 Using contract address from deployments: ${contractAddress}`);

    // Get contract instance
    const FitnessDataStorage = await ethers.getContractFactory("FitnessDataStorage");
    const fitnessDataStorage = await FitnessDataStorage.attach(contractAddress);

    console.log("✅ Contract attached successfully");
    console.log(`📍 Contract address: ${await fitnessDataStorage.getAddress()}`);

    // Test basic functionality
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Testing with account: ${deployer.address}`);

    // Test hasFitnessData function
    const hasData = await fitnessDataStorage.hasFitnessData(deployer.address);
    console.log(`📊 hasFitnessData: ${hasData}`);

    // Test getTotalWorkouts function
    const totalWorkouts = await fitnessDataStorage.getTotalWorkouts(deployer.address);
    console.log(`🏃 Total workouts: ${totalWorkouts}`);

    // Test protocolId (pure function)
    const protocolId = await fitnessDataStorage.protocolId();
    console.log(`🔢 Protocol ID: ${protocolId}`);

    console.log("\n🎉 Contract connection test PASSED!");
    console.log("✅ All basic functions are accessible");

  } catch (error) {
    console.error("❌ Contract connection test FAILED!");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script execution failed:", error);
    process.exit(1);
  });
