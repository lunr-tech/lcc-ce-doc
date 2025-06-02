![Lunr.tech](https://lunr.tech/wp-content/uploads/2024/05/logo.png)

# LCC Mobile Device Management (MDM) System

## Project Vision

**Name:** LCC Mobile Device Management (MDM) System
**Goal:** Provide a secure, scalable system for registering, managing, monitoring, and controlling mobile devices remotely.

## Technology Stack

* **Backend:** Symfony 7 (PHP)
* **Frontend:** Vue.js (or a Vue-based framework)
* **Messaging:** MQTT (EMQX)
* **Database:** Mariadb
* **Device Rule Engine UI:** Google Blockly

**Sensors Compatibility:** Home Assistant API standards

## 🧱 Core Features

* Device self-registration with admin approval
* MQTT communication between approved devices and MDM
* File sharing API (upload/download for OS updates and apps)
* Authorization via device-specific tokens
* Bi-directional communication: Device data push + command delivery
* Rule-based configuration using visual rule builder
* Admin panel with device CRUD, logs, updates, apps, rules

## 🔐 Actors

| Actor         | Description                                                            |
|---------------|------------------------------------------------------------------------|
| Admin         | System administrator who manages devices and rules                     |
| Mobile Device | Device with MDM client that communicates over MQTT                     |
| System API    | Provides backend logic and file access via REST                        |
| MQTT Broker   | Real-time communication bridge for command/data flow                   |

---
Next: [System Requirements](./System%20Requirements.md)