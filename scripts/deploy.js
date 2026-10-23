const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "Voting.sol", "Voting.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const config = {
    address,
    chainId: 31337,
    abi: artifact.abi
  };
  const outputPath = path.join(__dirname, "..", "frontend", "contract-config.js");
  fs.writeFileSync(outputPath, "window.VOTING_CONFIG = " + JSON.stringify(config, null, 2) + ";\n");
  console.log("Voting deployed at:", address);
  console.log("Frontend config written to:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
