require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mqtt = require('mqtt');
const {v4: uuidv4} = require('uuid');

// ======= Configuration =======
const config = {
    port: process.env.PORT || 5174,
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
    mqtt: {
        brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://nanomq:1884',
        username: process.env.MQTT_USERNAME || 'lcc',
        password: process.env.MQTT_PASSWORD || '5Qs46lC0C1TljXJYivmjXOvY',
    },
    users: [
        {
            username: "ruleEngineUser",
            password: "$2y$10$FG1D0CcP7/AMwMFA5S1AR.tlsGcgvkNjpWlddWxP6z9gpyAUiwgIC",
        }
    ]
};

// ======= Express Setup =======
const app = express();
app.use(cors());
app.use(express.json());

// ======= MQTT Client Setup =======
const mqttClient = mqtt.connect(config.mqtt.brokerUrl, {
    username: config.mqtt.username,
    password: config.mqtt.password,
});

mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
    console.error('❌ MQTT connection error:', err);
});

// ======= Middleware =======
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ======= Route Data Providers =======
const dataProviders = {
    apkOptions: () => [
        {
            id: 'com.google.android.apps.bard',
            name: 'Google Gemini',
            icon: 'https://update.lcc.sh/icon/fb015d9a-b840-4b3a-a821-3359d9cec43a/icon-google-gemini-R4JmgD.png'
        },
        {
            id: 'com.deepseek.chat',
            name: 'DeepSeek\'s AI Assistant',
            icon: 'https://update.lcc.sh/icon/c1be7f95-a10d-433f-8408-323fa7bdd398/icon-deepseek-ai-assistant-sBFJC4.png'
        },
        {
            id: 'de.mobileconcepts.cyberghost',
            name: 'CyberGhost VPN: Secure VPN',
            icon: 'https://update.lcc.sh/icon/ccc28c0a-635b-4b38-aa71-f61b7c0e2593/icon-cyberghost-vpn-secure-vpn-INjwY7.png'
        },
        {
            id: 'com.cardsapp.android',
            name: 'Cards - Mobile Wallet',
            icon: 'https://update.lcc.sh/icon/6f1fccc8-79b4-463d-9b62-c023484da867/icon-cards-mobile-wallet-9ew44i.png'
        },
        {
            id: 'com.spotify.music',
            name: 'Spotify: Music and Podcasts',
            icon: 'https://update.lcc.sh/icon/7e11af56-0614-45e3-9ea8-0f4afc131315/icon-spotify-vZRTcF.png'
        }
    ],

    blockOptions: (blockType) => {
        const options = {
            device_settings: [
                {name: 'Brightness', value: 'brightness'},
                {name: 'Volume', value: 'volume'},
                {name: 'Wi-Fi', value: 'wifi'},
                {name: 'Bluetooth', value: 'bluetooth'},
                {name: 'Night Mode', value: 'night_mode'}
            ],
            default: [{name: 'No options available', value: 'none'}]
        };

        return options[blockType] || options.default;
    },

    osOptions: () => [
        {
            model: 'B1',
            version: '5.9.1-20240821-B1',
            type: 'Beta'
        },
        {
            model: 'B1',
            version: '5.8.0-20240611-B1',
            type: 'Release'
        },
        {
            model: 'B2',
            version: '6.0.0-20250101-B2',
            type: 'Beta'
        },
        {
            model: 'B2',
            version: '5.7.5-20240501-B2',
            type: 'Release'
        }
    ],

    sensors: () => [
        {id: 'battery_level', name: 'Battery Level'},
        {id: 'light_level', name: 'Ambient Light'},
        {id: 'proximity', name: 'Proximity'},
        {id: 'accelerometer', name: 'Accelerometer'},
        {id: 'gyroscope', name: 'Gyroscope'},
        {id: 'magnetometer', name: 'Magnetometer'},
        {id: 'barometer', name: 'Barometric Pressure'},
        {id: 'thermometer', name: 'Temperature'},
        {id: 'heart_rate', name: 'Heart Rate'},
        {id: 'fingerprint', name: 'Fingerprint'},
        {id: 'gps', name: 'GPS Location'},
        {id: 'humidity', name: 'Humidity'},
        {id: 'step_counter', name: 'Step Counter'},
        {id: 'facial_recognition', name: 'Facial Recognition'},
        {id: 'microphone', name: 'Microphone'}
    ],

    deviceCategories: () => [
        {id: 'smartphone', name: 'Smartphone'},
        {id: 'tablet', name: 'Tablet'},
        {id: 'laptop', name: 'Laptop'},
        {id: 'desktop', name: 'Desktop Computer'},
        {id: 'smartwatch', name: 'Smartwatch'},
        {id: 'smart_tv', name: 'Smart TV'},
        {id: 'gaming_console', name: 'Gaming Console'},
        {id: 'iot_device', name: 'IoT Device'},
        {id: 'smart_speaker', name: 'Smart Speaker'},
        {id: 'media_streamer', name: 'Media Streaming Device'},
        {id: 'vr_headset', name: 'VR Headset'},
        {id: 'router', name: 'Network Router'},
        {id: 'security_camera', name: 'Security Camera'}
    ]
};

