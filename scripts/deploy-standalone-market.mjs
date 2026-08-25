import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const secretKey = 'SDMTUFZZKKMODU3NOSLUQNXRVJH3U4IVXHN2TZ2RVTYUEL2C3XDS5FG6';
const publicAddress = 'GACY34BGOUKJIT25Q3V6QHISDFEYD67GJUMFIC7LD74ATOYNN4VBBZLA';

console.log('🚀 Deploying Standalone Market Contract (market.wasm) to Stellar Mainnet...');

// Setup temporary identity
const identityName = 'deployer-temp';
try {
  execSync(`stellar keys add ${identityName} --secret-key`, { input: `${secretKey}\n` });
} catch (e) {
  // Already exists
}

const marketWasm = path.join(rootDir, 'target', 'wasm32v1-none', 'release', 'market.wasm');

console.log(`居 Deploying ${marketWasm} on Public Global Stellar Network...`);
const rpcUrl = 'https://mainnet.sorobanrpc.com';
const networkPassphrase = 'Public Global Stellar Network ; September 2015';

const deployCmd = `stellar contract deploy --wasm "${marketWasm}" --source ${identityName} --rpc-url "${rpcUrl}" --network-passphrase "${networkPassphrase}" --inclusion-fee 100000`;
const marketContractId = execSync(deployCmd).toString().trim();

console.log('========================================================');
console.log('🎉 STANDALONE MARKET CONTRACT DEPLOYED TO MAINNET!');
console.log(' - Market Contract ID:', marketContractId);
console.log('========================================================');

// Save to market-contract-mainnet.json
const jsonPath = path.join(rootDir, 'market-contract-mainnet.json');
fs.writeFileSync(jsonPath, JSON.stringify({ market: marketContractId }, null, 2));

// Update predict-x/src/config/stellar.ts
const configPath = path.join(rootDir, 'predict-x', 'src', 'config', 'stellar.ts');
let configContent = fs.readFileSync(configPath, 'utf8');

configContent = configContent.replace(
  /market:\s*'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL'/,
  `market: '${marketContractId}'`
);

fs.writeFileSync(configPath, configContent);
console.log(`✨ Updated ${configPath} with market: '${marketContractId}'`);
