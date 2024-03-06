const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const wethHolderAddress = "0x4F4495243837681061C4743b74B3eEdf548D56A5";

const half = ethers.parseEther("0.5");
const full = ethers.parseEther("1");
const more = ethers.parseEther("1.5");

describe("Vault", async () => {
    let vault;
    let user;
    let wethToken;
    let wethHolder;
    
    before(async () => {
        await helpers.impersonateAccount(wethHolderAddress);

        wethToken = await ethers.getContractAt("IERC20", wethAddress);
    });

    beforeEach(async () => {
        wethHolder = await ethers.getSigner(wethHolderAddress);
        await helpers.setBalance(wethHolderAddress, ethers.MaxUint256);

        [user] = await ethers.getSigners();

        const Vault = await ethers.getContractFactory("Vault");
        vault = await Vault.deploy(wethToken.target);
    });

    it("deposits and withdraws ETH", async () => {
        await vault.connect(user).depositEth({ value: full });

        expect(await vault.ethBalances(user)).to.be.eq(full);

        await expect(vault.connect(user).withdrawEth(more)).to.be.revertedWith("Insufficient ETH balance")

        await vault.connect(user).withdrawEth(half);

        expect(await vault.ethBalances(user)).to.be.eq(half);
    });

    it("deposits and withdraws WETH", async () => {
        await expect(vault.connect(wethHolder).depositToken(wethAddress, full)).to.be.reverted;
        
        await wethToken.connect(wethHolder).approve(vault.target, full);

        await vault.connect(wethHolder).depositToken(wethAddress, full);

        expect(await vault.balances(wethHolder.address, wethAddress)).to.be.eq(full);

        await expect(vault.connect(wethHolder).withdrawToken(wethAddress, more)).to.be.revertedWith("Insufficient token balance")

        await vault.connect(wethHolder).withdrawToken(wethAddress, half);

        expect(await vault.balances(wethHolder.address, wethAddress)).to.be.eq(half);
    });

    it("wraps ETH", async () => {
        await vault.connect(user).depositEth({ value: full });

        await expect(vault.connect(user).wrapEth(more)).to.be.revertedWith("Insufficient ETH balance");

        await vault.connect(user).wrapEth(half);

        expect(await vault.ethBalances(user)).to.be.eq(half);
        expect(await vault.balances(user.address, wethAddress)).to.be.eq(half);
    });

    it("unwraps WETH", async () => {
        await wethToken.connect(wethHolder).approve(vault.target, full);

        await vault.connect(wethHolder).depositToken(wethAddress, full);

        await expect(vault.connect(wethHolder).unwrapEth(more)).to.be.revertedWith("Insufficient WETH balance");

        await vault.connect(wethHolder).unwrapEth(half);

        expect(await vault.ethBalances(wethHolder.address)).to.be.eq(half);
        expect(await vault.balances(wethHolder.address, wethAddress)).to.be.eq(half);
    });
});
