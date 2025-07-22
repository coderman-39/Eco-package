/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

//'use strict';
import { Gateway, Wallets } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Helper function to get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
// These should be moved to environment variables or a dedicated config file
const channelName = process.env.FABRIC_CHANNEL_NAME || 'mychannel';
const chaincodeName = process.env.FABRIC_CHAINCODE_NAME || 'basic';
const mspId = process.env.FABRIC_MSP_ID || 'Org1MSP';
const walletPath = path.join(__dirname, '..', 'wallet');
const org1UserId = 'appUser';

// Path to the connection profile
const connectionProfilePath = path.resolve(
  __dirname,
  '..',
  process.env.FABRIC_CONNECTION_PROFILE || 'connection-org1.json'
);


/**
 * @typedef {Object} FabricConnection
 * @property {import('fabric-network').Contract} contract - The Fabric contract object.
 * @property {import('fabric-network').Gateway} gateway - The Fabric gateway instance.
 */

/**
 * Connects to the Fabric gateway and returns the contract and gateway objects.
 * @returns {Promise<FabricConnection>}
 */
async function connectToGateway() {
  const ccp = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: org1UserId,
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork(channelName);
  const contract = network.getContract(chaincodeName);
  
  return { contract, gateway };
}


/**
 * Initializes the blockchain service.
 * In a real scenario, this would enroll the admin and register the user if they don't exist.
 */
export const initializeBlockchain = async () => {
    console.log('🔗 Initializing Hyperledger Fabric Connection...');
    try {
        const ccp = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
        const caInfo = ccp.certificateAuthorities[ccp.organizations[mspId.slice(0, -3)].ca];
        const ca = new FabricCAServices(caInfo.url);

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Running enrollment process for admin...');
            // TODO: Replace with your CA admin credentials from your Fabric network setup
            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspId,
                type: 'X.509',
            };
            await wallet.put('admin', x509Identity);
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        }

        const userIdentity = await wallet.get(org1UserId);
        if (!userIdentity) {
            console.log(`An identity for the user "${org1UserId}" does not exist in the wallet`);
            console.log('Running registration and enrollment process for user...');
            const adminUser = await gateway.getIdentity('admin');
            const provider = wallet.getProviderRegistry().getProvider(adminUser.type);
            const adminUserContext = await provider.getUserContext(adminUser, 'admin');

            const secret = await ca.register({
                affiliation: 'org1.department1', // or other affiliation
                enrollmentID: org1UserId,
                role: 'client'
            }, adminUserContext);

            const enrollment = await ca.enroll({
                enrollmentID: org1UserId,
                enrollmentSecret: secret
            });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspId,
                type: 'X.509',
            };
            await wallet.put(org1UserId, x509Identity);
            console.log(`Successfully registered and enrolled user "${org1UserId}" and imported it into the wallet`);
        }

        console.log('✅ Hyperledger Fabric connection initialized successfully.');
    } catch (error) {
        console.error(`❌ Failed to initialize Fabric connection: ${error}`);
        process.exit(1);
    }
};


/**
 * Submits a transaction to the ledger.
 * @param {string} functionName - The name of the chaincode function to invoke.
 * @param {string[]} args - The arguments to pass to the chaincode function.
 * @returns {Promise<Buffer>} The result from the chaincode.
 */
export const submitTransaction = async (functionName, args) => {
  let gateway;
  try {
    const connection = await connectToGateway();
    gateway = connection.gateway;
    const contract = connection.contract;

    console.log(`\n--> Submitting transaction: ${functionName} with arguments: ${args.join(', ')}`);
    const result = await contract.submitTransaction(functionName, ...args);
    console.log('*** Transaction committed successfully');
    return result;
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    throw error;
  } finally {
    if (gateway) {
      gateway.disconnect();
    }
  }
};


/**
 * Evaluates a query on the ledger. This does not result in a transaction being committed.
 * @param {string} functionName - The name of the chaincode function to query.
 * @param {string[]} args - The arguments to pass to the chaincode function.
 * @returns {Promise<Buffer>} The result from the chaincode.
 */
export const evaluateTransaction = async (functionName, args) => {
  let gateway;
  try {
    const connection = await connectToGateway();
    gateway = connection.gateway;
    const contract = connection.contract;

    console.log(`\n--> Evaluating query: ${functionName} with arguments: ${args.join(', ')}`);
    const result = await contract.evaluateTransaction(functionName, ...args);
    console.log(`*** Query successful, result: ${result.toString()}`);
    return result;
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    throw error;
  } finally {
    if (gateway) {
      gateway.disconnect();
    }
  }
};


// --- Placeholder functions to replace the old simulation API ---

export const getNetworkStatus = async () => {
  // This is a simplified representation. A real implementation would query peers/orderers.
  // For now, it confirms connectivity.
  let gateway;
  try {
    const connection = await connectToGateway();
    gateway = connection.gateway;
    const network = await gateway.getNetwork(channelName);
    
    // Getting peers for the channel
    const channel = network.getChannel();
    const peers = channel.getEndorsers(mspId);

    return {
      success: true,
      network: {
        name: 'PackChain Network (Live)',
        gateway: gateway.getIdentity().mspId,
        channel: channelName,
      },
      peers: peers.map(p => ({id: p.name, mspId: p.mspId})),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
      console.error('Failed to get network status:', error);
      return { success: false, message: error.message };
  } finally {
      if (gateway) {
          gateway.disconnect();
      }
  }
};

export const getChaincodeInfo = () => {
  // This is static info now, as chaincode functions are not dynamically queryable
  // in the same way as the simulation. The client should know the contract API.
  return {
    name: chaincodeName,
    channel: channelName,
    description: 'Live PackChain Chaincode on Hyperledger Fabric.',
    // The client application should be aware of the available functions.
    // This can be part of the API documentation or a separate configuration.
    functions: [
      'createPackage',
      'updatePackageStatus',
      'transferTokens',
      'recordReturn',
      'getPackageHistory',
      'queryPackage',
      // Add other real chaincode functions here
    ]
  };
};

// The old `simulateNetworkActivity` is no longer needed as the network is live.
// The old `getPeerStatus` and `getOrdererStatus` are replaced by `getNetworkStatus`. 