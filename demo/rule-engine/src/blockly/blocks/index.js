import {defineActionBlocks} from './actionsBlocks';
import {defineConfigurationBlocks} from './configurationBlocks';
import {defineRepeatBlocks} from './repeatBlocks';
import {defineDeviceBlocks} from './deviceBlocks';
import {Generator} from 'blockly';

export function registerAllCustomBlocks(Blockly) {
    defineDeviceBlocks(Blockly);
    defineRepeatBlocks(Blockly);
    defineConfigurationBlocks(Blockly);
    defineActionBlocks(Blockly);
}

export class JSONGenerator extends Generator {
    constructor(name) {
        super(name);
    }

    indentJson(json, level = 1) {
        return JSON.stringify(json, null, 2);
    }

    workspaceToCode(workspace) {
        const blocks = workspace.getTopBlocks(true);
        const output = blocks
            .map(block => this.blockToCode(block))
            .filter(Boolean);
        return this.indentJson(output);
    }

    blockToCode(block) {
        if (!block) {
            return '';
        }
        const func = this[block.type];
        if (typeof func !== 'function') {
            throw new Error(
                `JSON generator does not know how to generate code for block type "${block.type}".`
            );
        }
        return func.call(this, block);
    }

    valueToCode(block, name) {
        const targetBlock = block.getInputTargetBlock(name);
        return targetBlock ? this.blockToCode(targetBlock) : null;
    }

    statementToCode(block, name) {
        const targetBlock = block.getInputTargetBlock(name);
        const codes = [];
        let currentBlock = targetBlock;
        while (currentBlock) {
            const code = this.blockToCode(currentBlock);
            if (code) {
                codes.push(code);
            }
            currentBlock = currentBlock.getNextBlock();
        }
        return codes;
    }

    // Common generators for creating standard response objects
    _createActionObject(actionType) {
        return {
            type: 'ACTION',
            rules: [
                {
                    type: actionType,
                    params: {}
                }
            ]
        };
    }

    _createHardwareConfig(option, block) {
        return {
            type: 'hardware',
            params: {
                option: option,
                value: block.getFieldValue('STATE'),
            }
        };
    }

    _createSoftwareConfig(option, block, valueField = 'STATE', isNumeric = false) {
        const value = block.getFieldValue(valueField);
        return {
            type: 'software',
            params: {
                option: option,
                value: isNumeric ? Number(value) : value,
            }
        };
    }

    // Block Generators grouped by category

    // Basic value blocks
    text(block) {
        return {
            type: "exactValue",
            "value": block.getFieldValue('TEXT')
        };
    }

    math_number(block) {
        return {
            type: "exactValue",
            "value": block.getFieldValue('NUM')
        };
    }

    // Device information blocks
    device_sensor_state(block) {
        return {
            type: 'device_info',
            info: 'sensor_state',
            sensor: block.getFieldValue('SENSOR_NAME'),
        };
    }

    device_os_version() {
        return {
            type: 'deviceOs'
        };
    }

    device_id_equals(block) {
        return {
            type: 'deviceId',
            condition: 'equal',
            value: block.getFieldValue('DEVICE_ID'),
        };
    }

    device_tag_equals(block) {
        return {
            type: 'deviceTag',
            condition: 'equal',
            value: block.getFieldValue('DEVICE_TAG'),
        };
    }

    device_category_equals(block) {
        return {
            type: 'deviceCategory',
            condition: 'equal',
            value: block.getFieldValue('DEVICE_CATEGORY'),
        };
    }

    // Sensor related blocks
    sensor_config(block) {
        return {
            type: 'sensor_config',
            sensor: block.getFieldValue('SENSOR_NAME'),
            state: block.getFieldValue('SENSOR_STATE'),
        };
    }

    sensor_enabled_check(block) {
        return {
            type: 'deviceSensorStatus',
            condition: 'equal',
            sensor: block.getFieldValue('SENSOR_NAME'),
            state: block.getFieldValue('SENSOR_STATE'),
        };
    }

    device_has_sensor(block) {
        return {
            type: 'deviceSensor',
            condition: 'has',
            value: block.getFieldValue('SENSOR_NAME'),
        };
    }

    set_sensor_state(block) {
        const valueInput = this.valueToCode(
            block,
            'SENSOR_VALUE',
            this.ORDER_ATOMIC
        );
        return {
            type: 'sensor',
            params: {
                sensor: block.getFieldValue('SENSOR_NAME'),
                state: valueInput || '',
            }
        };
    }

    // Action blocks
    wipe_action() {
        return this._createActionObject('wipe');
    }

    install_os(block) {
        return {
            type: 'os',
            params: {
                version: block.getFieldValue('OS_VERSION'),
            }
        };
    }

    force_sync() {
        return this._createActionObject('sync');
    }

    reboot_device() {
        return this._createActionObject('reboot');
    }

    make_backup() {
        return this._createActionObject('backup');
    }

    send_policy_report() {
        return this._createActionObject('policy/report');
    }

    enable_remote_debug() {
        return this._createActionObject('remote/debug');
    }

    make_screenshot() {
        return this._createActionObject('screenshot');
    }

    share_screen() {
        return this._createActionObject('share/screen');
    }

    // There was a duplicate method - fixed with a more specific name
    stream_video() {
        return this._createActionObject('stream/video');
    }

    send_logs() {
        return this._createActionObject('send/logs');
    }

