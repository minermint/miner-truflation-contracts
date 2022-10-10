import "dotenv/config";

export const mnemonic: any = process.env.MNEMONIC;
export const etherscanAPIKey: any = process.env.ETHERSCAN_API;
export const developmentChains: string[] = ["hardhat", "localhost"];

export interface networkConfigItem {
  url: string;
  inflationOracle? : string;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  hardhat: {
    url: process.env.URL || ""
  },
  goerli: {
    url: process.env.URL || "",
    inflationOracle: "0xcf72083697aB8A45905870C387dC93f380f2557b"
  },
};

export interface testConfigInfo {
  link: string;
}

export const testConfig: testConfigInfo = {
  link: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
};