// ======= API Routes =======
const apiRouter = express.Router();

// Authentication route
apiRouter.post('/blockly/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = config.users.find(u => u.username === username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const token = jwt.sign({username: user.username}, config.jwtSecret, {expiresIn: '1h'});
        res.json({token});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({error: 'Authentication failed'});
    }
});

// MQTT control route
apiRouter.post('/blockly/mqtt', authenticateToken, async (req, res) => {
    try {
        const {code} = req.body;
        if (!code) {
            return res.status(400).json({error: 'No code provided'});
        }

        const messageId = uuidv4();
        const payload = {
            type: "CONFIGURATION",
            deviceUid: "1c310dab5cb53942",
            deviceModel: "b1",
            rules: JSON.parse(code)
        };

        mqttClient.publish('lcc/device/events', JSON.stringify(payload));
        res.status(200).json({
            success: true,
            messageId,
            message: 'Command sent via MQTT'
        });
    } catch (error) {
        console.error('Error executing Blockly code:', error);
        res.status(500).json({
            error: 'Failed to execute code',
            details: error.message
        });
    }
});

// Data retrieval routes
apiRouter.get('/blockly/apk', authenticateToken, (req, res) => {
    try {
        res.json(dataProviders.apkOptions());
    } catch (error) {
        console.error('Error fetching APK options:', error);
        res.status(500).json({error: 'Failed to fetch APK options'});
    }
});

apiRouter.get('/blockly/options/:blockType', authenticateToken, (req, res) => {
    try {
        const {blockType} = req.params;
        res.json(dataProviders.blockOptions(blockType));
    } catch (error) {
        console.error(`Error fetching options for ${req.params.blockType}:`, error);
        res.status(500).json({error: 'Failed to fetch block options'});
    }
});

apiRouter.get('/blockly/os', authenticateToken, (req, res) => {
    try {
        res.json(dataProviders.osOptions());
    } catch (error) {
        console.error('Error fetching OS options:', error);
        res.status(500).json({error: 'Failed to fetch OS options'});
    }
});

apiRouter.get('/blockly/sensors', (req, res) => {
    try {
        res.json(dataProviders.sensors());
    } catch (error) {
        console.error('Error fetching sensor list:', error);
        res.status(500).json({error: 'Failed to fetch sensors'});
    }
});

apiRouter.get('/blockly/deviceCategories', (req, res) => {
    try {
        // Add a slight delay to simulate network latency (preserved from original code)
        setTimeout(() => {
            res.json(dataProviders.deviceCategories());
        }, 200);
    } catch (error) {
        console.error('Error fetching device categories:', error);
        res.status(500).json({error: 'Failed to fetch device categories'});
    }
});

// Register all /api routes
app.use('/api', apiRouter);

// ======= Server Startup =======
app.listen(config.port, () => {
    console.log(`🚀 Server running at http://localhost:${config.port}`);
});