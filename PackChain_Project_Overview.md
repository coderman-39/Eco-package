# PackChain Project Overview (Ultra-Detailed)

---

## 1. Project Use Case & Vision

**PackChain** is a blockchain- and IoT-powered system for tracking, rewarding, and analyzing the lifecycle of e-commerce packaging (e.g., Flipkart, logistics, manufacturers). It enables:
- **End-to-end package tracking** (from manufacturer to customer and back for returns)
- **Sustainability rewards** (token incentives for eco-friendly actions)
- **Real-time IoT monitoring** (RFID/NFC, sensors for temperature, shock, etc.)
- **Immutable audit trails** (blockchain-backed)
- **Analytics for all stakeholders** (retailers, logistics, auditors, customers)

**Business Value:**
- Reduces packaging waste
- Increases transparency and trust
- Automates rewards for sustainable behavior
- Enables data-driven supply chain improvements

---

## 2. End-to-End Flow (What Happens in the Project)

### A. Package Creation & Registration
- Manufacturer creates a package (with RFID/NFC tag)
- Package is registered on the blockchain (chaincode: `createPackage`)
- IoT device (e.g., RFID reader) records initial sensor data

### B. Package Movement & Tracking
- As the package moves (manufacturer → warehouse → delivery → customer),
  - IoT devices at each checkpoint scan the tag and send telemetry (location, status, sensor data) via MQTT
  - Backend ingests this data, updates package status, and records events on the blockchain (`updatePackageStatus`)

### C. Package Return & Rewards
- Customer returns the package at a collection point
- IoT device scans the tag, backend verifies return, and triggers a blockchain transaction (`recordReturn`)
- Tokens are awarded to the customer (`transferTokens`)

### D. Analytics & Dashboard
- All data (package status, returns, rewards, IoT health) is available in real time on the frontend dashboard
- Stakeholders can view sustainability metrics, package history, and network health

---

## 3. Technologies Used & Where

| Technology                | Where/How Used                                                                 |
|---------------------------|-------------------------------------------------------------------------------|
| **Node.js**               | Backend server (API, blockchain, IoT integration)                             |
| **Express.js**            | REST API framework for backend                                                |
| **MongoDB**               | Database for users, packages, transactions, tokens, leaderboard               |
| **Hyperledger Fabric**    | Permissioned blockchain for package lifecycle, rewards, audit trail            |
| **fabric-network SDK**    | Backend service to connect to Fabric, submit/query chaincode                  |
| **MQTT (Mosquitto, etc.)**| IoT message broker for device data ingestion                                  |
| **mqtt (npm package)**    | Node.js client to subscribe to device topics                                  |
| **React**                 | Frontend SPA/dashboard                                                        |
| **Vite**                  | Frontend build tool                                                           |
| **Tailwind CSS**          | Frontend styling                                                              |
| **Socket.io**             | (Optional) Real-time WebSocket events (legacy, replaced by SSE for IoT)       |
| **Server-Sent Events (SSE)**| Real-time IoT event streaming to frontend                                   |
| **Docker**                | (Recommended) For running Fabric, MQTT, MongoDB locally                       |
| **PM2**                   | (Recommended) Process manager for backend in production                       |

---

## 4. File/Directory Structure & What Is Where

```
root/
├── server/                  # Backend (Node.js, Express)
│   ├── index.js             # Main server entrypoint (API, WebSocket, service init)
│   ├── .env                 # Backend environment variables
│   ├── connection-org1.json # Fabric connection profile
│   ├── wallet/              # Fabric user credentials (auto-generated)
│   ├── models/              # Mongoose models (User, Package, Transaction, etc.)
│   ├── routes/              # Express route handlers (auth, blockchain, iot, etc.)
│   ├── services/            # Core business logic (blockchain.js, iot.js)
│   ├── middleware/          # Express middleware (auth, error handling)
│   └── ...
├── src/                     # Frontend (React, Vite)
│   ├── App.tsx              # Main React app
│   ├── components/          # UI and feature components (Dashboard, Tracker, etc.)
│   ├── hooks/               # Custom React hooks (e.g., useApi)
│   ├── lib/                 # API utilities
│   ├── pages/               # Page-level components
│   └── ...
├── public/                  # Static assets
├── DEPLOYMENT.md            # Ultra-detailed deployment guide
├── README.md                # Project intro
└── ...
```

