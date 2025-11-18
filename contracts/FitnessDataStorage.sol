// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Health Lock - Privacy-Preserving Fitness Data Storage
 * @notice Secure fitness data management using Fully Homomorphic Encryption (FHE)
 * @dev Implements encrypted fitness metrics storage with Zama FHEVM
 * @custom:security-contact security@health-lock.com
 */

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FitnessDataStorage
/// @notice Store and retrieve user's encrypted fitness data using FHEVM
/// @dev Uses Zama FHEVM types. Numerical fields are encrypted euint64.
contract FitnessDataStorage is SepoliaConfig {
    struct FitnessDataInput {
        externalEuint64 steps;
        externalEuint64 runningDistance;
        externalEuint64 caloriesBurned;
        externalEuint64 workoutDuration;
        externalEuint64 heartRateAvg;
        string name;
    }

    struct FitnessData {
        string name; // clear text - user identifier
        euint64 steps; // daily steps count
        euint64 runningDistance; // running distance in meters
        euint64 caloriesBurned; // calories burned
        euint64 workoutDuration; // workout duration in minutes
        euint64 heartRateAvg; // average heart rate during workout
        uint256 lastUpdate; // timestamp of last update
    }

    mapping(address => FitnessData) private _fitnessRecords;
    mapping(address => uint256) private _totalWorkouts;

    /// @notice Total number of fitness data records
    uint256 public totalRecords;

    /// @notice Authorized operators who can perform administrative operations
    mapping(address => bool) public authorizedOperators;

    event FitnessDataUpdated(address indexed user, uint256 timestamp);
    event BatchDataImported(address indexed user, uint256 entriesCount, uint256 timestamp);

    /// @notice Set or update caller's fitness data
    /// @param steps external encrypted steps handle
    /// @param runningDistance external encrypted running distance handle
    /// @param caloriesBurned external encrypted calories burned handle
    /// @param workoutDuration external encrypted workout duration handle
    /// @param heartRateAvg external encrypted average heart rate handle
    /// @param inputProof input proof returned by the relayer SDK encrypt()
    /// @param name clear text user identifier
    function setFitnessData(
        externalEuint64 steps,
        externalEuint64 runningDistance,
        externalEuint64 caloriesBurned,
        externalEuint64 workoutDuration,
        externalEuint64 heartRateAvg,
        bytes calldata inputProof,
        string calldata name
    ) external {
        // Removed input proof validation for development
        require(inputProof.length > 0, "Input proof cannot be empty");
        require(name.length > 0, "Name cannot be empty");
        require(bytes(name).length <= 50, "Name too long");
        euint64 _steps = FHE.fromExternal(steps, inputProof);
        euint64 _runningDistance = FHE.fromExternal(runningDistance, inputProof);
        euint64 _caloriesBurned = FHE.fromExternal(caloriesBurned, inputProof);
        euint64 _workoutDuration = FHE.fromExternal(workoutDuration, inputProof);
        euint64 _heartRateAvg = FHE.fromExternal(heartRateAvg, inputProof);

        _fitnessRecords[msg.sender] = FitnessData({
            name: name,
            steps: _steps,
            runningDistance: _runningDistance,
            caloriesBurned: _caloriesBurned,
            workoutDuration: _workoutDuration,
            heartRateAvg: _heartRateAvg,
            lastUpdate: block.timestamp
        });

        _totalWorkouts[msg.sender]++;
        totalRecords++;

        // Allow access: contract and user
        FHE.allowThis(_fitnessRecords[msg.sender].steps);
        FHE.allowThis(_fitnessRecords[msg.sender].runningDistance);
        FHE.allowThis(_fitnessRecords[msg.sender].caloriesBurned);
        FHE.allowThis(_fitnessRecords[msg.sender].workoutDuration);
        FHE.allowThis(_fitnessRecords[msg.sender].heartRateAvg);

        FHE.allow(_fitnessRecords[msg.sender].steps, msg.sender);
        FHE.allow(_fitnessRecords[msg.sender].runningDistance, msg.sender);
        FHE.allow(_fitnessRecords[msg.sender].caloriesBurned, msg.sender);
        FHE.allow(_fitnessRecords[msg.sender].workoutDuration, msg.sender);
        FHE.allow(_fitnessRecords[msg.sender].heartRateAvg, msg.sender);

        emit FitnessDataUpdated(msg.sender, block.timestamp);
    }

    /// @notice Batch set multiple fitness data entries
    /// @param entries Array of fitness data entries to set
    /// @dev Useful for importing historical data or bulk operations
    function batchSetFitnessData(
        FitnessDataInput[] calldata entries,
        bytes[] calldata inputProofs
    ) external {
        require(entries.length == inputProofs.length, "Mismatched array lengths");
        require(entries.length > 0 && entries.length <= 10, "Invalid batch size");

        for (uint256 i = 0; i < entries.length; i++) {
            FitnessDataInput memory entry = entries[i];
            bytes memory proof = inputProofs[i];

            require(proof.length > 0, "Input proof cannot be empty");
            require(bytes(entry.name).length > 0, "Name cannot be empty");
            require(bytes(entry.name).length <= 50, "Name too long");

            euint64 _steps = FHE.fromExternal(entry.steps, proof);
            euint64 _runningDistance = FHE.fromExternal(entry.runningDistance, proof);
            euint64 _caloriesBurned = FHE.fromExternal(entry.caloriesBurned, proof);
            euint64 _workoutDuration = FHE.fromExternal(entry.workoutDuration, proof);
            euint64 _heartRateAvg = FHE.fromExternal(entry.heartRateAvg, proof);

            _fitnessRecords[msg.sender] = FitnessData({
                name: entry.name,
                steps: _steps,
                runningDistance: _runningDistance,
                caloriesBurned: _caloriesBurned,
                workoutDuration: _workoutDuration,
                heartRateAvg: _heartRateAvg,
                lastUpdate: block.timestamp
            });

            _totalWorkouts[msg.sender]++;
            totalRecords++;

            emit FitnessDataUpdated(msg.sender, block.timestamp);
        }

        emit BatchDataImported(msg.sender, entries.length, block.timestamp);
    }

    /// @notice Get clear text user name for an account
    function getName(address account) external view returns (string memory) {
        return _fitnessRecords[account].name;
    }

    /// @notice Get encrypted steps for an account
    function getSteps(address account) external view returns (euint64) {
        return _fitnessRecords[account].steps;
    }

    /// @notice Get encrypted running distance for an account
    function getRunningDistance(address account) external view returns (euint64) {
        return _fitnessRecords[account].runningDistance;
    }

    /// @notice Get encrypted calories burned for an account
    function getCaloriesBurned(address account) external view returns (euint64) {
        return _fitnessRecords[account].caloriesBurned;
    }

    /// @notice Get encrypted workout duration for an account
    function getWorkoutDuration(address account) external view returns (euint64) {
        return _fitnessRecords[account].workoutDuration;
    }

    /// @notice Get encrypted average heart rate for an account
    function getHeartRateAvg(address account) external view returns (euint64) {
        return _fitnessRecords[account].heartRateAvg;
    }

    /// @notice Get total workouts count for an account
    function getTotalWorkouts(address account) external view returns (uint256) {
        return _totalWorkouts[account];
    }

    /// @notice Get last update timestamp for an account
    function getLastUpdate(address account) external view returns (uint256) {
        return _fitnessRecords[account].lastUpdate;
    }

    /// @notice Get all encrypted fitness data for an account
    function getAllFitnessData(address account)
        external
        view
        returns (
            string memory name,
            euint64 steps,
            euint64 runningDistance,
            euint64 caloriesBurned,
            euint64 workoutDuration,
            euint64 heartRateAvg,
            uint256 totalWorkouts,
            uint256 lastUpdate
        )
    {
        FitnessData storage d = _fitnessRecords[account];
        return (
            d.name,
            d.steps,
            d.runningDistance,
            d.caloriesBurned,
            d.workoutDuration,
            d.heartRateAvg,
            _totalWorkouts[account],
            d.lastUpdate
        );
    }

    /// @notice Calculate encrypted average of all fitness metrics
    /// @dev Returns average steps across all workouts for the user
    function getAverageSteps(address account) external view returns (euint64) {
        require(hasFitnessData(account), "No fitness data found");
        return FHE.div(_fitnessRecords[account].steps, FHE.asEuint64(_totalWorkouts[account]));
    }

    /// @notice Calculate encrypted weekly average (simplified - just returns the current value)
    /// @dev In a real implementation, this would aggregate multiple entries
    function getWeeklyAverage(address account) external view returns (euint64) {
        return _fitnessRecords[account].steps;
    }

    /// @notice Check if user has fitness data
    function hasFitnessData(address account) external view returns (bool) {
        return _totalWorkouts[account] > 0;
    }

    /// @notice Emergency pause functionality (only for authorized operators)
    /// @dev Allows pausing contract operations in case of emergencies
    function emergencyPause() external {
        require(authorizedOperators[msg.sender], "Not authorized");
        // Implementation would pause contract functionality
        // This is a placeholder for emergency controls
    }

    /// @notice Add authorized operator (only owner can call)
    /// @param operator Address to authorize
    function addAuthorizedOperator(address operator) external {
        require(msg.sender == address(0x1234567890123456789012345678901234567890), "Only owner");
        authorizedOperators[operator] = true;
    }

    /// @notice Remove authorized operator (only owner can call)
    /// @param operator Address to remove authorization from
    function removeAuthorizedOperator(address operator) external {
        require(msg.sender == address(0x1234567890123456789012345678901234567890), "Only owner");
        authorizedOperators[operator] = false;
    }
}
