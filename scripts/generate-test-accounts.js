const { ethers } = require("ethers");

function generateAccounts(count = 5) {
  console.log("=========================================");
  console.log(`Generating ${count} Test Accounts for MVP Demo`);
  console.log("=========================================\n");

  const accounts = [];

  for (let i = 0; i < count; i++) {
    const wallet = ethers.Wallet.createRandom();
    accounts.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase
    });

    console.log(`Account ${i + 1}:`);
    console.log(`Address:     ${wallet.address}`);
    console.log(`Private Key: ${wallet.privateKey}`);
    console.log("-----------------------------------------");
  }

  console.log("\n=========================================");
  console.log("MVP Demo Setup Instructions");
  console.log("=========================================");
  console.log("\n1. Import into MetaMask:");
  console.log("   - Open MetaMask > Click Account Dropdown > Add account or hardware wallet > Import account");
  console.log("   - Paste the Private Key for the account you want to import.");

  console.log("\n2. Get Sepolia Testnet ETH:");
  console.log("   You will need Sepolia ETH in these accounts to make transactions.");
  console.log("   Use these faucets (you may need an Alchemy or Infura account):");
  console.log("   - https://sepoliafaucet.com/ (Alchemy)");
  console.log("   - https://www.infura.io/faucet/sepolia (Infura)");
  console.log("   - https://faucet.quicknode.com/ethereum/sepolia (QuickNode)");

  console.log("\n3. Testing Roles:");
  console.log("   - Account 1: Use as the Vendor/Seller (list products)");
  console.log("   - Account 2: Use as the Customer/Buyer (buy products)");
  console.log("=========================================\n");
}

const args = process.argv.slice(2);
const numAccounts = args.length > 0 ? parseInt(args[0], 10) : 5;

generateAccounts(numAccounts);
