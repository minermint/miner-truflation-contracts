import { deployments, getNamedAccounts, ethers } from "hardhat";
import chai, { expect } from "chai";

import { deployMockContract } from "@ethereum-waffle/mock-contract";
import ABIIERC20 from "@chainlink/contracts/abi/v0.4/ERC20.json"
import { testConfig } from "../config";

import dirtyChai from "dirty-chai";
chai.use(dirtyChai);

describe("TruflationKeeper", function () {
  let keeper: any;
  let deployer: string, requester: string, fulfiller: string, alice: string;

  before(async () => {
    ({ deployer, requester, fulfiller, alice } = await getNamedAccounts());
  });

  beforeEach(async () => {
    await deployments.fixture(["all"]);
    keeper = await ethers.getContract("TruflationKeeper");
  });

  it.skip("should deploy a keeper", async () => {
    const link = await ethers.getContractAt(
      ABIIERC20,
      await keeper.getChainlinkToken()
    );

    await link.transfer(keeper.address, ethers.utils.parseEther("0.01"));

    await keeper.requestPrice();

    const filter = {
      topics: [ethers.utils.id("ChainlinkFulfilled(uint256)")],
    };

    ethers.provider.on(filter, async (log, _event) => {
      console.log(log);
    });

    // await new Promise((r) => setTimeout(r, 30000));

    const provider = new ethers.providers.JsonRpcProvider(process.env.URL);

    const artifact = await deployments.getArtifact("TruflationKeeper");

    const rinkebyKeeper = new ethers.Contract(
      testConfig.link,
      artifact.abi,
      provider
    );

    console.log(
      "Exchange Rate",
      ethers.utils.defaultAbiCoder
        .decode(["uint256"], await rinkebyKeeper.price())
        .toString()
    );
  });

  it("should change the oracle id", async () => {
    await keeper.changeOracle(ethers.constants.AddressZero);
    expect(await keeper.oracleId()).to.be.equal(ethers.constants.AddressZero);
  });

  it("should change the job id", async () => {
    await keeper.changeJobId("12345");
    expect(await keeper.jobId()).to.be.equal("12345");
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

  it.skip("should fulfill price", async () => {
    const expected = ethers.utils.parseEther("1");

    const priceAsBytes = ethers.utils.defaultAbiCoder.encode(
      ["uint256"],
      [expected]
    );

    await keeper
      .connect(await ethers.getSigner(fulfiller))
      .fulfillPrice(ethers.utils.formatBytes32String(""), priceAsBytes);

    expect(await keeper.price()).to.be.equal(expected);
  });

  it("should not allow anyone but oracle to fulfill price", async () => {
    const priceAsBytes = ethers.utils.defaultAbiCoder.encode(["uint256"], [0]);
    await expect(
      keeper
        .connect(await ethers.getSigner(alice))
        .fulfillPrice(ethers.utils.formatBytes32String(""), priceAsBytes)
    ).to.revertedWith(
      "Source must be the oracle of the request"
    );
  });

  it("should not allow anyone but owner to change oracle", async () => {
    await expect(
      keeper
        .connect(await ethers.getSigner(alice))
        .changeOracle(ethers.constants.AddressZero)
    ).to.revertedWith(
      "Only callable by owner"
    );
  });

  it("should not allow address but owner to change job id", async () => {
    await expect(
      keeper.connect(await ethers.getSigner(alice)).changeJobId("")
    ).to.revertedWith(
      "Only callable by owner"
    );
  });
});
