const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const Marketplace = await ethers.getContractFactory("FarmDirectMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.waitForDeployment();
  const address = await marketplace.getAddress();

  console.log(`FarmDirectMarketplace deployed to: ${address}`);

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
