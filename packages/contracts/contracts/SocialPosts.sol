// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract SocialPosts {
    event PostCreated(address indexed author, string cid, string zone);

    function anchorPost(string calldata cid, string calldata zone) external {
        emit PostCreated(msg.sender, cid, zone);
    }
}


