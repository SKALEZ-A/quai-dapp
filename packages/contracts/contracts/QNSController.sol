// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title QNSController - minimal commit/reveal controller for QNS
/// @notice Stores commit records and allows reveal to clear them, emitting events.
contract QNSController {
    struct Pending {
        address owner;
        bytes32 secret;
        uint64 expiresAt;
    }

    // commitHash => pending commit data
    mapping(bytes32 => Pending) internal _pending;

    /// @dev Emitted when a commit is recorded
    event Commit(bytes32 indexed commitHash, bytes32 indexed node, address indexed owner, bytes32 secret, uint64 expiresAt);

    /// @dev Emitted when a commit is revealed and cleared
    event Reveal(bytes32 indexed commitHash, bytes32 indexed node, address indexed owner);

    /// @notice Computes the commit hash used as key for storage
    function computeCommitHash(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) public pure returns (bytes32) {
        return keccak256(abi.encode(node, owner, secret, expiresAt));
    }

    /// @notice Record a commit for a future reveal
    function commit(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) external {
        require(owner != address(0), "owner is zero");
        require(expiresAt > block.timestamp, "must be in future");

        bytes32 h = computeCommitHash(node, owner, secret, expiresAt);
        require(_pending[h].owner == address(0), "already committed");

        _pending[h] = Pending({owner: owner, secret: secret, expiresAt: expiresAt});
        emit Commit(h, node, owner, secret, expiresAt);
    }

    /// @notice Reveal a prior commit; validates parameters and expiry, then clears storage
    function reveal(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) external {
        bytes32 h = computeCommitHash(node, owner, secret, expiresAt);
        Pending memory p = _pending[h];
        require(p.owner != address(0), "no such commit");
        require(p.expiresAt >= block.timestamp, "commit expired");

        delete _pending[h];
        emit Reveal(h, node, owner);
    }

    /// @notice View helper to inspect a pending commit by hash
    function getPending(bytes32 commitHash) external view returns (Pending memory) {
        return _pending[commitHash];
    }
}
