import mqtt from 'mqtt';
import { EventEmitter } from 'events';

// --- Configuration ---
// These should be moved to environment variables or a dedicated config file
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_USERNAME = process.env.MQTT_USERNAME; // e.g., 'myuser'
const MQTT_PASSWORD = process.env.MQTT_PASSWORD; // e.g., 'mypassword'

const TELEMETRY_TOPIC = 'iot/+/telemetry'; // Topic for sensor data, e.g., iot/device123/telemetry
const STATUS_TOPIC = 'iot/+/status';     // Topic for device status, e.g., iot/device123/status
const NFC_SCAN_TOPIC = 'iot/+/nfc';       // Topic for NFC scans, e.g., iot/reader-abc/nfc

// In-memory storage for device data and status
const iotDevices = new Map();
const sensorData = new Map();
const iotEvents = new EventEmitter();

let mqttClient;

/**
 * Initializes the IoT service and connects to the MQTT broker.
 */
export const initializeIoT = () => {
  console.log('📡 Initializing PackChain IoT Service...');
  
  const options = {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    clientId: `packchain_backend_${Math.random().toString(16).slice(2, 10)}`,
  };

  mqttClient = mqtt.connect(MQTT_BROKER_URL, options);

  mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT Broker.');
    mqttClient.subscribe([TELEMETRY_TOPIC, STATUS_TOPIC, NFC_SCAN_TOPIC], (err) => {
      if (!err) {
        console.log(`   Subscribed to topics: ${[TELEMETRY_TOPIC, STATUS_TOPIC, NFC_SCAN_TOPIC].join(', ')}`);
      } else {
        console.error('MQTT subscription error:', err);
      }
    });
  });

  mqttClient.on('message', (topic, payload) => {
    try {
      const topicParts = topic.split('/');
      const deviceId = topicParts[1];
      const messageType = topicParts[2];
      
      const message = JSON.parse(payload.toString());

      console.log(`MQTT message received on topic ${topic}:`, message);

      updateDevice(deviceId, message);

      switch(messageType) {
        case 'telemetry':
          storeSensorData(deviceId, message);
          break;
        case 'status':
          updateDeviceStatus(deviceId, message);
          break;
        case 'nfc':
          handleNFCScan(deviceId, message);
          break;
      }
    } catch (e) {
      console.error('Could not parse incoming MQTT message:', e);
    }
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT Client Error:', err);
  });

  mqttClient.on('close', () => {
    console.warn('MQTT connection closed. Reconnecting...');
  });
};

function updateDevice(deviceId, message) {
    if (!iotDevices.has(deviceId)) {
        iotDevices.set(deviceId, {
            id: deviceId,
            status: 'online',
            lastSeen: new Date().toISOString()
        });
    }
    const device = iotDevices.get(deviceId);
    device.lastSeen = new Date().toISOString();
    if(message.battery) device.batteryLevel = message.battery;
    if(message.signal) device.signalStrength = message.signal;
    if(message.location) device.location = message.location;
}

function storeSensorData(deviceId, data) {
    if (!sensorData.has(deviceId)) {
        sensorData.set(deviceId, []);
    }
    const deviceHistory = sensorData.get(deviceId);
    
    const telemetry = {
        value: data,
        timestamp: new Date().toISOString()
    };
    deviceHistory.push(telemetry);

    if (deviceHistory.length > 200) { // Limit stored history
        deviceHistory.shift();
    }
    
    iotEvents.emit('telemetry', { deviceId, ...telemetry });
}

function updateDeviceStatus(deviceId, status) {
    const device = iotDevices.get(deviceId);
    if(device) {
        device.status = status.status || 'online'; // e.g., { "status": "offline" }
        device.firmware = status.firmware || device.firmware;
    }
    iotEvents.emit('status', { deviceId, ...status });
}

function handleNFCScan(readerId, scanData) {
    // Emitting an event that can be used by other services (e.g., blockchain service)
    // to process the package scan and trigger a transaction.
    console.log(`NFC Scan from ${readerId}:`, scanData);
    iotEvents.emit('nfc_scan', { readerId, ...scanData });
}

/**
 * Sends a command to a specific device via MQTT.
 * @param {string} deviceId - The ID of the target device.
 * @param {string} command - The command to send (e.g., 'reboot', 'updateFirmware').
 * @param {object} payload - The data to send with the command.
 */
export const sendCommandToDevice = (deviceId, command, payload) => {
    const commandTopic = `iot/${deviceId}/command`;
    const message = JSON.stringify({ command, ...payload });

    mqttClient.publish(commandTopic, message, (err) => {
        if(err) {
            console.error(`Failed to publish command to ${commandTopic}:`, err);
        } else {
            console.log(`Command published to ${commandTopic}:`, message);
        }
    });
};


// --- Service functions to expose IoT data to the API ---

export const getDeviceStatus = (deviceId) => {
  return iotDevices.get(deviceId);
};

export const getAllDevices = () => {
  return Array.from(iotDevices.values());
};

export const getSensorHistory = (deviceId, limit = 50) => {
  const deviceHistory = sensorData.get(deviceId) || [];
  return deviceHistory.slice(-limit);
};

export const getNetworkHealth = () => {
    const devices = Array.from(iotDevices.values());
    if (devices.length === 0) {
        return {
            totalDevices: 0,
            onlineDevices: 0,
            offlineDevices: 0,
            onlinePercentage: 100,
            avgBatteryLevel: null,
            timestamp: new Date().toISOString()
        }
    }

    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const totalBattery = devices.reduce((sum, d) => sum + (d.batteryLevel || 0), 0);
    const devicesWithBattery = devices.filter(d => d.batteryLevel !== undefined).length;
  
    return {
      totalDevices: devices.length,
      onlineDevices,
      offlineDevices: devices.length - onlineDevices,
      onlinePercentage: (onlineDevices / devices.length) * 100,
      avgBatteryLevel: devicesWithBattery > 0 ? Math.round(totalBattery / devicesWithBattery) : null,
      timestamp: new Date().toISOString()
    };
};

export { iotEvents }; 