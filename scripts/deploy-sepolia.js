// Direct Sepolia deployment script (no Hardhat subprocess issues)
const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL;
  const privateKey = process.env.WALLET_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error("Missing NEXT_PUBLIC_ALCHEMY_RPC_URL or WALLET_PRIVATE_KEY in .env.local");
    process.exit(1);
  }

  console.log("RPC URL:", rpcUrl);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer address:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("No Sepolia ETH! Get some from a faucet.");
    process.exit(1);
  }

  // Read compiled contract artifact
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/FarmDirectMarketplace.sol/FarmDirectMarketplace.json", "utf8")
  );

  console.log("Deploying FarmDirectMarketplace...");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  
  console.log("Tx hash:", contract.deploymentTransaction().hash);
  console.log("Waiting for confirmation...");
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`FarmDirectMarketplace deployed to: ${address}`);

  const data = {
    address: address,
    abi: JSON.parse(contract.interface.formatJson())
  };

  fs.writeFileSync(
    "components/web3/contractData.json",
    JSON.stringify(data, null, 2)
  );

  console.log("Contract data saved to components/web3/contractData.json");
}

main().catch((error) => {
  console.error("Deploy failed:", error);
  process.exitCode = 1;
});
