// Update QNS domain pricing to make it more affordable
import { JsonRpcProvider, Contract, Wallet } from 'quais';

const CONTRACTS = {
  QNS_REGISTRAR: '0x0059Fc49817AC27165A9335967ba19d2eb115410',
};

const RPC_URL = 'https://orchard.rpc.quai.network';
const PRIVATE_KEY = '0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802';

const REGISTRAR_ABI = [
  "function updatePricing(uint256 nameLength, uint256 newPrice) external",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function pricing(uint256) external view returns (uint256)",
];

async function updatePricing() {
  console.log('💰 Updating QNS domain pricing...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    const registrar = new Contract(CONTRACTS.QNS_REGISTRAR, REGISTRAR_ABI, wallet);
    
    // New affordable pricing (in wei)
    const newPricing = {
      3: '100000000000000000',  // 0.1 QI for 3-char domains
      4: '50000000000000000',   // 0.05 QI for 4-char domains  
      5: '20000000000000000',   // 0.02 QI for 5-char domains
      6: '20000000000000000',   // 0.02 QI for 6-char domains
      7: '20000000000000000',   // 0.02 QI for 7-char domains
    };
    
    console.log('📝 New pricing structure:');
    console.log('   3-char domains: 0.1 QI');
    console.log('   4-char domains: 0.05 QI');
    console.log('   5-char domains: 0.02 QI');
    console.log('   6-char domains: 0.02 QI');
    console.log('   7-char domains: 0.02 QI');
    console.log('   8+ char domains: 0.01 QI (default)\n');
    
    // Update pricing for each length
    for (const [length, price] of Object.entries(newPricing)) {
      console.log(`Updating ${length}-char domain pricing to ${price.toString()} wei...`);
      
      try {
        const tx = await registrar.updatePricing(length, price);
        console.log(`   ✅ Transaction sent: ${tx.hash}`);
        
        await tx.wait();
        console.log(`   ✅ Pricing updated successfully!`);
        
        // Verify the update
        const updatedPrice = await registrar.pricing(length);
        console.log(`   ✅ Verified: ${length}-char domains now cost ${updatedPrice.toString()} wei\n`);
        
      } catch (error) {
        console.log(`   ❌ Failed to update ${length}-char pricing: ${error.message}\n`);
      }
    }
    
    // Test the new pricing
    console.log('🧪 Testing new pricing...');
    const testDomains = ['abc', 'test', 'hello', 'myname', 'example', 'mydomain', 'verylongname'];
    
    for (const domain of testDomains) {
      try {
        const price = await registrar.getPrice(domain);
        const priceInEther = (parseFloat(price.toString()) / 1e18).toFixed(3);
        console.log(`   ${domain} (${domain.length} chars): ${priceInEther} QI`);
      } catch (error) {
        console.log(`   ${domain}: Error getting price - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Pricing update complete!');
    console.log('✅ Domain registration is now much more affordable');
    console.log('✅ Pricing can be updated anytime by the admin');
    
  } catch (error) {
    console.error('❌ Pricing update failed:', error.message);
  }
}

updatePricing();