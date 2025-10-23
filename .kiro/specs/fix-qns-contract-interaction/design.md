# Design Document

## Overview

This design addresses the contract interaction failures in the QNS domain registration system. The solution involves creating diagnostic tools, fixing contract permissions, improving error handling, and enhancing the transaction flow to provide a reliable user experience.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ QNS Profile    │  │ Transaction  │  │ Error Handler   │ │
│  │ Page           │──│ Manager      │──│ & Logger        │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ quais.js
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Quai Blockchain (Testnet)                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ QNS        │  │ QNS NFT    │  │ QNS Registry         │  │
│  │ Registrar  │──│ Contract   │──│ Contract             │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ QNS Reserved Names Contract                            │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Diagnostic Tools                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Permission   │  │ Contract     │  │ Deployment      │   │
│  │ Checker      │  │ Validator    │  │ Verifier        │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Diagnostic Scripts

#### Permission Checker Script
**Purpose:** Verify and fix contract role permissions

**Location:** `packages/contracts/scripts/check-and-fix-permissions.js`

**Functions:**
- `checkRegistrarPermissions()` - Verifies registrar has MINTER_ROLE on NFT contract
- `checkRegistryPermissions()` - Verifies registrar can call setOwner on registry
- `grantMissingPermissions()` - Grants any missing roles
- `generatePermissionReport()` - Creates a detailed permission status report

**Interface:**
```javascript
async function checkRegistrarPermissions(registrarAddress, nftAddress, registryAddress) {
  // Returns: { hasMinterRole: boolean, canSetOwner: boolean, issues: string[] }
}

async function grantMissingPermissions(registrarAddress, nftAddress, registryAddress, signer) {
  // Returns: { success: boolean, txHashes: string[], errors: string[] }
}
```

#### Contract Validator Script
**Purpose:** Validate contract addresses and configuration

**Location:** `packages/contracts/scripts/validate-deployment.js`

**Functions:**
- `validateContractAddresses()` - Checks all contracts are deployed and accessible
- `validateContractReferences()` - Verifies registrar has correct contract references
- `compareWithDeploymentFile()` - Compares runtime config with deployment JSON
- `testBasicFunctions()` - Tests basic contract functions (available, getPrice, etc.)

**Interface:**
```javascript
async function validateContractAddresses(addresses) {
  // Returns: { valid: boolean, issues: ContractIssue[], warnings: string[] }
}

interface ContractIssue {
  contract: string;
  address: string;
  issue: string;
  severity: 'error' | 'warning';
}
```

### 2. Enhanced Transaction Manager

**Purpose:** Improve transaction handling with better error recovery

**Location:** `apps/web/src/lib/transactionManager.ts`

**Key Features:**
- Automatic gas estimation with fallback
- Transaction retry logic
- Detailed error parsing
- Transaction status tracking

**Interface:**
```typescript
interface TransactionOptions {
  maxRetries?: number;
  gasLimitMultiplier?: number;
  timeout?: number;
}

interface TransactionResult {
  success: boolean;
  txHash?: string;
  receipt?: any;
  error?: ParsedError;
}

interface ParsedError {
  code: string;
  message: string;
  userMessage: string;
  suggestion?: string;
}

class TransactionManager {
  async executeTransaction(
    contract: Contract,
    method: string,
    args: any[],
    options?: TransactionOptions
  ): Promise<TransactionResult>;
  
  async estimateGasWithFallback(
    contract: Contract,
    method: string,
    args: any[]
  ): Promise<bigint>;
  
  parseError(error: any): ParsedError;
}
```

### 3. Improved Error Handler

**Purpose:** Provide clear, actionable error messages

**Location:** `apps/web/src/lib/errorHandler.ts`

**Error Categories:**
1. **Permission Errors** - Contract lacks necessary roles
2. **Balance Errors** - Insufficient funds
3. **Network Errors** - RPC connection issues
4. **Contract Errors** - Domain already registered, reserved, etc.
5. **User Errors** - Transaction rejected, invalid input

**Interface:**
```typescript
interface ErrorContext {
  operation: string;
  contractAddress?: string;
  userAddress?: string;
  domainName?: string;
}

class ErrorHandler {
  categorizeError(error: any, context: ErrorContext): ErrorCategory;
  getUserMessage(error: any, context: ErrorContext): string;
  getSuggestion(error: any, context: ErrorContext): string;
  shouldRetry(error: any): boolean;
}

enum ErrorCategory {
  PERMISSION = 'permission',
  BALANCE = 'balance',
  NETWORK = 'network',
  CONTRACT = 'contract',
  USER = 'user',
  UNKNOWN = 'unknown'
}
```

### 4. Enhanced QNS Library

**Purpose:** Improve the core QNS interaction library

**Location:** `apps/web/src/lib/qns.ts`

**Improvements:**
- Add transaction manager integration
- Implement retry logic
- Add comprehensive logging
- Improve gas estimation
- Add contract validation before transactions

**Modified Functions:**
```typescript
async function registerDomain(
  name: string,
  signer: any,
  options?: {
    maxRetries?: number;
    validateFirst?: boolean;
    onProgress?: (status: string) => void;
  }
): Promise<TransactionResult>

async function validateRegistration(
  name: string,
  userAddress: string
): Promise<{
  canRegister: boolean;
  issues: string[];
  estimatedGas?: bigint;
  estimatedCost?: string;
}>
```

## Data Models

