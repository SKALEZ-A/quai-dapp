"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRICING = void 0;
exports.getDomainPrice = getDomainPrice;
exports.formatDomainName = formatDomainName;
exports.stripDomainSuffix = stripDomainSuffix;
exports.nameToNode = nameToNode;
exports.checkDomainAvailability = checkDomainAvailability;
exports.getOnchainPrice = getOnchainPrice;
exports.validateRegistration = validateRegistration;
exports.registerDomain = registerDomain;
exports.getUserDomains = getUserDomains;
exports.startDomainAuction = startDomainAuction;
exports.getAuctionInfo = getAuctionInfo;
exports.placeBid = placeBid;
exports.resolveDomainToAddress = resolveDomainToAddress;
exports.sendFundsToDomain = sendFundsToDomain;
// QNS blockchain interaction utilities
const quais_1 = require("quais");
const quai_1 = require("./quai");
const contracts_1 = require("./contracts");
const transactionManager_1 = require("./transactionManager");
const errorHandler_1 = require("./errorHandler");
// Helper functions for ether conversion
function parseEther(value) {
    return BigInt(Math.floor(parseFloat(value) * 1e18));
}
function formatEther(value) {
    return (Number(value) / 1e18).toFixed(4);
}
// Domain pricing based on length - AFFORDABLE PRICING (5/20/50 QUAI)
exports.PRICING = {
    3: { price: '50', display: '50 QUAI' }, // Much more affordable for 3-char domains
    4: { price: '20', display: '20 QUAI' }, // Much more affordable for 4-char domains
    5: { price: '5', display: '5 QUAI' }, // Very affordable for 5+ char domains
    6: { price: '5', display: '5 QUAI' }, // Very affordable for 5+ char domains
    7: { price: '5', display: '5 QUAI' }, // Very affordable for 5+ char domains
    default: { price: '5', display: '5 QUAI' }, // Very affordable default
};
function getDomainPrice(name) {
    const length = name.length;
    // 3-7 chars can use auction OR instant buy
    // 8+ chars are instant buy only
    const needsAuction = length >= 3 && length <= 7 ? false : false; // We're making instant buy default
    if (length >= 3 && length <= 7) {
        const pricing = exports.PRICING[length];
        return { ...pricing, needsAuction };
    }
    return { ...exports.PRICING.default, needsAuction };
}
// Domain utility functions for .quai suffix handling
function formatDomainName(name) {
    // Always append .quai suffix for display, removing any existing .qns suffix
    const cleanName = name.toLowerCase().trim();
    // Remove .qns suffix if present
    if (cleanName.endsWith('.qns')) {
        const withoutQns = cleanName.slice(0, -4); // Remove '.qns'
        return `${withoutQns}.quai`;
    }
    // Remove .quai suffix if present (to avoid duplication)
    if (cleanName.endsWith('.quai')) {
        return cleanName;
    }
    return `${cleanName}.quai`;
}
function stripDomainSuffix(name) {
    // Remove both .quai and .qns suffixes before blockchain queries
    const cleanName = name.toLowerCase().trim();
    if (cleanName.endsWith('.quai')) {
        return cleanName.slice(0, -5); // Remove '.quai'
    }
    if (cleanName.endsWith('.qns')) {
        return cleanName.slice(0, -4); // Remove '.qns'
    }
    return cleanName;
}
// Convert domain name to node hash (namehash)
function nameToNode(name) {
    // Strip .quai suffix before hashing
    const cleanName = stripDomainSuffix(name);
    return (0, quais_1.keccak256)((0, quais_1.toUtf8Bytes)(cleanName));
}
// Check if domain is available
async function checkDomainAvailability(name) {
    try {
        console.log('Checking domain availability for:', name);
        console.log('RPC URL:', contracts_1.RPC_URL);
        console.log('NFT Contract:', contracts_1.CONTRACTS.QNS_NFT);
        console.log('Registry Contract:', contracts_1.CONTRACTS.QNS_REGISTRY);
        const provider = (0, quai_1.makeProvider)(contracts_1.RPC_URL);
        const nftContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_NFT, contracts_1.QNS_NFT_ABI, provider);
        const registryContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_REGISTRY, contracts_1.QNS_REGISTRY_ABI, provider);
        const registrarContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_REGISTRAR, contracts_1.QNS_REGISTRAR_ABI, provider);
        const node = nameToNode(name);
        console.log('Node hash:', node);
        // Add timeout to contract calls
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Contract call timeout')), 10000); // 10 second timeout
        });
        // Primary: use registrar.available
        let isAvailable;
        try {
            console.log('Calling available() on Registrar...');
            isAvailable = await Promise.race([
                registrarContract.available(node),
                timeoutPromise
            ]);
        }
        catch (primaryErr) {
            console.warn('Registrar.available failed, falling back to NFT.exists:', primaryErr?.message);
        }
        // Fallback: use NFT.exists if registrar check failed
        if (typeof isAvailable === 'undefined') {
            console.log('Calling exists() on NFT contract as fallback...');
            const exists = await Promise.race([
                nftContract.exists(node),
                timeoutPromise
            ]);
            isAvailable = !exists;
        }
        if (!isAvailable) {
            // Get owner from registry (best effort)
            let owner = undefined;
            try {
                console.log('Getting owner from registry...');
                owner = await Promise.race([
                    registryContract.ownerOf(node),
                    timeoutPromise
                ]);
                console.log('Domain owner:', owner);
            }
            catch (ownerErr) {
                console.warn('Failed to fetch owner for taken domain:', ownerErr?.message);
            }
            return {
                available: false,
                owner,
                node,
            };
        }
        console.log('Domain appears available');
        return {
            available: true,
            node,
        };
    }
    catch (error) {
        console.error('Error checking availability:', error);
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            reason: error?.reason,
        });
        // Do NOT default to available=true on timeouts; surface error instead
        throw new Error(`Failed to check domain availability: ${error?.message || 'Unknown error'}`);
    }
}
async function getOnchainPrice(name, providerOrSigner) {
    const registrar = new quais_1.Contract(contracts_1.CONTRACTS.QNS_REGISTRAR, contracts_1.QNS_REGISTRAR_ABI, providerOrSigner);
    const priceWei = await registrar.getPrice(name);
    const priceDisplay = formatEther(priceWei) + ' QI';
    return { priceWei, priceDisplay };
}
/**
 * Validate registration before attempting transaction
 */
