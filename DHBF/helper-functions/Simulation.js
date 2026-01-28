const { ethers } = require("hardhat");

async function RunSimulation_HBF(contractAddress, masterArray, queryIdentities) {
    const HBF = await ethers.getContractFactory("HBF");
    const contract = HBF.attach(contractAddress);
    const outputArray = [];

    console.log("Starting enrollment of identities...");
    const gasCosts = await UploadPackedData_HBF(contractAddress, masterArray)
    console.log("Enrollment completed.");

    console.log("Starting enrollment checks for query identities...");
    for (let i = 0; i < queryIdentities.length; i++) {
        const identity = queryIdentities[i];
        try {
            const passCount = await contract.checkIfEnrolled(identity);
            outputArray.push({ identityIndex: i, passCount: passCount });
            console.log(`Identity at index ${i} passed ${passCount} levels`);
        } catch (error) {
            console.error(`Error checking identity at index ${i}:`, error);
        }
    }
    console.log("Enrollment checks completed.");

    return { outputArray, gasCosts };
}

async function UploadPackedData_HBF(contractAddress, masterArray) {
    const HBF = await ethers.getContractFactory("HBF");
    const contract = HBF.attach(contractAddress);

    const BITSTREAM_SIZE = 140554;
    const VALUES_PER_UINT256 = 16;
    const LEVELS = 165;

    let gasCosts = [];

    for (let level = 0; level < LEVELS; level++) {
        console.log(`Processing level ${level}`);
        const countsPerLevel = new Array(BITSTREAM_SIZE).fill(0);

        const levelData = masterArray[level];
        for (const [valueIndexStr, count] of Object.entries(levelData)) {
            const valueIndex = parseInt(valueIndexStr);
            countsPerLevel[valueIndex] = count;
        }

        const packedData = packCounts(countsPerLevel);

        const batchSize = 100;
        const totalPackedIndices = packedData.length;

        for (let i = 0; i < totalPackedIndices; i += batchSize) {
            const batchPackedIndices = [];
            const batchPackedData = [];
            const batchEnd = Math.min(i + batchSize, totalPackedIndices);

            for (let j = i; j < batchEnd; j++) {
                batchPackedIndices.push(j);
                batchPackedData.push(packedData[j].toString());
            }

            try {
                console.log(`Setting packed data for level ${level}, indices ${i} to ${batchEnd - 1}`);
                const tx = await contract.setPackedDataBatch(level, batchPackedIndices, batchPackedData);
                const receipt = await tx.wait();
                console.log(`Successfully set packed data for level ${level}, indices ${i} to ${batchEnd - 1}`);
                console.log(`Gas used for this batch: ${receipt.gasUsed.toString()}`);

                gasCosts.push(receipt.gasUsed.toString())
            } catch (error) {
                console.error(`Error setting packed data for level ${level}, indices ${i} to ${batchEnd - 1}:`, error);
            }
        }
    }

    return gasCosts;
}


function packCounts(countsPerLevel) {
    const VALUES_PER_UINT256 = 16;
    const BITSTREAM_SIZE = countsPerLevel.length;
    const packedDataLength = Math.ceil(BITSTREAM_SIZE / VALUES_PER_UINT256);
    const packedData = new Array(packedDataLength).fill(BigInt(0));

    for (let valueIndex = 0; valueIndex < BITSTREAM_SIZE; valueIndex++) {
        const count = BigInt(countsPerLevel[valueIndex]);
        const packedIndex = Math.floor(valueIndex / VALUES_PER_UINT256);
        const position = valueIndex % VALUES_PER_UINT256;
        packedData[packedIndex] |= count << BigInt(position * 16);
    }

    return packedData; 
}

async function RunSimulation_DHBF(contractAddress, multiInstanceMasterArray, multiInstanceQueryIdentities) {
    console.log("Attaching to Contract");
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);
    console.log("Attached to Contract Successfully!");
    const outputArray = [];

    console.log("Starting enrollment of identities...");
    const gasCosts = await UploadPackedData_DHBF(contractAddress, multiInstanceMasterArray);
    console.log("Enrollment completed.");

    console.log("Starting enrollment checks for query identities...");
    for (let hbfIndex = 0; hbfIndex < multiInstanceQueryIdentities.length; hbfIndex++) {
        const queryIdentities = multiInstanceQueryIdentities[hbfIndex];
        for (let i = 0; i < queryIdentities.length; i++) {
            const identity = queryIdentities[i];
            try {
                const passCount = await contract.findIdentityInHBFs(identity);
                outputArray.push({ queryIndex: hbfIndex, identityIndex: i, passCount: passCount });
                console.log(`Query Index ${hbfIndex}, Identity ${i} passed ${passCount[hbfIndex]} levels`);
            } catch (error) {
                console.error(`Error checking identity at HBF ${hbfIndex}, index ${i}:`, error);
            }
        }
    }
    console.log("Enrollment checks completed.");
    return { outputArray, gasCosts };
}

