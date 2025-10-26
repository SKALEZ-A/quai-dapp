const quais = require('quais');
const QNSRegistrarSimpleJson = require('./artifacts/contracts/QNSRegistrarSimple.sol/QNSRegistrarSimple.json');

async function main() {
  const RPC_URL = 'https://orchard.rpc.quai.network';
  const provider = new quais.JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
  
  const REGISTRAR_ADDRESS = '0x0054100a03BE551B4a39f0Fea5cC83699171BFDE';
  const registrar = new quais.Contract(REGISTRAR_ADDRESS, QNSRegistrarSimpleJson.abi, provider);
  
  console.log('Verifying on-chain pricing...\n');
  
  const testNames = ['abc', 'test', 'quick'];
  const expectedPrices = ['50', '20', '5'];
  
  for (let i = 0; i < testNames.length; i++) {
    const name = testNames[i];
    const priceWei = await registrar.getPrice(name);
    const priceQuai = quais.formatQuai(priceWei);
    const expected = expectedPrices[i];
    
    const match = priceQuai === expected;
    console.log(`${name} (${name.length} chars): ${priceQuai} QUAI ${match ? '✅' : '❌ (Expected: ' + expected + ')'}`);
  }
}

main().catch(console.error);
