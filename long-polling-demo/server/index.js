import express from "express";
import fs from "fs";

const app = express();

// Enable CORS middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.get("/poll", (req, res) => {
    let fileData = "";
    let responseSent = false; // Flag to track if response has been sent
    
    // Function to send response
    function sendResponse() {
        clearInterval(intervalId);
        if (!responseSent) { // Send response only if not already sent
            res.send(fileData || "Timeout: data not received");
            responseSent = true; // Update flag to indicate response sent
        }
    }

    // Watch for changes in the file
    const watcher = fs.watch("/Users/mnishtala/Workspace/Practise/long-polling-demo/server/test.json", (eventType, filename) => {
        if (eventType === "change") {
            // Read the file contents when it changes
            fs.readFile("/Users/mnishtala/Workspace/Practise/long-polling-demo/server/test.json", "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading file:", err);
                    return;
                }
                // Update fileData with new contents
                fileData = data;
                sendResponse(); // Send response when file changes
            });
        }
    });

    const intervalId = setInterval(() => {
        if (fileData && !responseSent) {
            // If fileData is available and response not sent, send the response
            sendResponse();
        }
    }, 1000);

    // Close the connection after 10 seconds if data has not yet been received
    setTimeout(() => {
        sendResponse();
        watcher.close(); // Close the file watcher
    }, 10000);
});

app.listen(8081, () => console.log("Server listening on port 8081"));