async function validateRegistration(name, userAddress, signer) {
    const issues = [];
    try {
        if (!contracts_1.CONTRACTS.QNS_REGISTRAR) {
            issues.push('QNS Registrar not deployed');
            return { canRegister: false, issues };
        }
        const node = nameToNode(name);
        const registrarContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_REGISTRAR, contracts_1.QNS_REGISTRAR_ABI, signer);
        // Get on-chain price
        const priceWei = await registrarContract.getPrice(name);
        // Check balance
        const balance = await signer.provider.getBalance(userAddress);
        if (balance < priceWei) {
            issues.push(`Insufficient balance. Need ${formatEther(priceWei)} QI but have ${formatEther(balance)} QI`);
        }
        // Check availability
        const isAvailable = await registrarContract.available(node);
        if (!isAvailable) {
            issues.push('Domain not available or reserved');
        }
        // Try to estimate gas
        let estimatedGas;
        try {
            estimatedGas = await registrarContract.register.estimateGas(name, node, { value: priceWei });
        }
        catch (gasError) {
            console.warn('Gas estimation failed during validation:', gasError?.message);
        }
        return {
            canRegister: issues.length === 0,
            issues,
            estimatedGas,
            estimatedCost: formatEther(priceWei) + ' QI'
        };
    }
    catch (error) {
        errorHandler_1.errorHandler.logError(error, {
            operation: 'validateRegistration',
            domainName: name,
            userAddress
        }, 'warn');
        issues.push(`Validation error: ${error?.message || 'Unknown error'}`);
        return { canRegister: false, issues };
    }
}
// Register domain directly (instant purchase) - Enhanced version
async function registerDomain(name, signer, options) {
    const opts = {
        maxRetries: 3,
        validateFirst: true,
        onProgress: (status) => console.log(status),
        ...options
    };
    try {
        opts.onProgress('Starting domain registration...');
        if (!contracts_1.CONTRACTS.QNS_REGISTRAR) {
            const error = 'QNS Registrar not deployed yet. Please redeploy contracts.';
            errorHandler_1.errorHandler.logError(new Error(error), {
                operation: 'registerDomain',
                domainName: name
            }, 'error');
            return { success: false, error };
        }
        const userAddress = await signer.getAddress();
        const node = nameToNode(name);
        const registrarContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_REGISTRAR, contracts_1.QNS_REGISTRAR_ABI, signer);
        // Fetch on-chain price and use it for tx value
        const priceWei = await registrarContract.getPrice(name);
        try {
            const network = await signer.provider?.getNetwork();
            console.log('Network info:', {
                chainId: network?.chainId?.toString(),
                name: network?.name
            });
        }
        catch (netError) {
            console.warn('Could not get network info:', netError);
        }
        console.log('Domain registration details:', {
            name,
            node,
            price: priceWei.toString(),
            priceDisplay: formatEther(priceWei) + ' QI',
            userAddress,
            contractAddress: contracts_1.CONTRACTS.QNS_REGISTRAR
        });
        if (!registrarContract.runner) {
            const error = 'Contract not connected to signer';
            console.error('❌ Contract runner is null');
            return { success: false, error };
        }
        if (opts.validateFirst) {
            opts.onProgress('Validating registration...');
            const validation = await validateRegistration(name, userAddress, signer);
            if (!validation.canRegister) {
                const error = validation.issues.join('; ');
                errorHandler_1.errorHandler.logError(new Error(error), {
                    operation: 'registerDomain',
                    domainName: name,
                    userAddress,
                    validationIssues: validation.issues
                }, 'warn');
                return { success: false, error };
            }
            console.log('Pre-flight validation passed');
        }
        // Execute transaction with on-chain price
        opts.onProgress('Preparing transaction...');
        console.log('🔵 About to call transactionManager.executeTransaction with:', {
            contract: contracts_1.CONTRACTS.QNS_REGISTRAR,
            method: 'register',
            args: [name, node],
            value: priceWei.toString(),
            maxRetries: opts.maxRetries
        });
        const result = await transactionManager_1.transactionManager.executeTransaction(registrarContract, 'register', [name, node], {
            maxRetries: opts.maxRetries,
            onProgress: opts.onProgress,
            value: priceWei,
            gasLimitMultiplier: 1.5
        });
        if (result.success) {
            console.log('Domain registered successfully:', result.txHash);
            return {
                success: true,
                txHash: result.txHash
            };
        }
        else {
            const errorMsg = result.error?.userMessage || 'Registration failed';
            const suggestion = result.error?.suggestion;
            const fullError = suggestion ? `${errorMsg} ${suggestion}` : errorMsg;
            return {
                success: false,
                error: fullError
            };
        }
    }
    catch (error) {
        const parsed = errorHandler_1.errorHandler.parseError(error, {
            operation: 'registerDomain',
            domainName: name,
            contractAddress: contracts_1.CONTRACTS.QNS_REGISTRAR
        });
        errorHandler_1.errorHandler.logError(error, {
            operation: 'registerDomain',
            domainName: name
        }, 'error');
        const errorMsg = parsed.userMessage;
        const suggestion = parsed.suggestion;
        const fullError = suggestion ? `${errorMsg} ${suggestion}` : errorMsg;
        return {
            success: false,
            error: fullError
        };
    }
}
// Get user's domains
async function getUserDomains(address) {
    try {
        console.log('Fetching domains for address:', address);
        const provider = (0, quai_1.makeProvider)(contracts_1.RPC_URL);
        const nftContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_NFT, contracts_1.QNS_NFT_ABI, provider);
        const registryContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_REGISTRY, contracts_1.QNS_REGISTRY_ABI, provider);
        const userDomains = [];
        // First attempt: query NameMinted events filtered by owner
        try {
            // Event signature: NameMinted(bytes32 indexed node, uint256 indexed tokenId, address indexed owner)
            const eventSig = 'NameMinted(bytes32,uint256,address)';
            const topic0 = (0, quais_1.keccak256)((0, quais_1.toUtf8Bytes)(eventSig));
            const ownerTopic = '0x' + '0'.repeat(24) + address.toLowerCase().replace(/^0x/, '');
            // Use recent block range to avoid "filter range exceeds maximum limit" error
            const currentBlock = await (0, quai_1.getBlockNumber)(provider);
            const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks
            const toBlock = 'latest';
            console.log('Querying logs for NameMinted events...', { topic0, ownerTopic, fromBlock, toBlock });
            // Use raw RPC call with cyprus1 shard to avoid "getLogs can only be called in zone chain" error
            const logs = await provider.send('eth_getLogs', [{
                    address: contracts_1.CONTRACTS.QNS_NFT,
                    topics: [topic0, null, null, ownerTopic],
                    fromBlock: '0x' + fromBlock.toString(16),
                    toBlock: toBlock === 'latest' ? 'latest' : '0x' + toBlock.toString(16)
                }], 'cyprus1');
            console.log('Found logs:', logs.length);
            // If no logs found in recent range, try a broader range in chunks
            let allLogs = logs;
            if (logs.length === 0) {
                console.log('No recent logs found, trying broader range in chunks...');
                const chunkSize = 5000; // Smaller chunks to avoid limit
                const olderFromBlock = Math.max(0, currentBlock - 50000); // Go back 50k blocks
                for (let start = olderFromBlock; start < currentBlock; start += chunkSize) {
                    const end = Math.min(start + chunkSize - 1, currentBlock);
                    try {
                        console.log(`Querying chunk: ${start} to ${end}`);
                        const chunkLogs = await provider.send('eth_getLogs', [{
                                address: contracts_1.CONTRACTS.QNS_NFT,
                                topics: [topic0, null, null, ownerTopic],
                                fromBlock: '0x' + start.toString(16),
                                toBlock: '0x' + end.toString(16)
                            }], 'cyprus1');
                        allLogs = allLogs.concat(chunkLogs);
                        console.log(`Found ${chunkLogs.length} logs in chunk ${start}-${end}`);
                    }
                    catch (error) {
                        console.warn(`Failed to query chunk ${start}-${end}:`, error);
                        break; // Stop if we hit an error
                    }
                }
            }
            const seenNodes = new Set();
            for (const log of allLogs) {
                try {
                    const node = log.topics?.[1];
                    if (!node || seenNodes.has(node))
                        continue;
                    seenNodes.add(node);
                    // Verify current owner still matches (in case of transfer)
                    let currentOwner;
                    try {
                        currentOwner = await registryContract.ownerOf(node);
                    }
                    catch (e) {
                        console.warn('ownerOf(node) failed, skipping owner verification');
                    }
                    if (currentOwner && currentOwner.toLowerCase() !== address.toLowerCase()) {
                        continue;
                    }
                    // Fetch display name
                    let domainName;
                    try {
                        domainName = await nftContract.getName(node);
                    }
                    catch (e) {
                        console.warn('getName(node) failed for', node);
                    }
                    if (domainName && domainName.length > 0 && !userDomains.includes(domainName)) {
                        userDomains.push(domainName);
                    }
                }
                catch (inner) {
                    console.warn('Error processing log:', inner?.message);
                }
            }
            if (userDomains.length > 0) {
                console.log('Domains from logs:', userDomains);
                return userDomains;
            }
        }
        catch (logsError) {
        }
        // Fallback: scan token IDs (best-effort, may be slow/inaccurate)
        console.log('Falling back to token scan...');
        // Add timeout to contract calls
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Contract call timeout')), 15000); // 15 second timeout
        });
        // Try to get total supply first
        let totalSupply = 0n;
        try {
            const ts = await Promise.race([
                nftContract.totalSupply(),
                timeoutPromise
            ]);
            totalSupply = ts;
            console.log('Total supply:', totalSupply.toString());
        }
        catch (error) {
            console.log('totalSupply() failed, using range approach:', error);
            totalSupply = 0n;
        }
        console.log('Checking token IDs...');
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 20;
        const supplyNum = Number(totalSupply);
        const maxTokensToCheck = Math.min(supplyNum + 200, 3000); // widen slightly
        // Include tokenId 0 as some ERC721 start at 0
        for (let tokenId = 0; tokenId <= maxTokensToCheck; tokenId++) {
            try {
                // Try to get owner from NFT contract first
                let owner;
                try {
                    owner = await Promise.race([
                        nftContract.ownerOf(tokenId),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                    ]);
                }
                catch (nftError) {
                    // If NFT contract fails, try registry contract via node
                    try {
                        const node = await Promise.race([
                            nftContract.getNode(tokenId),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                        ]);
                        owner = await Promise.race([
                            registryContract.ownerOf(node),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                        ]);
                    }
                    catch (registryError) {
                        throw nftError; // Use original error
                    }
                }
                if (owner && owner.toLowerCase() === address.toLowerCase()) {
                    // Get the node for this token
                    let node;
                    try {
                        node = await Promise.race([
                            nftContract.getNode(tokenId),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                        ]);
                    }
                    catch (nodeError) {
                        console.log(`Could not get node for token ${tokenId}:`, nodeError);
                        continue;
                    }
                    // Get the actual domain name
                    let domainName;
                    try {
                        domainName = await Promise.race([
                            nftContract.getName(node),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                        ]);
                    }
                    catch (nameError) {
                        console.log(`Could not get name for node ${node}:`, nameError);
                        continue;
                    }
                    if (domainName && domainName.length > 0 && !userDomains.includes(domainName)) {
                        userDomains.push(domainName);
                    }
                }
                // Reset consecutive failures counter on success
                consecutiveFailures = 0;
            }
            catch (error) {
                consecutiveFailures++;
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    console.log(`Stopping after ${maxConsecutiveFailures} consecutive failures`);
                    break;
                }
            }
        }
        console.log('Found user domains (fallback):', userDomains);
        return userDomains;
    }
    catch (error) {
        console.error('Error fetching user domains:', error);
        return [];
    }
}
async function getUserDomains_simple(address) {
    try {
        console.log('Fetching domains for address (frontend):', address);
        const provider = (0, quai_1.makeProvider)(contracts_1.RPC_URL);
        const nftContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_NFT, contracts_1.QNS_NFT_ABI, provider);
        const userDomains = [];
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 10;
        const maxTokensToCheck = 1000; // Reasonable upper bound for this deployment
        for (let tokenId = 1; tokenId <= maxTokensToCheck; tokenId++) {
            try {
                const owner = await nftContract.ownerOf(tokenId);
                if (owner && owner.toLowerCase() === address.toLowerCase()) {
                    const node = await nftContract.getNode(tokenId);
                    const domainName = await nftContract.getName(node);
                    if (domainName && domainName.length > 0 && !userDomains.includes(domainName)) {
                        userDomains.push(domainName);
                        console.log(`Found domain #${tokenId}:`, domainName, 'owned by', owner);
                    }
                }
                consecutiveFailures = 0;
            }
            catch (error) {
                consecutiveFailures++;
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    console.log(`Stopping after ${maxConsecutiveFailures} consecutive failures at tokenId`, tokenId);
                    break;
                }
            }
        }
        console.log('Found user domains (simple scan):', userDomains);
        return userDomains;
    }
    catch (error) {
        console.error('Error fetching user domains (simple scan):', error);
        return [];
    }
}
exports.getUserDomains = getUserDomains_simple;
// Auction-related functions (keep as optional advanced feature)
async function startDomainAuction(name, signer) {
    try {
        const node = nameToNode(name);
        const auctionContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_AUCTION_MANAGER, contracts_1.QNS_AUCTION_MANAGER_ABI, signer);
        const tx = await auctionContract.startAuction(node, name);
        await tx.wait();
        return {
            success: true,
            txHash: tx.hash,
        };
    }
    catch (error) {
        console.error('Error starting auction:', error);
        return {
            success: false,
            error: error?.message || 'Failed to start auction',
        };
    }
}
async function getAuctionInfo(name) {
    try {
        const provider = (0, quai_1.makeProvider)(contracts_1.RPC_URL);
        const auctionContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_AUCTION_MANAGER, contracts_1.QNS_AUCTION_MANAGER_ABI, provider);
        const node = nameToNode(name);
        const auction = await auctionContract.getAuction(node);
        if (auction.startTime === 0) {
            return { exists: false };
        }
        const currentPrice = await auctionContract.getCurrentPrice(node);
        return {
            exists: true,
            currentPrice: formatEther(currentPrice),
            endTime: Number(auction.endTime),
            highestBidder: auction.bidder,
        };
    }
    catch (error) {
        console.error('Error fetching auction info:', error);
        return { exists: false };
    }
}
async function placeBid(name, bidAmount, signer) {
    try {
        const node = nameToNode(name);
        const auctionContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_AUCTION_MANAGER, contracts_1.QNS_AUCTION_MANAGER_ABI, signer);
        const value = parseEther(bidAmount);
        const tx = await auctionContract.placeBid(node, { value });
        await tx.wait();
        return {
            success: true,
            txHash: tx.hash,
        };
    }
    catch (error) {
        console.error('Error placing bid:', error);
        return {
            success: false,
            error: error?.message || 'Failed to place bid',
        };
    }
}
/**
 * Resolve a QNS domain name to its associated address
 * This is the core function for enabling payments to domain names
 */
