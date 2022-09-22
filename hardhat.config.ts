import "dotenv/config";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-deploy";
import { networkConfig, mnemonic, etherscanAPIKey } from "./config";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.15",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    goerli: {
      accounts: {
        mnemonic,
      },
      url: networkConfig.goerli.url,
    },
    hardhat: {
      accounts: {
        mnemonic,
      },
      forking: {
        url: networkConfig.hardhat.url,
      },
    },
  },
  etherscan: {
    apiKey: etherscanAPIKey,
  },
  namedAccounts: {
    deployer: 0,
    requester: 1,
    fulfiller: 2,
    alice: 3,
    bob: 4,
  },
};

export default config;
