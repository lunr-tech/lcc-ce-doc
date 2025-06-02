![Lunr.tech](https://lunr.tech/wp-content/uploads/2024/05/logo.png)

# MQTT Topic Map - Topics & Payloads

This document outlines the MQTT communication structure between the MDM system and mobile devices, detailing the message types, payload formats, and topic structure.

## 1. Base Message Structure

All MQTT messages follow this standard JSON structure:

 - Device to MDM:

```json
{
  "type": "[EVENT_TYPE]",
  "token": "[ACCESS_TOKEN]",
  "deviceUid": "[DEVICE_UID]",
  "deviceModel": "[DEVICE_MODEL]",
  "params": {
    // Message-specific data
  }
}
```

- MDM to Device:
```json
{
  "type": "[EVENT_TYPE]",
  "deviceUid": "[DEVICE_UID]",
  "deviceModel": "[DEVICE_MODEL]",
  "rules": [
    // Message-specific data
  ]
}
```

## 2. Message Types

### 2.1 Device-to-MDM Event Types

Devices can send the following event types to `lcc/device/events`:

1. `wipe/status`
2. `sim/logs`
3. `dev/logs`
4. `policy/report`
5. `bug/report`
6. `sensors/register`

### 2.2 MDM-to-Device Event Types

The MDM system can send four primary types of messages to `lcc/device/uid/{deviceUid}`:

| Message Type | Description | Persistence | Execution |
|--------------|-------------|-------------|-----------|
| Configuration | Settings to be applied to the device | Saved on device | Applied immediately and persisted |
| Action | One-time instructions | Not saved | Executed immediately |
| Scheduled Event | Timed operations | Saved on device | Executed according to schedule |
| Scenario | Conditional operations | Saved on device | Executed when conditions are met |

## 3. MDM-to-Device Message Examples


### 3.1 Configuration Messages

- The `rules` array can contain 1 to unlimited number of configuration rules
- Each rule is processed independently
- Rules can be applied in the order they appear in the array
- Device configuration should be saved on the device side and applied immediately

#### 1. Hardware Configuration (`type: "hardware"`)
- Controls device hardware settings
- Typically, manages:
    - Wireless interfaces (WiFi, Bluetooth)
    - Sensors (GPS, Camera, Microphone)
    - Power management
    - Device peripherals
- Allows enabling/disabling or setting specific hardware states
- Example parameters might include:
    - `option`: specific hardware component
    - `value`: desired state (boolean or specific configuration)

#### 2. Software Configuration (`type: "software"`)
- Manages software-level settings
- Controls:
    - Application behaviors
    - Sync intervals
    - Data usage policies
    - Background process management
    - Network restrictions
- Example parameters might include:
    - `option`: software setting identifier
    - `value`: configuration value
    - Additional complex settings for application or system behavior

#### 3. OS Configuration (`type: "os"`)
- Handles operating system-level updates
- Manages:
    - OS updates
    - Security patches
    - System version
- Includes metadata like:
    - `version`: Target OS version
    - `revision`: Build or patch revision
    - `size`: Update package size
    - `changeLog`: Detailed update information
    - `buildUrl`: Source for OS update
    - `buildStatus`: Update availability status

#### 4. APK Configuration (`type: "apk"`)
- Manages application installation and configuration
- Handles:
    - App deployment
    - Version management
- Includes comprehensive app metadata:
    - Application details (name, author, description)
    - Version information
    - Installation parameters
    - Trust and security information
    - Download and installation sources

Each configuration rule is processed individually, allowing for granular and flexible device management through a single configuration message.

**Payload Structure:**
```json
{
  "type": "CONFIGURATION",
  "deviceUid": "1c310dab5cb53942",
  "deviceModel": "b1",
  "rules": [
    {
      "type": "hardware",
      "params": {
        "option": "wifi",
        "value": false
      }
    },
    {
      "type": "software",
      "params": {
        "option": "syncInterval",
        "value": 120
      }
    },
    {
      "type": "os",
      "params": {
        "deviceModel": "b1",
        "version": "1.1.4-20240821-B1",
        "revision": 2,
        "size": 1073741824,
        "changeLog": "Bug fixes: Videos captured with EIS enabled getting damaged; Always on Display rules app crashing when changed",
        "buildUrl": "https://ce.lcc.sh/api/v1/os?deviceModel=b1&version=1.1.4-20240821-B1&currentOsVersion=",
        "buildStatus": "latest"
      }
    },
    {
      "type": "apk",
      "params": {
        "details": {
          "name": "Spond - Sports Team Management",
          "author": "Spond AS",
          "description": "Spond makes it easy to organize groups for either children or adults, and you can invite to events, share posts and pictures.",
          "category": "Sports",
          "originalRating": "4.5",
          "contentRating": "EVERYONE",
          "images": [
            "https://ce.lcc.sh/storage/image/01957fc7-2b05-793d-9059-482715aad041/img-app-id-1-88aOqH.png",
            "https://ce.lcc.sh/storage/image/01957fc7-2b05-793d-9059-482715aad041/img-app-id-1-Gqof90.png"
          ],
          "icon": "https://ce.lcc.sh/storage/icon/01957fc7-123c-7469-8073-913e07c4d4cb/icon-com-spond-spond-Gqof90.png"
        },
        "version": "4.38.0",
        "package": "com.spond.spond",
        "fileType": 3,
        "size": 53972784,
        "fileMd5": "6397cbe27bca7a6a29d65a6bb9c0282f",
        "changeLog": "",
        "minSdkLevel": 24,
        "revision": 2,
        "versionCode": 2243,
        "trustLevel": 2,
        "trustInfo": {
          "signedBy": "CN=Spond AS, OU=Spond AS, O=Spond AS, L=Oslo, ST=Unknown, C=NO",
          "signerCertificate": "BE73CDA386148C7CB0490ABC448FD6E6DE47362070227C296D028830ED81DB3B",
          "schema": "v3",
          "existInPlayMarket": true,
          "isSigned": true
        },
        "file": "https://ce.lcc.sh/storage/apk/01957fc6-9b9d-79c6-84bc-b3aa5f5c372c/app-com-spond-spond-v-4-38-0-wPLyh3.zip"
      }
    }
  ]
}
```

### 3.2 Action Messages

- "Run and Forget" principle
- Device does NOT persist the action payload
- Immediate execution of the specified action
- No long-term storage or tracking of the action on the device

### Action Types Detailed Description

| Action Type | Description                       | Expected Device Behavior |
|------------|-----------------------------------|--------------------------|
| `wipe` | Complete device reset             | Immediately initiate factory reset<br>Erase all user data<br>Return device to original factory state |
| `sync` | Synchronize device data           | Trigger immediate synchronization<br>Upload pending device logs<br>Check for and apply any pending configurations |
| `reboot` | Restart the device                | Perform immediate system restart<br>Close all running applications<br>Reload system configuration |
| `lock` | Lock device screen                | Immediately disable device input<br>Display lock screen<br>Prevent user interaction |
| `dev/logs` | Collect device logs               | Capture comprehensive system logs<br>Prepare logs for transmission<br>Send logs to MDM server |
| `sim/logs` | Collect SIM-related logs          | Retrieve SIM card logs<br>Capture network and cellular information<br>Send SIM log data to MDM server |
| `policy/report` | Generate policy compliance report | Evaluate current device configuration<br>Check compliance with set policies<br>Generate and send compliance report |
| `remote/debug` | Toggle remote debugging           | Enable/Disable remote debugging mode<br>Adjust system logging levels<br>Prepare device for remote diagnostic access |

**Payload Structure:**
```json
{
  "type": "ACTION",
  "deviceUid": "1c310dab5cb53942",
  "deviceModel": "b1",
  "rules": [
    {
      "type": "wipe",
      "params": {}
    },
    {
      "type": "sync",
      "params": {}
    },
    {
      "type": "reboot",
      "params": {}
    },
    {
      "type": "lock",
      "params": {}
    },
    {
      "type": "dev/logs",
      "params": {}
    },
    {
      "type": "sim/logs",
      "params": {}
    },
    {
      "type": "policy/report",
      "params": {}
    },
    {
      "type": "remote/debug",
      "params": {
        "option": "enabled",
        "value": true
      }
    }
  ]
}
```

### 3.3 Scheduled Event Messages

- Device MUST save the scheduled event configuration
- Persistent storage of the event details
- Mandatory sections in the payload:
    - `cronExpression`: Defines when the action will be executed
    - `repeatCount`: Number of times the action should be repeated
    - `actions`: Array of actions and configurations to be executed

#### Cron Expression
- Standard cron syntax defining execution schedule
- Supports all standard cron expression features
- Defines precise timing for event execution

#### Actions Array
- Supports two types of actions within a single scheduled event:
    1. Configuration Actions (`type: "CONFIGURATION"`)
        - Apply device settings
        - Modify hardware, software, OS, or APK configurations
    2. Immediate Actions (`type: "ACTION"`)
        - Trigger one-time device operations
        - Examples: sync, reboot, logs collection

### Execution Behavior
- Device stores the entire scheduled event configuration
- Scheduler tracks:
    - Next execution time
    - Remaining repetitions
    - Actions to be performed
- Upon reaching the scheduled time:
    - Execute all actions in the order they appear
    - Decrement repeat count
    - Update next execution time
- Stop executing when:
    - Repeat count reaches zero
    - Manually cancelled by MDM
    - Device reset or configuration changed

**Payload Structure:**
```json
{
  "type": "SCHEDULED_EVENT",
  "deviceUid": "1c310dab5cb53942",
  "deviceModel": "b1",
  "rules": [
    {
      "type": "cron",
      "params": {
        "cronExpression": "15 14 1 * *",
        "repeatCount": 3,
        "actions": [
          {
            "type": "CONFIGURATION",
            "rules": [
              {
                "type": "hardware",
                "params": {
                  "option": "wifi",
                  "value": false
                }
              }
            ]
          },
          {
            "type": "ACTION",
            "rules": [
              {
                "type": "sync",
                "params": {}
              }
            ]
          }
        ]
      }
    }
  ]
}
```

### 3.4 Scenario Messages

- Scenarios are complex, conditional event sequences
- Stored persistently on the device
- Supports multiple condition types for event triggering

#### Condition Types for Repeat Blocks

##### 1. While Condition
- Continuous evaluation of complex logical conditions
- Uses nested conditional logic
- Executes actions while conditions are true

```json
{
  "type": "while",
  "value": {
    "conditionalOperator": "AND",
    "conditions": [
      {
        "type": "deviceId",
        "condition": "equal",
        "value": "1c310dab5cb53942"
      },
      {
        "type": "deviceSensor",
        "condition": "has",
        "value": "battery"
      }
    ]
  }
}
```

##### 2. Cron Condition
- Schedule-based scenario execution
- Uses standard cron expression
- Repeat scenario at specific time intervals

```json
{
  "condition": {
    "type": "cron",
    "value": "15 14 1 * *"
  }
}
```

##### 3. Counter Condition
- Limits scenario execution by count
- Automatically stops after specified number of iterations

```json
{
  "condition": {
    "type": "counter",
    "value": 20
  }
}
```

#### Scenario Structure Requirements
- Every repeat block MUST have:
    1. `condition` block (one of the three types)
    2. `actions` block (array of configurations and actions)

#### Condition Evaluation Rules
- `while` condition: Continuously evaluated
- `cron` condition: Triggered at specified intervals
- `counter` condition: Stops after defined iterations

#### Key Principles
- Flexible, complex conditional logic
- Multiple condition types
- Persistent scenario storage
- Combines configuration and action capabilities

#### Conditional Operators
- `AND`: All conditions must be true
- `OR`: At least one condition must be true
- Supports nested, complex condition structures

#### Supported Condition Types
- Device ID matching
- Sensor state checking
- Comparative operations
- Value-based conditions

This comprehensive approach allows for highly sophisticated, context-aware device management scenarios.

**Updated Payload Structure:**
```json
{
  "type": "SCENARIO",
  "deviceUid": "1c310dab5cb53942",
  "deviceModel": "b1",
  "rules": [
    {
      "type": "scenario",
      "params": {
        "type": "repeat",
        "condition": {
          "type": "while",
          "value": {
            "conditionalOperator": "AND",
            "conditions": [
              {
                "type": "diviceId",
                "condition": "equal",
                "value": "1c310dab5cb53942"
              },
              {
                "type": "deviceSensor",
                "condition": "has",
                "value": "battery"
              },
              {
                "type": "compare",
                "condition": "lessThen",
                "operators": [
                  {"type":"deviceOs"},
                  {"type": "exactValue", "value": "1.1.4-20240821-B1"}
                ]
              }
            ]
          }
        },
        "actions": [
          {
            "type": "CONFIGURATION",
            "rules": [
              {
                "type": "hardware",
                "params": {
                  "option": "wifi",
                  "value": false
                }
              }
            ]
          },
          {
            "type": "ACTION",
            "rules": [
              {
                "type": "sync",
                "params": {}
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---
Next: [Device Rules Engine](./Rules%20Engine.md)