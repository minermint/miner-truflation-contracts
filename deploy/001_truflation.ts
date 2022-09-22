import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  await deploy("TruflationKeeper", {
    from: deployer,
    args: [
      "0xcf72083697aB8A45905870C387dC93f380f2557b",
      "f5da3804575a44a082347fababc4f11d",
      ethers.utils.parseEther("0.01"),
    ],
  });
};

export default func;
func.tags = ["contract", "all"];
