const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { getNamedAccounts } = require("hardhat")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let mockV3Aggregator
          let deployer
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("Allow people to fund and Withdraw",async function(){
            await fundMe.fund({value:sendValue})
            await fundMe.withdraw();
            const endingBalance=await fundMe.provider.getBalance(fundMe.address);
            assert.equal(endingBalance.toString(),"0");
            
          })
      })
