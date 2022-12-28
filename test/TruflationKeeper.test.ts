import { deployments, getNamedAccounts, ethers } from "hardhat";
import chai, { expect } from "chai";

import ABIIERC20 from "@chainlink/contracts/abi/v0.4/ERC20.json";
import { testConfig } from "../config";

import dirtyChai from "dirty-chai";
chai.use(dirtyChai);

describe("TruflationKeeper", function () {
  let keeper: any;
  let deployer: string, alice: string;

  before(async () => {
    ({ deployer, alice } = await getNamedAccounts());
  });

  beforeEach(async () => {
    await deployments.fixture(["all"]);
    keeper = await ethers.getContract("TruflationKeeper");
  });

  it("should request a price update", async () => {
    const link = await ethers.getContractAt(
      ABIIERC20,
      await keeper.getChainlinkToken()
    );

    await link.transfer(keeper.address, ethers.utils.parseEther("0.01"));

    await keeper.requestYoyInflation();

    expect(await keeper.getPrice()).to.be.equal(ethers.utils.parseEther("3"));
  });

  it("should change the oracle id", async () => {
    await keeper.changeOracle(ethers.constants.AddressZero);
    expect(await keeper.oracleId()).to.be.equal(ethers.constants.AddressZero);
  });

  it("should change the job id", async () => {
    await keeper.changeJobId("12345");
    expect(await keeper.jobId()).to.be.equal("12345");
  });

  it("should change the fee", async () => {
    await keeper.changeFee(ethers.utils.parseEther("0.1"));
    expect(await keeper.fee()).to.be.equal(ethers.utils.parseEther("0.1"));
  });

  it("should get the chainlink token", async () => {
    expect(await keeper.getChainlinkToken()).to.be.equal(testConfig.link);
  });

  it("should withdraw link from the contract", async () => {
    const link = await ethers.getContractAt(
      ABIIERC20,
      await keeper.getChainlinkToken()
    );

    await link.transfer(keeper.address, ethers.utils.parseEther("1"));

    await expect(keeper.withdrawLink()).to.changeTokenBalances(
      link,
      [keeper.address, deployer],
      [ethers.utils.parseEther("-1"), ethers.utils.parseEther("1")]
    );
  });

  it("should not allow anyone but oracle to fulfill price", async () => {
    const inflationAsBytes = ethers.utils.defaultAbiCoder.encode(
      ["uint256"],
      [0]
    );
    await expect(
      keeper
        .connect(await ethers.getSigner(alice))
        .fulfillYoyInflation(
          ethers.utils.formatBytes32String(""),
          inflationAsBytes
        )
    ).to.revertedWith("Source must be the oracle of the request");
  });

  it("should not allow non-owner to change oracle", async () => {
    await expect(
      keeper
        .connect(await ethers.getSigner(alice))
        .changeOracle(ethers.constants.AddressZero)
    ).to.revertedWith("Only callable by owner");
  });

  it("should not allow non-owner to change job id", async () => {
    await expect(
      keeper.connect(await ethers.getSigner(alice)).changeJobId("")
    ).to.revertedWith("Only callable by owner");
  });

  it("should not allow non-owner to change fee", async () => {
    await expect(
      keeper
        .connect(await ethers.getSigner(alice))
        .changeFee(ethers.utils.parseEther("0.1"))
    ).to.revertedWith("Only callable by owner");
  });
});