### Key Backend Files
- `server/index.js`: Starts the server, connects to MongoDB, initializes Fabric and IoT services, sets up API routes and WebSocket/SSE.
- `server/services/blockchain.js`: Handles all blockchain logic (connects to Fabric, submits/queries chaincode, manages wallet).
- `server/services/iot.js`: Handles MQTT connection, device data ingestion, real-time event streaming.
- `server/routes/blockchain.js`: API endpoints for blockchain actions (status, invoke/query chaincode).
- `server/routes/iot.js`: API endpoints for IoT device data, network health, commands, and SSE event stream.
- `server/models/`: Mongoose schemas for all persistent data (User, Package, Transaction, etc.).

### Key Frontend Files
- `src/components/PackChainDashboard.tsx`: Main dashboard, shows live stats, activity, and tabs for all features.
- `src/components/PackageTracker.tsx`: UI for tracking package status/history.
- `src/components/TokenWallet.tsx`: UI for user token balance and rewards.
- `src/components/LeaderBoard.tsx`: UI for gamified rewards leaderboard.
- `src/components/BlockchainNetwork.tsx`: UI for network/chaincode status.
- `src/hooks/useApi.ts`: Custom React hook for API data fetching.
- `src/lib/api.ts`: Axios instance for API calls.

---

## 5. Detailed Flow: How Data Moves Through the System

### 1. Package Registered
- Manufacturer (or admin) calls API to register a package
- Backend submits `createPackage` transaction to Fabric
- Package info is stored on blockchain and in MongoDB

### 2. IoT Device Sends Data
- Device (e.g., RFID reader) scans package, sends telemetry/status to MQTT broker
- Backend (via `iot.js`) subscribes to topics, receives data, updates device/package status in memory and/or MongoDB
- If event is significant (e.g., package returned), backend submits `recordReturn` to Fabric and triggers token reward
- Real-time event is streamed to frontend via SSE

### 3. User/Client Views Dashboard
- Frontend fetches analytics and package data via REST API
- Subscribes to `/api/iot/events` SSE endpoint for live updates
- UI updates in real time as new events arrive (e.g., package returned, tokens awarded)

### 4. Rewards & Analytics
- When a return is verified, tokens are transferred on-chain (`transferTokens`)
- All actions are auditable via blockchain history (`getPackageHistory`)
- Analytics endpoints aggregate data for dashboard (returns, tokens, sustainability metrics)

---

## 6. Security & Best Practices
- All sensitive actions require authentication (JWT, see `auth.js` middleware)
- Fabric network is secured with TLS, CA, and org-level access control
- MQTT broker should use authentication and ACLs
- CORS is restricted to trusted frontend origins
- All API and system errors are logged for auditing
- Regular backups of MongoDB and Fabric wallet are recommended

---

## 7. How to Extend or Customize
- **Add new chaincode functions:** Update Fabric chaincode, redeploy, and add new API endpoints in `blockchain.js`/`blockchain.js` route
- **Add new device types:** Update MQTT topic subscriptions and device data parsing in `iot.js`
- **Change reward logic:** Update business logic in `blockchain.js` and/or `iot.js`
- **Add new analytics:** Add new aggregation endpoints in backend and new UI components in frontend

---

## 8. Summary Table: Who Should Read What

| Role              | Start Here                | Deep Dive Files/Dirs                |
|-------------------|--------------------------|-------------------------------------|
| **DevOps**        | DEPLOYMENT.md            | server/.env, connection-org1.json   |
| **Backend Dev**   | server/index.js, services| server/routes/, server/models/      |
| **Frontend Dev**  | src/components/          | src/hooks/, src/lib/api.ts          |
| **Client/Partner**| DEPLOYMENT.md, Overview  | N/A                                 |
| **Auditor**       | Overview, blockchain.js  | server/services/blockchain.js       |

---

## 9. Visual Flow Diagram (Text)

```
[Manufacturer] --register--> [Backend API] --submit--> [Fabric Blockchain]
      |
      v
[IoT Device] --MQTT--> [Backend IoT Service] --update--> [MongoDB, Blockchain]
      |
      v
[Frontend Dashboard] <--REST/SSE-- [Backend API]
```

---

## 10. Further Reading & Support
- See `DEPLOYMENT.md` for step-by-step setup
- See `README.md` for a quick intro
- For code details, see comments in each file and the above directory map
- For help, contact the PackChain dev team or your system integrator 