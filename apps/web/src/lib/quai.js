"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeProvider = makeProvider;
exports.getBlockNumber = getBlockNumber;
exports.detectPelagus = detectPelagus;
exports.requestAccounts = requestAccounts;
// Wallet & Provider utilities per BUILD_RULES.md
// Prefer official quais SDK with pathing enabled, per provided anchors.
const quais_1 = require("quais");
function makeProvider(rpcUrl) {
    if (!rpcUrl)
        throw new Error("rpcUrl is required");
    // Enable pathing per Quai requirements
    return new quais_1.JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
}
// Use a standard JSON-RPC method to avoid guessing shard-specific APIs
async function getBlockNumber(provider) {
    const hex = await provider.send("eth_blockNumber", [], "cyprus1");
    return Number.parseInt(hex, 16);
}
function detectPelagus() {
    const eth = globalThis?.ethereum;
    if (!eth)
        return false;
    // Direct flag
    if (eth.isPelagus)
        return true;
    // EIP-5749 style multi-injected providers
    const providers = Array.isArray(eth.providers) ? eth.providers : [];
    for (const p of providers) {
        if (p?.isPelagus)
            return true;
        const name = p?.providerInfo?.name || p?.name;
        if (typeof name === "string" && name.toLowerCase().includes("pelagus"))
            return true;
    }
    // Some wallets namespace under window.pelagus
    if (globalThis?.pelagus?.ethereum)
        return true;
    return false;
}
async function requestAccounts() {
    const eth = globalThis?.ethereum;
    if (!eth)
        throw new Error("No injected provider found");
    // Standard EIP-1193 method supported by Pelagus
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    return accounts;
}
