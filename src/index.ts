import dotenv from "dotenv";
import { BskyAgent } from "@atproto/api";
import WebSocket from "ws";

// Define the structure of a Commit message received via WebSocket
interface Commit {
	did: string; // Decentralized Identifier of the user
	time_us: number; // Timestamp in microseconds
	kind: string; // Type of message (e.g., "commit")
	commit: {
		rev: string; // Revision ID of the commit
		operation: string; // Operation type (e.g., "create", "update")
		collection: string; // Collection namespace
		rkey: string; // Record key within the collection
		record: {
			$type: string; // Type of the record
			avatar: Blob; // Avatar image as a Blob object
			banner: Blob; // Banner image as a Blob object
			createdAt: string; // Creation timestamp of the record
			description: string; // Profile description
			displayName: string; // Display name of the user
		};
		cid: string; // Content Identifier
	};
}

// Define the structure of a Blob object (used for avatars, banners, etc.)
interface Blob {
	$type: string; // Type of the Blob
	ref: {
		$link: string; // URL reference to the Blob
	};
	mimeType: string; // MIME type of the Blob (e.g., "image/png")
	size: number; // Size of the Blob in bytes
}

// Load environment variables from a .env file
dotenv.config();

// WebSocket URL for connecting to the Jetstream server
const wsUrl = process.env.JETSTREAM_WS_URL!;

console.log("Starting WebSocket connection...");

// Initialize a WebSocket connection to the Jetstream server
const ws = new WebSocket(wsUrl);

console.log("Creating BskyAgent instance...");

// Create an instance of BskyAgent to interact with the Bluesky API
const agent = new BskyAgent({
	service: process.env.BSKY_SERVICE_URL!, // Base URL for the Bluesky service
});

// Main function to manage WebSocket and API interactions
const main = async () => {
	try {
		// Log in to the Bluesky API with credentials from environment variables
		await agent.login({
			identifier: process.env.BSKY_IDENTIFIER!, // User handle or DID
			password: process.env.BSKY_PASSWORD!, // User password
		});

		console.log("Logged in successfully!");

		// URI of the blocklist where imposters will be added
		const blockList = process.env.BLOCKLIST_URI!;

		// Keep the application running until the WebSocket is closed
		await new Promise<void>((resolve, reject) => {
			// Handle when the WebSocket connection opens
			ws.on("open", () => {
				console.log("Connected to the WebSocket server");
			});

			// Handle incoming messages from the WebSocket
			ws.on("message", (data: WebSocket.RawData) => {
				try {
					// Parse the received WebSocket message
					const message = JSON.parse(data.toString());

					// Process commit messages without labels (filter out irrelevant messages)
					if (message.kind === "commit" && !message.commit.record.labels) {
						const commit: Commit = message;

						// Normalize the display name to compare with known imposters
						const normalizedDisplayName = commit.commit.record.displayName
							.toLowerCase()
							.replace(/\s+/g, ""); // Remove spaces for matching

						// Handle known imposter cases
						switch (normalizedDisplayName) {
							case "elonmusk":
								console.log("Blocking Elon Musk Imposter");
								blockImposter(commit.did, blockList);
								break;
							case "jackmallers":
								// Example: improve checks by comparing the DID to a known value
								if (commit.did !== "did:plc:l4q3e43f3wt2zzbsfebubb2g") {
									console.log("Blocking Jack Mallers Imposter");
									blockImposter(commit.did, blockList);
								}
								break;
							case "vitalikbuterin":
								console.log("Blocking Vitalik Buterin Imposter");
								blockImposter(commit.did, blockList);
								break;
							case "markcuban":
								if (commit.did !== "did:plc:y5xyloyy7s4a2bwfeimj7r3b") {
									console.log("Blocking Mark Cuban Imposter");
									blockImposter(commit.did, blockList);
								}
								break;
							default:
								// No action for unknown display names
								break;
						}
					}
				} catch (error) {
					// Handle errors in message parsing or processing
					console.log("Error parsing message:", error);
					const message = JSON.parse(data.toString());
					console.log("Message:", message);
				}
			});

			// Handle when the WebSocket connection closes
			ws.on("close", () => {
				console.log("WebSocket connection closed.");
				resolve();
			});

			// Handle WebSocket errors
			ws.on("error", (error) => {
				console.error("WebSocket encountered an error:", error);
				reject(error);
			});
		});
	} catch (error) {
		// Log any errors encountered during execution
		console.error("An error occurred:", error);
	}
};

// Function to block an imposter by adding their DID to the blocklist
async function blockImposter(userDid: string, listUri: string) {
	await agent.com.atproto.repo.createRecord({
		repo: agent.session!.did, // Use the current session's DID
		collection: "app.bsky.graph.listitem", // Collection for list items
		record: {
			$type: "app.bsky.graph.listitem", // Type of the record
			subject: userDid, // DID of the user to block
			list: listUri, // URI of the blocklist
			createdAt: new Date().toISOString(), // Timestamp of the block
		},
	});
}

// Run the main function and handle any unhandled errors
main().catch((err) => console.error("Unhandled error:", err));

// Gracefully handle application shutdown
process.on("SIGINT", () => {
	console.log("SIGINT received. Closing WebSocket...");
	ws.close();
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("SIGTERM received. Closing WebSocket...");
	ws.close();
	process.exit(0);
});
