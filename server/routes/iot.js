import express from 'express';
import { body, param, validationResult } from 'express-validator';
import * as iotService from '../services/iot.js';

const router = express.Router();

// --- Live IoT Event Stream ---

// Provides a real-time stream of IoT events (telemetry, status) to the client.
router.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (type, data) => {
        res.write(`event: ${type}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const telemetryListener = (data) => sendEvent('telemetry', data);
    const statusListener = (data) => sendEvent('status', data);
    const nfcListener = (data) => sendEvent('nfc_scan', data);

    iotService.iotEvents.on('telemetry', telemetryListener);
    iotService.iotEvents.on('status', statusListener);
    iotService.iotEvents.on('nfc_scan', nfcListener);

    req.on('close', () => {
        iotService.iotEvents.removeListener('telemetry', telemetryListener);
        iotService.iotEvents.removeListener('status', statusListener);
        iotService.iotEvents.removeListener('nfc_scan', nfcListener);
        res.end();
    });
});


// --- Device Information Endpoints ---

// Get a list of all connected IoT devices
router.get('/devices', (req, res) => {
    try {
        const devices = iotService.getAllDevices();
        res.json(devices);
    } catch (error) {
        console.error('Error getting all devices:', error);
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

// Get the status of a specific device
router.get('/devices/:deviceId', [
    param('deviceId').notEmpty().withMessage('Device ID cannot be empty.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { deviceId } = req.params;
        const device = iotService.getDeviceStatus(deviceId);

        if (device) {
            res.json(device);
        } else {
            res.status(404).json({ error: `Device with ID ${deviceId} not found.` });
        }
    } catch (error) {
        console.error(`Error getting device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Failed to fetch device status' });
    }
});

// Get recent sensor history for a device
router.get('/devices/:deviceId/history', [
    param('deviceId').notEmpty().withMessage('Device ID cannot be empty.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { deviceId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
        const history = iotService.getSensorHistory(deviceId, limit);
        res.json(history);
    } catch (error) {
        console.error(`Error getting history for device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Failed to fetch sensor history' });
    }
});


// --- Network and Command Endpoints ---

// Get overall IoT network health
router.get('/network-health', (req, res) => {
    try {
        const health = iotService.getNetworkHealth();
        res.json(health);
    } catch (error) {
        console.error('Error getting IoT network health:', error);
        res.status(500).json({ error: 'Failed to fetch network health' });
    }
});

// Send a command to a device
router.post('/devices/:deviceId/command', [
    param('deviceId').notEmpty().withMessage('Device ID is required.'),
    body('command').isString().withMessage('Command must be a string.'),
    body('payload').isObject().withMessage('Payload must be an object.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { deviceId } = req.params;
        const { command, payload } = req.body;
        iotService.sendCommandToDevice(deviceId, command, payload);
        res.status(202).json({ message: `Command '${command}' sent to device ${deviceId}.` });
    } catch (error) {
        console.error(`Error sending command to device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Failed to send command' });
    }
});

export default router; 