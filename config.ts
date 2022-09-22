import "dotenv/config";

export const mnemonic: any = process.env.MNEMONIC;
export const etherscanAPIKey: any = process.env.ETHERSCAN_API;

export interface networkConfigItem {
  url: string;
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
  },
};

export interface testConfigInfo {
  link: string;
}

export const testConfig: testConfigInfo = {
  link: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
};
