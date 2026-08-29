<div align="center">

<img src="https://img.shields.io/badge/Built%20on-Stellar%20Soroban-7B2FF7?style=for-the-badge&logo=stellar&logoColor=white" />
<img src="https://img.shields.io/badge/Network-Mainnet-00C6AE?style=for-the-badge" />
<img src="https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=nextdotjs" />
<img src="https://img.shields.io/badge/Smart%20Contracts-Rust%20%2B%20Soroban%20SDK%2027-E57E25?style=for-the-badge&logo=rust" />
<img src="https://img.shields.io/badge/Wallet-Freighter-6C47FF?style=for-the-badge" />
<img src="https://img.shields.io/badge/Twitter-@predict__x79-1DA1F2?style=for-the-badge&logo=x&logoColor=white" />
<img src="https://img.shields.io/badge/GitHub-Riju79%2FpredictX-181717?style=for-the-badge&logo=github&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

<br/>
<br/>

```
██████╗ ██████╗ ███████╗██████╗ ██╗ ██████╗████████╗    ██╗  ██╗
██╔══██╗██╔══██╗██╔════╝██╔══██╗██║██╔════╝╚══██╔══╝    ╚██╗██╔╝
██████╔╝██████╔╝█████╗  ██║  ██║██║██║        ██║        ╚███╔╝
██╔═══╝ ██╔══██╗██╔══╝  ██║  ██║██║██║        ██║        ██╔██╗
██║     ██║  ██║███████╗██████╔╝██║╚██████╗   ██║       ██╔╝ ██╗
╚═╝     ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝ ╚═════╝   ╚═╝       ╚═╝  ╚═╝
```

### 🔮 Decentralized Prediction Market Protocol on Stellar Soroban

**Trade YES/NO outcome shares · Provide AMM liquidity · Earn protocol fees · Everything on-chain**

