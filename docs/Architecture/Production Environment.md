# AWS & Docker

## Production Environment Overview

* Docker

* AWS EC2

* AWS RDS



## Context

Orderly is designed as a web application targeting retail and restaurant business owners. Orderly's primary client is business owner, and it runs on a server. source code may be distributed to businesses who wish to setup their own server, but it will not be distributed to end users who place orders through an Orderly powered strorefront. 



## Decision

Use Docker to containerize Frontend and Backend. Install on an AWS EC2 cloud server instance. Setup Database on AWS RDS Instance and link to server. 



## Why

AWS and Docker are both industry standard tools. AWS being the standard cloud server platform, and Docker the standard for replicating development environments for live applications.



## Consequences

+ Backend configuration must disable settings that assume a debug or development environment

+ EC2 configuration should allow public access, so backend configuration must be secure by default (ssl, https, etc)

+ Any hardcoded passwords or URLs must move to environment variables

+ Environment variables will allow the application to work the same on cloud or development environments 

+ Must have an AWS account and set up EC2 and RDS instances for presentation, turn in, and installation guide

+ Need backlog tasks, *6.4 Move to environment variables,* *6.5 Containerize Frontend and Backend,* *6.6 Initialize EC2 and RDS,* and *6.7 Run Containers and Test*






