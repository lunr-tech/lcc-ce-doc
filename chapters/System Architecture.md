![Lunr.tech](https://lunr.tech/wp-content/uploads/2024/05/logo.png)

# System Architecture

This section describes the high-level architecture and event flow within the MDM portal, specifically focusing on how
device events are received, processed, and responded to through a distributed microservice-based backend.

The architecture leverages MQTT for real-time communication with devices, internal microservices for event processing
and orchestration, and a message queue for decoupled event flow.

## Context Diagram

![context diagram](../diagrams/LCC%20-%20Context%20Diagram%20(C4%20level%201).drawio.png)

The LCC (Lifecycle Control Center) System Context diagram illustrates the high-level interactions between the Mobile
Device Management (MDM) system and its surrounding entities. This diagram represents the system's external boundaries
and the relationships with users and external systems.

### Key Actors and Systems

#### People

| Actor                  | Description                                                           | Responsibilities                                                                                  |
|------------------------|-----------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| **LCC Admin User**     | Human administrator managing mobile devices via web application       | Configures device settings, monitors device health, deploys updates, and manages device inventory |
| **Mobile Device User** | A user of a mobile phone or tablet with MDM client software installed | Uses the managed device, triggers sensor data collection, receives updates                        |

#### Software Systems

| System             | Description                                                     | Role                                                                            |
|--------------------|-----------------------------------------------------------------|---------------------------------------------------------------------------------|
| **LCC MDM System** | The main system (Web UI + Backend API + Database + MQTT Broker) | Central hub for device management, providing command and control capabilities   |
| **Home Assistant** | External integration system                                     | Optional system for receiving device sensor data and sending automation actions |
| **LCC Updater**    | System for sharing updates for APKs and Device OSs              | Provides software and operating system updates to managed devices               |

### Key Relationships

#### LCC Admin User → LCC MDM System

- **Description**: Uses via browser to manage devices
- **Technology**: Web browser interface
- **Frequency**: Regular administrative tasks

#### Mobile Device User → LCC MDM System

- **Description**: Registers devices, uploads sensor data, receives settings, updates, and data request commands
- **Technology**: Mobile client application, MQTT, REST API
- **Frequency**: Continuous connectivity with periodic data exchange

#### LCC MDM System → Home Assistant

- **Description**: Optional integration that provides device sensor data and receives automation actions
- **Technology**: API integration, event-based communication
- **Frequency**: As needed based on configuration

#### LCC Updater → LCC MDM System

- **Description**: Provides APK and OS updates to be distributed to managed devices
- **Technology**: Secure file transfer, version control
- **Frequency**: Periodic as updates become available

### System Boundaries

The LCC System Context diagram clearly delineates the boundaries between:

- User-facing interfaces (admin web UI and mobile device client)
- Core MDM system functionality
- External system integrations (Home Assistant)
- Update distribution mechanisms

This context diagram serves as the foundation for more detailed container and component diagrams that will further
elaborate on the internal architecture of the LCC MDM System.

> **Note**: This C4 model context diagram focuses on the "what" and "why" rather than the "how" of the system
> architecture. The upcoming container diagram will provide deeper insights into the internal structure of the LCC MDM
> System.

## Container diagram

![Container diagram](../diagrams/LCC%20-%20Container%20Diagram%20(C4%20Level%202).drawio.png)

This container diagram describes the high-level architecture of the **LCC MDM System**, highlighting the major
containers within the system and how they interact with external systems and users.

### System Scope

| System             | Type            | Description                                                                                                                                                                                 |
|--------------------|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **LCC MDM System** | Software System | A Mobile Device Management (MDM) system that enables remote administration and control of mobile devices, including configuration, update management, monitoring, and secure communication. |

### External Actors

| Actor                  | Description                                                                |
|------------------------|----------------------------------------------------------------------------|
| **LCC Admin User**     | Human administrator managing mobile devices via web application.           |
| **Mobile Device User** | A user of a mobile phone or tablet that has MDM client software installed. |

### External Systems

| System             | Description                                       |
|--------------------|---------------------------------------------------|
| **Home Assistant** | External software system (purpose not detailed).  |
| **LCC Updater**    | System for distributing updates to APKs and OSes. |

### Containers in LCC MDM System

| Container                       | Technology                    | Description                                                               |
|---------------------------------|-------------------------------|---------------------------------------------------------------------------|
| **Single Page Web Application** | JavaScript, Vue.js            | Provides UI for LCC administrators to manage mobile devices.              |
| **API Application**             | Symfony 7 (PHP Framework)     | Backend API providing communication and control interface for devices.    |
| **Mobile App \| Mobile OS**     | Android OS, Application Level | Embedded MDM logic for controlling and integrating with mobile devices.   |
| **Message Broker**              | EMQX or NanoMQ (MQTT broker)  | Enables real-time event communication, telemetry, and command dispatch.   |
| **Cache**                       | Redis                         | Temporarily stores API responses, session data, or query results.         |
| **Database**                    | MariaDB                       | Persists device records, application metadata, settings, and sensor data. |

### Key Interactions

#### User Interactions

- **LCC Admin User** interacts with the **Single Page Web Application**
- **Mobile Device User** interacts with the **Mobile App \| Mobile OS**

#### Container Interactions

- **Single Page Web Application** communicates with the **API Application**
- **API Application** has multiple dependencies:
    - Uses the **Message Broker** for event-based communication
    - Stores data in the **Database**
    - Caches frequent data via the **Cache**
    - May fetch or deliver updates from **LCC Updater**

#### Mobile Interactions

- **Mobile App \| Mobile OS** communicates with:
    - **API Application** for standard HTTP/REST operations
    - **Message Broker** for real-time command and telemetry flows

#### External System Interfaces

- **API Application** or **Mobile App \| Mobile OS** might interface with **Home Assistant** for additional integration
  capabilities

### Architecture Considerations

This container diagram represents the second level of the C4 model, focusing on the technology choices and container
boundaries within the LCC MDM System. Key architectural considerations include:

1. **Separation of Concerns** - Each container has well-defined responsibilities
2. **Technology Diversity** - Appropriate technologies selected for each container's purpose
3. **Communication Patterns** - Mix of REST API and event-driven messaging
4. **Data Management** - Separate containers for persistent and cached data
5. **Integration Points** - Clear interfaces with external systems

The architecture supports scalability by allowing containers to be scaled independently, and maintainability through
clear boundaries between components. This design provides development teams with clarity on how their work fits into the
overall system.

> **Note**: This container diagram builds upon the context diagram by decomposing the LCC MDM System into its
> constituent containers. A component diagram would be the next level of detail, showing the internal structure of each
> container.

## LCC <-> Device Communication Diagram

![communication sequence diagram](../diagrams/LCC%20-%20Device%20Communication%20flow.png)

The following outlines the interaction between components when a mobile device publishes an event and receives a command
in response:

### 1. Device Subscription

- The mobile device connects to the MQTT broker
- It subscribes to its dedicated topic:
  ```
  lcc/device/uid/{deviceUid}
  ```
- This topic is used to receive device-specific commands from the MDM system

### 2. Event Publication by Device

- The device publishes an event to the shared topic:
  ```
  lcc/device/events
  ```

- The payload includes event metadata, a token for authentication, device information, and event-specific data:

```json
{
  "type": "[EVENT_TYPE]",
  "token": "[ACCESS_TOKEN]",
  "deviceUid": "[DEVICE_UID]",
  "deviceModel": "[DEVICE_MODEL]",
  "message": {
    // Event-specific data
  }
}
```

### 3. Event Processing

The MQTT broker forwards the event to the MDM Event Listener microservice.

The Event Listener:

- Validates the access token
- Parses and verifies the event content
- Publishes the validated event to the internal message queue or bus

### 4. Command Orchestration

The MDM Command Orchestrator microservice:

- Consumes the validated event from the queue
- Determines the appropriate response or set of commands for the device
- Sends these commands to the MDM Command Dispatcher

### 5. Command Dispatch to Device

The Command Dispatcher:

- Publishes the command payload to the device-specific topic:
  ```
  lcc/device/uid/{deviceUid}
  ```
- The MQTT broker delivers the command back to the mobile device in real time

### Components Overview

| Component                | Description                                                                |
|--------------------------|----------------------------------------------------------------------------|
| Mobile Device            | Publishes events and receives commands via MQTT                            |
| MQTT Broker              | Facilitates real-time message routing between devices and backend services |
| MDM Event Listener       | Validates and processes incoming device events                             |
| Message Queue/Bus        | Decouples communication between services via asynchronous messaging        |
| MDM Command Orchestrator | Determines appropriate commands based on device events                     |
| MDM Command Dispatcher   | Sends commands to devices via MQTT broker                                  |

> **Note**: This architecture ensures scalability, real-time responsiveness, and modular separation of concerns.

## Single Page Web Application Component Diagram

![Single Page Web Application Component Diagram](../diagrams/LCC%20-%20Single%20Page%20Web%20Application%20-%20Component%20Diagram(C4%20Level%203).drawio.png)

### 📌 Container: **Single Page Web Application**

**Type**: Container
**Technology**: Vue.js
**Purpose**: Admin-facing interface for managing mobile devices.

---

### 👤 Person

**LCC Admin User**

* Interacts via **Browser/HTTPS**
* *"Human administrator managing mobile devices via web application"*

---

### 🧱 Components within the SPA

#### 1. **Entrypoint Module**

* **Technology**: Vue.js module
* **Purpose**:

    * User login/logout
    * Entrypoint logic
    * Profile management

#### 2. **Dashboard Module**

* **Technology**: Vue.js module
* **Purpose**:

    * System overview statistics
    * Quick action shortcuts
    * Status indicators
    * Recent activity feeds

#### 3. **Device Management Module**

* **Technology**: Vue.js module
* **Purpose**:

    * Manage devices and models
    * Monitor device status

#### 4. **Rule Engine**

* **Technology**: Vue.js module
* **Purpose**:

    * Device Rules Creator

#### 5. **UI Components Module**

* **Technology**: Vue.js module
* **Purpose**:

    * Reusable UI elements such as:

        * Data tables
        * Button groups
        * Indicators
        * Widgets
        * Notifications

#### 6. **Logging Module**

* **Technology**: Vue.js module
* **Purpose**:

    * View system logs
    * Search/filter logs
    * Export/report

#### 7. **Services Module**

* **Technology**: Vue.js module
* **Purpose**:

    * API communication
    * Event bus
    * Data transformation
    * Caching

---

### 🌐 External System

#### **API Application**

* **Technology**: Symfony 7 (PHP)
* **Purpose**:

    * Backend realization for device communication APIs
    * Connected by the **Services Module**

---
Next: [Authentication](./Authentication.md)