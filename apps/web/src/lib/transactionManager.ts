// Transaction manager with retry logic and enhanced error handling
import { Contract } from 'quais';
import { errorHandler, ErrorCategory, ParsedError } from './errorHandler';

export interface TransactionOptions {
  maxRetries?: number;
  gasLimitMultiplier?: number;
  timeout?: number;
  onProgress?: (status: string) => void;
  value?: bigint; // For payable functions
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  receipt?: any;
  error?: ParsedError;
}

export class TransactionManager {
  private defaultOptions: TransactionOptions = {
    maxRetries: 3,
    gasLimitMultiplier: 1.2, // 20% buffer
    timeout: 30000, // 30 seconds
    onProgress: () => {},
    value: undefined
  };

  /**
   * Execute a contract transaction with retry logic
   */
  async executeTransaction(
    contract: Contract,
    method: string,
    args: any[],
    options: TransactionOptions = {}
  ): Promise<TransactionResult> {
    const opts = { 
      maxRetries: 3,
      gasLimitMultiplier: 1.2,
      timeout: 30000,
      onProgress: (status: string) => {},
      ...options 
    };
    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
      try {
        opts.onProgress(`Attempt ${attempt}/${opts.maxRetries}: Preparing transaction...`);

        // Estimate gas with fallback
        const gasLimit = await this.estimateGasWithFallback(contract, method, args, opts);
        
        opts.onProgress(`Sending transaction...`);

        // Build transaction options - Quai specific format
        const txOptions: any = { 
          gasLimit: gasLimit
        };
        
        // Add value if this is a payable function
        if (opts.value !== undefined && opts.value > BigInt(0)) {
          txOptions.value = opts.value;
        }

        // Log transaction details before sending
        let signerAddress = 'unknown';
        try {
          if (contract.runner && 'getAddress' in contract.runner) {
            signerAddress = await (contract.runner as any).getAddress();
          }
        } catch (e) {
          // Ignore
        }
        
        console.log('🔵 SENDING TRANSACTION:', {
          contract: contract.target,
          method,
          args,
          txOptions: {
            gasLimit: txOptions.gasLimit?.toString(),
            value: txOptions.value?.toString(),
            hasValue: opts.value !== undefined
          },
          attempt,
          signerAddress
        });

        // Verify signer is connected
        if (!contract.runner) {
          throw new Error('Contract has no signer attached');
        }

        // Execute transaction - Quai requires explicit transaction options
        // For Quai Network, we need to pass options as an overrides object
        // The contract method signature is: method(...args, overrides)
        // IMPORTANT: For Quai, we must pass gasLimit as a Number, not BigInt
        // Also ensure value is properly formatted
        const overrides: any = {
          gasLimit: Number(txOptions.gasLimit) // Convert to Number for Quai compatibility
        };
        
        // Add value if this is a payable function
        // For Quai, value should be BigInt but let's ensure it's properly formatted
        if (opts.value !== undefined && opts.value > BigInt(0)) {
          overrides.value = opts.value;
        }

        console.log('🔵 FINAL OVERRIDES:', {
          gasLimit: overrides.gasLimit,
          gasLimitType: typeof overrides.gasLimit,
          value: overrides.value?.toString(),
          valueType: typeof overrides.value,
          hasValue: 'value' in overrides
        });

        // Verify contract has a signer before attempting transaction
        if (!contract.runner || typeof (contract.runner as any).sendTransaction !== 'function') {
          throw new Error('Contract signer is not properly configured. Please reconnect your wallet.');
        }

        // Execute transaction
        // For Quai Network, the contract call should automatically use the signer
        console.log('🔵 Calling contract method:', method, 'with args:', args);
        const tx = await contract[method](...args, overrides);
        console.log('🔵 Transaction object received:', {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value?.toString(),
          gasLimit: tx.gasLimit?.toString()
        });
        
        opts.onProgress(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);

        // Wait for confirmation with timeout
        const receipt = await this.waitForTransaction(tx, opts.timeout);
        
        opts.onProgress(`Transaction confirmed!`);

        return {
          success: true,
          txHash: receipt.hash,
          receipt
        };

      } catch (error: any) {
        lastError = error;
        
        // Log raw error BEFORE parsing to see actual error details
        console.error('🔴 RAW TRANSACTION ERROR:', {
          errorObject: error,
          errorCode: error?.code,
          errorMessage: error?.message,
          errorReason: error?.reason,
          errorData: error?.data,
          errorInfo: error?.info,
          errorAction: error?.action,
          errorTransaction: error?.transaction,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        });
        
        const parsed = errorHandler.parseError(error, {
          operation: `${contract.target}.${method}`,
          attempt,
          maxRetries: opts.maxRetries
        });

        console.error('🔴 PARSED ERROR:', {
          category: parsed.category,
          userMessage: parsed.userMessage,
          suggestion: parsed.suggestion,
          shouldRetry: parsed.shouldRetry
        });

        errorHandler.logError(error, {
          operation: `${contract.target}.${method}`,
          attempt,
          args
        }, 'error');

        // Check if we should retry
        if (attempt < opts.maxRetries && parsed.shouldRetry) {
          opts.onProgress(`Retrying... (${attempt}/${opts.maxRetries})`);
          // Wait before retry (exponential backoff)
          await this.delay(1000 * attempt);
          continue;
        }

        // No more retries or shouldn't retry
        return {
          success: false,
          error: parsed
        };
      }
    }

