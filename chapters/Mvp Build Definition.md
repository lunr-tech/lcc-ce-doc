![Lunr.tech](https://lunr.tech/wp-content/uploads/2024/05/logo.png)
# MVP Build Definition

## 1. Introduction

This document outlines the specifications for the Minimum Viable Product (MVP) of the LCC Mobile Device Management (MDM) system. The goal of this MVP is to demonstrate core functionality and validate key architectural decisions before expanding features in subsequent releases.

## 2. Goals & Scope

The primary goal of the MVP is to provide a functional MDM solution capable of registering, monitoring, and controlling a limited set of devices. This MVP will focus on Android devices.  We aim for a simple, usable experience for both administrators and end-users.

## 3. Functional Requirements (MVP)

This MVP will include the following core features:

*   **Device Enrollment:**
    *   Self-registration via a web portal with admin approval.
    *   Basic device information capture during enrollment (device model, OS version).
*   **Remote Configuration:**
    *   Update device settings (e.g., Wi-Fi, VPN).
    *   Push configuration profiles to devices.
    *   Basic application management (install/uninstall).
    *   Os update management (push OS updates).
*   **Remote Control:**
    *   Ability to wipe data from a device.
*   **Admin Panel:**
    *   Device listing with basic information and status.
    *   Approval/Rejection of registration requests.
    *   Wipe functionality for individual devices.
    *   Application Management (Distribution/Blacklisting/Whitelisting/Updates).
    *   Rule-Based Configuration using Google Blockly

## 4. Non-Functional Requirements (MVP)

*   **Performance:**  The system should be able to handle at least 100 concurrent devices without significant performance degradation.
*   **Security:** Secure communication channels (HTTPS). Basic authentication for the admin panel.
*   **Usability:** Intuitive web portal for administrators and a straightforward enrollment process for end-users.
*   **Reliability:** The system should be available 99% of the time during business hours.

## 5. Technology Stack (MVP)

This MVP will leverage the technologies outlined in the Project Vision document:

*   **Backend:** Symfony 7 (PHP)
*   **Frontend:** Vue.js
*   **Database:** MariaDB

## 6. Out of Scope for MVP

The following features are explicitly excluded from this MVP:

*   Advanced Reporting & Analytics
*   Advanced web portal features
*   UI/UX enhancements
*   ADB and remote control support
*   Unit Tests coverage

## 7. Success Criteria

The MVP will be considered successful if:

*   Devices can be successfully enrolled, configured, monitored remotely.
*   Administrators can effectively manage devices through the admin panel.
*   The system meets the performance and reliability requirements outlined above.

---



