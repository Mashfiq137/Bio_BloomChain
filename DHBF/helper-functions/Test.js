const { ethers } = require("hardhat");

//Test function to enroll an identity is in the HBF
async function Test_Enroll_Person_HBF(contractAddress, identity) {
    const HBF = await ethers.getContractFactory("HBF");
    const contract = HBF.attach(contractAddress);

    try {
        const tx = await contract.insertIdentity(identity);
        const receipt = await tx.wait();
        console.log("Successfully enrolled person in Single HBF");
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error("Error enrolling person:", error);
    }
}

//Test function to remove an identity in an HBF
async function Test_Remove_Person_HBF(contractAddress, identity) {
    const HBF = await ethers.getContractFactory("HBF");
    const contract = HBF.attach(contractAddress);

    try {
        const tx = await contract.removeIdentity(identity);
        const receipt = await tx.wait();
        console.log("Successfully removed person from Single HBF");
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error("Error removing person:", error);
    }
}

//Test function to check if an identity is enrolled
async function Test_Check_If_Enrolled_HBF(contractAddress, identity) {
    const HBF = await ethers.getContractFactory("HBF");
    const contract = HBF.attach(contractAddress);

    try {
        const passCount = await contract.checkIfEnrolled(identity);
        console.log(`Number of levels passed by the person: ${passCount.toString()}`);
    } catch (error) {
        console.error("Error checking if person is enrolled:", error);
    }
}

//Test function to set an index value in the HBF contract
async function Test_Set_Value_HBF(contractAddress, level, valueIndex, value) {
    const HBF = await ethers.getContractFactory("HBF");
    const contract = HBF.attach(contractAddress);

    try {
        const tx = await contract.setValue(level, valueIndex, value);
        const receipt = await tx.wait();
        console.log(`Successfully set value at level ${level}, index ${valueIndex}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error("Error setting value:", error);
    }
}

//Test function to get index value in the HBF
async function Test_Get_Value_HBF(contractAddress, level, valueIndex) {
    const HBF = await ethers.getContractFactory("HBF");
    const contract = HBF.attach(contractAddress);

    try {
        const value = await contract.getValue(level, valueIndex);
        console.log(`Value at level ${level}, index ${valueIndex} is: ${value}`);
    } catch (error) {
        console.error("Error getting value:", error);
    }
}

// Test function to enroll a person into MultiDHBF
async function Test_Enroll_Person_DHBF(contractAddress, identity) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const tx = await contract.insertIdentity(identity);
        const receipt = await tx.wait();
        console.log("Successfully enrolled person in DHBF");
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error("Error enrolling person:", error);
    }
}

// Test function to remove a person from MultiDHBF
async function Test_Remove_Person_DHBF(contractAddress, identity, threshold) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const tx = await contract.removeIdentity(identity, threshold);
        const receipt = await tx.wait();
        console.log("Successfully removed person from DHBF");
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error("Error removing person:", error);
    }
}

// Test function to check if a person is enrolled in MultiDHBFs
async function Test_Check_If_Enrolled_DHBF(contractAddress, identity) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const passCounts = await contract.findIdentityInHBFs(identity);
        console.log(`Number of levels passed by the person in each HBF:`);
        passCounts.forEach((count, index) => {
            console.log(`HBF ${index}: ${count.toString()} levels`);
        });
    } catch (error) {
        console.error("Error checking if person is enrolled:", error);
    }
}

// Test function to set a value in MultiDHBF
async function Test_Set_Value_DHBF(contractAddress, hbfIndex, level, valueIndex, value) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const tx = await contract.setValue(hbfIndex, level, valueIndex, value);
        const receipt = await tx.wait();
        console.log(`Successfully set value in HBF ${hbfIndex} at level ${level}, index ${valueIndex}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error(`Error setting value in HBF ${hbfIndex} at level ${level}, index ${valueIndex}:`, error);
    }
}

// Test function to get a value from MultiDHBF
async function Test_Get_Value_DHBF(contractAddress, hbfIndex, level, valueIndex) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const value = await contract.getValue(hbfIndex, level, valueIndex);
        console.log(`Value in HBF ${hbfIndex} at level ${level}, index ${valueIndex} is: ${value}`);
    } catch (error) {
        console.error(`Error getting value in HBF ${hbfIndex} at level ${level}, index ${valueIndex}:`, error);
    }
}

// Test function to set a packed data batch in MultiDHBF
async function Test_Set_PackedDataBatch_DHBF(contractAddress, hbfIndex, level, packedIndices, packedData) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const tx = await contract.setPackedDataBatch(hbfIndex, level, packedIndices, packedData);
        const receipt = await tx.wait();
        console.log(`Successfully set packed data batch in HBF ${hbfIndex} at level ${level}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error(`Error setting packed data batch in HBF ${hbfIndex} at level ${level}:`, error);
    }
}

// Test function to set person count in MultiDHBF
async function Test_Set_Person_Count_DHBF(contractAddress, hbfIndex, count) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const tx = await contract.setPersonCount(hbfIndex, count);
        const receipt = await tx.wait();
        console.log(`Successfully set person count in HBF ${hbfIndex} to ${count}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error(`Error setting person count in HBF ${hbfIndex}:`, error);
    }
}

