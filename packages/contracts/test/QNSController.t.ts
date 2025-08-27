import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("QNSController", () => {
  async function deploy() {
    const C = await ethers.getContractFactory("QNSController");
    const c = await C.deploy();
    await c.waitForDeployment();
    const [owner] = await ethers.getSigners();
    return { c, owner };
  }

  it("commit -> pending stored and event emitted", async () => {
    const { c, owner } = await deploy();
    const node = ethers.ZeroHash; // bytes32(0)
    const secret = ethers.keccak256(ethers.toUtf8Bytes("s"));
    const expiresAt = (await time.latest()) + 3600;

    const tx = await c.commit(node, await owner.getAddress(), secret, expiresAt);
    await expect(tx).to.emit(c, "Commit");

    const h = await c.computeCommitHash(node, await owner.getAddress(), secret, expiresAt);
    const p = await c.getPending(h);
    expect(p.owner).to.equal(await owner.getAddress());
    expect(p.secret).to.equal(secret);
    expect(p.expiresAt).to.equal(expiresAt);
  });

  it("reveal clears pending and emits", async () => {
    const { c, owner } = await deploy();
    const node = ethers.ZeroHash;
    const secret = ethers.keccak256(ethers.toUtf8Bytes("s2"));
    const expiresAt = (await time.latest()) + 3600;

    await c.commit(node, await owner.getAddress(), secret, expiresAt);
    const h = await c.computeCommitHash(node, await owner.getAddress(), secret, expiresAt);

    const tx = await c.reveal(node, await owner.getAddress(), secret, expiresAt);
    await expect(tx).to.emit(c, "Reveal");

    const p = await c.getPending(h);
    expect(p.owner).to.equal(ethers.ZeroAddress);
  });

  it("prevents duplicate commit for same hash", async () => {
    const { c, owner } = await deploy();
    const node = ethers.ZeroHash;
    const secret = ethers.keccak256(ethers.toUtf8Bytes("dup"));
    const expiresAt = (await time.latest()) + 3600;

    await c.commit(node, await owner.getAddress(), secret, expiresAt);
    await expect(
      c.commit(node, await owner.getAddress(), secret, expiresAt)
    ).to.be.revertedWith("already committed");
  });

  it("reveal fails if expired", async () => {
    const { c, owner } = await deploy();
    const node = ethers.ZeroHash;
    const secret = ethers.keccak256(ethers.toUtf8Bytes("exp"));
    const expiresAt = (await time.latest()) + 3600; // ensure strictly in the future at commit time

    await c.commit(node, await owner.getAddress(), secret, expiresAt);
    await time.increaseTo(expiresAt + 1);

    await expect(
      c.reveal(node, await owner.getAddress(), secret, expiresAt)
    ).to.be.revertedWith("commit expired");
  });

  it("reveal fails if no such commit", async () => {
    const { c, owner } = await deploy();
    const node = ethers.ZeroHash;
    const secret = ethers.keccak256(ethers.toUtf8Bytes("none"));
    const expiresAt = (await time.latest()) + 3600;

    await expect(
      c.reveal(node, await owner.getAddress(), secret, expiresAt)
    ).to.be.revertedWith("no such commit");
  });
});
