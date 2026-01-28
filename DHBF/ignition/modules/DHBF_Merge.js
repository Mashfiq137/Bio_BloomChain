// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DHBF_Merge", (m) => {

  const DHBF_Merge = m.contract("DHBF_Merge", [], {});

  return { DHBF_Merge };
});