async function UploadPackedData_DHBF(contractAddress, multiInstanceMasterArray) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    const BITSTREAM_SIZE = 46251;
    const VALUES_PER_UINT256 = 16;
    const LEVELS = 165;
    const CAPACITY = 10000;

    let gasCosts = [];

    console.log("Setting HBF Count to: ", multiInstanceMasterArray.length);
    await contract.setHBFCount(multiInstanceMasterArray.length);

    for (let hbfIndex = 0; hbfIndex < multiInstanceMasterArray.length; hbfIndex++) {
        const masterArray = multiInstanceMasterArray[hbfIndex];
        console.log(`Uploading data for HBF instance ${hbfIndex}...`);
        console.log(`Setting HBF Index persons count to 10,000`)
        await contract.setPersonCount(hbfIndex, CAPACITY)

        for (let level = 0; level < LEVELS; level++) {
            console.log(`Processing HBF ${hbfIndex}, Level ${level}`);
            const countsPerLevel = new Array(BITSTREAM_SIZE).fill(0);

            const levelData = masterArray[level];
            for (const [valueIndexStr, count] of Object.entries(levelData)) {
                const valueIndex = parseInt(valueIndexStr);
                countsPerLevel[valueIndex] = count;
            }

            const packedData = packCounts(countsPerLevel);

            const batchSize = 100;
            const totalPackedIndices = packedData.length;

            for (let i = 0; i < totalPackedIndices; i += batchSize) {
                const batchPackedIndices = [];
                const batchPackedData = [];
                const batchEnd = Math.min(i + batchSize, totalPackedIndices);

                for (let j = i; j < batchEnd; j++) {
                    batchPackedIndices.push(j);
                    batchPackedData.push(packedData[j].toString());
                }

                try {
                    console.log(`Setting packed data for HBF ${hbfIndex}, Level ${level}, indices ${i} to ${batchEnd - 1}`);
                    const tx = await contract.setPackedDataBatch(hbfIndex, level, batchPackedIndices, batchPackedData);
                    const receipt = await tx.wait();
                    console.log(`Successfully set packed data for HBF ${hbfIndex}, Level ${level}, indices ${i} to ${batchEnd - 1}`);
                    console.log(`Gas used for this batch: ${receipt.gasUsed.toString()}`);
                    gasCosts.push(receipt.gasUsed.toString())
                } catch (error) {
                    console.error(`Error setting packed data for HBF ${hbfIndex}, Level ${level}, indices ${i} to ${batchEnd - 1}:`, error);
                }
            }

        }
    }
    return gasCosts;
}

async function removeIdentity_DHBF(contractAddress, identity, threshold) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const tx = await contract.removeIdentity(identity, threshold);
        await tx.wait();
        console.log("Successfully removed person from DHBF");
    } catch (error) {
        console.error("Error removing person:", error);
    }
}

async function RunSimulation_Remove_DHBF(contractAddress, multiInstanceMasterArray, multiInstanceQueryIdentities, multiInstanceIdentityArray) {
    console.log("Attaching to Contract");
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);
    console.log("Attached to Contract Successfully!");
    const outputArray = [];

    console.log("Starting enrollment of identities...");
    await UploadPackedData_DHBF(contractAddress, multiInstanceMasterArray);
    console.log("Enrollment completed.");

    console.log("Starting the removal of identities...");
    for(let identitySetIndex = 0; identitySetIndex < multiInstanceIdentityArray.length; identitySetIndex++){
        for(let identityIndex = 0; identityIndex < multiInstanceIdentityArray[identitySetIndex].length; identityIndex++){
            console.log(`Removing Identity Set Index ${identitySetIndex}, Identity Index ${identityIndex}`);
            const identity = multiInstanceIdentityArray[identitySetIndex][identityIndex];
            await removeIdentity_DHBF(contractAddress, identity, 1);
        }
    }
    console.log("Finished removal of all identities.")
    
    console.log("Starting enrollment checks for query identities...");
    for (let hbfIndex = 0; hbfIndex < multiInstanceQueryIdentities.length; hbfIndex++) {
        const queryIdentities = multiInstanceQueryIdentities[hbfIndex];
        for (let i = 0; i < queryIdentities.length; i++) {
            const identity = queryIdentities[i];
            try {
                const passCount = await contract.findIdentityInHBFs(identity);
                outputArray.push({ queryIndex: hbfIndex, identityIndex: i, passCount: passCount });
                console.log(`Query Index ${hbfIndex}, Identity ${i} passed ${passCount[hbfIndex]} levels`);
            } catch (error) {
                console.error(`Error checking identity at DHBF ${hbfIndex}, index ${i}:`, error);
            }
        }
    }
    console.log("Enrollment checks completed.");

    return outputArray;
}

