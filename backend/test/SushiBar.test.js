const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SushiBar", function () {
  before(async function () {
    this.SushiToken = await ethers.getContractFactory("SushiToken")
    this.SushiBar = await ethers.getContractFactory("SushiBar")

    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {
    this.sushi = await this.SushiToken.deploy()
    this.bar = await this.SushiBar.deploy(this.sushi.address)
    this.sushi.mint(this.alice.address, "100000000000000000000")
    this.sushi.mint(this.bob.address, "100000000000000000000")
    this.sushi.mint(this.carol.address, "100000000000000000000")
  })

  it("should not allow to stake if not have enough approve", async function () {
    await expect(this.bar.enter("100")).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
    await this.sushi.approve(this.bar.address, "50")
    await expect(this.bar.enter("100")).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
    await this.sushi.approve(this.bar.address, "100")
    await this.bar.enter("100")
    expect(await this.bar.balanceOf(this.alice.address)).to.equal("100")
  })

  it("should not allow to withraw before 2 days", async function () {
    await this.sushi.approve(this.bar.address, "100")
    await this.bar.enter("100")
    await expect(this.bar.leave("25")).to.be.revertedWith("Cannot be unstaked before 2 days")
  })

  it("should not allow to withraw more than staked", async function () {
    await this.sushi.approve(this.bar.address, "100")
    await this.bar.enter("100")
    await ethers.provider.send('evm_increaseTime', [3*24*60*60]);
    await expect(this.bar.leave("26")).to.be.revertedWith("Invalid Amount");
  }) 

  it("should work with more than one participant", async function () {
    await this.sushi.approve(this.bar.address, "100000000000000000000")
    await this.sushi.connect(this.bob).transfer(this.bar.address, "100000000000000000000", { from: this.bob.address })

    // Alice enters and gets 100 shares
    await this.bar.enter("100000000000000000000")

    expect(await this.bar.balanceOf(this.alice.address)).to.equal("100000000000000000000")
    expect(await this.sushi.balanceOf(this.bar.address)).to.equal("200000000000000000000")

    /* ---------------------------------------------------------------------------------------------------------------------- */

    await this.sushi.connect(this.carol).approve(this.bar.address, "100000000000000000000", { from: this.carol.address })

    await this.bar.connect(this.carol).enter("100000000000000000000", { from: this.carol.address })

    expect(await this.sushi.balanceOf(this.bar.address)).to.equal("300000000000000000000")

    await ethers.provider.send('evm_increaseTime', [2*24*60*60]);

    // Bob withdraws 25 shares. He should receive 25*60/36 = 8 shares
    await this.bar.leave("25000000000000000000")

    // Carol withdraws 25 shares. He should receive 25*60/36 = 8 shares
    await this.bar.connect(this.carol).leave("25000000000000000000", { from: this.carol.address })

    expect(await this.sushi.balanceOf(this.alice.address)).to.equal("31250000000000000000");

    expect(await this.sushi.balanceOf(this.carol.address)).to.equal("35000000000000000000");

    expect(await this.sushi.balanceOf(this.bar.address)).to.equal("233750000000000000000")
  })

})