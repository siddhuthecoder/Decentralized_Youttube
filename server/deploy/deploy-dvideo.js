const { ethers, network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    
    // Deploy the contract
    // console.log(network.config,chainId);

    const dVideo = await deploy("DVideo", {
        from: deployer,
        args: [], 
        log: true,
    });

    log(`DVideo contract deployed at address: ${dVideo.address}`);
};

module.exports.tags = ["all", "Dvideo"];
