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

app.get("/events", (req, res) => {
    // Set Content-Type to text/event-stream
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Watch for changes in the file
    const watcher = fs.watch("/Users/mnishtala/Workspace/Practise/long-polling-demo/server/test.json", (eventType, filename) => {
        if (eventType === "change") {
            // Read the file contents when it changes
            fs.readFile("/Users/mnishtala/Workspace/Practise/long-polling-demo/server/test.json", "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading file:", err);
                    return;
                }
                // Send data as an SSE message
                res.write("data: " + JSON.stringify({ message: data }) + "\n\n");
            });
        }
    });

    // Send a comment to keep the connection open
    res.write(": Connection established\n\n");

    // Handle client disconnect
    req.on("close", () => {
        console.log("Client disconnected");
        watcher.close(); // Close the file watcher
        res.end(); // End the response stream
    });
});

app.listen(8082, () => console.log("Server listening on port 8082"));
