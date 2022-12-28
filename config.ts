import "dotenv/config";

export const mnemonic: any = process.env.MNEMONIC;
export const etherscanAPIKey: any = process.env.ETHERSCAN_API;
export const developmentChains: string[] = ["hardhat", "localhost"];

export interface networkConfigItem {
  url: string;
  inflationOracle?: string;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  hardhat: {
    url: process.env.URL || "",
  },
  goerli: {
    url: process.env.URL || "",
    inflationOracle: "0x6888BdA6a975eCbACc3ba69CA2c80d7d7da5A344",
  },
};

export interface testConfigInfo {
  link: string;
}

export const testConfig: testConfigInfo = {
  link: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
};
