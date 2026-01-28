// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DHBF_Merge {

    uint256 private constant BITSTREAM_SIZE = 46251;
    uint256 private constant INDEXES_PER_PERSON = 3;
    uint256 private constant LEVELS = 165;
    uint256 private constant VALUES_PER_UINT256 = 16;
    uint256 private constant PACKED_INDICES_PER_LEVEL = (BITSTREAM_SIZE + VALUES_PER_UINT256 - 1) / VALUES_PER_UINT256;
    uint256 private constant CAPACITY = 10;

    struct HBF {
        uint256[PACKED_INDICES_PER_LEVEL][LEVELS] bitStreams;
        uint256 personCount;
    }

    HBF[] private hbfInstances;

    // Set a single value
    function setValue(uint256 hbfIndex, uint256 level, uint256 valueIndex, uint16 value) public {
        require(hbfIndex < hbfInstances.length, "HBF index out of range");
        require(level < LEVELS, "Level index out of range");
        require(valueIndex < BITSTREAM_SIZE, "Value index out of range");

        uint256 packedIndex = valueIndex / VALUES_PER_UINT256;
        uint256 position = valueIndex % VALUES_PER_UINT256;

        uint256 packedData = hbfInstances[hbfIndex].bitStreams[level][packedIndex];

        // Clear the bits at position
        packedData &= ~(uint256(0xFFFF) << (position * 16));

        // Set the new value
        packedData |= uint256(value) << (position * 16);

        hbfInstances[hbfIndex].bitStreams[level][packedIndex] = packedData;
    }

    // Get a single value
    function getValue(uint256 hbfIndex, uint256 level, uint256 valueIndex) public view returns (uint16) {
        require(hbfIndex < hbfInstances.length, "HBF index out of range");
        require(level < LEVELS, "Level index out of range");
        require(valueIndex < BITSTREAM_SIZE, "Value index out of range");

        uint256 packedIndex = valueIndex / VALUES_PER_UINT256;
        uint256 position = valueIndex % VALUES_PER_UINT256;

        uint256 packedData = hbfInstances[hbfIndex].bitStreams[level][packedIndex];
        uint16 value = uint16((packedData >> (position * 16)) & 0xFFFF);

        return value;
    }

    function setPackedDataBatch(uint256 hbfIndex, uint256 level, uint256[] memory packedIndices, uint256[] memory packedData) public {
        require(hbfIndex < hbfInstances.length, "HBF index out of range");
        require(level < LEVELS, "Level index out of range");
        require(packedIndices.length == packedData.length, "Arrays must be of the same length");

        for (uint256 i = 0; i < packedIndices.length; i++) {
            hbfInstances[hbfIndex].bitStreams[level][packedIndices[i]] = packedData[i];
        }
    }

    // Enroll a person
    function insertIdentity(uint256[INDEXES_PER_PERSON][LEVELS] memory person) public {
        if (hbfInstances.length == 0 || hbfInstances[hbfInstances.length - 1].personCount >= CAPACITY) {
            // Create new DHBF instance
            hbfInstances.push();
        }

        HBF storage currentHBF = hbfInstances[hbfInstances.length - 1];

        for (uint256 level = 0; level < LEVELS; level++) {
            for (uint256 i = 0; i < INDEXES_PER_PERSON; i++) {
                uint256 valueIndex = person[level][i];
                require(valueIndex < BITSTREAM_SIZE, "Value index out of range");

                uint256 packedIndex = valueIndex / VALUES_PER_UINT256;
                uint256 position = valueIndex % VALUES_PER_UINT256;

                uint256 packedData = currentHBF.bitStreams[level][packedIndex];
                uint16 currentValue = uint16((packedData >> (position * 16)) & 0xFFFF);

                currentValue += 1;

                // Clear the bits at position
                packedData &= ~(uint256(0xFFFF) << (position * 16));

                // Set the new value
                packedData |= uint256(currentValue) << (position * 16);

                currentHBF.bitStreams[level][packedIndex] = packedData;
            }
        }

        currentHBF.personCount++;

        // Check and merge HBFs if needed
        checkAndMergeHBFs();
    }

    // Find identity in all DHBFs and return pass counts
    function findIdentityInHBFs(uint256[INDEXES_PER_PERSON][LEVELS] memory person) public view returns (uint256[] memory) {
        uint256 hbfCount = hbfInstances.length;
        uint256[] memory passCounts = new uint256[](hbfCount);

        for (uint256 hbfIndex = 0; hbfIndex < hbfCount; hbfIndex++) {
            uint256 passCount = 0;

            for (uint256 level = 0; level < LEVELS; level++) {
                bool levelPassed = true;

                for (uint256 i = 0; i < INDEXES_PER_PERSON; i++) {
                    uint256 valueIndex = person[level][i];
                    require(valueIndex < BITSTREAM_SIZE, "Value index out of range");

                    uint256 packedIndex = valueIndex / VALUES_PER_UINT256;
                    uint256 position = valueIndex % VALUES_PER_UINT256;

                    uint256 packedData = hbfInstances[hbfIndex].bitStreams[level][packedIndex];
                    uint16 currentValue = uint16((packedData >> (position * 16)) & 0xFFFF);

                    if (currentValue == 0) {
                        levelPassed = false;
                        break;
                    }
                }

                if (levelPassed) {
                    passCount++;
                }
            }

            passCounts[hbfIndex] = passCount;
        }

        return passCounts;
    }

    // Remove a person based on highest pass count and threshold
    function removeIdentity(uint256[INDEXES_PER_PERSON][LEVELS] memory person, uint256 threshold) public {
        require(threshold > 0 && threshold <= LEVELS, "Invalid threshold");

        uint256 hbfCount = hbfInstances.length;
        uint256 besthbfIndex = hbfCount; // Initialize with an invalid index
        uint256 highestPassCount = 0;

        for (uint256 hbfIndex = 0; hbfIndex < hbfCount; hbfIndex++) {
            uint256 passCount = 0;

            for (uint256 level = 0; level < LEVELS; level++) {
                bool levelPassed = true;

                for (uint256 i = 0; i < INDEXES_PER_PERSON; i++) {
                    uint256 valueIndex = person[level][i];
                    require(valueIndex < BITSTREAM_SIZE, "Value index out of range");

                    uint256 packedIndex = valueIndex / VALUES_PER_UINT256;
                    uint256 position = valueIndex % VALUES_PER_UINT256;

                    uint256 packedData = hbfInstances[hbfIndex].bitStreams[level][packedIndex];
                    uint16 currentValue = uint16((packedData >> (position * 16)) & 0xFFFF);

                    if (currentValue == 0) {
                        levelPassed = false;
                        break;
                    }
                }

                if (levelPassed) {
                    passCount++;
                }
            }

            if (passCount > highestPassCount) {
                highestPassCount = passCount;
                besthbfIndex = hbfIndex;
            }
        }

        require(highestPassCount >= threshold, "Person not found in any HBF with pass count above threshold");
        require(besthbfIndex < hbfInstances.length, "No valid HBF found");

        // Now remove the person from the DHBF with highest pass count
        HBF storage currentHBF = hbfInstances[besthbfIndex];

        for (uint256 level = 0; level < LEVELS; level++) {
            for (uint256 i = 0; i < INDEXES_PER_PERSON; i++) {
                uint256 valueIndex = person[level][i];
                require(valueIndex < BITSTREAM_SIZE, "Value index out of range");

                uint256 packedIndex = valueIndex / VALUES_PER_UINT256;
                uint256 position = valueIndex % VALUES_PER_UINT256;

                uint256 packedData = currentHBF.bitStreams[level][packedIndex];
                uint16 currentValue = uint16((packedData >> (position * 16)) & 0xFFFF);

                require(currentValue > 0, "Bit value is too low to remove identity!");

                currentValue -= 1;

                // Clear the bits at position
                packedData &= ~(uint256(0xFFFF) << (position * 16));

                // Set the new value
                packedData |= uint256(currentValue) << (position * 16);

                currentHBF.bitStreams[level][packedIndex] = packedData;
            }
        }

        require(currentHBF.personCount > 0, "Person count is already zero!");
        currentHBF.personCount--;

        // Check and merge HBFs if needed
        checkAndMergeHBFs();
    }

    function mergeHBFs(uint256 hbfIndex1, uint256 hbfIndex2) internal {
        require(hbfIndex1 < hbfInstances.length, "HBF index 1 out of range");
        require(hbfIndex2 < hbfInstances.length, "HBF index 2 out of range");
        require(hbfIndex1 != hbfIndex2, "Cannot merge the same HBF");

        HBF storage hbf1 = hbfInstances[hbfIndex1];
        HBF storage hbf2 = hbfInstances[hbfIndex2];

        uint256 totalPersonCount = hbf1.personCount + hbf2.personCount;
        require(totalPersonCount <= CAPACITY, "Combined capacity exceeds limit");

        // Merge bitStreams
        for (uint256 level = 0; level < LEVELS; level++) {
            for (uint256 packedIndex = 0; packedIndex < PACKED_INDICES_PER_LEVEL; packedIndex++) {
                uint256 data1 = hbf1.bitStreams[level][packedIndex];
                uint256 data2 = hbf2.bitStreams[level][packedIndex];

                // Add the data
                uint256 mergedData = addPackedValues(data1, data2);

                hbf1.bitStreams[level][packedIndex] = mergedData;
            }
        }

        // Update personCount
        hbf1.personCount = totalPersonCount;

        // Remove hbf2 from hbfInstances
        if (hbfIndex2 != hbfInstances.length - 1) {
            hbfInstances[hbfIndex2] = hbfInstances[hbfInstances.length - 1];
        }
        hbfInstances.pop();
    }

    // Helper function to add two packed uint256 values
    function addPackedValues(uint256 data1, uint256 data2) internal pure returns (uint256) {
        uint256 result = 0;
        for (uint256 i = 0; i < VALUES_PER_UINT256; i++) {
            uint256 mask = 0xFFFF;
            uint256 shift = i * 16;
            uint256 value1 = (data1 >> shift) & mask;
            uint256 value2 = (data2 >> shift) & mask;
            uint256 sum = value1 + value2;
            require(sum <= mask, "Overflow in packed value addition");
            result |= sum << shift;
        }
        return result;
    }

    // Internal function to check and merge HBFs if possible
    function checkAndMergeHBFs() internal {
        uint256 hbfCount = hbfInstances.length;
        bool merged;

        do {
            merged = false;
            for (uint256 i = 0; i < hbfCount; i++) {
                for (uint256 j = i + 1; j < hbfCount; j++) {
                    if (hbfInstances[i].personCount + hbfInstances[j].personCount <= CAPACITY) {
                        mergeHBFs(i, j);
                        hbfCount--;
                        merged = true;
                        break; // Break to reset indices after merge
                    }
                }
                if (merged) {
                    break; // Outer loop break to reset indices after merge
                }
            }
        } while (merged);
    }

    function setPersonCount(uint256 hbfIndex, uint256 count) public {
        require(hbfIndex < hbfInstances.length, "HBF index out of range");
        hbfInstances[hbfIndex].personCount = count;
    }

    function setHBFCount(uint256 count) public {
        // Adjust the size of hbfInstances
        if (hbfInstances.length < count) {
            for (uint256 i = hbfInstances.length; i < count; i++) {
                hbfInstances.push();
            }
        } else if (hbfInstances.length > count) {
            while (hbfInstances.length > count) {
                hbfInstances.pop();
            }
        }
    }

    // Get the total DHBF count
    function getHBFCount() public view returns (uint256) {
        return hbfInstances.length;
    }

    // Get person count in a DHBF
    function getPersonCount(uint256 hbfIndex) public view returns (uint256) {
        require(hbfIndex < hbfInstances.length, "HBF index out of range");
        return hbfInstances[hbfIndex].personCount;
    }
}
