const fs = require('fs');
const { Read_Enrollment_Data, Read_Query_Data } = require("./helper-functions/FileIO");
const { Test_Insert_Remove_Random_Identities_DHBF_Merge } = require("./helper-functions/Test")

async function DHBFMain() {
    const numberOfPeople = 10000;
    const indexesPerPerson = 3; 
    const levels = 165;
    const bitStreamLength = 46251;

    console.log("Starting download of enrollment data.");

    const enrollmentFiles = [
        './input-files/Multi-Instance-HBF/HBF1/HBF1_Enroll_Data/Enroll_Data_for_HBF_0_10000.txt',
        './input-files/Multi-Instance-HBF/HBF2/HBF2_Enroll_data/Enroll_Data_for_HBF_10000_20000.txt',
        './input-files/Multi-Instance-HBF/HBF3/HBF3_Enroll_data/Enroll_Data_for_HBF_20000_30000.txt'
    ];

    const multiInstanceMasterArray = [];
    const multiInstanceIdentityArray = [];

    for (let i = 0; i < enrollmentFiles.length; i++) {
        const filePath = enrollmentFiles[i];
        const { masterArray, identityArray } = Read_Enrollment_Data(filePath, numberOfPeople, indexesPerPerson);
        multiInstanceMasterArray.push(masterArray);
        multiInstanceIdentityArray.push(identityArray);
    }

    console.log("Finished download of enrollment data.");

    console.log("Starting download of query data.");
    const queryFiles = [
        "./input-files/Multi-Instance-HBF/HBF1/HBF1_Query_Data/Query_Data_for_HBF_0_10000.txt",
        "./input-files/Multi-Instance-HBF/HBF2/HBF2_Query_data/Query_Data_for_HBF_10000_20000.txt",
        "./input-files/Multi-Instance-HBF/HBF3/HBF3_Query_data/Query_Data_for_HBF_20000_30000.txt"
    ];
    const multiInstanceQueryIdentities = [];
    const queryPeople = 906;

    for (let i = 0; i < queryFiles.length; i++) {
        const queryFilePath = queryFiles[i];
        const queryIdentities = Read_Query_Data(queryFilePath, queryPeople, levels, indexesPerPerson);
        multiInstanceQueryIdentities.push(queryIdentities);
    }
    console.log("Finished download of query data.");
    
    const sliceIdentityArray = multiInstanceQueryIdentities[0].slice(0, 20);
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    await Test_Insert_Remove_Random_Identities_DHBF_Merge(contractAddress, sliceIdentityArray, 1);
}

DHBFMain();
