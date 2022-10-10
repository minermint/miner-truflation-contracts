import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains, networkConfig } from "../config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  let oracle: string|null = null;

  if (developmentChains.includes(network.name)) {
    console.log("deploying unit test oracle...");
    oracle = (await deploy("OracleMock", {
      from: deployer,
    })).address;
  }

  await deploy("TruflationKeeper", {
    from: deployer,
    args: [
      oracle || networkConfig[network.name].inflationOracle,
      "f5da3804575a44a082347fababc4f11d",
      ethers.utils.parseEther("0.01"),
    ],
  });
};

export default func;
func.tags = ["contract", "all"];
