import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

async function checkBalance() {
  console.log("🔍 Checking Quai Mainnet Wallet Balance...\n");
  
  try {
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    const balance = await ethers.provider.getBalance(address);
    const balanceInQi = Number(ethers.formatEther(balance));
    
    console.log("👤 Deployer Address:", address);
    console.log("💰 Balance:", balanceInQi.toFixed(4), "QI");
    
    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("\n🌐 Network Info:");
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Network Name:", network.name);
    
    // Get latest block
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("   Latest Block:", blockNumber);
    console.log("   ✅ RPC is responding correctly\n");
    
    // Check if sufficient for deployment
    const requiredQi = 2.0;
    if (balanceInQi >= requiredQi) {
      console.log("✅ SUFFICIENT BALANCE FOR DEPLOYMENT!");
      console.log(`   Required: ${requiredQi} QI`);
      console.log(`   Available: ${balanceInQi.toFixed(4)} QI`);
      console.log(`   Surplus: ${(balanceInQi - requiredQi).toFixed(4)} QI`);
      console.log("\n🚀 Ready to deploy! Run:");
      console.log("   pnpm hardhat run scripts/deploy.ts --network quai");
    } else {
      console.log("⚠️  INSUFFICIENT BALANCE FOR DEPLOYMENT");
      console.log(`   Required: ${requiredQi} QI`);
      console.log(`   Available: ${balanceInQi.toFixed(4)} QI`);
      console.log(`   Needed: ${(requiredQi - balanceInQi).toFixed(4)} QI`);
      console.log("\n🔗 Get QI from:");
      console.log("   - Exchanges: MEXC, Gate.io, CoinEx");
      console.log("   - Faucet: https://faucet.quai.network");
      console.log("   - Quai Discord: https://discord.gg/quai");
      console.log("\n   Send QI to:", address);
    }
    
  } catch (error) {
    console.error("\n❌ Error:", (error as Error).message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check RPC endpoint is accessible");
    console.log("   2. Verify .env file has correct QUAI_RPC_URL");
    console.log("   3. Check Quai Discord for RPC status");
    console.log("   4. Try alternative RPC endpoint");
  }
}

checkBalance().catch(console.error);
