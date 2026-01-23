const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  /* ---------------- DEPLOY TIMELOCK ---------------- */
  const Timelock = await ethers.getContractFactory("Timelock");
  const timelock = await Timelock.deploy(
    3600,          // 1 hour delay
    [],            // proposers (set later)
    []             // executors (open execution)
  );
  await timelock.deployed();

  /* ---------------- DEPLOY GOVERNOR ---------------- */
  const Governor = await ethers.getContractFactory("MyGovernor");
  const governor = await Governor.deploy(
    token.address,
    timelock.address
  );
  await governor.deployed();

  /* -------- ASSIGN SECURITY ROLES (IMPORTANT) -------- */
  await governor.grantRole(
    await governor.PAUSER_ROLE(),
    timelock.address
  );

  await governor.grantRole(
    await governor.ATTESTER_ROLE(),
    timelock.address
  );

  console.log("✅ Timelock and Governor deployed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
