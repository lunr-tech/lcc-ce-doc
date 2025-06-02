![Lunr.tech](https://lunr.tech/wp-content/uploads/2024/05/logo.png)

# Authentication

![authentication](../diagrams/Device%20Authentication%20flow.png)

## Authentication Flow

The flow is divided into logical phases:

1. **Enrollment Phase**:
    - Device sends enrollment request with its identifiers
    - System generates initial tokens
    - Device stores tokens securely

2. **Admin Approval Phase**:
    - Admin views and approves unauthenticated devices
    - System updates device status to approved

3. **Authentication & Usage Phase**:
    - Device uses access token for API calls
    - Device connects to MQTT broker using the same token
    - MQTT broker validates the token with the API

4. **Token Refresh Phase**:
    - When access token expires, device uses refresh token
    - System validates refresh token and issues new access token

5. **Token Revocation**:
    - Admin can revoke access by invalidating the refresh token
    - Subsequent refresh attempts will fail

This implementation follows domain-driven design principles by separating the device enrollment process from the authentication workflow, while maintaining security through the JWT token mechanism.

## Technical Implementation Aspects

### Symfony 7 integration
Symfony provides excellent tools for JWT authentication that fit perfectly with your MDM system:

1. **JWT Authentication Bundle**:
    - Use `lexik/jwt-authentication-bundle` for token creation and validation
    - Configure custom token extractors for device-specific authentication

2. **Device Enrollment API**:
    - Create a Symfony controller for device enrollment
    - Use Symfony's security component for token issuance without passwords
    - Implement device validation logic in a dedicated service

3. **Token Management**:
    - Store refresh tokens in Doctrine entities
    - Create a token refresh controller endpoint
    - Implement token revocation functionality

4. **Admin Interface**:
    - Use EasyAdmin or API Platform to create the admin approval interface
    - Implement device status management
   
### EMQX Integration

EMQX supports JWT authentication out of the box, making it a perfect fit:

1. **EMQX JWT Authentication**:
    - Configure EMQX to use JWT authentication plugin
    - Set up shared secrets between Symfony and EMQX
    - Configure JWT verification parameters (algorithm, expiration, etc.)

2. **Access Control**:
    - Use JWT claims to control MQTT topic access
    - Map device permissions to MQTT ACLs


---
Next: [API](./Api.md)