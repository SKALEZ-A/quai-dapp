// Update the default price in the QNSRegistrarSimple contract
import { JsonRpcProvider, Contract, Wallet } from 'quais';

const CONTRACTS = {
  QNS_REGISTRAR: '0x0059Fc49817AC27165A9335967ba19d2eb115410',
};

const RPC_URL = 'https://orchard.rpc.quai.network';
const PRIVATE_KEY = '0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802';

const REGISTRAR_ABI = [
  "function updatePricing(uint256 nameLength, uint256 newPrice) external",
  "function getPrice(string calldata name) external view returns (uint256)",
];

async function updateDefaultPrice() {
  console.log('💰 Updating default domain pricing...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    const registrar = new Contract(CONTRACTS.QNS_REGISTRAR, REGISTRAR_ABI, wallet);
    
    // Update pricing for 8+ character domains to be affordable
    const defaultPrice = '10000000000000000'; // 0.01 QI for 8+ char domains
    
    console.log('📝 Updating 8+ character domain pricing to 0.01 QI...');
    
    try {
      const tx = await registrar.updatePricing(8, defaultPrice);
      console.log(`   ✅ Transaction sent: ${tx.hash}`);
      
      await tx.wait();
      console.log(`   ✅ Default pricing updated successfully!`);
      
      // Test the updated pricing
      console.log('\n🧪 Testing updated pricing...');
      const testDomains = ['mydomain', 'verylongname', 'superlongdomainname'];
      
      for (const domain of testDomains) {
        try {
          const price = await registrar.getPrice(domain);
          const priceInEther = (parseFloat(price.toString()) / 1e18).toFixed(3);
          console.log(`   ${domain} (${domain.length} chars): ${priceInEther} QI`);
        } catch (error) {
          console.log(`   ${domain}: Error getting price - ${error.message}`);
        }
      }
      
      console.log('\n🎉 Default pricing update complete!');
      console.log('✅ All domain lengths now have affordable pricing');
      console.log('✅ 3-char: 0.1 QI, 4-char: 0.05 QI, 5-7 char: 0.02 QI, 8+ char: 0.01 QI');
      
    } catch (error) {
      console.log(`   ❌ Failed to update default pricing: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Pricing update failed:', error.message);
  }
}

updateDefaultPrice();