// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract HelloQuai {
    string private message;

    event MessageChanged(address indexed sender, string newMessage);

    constructor(string memory initialMessage) {
        if (bytes(initialMessage).length == 0) {
            message = "Hello, Quai!";
        } else {
            message = initialMessage;
        }
    }

    function getMessage() external view returns (string memory) {
        return message;
    }

    function setMessage(string calldata newMessage) external {
        message = newMessage;
        emit MessageChanged(msg.sender, newMessage);
    }
}
