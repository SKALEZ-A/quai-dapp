# Problem

> In Web3 today, users struggle with a fragmented and complicated experience where social interaction, wallet creation, and cross-chain asset transfers all require separate tools and platforms, creating friction, confusion, and barriers for both new and existing users.
> 

---

# 💭 Proposal

> We’re building a social dApp on Quai that makes interaction simple and seamless. Users can connect, chat, and transact directly inside the app with an inbuilt cross-chain bridge for effortless asset transfers, while every user enjoys a human-readable identity through the Quai Name Service (QNS).
> 

---

# 🛫 Goals and success metrics

> 
> 
> 
> **Early Stage (Launch & Adoption)**
> 
> - Number of new wallet activations (via the dApp)
> - Number of QNS domains registered
> - Monthly Active Users (MAU) and Daily Active Users (DAU)
> - User retention rate (e.g., % of users still active after 30 days)
> 
> **Growth Stage (Engagement & Expansion)**
> 
> - Number of messages, posts, or interactions made within the app
> - Average time spent per session
> - Number of friend connections or groups created
> - On-chain social transactions (tips, payments, NFT sharing)
> - Volume of assets bridged through the inbuilt bridge
> - Number of unique chains users interact with via the bridge
> - Transaction success rate and speed across chains
> 
> **Maturity Stage (Ecosystem & Sustainability)**
> 
> - Growth in Quai ecosystem wallets tied to QNS
> - Number of dApps or partners integrating with your social identity layer
> - Collaborations or campaigns with other L1s/L2s to drive bridging usage
> - Revenue from domain registrations (QNS)
> - Fees or spreads earned from bridging transactions
> - Cost per user acquisition (CPA)

---

**QNS Name Service (QNS)**

# **Overview**

QNS is the domain naming service for the Qi ecosystem, designed to provide fair access to namespace, prevent impersonation, support multi-network expansion, and enable seamless payment integration. The system blends proven standards (ENS mechanisms) with novel features (Qi payment resolver, collateralized locks).

# **Key Features**

**1. Reverse Dutch Auction (3–7 character names)**

- Purpose: Fair and efficient allocation of premium, short domains.
- Mechanism:
    - Auction starts at a high price, decreasing over time until purchased.
    - Price curve is exponential or piecewise linear, with a configurable start and floor price.
    - Uses commit/reveal to prevent mempool sniping.
- 
- Outcome: Names are fairly priced and sybil-resistant.

**2. Reserved Names (corporations, governments)**

- Purpose: Protect high-profile entities from impersonation.
- Mechanism:
    - Reserved names are curated in an on-chain registry.
    - Verified entities can claim via an authorization process.
    - Governance can add/remove reserved entries.
- 
- Outcome: Protects brand integrity and increases system credibility.

**3. Upgradeability + Global Data Store**

- Purpose: Ensure QNS remains extensible and works across shards/networks.
- Mechanism:
    - Proxy pattern (UUPS/Transparent) for all core contracts.
    - Canonical QNSRegistry storing ownership, resolver, and TTL.
    - Global identifiers for names to sync across shards or L2s.
- 
- Outcome: Supports long-term scalability and cross-network interoperability.

**4. Qi Payment Code Resolver**

- Purpose: Enable payments and identity resolution via Qi payment codes.
- Mechanism:
    - Forward lookup: domain.qns → Qi payment code.
    - Reverse lookup: Qi payment code → domain.qns.
    - Managed by QiResolver and QiReverseRegistry.
- 
- Outcome: Users can send or verify payments by either domain name or Qi code.

**5. Commit/Reveal Minting**

- Purpose: Prevent front-running when purchasing or registering names.
- Mechanism:
    - Step 1: User submits a hash commitment (includes name, salt, optional max price).
    - Step 2: User reveals within a time window; contract validates and mints if available.
- 
- Outcome: Protects buyers from mempool attacks and ensures fairness.

**6. Lock-Based Economics (Optional Extension)**

- Purpose: Discourage squatting and add capital costs to high-value domains.
- Mechanism:
    - Winner of an auction locks tokens (equal to second price or Dutch price).
    - Locked tokens are returned at expiry or renewal.
    - Governance may slash tokens for malicious use (e.g., phishing).
- 
- Outcome: Premium domains remain capital-intensive, reducing squat risk.

# **Lifecycle**

1. Registration
    - 3–7 chars: Reverse Dutch auction + commit/reveal.
    - 8+ chars: Fixed price + commit/reveal.
    - Reserved names: Governance/authorization required.
2. 
3. Renewal
    - Option A: Rent-based (annual fee).
    - Option B: Lock-based (must maintain collateral).
    - Includes grace period and premium redemption window.
4. 
5. Transfer
    - Domains represented as NFTs (ERC-721/1155).
    - Transfers update ownership; resolver state persists.
6. 
7. Resolution
    - Forward (domain → Qi code, addresses, metadata).
    - Reverse (Qi code → domain).
8. 

# **Governance & Safety**

- Governance Controls:
    - Add/remove reserved names.
    - Adjust price curve parameters.
    - Approve upgrades to core contracts.
- 
- Security Features:
    - Timelocked upgrades with community review.
    - Commit/reveal scheme against mempool sniping.
    - Transparent events for all key actions (commits, reveals, mints, renewals).
- 

# **Suggested Default Parameters**

- Auction duration: 7 days.
- Price curves:
    - 3-char: start 20,000 QI → floor 1,000 QI.
    - 4-char: start 10,000 QI → floor 500 QI.
    - 5–7 char: start 5,000 QI → floor 200
- Commit delays: Min 5 mins, Max 24 hrs.
- Renewal grace period: 28 days.
- Premium redemption period: 21 days.

---

# Features and Requirements

- QNS ( Quai Name Service )
- A bridge that supports Quai Network and can communicate with other L1s and L2s
- A social dapp that let’s users interact with the Quai community onchain

---

# User Flow

- Users get directed to a web page when they click the page link
- They the see a call to action to either test the social dapp or bridge / get their QNS
- They get a call to action to connect their pelagus/ metamask wallet to get full access to the whole platforms

---

# TIMELINE ( 1month )

| Phase | Tasks | Duration  |
| --- | --- | --- |
| Phase 1: Discovery  | Research, getting necessary APIs and Docs needed to build | August 21 - 25 |
| Phase 2: Product build ( UI ) | Build design templates and necessary wireframes before the front end comes in | August 25 - September 10 |
| Phase 3: Front end build and smart contract integration  | Build the front end for the product and make the necessary smart contracts connections | September 10 - 30 |
| Phase 4: Beta testing phase | Private test within team members + a small beta testing community  | October 1-5 |
| Grant application  | Apply for 20k$+ grant from QUAI network to scale our product  | Completely dependent on the ecosystem  |

---

# REFERENCES

- Social dapp: https://mysphere.fun/basechat/
- Bridge: https://owlto.finance/?ref=0x6193c0211c582840bd0D1b95e0eFae2E4CB3F7fF
- QNS: https://www.qnsdomains.com/

---

# Questions

- should we make it an all in one place ( a 3 in 1 dapp) ? Or 3 separate products in one website
-