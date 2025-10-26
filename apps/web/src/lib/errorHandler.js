"use strict";
// Enhanced error handling for QNS contract interactions
// Provides categorization, user-friendly messages, and actionable suggestions
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ErrorHandler = exports.ErrorCategory = void 0;
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["PERMISSION"] = "permission";
    ErrorCategory["BALANCE"] = "balance";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["CONTRACT"] = "contract";
    ErrorCategory["USER"] = "user";
    ErrorCategory["UNKNOWN"] = "unknown";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
// Error message templates
const ERROR_MESSAGES = {
    PERMISSION_DENIED: {
        title: "Contract Permission Error",
        message: "The registrar contract doesn't have permission to mint NFTs.",
        suggestion: "Run: cd packages/contracts && node scripts/check-and-fix-permissions.js",
        severity: "error"
    },
    INSUFFICIENT_BALANCE: {
        title: "Insufficient Balance",
        message: "You need {required} QI but only have {available} QI.",
        suggestion: "Get testnet QI from: https://faucet.quai.network/",
        severity: "error"
    },
    NETWORK_ERROR: {
        title: "Network Connection Error",
        message: "Unable to connect to Quai testnet.",
        suggestion: "Check your internet connection and try again.",
        severity: "warning"
    },
    DOMAIN_TAKEN: {
        title: "Domain Not Available",
        message: "This domain is already registered.",
        suggestion: "Try a different name or check the marketplace.",
        severity: "info"
    },
    DOMAIN_RESERVED: {
        title: "Domain Reserved",
        message: "This domain is reserved and cannot be registered.",
        suggestion: "Try a different name.",
        severity: "info"
    },
    USER_REJECTED: {
        title: "Transaction Rejected",
        message: "You rejected the transaction in your wallet.",
        suggestion: "Try again when you're ready to proceed.",
        severity: "info"
    },
    GAS_ESTIMATION_FAILED: {
        title: "Gas Estimation Failed",
        message: "Unable to estimate transaction cost.",
        suggestion: "Ensure you have sufficient balance and the domain is available.",
        severity: "warning"
    },
    TIMEOUT: {
        title: "Request Timeout",
        message: "The request took too long to complete.",
        suggestion: "The network may be slow. Please try again.",
        severity: "warning"
    },
    WRONG_NETWORK: {
        title: "Wrong Network",
        message: "Please switch to Quai Testnet (Cyprus-1).",
        suggestion: "Open your wallet and switch to the correct network.",
        severity: "error"
    }
};
class ErrorHandler {
    /**
     * Categorize an error based on its properties
     */
    categorizeError(error, context) {
        const errorMsg = (error?.message || '').toLowerCase();
        const errorCode = error?.code;
        const errorReason = (error?.reason || '').toLowerCase();
        const errorData = error?.data || '';
        const errorInfo = error?.info || {};
        // Log for debugging
        console.log('🔍 Categorizing error:', {
            errorMsg,
            errorCode,
            errorReason,
            errorData,
            errorInfo
        });
        // Permission errors - check multiple sources
        if (errorMsg.includes('accesscontrol') ||
            errorMsg.includes('missing role') ||
            errorMsg.includes('not authorized') ||
            errorMsg.includes('minter_role') ||
            errorMsg.includes('caller is not') ||
            errorReason.includes('accesscontrol') ||
            errorReason.includes('missing role') ||
            errorData?.toString().includes('AccessControl')) {
            return ErrorCategory.PERMISSION;
        }
        // Balance errors
        if (errorMsg.includes('insufficient funds') ||
            errorMsg.includes('insufficient balance') ||
            errorMsg.includes('exceeds balance') ||
            errorCode === 'INSUFFICIENT_FUNDS') {
            return ErrorCategory.BALANCE;
        }
        // Network errors
        if (errorMsg.includes('network') ||
            errorMsg.includes('timeout') ||
            errorMsg.includes('connection') ||
            errorMsg.includes('econnrefused') ||
            errorMsg.includes('could not detect network') ||
            errorCode === 'NETWORK_ERROR' ||
            errorCode === 'TIMEOUT') {
            return ErrorCategory.NETWORK;
        }
        // User errors - ONLY if explicitly rejected by user
        // Be VERY strict here to avoid false positives
        // Check for explicit user rejection codes and messages
        const isExplicitUserRejection = (errorCode === 4001 || // Standard user rejection code (EIP-1193)
            errorCode === 'ACTION_REJECTED' ||
            errorMsg === 'user rejected transaction' || // Exact match only
            errorMsg === 'user denied transaction signature' || // Exact match only
            errorMsg === 'user rejected the request' || // Exact match only
            errorMsg.includes('user cancelled') ||
            errorMsg.includes('user denied signature'));
        // If it looks like a user rejection but also has contract/revert indicators, it's NOT a user rejection
        // This prevents misclassification of contract errors as user rejections
        const hasContractErrorIndicators = (errorMsg.includes('revert') ||
            errorMsg.includes('execution reverted') ||
            errorMsg.includes('transaction failed') ||
            errorMsg.includes('insufficient funds') ||
            errorMsg.includes('insufficient balance') ||
            errorMsg.includes('gas') ||
            errorMsg.includes('accesscontrol') ||
            errorMsg.includes('missing role') ||
            errorMsg.includes('cannot estimate gas') ||
            errorMsg.includes('call exception') ||
            errorReason.length > 0 ||
            errorData);
        if (isExplicitUserRejection && !hasContractErrorIndicators) {
            return ErrorCategory.USER;
        }
        // Contract errors - check for reverts and specific contract issues
        if (errorMsg.includes('revert') ||
            errorMsg.includes('already registered') ||
            errorMsg.includes('not available') ||
            errorMsg.includes('reserved') ||
            errorMsg.includes('invalid domain') ||
            errorMsg.includes('execution reverted') ||
            errorMsg.includes('transaction failed') ||
            errorReason.includes('revert') ||
            errorCode === 'CALL_EXCEPTION' ||
            errorCode === 'UNPREDICTABLE_GAS_LIMIT') {
            return ErrorCategory.CONTRACT;
        }
        return ErrorCategory.UNKNOWN;
    }
    /**
     * Get a user-friendly message for an error
     */
    getUserMessage(error, context) {
        const category = this.categorizeError(error, context);
        const errorMsg = error?.message || '';
        const errorReason = error?.reason || '';
        switch (category) {
            case ErrorCategory.PERMISSION:
                return ERROR_MESSAGES.PERMISSION_DENIED.message;
            case ErrorCategory.BALANCE:
                // Try to extract amounts if available
                const match = errorMsg.match(/need (\d+\.?\d*) .* have (\d+\.?\d*)/i);
                if (match) {
                    return ERROR_MESSAGES.INSUFFICIENT_BALANCE.message
                        .replace('{required}', match[1])
                        .replace('{available}', match[2]);
                }
                return ERROR_MESSAGES.INSUFFICIENT_BALANCE.message
                    .replace('{required}', 'more')
                    .replace('{available}', 'insufficient');
            case ErrorCategory.NETWORK:
                if (errorMsg.includes('timeout')) {
                    return ERROR_MESSAGES.TIMEOUT.message;
                }
                return ERROR_MESSAGES.NETWORK_ERROR.message;
            case ErrorCategory.USER:
                return ERROR_MESSAGES.USER_REJECTED.message;
            case ErrorCategory.CONTRACT:
                if (errorMsg.includes('already registered') || errorReason.includes('already registered')) {
                    return ERROR_MESSAGES.DOMAIN_TAKEN.message;
                }
                if (errorMsg.includes('reserved') || errorReason.includes('reserved')) {
                    return ERROR_MESSAGES.DOMAIN_RESERVED.message;
                }
                if (errorMsg.includes('estimateGas')) {
                    return ERROR_MESSAGES.GAS_ESTIMATION_FAILED.message;
                }
                // Return the contract revert reason if available
                if (errorReason) {
                    return `Contract error: ${errorReason}`;
                }
                return `Contract interaction failed: ${errorMsg}`;
            default:
                return errorMsg || 'An unknown error occurred';
        }
    }
    /**
     * Get an actionable suggestion for an error
     */
    getSuggestion(error, context) {
        const category = this.categorizeError(error, context);
        const errorMsg = error?.message || '';
        switch (category) {
            case ErrorCategory.PERMISSION:
                return ERROR_MESSAGES.PERMISSION_DENIED.suggestion;
            case ErrorCategory.BALANCE:
                return ERROR_MESSAGES.INSUFFICIENT_BALANCE.suggestion;
            case ErrorCategory.NETWORK:
                if (errorMsg.includes('timeout')) {
                    return ERROR_MESSAGES.TIMEOUT.suggestion;
                }
                return ERROR_MESSAGES.NETWORK_ERROR.suggestion;
            case ErrorCategory.USER:
                return ERROR_MESSAGES.USER_REJECTED.suggestion;
            case ErrorCategory.CONTRACT:
                if (errorMsg.includes('already registered')) {
                    return ERROR_MESSAGES.DOMAIN_TAKEN.suggestion;
                }
                if (errorMsg.includes('reserved')) {
                    return ERROR_MESSAGES.DOMAIN_RESERVED.suggestion;
                }
                if (errorMsg.includes('estimateGas')) {
                    return ERROR_MESSAGES.GAS_ESTIMATION_FAILED.suggestion;
                }
                return "Please check the transaction details and try again.";
            default:
                return "If the problem persists, please contact support.";
        }
    }
    /**
     * Determine if an error should trigger a retry
     */
    shouldRetry(error) {
        const category = this.categorizeError(error, { operation: 'retry-check' });
        const errorMsg = (error?.message || '').toLowerCase();
        // Retry network errors
        if (category === ErrorCategory.NETWORK) {
            return true;
        }
        // Retry timeouts
        if (errorMsg.includes('timeout')) {
            return true;
        }
        // Don't retry user rejections, balance issues, or contract errors
        if (category === ErrorCategory.USER ||
            category === ErrorCategory.BALANCE ||
            category === ErrorCategory.CONTRACT ||
            category === ErrorCategory.PERMISSION) {
            return false;
        }
        // Default to no retry for unknown errors
        return false;
    }
    /**
     * Parse an error into a structured format
     */
    parseError(error, context = { operation: 'unknown' }) {
        const category = this.categorizeError(error, context);
        const userMessage = this.getUserMessage(error, context);
        const suggestion = this.getSuggestion(error, context);
        const shouldRetry = this.shouldRetry(error);
        // Determine severity
        let severity = 'error';
        if (category === ErrorCategory.USER) {
            severity = 'info';
        }
        else if (category === ErrorCategory.NETWORK) {
            severity = 'warning';
        }
        return {
            category,
            code: error?.code || 'UNKNOWN',
            message: error?.message || 'Unknown error',
            userMessage,
            suggestion,
            shouldRetry,
            severity
        };
    }
    /**
     * Log an error with structured format
     */
    logError(error, context, level = 'error') {
        const parsed = this.parseError(error, context);
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            level,
            category: parsed.category,
            operation: context.operation,
            code: parsed.code,
            message: parsed.message,
            userMessage: parsed.userMessage,
            suggestion: parsed.suggestion,
            context,
            stack: error?.stack
        };
        // Use appropriate console method
        switch (level) {
            case 'debug':
                console.debug('[ErrorHandler]', logData);
                break;
            case 'info':
                console.info('[ErrorHandler]', logData);
                break;
            case 'warn':
                console.warn('[ErrorHandler]', logData);
                break;
            case 'error':
            default:
                console.error('[ErrorHandler]', logData);
                break;
        }
    }
}
exports.ErrorHandler = ErrorHandler;
// Export singleton instance
exports.errorHandler = new ErrorHandler();
