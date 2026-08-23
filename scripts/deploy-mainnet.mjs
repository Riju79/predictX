import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 PredictX Mainnet Deployment Script');
console.log('====================================\n');

// 1. Get Mainnet Secret Key or use saved key identity 'deployer-mainnet'
let secretKey = process.env.MAINNET_SECRET_KEY;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--secret' && args[i + 1]) {
    secretKey = args[i + 1];
  }
}

const network = 'mainnet';
const rpcUrl = 'https://mainnet.sorobanrpc.com';
const networkPassphrase = 'Public Global Stellar Network ; September 2015';

// 2. Configure network in stellar CLI
console.log('⚙️  Configuring Stellar CLI network (Mainnet)...');
try {
  execSync(`stellar network add ${network} --rpc-url "${rpcUrl}" --network-passphrase "${networkPassphrase}"`, { stdio: 'pipe' });
} catch (e) {
  // Network might already exist
}

// 3. Setup key identity
let identityName = 'deployer-mainnet';
if (secretKey) {
  console.log('🔑 Setting up custom deployer key identity...');
  try {
    execSync(`stellar keys add ${identityName} --secret-key ${secretKey} --overwrite`, { stdio: 'pipe' });
  } catch (e) {
    console.error('❌ Failed to add deployer key identity:', e.message);
    process.exit(1);
  }
}

const publicAddress = execSync(`stellar keys address ${identityName}`).toString().trim();
console.log(`✅ Deployer Public Address: ${publicAddress}`);

// Check XLM Balance on Mainnet
try {
  const accountInfoRaw = execSync(`curl -s "https://horizon.stellar.org/accounts/${publicAddress}"`).toString();
  const accountData = JSON.parse(accountInfoRaw);
  if (accountData.balances) {
    const xlmBalance = accountData.balances.find(b => b.asset_type === 'native');
    if (xlmBalance) {
      console.log(`💰 Current XLM Balance: ${parseFloat(xlmBalance.balance).toFixed(4)} XLM`);
      if (parseFloat(xlmBalance.balance) < 15) {
        console.warn('⚠️  Warning: Balance is low (< 15 XLM). Deployment requires ~15-25 XLM minimum.');
      }
    }
  }
} catch (e) {
  console.log('ℹ️  Could not fetch initial Horizon balance check. Proceeding with deployment...');
}

// WASM paths
const wasmDir = path.join(rootDir, 'target', 'wasm32v1-none', 'release');
const oracleWasm = path.join(wasmDir, 'oracle.wasm');
const ammWasm = path.join(wasmDir, 'amm.wasm');
const marketWasm = path.join(wasmDir, 'market.wasm');
const factoryWasm = path.join(wasmDir, 'market_factory.wasm');

// Verify WASMs exist
for (const [name, p] of Object.entries({ oracleWasm, ammWasm, marketWasm, factoryWasm })) {
  if (!fs.existsSync(p)) {
    console.error(`❌ Error: WASM file for ${name} not found at ${p}. Run 'stellar contract build' first.`);
    process.exit(1);
  }
}

// Already deployed contracts on Stellar Mainnet
const deployed = {
  factory: 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL',
  oracle: 'CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ',
  amm: 'CDPPM2LRO3RRO3TGP7NYTWPD2EPEJIJ6S6QHESMZCC5LSOPAZJRFCDZO',
  token: 'CCW67TSBWVENNVMTQPEXNGXYL6P5CZWKWZHB4CCKC2SCFYPPBZER5VKX',
};

console.log(`\n✅ Oracle Contract Already Deployed: ${deployed.oracle}`);
console.log(`✅ AMM Contract Already Deployed: ${deployed.amm}`);
console.log(`✅ Factory Contract Already Deployed: ${deployed.factory}`);

try {
  // Final Step: Install & Deploy Market Contract Instance
  console.log('\n📦 [4/4] Uploading & Deploying Market Contract Instance...');
  const marketInstallCmd = `stellar contract install --wasm "${marketWasm}" --source ${identityName} --network ${network} --inclusion-fee 100000`;
  const marketWasmHash = execSync(marketInstallCmd).toString().trim();
  console.log(`✅ Market WASM Hash Installed: ${marketWasmHash}`);

  const marketCmd = `stellar contract deploy --wasm "${marketWasm}" --source ${identityName} --network ${network} --inclusion-fee 100000`;
  deployed.market = execSync(marketCmd).toString().trim();
  console.log(`✅ Market Contract Instance Deployed: ${deployed.market}`);

  // Set default collateral token (Mainnet USDC or fallback)
  deployed.token = 'CCW67TSBWVENNVMTQPEXNGXYL6P5CZWKWZHB4CCKC2SCFYPPBZER5VKX'; // Mainnet USDC

  // Save to deployed-contracts-mainnet.json
  const mainnetJsonPath = path.join(rootDir, 'deployed-contracts-mainnet.json');
  fs.writeFileSync(mainnetJsonPath, JSON.stringify(deployed, null, 2));
  console.log(`\n💾 Saved contract addresses to ${mainnetJsonPath}`);

  // Update src/config/stellar.ts if desired
  const configPath = path.join(rootDir, 'predict-x', 'src', 'config', 'stellar.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Replace contracts block
  const newContractsBlock = `contracts: {
    market: '${deployed.market}',
    token: '${deployed.token}',
    amm: '${deployed.amm}',
    factory: '${deployed.factory}',
    oracle: '${deployed.oracle}',
  },`;

  configContent = configContent.replace(/network:\s*'testnet'/, "network: 'public'");
  configContent = configContent.replace(/networkPassphrase:\s*'.*?'/, `networkPassphrase: '${networkPassphrase}'`);
  configContent = configContent.replace(/rpcUrl:\s*'.*?'/, `rpcUrl: '${rpcUrl}'`);
  configContent = configContent.replace(/horizonUrl:\s*'.*?'/, `horizonUrl: 'https://horizon.stellar.org'`);
  configContent = configContent.replace(/contracts:\s*\{[\s\S]*?\}/, newContractsBlock.trim());

  fs.writeFileSync(configPath, configContent);
  console.log(`✨ Updated ${configPath} with Mainnet configuration!`);

  console.log('\n🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY TO STELLAR MAINNET!');
  console.log('========================================================');
  console.log(JSON.stringify(deployed, null, 2));

} catch (err) {
  console.error('\n❌ Deployment failed:', err.stderr ? err.stderr.toString() : err.message);
  process.exit(1);
}
