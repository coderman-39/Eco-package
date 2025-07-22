# PackChain Production Deployment Guide (Ultra-Detailed)

This guide will walk you through every step to deploy the PackChain system for real-world use with live Hyperledger Fabric and IoT integrations. No prior blockchain or IoT experience is required. Every command, file, and configuration is explained in detail.

---

## 1. Prerequisites

### Hardware/Software Requirements
- **Operating System:** Linux (Ubuntu 20.04+ recommended), macOS, or Windows 10+ (with WSL2 for best results)
- **CPU:** 2+ cores
- **RAM:** 4GB minimum (8GB+ recommended)
- **Disk:** 10GB+ free space

### Software to Install
- **Node.js** (v16 or v18 recommended)
  - [Download Node.js](https://nodejs.org/en/download/)
  - To check installation: `node -v` and `npm -v`
- **npm** (comes with Node.js)
- **MongoDB** (local or managed)
  - [Install MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - To check installation: `mongod --version`
- **Git**
  - [Download Git](https://git-scm.com/downloads)
  - To check installation: `git --version`
- **Docker** (for running Fabric and MQTT locally)
  - [Install Docker](https://docs.docker.com/get-docker/)
  - To check installation: `docker --version`
- **(Optional) Docker Compose**
  - [Install Docker Compose](https://docs.docker.com/compose/install/)

---

## 2. Clone the Repository

```bash
git clone <your-repo-url> packchain
cd packchain
```

---

## 3. Directory Structure Overview

```
packchain/
├── server/                # Node.js backend (API, blockchain, IoT)
│   ├── .env               # Backend environment variables
│   ├── connection-org1.json # Fabric connection profile
│   ├── wallet/            # Fabric user credentials (auto-generated)
│   └── ...
├── src/                   # Frontend (React)
│   └── ...
├── DEPLOYMENT.md          # This guide
└── ...
```

---

## 4. Environment Variables

### Backend (`server/.env`)
Create this file if it does not exist:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/packchain

# Server
PORT=3001
FRONTEND_URL=http://localhost:8080
NODE_ENV=production

# Hyperledger Fabric
FABRIC_CHANNEL_NAME=mychannel
FABRIC_CHAINCODE_NAME=basic
FABRIC_MSP_ID=Org1MSP
FABRIC_CONNECTION_PROFILE=connection-org1.json

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
```

### Frontend (`.env` or `.env.local` in root or `src/`)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 5. Hyperledger Fabric Setup (Blockchain)

### A. Quickstart with Test Network (for local development)

1. **Install Fabric Samples and Binaries**
   ```bash
   curl -sSL https://bit.ly/2ysbOFE | bash -s
   cd fabric-samples/test-network
   ```
2. **Start the Test Network**
   ```bash
   ./network.sh up createChannel -c mychannel -ca
   ```
3. **Deploy Chaincode**
   ```bash
   ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
   ```
4. **Export Connection Profile**
   - Copy `fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json` to `server/`.
   - Update all file paths in the JSON to be absolute or relative to your server directory.

### B. Production Fabric Network
- Follow the [official Fabric documentation](https://hyperledger-fabric.readthedocs.io/en/latest/deployment_guide_overview.html) for multi-org, multi-peer setup.
- Deploy your chaincode (e.g., `packchain-cc`).
- Export and update your connection profile as above.

### C. Wallet Directory
- The backend will create a `server/wallet/` directory to store user credentials. Ensure this directory is writable.

### D. Admin Credentials
- If your CA admin username/password is not `admin`/`adminpw`, update the `initializeBlockchain` function in `server/services/blockchain.js` accordingly.

---

## 6. MQTT Broker Setup (IoT)

### A. Run Mosquitto Broker with Docker (Recommended for Local)
```bash
docker run -it -p 1883:1883 -p 9001:9001 eclipse-mosquitto
```

### B. Create a User (Optional, for security)
- Create a password file:
  ```bash
  docker exec -it <container_id> mosquitto_passwd -c /mosquitto/config/passwordfile your_mqtt_username
  ```
- Update your `.env` with the username and password.

### C. Device Topic Structure
- Devices should publish to:
  - `iot/{deviceId}/telemetry` (JSON payload, e.g. `{ "temperature": 22.5, "humidity": 60 }`)
  - `iot/{deviceId}/status` (JSON payload, e.g. `{ "status": "online", "battery": 95 }`)
  - `iot/{readerId}/nfc` (for NFC scans, e.g. `{ "tagId": "1234ABCD", "timestamp": "..." }`)

### D. Test with MQTT CLI
- Install [MQTT Explorer](https://mqtt-explorer.com/) or use CLI:
  ```bash
  npm install -g mqtt
  mqtt pub -h localhost -t 'iot/test-device/telemetry' -m '{"temperature":25,"humidity":55}'
  mqtt sub -h localhost -t 'iot/#'
  ```

---

## 7. MongoDB Setup

### A. Local MongoDB
- Start MongoDB:
  ```bash
  mongod --dbpath <your-db-path>
  ```
- Default URI: `mongodb://localhost:27017/packchain`

### B. Managed MongoDB (Atlas)
- [Create a free cluster](https://www.mongodb.com/atlas/database)
- Get your connection string and update `MONGODB_URI` in `.env`.

---

## 8. Backend Setup

```bash
cd server
npm install
npm run build # if using TypeScript, else skip
npm start
```
- The backend will connect to MongoDB, Fabric, and MQTT on startup.
- Health check: [http://localhost:3001/health](http://localhost:3001/health)
- API base: [http://localhost:3001/api](http://localhost:3001/api)

#### Logs
- All logs are printed to the console. For production, use a process manager like [PM2](https://pm2.keymetrics.io/):
  ```bash
  npm install -g pm2
  pm2 start npm --name packchain-backend -- start
  ```

---

## 9. Frontend Setup

```bash
npm install
npm run build
npm run preview # or use your preferred static host
```
- Update the frontend `.env` if needed to point to the backend API.
- Deploy to Vercel, Netlify, AWS Amplify, or your preferred host.

#### Example Vercel Deployment
- [Sign up for Vercel](https://vercel.com/)
- Connect your GitHub repo
- Set `VITE_API_URL` in Vercel dashboard
- Deploy!

---

## 10. Security Best Practices

- **Use HTTPS** for all endpoints in production (use [Let's Encrypt](https://letsencrypt.org/) for free SSL).
- **Secure Fabric**: Use TLS, strong CA credentials, and restrict access to peers/orderers.
- **Restrict MQTT**: Use authentication, ACLs, and firewall rules to limit access.
- **JWT Secrets**: If using authentication, set strong secrets in your `.env`.
- **CORS**: Only allow trusted frontend origins in the backend CORS config.
- **Monitoring**: Use [PM2](https://pm2.keymetrics.io/), [Datadog](https://www.datadoghq.com/), or [Prometheus](https://prometheus.io/) for monitoring.
- **Backups**: Regularly back up your MongoDB database and Fabric wallets.

---

## 11. Client Onboarding

### A. IoT Devices
- Provide device IDs and credentials to your clients.
- Devices must publish to the correct MQTT topics (see above).
- For new device types, update the backend topic subscriptions if needed.

### B. Blockchain
- To add a new organization:
  - Generate crypto material (certs/keys) for the org.
  - Update the Fabric network config and restart peers/orderers as needed.
  - Add the org to the connection profile and share with the client.
- To add a new user:
  - Use the CA to register/enroll a new user, then add their identity to the wallet.

### C. Environment Variables
- Document all required variables for each environment (see above).

### D. Support
- Offer onboarding calls, device provisioning, and network joining support as needed.

---

## 12. Troubleshooting

### A. Fabric Connection Errors
- Check that the Fabric network is running (`docker ps` for containers)
- Ensure the connection profile paths are correct
- Check the `server/wallet/` directory for user credentials
- Look for errors in the backend logs

### B. MQTT Issues
- Ensure the broker is running (`docker ps`)
- Test with `mqtt sub` and `mqtt pub` (see above)
- Check credentials and topic names

### C. MongoDB Issues
- Ensure MongoDB is running (`mongod`)
- Check the connection string in `.env`

### D. API Errors
- Check backend logs for stack traces
- Use [Postman](https://www.postman.com/) or [curl](https://curl.se/) to test endpoints

### E. Frontend Issues
- Check browser console for errors
- Ensure `VITE_API_URL` is set correctly

---

## 13. Useful Links

- [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/)
- [MQTT Protocol](https://mqtt.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Vercel](https://vercel.com/) | [Netlify](https://www.netlify.com/)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
- [MQTT Explorer](https://mqtt-explorer.com/)
- [Postman](https://www.postman.com/)

---

## 14. FAQ

**Q: How do I reset the Fabric wallet?**
A: Delete the `server/wallet/` directory and restart the backend. It will re-enroll users as needed.

**Q: How do I add a new chaincode function?**
A: Update your chaincode, redeploy it, and update the backend to call the new function.

**Q: How do I test the IoT event stream?**
A: Use `mqtt pub` to send a message to `iot/test-device/telemetry` and watch the dashboard update in real time.

**Q: How do I secure my deployment?**
A: Use HTTPS, strong credentials, firewall rules, and regular monitoring as described above.

---

For further support, contact your system integrator or the PackChain development team. If you get stuck, copy any error messages and share them with your support contact for fast help. 