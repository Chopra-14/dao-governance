// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    constructor()
        ERC20("Governance Token", "GT")
        ERC20Permit("Governance Token")
    {
        _mint(msg.sender, 1_000_000 ether);
    }
}
