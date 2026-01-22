// const hre = require("hardhat");
// const { ethers } = hre;

// async function main() {
//   // -----------------------------
//   // 1. Get deployer
//   // -----------------------------
//   const [deployer] = await ethers.getSigners();

//   console.log("Deploying contracts with account:", deployer.address);
//   console.log(
//     "Account balance:",
//     ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
//     "ETH"
//   );

//   // -----------------------------
//   // 2. Deploy Governance Token
//   // -----------------------------
//   const GovernanceToken = await ethers.getContractFactory(
//     "contracts/GovernanceToken.sol:GovernanceToken"
//   );

//   const governanceToken = await GovernanceToken.deploy();
//   await governanceToken.waitForDeployment();

//   console.log(
//     "GovernanceToken deployed to:",
//     await governanceToken.getAddress()
//   );

//   // Delegate voting power to deployer
//   const delegateTx = await governanceToken.delegate(deployer.address);
//   await delegateTx.wait();

//   console.log("Delegated voting power to deployer");

//   // -----------------------------
//   // 3. Deploy Timelock
//   // -----------------------------
//   const MIN_DELAY = 3600; // 1 hour
//   const proposers = [];
//   const executors = [];

//   const Timelock = await ethers.getContractFactory(
//     "@openzeppelin/contracts/governance/TimelockController.sol:TimelockController"
//   );

//   const timelock = await Timelock.deploy(
//     MIN_DELAY,
//     proposers,
//     executors,
//     deployer.address
//   );
//   await timelock.waitForDeployment();

//   console.log("Timelock deployed to:", await timelock.getAddress());

//   // -----------------------------
//   // 4. Deploy Governor
//   // -----------------------------
//   const MyGovernor = await ethers.getContractFactory(
//     "contracts/MyGovernor.sol:MyGovernor"
//   );

//   const governor = await MyGovernor.deploy(
//     await governanceToken.getAddress(),
//     await timelock.getAddress()
//   );
//   await governor.waitForDeployment();

//   console.log("Governor deployed to:", await governor.getAddress());

//   // -----------------------------
//   // 5. Configure Roles
//   // -----------------------------
//   const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
//   const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
//   const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

//   // Grant proposer role to governor
//   await (await timelock.grantRole(PROPOSER_ROLE, await governor.getAddress())).wait();

//   // Allow anyone to execute
//   await (await timelock.grantRole(EXECUTOR_ROLE, ethers.ZeroAddress)).wait();

//   // Revoke admin role from deployer (DAO becomes autonomous)
//   await (await timelock.revokeRole(TIMELOCK_ADMIN_ROLE, deployer.address)).wait();

//   console.log("Proposer role granted to Governor");
//   console.log("Executor role opened to everyone");
//   console.log("Admin role revoked from deployer");

//   // -----------------------------
//   // 6. Done
//   // -----------------------------
//   console.log("DAO Deployment Complete ✅");
// }

// // Hardhat pattern
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Token = await ethers.getContractFactory("GovernanceToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  await token.delegate(deployer.address);

  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(1, [], []);
  await timelock.waitForDeployment();

  const Governor = await ethers.getContractFactory("MyGovernor");
  const governor = await Governor.deploy(token.target, timelock.target);
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
    deployer.address
  );

  console.log("Token:", token.target);
  console.log("Governor:", governor.target);
  console.log("Timelock:", timelock.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
