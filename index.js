const express = require("express");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const abi = require("./abi.json");
require("dotenv").config();

const app = express();
const port = 4000; // Port number for the Express server

app.use(bodyParser.json()); // Middleware to parse JSON bodies

const contractAddress = "0xDd21Cf61DD3e47cEC1bC5190915D726c8B0876C1";
const url = "https://sepolia.mode.network";

async function performScheduledTask(privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Wallet address: ${wallet.address}`);
  console.log("Performing scheduled task...");
  const provider = new ethers.providers.JsonRpcProvider(url);
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signer = new ethers.Wallet(privateKey, provider);
  const txSigner = contract.connect(signer);
  const tx = await txSigner.distro();
  await tx.wait();
  console.log("Transaction sent!");
}

app.get("/", (req, res) => {
  res.send("Server running");
});

app.post("/performScheduledTask", async (req, res) => {
  const { privateKey } = req.body;
  if (!privateKey) {
    return res.status(400).send("PrivateKey is required");
  }
  try {
    await performScheduledTask(privateKey);
    res.send("Scheduled task performed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error performing scheduled task");
  }
});

function scheduleTask() {
  console.log("Sending POST request to /performScheduledTask every minute");

  const privateKey = process.env.PRIVATE_KEY;

  fetch("http://localhost:4000/performScheduledTask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ privateKey }), // Replace with actual method to securely retrieve the privateKey
  })
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error("Error:", error));
}
const midnightUtc = new Date();
midnightUtc.setUTCHours(0, 0, 0, 0); // Set the time to midnight UTC
setInterval(scheduleTask, midnightUtc); // Call scheduleTask every 1 minute (60 * 1000 milliseconds)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
