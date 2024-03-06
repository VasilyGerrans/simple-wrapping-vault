require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-tracer");

require('dotenv').config()

const { RPC_URL } = process.env;

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: false,
        },
      },
    },
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      chainId: 1,
      forking: {
        url: RPC_URL,
        timeout: 0,
      },
    },
  },
};