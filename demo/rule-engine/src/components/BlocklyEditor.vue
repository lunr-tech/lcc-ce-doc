<template>
  <div id="app" class="blockly-app">
    <!-- Blockly Area (70%) -->
    <div id="blocklyArea">
      <div ref="blocklyDiv" id="blocklyDiv"></div>
    </div>

    <!-- Output Area (30%) -->
    <div id="outputDiv">
      <button id="runButton" @click="runCode">Generate Device Rules</button>
      <pre id="codeOutput">{{ codeOutput }}</pre>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import * as Blockly from 'blockly'

const blocklyDiv = ref(null)
const codeOutput = ref('')
import {registerAllCustomBlocks, JSONGenerator} from '@/blockly/blocks';

import apiService from '../services/api';

const categoryDefinitions = [

  {
    name: 'Conditions',
    colour: '130',
    blocks: [
      'controls_if', 'logic_compare', 'logic_operation', 'math_number', 'text'
    ],
  },
  {
    name: 'Repeat',
    colour: '150',
    blocks: [
      'controls_repeat_ext', 'controls_whileUntil', 'cron_schedule',
    ],
  },
  {
    name: 'Actions',
    colour: '160',
    blocks: [
      'install_apk', 'wipe_action', 'force_sync', 'reboot_device', 'make_backup',
      'send_policy_report', 'enable_remote_debug', 'make_screenshot', 'share_screen',
      'stream_video', 'install_os', 'set_sensor_state',
    ],
  },
  {
    name: 'Device',
    colour: '210',
    blocks: [
      'device_sensor_state', 'device_os_version', 'sensor_enabled_check',
      'device_id_equals', 'device_tag_equals', 'device_category_equals', 'device_has_sensor',
    ],
  },
  {
    name: 'Configurations',
    colour: '290',
    blocks: [
      'usb_config', 'sensor_config', 'sim_logs_config', 'third_party_apps_config',
      'sync_interval_config', 'max_failed_sync_config', 'timezone_config', 'language_config',
      'voice_service_config', 'camera_config', 'location_config', 'bluetooth_config',
      'wifi_config', 'screenshot_config', 'microphone_config', 'fingerprint_config',
      'sensors_config', 'development_mode_config', 'microg_config', 'sms_mms_config',
      'contacts_config', 'pin_min_symbols_config', 'screen_lock_timeout_config',
      'lock_screen_method_config',
    ],
  },
]

function createToolboxXml() {
  const xml = document.createElement('xml')
  xml.setAttribute('id', 'toolbox')
  xml.setAttribute('style', 'display: none')

  categoryDefinitions.forEach(category => {
    const cat = document.createElement('category')
    cat.setAttribute('name', category.name)
    cat.setAttribute('colour', category.colour)
    category.blocks.forEach(blockType => {
      const block = document.createElement('block')
      block.setAttribute('type', blockType)
      cat.appendChild(block)
    })
    xml.appendChild(cat)
  })

  return xml
}

let workspace = null

onMounted(() => {
  const toolbox = createToolboxXml()

  registerAllCustomBlocks(Blockly);

  document.body.appendChild(toolbox)

  workspace = Blockly.inject(blocklyDiv.value, {
    toolbox: toolbox,
    trashcan: true,
    scrollbars: true,
    grid: {
      spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: true,
    },
  })
})

function runCode() {
  try {
    const jsonGenerator = new JSONGenerator('JSON')
    const code = jsonGenerator.workspaceToCode(workspace)
    codeOutput.value = code
    apiService.sendGeneratedCode(code)
  } catch (err) {
    executionOutput.value.innerHTML = `<div style="color: red;">Error: ${err.message}</div>`
  }
}
</script>

<style scoped>
#blocklyArea {
  flex-grow: 1;
  width: 70%;
}

#blocklyDiv {
  width: 100%;
  height: 100%;
}

#outputDiv {
  width: 30%;
  background-color: var(--neutral-background);
  overflow: auto;
  padding: calc(var(--spacing-unit) * 1.25);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

#runButton {
  margin: var(--spacing-unit);
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
  background-color: var(--accent-color);
  color: var(--text-on-accent);
  border: none;
  cursor: pointer;
  border-radius: var(--border-radius-small);
}

#codeOutput {
  flex-grow: 1;
  margin: 0 var(--spacing-unit) var(--spacing-unit) var(--spacing-unit);
  overflow-y: auto;
}

.blocklyDropDownDiv .goog-menuitem {
  display: flex;
  align-items: center;
}
</style>
