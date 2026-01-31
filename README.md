# Orderly
## Fast, Flexible Ordering for Any Business

**Team Members:**  Serina Rodriguez, Kim Mayo, Tristin Gatt, Rachel Mizer, Tyler Aaron Royal, Caleb James Fowlkes, Kenny Bacdayan

## Project Description

Orderly is a self-service ordering system designed for small and medium-sized businesses that need an intuitive, affordable way to manage customer orders. The system provides a simple customer interface for browsing and customizing items, along with a business dashboard for managing inventory, menus, and sales activity. The goal is to streamline operations, reduce wait times, and eliminate the complexity of traditional ordering systems.

## Project Overview

Orderly focuses on delivering a functional prototype that supports customer ordering, real-time inventory updates, and basic sales reporting. The project follows Agile Scrum, progressing through requirements gathering, high-level design, and final prototype development. Success is measured by usability, reliability, and the system’s ability to support both customer and business workflows.

## Key Features

Customers can browse items, customize orders, and check out through a responsive interface optimized for mobile and kiosk devices. Businesses can update menus, track inventory, and view sales summaries. The system also logs all orders, supports order status updates, and provides basic analytics such as top-selling items. Future enhancements include payment integration, supplier automation, loyalty programs, and advanced analytics.

## Requirements Summary

The system must support secure user accounts, real-time inventory tracking, intuitive browsing, and streamlined order submission. Business users need tools for managing products, prices, and stock levels, while customers require a smooth, touch-friendly interface. Non-functional requirements emphasize security, fast performance, and scalability for large user bases.

## Architecture

Orderly uses a client–server architecture with a React or web-based frontend communicating with a Node.js/Express backend through secure REST APIs. MySQL serves as the primary database, storing customers, orders, products, suppliers, and related relationships. The system is designed for cloud deployment and future integration with external services.

## Security

Security centers on AES-256 encryption for data at rest, HTTPS for all communication, and role-based access control separating customer and business permissions. Authentication is handled through JWT, and all inputs are validated to protect against unauthorized access or injection attacks.

## Reporting

The system includes built-in reporting for sales performance, inventory status, and customer order history. These reports help businesses track trends, identify low-stock items, and understand customer behavior, with options for filtering and exporting data.

## Hardware Requirements

Orderly runs on standard web-enabled devices such as tablets, kiosks, smartphones, and desktops. The server environment requires a cloud or on-premise machine capable of running Node.js, MySQL, and a modern web server, with stable network connectivity and secure storage.
