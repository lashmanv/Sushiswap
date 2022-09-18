// SPDX-License-Identifier: MIT
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SushiToken is ERC20 {
    constructor() ERC20("Nothing Token", "NTG") {}

    function mint(uint256 amount) public {
        _mint(msg.sender, amount * 10**uint(decimals()));
    }
}

//contract:0xd348cddE168896c5514d25e8E51dC8a525A1C305