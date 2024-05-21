const { ethers, network, deployments, getNamedAccounts } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const DVideo = await ethers.getContract("DVideo", deployer);

    console.log("Interacting with DVideo Contract...");

    // Define user details and video details
    const userName = "YourUserName";
    const videoHash = "YourVideoHash";
    const videoTitle = "YourVideoTitle";

    // Function to check if a user is registered
    async function isUserRegistered(address) {
        const user = await DVideo.users(address);
        return user.userAddress !== ethers.constants.AddressZero;
    }

    // Register user if not registered
    const userRegistered = await isUserRegistered(deployer);
    console.log(`Is user registered: ${userRegistered}`);

    if (!userRegistered) {
        console.log("Registering user...");
        const registerTx = await DVideo.registerUser(userName);
        await registerTx.wait();
        console.log(`User registered with name: ${userName}`);
    }

    // Upload the video
    console.log("Uploading video...");
    const uploadTx = await DVideo.uploadVideo(videoHash, videoTitle);
    await uploadTx.wait();
    console.log(`Video uploaded with hash: ${videoHash} and title: ${videoTitle}`);

    // Fetch all videos
    const allVideos = await DVideo.getAllVideos();
    console.log("All Videos:", allVideos.map(v => v.toString()));

    // Function to get videos by name
    async function getVideoByName(name) {
        const videoIds = await DVideo.getVideoByName(name);
        return videoIds.map(id => id.toString());
    }

    // Fetch videos by name
    const videosByName = await getVideoByName(videoTitle);
    console.log(`Videos with title "${videoTitle}":`, videosByName);

   // Fetch details for multiple videos using a for loop
for (let i = 1; i <= allVideos.length; i++) {
    const videoById = await getVideoById(i);
    console.log(`Video with ID ${i}:`, videoById);
}
}

main()
    .then(() => {
        console.log("Script executed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error occurred", error);
        process.exit(1);
    });
