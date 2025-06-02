
export function defineConfigurationBlocks(Blockly) {
    // Configuration groups
    const CONFIG_TYPES = {
        // Boolean configurations (enable/disable)
        TOGGLE: {
            options: [
                ["Enable", "enable"],
                ["Disable", "disable"]
            ],
            defaultValue: "STATE",
            fieldType: "dropdown"
        },
        // Numeric configurations
        NUMERIC: {
            defaultValue: "VALUE",
            fieldType: "number"
        },
        // Dropdown selections
        SELECTION: {
            defaultValue: "SELECTION",
            fieldType: "dropdown"
        }
    };

    // Block definitions - organized by their data type and field configuration
    const blockDefinitions = {
        // Toggle blocks (enable/disable)
        toggle: [
            { name: "voice_service_config", label: "Voice Service", tooltip: "Configure voice service state" },
            { name: "microg_config", label: "microG", tooltip: "Configure microG services" },
            { name: "contacts_config", label: "Contacts", tooltip: "Configure contacts access" },
            { name: "sms_mms_config", label: "SMS/MMS", tooltip: "Configure SMS/MMS access" },
            { name: "sensors_config", label: "Device Sensors", tooltip: "Configure device sensors state" },
            { name: "development_mode_config", label: "Development Mode", tooltip: "Configure development mode state" },
            { name: "sim_logs_config", label: "SIM Logs", tooltip: "Configure SIM logs state" },
            { name: "third_party_apps_config", label: "3rd-party Apps", tooltip: "Configure 3rd-party apps state" },
            { name: "usb_config", label: "USB", tooltip: "Configure USB state" },
            { name: "camera_config", label: "Camera", tooltip: "Configure camera state" },
            { name: "location_config", label: "Location", tooltip: "Configure location services state" },
            { name: "bluetooth_config", label: "Bluetooth", tooltip: "Configure bluetooth state" },
            { name: "wifi_config", label: "WiFi", tooltip: "Configure WiFi state" },
            { name: "screenshot_config", label: "Screenshot", tooltip: "Configure screenshot capability" },
            { name: "microphone_config", label: "Microphone", tooltip: "Configure microphone state" },
            { name: "fingerprint_config", label: "Fingerprint", tooltip: "Configure fingerprint sensor state" }
        ],

        // Numeric input blocks
        numeric: [
            {
                name: "max_failed_sync_config",
                label: "Max Failed Sync to Wipe",
                tooltip: "Set maximum number of failed syncs before device wipe",
                fieldName: "MAX_FAILED",
                min: 1,
                max: 100,
                precision: 1,
                defaultValue: 5
            },
            {
                name: "sync_interval_config",
                label: "Sync Interval",
                tooltip: "Set synchronization interval in minutes",
                fieldName: "INTERVAL",
                min: 1,
                max: 999,
                precision: 1,
                defaultValue: 15
            },
            {
                name: "pin_min_symbols_config",
                label: "PIN Min Symbols",
                tooltip: "Set minimum number of symbols for PIN",
                fieldName: "MIN_SYMBOLS",
                min: 1,
                max: 16,
                precision: 1,
                defaultValue: 4
            },
            {
                name: "screen_lock_timeout_config",
                label: "Screen Lock Timeout",
                tooltip: "Set screen lock timeout in seconds",
                fieldName: "TIMEOUT",
                min: 0,
                max: 999,
                precision: 1,
                defaultValue: 30
            }
        ],

        // Selection blocks (dropdowns with multiple options)
        selection: [
            {
                name: "timezone_config",
                label: "Timezone",
                tooltip: "Set device timezone",
                fieldName: "TIMEZONE",
                options: [
                    ["UTC", "UTC"],
                    ["America/New_York", "America/New_York"],
                    ["America/Los_Angeles", "America/Los_Angeles"],
                    ["Europe/London", "Europe/London"],
                    ["Europe/Paris", "Europe/Paris"],
                    ["Asia/Tokyo", "Asia/Tokyo"],
                    ["Asia/Singapore", "Asia/Singapore"],
                    ["Australia/Sydney", "Australia/Sydney"]
                ]
            },
            {
                name: "language_config",
                label: "Language",
                tooltip: "Set device language",
                fieldName: "LANGUAGE",
                options: [
                    ["English (US)", "en_US"],
                    ["English (UK)", "en_GB"],
                    ["French", "fr_FR"],
                    ["German", "de_DE"],
                    ["Spanish", "es_ES"],
                    ["Italian", "it_IT"],
                    ["Japanese", "ja_JP"],
                    ["Korean", "ko_KR"],
                    ["Chinese (Simplified)", "zh_CN"],
                    ["Russian", "ru_RU"]
                ]
            }
        ]
    };

    // Block creation factory function
    function createBlock(blockType, blockData) {
        Blockly.Blocks[blockData.name] = {
            init: function() {
                const input = this.appendDummyInput().appendField(blockData.label);

                switch(blockType) {
                    case 'toggle':
                        input.appendField(
                            new Blockly.FieldDropdown(CONFIG_TYPES.TOGGLE.options),
                            CONFIG_TYPES.TOGGLE.defaultValue
                        );
                        break;

                    case 'numeric':
                        input.appendField(
                            new Blockly.FieldNumber(
                                blockData.defaultValue,
                                blockData.min,
                                blockData.max,
                                blockData.precision
                            ),
                            blockData.fieldName
                        );
                        break;

                    case 'selection':
                        input.appendField(
                            new Blockly.FieldDropdown(blockData.options),
                            blockData.fieldName
                        );
                        break;
                }

                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(290);
                this.setTooltip(blockData.tooltip);
                this.setHelpUrl("");
            }
        };
    }

    // Generate all blocks
    Object.keys(blockDefinitions).forEach(blockType => {
        blockDefinitions[blockType].forEach(blockData => {
            createBlock(blockType, blockData);
        });
    });
}