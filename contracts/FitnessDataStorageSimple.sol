// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title FitnessDataStorageSimple
/// @notice Simplified version for demo purposes without FHE
/// @dev Stores fitness data in clear text for testing
contract FitnessDataStorageSimple {

    struct FitnessData {
        string name; // clear text - user identifier
        uint256 steps; // daily steps count
        uint256 runningDistance; // running distance in meters
        uint256 caloriesBurned; // calories burned
        uint256 workoutDuration; // workout duration in minutes
        uint256 heartRateAvg; // average heart rate during workout
        uint256 lastUpdate; // timestamp of last update
    }

    mapping(address => FitnessData) private _fitnessRecords;
    mapping(address => uint256) private _totalWorkouts;

    event FitnessDataUpdated(address indexed user, uint256 timestamp);

    /// @notice Submit fitness data (simplified version without FHE)
    function setFitnessData(
        uint256 steps,
        uint256 runningDistance,
        uint256 caloriesBurned,
        uint256 workoutDuration,
        uint256 heartRateAvg,
        string calldata name
    ) external {
        _fitnessRecords[msg.sender] = FitnessData({
            name: name,
            steps: steps,
            runningDistance: runningDistance,
            caloriesBurned: caloriesBurned,
            workoutDuration: workoutDuration,
            heartRateAvg: heartRateAvg,
            lastUpdate: block.timestamp
        });

        _totalWorkouts[msg.sender]++;

        emit FitnessDataUpdated(msg.sender, block.timestamp);
    }

    /// @notice Get clear text user name for an account
    function getName(address account) external view returns (string memory) {
        return _fitnessRecords[account].name;
    }

    /// @notice Get steps for an account (clear text for demo)
    function getSteps(address account) external view returns (uint256) {
        return _fitnessRecords[account].steps;
    }

    /// @notice Get running distance for an account (clear text for demo)
    function getRunningDistance(address account) external view returns (uint256) {
        return _fitnessRecords[account].runningDistance;
    }

    /// @notice Get calories burned for an account (clear text for demo)
    function getCaloriesBurned(address account) external view returns (uint256) {
        return _fitnessRecords[account].caloriesBurned;
    }

    /// @notice Get workout duration for an account (clear text for demo)
    function getWorkoutDuration(address account) external view returns (uint256) {
        return _fitnessRecords[account].workoutDuration;
    }

    /// @notice Get average heart rate for an account (clear text for demo)
    function getHeartRateAvg(address account) external view returns (uint256) {
        return _fitnessRecords[account].heartRateAvg;
    }

    /// @notice Get last update timestamp for an account
    function getLastUpdate(address account) external view returns (uint256) {
        return _fitnessRecords[account].lastUpdate;
    }

    /// @notice Get total workouts count for an account
    function getTotalWorkouts(address account) external view returns (uint256) {
        return _totalWorkouts[account];
    }

    /// @notice Check if user has fitness data
    function hasFitnessData(address account) external view returns (bool) {
        return _totalWorkouts[account] > 0;
    }

    /// @notice Get all fitness data for an account
    function getAllFitnessData(address account) external view returns (
        string memory name,
        uint256 steps,
        uint256 runningDistance,
        uint256 caloriesBurned,
        uint256 workoutDuration,
        uint256 heartRateAvg,
        uint256 totalWorkouts,
        uint256 lastUpdate
    ) {
        FitnessData memory data = _fitnessRecords[account];
        return (
            data.name,
            data.steps,
            data.runningDistance,
            data.caloriesBurned,
            data.workoutDuration,
            data.heartRateAvg,
            _totalWorkouts[account],
            data.lastUpdate
        );
    }

    /// @notice Protocol ID for compatibility
    function protocolId() external pure returns (uint256) {
        return 10001;
    }
}
