# Bluesky Imposter Blocklist

This project uses the Bluesky API and Jetstream WebSocket to monitor activity on the Bluesky network and block imposter accounts by adding them to a specified blocklist. The script identifies imposters based on their display names and Decentralized Identifiers (DIDs). It is intended as an example implementation and is meant to serve as a starting point for others to use. Users are encouraged to fork the repository and modify it to suit their needs.

## Features
- Connects to the Bluesky Jetstream WebSocket to receive activity data in real time.
- Filters incoming commit messages to identify profile updates.
- Matches display names against known imposter profiles.
- Blocks identified imposter accounts by adding them to a blocklist.

## Requirements
- Node.js (version 18 or later)
- A Bluesky account
- A Jetstream WebSocket endpoint

## Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install Dependencies
Run the following command to install required Node.js packages:
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root of the project and add the following variables:

```plaintext
JETSTREAM_WS_URL=wss://jetstream2.us-west.bsky.network/subscribe?wantedCollections=app.bsky.actor.profile
BSKY_SERVICE_URL=https://bsky.social
BSKY_IDENTIFIER=your_bsky_handle
BSKY_PASSWORD=your_bsky_password
BLOCKLIST_URI=at://did:plc:example/app.bsky.graph.list/blocklist_id
```
Replace `your_bsky_handle`, `your_bsky_password`, and other placeholders with your actual Bluesky account details and blocklist URI.

### 4. Compile the Code
```bash
npm run build
```

### 5. Run the Application
Start the application using:
```bash
npm start
```

## How It Works
1. The script establishes a WebSocket connection to the Jetstream endpoint defined in `JETSTREAM_WS_URL`.
2. It listens for commit messages, filtering for those related to user profiles (`app.bsky.actor.profile`).
3. When a profile update is received, the display name is normalized (e.g., spaces are removed, and the name is converted to lowercase).
4. Known imposter profiles (e.g., "elonmusk", "jackmallers") are identified and blocked by adding their DID to the blocklist specified in `BLOCKLIST_URI`.

## Example Output
When an imposter is identified and blocked, the console logs:
```plaintext
Blocking Elon Musk Imposter
Blocking Jack Mallers Imposter
```

If the WebSocket connection is successful, you’ll see:
```plaintext
Starting WebSocket connection...
Creating BskyAgent instance...
Logged in successfully!
Connected to the WebSocket server
```

## Graceful Shutdown
The application listens for `SIGINT` and `SIGTERM` signals to close the WebSocket connection and exit cleanly.

## Known Issues
- Ensure the `.env` file is correctly configured; otherwise, the script may fail to authenticate or connect to the WebSocket.
- The WebSocket URL must support the desired collections for the project to work correctly.

## Contributing
1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to your fork and submit a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

### Disclaimer
This script is intended for demonstration purposes and should be used responsibly. Ensure compliance with Bluesky’s terms of service and guidelines when using this application.