[🌐 Live App](https://predict-x-gray.vercel.app/app) · [📚 Documentation](https://predict-x-gray.vercel.app/docs) · [𝕏 Twitter](https://x.com/predict_x79) · [🐙 GitHub Repo](https://github.com/Riju79/predictX) · [📋 Feedback Form](https://forms.gle/SyWZnynTtpWFPG7j8) · [📄 FEEDBACK SHEET](https://docs.google.com/spreadsheets/d/1BEMWSMzzhpb87IglygYy2K7EfSFIu_AuMIC2cH_ghGw/edit?resourcekey=&gid=60851251#gid=60851251) · [🛡️ Security Audit Report](SECURITY_AUDIT.md) · [📄 PPT](https://predictx-presentation.vercel.app/) · [🚀 DEMO VIDEO](https://youtu.be/I1hi_T5dujE?si=pOnHJtqk1yaiJnKa)

</div>

---

## 📖 Project Overview

**PredictX** is a fully decentralized, production-grade prediction market protocol built natively on [Stellar Soroban Mainnet](https://soroban.stellar.org/). It enables anyone to create binary or multi-outcome prediction markets on real-world events — sports, crypto prices, elections, and more — and trade outcome shares using a constant-product AMM (Automated Market Maker) with on-chain liquidity pools.

Every trade, sell, market creation, and liquidity deposit is a **real Soroban smart contract transaction** signed by the user's Freighter wallet and confirmed on Stellar Mainnet. No centralized backend, no mock data — the blockchain is the single source of truth.

---

## ⚡ Real On-Chain Mainnet Transaction Activity

PredictX contracts are actively deployed and executing transactions on **Stellar Mainnet**. Every market creation, liquidity deposit, and outcome share trade is confirmed on-chain.

**Target Contract:** [`CCXHGNQRUJMONANKBM3JCYOHHO2Z4BJHOU2GXH72ORNSEG4CRUSKRC4V`](https://stellar_expert/explorer/public/contract/CCXHGNQRUJMONANKBM3JCYOHHO2Z4BJHOU2GXH72ORNSEG4CRUSKRC4V)  
**WASM Hash:** `4fccfb0a...edba0359` · **Contract Balance:** `1.45 XLM` · **Data Storage:** `11 entries`

### 📜 Verified Stellar Mainnet Transaction Log

| Date (UTC) | Invoker Wallet | Soroban Contract Function Invoked | Return Output |
| :--- | :--- | :--- | :--- |
| `2026-08-29 21:18:30` | `GACY...BZLA` | `buy_shares(GACY...BZLA, 1_u64, 1_u32, 1000000_i128)` | `→ 1993038_i128` |
| `2026-08-29 21:17:49` | `GACY...BZLA` | `buy_shares(GACY...BZLA, 1_u64, 1_u32, 1000000_i128)` | `→ 1995020_i128` |
| `2026-08-29 21:07:43` | `GACY...BZLA` | `buy_shares(GACY...BZLA, 1_u64, 1_u32, 1000000_i128)` | `→ 1997007_i128` |
| `2026-08-29 20:57:13` | `GCV7...VJT7` | `buy_shares(GCV7...VJT7, 1_u64, 1_u32, 1000000_i128)` | `→ 1999001_i128` |
| `2026-08-29 20:38:56` | `GCV7...VJT7` | `add_liquidity(GCV7...VJT7, 4_u64, 10000000_i128)` | `→ 2010000000_i128` |
| `2026-08-29 20:38:45` | `GCV7...VJT7` | `create_market(GCV7...VJT7, "Will_EU_fine_an_AI_developer_ove", 1790627916_u64, CC2N...AFKZ)` | `→ 4_u64` |

---

## ✨ Features

| Feature | Status | Description |
|---|---|---|
| 🏪 **Market Creation** | ✅ Live | Deploy binary/multi-outcome markets via Soroban Factory Contract |
| 📈 **Buy Shares** | ✅ Live | Purchase YES/NO outcome shares using AMM constant-product pricing |
| 📉 **Sell Shares** | ✅ Live | Sell partial or full positions back to AMM pool with real-time payout quotes |
| 💧 **LP Liquidity** | ✅ Live | Add/Remove XLM liquidity to market pools and earn 50% of trading fees |
| 🏆 **Claim Winnings** | ✅ Live | Claim XLM payouts from resolved markets |
| 🔐 **Freighter Wallet** | ✅ Live | Full wallet connect / sign / disconnect integration |
| 🚰 **Token Operations** | ✅ Live | Native Stellar Mainnet USDC / XLM asset integration |
| 📊 **Live Charts** | ✅ Live | Real-time probability price charts with multi-series candlestick view |
| ⚡ **Perps Terminal** | ✅ Live | Leveraged perpetual contracts on crypto price feeds |
| 🌐 **Live Feed** | ✅ Live | Real-time event discovery feed |
| 📁 **Portfolio Tracker** | ✅ Live | Persistent portfolio, trade history, and created markets per wallet |
| 🔗 **StellarExpert Links** | ✅ Live | Every transaction links directly to the Stellar blockchain explorer |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PredictX Architecture                        │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────┐
  │              Next.js 16 Frontend             │
  │  ┌─────────────┐  ┌──────────────────────┐  │
  │  │ TradingDrawer│  │  SellSharesModal     │  │
  │  │  BUY / SELL  │  │  Preset Sell UX      │  │
  │  └─────────────┘  └──────────────────────┘  │
  │  ┌─────────────┐  ┌──────────────────────┐  │
  │  │ MarketFeed  │  │  PerpsTerminal       │  │
  │  └─────────────┘  └──────────────────────┘  │
  │  ┌─────────────┐  ┌──────────────────────┐  │
  │  │ WalletModal │  │  Portfolio Tracker   │  │
  │  └─────────────┘  └──────────────────────┘  │
  └──────────────┬───────────────────────────────┘
                 │  Stellar SDK + Freighter API
                 ▼
  ┌──────────────────────────────────────────────┐
  │          Soroban RPC (Mainnet)               │
  │  simulate_transaction → signAndSend          │
  └──────────┬───────────────────────────────────┘
             │
  ┌──────────▼───────────────────────────────────────────────────────┐
  │                   Stellar Soroban Smart Contracts                 │
  │                                                                   │
  │  ┌──────────────────┐    ┌─────────────────────────────────────┐ │
  │  │  Market Factory  │───▶│  Market Contract (AMM Core)         │ │
  │  │  create_market() │    │  buy_shares()  sell_shares()        │ │
  │  └──────────────────┘    │  add_liquidity() remove_liquidity() │ │
  │                          │  claim_winnings() get_balance()     │ │
  │  ┌──────────────────┐    │  resolve_market() lock_market()     │ │
  │  │   Oracle         │───▶│  get_market_state()                 │ │
  │  │  resolve_market()│    └─────────────────────────────────────┘ │
  │  └──────────────────┘                                             │
  │  ┌──────────────────┐    ┌─────────────────────────────────────┐ │
  │  │    AMM Core      │───▶│  Constant-Product Pricing Engine   │ │
  │  └──────────────────┘    └─────────────────────────────────────┘ │
  └───────────────────────────────────────────────────────────────────┘
             │
  ┌──────────▼───────────────────────────────────┐
  │          Persistent Local Storage (db.ts)    │
  │  Portfolio · Trade History · Created Markets │
  └──────────────────────────────────────────────┘
```

### Contract Interaction Flow

```
User → Freighter Wallet Sign → Soroban RPC simulate_transaction
     ↓ [if simulation passes]
     → signAndSend → Stellar Mainnet Ledger → On-Chain State Update
     ↓
     → Read res.result (actual shares_out) → Update Local Portfolio
     → Emit StellarExpert Transaction Link
```

---

## 🛠️ Technology Stack

### Smart Contract Layer
| Technology | Version | Role |
|---|---|---|
| **Rust** | Stable | Smart contract implementation language |
| **Soroban SDK** | `27` | Stellar smart contract framework |
| **`#![no_std]`** | — | WASM-optimized contracts with zero stdlib |
| **Stellar CLI** | Latest | Contract deployment & invocation |

### Frontend Layer
| Technology | Version | Role |
|---|---|---|
| **Next.js** | `16.2.10` (Turbopack) | Full-stack React framework |
| **React** | `19.2.4` | UI component library |
| **TypeScript** | `^5` | Type-safe frontend development |
| **`@stellar/stellar-sdk`** | `^16.0.1` | Soroban RPC client & transaction builder |
| **`@stellar/freighter-api`** | `^6.0.1` | Browser wallet integration |
| **Recharts** | `^3.9.2` | Probability price chart rendering |
| **Lightweight Charts** | `^5.2.0` | Perps candlestick terminal |
| **Framer Motion** | `^12.42.2` | UI micro-animations |
| **Lenis** | `^1.3.25` | Smooth scroll engine |

---

## 🔄 System Workflow

### Buy Shares Workflow
```
1. User selects market + outcome (YES / NO)
2. User enters XLM amount in TradingDrawer
3. Frontend calls: marketClient.buy_shares({ user, market_id, outcome, payment })
4. Soroban simulates transaction (pre-flight check)
5. Freighter wallet opens → user approves
6. Transaction broadcasts to Stellar Mainnet ledger
7. Contract executes AMM:
     fee = payment × protocol_fee_bps / 10000
     net_payment = payment - fee - creator_fee
     shares_out = yes_reserves × net_payment / (no_reserves + net_payment)
8. Contract credits UserYesBalance(user, market_id) += shares_out
9. Frontend reads res.result → stores ACTUAL shares_out in portfolio
10. StellarExpert tx link displayed
```

### Sell Shares Workflow
```
1. User clicks "Sell Shares" from Portfolio tab
2. SellSharesModal opens with preset options (25% / 50% / 75% / MAX)
3. Live AMM payout quote computed (gross payout - 1% fee)
4. Frontend calls: marketClient.get_balance(user, market_id, outcome)
      → reads ACTUAL on-chain balance before simulation
5. Sell amount capped to on-chain balance (prevents contract panic)
6. Frontend calls: marketClient.sell_shares({ user, market_id, outcome, rawShares })
7. Freighter wallet opens → user approves
8. Contract executes reverse AMM:
     collateral_out = no_reserves × shares / (yes_reserves + shares)
9. XLM transferred back to user wallet
10. Portfolio state updated atomically
```

### Market Creation Workflow
```
1. Creator fills out CreateMarketModal (title, outcomes, end date, liquidity)
2. Frontend calls: factoryClient.create_market({ creator, question, resolution_time, oracle_id })
3. Factory contract deploys new Market instance with:
     - Initial YES / NO reserves (1,000,000,000 raw = 100 tokens each)
     - Protocol fee: 1% | Creator fee: 0.5%
4. Creator LP position recorded on-chain
5. Market appears in feed immediately
```

### Fee Distribution
```
1% Total Fee per Trade:
  ├── 50% → LP Pool (distributed to liquidity providers)
  ├── 30% → Market Creator
  └── 20% → Protocol Treasury
```

---

## 📜 Smart Contracts

### Market Contract (`contracts/market`)
The core AMM and market state machine.

**Public Functions:**
| Function | Description |
|---|---|
| `initialize(admin, token, factory, treasury)` | One-time contract setup |
| `create_market(creator, market_id, resolution_time, oracle_id)` | Creates a new market with initial reserves |
| `buy_shares(user, market_id, outcome, payment) → i128` | Buy YES/NO shares with constant-product AMM |
| `sell_shares(user, market_id, outcome, shares) → i128` | Sell shares back to AMM pool |
| `add_liquidity(user, market_id, amount) → i128` | Deposit XLM into pool |
| `remove_liquidity(user, market_id, amount) → i128` | Withdraw XLM from pool |
| `claim_winnings(user, market_id) → i128` | Claim payout on resolved market |
| `resolve_market(market_id, outcome)` | Oracle-signed market resolution |
| `lock_market(market_id)` | Lock after resolution timestamp |
| `get_balance(user, market_id, outcome) → i128` | Read on-chain share balance |
| `get_market_state(market_id) → MarketState` | Read full market state |

**AMM Pricing Formula (Constant Product):**
```
x · y = k

Buy YES:  shares_out = yes_reserves × payment / (no_reserves + payment)
Buy NO:   shares_out = no_reserves × payment / (yes_reserves + payment)

Sell YES: collateral = no_reserves × shares / (yes_reserves + shares)
Sell NO:  collateral = yes_reserves × shares / (no_reserves + shares)
```

### Market Factory Contract (`contracts/market_factory`)
Deploys and registers new market instances via `create_market()`.

### Oracle Contract (`contracts/oracle`)
Trusted oracle that calls `resolve_market()` to set the winning outcome.

### AMM Contract (`contracts/amm`)
Standalone AMM module for advanced liquidity calculations.

### Token Contract
Soroban-native token contract (SEP-41 compatible) for Mainnet USDC asset integration.

---

## 🚀 Installation

### Prerequisites
- **Node.js** ≥ 18
- **Rust** + `wasm32-unknown-unknown` target
- **Stellar CLI** (`cargo install --locked stellar-cli --features opt`)
- **Freighter Browser Extension** (Chrome/Firefox)

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/Riju79/predict-x.git
cd predict-x

# Install frontend dependencies
cd predict-x
npm install

# Build Soroban contracts
cd ..
cargo build --target wasm32-unknown-unknown --release
```

### Run Development Server

```bash
cd predict-x
npm run dev
```

Open [http://localhost:3000/app](http://localhost:3000/app)

### Build for Production

```bash
cd predict-x
npm run build
npm start
```

---

## 🔐 Environment Variables

Create `predict-x/.env.local`:

```env
# Stellar Network Config
NEXT_PUBLIC_STELLAR_NETWORK=public
NEXT_PUBLIC_SOROBAN_RPC_URL=https://mainnet.sorobanrpc.com
NEXT_PUBLIC_HORIZON_URL=https://horizon.stellar.org

# Deployed Smart Contract Addresses (Stellar Mainnet)
NEXT_PUBLIC_MARKET_CONTRACT_ID=CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL
NEXT_PUBLIC_FACTORY_CONTRACT_ID=CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL
NEXT_PUBLIC_ORACLE_CONTRACT_ID=CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ
NEXT_PUBLIC_AMM_CONTRACT_ID=CDPPM2LRO3RRO3TGP7NYTWPD2EPEJIJ6S6QHESMZCC5LSOPAZJRFCDZO
NEXT_PUBLIC_TOKEN_CONTRACT_ID=CCW67TSBWVENNVMTQPEXNGXYL6P5CZWKWZHB4CCKC2SCFYPPBZER5VKX
```

---

## 📦 Mainnet Deployment Guide

### Deploy Soroban Contracts to Stellar Mainnet

```bash
# Build target wasm32v1-none optimized WASM binaries
cargo build --target wasm32v1-none --release

# Upload & Deploy Oracle Contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/oracle.wasm \
  --source deployer-mainnet \
  --network mainnet \
  --inclusion-fee 100000

# Upload & Deploy AMM Pricing Contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/amm.wasm \
  --source deployer-mainnet \
  --network mainnet \
  --inclusion-fee 100000

# Upload & Deploy Market Factory / Trading Contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/market_factory.wasm \
  --source deployer-mainnet \
  --network mainnet \
  --inclusion-fee 100000
```

### Generate TypeScript Client Bindings

```bash
# Generate client bindings for Market Factory contract
stellar contract bindings typescript \
  --contract-id CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL \
  --network mainnet \
  --output-dir predict-x/src/bindings/factory
```

---

## 📍 Deployed Contract Addresses (Stellar Mainnet)

| Contract | Address / Contract ID | StellarExpert Mainnet Link |
|---|---|---|
| **Market Factory & Protocol State Machine** | `CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL` | [View on StellarExpert ↗](https://stellar.expert/explorer/public/contract/CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL) |
| **AMM Pricing Contract** | `CDPPM2LRO3RRO3TGP7NYTWPD2EPEJIJ6S6QHESMZCC5LSOPAZJRFCDZO` | [View on StellarExpert ↗](https://stellar.expert/explorer/public/contract/CDPPM2LRO3RRO3TGP7NYTWPD2EPEJIJ6S6QHESMZCC5LSOPAZJRFCDZO) |
| **Oracle Contract** | `CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ` | [View on StellarExpert ↗](https://stellar.expert/explorer/public/contract/CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ) |
| **Collateral Token (USDC)** | `CCW67TSBWVENNVMTQPEXNGXYL6P5CZWKWZHB4CCKC2SCFYPPBZER5VKX` | Stellar Mainnet Asset |

---

## 📸 Screenshots & Architecture Visuals

> *Connect your Freighter wallet, trade on Stellar Mainnet, view perps terminal, inspect on-chain Neon database analytics, and trade seamlessly on mobile!*

| 📊 Data Analytics (Neon Postgres DB) | 📱 Mobile Responsive UI |
|:---:|:---:|
| <img src="predict-x/public/screenshots/data-analytics.png" width="500" alt="Neon Postgres Data Analytics" /> | <img src="predict-x/public/screenshots/mobile-responsive.jpg" width="280" alt="Mobile Responsive UI" /> |
| **Real-time On-Chain Indexer**: Neon PostgreSQL tables (`px_portfolio`, `px_trades`, `px_markets`, `px_created_markets`, `px_lp_positions`) | **Mobile Responsive Interface**: Full mobile navbar, drawer, adaptive cards & mobile wallet guidance |

<br/>

| Landing page | Trading Interface | Market Detail |
|:---:|:---:|:---:|
| <img width="1918" height="1021" alt="Markets Feed" src="https://github.com/user-attachments/assets/3c7b8448-7ffd-4a89-b312-277a69736e8e" /> | <img width="1913" height="1021" alt="Screenshot 2026-07-28 031451" src="https://github.com/user-attachments/assets/8a6ac378-8fd5-4c93-ba1a-3837d2ffae5e" />
 | <img width="1918" height="1025" alt="Market Detail" src="https://github.com/user-attachments/assets/d496b793-3d8f-4418-97c5-501edab2a49a" /> |

---

## 🎥 Demo Video

> 📽️ **[Watch Full Demo →](https://youtu.be/I1hi_T5dujE?si=pOnHJtqk1yaiJnKa)** — See PredictX in action: wallet connect, market creation, buying/selling shares, and on-chain transaction confirmation.

---

## 🔄 User Feedback Changes & Git Commits

> 🌐 **Live Application**: [https://predict-x-gray.vercel.app/app](https://predict-x-gray.vercel.app/app)  
> 🧪 **Live Feedback Deployment**: [https://predict-fip0qirtm-rijurj84kly-beeps-projects.vercel.app/](https://predict-fip0qirtm-rijurj84kly-beeps-projects.vercel.app/)

The following tables document our early user onboarding process, user feedback summaries, and the corresponding code improvements implemented with associated Git commit IDs across protocol development iterations:

### 👥 Users Onboarded

| User ID | Name | Email | Wallet Address | Feedback Summary |
|---|---|---|---|---|
| USR-001 | Sadiya Mulani | sadiyamulani03@gmail.com | `GBTCGV43NLHEEBMCA5DWFZT6GOJYYCPHXNOEALTBQ7TREIQKQQAVLYT4` | Nothing,All good |
| USR-002 | riju das | riju.rj84kly@gmail.com | `GATVREHNDPNIKKWHHWSSEZIAGD6R6BLKCNHCWZOXDMHAA3MC2YIALED7` | nothing |
| USR-003 | rohit das | rohit.rj84kly@gmail.com | `GCM2IFWTWTFZCEDOZNK2EY6Z7ATJVU3VJKNOASDKOQTCB63PZPP35XI2` | just deploy on mainnet |
| USR-004 | shashwata mainak | shashwatamainak660@gmail.com | `GCTQKHCDEGW4JAOAMIA5A5STQZD6ZW7XMD7Z5373R7EZYYTFUU3SHZSN` | The project is beyond thoughts. |
| USR-005 | shivani jha | shivanijha.84kly@gmail.com | `GCKOEIEVTVNBW3QHVHM7S6LKB3A7YOXH6BSSAMGWWKXECEWCCMZNHV4Q` | nothing |
| USR-006 | Nidhi prajapati | prajapatinidhi.84kly@gmail.com | `GCVHUFQZCV2KBOJ6GAMSNL44IOHV7PIQRXRBWLPPW4BHOJ4WIK7SA2IW` | nothing. |
| USR-007 | Dhanu shree | Dhanushree.84k@gmail.com | `GCPBSX3IDE6EPMICEABVHTVP6G5P7EFLYCYIXXF3BUGPSJZK6BBIYOLO` | Deploy on mainnet |
| USR-008 | Arghya roy | arghyaroy.84kly@gmail.com | `GCHYQSNDVVU5CEC2CFCZRY3JJNM6MLIZAEANM27SSGPJHASQEQQRM7MZ` | Nothing |
| USR-009 | Polla vhisnu | pollavishnuv@gmail.com | `GABNUKFFSOGGZZUL4VFVAUCN5WQF5EESPLBHMWOYAGQ6D2NWRO7ZL6MR` | Nothing |
| USR-010 | Rita das | rita84kly@gmail.com | `GD5KLSM2KUTL3VO34BP5S3LG3HMUE2DKERMSEQDOPR5JPHW2UTMPMAK5` | The dapp is ready for mainnet production. |
| USR-011 | Debangon Pradhan | pradhandebangon2004@gmail.com | `GCIH6KJJ5PEAF2JCESTNOBSWGZC3R2FU7QGGDVGVRQXSEMZV4EXLSOAN` | The ui design is great , now waiting for see this deployed in mainnet |
| USR-012 | Rishi | Debangonpradhan1@gmail.com | `GCBEU53DM26XCFY34IVIHVSLFB34DPOPGNPJLGGHVHIL4W3WG3IHOHRW` | Great project. |
| USR-013 | Liya Kirtania | kirtanialiya@gmail.com | `GBYJMJDRPEBYDY3OK6JKAZTV6P6F2FYRBFNAMOKPJRNBP2W5JF5Q3C3Z` | The projects ui design is perfect |
| USR-014 | Chandan halder | chandanhalder1000@gmail.com | `GAOKFOQ7VPGXMPF3BCJHQRCIVDOZMQEGH4T673JJ5OBK6QOK24UJBDJ4` | with this prediction market trading will be more interesting |
| USR-015 | seyit ali değirmen | degirmenseyit@gmaili.com | `GDOCMYNNTH62NW37IZCN6BKQTM5Z73RW7OOFXRADLYXUABDN3UXWDTNC` | Overall, I liked the flow, the wallet-linking process, and the simplicity of the transactions. I haven't encountered any issues so far. |
| USR-016 | Priyangshu sarkar | priyangshusarkarofficial@gmail.com | `GBARWEKQI6WK2IVE3W6NOATF4YWFKMD6ZZPCIY2JW7FMSSE7DSWZZK7V` | Experience |
| USR-017 | Priyangshu sarkar | Priyangshuunoffcial@gmail.com | `GDFLU5667N4MM6GCIQHY7KCJJH7C7GLVQ5EKPRQIH2SGYF2WUBG63GLD` | Better tactics |
| USR-018 | Indranil islam | Malgaritheband@gmail.com | `GBHII2IXM7TDB4ZLR6ZCGZX4CQ5ADVI6R6DGGNRMWNEX6XKVYPKS4M3P` | The voice |
| USR-019 | Anay | santaanay03@gmail.com | `GD7G3K5WHHMS236BNOKGL5WALDEDLB4BROK7C6TGKRI7I64R2WISOBCS` | Deep Dive more into technicalities but with a basic approach so that it would more user friendly as well knowledgeable and usefu,Too much features also ruin a project and also less , find that misty spot 🙂 |
| USR-020 | Rohit das | rohit.rd84kly@gmail.com | `GAXQ2UZZAYF3ODVOJG4ZTAO253N75K55I32BNYL7QQPZZ5ICL4BFIUQE` | it is great |
| USR-021 | Ganesh das | ganesh.00gd@gmail.com | `GAXHRWT2X26LE5Y42Y5EUYYY6BQCDQEBUD6O26C26WQYX7PHWB5VWLJH` | Very unique project |
| USR-022 | Urjaa Sen | liyakirtania@gmail.com | `GAWWJJWXJ7C65HXMOJKU6INLOHJBLC7ASTOK3WDETTP2ET3BEBVHJBGO` | Great UI Design |
| USR-023 | Rick | rohit.rd84kly@gmail.com | `GBT2WOFXNDLDARBJL6QVAFE23PVTT37UBIVQ5DLZOBWJYKSSC56WI35N` | nothing |
| USR-024 | sumon | sumon79.r@gmail.com | `GDU3JE3IHNI2QW4LZHVIJB4JMXJA4JUD7N34D6CGUAQPMXLK4F7NDUOQ` | when i formerly open the in phone the mobile responssive ui was not that good ,but now i open the app to give the feedback now i see the ui has become great |
| USR-025 | Riya | riya.79gb@gmail.com | `GBINWHHA2WLLTHGKG6SCKQS2RKCXNWWGZMURBCGAAZDA2EYF5BFHHZPB` | very good workflow |
| USR-026 | Subho | subho.sg84@gmail.com | `GCZ36VNGWSPUYOOO76O77JNGQKQ4IMEWQJ7BL7KJDYRKBRRGC72CAVPJ` | nothing |
| USR-027 | sukanya | sukanyasarkar@gmail.com | `GB46QMTANN75OOIRK4GCZPLWMFG4GXWHV6H7QLSQOB2KXKQK7WSP5RSK` | very good work |
| USR-028 | sayan | sayanrick@gmail.com | `GDLL5B7EH4SS73UMTSOBPKC7WJK7T6G3ILQ2WW5J24RHN2F6Y7BDCUUP` | Nothig .everything seems perfect |
| USR-029 | bijay | bijaymaliya45@gmail.com | `GBZ4XSG4X64MESSWPUFJC5GCE2H3WTRSBVTL3ALOKECK52F4TH3IANPG` | All seems great |
| USR-030 | rayn | ryanwilliam@gmail.com | `GCZUYZOSZUKN5HEMKBYEWXKSUA2RSAHZLSWVVM7L4YTYEKTPPMVSTPHN` | the mobile ui was not that good as the desktop ui.now the mobile ui also seems perfect |
| USR-031 | Jack | jackphillips46@gmail.com | `GB3IPQIWTE7V56NGAGVQBNA3FEAQPU74OQX3XMRI7EO764DOTESFD2BI` | great work |
| USR-032 | kajal | kajalkukreja@gmail.com | `GCNTGVU5U2QGBTVETCOCTXLNW4W7KIRHRLAUWVAKCEYQAIFHHVZXFNZJ` | deploy on mainnet |
| USR-033 | Fredrick | fredrickwilliam23@gmail.com | `GB7C75TPCIQXLNBMQTAH4IINGSIYZYUTZKJZALMTOWXHPZHB3HNYIOJN` | waiting to see this on mainnet |
| USR-034 | Aishee | aisheekirtania@gmail.com | `GCUUIHE7URDRYDHV5FHPDLSUTW3HG235PA6FMPWBPKHLNRHWGTL6GQR2` | great workflow |
| USR-035 | Raghu | raghuram.47@gmail.com | `GCJSLVCHJ66OTBZTDEZ56KLMLDYBTXJWL4EJACVY7AGQTXXNK36BNG7I` | market creaton is great |
| USR-036 | sam | sambiswas89@gmail.com | `GDLCPWRLLF6YYROECGWWJE55CP3TG2KPQOT7OLGVJ2KD34RWL5OOGTE7` | very attractive ui design |
| USR-037 | Rinki | rinkitalukdar.12tg@gmail.com | `GABEG35ZKH5TH74GN6DB7W3YB6BTVPKUGLAURTQ6GAVXBJYHTSH7MXHG` | Nothing |
| USR-038 | koyel | koyelmodal.89@gmail.com | `GB5B6WFPHJMVKKMBSRIWMUCS6QSWCZ4OKNNXRCNTFVPWS5QAMPFHB2VC` | deploy on mainnet |
| USR-039 | Dibbo | dibbobiswas58@gmail.com | `GARUS2R3R6YZHSO5J2XMXNNL7P7HRBSEESMMHTV4Q2GVIMKOO6ZA7EY2` | nothig |
| USR-040 | aayan | aayandas.90kly@gmail.com | `GDNQHMEMMSV4S72KCJGRM53TVQNCZETWUTHSM6TKYR4MMRISPKD4UK5Y` | this really deserve insta reward |
| USR-041 | ayesha | ayeshakhatun.34@gmail.com | `GD6UNK2R3IRWAGVLQM7XVVX534IJ6XXAUNZAPOAXR5HRYN5OQRGV6MPJ` | absolute prediction market project on stellar |
| USR-042 | raj kumar | rajkumar78@gmail.com | `GDSQNTNBQ2IGKRNC3QIUDVPO2BBIHAEMHF2YFDHD3WFMU2L4U7XPQKWK` | Nothing. great thecnicalities. |
| USR-043 | Raja | rajasingh.24pnb@gmail.com | `GCLSXFDX3PFTOOKUNGBIT2HW6QBDTOD7ZYCMJ3TY5L2W3ZYYK5APPS6J` | everything looks production level |
| USR-044 | sanu | biswassanu.89kly@gmail.com | `GDECRH4ABA62RDFW4TXC4NJL2J5JK7HI4ECRU2PWMSKFZ3DRZFGKI4DY` | very good work. |
| USR-045 | jack | jackhome.43@gmail.com | `GBG4X7T6I4UUDJO644PDWS46HYKOA6QVT7LTBI4NMCUVV5MKPY5ZQNBP` | Nothing |
| USR-046 | raghu | das009.kly@gmail.com | `GCN5CBZCIUWN7NAZUIH67PYZEF4IDO4SVFJYKNBVSQOMXKS7QHQCLYT5` | great ui |
| USR-047 | Rahul | Rahulmondal.008@gmail.com | `GB5DTJHLII5QQ36RTTLMDUSQZD5KTFQG4NPWDISVPG3XA4B2IIOSSMU3` | no problem faced yet. |
| USR-048 | Aareya | aareya006.@gmail.com | `GBFK2R5UWDYIBMM4CTNFCT7UVFNGSH2DVCAZRDL2S572VHDIJBNA6TP4` | overall everything works good. |
| USR-049 | Bibek | Bibekmondal.56@gmail.com | `GBQW4VULQH6KKHCMILGJUL22IE54JWYQVDSUKN4RSWCKQ65PIQRJ6EYE` | everthing run flowlessly. |
| USR-050 | Aakash | skyakash009@gmail.com | `GD4J2HT3T6445GF2OJGOAHC6VPFRGI7QAJRFRO454TXUJNXOFRXEFMOD` | very great arcitecture |
| USR-051 | Samya | debsamya.04@gmail.com | `GCUVMJUOELOSNJXF4TGU3IT26HUJ5VWL3XHBO2XUF22JTOSW2ZTM4GCP` | great project |
| USR-052 | Aninda | anindarank004@gmail.com | `GAORTO5SKNQ6TCPCYK7UHTORWK2RS6G64TRTRHPDXQYYJCGQHYBIRNQM` | according to my pov everything goes in a good way |

<br/>

### 🛠️ Feedback Implementation

| User ID | Name | Email | Wallet Address | Feedback Summary | Improvement Made | Git Commit ID |
|---|---|---|---|---|---|---|
| USR-024 | sumon | sumon79.r@gmail.com | `GDU3JE3IHNI2QW4LZHVIJB4JMXJA4JUD7N34D6CGUAQPMXLK4F7NDUOQ` | when i formerly open the in phone the mobile responssive ui was not that good ,but now i open the app to give the feedback now i see the ui has become great | Added full tablet and mobile responsive layout & hamburger slide-in menu | [`9a1e963`](https://github.com/Riju79/predict-x/commit/9a1e963) |
| USR-030 | rayn | ryanwilliam@gmail.com | `GCZUYZOSZUKN5HEMKBYEWXKSUA2RSAHZLSWVVM7L4YTYEKTPPMVSTPHN` | the mobile ui was not that good as the desktop ui.now the mobile ui also seems perfect | Added dedicated mobile Freighter connection workflow, device detection router & return state restoration | [`40a8ca9`](https://github.com/Riju79/predict-x/commit/40a8ca9) |
| USR-015 | seyit ali değirmen | degirmenseyit@gmaili.com | `GDOCMYNNTH62NW37IZCN6BKQTM5Z73RW7OOFXRADLYXUABDN3UXWDTNC` | Overall, I liked the flow, the wallet-linking process, and the simplicity of the transactions. I haven't encountered any issues so far. | Rebuilt mobile Freighter integration from scratch adhering strictly to official SDF specs | [`1be22cc`](https://github.com/Riju79/predict-x/commit/1be22cc) |
| USR-011 | Debangon Pradhan | pradhandebangon2004@gmail.com | `GCIH6KJJ5PEAF2JCESTNOBSWGZC3R2FU7QGGDVGVRQXSEMZV4EXLSOAN` | The ui design is great , now waiting for see this deployed in mainnet | Replaced localStorage indexer with Neon Postgres database for multi-user trade analytics | [`1383d02`](https://github.com/Riju79/predict-x/commit/1383d02) |
| USR-003 | rohit das | rohit.rj84kly@gmail.com | `GCM2IFWTWTFZCEDOZNK2EY6Z7ATJVU3VJKNOASDKOQTCB63PZPP35XI2` | just deploy on mainnet | Updated live app deployment link (`https://predict-x-gray.vercel.app/app`) in README.md | [`f4feabd`](https://github.com/Riju79/predict-x/commit/f4feabd) |
| USR-013 | Liya Kirtania | kirtanialiya@gmail.com | `GBYJMJDRPEBYDY3OK6JKAZTV6P6F2FYRBFNAMOKPJRNBP2W5JF5Q3C3Z` | The projects ui design is perfect | Added Data Analytics & Mobile Responsive screenshots and user feedback commit section to README | [`2f723ac`](https://github.com/Riju79/predict-x/commit/2f723ac) |
| USR-019 | Anay | santaanay03@gmail.com | `GD7G3K5WHHMS236BNOKGL5WALDEDLB4BROK7C6TGKRI7I64R2WISOBCS` | Deep Dive more into technicalities but with a basic approach so that it would more user friendly as well knowledgeable and usefu,Too much features also ruin a project and also less , find that misty spot 🙂 | Cleaned up redundant components and organized modular desktop/mobile wallet architecture | [`8555cd1`](https://github.com/Riju79/predict-x/commit/8555cd1) |
| USR-035 | Raghu | raghuram.47@gmail.com | `GCJSLVCHJ66OTBZTDEZ56KLMLDYBTXJWL4EJACVY7AGQTXXNK36BNG7I` | market creaton is great | Added Freighter detection timeout, InstallWalletModal, and fixed landing navbar mobile layout | [`751f427`](https://github.com/Riju79/predict-x/commit/751f427) |
| USR-042 | raj kumar | rajkumar78@gmail.com | `GDSQNTNBQ2IGKRNC3QIUDVPO2BBIHAEMHF2YFDHD3WFMU2L4U7XPQKWK` | Nothing. great thecnicalities. | Revised README with new links, installation guide, and demo video reference | [`6212257`](https://github.com/Riju79/predict-x/commit/6212257) |
| USR-050 | Aakash | skyakash009@gmail.com | `GD4J2HT3T6445GF2OJGOAHC6VPFRGI7QAJRFRO454TXUJNXOFRXEFMOD` | very great arcitecture | Revised README for landing page and mobile updates with visual architecture schematics | [`17891db`](https://github.com/Riju79/predict-x/commit/17891db) |
| USR-010 | Rita das | rita84kly@gmail.com | `GD5KLSM2KUTL3VO34BP5S3LG3HMUE2DKERMSEQDOPR5JPHW2UTMPMAK5` | The dapp is ready for mainnet production. | Updated feedback sheet links and formatting in README | [`fffc733`](https://github.com/Riju79/predict-x/commit/fffc733) |
| USR-002 | riju das | riju.rj84kly@gmail.com | `GATVREHNDPNIKKWHHWSSEZIAGD6R6BLKCNHCWZOXDMHAA3MC2YIALED7` | nothing | Fix deep link navigation to prevent browser 404 page & add Copy URL button for Freighter in-app browser | [`3bde623`](https://github.com/Riju79/predict-x/commit/3bde623) |
| USR-004 | shashwata mainak | shashwatamainak660@gmail.com | `GCTQKHCDEGW4JAOAMIA5A5STQZD6ZW7XMD7Z5373R7EZYYTFUU3SHZSN` | The project is beyond thoughts. | Implement official Freighter dApp browser guidance flow, eliminate invalid deep link Safari error | [`a7f3c5b`](https://github.com/Riju79/predict-x/commit/a7f3c5b) |
| USR-040 | aayan | aayandas.90kly@gmail.com | `GDNQHMEMMSV4S72KCJGRM53TVQNCZETWUTHSM6TKYR4MMRISPKD4UK5Y` | this really deserve insta reward | Fix mobile-wallet add direct Freighter Mobile deep link & universal link launcher buttons | [`852f9a3`](https://github.com/Riju79/predict-x/commit/852f9a3) |
| USR-052 | Aninda | anindarank004@gmail.com | `GAORTO5SKNQ6TCPCYK7UHTORWK2RS6G64TRTRHPDXQYYJCGQHYBIRNQM` | according to my pov everything goes in a good way | Add commit 8555cd1 to README.md user feedback section | [`63a7bb3`](https://github.com/Riju79/predict-x/commit/63a7bb3) |


---

## 🗺️ Future Improvements

- [ ] **Mainnet Deployment** — Deploy to Stellar Public Network after audit
- [ ] **Multi-Outcome Markets** — Full support for election-style markets with 3+ candidates
- [ ] **Oracle Integration** — Chainlink-compatible oracle feeds for automated resolution
- [ ] **Governance Token (PX)** — Protocol governance and fee-share token
- [ ] **Mobile App** — React Native app with Freighter Mobile wallet support
- [ ] **Cross-Chain Bridges** — Bring liquidity from Ethereum and Solana via Stellar DEX
- [ ] **Market Dispute System** — On-chain dispute resolution for contested market results
- [ ] **Liquidity Mining** — PX token rewards for early liquidity providers
- [ ] **API / SDK** — Public REST API and TypeScript SDK for third-party integrations
- [ ] **Leaderboard** — On-chain profit/loss tracking with public rankings

---

## 💬 Feedback & Community

We're actively gathering feedback from early users to improve PredictX.

<div align="center">

### 📋 [Submit Feedback & Feature Requests](https://forms.gle/SyWZnynTtpWFPG7j8)
[📄 FEEDBACK SHEET](https://docs.google.com/spreadsheets/d/1BEMWSMzzhpb87IglygYy2K7EfSFIu_AuMIC2cH_ghGw/edit?resourcekey=&gid=60851251#gid=60851251) · [🌐 Live Feedback Build](https://predict-fip0qirtm-rijurj84kly-beeps-projects.vercel.app/)

*Your feedback directly shapes the protocol's development roadmap.*

</div>


---

## 📁 Repository Structure

```
predict-x/
├── contracts/
│   ├── market/            # Core AMM + market state machine (Rust)
│   ├── market_factory/    # Market deployment factory (Rust)
│   ├── amm/               # Standalone AMM module (Rust)
│   └── oracle/            # Oracle resolution contract (Rust)
├── predict-x/    # Next.js 16 frontend
│   ├── app/
│   │   ├── app/           # Main dashboard & page
│   │   │   └── components/  # TradingDrawer, SellSharesModal, etc.
│   │   └── globals.css
│   ├── src/
│   │   ├── bindings/      # Auto-generated Soroban TypeScript clients
│   │   ├── config/        # Stellar SDK config, raw amount helpers
│   │   ├── wallet/        # WalletProvider, Freighter integration
│   │   └── backend/       # Persistent localStorage indexer (db.ts)
│   └── scripts/           # Contract testing & verification scripts
├── deployed-contracts.json # Live contract addresses
├── Cargo.toml             # Rust workspace
└── README.md
```

---

## 📄 License

```
MIT License

Copyright (c) 2026 PredictX

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

## 📢 Product Marketing & Community Hub

<div align="center">

<a href="https://x.com/predict_x79">
  <img src="https://img.shields.io/badge/Follow%20on%20Twitter-@predict__x79-1DA1F2?style=for-the-badge&logo=x&logoColor=white" alt="Twitter / X Follow" />
</a>
<a href="https://github.com/Riju79/predictX">
  <img src="https://img.shields.io/badge/GitHub%20Repository-Riju79%2FpredictX-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository" />
</a>

<br/>
<br/>

### 🌐 Join the Future of Decentralized Prediction Markets on Stellar!

PredictX bridges real-world intelligence with automated market makers on Stellar Soroban Mainnet. Stay connected with our growing community and follow our latest protocol updates:

| Channel | Link | Description |
|---|---|---|
| 𝕏 **Twitter / X Account** | [**@predict_x79**](https://x.com/predict_x79) | Official protocol announcements, mainnet updates, & market drop alerts |
| 🐙 **GitHub Repository** | [**Riju79/predictX**](https://github.com/Riju79/predictX) | Open-source smart contract code, frontend dApp, & contribution guidelines |
| 🌐 **Live Web Application** | [**predict-x-gray.vercel.app**](https://predict-x-gray.vercel.app/app) | Mainnet prediction trading terminal & liquidity pools |
| 📋 **Community Feedback** | [**Google Form**](https://forms.gle/SyWZnynTtpWFPG7j8) · [**Responses Sheet**](https://docs.google.com/spreadsheets/d/1BEMWSMzzhpb87IglygYy2K7EfSFIu_AuMIC2cH_ghGw/edit?resourcekey=&gid=60851251#gid=60851251) | Early user onboarding & feedback portal |
| 📽️ **Video Demonstration** | [**YouTube Demo**](https://youtu.be/I1hi_T5dujE?si=pOnHJtqk1yaiJnKa) | Complete walkthrough of PredictX trading & AMM mechanics |
| 📄 **Protocol Slide Deck** | [**Presentation Deck**](https://predictx-presentation.vercel.app/) | Architectural overview & tokenomics presentation |

</div>

---

<div align="center">

**Built with ❤️ on Stellar Soroban**

[⭐ Star this repo](https://github.com/Riju79/predictX) · [𝕏 Follow @predict_x79](https://x.com/predict_x79) · [📋 Leave Feedback](https://forms.gle/SyWZnynTtpWFPG7j8) · [🐛 Report a Bug](https://github.com/Riju79/predictX/issues)

<sub>PredictX is deployed live on Stellar Mainnet (Public Global Network).</sub>

</div>
