import apiService from '../../services/api';

/**
 * Defines all action blocks for the Blockly editor
 * @param {Object} Blockly - The Blockly instance
 */
export function defineActionBlocks(Blockly) {
    // Cache configuration
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Shared caches for API data
    const caches = {
        apk: { data: null, timestamp: 0 },
        os: { data: null, timestamp: 0 },
        sensor: { data: null, timestamp: 0 }
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
     * Create a standard action block
     * @param {string} name - Block name
     * @param {string} label - Display label
     * @param {string} tooltip - Tooltip text
     * @param {number} color - Block color (hue)
     */
    const createSimpleActionBlock = (name, label, tooltip, color = 160) => {
        Blockly.Blocks[name] = {
            init: function() {
                this.appendDummyInput().appendField(label);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(color);
                this.setTooltip(tooltip);
                this.setHelpUrl("");
            }
        };
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

    // Define simple action blocks
    const simpleActions = [
        ['send_policy_report', 'Send Policy Report', 'Send a policy report'],
        ['enable_remote_debug', 'Enable Remote Debug', 'Enable remote debugging'],
        ['make_screenshot', 'Make Screenshot', 'Take a screenshot'],
        ['share_screen', 'Share Screen', 'Share the screen with others'],
        ['stream_video', 'Stream Video', 'Start streaming video'],
        ['send_logs', 'Send Logs', 'Send log files'],
        ['wipe_action', 'Wipe', 'Perform a wipe action'],
        ['reboot_device', 'Reboot Device', 'Reboot the device'],
        ['force_sync', 'Force Sync', 'Force data synchronization'],
        ['make_backup', 'Make Backup', 'Create a backup']
    ];

    // Create all simple action blocks
    simpleActions.forEach(([name, label, tooltip]) =>
        createSimpleActionBlock(name, label, tooltip)
    );

    // Lock Screen Method Configuration block
    Blockly.Blocks['lock_screen_method_config'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Lock Screen Method")
                .appendField(new Blockly.FieldDropdown([
                    ["Password", "password"],
                    ["PIN", "pin"]
                ]), "LOCK_METHOD");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(290);
            this.setTooltip("Set device lock screen method");
            this.setHelpUrl("");
        }
    };

    // Install APK block with dynamic dropdown
    Blockly.Blocks['install_apk'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Install APK")
                .appendField(new Blockly.FieldDropdown(
                    () => [['Loading...', 'LOADING']]
                ), "APK_CHOICE");

            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip("Install the selected APK file");
            this.setHelpUrl("");

            // Fetch and populate dropdown options
            const block = this;
            this.fetchApkOptions().then(options =>
                updateDropdownField(block, "APK_CHOICE", options)
            );
        },

        /**
         * Fetch APK options with caching
         * @return {Promise<Array>} Dropdown options
         */
        fetchApkOptions: function() {
            return fetchWithCache(
                'apk',
                apiService.getApkOptions,
                (data) => {
                    if (!Array.isArray(data)) {
                        console.warn('Unexpected APK data format:', data);
                        return [['Invalid data', 'INVALID']];
                    }
                    return data.map(apk => [apk.name, apk.id.toString(), apk.icon]);
                }
            );
        }
    };

    // Install OS block with dynamic dropdown
    Blockly.Blocks['install_os'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Install OS Version")
                .appendField(new Blockly.FieldDropdown(
                    () => [['Loading...', 'LOADING']]
                ), "OS_VERSION");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip("Install selected OS version");
            this.setHelpUrl("");

            // Fetch and populate dropdown options
            const block = this;
            this.fetchOSVersions().then(options =>
                updateDropdownField(block, "OS_VERSION", options)
            );
        },

        /**
         * Fetch OS versions from API
         * @return {Promise<Array>} Dropdown options
         */
        fetchOSVersions: function() {
            return fetchWithCache(
                'os',
                apiService.getOSVersions,
                (data) => {
                    if (!Array.isArray(data)) {
                        console.warn('Unexpected OS version format:', data);
                        return [["Invalid data", "INVALID"]];
                    }
                    return data.map(os => {
                        const label = `${os.version} (${os.model}, ${os.type})`;
                        return [label, os.version];
                    });
                }
            );
        }
    };

    // Sensor configuration block with dynamic dropdown
    Blockly.Blocks['sensor_config'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Sensor")
                .appendField(new Blockly.FieldDropdown(() => [['Loading...', 'LOADING']]), "SENSOR_NAME")
                .appendField(new Blockly.FieldDropdown([
                    ['Enable', 'enable'],
                    ['Disable', 'disable']
                ]), "SENSOR_STATE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(290);
            this.setTooltip("Enable or disable a device sensor");
            this.setHelpUrl("");

            // Fetch and populate dropdown options
            const block = this;
            this.fetchSensorOptions().then(options =>
                updateDropdownField(block, "SENSOR_NAME", options)
            );
        },

        /**
         * Fetch sensor options from API
         * @return {Promise<Array>} Dropdown options
         */
        fetchSensorOptions: function() {
            return fetchSensorData();
        }
    };

    // Helper function to fetch sensor data (shared between blocks)
    const fetchSensorData = () => {
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

    // Set sensor state block with dynamic dropdown and value input
    Blockly.Blocks['set_sensor_state'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Set Sensor State")
                .appendField(new Blockly.FieldDropdown(() => [['Loading...', 'LOADING']]), "SENSOR_NAME");
            this.appendValueInput("SENSOR_VALUE")
                .setCheck("String")
                .appendField("to value");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip("Set a custom state value for a sensor");
            this.setHelpUrl("");

            // Fetch and populate dropdown options
            const block = this;
            fetchSensorData().then(options =>
                updateDropdownField(block, "SENSOR_NAME", options)
            );
        }
    };
}