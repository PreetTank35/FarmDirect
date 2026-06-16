// @ts-nocheck
import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const Marketplace = await ethers.getContractFactory("FarmDirectMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.waitForDeployment();
  const address = await marketplace.getAddress();

  console.log(`FarmDirectMarketplace deployed to: ${address}`);

  // Save the address and ABI to a file for the frontend
  const data = {
    address: address,
    abi: JSON.parse(marketplace.interface.formatJson())
  };

  fs.writeFileSync(
    "components/web3/contractData.json",
    JSON.stringify(data, null, 2)
  );
  
  console.log("Contract data saved to components/web3/contractData.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