    install_apk(block) {
        return {
            type: 'apk',
            params: {
                "details": {},
                "package": block.getFieldValue('APK_CHOICE')
            }
        };
    }

    // Hardware configuration blocks
    camera_config(block) {
        return this._createHardwareConfig('camera', block);
    }

    location_config(block) {
        return this._createHardwareConfig('lacation', block); // Note: typo preserved from original
    }

    bluetooth_config(block) {
        return this._createHardwareConfig('bluetooth', block);
    }

    wifi_config(block) {
        return this._createHardwareConfig('wifi', block);
    }

    microphone_config(block) {
        return this._createHardwareConfig('microphone', block);
    }

    fingerprint_config(block) {
        return this._createHardwareConfig('fingerprint', block);
    }

    sensors_config(block) {
        return this._createHardwareConfig('sensors', block);
    }

    usb_config(block) {
        return this._createHardwareConfig('usb', block);
    }

    voice_service_config(block) {
        return this._createHardwareConfig('voice', block);
    }

    // Software configuration blocks
    sync_interval_config(block) {
        return this._createSoftwareConfig('syncInterval', block, 'INTERVAL', true);
    }

    max_failed_sync_config(block) {
        return this._createSoftwareConfig('maxFailedSync', block, 'MAX_FAILED', true);
    }

    lock_screen_method_config(block) {
        return this._createSoftwareConfig('lockScreenMethod', block, 'LOCK_METHOD');
    }

    screenshot_config(block) {
        return this._createSoftwareConfig('screenshot', block);
    }

    contacts_config(block) {
        return this._createSoftwareConfig('contacts', block);
    }

    sms_mms_config(block) {
        return this._createSoftwareConfig('sms', block);
    }

    microg_config(block) {
        return this._createSoftwareConfig('microg', block);
    }

    development_mode_config(block) {
        return this._createSoftwareConfig('developmentMode', block);
    }

    timezone_config(block) {
        return this._createSoftwareConfig('timezone', block, 'TIMEZONE');
    }

    language_config(block) {
        return this._createSoftwareConfig('language', block, 'LANGUAGE');
    }

    pin_min_symbols_config(block) {
        return this._createSoftwareConfig('pinMinSymbols', block, 'MIN_SYMBOLS', true);
    }

    screen_lock_timeout_config(block) {
        return this._createSoftwareConfig('screenLockTimeout', block, 'TIMEOUT', true);
    }

    sim_logs_config(block) {
        return this._createSoftwareConfig('simLogs', block);
    }

    third_party_apps_config(block) {
        return this._createSoftwareConfig('thirdPartyApps', block);
    }

    // Control flow blocks
    cron_schedule(block) {
        return {
            type: 'cron',
            params: {
                cronExpression: block.getFieldValue('CRON_EXPR'),
            },
            actions: this.statementToCode(block, 'DO') || {type: 'literal', value: 0}
        };
    }

    controls_if(block) {
        const branches = [];

        // Collect all IF and ELSE IF branches
        let i = 0;
        while (block.getInput('IF' + i)) {
            const conditionCode = this.valueToCode(block, 'IF' + i) || 'false';
            const statementCode = this.statementToCode(block, 'DO' + i) || '';
            branches.push({
                type: i === 0 ? 'if' : 'elseif',
                conditions: conditionCode,
                actions: statementCode
            });
            i++;
        }

        // Handle ELSE branch if it exists
        const elseStatement = this.statementToCode(block, 'ELSE');
        if (elseStatement) {
            branches.push({
                type: 'else',
                actions: elseStatement
            });
        }

        return {
            type: 'condition',
            branches
        };
    }

    // Logic blocks
    logic_compare(block) {
        const opMap = {
            EQ: 'equal',
            NEQ: 'notEqual',
            LT: 'lessThan',
            LTE: 'lessThanOrEqual',
            GT: 'greaterThan',
            GTE: 'greaterThanOrEqual'
        };

        const operatorCode = block.getFieldValue('OP');
        const condition = opMap[operatorCode] || 'unknown';

        const valueA = this.valueToCode(block, 'A') || {type: 'literal', value: null};
        const valueB = this.valueToCode(block, 'B') || {type: 'literal', value: null};

        return {
            type: 'compare',
            condition: condition,
            operators: [valueA, valueB]
        };
    }

    logic_operation(block) {
        const operator = block.getFieldValue('OP');
        const valueA = this.valueToCode(block, 'A');
        const valueB = this.valueToCode(block, 'B');
        return {
            conditionalOperator: operator,
            conditions: [
                valueA || {type: 'literal', value: null},
                valueB || {type: 'literal', value: null}
            ]
        };
    }

    // Looping blocks
    controls_whileUntil(block) {
        const condition = this.valueToCode(block, 'BOOL');
        const statements = this.statementToCode(block, 'DO');
        const mode = block.getFieldValue('MODE');
        return {
            type: 'repeat',
            condition: {
                type: mode,
                value: condition || {type: 'literal', value: false}
            },
            actions: statements || []
        };
    }

    controls_repeat_ext(block) {
        const times = this.valueToCode(block, 'TIMES');
        const actions = this.statementToCode(block, 'DO');

        return {
            type: 'repeat',
            condition: {
                type: 'counter',
                value: times || {type: 'literal', value: 0}
            },
            actions: actions || []
        };
    }
}