![Lunr.tech](https://lunr.tech/wp-content/uploads/2024/05/logo.png)

# Device Rules Engine

🧩 Overview

The interface represents a graphical policy or rules engine used for device configuration management. The layout includes a visual block-based programming interface (left and center) for creating device rules.

🎯 Purpose

The rule engine is used to define configurations and enforce policies on devices, likely in the mobile device management (MDM) context.

![Rules Engine](../images/Rule%20Engine.png)

## Concept

The **Device Rules Engine** is a visual configuration and policy creation tool designed to streamline the management of mobile devices in an MDM (Mobile Device Management) environment. It enables administrators to define complex device behaviors using a **drag-and-drop interface** without needing to write code.

The core idea is to provide a **user-friendly playground** where non-technical users (IT admins, compliance officers, etc.) can visually assemble conditional logic and configuration actions. Once defined, these rules are automatically translated into machine-readable formats (e.g., JSON), validated, and sent to mobile devices via an MQTT-based message delivery system.

### Objectives:

* Simplify rule creation through a **graphical interface** using [Google Blockly](https://developers.google.com/blockly).
* Allow complex condition-action logic to be composed intuitively.
* Translate UI logic into backend-ready **JSON policy documents**.
* Support real-time configuration delivery to devices using **MQTT messaging**.

## Technical Realization

The Device Rules Engine is built as a **modern single-page application** with the following core components:

### 1. **Frontend Layer**

* **Framework:** `Vue.js` (composition API + TypeScript optional)
* **Blockly Integration:**

    * Custom blocks are defined for device conditions (e.g., tags, category) and actions (e.g., enable/disable features, install apps).
    * Logic flows are validated within Blockly’s workspace constraints.
* **Features:**

    * Real-time rule validation and feedback
    * Dual-view: visual Blockly editor
    * Rule templates, autosave, undo/redo, and import/export

## Examples

### Low battery rule
![low battery](../images/Example%201%20-%20Low%20Battery.png)

This block configuration defines a repeating automation rule that continuously monitors the device’s battery sensor and performs specific actions if the battery level falls below a critical threshold.

### Lower Down the brightness
![brightness level](../images/Example%202%20-%20Low%20down%20the%20light.png)

### Sync Task for the device
![schedule tasks](../images/Example%204%20-%20Sync%20task%20for%20device.png)

This block defines a targeted, scheduled task that executes a set of maintenance operations on a specific device identified by its ID. The execution is controlled using a CRON expression for precise scheduling.

### Setup Mobile Device
![mobile device config](../images/Example%203%20-%20Setup%20mobile%20device.png)

## Demo functionality

### Demo: Device Rules Engine

The demo showcases the functionality of the **Device Rules Engine**, allowing developers to subscribe to MQTT events, create rules using a visual interface, and generate JSON payloads for device actions. Below is a step-by-step guide to using the demo:
![demo](../images/Example%20-%20Rule%20Engine%20Demo.png)

---

### **Step-by-Step Guide**

#### 1. **Run the Demo with Docker Compose**

```bash
cd demo && docker-compose up -d
```

#### 2. **Subscribe to MQTT Event**

Use MQTTX or another MQTT client to subscribe to the device events:

```bash
mqttx sub -h 'localhost' -l mqtt -V 3.1.1 -p 1884 -t 'lcc/device/events'
```

* Use the pre-defined account credentials provided in the demo.

* Enter the MQTT broker URL and authentication details (username and password).

* Subscribe to the topic:

  ```
  lcc/device/events
  ```

* Once subscribed, the system will listen for incoming device events.

#### 3. **Open the Web Interface**

Go to: [http://localhost:5173/](http://localhost:5173/)

#### 4. **Create a Rule**

* Open the **Rules Engine** interface.
* Use the drag-and-drop visual editor to create a rule. For example:

  * Define a condition (e.g., "Battery level < 20%").
  * Add an action (e.g., "Send a command to reduce screen brightness").
* The rule will be visually represented in the editor.

#### 5. **Generate Device Rules**

* Click the **"Generate Device Rules"** button.
* The system will validate the rule and convert it into a JSON payload.

#### 6. **Expected Result**

A JSON payload will be generated and displayed. Example:

```json
{
  "type": "CONFIGURATION",
  "deviceUid": "12345",
  "deviceModel": "XYZ",
  "rules": [
    {
      "type": "hardware",
      "params": {
        "option": "brightness",
        "value": 20
      }
    }
  ]
}
```

This payload can be sent to the MQTT broker to apply the rule to the target device.

---

### 🔗 Try the Rules Engine Demo

You can try the demo functionality (without MQTT logic) of the rules engine using the following link:
👉 [Rule Engine Demo](https://docs.lcc.sh/ce/rule-engine/)

---


---
Next: [User Interface Wireframe](./UI%20WireFrames.md)