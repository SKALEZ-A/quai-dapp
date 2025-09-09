// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {QNSRegistry} from "contracts/QNSRegistry.sol";

contract Deploy is Script {
    function run() external {
        address admin = vm.envOr("ADMIN_ADDRESS", address(0));
        vm.startBroadcast();
        QNSRegistry reg = new QNSRegistry();
        if (admin == address(0)) {
            admin = vm.addr(uint256(vm.envBytes32("PRIVATE_KEY")));
        }
        reg.initialize(admin);
        vm.stopBroadcast();
        console2.log("QNSRegistry:", address(reg));
        console2.log("admin:", admin);
    }
}


