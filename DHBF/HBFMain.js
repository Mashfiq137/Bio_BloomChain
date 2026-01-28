const { Read_Enrollment_Data, Read_Query_Data } = require("./helper-functions/FileIO");
const { RunSimulation_HBF, EstimateGasCosts, GenerateRandomSubsetIdentities } = require("./helper-functions/Simulation");
const { writeOutputToCSV, writeGasEstimationOutputToCSV } = require("./helper-functions/FileIO");

async function HBFMain(){

    const filePath = './input-files/Single-HBF/Enrollment-Data/All_data_enrollment.txt';
    const numberOfPeople = 30000;
    const indexesPerPerson = 4; 
    const levels = 165;
    const bitStreamLength = 140554;

    console.log("Starting download of enrollment data.")
    const {masterArray, identityArray} = Read_Enrollment_Data(filePath, numberOfPeople, indexesPerPerson);
    console.log("Finished download of enrollment data.")
    
    const queryFilePath = "./input-files/Single-HBF/Query-Data/Query_for_Single_HBF.txt";
    const queryNumberOfPeople = 906;

    console.log("Starting download of query data.")
    const queryIdentities = Read_Query_Data(queryFilePath, queryNumberOfPeople, levels, indexesPerPerson);
    console.log("Finished download of query data.")
    
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const { gasCosts } = await RunSimulation_HBF(contractAddress, masterArray, queryIdentities);
    writeGasEstimationOutputToCSV(gasCosts, "./output/HBF_Send_Packed_Data_GasCosts.csv");
}

HBFMain();