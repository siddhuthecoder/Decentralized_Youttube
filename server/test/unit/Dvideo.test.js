const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");

describe('DVideo', () => {
    let DvideoContract;
    let deployer;

    beforeEach(async () => {
        // Get the deployer account from named accounts
        const namedAccounts = await getNamedAccounts();
        deployer = namedAccounts.deployer;

        // Deploy contracts using the fixture
        await deployments.fixture(["all"]);

        // Get the deployed DVideo contract connected with the deployer
        DvideoContract = await ethers.getContract("DVideo", deployer);
    });

    describe("registerUser", () => {
        it("should register a user successfully", async () => {
            const userName = "Alice";
            await DvideoContract.connect(await ethers.getSigner(deployer)).registerUser(userName);
            
            const user = await DvideoContract.users(deployer);
            assert.equal(user.name, userName);
            assert.equal(user.userAddress, deployer);
        });

        it("should not allow to register without a name", async () => {
            await expect(DvideoContract.connect(await ethers.getSigner(deployer)).registerUser("")).to.be.revertedWith("revert");
        });

        it("should not allow to register the same address twice", async () => {
            await DvideoContract.connect(await ethers.getSigner(deployer)).registerUser("Alice");
            await expect(DvideoContract.connect(await ethers.getSigner(deployer)).registerUser("Bob")).to.be.revertedWith("revert");
        });
    });

    describe("uploadVideo", () => {
        beforeEach(async () => {
            await DvideoContract.connect(await ethers.getSigner(deployer)).registerUser("Alice");
        });

        it("should upload a video successfully", async () => {
            const videoHash = "QmHash";
            const videoTitle = "VideoTitle";

            await DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo(videoHash, videoTitle);

            const video = await DvideoContract.videos(1);
            assert.equal(video.hash, videoHash);
            assert.equal(video.title, videoTitle);
            assert.equal(video.author, deployer);

            const userVideos = await DvideoContract.getVideosOfUser(deployer);
            assert.equal(userVideos.length, 1);
            assert.equal(userVideos[0], 1);
        });

        it("should not upload a video without hash", async () => {
            await expect(DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("", "VideoTitle")).to.be.revertedWith("revert");
        });

        it("should not upload a video without title", async () => {
            await expect(DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("QmHash", "")).to.be.revertedWith("revert");
        });

        it("should not upload a video if the uploader is not registered", async () => {
            const otherAccount = (await ethers.getSigners())[1];
            await expect(DvideoContract.connect(otherAccount).uploadVideo("QmHash", "VideoTitle")).to.be.revertedWith("revert");
        });
    });

    describe("getAllVideos", () => {
        beforeEach(async () => {
            await DvideoContract.connect(await ethers.getSigner(deployer)).registerUser("Alice");
            await DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("QmHash1", "VideoTitle1");
            await DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("QmHash2", "VideoTitle2");
        });

        it("should return all video IDs", async () => {
            const allVideos = await DvideoContract.getAllVideos();
            assert.equal(allVideos.length, 2);
            assert.equal(allVideos[0], 1);
            assert.equal(allVideos[1], 2);
        });
    });

    describe("getVideoByName", () => {
        beforeEach(async () => {
            await DvideoContract.connect(await ethers.getSigner(deployer)).registerUser("Alice");
            await DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("QmHash1", "VideoTitle1");
            await DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("QmHash2", "VideoTitle2");
            await DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("QmHash3", "VideoTitle1");
        });

        it("should return video IDs matching the title", async () => {
            const matchingVideos = await DvideoContract.getVideoByName("VideoTitle1");
            assert.equal(matchingVideos.length, 2);
            assert.equal(matchingVideos[0], 1);
            assert.equal(matchingVideos[1], 3);
        });

        it("should return an empty array if no videos match the title", async () => {
            const matchingVideos = await DvideoContract.getVideoByName("NonExistentTitle");
            assert.equal(matchingVideos.length, 0);
        });
    });

    describe("getVideosOfUser", () => {
        beforeEach(async () => {
            await DvideoContract.connect(await ethers.getSigner(deployer)).registerUser("Alice");
            await DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("QmHash1", "VideoTitle1");
            await DvideoContract.connect(await ethers.getSigner(deployer)).uploadVideo("QmHash2", "VideoTitle2");
        });

        it("should return video IDs uploaded by the user", async () => {
            const userVideos = await DvideoContract.getVideosOfUser(deployer);
            assert.equal(userVideos.length, 2);
            assert.equal(userVideos[0], 1);
            assert.equal(userVideos[1], 2);
        });

        it("should return an empty array if the user has no videos", async () => {
            const otherAccount = (await ethers.getSigners())[1];
            await DvideoContract.connect(otherAccount).registerUser("Bob");
            const userVideos = await DvideoContract.getVideosOfUser(otherAccount.address);
            assert.equal(userVideos.length, 0);
        });
    });
});
