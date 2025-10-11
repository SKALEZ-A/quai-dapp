import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Updating QNS Registrar pricing...");
  
  // Get the deployed registrar address
  const REGISTRAR_ADDRESS = "0x00204d553264Bdb39f4A6C6c1325d9B4553E427b";
  
  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Updating with account:", deployer.address);
  
  // Connect to the registrar contract
  const registrar = await ethers.getContractAt("QNSRegistrarSimple", REGISTRAR_ADDRESS);
  
  // New pricing (in wei) - reduced for testing
  const newPricing = {
    3: ethers.parseEther("10"),   // 10 QI
    4: ethers.parseEther("5"),    // 5 QI  
    5: ethers.parseEther("2"),    // 2 QI
    6: ethers.parseEther("2"),    // 2 QI
    7: ethers.parseEther("2"),    // 2 QI
  };
  
  console.log("📊 Updating pricing:");
  for (const [length, price] of Object.entries(newPricing)) {
    console.log(`  ${length} chars: ${ethers.formatEther(price)} QI`);
    
    try {
      const tx = await registrar.updatePricing(parseInt(length), price);
      console.log(`  ✅ Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`  ✅ Confirmed for ${length} chars`);
    } catch (error) {
      console.error(`  ❌ Failed to update ${length} chars:`, error);
    }
  }
  
  console.log("🎉 Pricing update complete!");
  
  // Verify the new pricing
  console.log("\n🔍 Verifying new pricing:");
  for (const length of [3, 4, 5, 6, 7]) {
    const price = await registrar.getPrice("a".repeat(length));
    console.log(`  ${length} chars: ${ethers.formatEther(price)} QI`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