// Test function to set DHBF count
async function Test_Set_HBF_Count_DHBF(contractAddress, count) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const tx = await contract.setHBFCount(count);
        const receipt = await tx.wait();
        console.log(`Successfully set HBF count to ${count}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error("Error setting HBF count:", error);
    }
}

// Test function to get DHBF count
async function Test_Get_DHBF_Count_DHBF(contractAddress) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const count = await contract.getHBFCount();
        console.log(`Total HBF Count: ${count.toString()}`);
    } catch (error) {
        console.error("Error getting HBF count:", error);
    }
}

// Test function to get person count in a DHBF
async function Test_Get_Person_Count_DHBF(contractAddress, hbfIndex) {
    const DHBF = await ethers.getContractFactory("DHBF");
    const contract = DHBF.attach(contractAddress);

    try {
        const personCount = await contract.getPersonCount(hbfIndex);
        console.log(`Person Count in HBF ${hbfIndex}: ${personCount.toString()}`);
    } catch (error) {
        console.error(`Error getting person count in HBF ${hbfIndex}:`, error);
    }
}

//Test function that deploys the HBF contract and gets it's gas cost
async function Test_Deploy_HBF() {
    const HBF = await ethers.getContractFactory("HBF");

    try {
        const deployTransaction = await HBF.getDeployTransaction();
        const [signer] = await ethers.getSigners();
        const txResponse = await signer.sendTransaction(deployTransaction);
        const receipt = await txResponse.wait();
        
        console.log("HBF_2 contract deployed at address:", receipt.contractAddress);
        console.log(`Gas used in deployment: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error("Error deploying DHBF_2 contract:", error);
    }
}

// Function to test deploy gas cost for MultiDHBF_2 contract
async function Test_Deploy_DHBF() {
    const DHBF = await ethers.getContractFactory("DHBF");

    try {
        const deployTransaction = await DHBF.getDeployTransaction();
        const [signer] = await ethers.getSigners();
        const txResponse = await signer.sendTransaction(deployTransaction);
        const receipt = await txResponse.wait();
        console.log("DHBF contract deployed at address:", receipt.contractAddress);
        console.log(`Gas used in deployment: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error("Error deploying MultiDHBF_2 contract:", error);
    }
}

async function Test_Insert_Remove_Random_Identities_DHBF_Merge(contractAddress, identities, threshold) {
    const DHBF = await ethers.getContractFactory("DHBF_Merge");
    const contract = DHBF.attach(contractAddress);

    let insertionData = [];
    let removalData = [];

    for (let i = 0; i < identities.length; i++) {
        try {
            const tx = await contract.insertIdentity(identities[i]);
            await tx.wait();
            const hbfCount = await contract.getHBFCount();
            const totalPersonCount = await getTotalPersonCount(contract, hbfCount);

            console.log(hbfCount, totalPersonCount)
            insertionData.push({
                identitiesInserted: i + 1,
                hbfCount: hbfCount.toString(),
                totalPersonCount: totalPersonCount.toString()
            });

            console.log(`Inserted identity ${i + 1}, HBF Count: ${hbfCount.toString()}, Total Persons: ${totalPersonCount}`);
        } catch (error) {
            console.error(`Error inserting identity ${i + 1}:`, error);
            break;
        }
    }

    console.log("\nInsertion Data:");
    console.log("IdentitiesInserted,HBFCount,TotalPersonCount");
    insertionData.forEach(data => {
        console.log(`${data.identitiesInserted},${data.hbfCount},${data.totalPersonCount}`);
    });

    shuffleArray(identities);

    for (let i = 0; i < identities.length; i++) {
        try {
            const tx = await contract.removeIdentity(identities[i], threshold);
            await tx.wait();
            const hbfCount = await contract.getHBFCount();
            const totalPersonCount = await getTotalPersonCount(contract, hbfCount);

            removalData.push({
                identitiesRemoved: i + 1,
                hbfCount: hbfCount.toString(),
                totalPersonCount: totalPersonCount.toString()
            });

            console.log(`Removed identity ${i + 1}, HBF Count: ${hbfCount.toString()}, Total Persons: ${totalPersonCount}`);
        } catch (error) {
            console.error(`Error removing identity ${i + 1}:`, error);
            break;
        }
    }

    console.log("\nRemoval Data:");
    console.log("IdentitiesRemoved,HBFCount,TotalPersonCount");
    removalData.forEach(data => {
        console.log(`${data.identitiesRemoved},${data.hbfCount},${data.totalPersonCount}`);
    });
}

// Helper function to get the total person count across all HBFs
async function getTotalPersonCount(contract, hbfCount) {
    let totalPersonCount;
    for (let i = 0; i < hbfCount; i++) {
        const personCount = await contract.getPersonCount(i);
        totalPersonCount = personCount
    }
    return totalPersonCount;
}

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


module.exports = {
    Test_Enroll_Person_HBF,
    Test_Remove_Person_HBF,
    Test_Check_If_Enrolled_HBF,
    Test_Set_Value_HBF,
    Test_Get_Value_HBF,
    Test_Enroll_Person_DHBF,
    Test_Remove_Person_DHBF,
    Test_Check_If_Enrolled_DHBF,
    Test_Set_Value_DHBF,
    Test_Get_Value_DHBF,
    Test_Set_PackedDataBatch_DHBF,
    Test_Set_Person_Count_DHBF,
    Test_Set_HBF_Count_DHBF,
    Test_Get_DHBF_Count_DHBF,
    Test_Get_Person_Count_DHBF,
    Test_Deploy_HBF,
    Test_Deploy_DHBF,
    Test_Insert_Remove_Random_Identities_DHBF_Merge
}
