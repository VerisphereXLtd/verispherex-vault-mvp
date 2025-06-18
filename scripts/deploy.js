const hre = require("hardhat");

async function main() {
  const vault = await hre.ethers.deployContract("VSXVault");
  await vault.waitForDeployment();

  const contractAddress = await vault.getAddress();
  console.log(`VSXVault deployed to: ${contractAddress}`);

  // Wait for Etherscan to index the deployment (20–30 seconds)
  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Verify the contract
  await verify(contractAddress, []);
}

// Auto-verify function
async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.error("Verification failed:", e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
