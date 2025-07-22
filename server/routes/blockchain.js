import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  getNetworkStatus, 
  getChaincodeInfo, 
  submitTransaction, 
  evaluateTransaction 
} from '../services/blockchain.js';

const router = express.Router();

// Get blockchain network status
router.get('/status', async (req, res) => {
  try {
    const networkStatus = await getNetworkStatus();
    if (!networkStatus.success) {
        return res.status(500).json({
            error: 'Failed to get network status',
            message: networkStatus.message
        });
    }
    res.json(networkStatus);
  } catch (error) {
    console.error('Get blockchain status error:', error);
    res.status(500).json({
      error: 'Failed to fetch blockchain status',
      message: error.toString()
    });
  }
});

// Get deployed chaincode information
router.get('/chaincode', async (req, res) => {
  try {
    const chaincodeInfo = getChaincodeInfo();
    res.json(chaincodeInfo);
  } catch (error) {
    console.error('Get chaincode info error:', error);
    res.status(500).json({
      error: 'Failed to fetch chaincode info',
      message: error.toString()
    });
  }
});

// Invoke a transaction on the chaincode
router.post('/invoke', [
  body('functionName').isString().withMessage('Function name is required'),
  body('args').isArray().withMessage('Arguments must be an array of strings'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { functionName, args } = req.body;

  try {
    console.log(`Invoking chaincode function: ${functionName}`);
    const result = await submitTransaction(functionName, args);
    
    // The result from submitTransaction is a buffer.
    // We'll return it as a string, but clients may need to parse it (e.g., if it's JSON).
    res.status(200).json({
      success: true,
      message: `Transaction ${functionName} has been submitted successfully.`,
      result: result.toString(),
    });
  } catch (error) {
    console.error(`Error invoking chaincode function ${functionName}:`, error);
    res.status(500).json({
      error: 'Failed to invoke chaincode function',
      message: error.toString()
    });
  }
});

// Query the chaincode
router.post('/query', [
  body('functionName').isString().withMessage('Function name is required'),
  body('args').isArray().withMessage('Arguments must be an array of strings'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { functionName, args } = req.body;

  try {
    console.log(`Querying chaincode function: ${functionName}`);
    const result = await evaluateTransaction(functionName, args);
    
    // The result from evaluateTransaction is a buffer.
    // We attempt to parse it as JSON, falling back to a plain string if it fails.
    let parsedResult;
    try {
        parsedResult = JSON.parse(result.toString());
    } catch(e) {
        parsedResult = result.toString();
    }
    
    res.status(200).json({
      success: true,
      message: `Query ${functionName} executed successfully.`,
      result: parsedResult,
    });
  } catch (error) {
    console.error(`Error querying chaincode function ${functionName}:`, error);
    res.status(500).json({
      error: 'Failed to query chaincode function',
      message: error.toString()
    });
  }
});

export default router; 