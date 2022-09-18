// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// SushiBar is the coolest bar in town. You come in with some Sushi, and leave with more! The longer you stay, the more Sushi you get.
//
// This contract handles swapping to and from xSushi, SushiSwap's staking token.
contract SushiBar is ERC20("SushiBar", "xSUSHI"){
    IERC20 public sushi;

    mapping(address => uint256) stakeAmount;

    mapping(address => uint256) stakeTime;

    uint256 public s = (100000000000000000000 /100) *25;

    // Define the Sushi token contract
    constructor(IERC20 _sushi) {
        sushi = _sushi;
    }

    // Enter the bar. Pay some SUSHIs. Earn some shares.
    // Locks Sushi and mints xSushi
    function enter(uint256 _amount) public {
        // address of user
        address user = _msgSender();
        // Gets the amount of Sushi locked in the contract
        uint256 totalSushi = sushi.balanceOf(address(this));
        // Gets the amount of xSushi in existence
        uint256 totalShares = totalSupply();
        // If no xSushi exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalSushi == 0) {
            _mint(user, _amount);
        } 
        // Calculate and mint the amount of xSushi the Sushi is worth. The ratio will change overtime, as xSushi is burned/minted and Sushi deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount * totalShares / totalSushi;
            _mint(user, what);
        }

        stakeAmount[user] = stakeAmount[user] + _amount;

        stakeTime[user] = block.timestamp;

        // Lock the Sushi in the contract
        sushi.transferFrom(user, address(this), _amount);
    }

    // Leave the bar. Claim back your SUSHIs.
    // Unlocks the staked + gained Sushi and burns xSushi
    function leave(uint256 _share) public {
        // address of user
        address user = _msgSender();
        // Gets the amount of xSushi in existence
        uint256 totalShares = totalSupply();

        uint256 _stakeAmount = stakeAmount[user];

        uint256 _stakeTime = stakeTime[user];

        uint256 what;

        require(_stakeAmount > 0, "User not staked");

        require(block.timestamp - _stakeTime > 2 days, "Cannot be unstaked before 2 days");

        if(block.timestamp - _stakeTime > 2 days && block.timestamp - _stakeTime < 4 days) {

            if(block.timestamp - _stakeTime >= 4 days && block.timestamp - _stakeTime < 6 days) {

                if(block.timestamp - _stakeTime >= 6 days && block.timestamp - _stakeTime < 8 days) {

                    if(block.timestamp - _stakeTime >= 8 days) {

                        require(_share <= _stakeAmount, "Invalid Amount");

                        // Calculates the amount of Sushi the xSushi is worth
                        what = (_share * sushi.balanceOf(address(this))) / totalShares;

                        _burn(user, _share);

                        sushi.transfer(user, what);

                        _stakeAmount = stakeAmount[user] - _share;

                    }
                    else {
                        uint256 _75percent = (_stakeAmount / 100) * 75;

                        require(_share <= _75percent, "Invalid Amount");

                        // Calculates the amount of Sushi the xSushi is worth
                        what = (_share * sushi.balanceOf(address(this))) / totalShares;

                        what = what - ((_share / 100) * 25);

                        _burn(user, _share);

                        sushi.transfer(user, what);

                        _stakeAmount = stakeAmount[user] - _share;
                    }
                }
                else {
                    uint256 _50percent = (_stakeAmount / 100) * 50;

                    require(_share <= _50percent, "Invalid Amount");

                    // Calculates the amount of Sushi the xSushi is worth
                    what = (_share * sushi.balanceOf(address(this))) / totalShares;

                    what = what - ((_share / 100) * 50);

                    _burn(user, _share);

                    sushi.transfer(user, what);

                    _stakeAmount = stakeAmount[user] - _share;
                }
            }
            else {
                uint256 _25percent = (_stakeAmount / 100) * 25;

                require(_share <= _25percent, "Invalid Amount");

                // Calculates the amount of Sushi the xSushi is worth
                what = (_share * sushi.balanceOf(address(this))) / totalShares;

                what = what - ((_share / 100) * 75);

                _burn(user, _share);

                sushi.transfer(user, what);

                _stakeAmount = stakeAmount[user] - _share;
            }

        }
    }

}