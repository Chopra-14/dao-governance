const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAO Governance Flow", function () {
  let token, timelock, governor;
  let owner, voter1;

  beforeEach(async function () {
  [owner, voter1] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("GovernanceToken");
  token = await Token.deploy();
  await token.waitForDeployment();

  await token.delegate(owner.address);

  const Timelock = await ethers.getContractFactory("TimelockController");
  timelock = await Timelock.deploy(1, [], [], owner.address);
  await timelock.waitForDeployment();

  // 🔥 FIX: Give timelock tokens to execute with
  await token.transfer(timelock.target, ethers.parseEther("10"));

  const Governor = await ethers.getContractFactory("MyGovernor");
  governor = await Governor.deploy(token.target, timelock.target);
  await governor.waitForDeployment();

  await timelock.grantRole(
    await timelock.PROPOSER_ROLE(),
    governor.target
  );
  await timelock.grantRole(
    await timelock.EXECUTOR_ROLE(),
    ethers.ZeroAddress
  );
  await timelock.revokeRole(
    await timelock.TIMELOCK_ADMIN_ROLE(),
    owner.address
  );
});


  it("Should create, vote, queue, and execute a proposal", async function () {
    const encodedCall = token.interface.encodeFunctionData(
      "transfer",
      [voter1.address, ethers.parseEther("1")]
    );

    // Propose
    const tx = await governor.propose(
      [token.target],
      [0],
      [encodedCall],
      "Give voter1 tokens"
    );
    const receipt = await tx.wait();
    const proposalId = receipt.logs[0].args.proposalId;

    // Move to voting
    await ethers.provider.send("evm_mine");
    await governor.castVote(proposalId, 1); // For

    // End voting
    for (let i = 0; i < 10; i++) {
      await ethers.provider.send("evm_mine");
    }

    // ✅ CHECK SUCCEEDED (4)
    let state = await governor.state(proposalId);
    expect(state).to.equal(4n);

    // Queue
    await governor.queue(
      [token.target],
      [0],
      [encodedCall],
      ethers.id("Give voter1 tokens")
    );

    // Execute
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    await governor.execute(
      [token.target],
      [0],
      [encodedCall],
      ethers.id("Give voter1 tokens")
    );

    // ✅ CHECK EXECUTED (7)
    state = await governor.state(proposalId);
    expect(state).to.equal(7n);
  });
});