function RunSimulation_DHBF_OutsideChain(multiInstanceMasterArray, multiInstanceQueryIdentities) {
    const BITSTREAM_SIZE = 46251;
    const LEVELS = 165;
    const INDEXES_PER_PERSON = 3;

    const dhbfInstances = [];

    for (let hbfIndex = 0; hbfIndex < multiInstanceMasterArray.length; hbfIndex++) {
        console.log(`Building HBF instance ${hbfIndex}`);
        const masterArray = multiInstanceMasterArray[hbfIndex];
        const dhbfInstance = { bitStreams: [] };

        for (let level = 0; level < LEVELS; level++) {
            const countsPerLevel = new Array(BITSTREAM_SIZE).fill(0);

            const levelData = masterArray[level];
            for (const [valueIndexStr, count] of Object.entries(levelData)) {
                const valueIndex = parseInt(valueIndexStr);
                countsPerLevel[valueIndex] = count;
            }

            dhbfInstance.bitStreams[level] = countsPerLevel;
        }

        dhbfInstances.push(dhbfInstance);
    }

    const outputArray = [];

    console.log("Starting enrollment checks for query identities...");
    for (let hbfIndex = 0; hbfIndex < multiInstanceQueryIdentities.length; hbfIndex++) {
        const queryIdentities = multiInstanceQueryIdentities[hbfIndex];
        for (let i = 0; i < queryIdentities.length; i++) {
            const identity = queryIdentities[i];
            try {
                const passCounts = findIdentityInHBFs(identity, dhbfInstances, BITSTREAM_SIZE, LEVELS, INDEXES_PER_PERSON);
                outputArray.push({ queryIndex: hbfIndex, identityIndex: i, passCount: passCounts });
                console.log(`Query Index ${hbfIndex}, Identity ${i} passed ${passCounts[hbfIndex]} levels`);
            } catch (error) {
                console.error(`Error checking identity at DHBF ${hbfIndex}, index ${i}:`, error);
            }
        }
    }
    console.log("Enrollment checks completed.");

    return outputArray;
}

function findIdentityInHBFs(identity, dhbfInstances, BITSTREAM_SIZE, LEVELS, INDEXES_PER_PERSON) {
    const passCounts = [];

    for (let hbfIndex = 0; hbfIndex < dhbfInstances.length; hbfIndex++) {
        const dhbfInstance = dhbfInstances[hbfIndex];
        let passCount = 0;

        for (let level = 0; level < LEVELS; level++) {
            let levelPassed = true;

            for (let i = 0; i < INDEXES_PER_PERSON; i++) {
                const valueIndex = identity[level][i];
                if (valueIndex >= BITSTREAM_SIZE) {
                    throw new Error("Value index out of range");
                }

                const countsPerLevel = dhbfInstance.bitStreams[level];
                const currentValue = countsPerLevel[valueIndex];

                if (currentValue === 0) {
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

async function EstimateGasCosts(identities, contractAddress, contractType, enroll) {
    console.log("Attaching to Contract");
    const contractTypeAttached = await ethers.getContractFactory(contractType);
    const contract = contractTypeAttached.attach(contractAddress);
    console.log("Attached to Contract Successfully!");
    const gasCosts = [];

    for(let identityIndex = 0; identityIndex < identities.length; identityIndex++){
        const identity = identities[identityIndex];
        
        let tx;
        if(enroll){
            tx = await contract.insertIdentity(identity);
        } else {
            if(contractType == "DHBF"){
                tx = await contract.removeIdentity(identity, 1);
            } else {
                tx = await contract.removeIdentity(identity);
            }
        }
        
        const receipt = await tx.wait();
        const gasCost = receipt.gasUsed.toString();
        gasCosts.push(gasCost);
        console.log("Successfully completed interaction", contractType, "Enrolling: ", enroll, "Identity Index: ", identityIndex);
        console.log(`Gas used: ${gasCost}`);
    }

    return gasCosts;
}

function GenerateRandomSubsetIdentities(identityArray, amount) {
    const subset = [];
    const usedIdentities = new Set();
    while(subset.length < amount){
        const randomIndex = Math.floor(Math.random() * identityArray.length);
        if(!usedIdentities.has(randomIndex)){
            usedIdentities.add(randomIndex);
            subset.push(identityArray[randomIndex]);
        }
    }
    return subset;
}

module.exports = {
    RunSimulation_HBF,
    UploadPackedData_HBF,
    RunSimulation_DHBF,
    UploadPackedData_DHBF,
    RunSimulation_Remove_DHBF,
    RunSimulation_DHBF_OutsideChain,
    EstimateGasCosts,
    GenerateRandomSubsetIdentities
};
