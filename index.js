const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const express = require("express");
const e = require("express");
const app = express();
const port = 3000;

let qrCodeImage = null; // To store the QR code as an image in base64 format
let clientReady = false; // To track if the client is ready

// Create a new client instance
const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth(),
});

// Serve a message or the QR code

app.get("/check", async (req, res) => {
  if (clientReady) {
    res.json({ message: "Client is ready!" });
  } else {
    if (qrCodeImage) {
      res.setHeader("Content-Type", "image/png");
      const imageBuffer = Buffer.from(qrCodeImage.split(",")[1], "base64");
      res.send(imageBuffer);
    } else {
      res.status(422).json({
        massage: "Client is not ready, and no QR code is available.",
      });
    }
  }
});
app.get("/", async (req, res) => {
  if (clientReady) {
    if (req.query.message && req.query.phone) {
      const phoneNumber = `856${req.query.phone}@c.us`; // Assuming Laos number, adjust as needed
      const phoneNumber2 = `856${req.query.phone2}@c.us`; // Assuming Laos number, adjust as needed
      try {
        const testLink =
          "https://videos.pond5.com/green-hacker-text-code-screen-footage-111722611_main_xxl.mp4";
        const media = MessageMedia.fromFilePath("./test.jpg");
        await client.sendMessage(phoneNumber, req.query.message);
        await client.sendMessage(phoneNumber, media);
        await client.sendMessage(phoneNumber, testLink);

        await client.sendMessage(phoneNumber2, req.query.message);
        await client.sendMessage(phoneNumber, media);
        await client.sendMessage(phoneNumber, testLink);
        res.json({ message: "Message sent successfully!" });
      } catch (error) {
        res.status(500).json({ massage: "Failed to send message." });
      }
    } else {
      res.status(422).json({
        massage:
          "Client is ready, but no message or phone number was provided.",
      });
    }
  } else if (qrCodeImage) {
    // If the client is not ready, return the QR code image
    res.setHeader("Content-Type", "image/png");
    const imageBuffer = Buffer.from(qrCodeImage.split(",")[1], "base64");
    res.send(imageBuffer);
    //     const imageData = `data:image/png;base64,${qrCodeImage.split(",")[1]}`;
    // res.json({ imageUrl: imageData });
  } else {
    res.status(422).json({
      massage: "Client is not ready, and no QR code is available.",
    });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  clientReady = true;
  console.log("Client is ready!");
});

// When the client receives a QR-Code
client.on("qr", (qr) => {
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.error("Failed to generate QR code:", err);
    } else {
      qrCodeImage = url; // Store the QR code as a base64 image
      console.log("QR code updated");
    }
  });
});

// Start the client
client.initialize();

// Handle incoming messages
client.on("message", (message) => {
  // if (message.body) {
  console.log(`Message from ${message.from}: ${message.body}`);
  // }
});