### Permission Status
```typescript
interface PermissionStatus {
  registrar: string;
  nft: string;
  registry: string;
  permissions: {
    hasMinterRole: boolean;
    canSetOwner: boolean;
    isAdmin: boolean;
  };
  issues: PermissionIssue[];
  timestamp: number;
}

interface PermissionIssue {
  contract: string;
  role: string;
  required: boolean;
  granted: boolean;
  fix: string; // Command to fix the issue
}
```

### Deployment Validation Result
```typescript
interface DeploymentValidation {
  valid: boolean;
  contracts: {
    [key: string]: ContractValidation;
  };
  overallStatus: 'healthy' | 'degraded' | 'failed';
  recommendations: string[];
}

interface ContractValidation {
  address: string;
  deployed: boolean;
  accessible: boolean;
  hasCode: boolean;
  references: {
    [key: string]: {
      expected: string;
      actual: string;
      matches: boolean;
    };
  };
}
```

## Error Handling

### Error Flow

```
User Action (Register Domain)
    │
    ├─> Validate Input
    │   ├─> Invalid → Show validation error
    │   └─> Valid → Continue
    │
    ├─> Check Wallet Connection
    │   ├─> Not connected → Prompt to connect
    │   └─> Connected → Continue
    │
    ├─> Validate Network
    │   ├─> Wrong network → Prompt to switch
    │   └─> Correct network → Continue
    │
    ├─> Pre-flight Checks
    │   ├─> Check balance
    │   ├─> Check domain availability
    │   ├─> Estimate gas
    │   └─> Any failure → Show specific error
    │
    ├─> Execute Transaction
    │   ├─> Gas estimation fails → Use fallback
    │   ├─> Transaction fails → Parse error
    │   │   ├─> Permission error → Show fix instructions
    │   │   ├─> Balance error → Show faucet link
    │   │   ├─> Network error → Retry
    │   │   └─> Other → Show detailed message
    │   └─> Success → Wait for confirmation
    │
    └─> Post-transaction
        ├─> Update UI
        ├─> Refresh domain list
        └─> Show success message
```

### Error Message Templates

```typescript
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
  }
};
```

## Testing Strategy

### Unit Tests

1. **Permission Checker Tests**
   - Test role verification logic
   - Test permission granting logic
   - Test error handling

2. **Transaction Manager Tests**
   - Test gas estimation with various scenarios
   - Test retry logic
   - Test error parsing

3. **Error Handler Tests**
   - Test error categorization
   - Test message generation
   - Test suggestion logic

### Integration Tests

1. **Contract Interaction Tests**
   - Test full registration flow
   - Test with missing permissions
   - Test with insufficient balance
   - Test with network errors

2. **Diagnostic Script Tests**
   - Test permission checker on test deployment
   - Test contract validator
   - Test deployment verifier

### Manual Testing Checklist

1. **Permission Scenarios**
   - [ ] Test with correct permissions
   - [ ] Test with missing MINTER_ROLE
   - [ ] Test with missing setOwner permission
   - [ ] Test permission fix script

2. **Transaction Scenarios**
   - [ ] Test successful registration
   - [ ] Test with insufficient balance
   - [ ] Test with wrong network
   - [ ] Test with already registered domain
   - [ ] Test with reserved domain

3. **Error Handling**
   - [ ] Verify all error messages are clear
   - [ ] Verify suggestions are actionable
   - [ ] Verify retry logic works
   - [ ] Verify logging is comprehensive

## Implementation Notes

### Priority Order

1. **High Priority** (Blocking issues)
   - Permission checker and fix script
   - Contract validation script
   - Enhanced error handling in registerDomain

2. **Medium Priority** (Improves UX)
   - Transaction manager with retry logic
   - Comprehensive error messages
   - Pre-flight validation

3. **Low Priority** (Nice to have)
   - Advanced logging
   - Performance monitoring
   - Automated health checks

### Dependencies

- quais.js v1.x - For blockchain interactions
- Existing contract ABIs - For contract interfaces
- Deployed contracts - Must be accessible on testnet

### Configuration

All configuration should be centralized in:
- `apps/web/src/lib/contracts.ts` - Contract addresses and ABIs
- `apps/web/.env` - Environment-specific settings
- `packages/contracts/deployed-addresses-simple.json` - Deployment record

### Logging Strategy

Use structured logging with levels:
- **DEBUG**: Detailed execution flow
- **INFO**: Important state changes
- **WARN**: Recoverable errors
- **ERROR**: Critical failures

Example:
```typescript
logger.debug('Starting domain registration', { domain: name, user: address });
logger.info('Transaction sent', { txHash, domain: name });
logger.warn('Gas estimation failed, using fallback', { domain: name, fallbackGas });
logger.error('Registration failed', { domain: name, error: error.message });
```

## Security Considerations

1. **Private Key Handling**
   - Never log private keys
   - Use environment variables for sensitive data
   - Validate all user inputs

2. **Transaction Safety**
   - Always estimate gas before sending
   - Validate contract addresses
   - Check balances before transactions
   - Implement transaction limits

3. **Error Information**
   - Don't expose internal system details in user-facing errors
   - Sanitize error messages
   - Log full errors server-side only

## Performance Considerations

1. **RPC Calls**
   - Batch multiple read calls when possible
   - Cache contract instances
   - Implement request timeouts

2. **Gas Optimization**
   - Use accurate gas estimates
   - Avoid unnecessary contract calls
   - Batch operations when possible

3. **User Experience**
   - Show loading states
   - Provide progress updates
   - Enable cancellation of long operations
