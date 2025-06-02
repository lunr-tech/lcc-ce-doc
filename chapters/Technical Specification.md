![Lunr.tech](https://lunr.tech/wp-content/uploads/2024/05/logo.png)

# Technical Specification

This document provides an abstract overview of the technical aspects of the LCC Community Edition (CE).

## Frameworks

This section provides an overview of the core frameworks used in the MDM portal, detailing how the front-end and
back-end components are structured and interact.

### Backend

- **Framework**: Symfony 7 (PHP 8.2+)
- **Architecture**: Modular service-oriented design
- **Internal Communication**: Uses Symfony’s built-in messaging system (Messenger component) for asynchronous
  communication between internal components.
- **External Interface**: Exposes a REST API for integration with external systems and device communication.
- **Frontend Integration**: Provides an internal API layer consumed by the Vue.js single-page application.

> **Note**: PHP was selected for the backend because the previous Enterprise LCC version of the system was built using
> PHP. Reusing and modernizing portions of the existing codebase provides continuity, reduces redevelopment time, and
> ensures smoother migration for previous customers.

### Frontend

- **Framework**: Vue.js
- **Type**: Single Page Application (SPA)
- **Function**: Admin panel interface for managing devices, users, policies, and real-time events.
- **Communication**: Interacts with the back-end via the internal API and WebSocket channel for live updates.

> The framework choices emphasize maintainability, modularity, and responsive real-time administration features.

## Communication Protocols

This section outlines the communication protocols used within the MDM portal for interacting with client devices,
services, and the admin panel. Each protocol serves a specific purpose to ensure efficient, real-time, and reliable data
exchange.

### 1. REST API

- **Port**: `8080`
- **Protocol**: HTTP/HTTPS
- **Type**: RESTful API
- **Description**: Primary interface for client devices and external systems to perform CRUD operations, authenticate,
  and exchange structured data with the MDM backend.

### 2. MQTT

- **Port**: `1883`
- **Protocol**: MQTT (Message Queuing Telemetry Transport)
- **Description**: Lightweight, publish-subscribe messaging protocol used for real-time communication between the MDM
  system and enrolled devices. Ideal for low-bandwidth, high-latency environments.

### 3. WebSocket (Admin Panel)

- **Port**: `8080/ws`
- **Protocol**: WebSocket over HTTP
- **Description**: Persistent, full-duplex communication channel used by the admin panel for real-time updates such as
  device status, logs, and alerts.

> **Note**: The default ports listed above can be customized per installation to fit different network environments or
> security policies.

> All communication channels must be secured using TLS where applicable. Authentication and authorization should be
> enforced per protocol.

## API Standards

This document outlines the standards and best practices for designing, implementing, and documenting APIs within our
system.

### 1. API Design Principles

- **RESTful Design**: Our APIs follow the principles of REST, leveraging standard HTTP methods (GET, POST,...) for
  resource manipulation.
- **Resource-Oriented**: API endpoints are designed to represent resources using nouns (e.g., `/sensors`), rather than
  actions.
- **Statelessness**: All API requests are stateless. The server does not retain any client-specific information between
  requests.

### 2. URL Naming Conventions

- Employ **lowercase**, **hyphen-separated** words in URLs (e.g., `/sensors`,  `/actions`).
- Utilize **plural nouns** for resource collections (e.g., `/sensors`).

### 3. HTTP Methods

| Method | Usage                                                      |
|--------|------------------------------------------------------------|
| `GET`  | Retrieve a specific resource or a collection of resources. |
| `POST` | Create a new resource.                                     |

### 4. Response Format

- All API responses are formatted in **JSON**.
- The standard response structure includes:

```json
{
  "serverTime": "2025-01-13 10:22:18",
  "action": "/api/v1/config",
  "code": 200,
  "response": {
    ...
  }
}
```

### 5. Error Handling

We utilize standard HTTP status codes to indicate the outcome of API requests:

 - 503 - API server is on maintenance. Try again later please
- 500 - Unknown error/response status
- 400 - Request JSON is not valid and can not be evaluated
- 406 - No such API function
- 404 - There is no items for your search request. Try again later please
- 403 - The requested resource can't be managed with your access rights
- 401 - Auth token is not valid or token has no access permission for this action
- 429 - Too Many Requests

The format for error responses is as follows:

```json
{
  "serverTime": "2025-01-13 10:22:18",
  "action": "/api/v1/config",
  "code": 401,
  "response": "Auth token is not valid or token has no access permission for this action"
}
```

### 6. API Versioning

 - API's must be versioned using URI path versioning:
   - Example: /v1/config 
 - Major version changes require backward-incompatible changes and must be documented.

### 7. Authentication & Authorization

More about authentication and authorization can be found in the [Authentication](./chapters/API.md#authentication) section.

All requests except enrollment and get token API call must include a valid bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### 8. Rate Limiting

APIs should implement rate limiting (e.g., 100 requests per minute).
Clients exceeding the limit receive 429 Too Many Requests.

### 9. Documentation

Every API must be documented using OpenAPI (Swagger).
The spec must be published and kept up to date at /docs.

---
Next: [System Architecture Diagrams](./System%20Architecture.md)