const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const vault = await hre.ethers.getContractAt(
    "VSXVault",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" // Deployed address
  );

  // Lock 0.01 ETH into the vault
  const tx = await vault.lock({ value: hre.ethers.parseEther("0.01") });
  await tx.wait();
  console.log("Locked 0.01 ETH");

  // Read balance
  const balance = await vault.getLockedBalance();
  console.log(`Locked Balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Withdraw (optional)
  // const withdrawTx = await vault.withdraw();
  // await withdrawTx.wait();
  // console.log("Withdrawn");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
