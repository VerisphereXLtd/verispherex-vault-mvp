const hre = require("hardhat");

require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Private Key:", process.env.PRIVATE_KEY);

  try {
    const Vault = await hre.ethers.getContractFactory("VSXVault");
    console.log("Contract Factory loaded");
    const vault = await Vault.deploy();
    console.log("Contract deployment sent...");
    console.log("Vault object:", vault);
    const tx = vault.deploymentTransaction();
    console.log("Deployment Tx:", tx);


    await vault.waitForDeployment();
    console.log("Deployment confirmed");
 

    const contractAddress = await vault.getAddress();
    console.log(`VSXVault deployed to: ${contractAddress}`);

     //Saves to deployedAddress.json
    const outputPath = path.join(__dirname, "../deployedAddress.json"); 
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          vaultAddress: contractAddress,
          network: hre.network.name,
          deployedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(`Address saved to: ${outputPath}`);

    //Waits for Etherscan to index the deployment (20–30 seconds)
    await new Promise((resolve) => setTimeout(resolve, 30000));

    //Verifies the contract
    await verify(contractAddress, []);
  } catch (error) {
    console.error("Deployment failed:", error);
  }
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
  console.error("Uncaught error:", error);
  process.exitCode = 1;
});
