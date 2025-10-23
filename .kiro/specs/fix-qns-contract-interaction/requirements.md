# Requirements Document

## Introduction

The QNS (Quai Name Service) domain registration feature is failing when users attempt to purchase domains through the frontend. The error message "Contract interaction failed. Please check your wallet connection and try again" appears despite the wallet being connected and the contracts being deployed on testnet. This spec addresses the root causes of the contract interaction failures and ensures reliable domain registration.

## Requirements

### Requirement 1: Contract Permission Verification

**User Story:** As a developer, I want to verify that all contract permissions are correctly configured, so that the registrar can successfully mint NFTs and update the registry.

#### Acceptance Criteria

1. WHEN the registrar contract attempts to mint an NFT THEN the NFT contract SHALL allow the registrar to call the mint function
2. WHEN the registrar contract attempts to update the registry THEN the registry contract SHALL allow the registrar to call the setOwner function
3. IF the registrar lacks proper permissions THEN the system SHALL provide a clear diagnostic script to identify missing roles
4. WHEN permissions are missing THEN the system SHALL provide a script to grant the necessary roles

### Requirement 2: Contract Address Validation

**User Story:** As a user, I want the frontend to use the correct deployed contract addresses, so that my transactions are sent to the right contracts on the blockchain.

#### Acceptance Criteria

1. WHEN the frontend loads THEN it SHALL use contract addresses that match the deployed-addresses-simple.json file
2. WHEN contract addresses are updated THEN both the environment file and the contracts.ts file SHALL be synchronized
3. IF there is a mismatch between deployed addresses and frontend configuration THEN the system SHALL log a warning
4. WHEN verifying contract addresses THEN the system SHALL provide a validation script

### Requirement 3: Gas Estimation and Transaction Handling

**User Story:** As a user, I want clear error messages when transactions fail, so that I can understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN gas estimation fails THEN the system SHALL use a fallback gas limit instead of failing immediately
2. WHEN a transaction fails due to insufficient funds THEN the error message SHALL specify the exact amount needed
3. WHEN a transaction fails due to contract revert THEN the system SHALL decode the revert reason and display it to the user
4. WHEN network errors occur THEN the system SHALL retry the request up to 3 times before failing

### Requirement 4: Contract Interaction Debugging

**User Story:** As a developer, I want comprehensive logging of contract interactions, so that I can quickly diagnose and fix issues.

#### Acceptance Criteria

1. WHEN a contract call is made THEN the system SHALL log the contract address, function name, and parameters
2. WHEN a transaction is sent THEN the system SHALL log the transaction hash and wait for confirmation
3. WHEN an error occurs THEN the system SHALL log the full error object including code, message, and stack trace
4. WHEN debugging is enabled THEN the system SHALL provide step-by-step execution logs

### Requirement 5: Network and RPC Configuration

**User Story:** As a user, I want the application to automatically connect to the correct Quai testnet zone, so that my transactions are processed correctly.

#### Acceptance Criteria

1. WHEN the application loads THEN it SHALL connect to the Cyprus-1 zone on Orchard testnet
2. WHEN the RPC endpoint is unavailable THEN the system SHALL attempt to use an alternative endpoint
3. IF the user's wallet is on the wrong network THEN the system SHALL prompt them to switch networks
4. WHEN network switching is required THEN the system SHALL provide clear instructions

### Requirement 6: Contract Deployment Verification

**User Story:** As a developer, I want to verify that all contracts are properly deployed and initialized, so that I can ensure the system is ready for use.

#### Acceptance Criteria

1. WHEN contracts are deployed THEN the system SHALL verify that each contract is accessible at its deployed address
2. WHEN verifying contracts THEN the system SHALL check that the registrar has the correct references to NFT, registry, and reserved names contracts
3. IF any contract reference is incorrect THEN the system SHALL provide a script to update the references
4. WHEN all contracts are verified THEN the system SHALL generate a deployment status report