async function resolveDomainToAddress(domainName, providerOrSigner) {
    try {
        console.log('Resolving QNS domain:', domainName);
        const provider = providerOrSigner?.provider || providerOrSigner || (0, quai_1.makeProvider)(contracts_1.RPC_URL);
        const registryContract = new quais_1.Contract(contracts_1.CONTRACTS.QNS_REGISTRY, contracts_1.QNS_REGISTRY_ABI, provider);
        const node = nameToNode(domainName); // This now handles .quai suffix stripping
        // First check if the domain exists and get its owner
        let owner;
        try {
            owner = await registryContract.ownerOf(node);
            if (!owner || owner === '0x0000000000000000000000000000000000000000') {
                return {
                    success: false,
                    error: `Domain "${domainName}" is not registered or has no owner`
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Domain "${domainName}" not found or not registered`
            };
        }
        // Try to get the resolver address for this domain
        let resolverAddress;
        try {
            resolverAddress = await registryContract.resolverOf(node);
        }
        catch (error) {
            // If no resolver is set, return the owner address as fallback
            console.log('No resolver set, using owner address:', owner);
            return {
                success: true,
                address: owner
            };
        }
        // If we have a payment resolver, try to resolve to the payment address
        if (contracts_1.CONTRACTS.QI_PAYMENT_RESOLVER && resolverAddress === contracts_1.CONTRACTS.QI_PAYMENT_RESOLVER) {
            try {
                const paymentResolver = new quais_1.Contract(contracts_1.CONTRACTS.QI_PAYMENT_RESOLVER, contracts_1.QI_PAYMENT_RESOLVER_ABI, provider);
                // Try to resolve the payment record
                const result = await paymentResolver.resolveNode(node);
                const [qiCode, primaryAddress, , active] = result;
                if (active && primaryAddress && primaryAddress !== '0x0000000000000000000000000000000000000000') {
                    console.log('Resolved to payment address:', primaryAddress);
                    return {
                        success: true,
                        address: primaryAddress,
                        qiCode: qiCode || undefined,
                        active
                    };
                }
            }
            catch (resolverError) {
                console.warn('Payment resolver failed, falling back to owner:', resolverError);
            }
        }
        // Fallback to owner address if resolver fails or is not set
        console.log('Using owner address as fallback:', owner);
        return {
            success: true,
            address: owner
        };
    }
    catch (error) {
        console.error('Error resolving domain:', error);
        return {
            success: false,
            error: `Failed to resolve domain "${domainName}": ${error?.message || 'Unknown error'}`
        };
    }
}
/**
 * Send funds to a QNS domain name
 * This resolves the domain to an address first, then sends the transaction
 */
async function sendFundsToDomain(domainName, amountInQi, signer, options) {
    const opts = {
        onProgress: (status) => console.log(status),
        maxRetries: 3,
        ...options
    };
    try {
        opts.onProgress('Resolving domain name...');
        // First resolve the domain to an address
        const resolution = await resolveDomainToAddress(domainName, signer);
        if (!resolution.success) {
            return {
                success: false,
                error: resolution.error
            };
        }
        if (!resolution.address) {
            return {
                success: false,
                error: `Could not resolve address for domain "${domainName}"`
            };
        }
        opts.onProgress(`Resolved "${domainName}" to ${resolution.address}`);
        // Now send the transaction to the resolved address
        const amountWei = parseEther(amountInQi);
        let fromAddress;
        try {
            if (typeof (signer === null || signer === void 0 ? void 0 : signer.getAddress) === 'function') {
                fromAddress = await signer.getAddress();
            }
        }
        catch (_a) { }
        opts.onProgress('Sending transaction...');
        const txRequest = {
            to: resolution.address,
            value: amountWei
        };
        if (fromAddress) {
            txRequest.from = fromAddress;
        }
        const tx = await signer.sendTransaction(txRequest);
        opts.onProgress('Waiting for confirmation...');
        try {
            await tx.wait();
        }
        catch (waitError) {
            console.warn('tx.wait() failed; treating as sent transaction:', waitError);
            // Some Pelagus versions may reject certain read-only RPCs (e.g. quai_getBlockByNumber)
            // even though the transaction itself was broadcast successfully. In that case we
            // still consider the payment successful since we have a valid transaction hash.
        }
        return {
            success: true,
            txHash: tx.hash,
            resolvedAddress: resolution.address
        };
    }
    catch (error) {
        console.error('Error sending funds to domain:', error);
        const parsed = errorHandler_1.errorHandler.parseError(error, {
            operation: 'sendFundsToDomain',
            domainName,
            amountInQi
        });
        return {
            success: false,
            error: parsed.userMessage
        };
    }
}
