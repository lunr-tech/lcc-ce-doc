import apiService from '../../services/api';

/**
 * Defines all device blocks for the Blockly editor
 * @param {Object} Blockly - The Blockly instance
 */
export function defineDeviceBlocks(Blockly) {
    // Cache configuration
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Shared caches for API data
    const caches = {
        sensor: { data: null, timestamp: 0 },
        deviceCategory: { data: null, timestamp: 0 }
    };

    /**
     * Fetch data with caching support
     * @param {string} cacheKey - Key to access cache data
     * @param {Function} fetchFn - API fetch function to call when cache is invalid
     * @param {Function} formatFn - Function to format API response data
     * @returns {Promise<Array>} Formatted dropdown options
     */
    const fetchWithCache = async (cacheKey, fetchFn, formatFn) => {
        const cache = caches[cacheKey];
        const now = Date.now();

        // Use cache if valid
        if (cache.data && (now - cache.timestamp < CACHE_TTL)) {
            return cache.data;
        }

        try {
            const response = await fetchFn();
            const formattedData = formatFn(response.data);

            // Update cache
            cache.data = formattedData;
            cache.timestamp = now;

            return formattedData;
        } catch (error) {
            console.error(`Error fetching ${cacheKey} data:`, error);
            return [[`Error loading ${cacheKey} data`, 'ERROR']];
        }
    };

    /**
     * Apply dropdown field to a block with dynamic options
     * @param {Object} block - Blockly block instance
     * @param {string} fieldName - Field name to update
     * @param {Array} options - Dropdown options
     */
    const updateDropdownField = (block, fieldName, options) => {
        if (options && options.length > 0) {
            const dropdown = block.getField(fieldName);
            if (dropdown) {
                dropdown.menuGenerator_ = options;
                if (block.rendered) {
                    dropdown.forceRerender();
                }
            }
        }
    };

    /**
     * Fetch sensor options from API
     * @returns {Promise<Array>} Dropdown options for sensors
     */
    const fetchSensorOptions = () => {
        return fetchWithCache(
            'sensor',
            apiService.getSensors,
            (data) => {
                if (!Array.isArray(data)) {
                    console.warn('Unexpected sensor data format:', data);
                    return [['Invalid data', 'INVALID']];
                }
                return data.map(sensor => [sensor.name, sensor.id]);
            }
        );
    };

    /**
     * Fetch device categories from API
     * @returns {Promise<Array>} Dropdown options for device categories
     */
    const fetchDeviceCategoryOptions = () => {
        return fetchWithCache(
            'deviceCategory',
            apiService.getDeviceCategories,
            (data) => {
                if (!Array.isArray(data)) {
                    console.warn('Unexpected device category format:', data);
                    return [['Invalid data', 'INVALID']];
                }
                return data.map(category => [category.name, category.id]);
            }
        );
    };

    /**
     * Setup a sensor dropdown for a block
     * @param {Object} block - Blockly block instance
     */
    const setupSensorDropdown = (block) => {
        fetchSensorOptions().then(options =>
            updateDropdownField(block, "SENSOR_NAME", options)
        );
    };

    /**
     * Setup a device category dropdown for a block
     * @param {Object} block - Blockly block instance
     */
    const setupDeviceCategoryDropdown = (block) => {
        fetchDeviceCategoryOptions().then(options =>
            updateDropdownField(block, "DEVICE_CATEGORY", options)
        );
    };

    /**
     * Create a block with consistent structure
     * @param {string} name - Block name
     * @param {Function} initFn - Function to initialize the block
     */
    const createBlock = (name, initFn) => {
        Blockly.Blocks[name] = {
            init: function() {
                initFn(this);
            }
        };
    };

    // Define blocks by category
    const blockDefinitions = {
        // Blocks related to sensor checks
        sensorBlocks: [
            {
                name: 'device_has_sensor',
                init: function(block) {
                    block.appendDummyInput()
                        .appendField("Device has sensor")
                        .appendField(new Blockly.FieldDropdown(() => [['Loading...', 'LOADING']]), "SENSOR_NAME");
                    block.setOutput(true, "Boolean");
                    block.setColour(210);
                    block.setTooltip("Check if device has the selected sensor");
                    block.setHelpUrl("");

                    setupSensorDropdown(block);
                }
            },
            {
                name: 'sensor_enabled_check',
                init: function(block) {
                    block.appendDummyInput()
                        .appendField("Sensor")
                        .appendField(new Blockly.FieldDropdown(() => [['Loading...', 'LOADING']]), "SENSOR_NAME")
                        .appendField("is")
                        .appendField(new Blockly.FieldDropdown([["enabled", "enabled"], ["disabled", "disabled"]]), "SENSOR_STATE");
                    block.setOutput(true, "Boolean");
                    block.setColour(210);
                    block.setTooltip("Check if sensor is enabled or disabled");
                    block.setHelpUrl("");

                    setupSensorDropdown(block);
                }
            },
            {
                name: 'device_sensor_state',
                init: function(block) {
                    block.appendDummyInput()
                        .appendField("Sensor state of")
                        .appendField(new Blockly.FieldDropdown(() => [['Loading...', 'LOADING']]), "SENSOR_NAME");
                    block.setOutput(true, "String");
                    block.setColour(210);
                    block.setTooltip("Get the current state value of the selected sensor");
                    block.setHelpUrl("");

                    setupSensorDropdown(block);
                }
            }
        ],

        // Blocks for device identification and properties
        deviceInfoBlocks: [
            {
                name: 'device_os_version',
                init: function(block) {
                    block.appendDummyInput()
                        .appendField("Device OS version");
                    block.setOutput(true, "String");
                    block.setColour(210);
                    block.setTooltip("Get the device's current OS version");
                    block.setHelpUrl("");
                }
            },
            {
                name: 'device_id_equals',
                init: function(block) {
                    block.appendDummyInput()
                        .appendField("Device ID is")
                        .appendField(new Blockly.FieldTextInput("device123"), "DEVICE_ID");
                    block.setOutput(true, "Boolean");
                    block.setColour(210);
                    block.setTooltip("Check if device ID matches the specified value");
                    block.setHelpUrl("");
                }
            },
            {
                name: 'device_tag_equals',
                init: function(block) {
                    block.appendDummyInput()
                        .appendField("Device tag is")
                        .appendField(new Blockly.FieldTextInput("production"), "DEVICE_TAG");
                    block.setOutput(true, "Boolean");
                    block.setColour(210);
                    block.setTooltip("Check if device tag matches the specified value");
                    block.setHelpUrl("");
                }
            },
            {
                name: 'device_category_equals',
                init: function(block) {
                    block.appendDummyInput()
                        .appendField("Device category is")
                        .appendField(new Blockly.FieldDropdown(() => [['Loading...', 'LOADING']]), "DEVICE_CATEGORY");
                    block.setOutput(true, "Boolean");
                    block.setColour(210);
                    block.setTooltip("Check if device category matches the selected value");
                    block.setHelpUrl("");

                    setupDeviceCategoryDropdown(block);
                }
            }
        ]
    };

    // Register all blocks
    Object.values(blockDefinitions).forEach(blockCategory => {
        blockCategory.forEach(blockDef => {
            createBlock(blockDef.name, blockDef.init);
        });
    });
}