    // All retries exhausted
    const parsed = errorHandler.parseError(lastError, {
      operation: `${contract.target}.${method}`,
      retriesExhausted: true
    });

    return {
      success: false,
      error: parsed
    };
  }

  /**
   * Estimate gas with fallback logic
   */
  async estimateGasWithFallback(
    contract: Contract,
    method: string,
    args: any[],
    options: TransactionOptions = {}
  ): Promise<bigint> {
    const opts = { 
      gasLimitMultiplier: 1.5, // Increased multiplier for Quai Network
      ...options 
    };

    try {
      // Build estimation options for Quai Network
      const estimateOptions: any = {};
      if (opts.value !== undefined && opts.value > BigInt(0)) {
        estimateOptions.value = opts.value;
      }

      // Try to estimate gas - Quai Network specific
      console.log(`Estimating gas for ${method} with options:`, {
        args,
        value: estimateOptions.value?.toString()
      });
      
      const estimate = await contract[method].estimateGas(...args, estimateOptions);
      
      // Add buffer - Quai Network needs higher buffer (50% instead of 20%)
      const multiplier = opts.gasLimitMultiplier ?? 1.5;
      const buffered = BigInt(Math.floor(Number(estimate) * multiplier));
      
      console.log(`✅ Gas estimate for ${method}:`, {
        estimate: estimate.toString(),
        buffered: buffered.toString(),
        multiplier
      });

      return buffered;

    } catch (error: any) {
      console.warn(`⚠️ Gas estimation failed for ${method}, using fallback:`, error?.message);
      
      // Fallback gas limits based on operation type
      // Quai Network requires higher gas limits than standard EVM
      const fallbackLimits: { [key: string]: bigint } = {
        register: BigInt(500000),  // Reduced from 1M - was too high
        mint: BigInt(300000),      
        transfer: BigInt(100000),
        approve: BigInt(80000),
        setOwner: BigInt(150000),
        default: BigInt(400000)    // Reduced default
      };

      const fallback = fallbackLimits[method] || fallbackLimits.default;
      console.log(`Using fallback gas limit for Quai Network: ${fallback.toString()}`);
      
      return fallback;
    }
  }

  /**
   * Wait for transaction with timeout
   */
  private async waitForTransaction(tx: any, timeout: number): Promise<any> {
    return Promise.race([
      tx.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), timeout)
      )
    ]);
  }

  /**
   * Delay helper for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate transaction before sending
   */
  async validateTransaction(
    contract: Contract,
    method: string,
    args: any[],
    signer: any
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check signer is connected
      if (!signer) {
        issues.push('No signer provided');
        return { valid: false, issues };
      }

      // Check signer has address
      const address = await signer.getAddress();
      if (!address) {
        issues.push('Signer has no address');
        return { valid: false, issues };
      }

      // Check balance
      const balance = await signer.provider.getBalance(address);
      if (balance === BigInt(0)) {
        issues.push('Insufficient balance (0 QI)');
      }

      // Try to estimate gas (this will fail if transaction would revert)
      try {
        await contract[method].estimateGas(...args);
      } catch (error: any) {
        const errorMsg = error?.message || '';
        if (errorMsg.includes('insufficient funds')) {
          issues.push('Insufficient balance for transaction');
        } else if (errorMsg.includes('revert')) {
          issues.push(`Transaction would revert: ${error?.reason || errorMsg}`);
        } else {
          issues.push(`Gas estimation failed: ${errorMsg}`);
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };

    } catch (error: any) {
      issues.push(`Validation error: ${error?.message || 'Unknown error'}`);
      return { valid: false, issues };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string, provider: any): Promise<{
    confirmed: boolean;
    success?: boolean;
    blockNumber?: number;
    error?: string;
  }> {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { confirmed: false };
      }

      return {
        confirmed: true,
        success: receipt.status === 1,
        blockNumber: receipt.blockNumber
      };

    } catch (error: any) {
      return {
        confirmed: false,
        error: error?.message || 'Failed to get transaction status'
      };
    }
  }
}

// Export singleton instance
export const transactionManager = new TransactionManager();
