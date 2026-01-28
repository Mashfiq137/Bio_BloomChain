# DHBF

A Dynamic Hierarchical Bloom Filter (DHBF) is an advanced data structure designed for efficient identity storage, rapid querying, and seamless enrollment. When integrated with a blockchain system, it ensures a highly secure and reliable enrollment process. This project leverages Solidity smart contracts and the Hardhat framework to bring the DHBF concept to life and demonstrate its practical applications.

Try running some of the following commands:

```shell
npx hardhat compile
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/DHBF.js --network localhost
npx hardhat ignition deploy ./ignition/modules/HBF.js --network localhost
npx hardhat ignition deploy ./ignition/modules/DHBF_Merge.js --network localhost
npx hardhat run HBFMain.js --network localhost
npx hardhat run DHBFMain.js --network localhost
npx hardhat run DHBFMergeMain.js --network localhost
```

## How to Run the Project

## Compile Smart Contracts
To compile your smart contracts run:
```shell
npx hardhat compile
```

### Start a Local Node
Open a new terminal and run:
```shell
npx hardhat node
```

### Deploy Smart Contracts
Open another new terminal and run:
```shell
npx hardhat ignition deploy [path of smart contract ignition file you want to deploy]
```

## Interact with the Contracts
Use the provided main scripts to interact with the deployed contracts:
```shell
npx hardhat run HBFMain.js --network localhost
npx hardhat run DHBFMain.js --network localhost
npx hardhat run DHBFMergeMain.js --network localhost
```

## Contract Customizable Functions
You can customize the contract interactions with function provided in the helper-functions folder

## Sample Workflow 
First install all project dependencies:

```shell
npm install
```

Next compile all smart contracts:

```shell
npx hardhat compile
```
Then Open a new terminal and start a local blockchain network:

```shell
npx hardhat node
```

Then open a new terminal and deploy the smart contract you want:

```shell
npx hardhat ignition deploy ./ignition/modules/DHBF.js --network localhost
```
Finall interact with the desired contract:

```shell
npx hardhat run HBFMain.js --network localhost
```


