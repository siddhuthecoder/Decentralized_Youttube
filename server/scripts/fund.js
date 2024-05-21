async function main() {
    const { deployer } = await getNamedAccounts();
    const DVideo = await ethers.getContract("DVideo", deployer);

    console.log("Interacting with Contract...");

    // Fetch all videos
    const allVideosIds = await DVideo.getAllVideos();
    console.log("All Video IDs:", allVideosIds);

    // Fetch and print details of each video
    for (let i = 0; i < allVideosIds.length; i++) {
        const videoId = allVideosIds[i];
        const videoDetails = await DVideo.videos(videoId);
        console.log(`Video ID: ${videoDetails.id}, Hash: ${videoDetails.hash}, Title: ${videoDetails.title}, Author: ${videoDetails.author}`);
    }
}
main()