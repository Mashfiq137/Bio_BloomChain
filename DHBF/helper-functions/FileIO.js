const fs = require('fs');
const path = require('path');

function writeOutputToCSV(outputArray, filePath) {
    const header = 'identityIndex,passCount';
    const csvLines = [header];

    for (const entry of outputArray) {
        const line = `${entry.identityIndex},${entry.passCount}`;
        csvLines.push(line);
    }

    const csvContent = csvLines.join('\n');

    fs.writeFileSync(filePath, csvContent, 'utf8');
    console.log(`CSV file has been written to ${filePath}`);
}

function writeOutputToCSV_DHBF(outputArray, filePath) {
    const header = 'queryIndex,identityIndex,passCount';
    const csvLines = [header];

    for (const entry of outputArray) {
        const line = `${entry.queryIndex},${entry.identityIndex},${entry.passCount.join(',')}`;
        csvLines.push(line);
    }

    const csvContent = csvLines.join('\n');

    fs.writeFileSync(filePath, csvContent, 'utf8');
    console.log(`CSV file has been written to ${filePath}`);
}

function writeGasEstimationOutputToCSV(outputArray, filePath) {
    const header = 'Gas Costs';
    const csvLines = [header];

    for (const entry of outputArray) {
        const line = `${entry}`;
        csvLines.push(line);
    }

    const csvContent = csvLines.join('\n');

    fs.writeFileSync(filePath, csvContent, 'utf8');
    console.log(`CSV file has been written to ${filePath}`);
}

function Read_Enrollment_Data(filePath, numberOfPeople, indexPerPerson) {
    let masterArray = [];
    let identityArray = Array.from({ length: numberOfPeople }, () => []);

    const indexesPerRow = numberOfPeople * indexPerPerson;

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');

    let array = [];
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        if (!isNaN(trimmedLine) && trimmedLine !== '') {
            array.push(Number(trimmedLine)); 
        }
    }

    for (let i = 0; i < array.length; i += indexesPerRow) {
        const row = array.slice(i, i + indexesPerRow);
        
        let countMap = {};
        for (let index of row) {
            if (countMap[index]) {
                countMap[index] += 1;
            } else {
                countMap[index] = 1;
            }
        }

        masterArray.push(countMap);
    }

    for (let i = 0; i < array.length; i += indexPerPerson) {
        const identityIndex = Math.floor((i / indexPerPerson) % numberOfPeople);
        const identity = array.slice(i, i + indexPerPerson);
        identityArray[identityIndex].push(identity);
    }

    return { masterArray, identityArray };
}

function Read_Query_Data(filePath, numberOfPeople, levels, indexesPerPerson) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== '');

    const identityMatrix = Array.from({ length: numberOfPeople }, () =>
        Array.from({ length: levels }, () => Array(indexesPerPerson).fill(0))
    );

    let lineIndex = 0;

    for (let level = 0; level < levels; level++) {
        for (let person = 0; person < numberOfPeople; person++) {
            for (let idx = 0; idx < indexesPerPerson; idx++) {
                const index = parseInt(lines[lineIndex], 10);
                identityMatrix[person][level][idx] = index;
                lineIndex++;
            }
        }
    }

    return identityMatrix;
}

module.exports = {
    writeOutputToCSV,
    writeOutputToCSV_DHBF,
    Read_Enrollment_Data,
    Read_Query_Data,
    writeGasEstimationOutputToCSV
};
