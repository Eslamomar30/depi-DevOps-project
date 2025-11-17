# Depi DevOps : final project: End-to-End Automated CI/CD Pipeline on AWS for Student Certificate Delivery

A **MERN**-stack project: a student certificate delivery platform with an admin dashboard and a simple public site. Fully automated CI/CD pipeline on AWS, with infrastructure as code, configuration management, containerization, orchestration, quality gates, and monitoring.

## 🎥 Demo Video

▶️ [Watch the demo on YouTube](https://youtu.be/hyQF2E94qrA)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Getting Started](#getting-started)
7. [Placeholders](#placeholders)
8. [License & Acknowledgments](#license--acknowledgments)

---

## 🎯 Project Overview

This platform allows students to request and download certificates, and administrators to manage users and certificate issuance:

- **Public Site**: React + Tailwind CSS, responsive, basic login/registration.
- **Admin Dashboard**: React + Tailwind CSS, protected area for certificate management.
- **Backend API**: Node.js + Express, DynamoDB for user & certificate metadata, S3 for certificate storage.

---

## ✨ Features

- **User Authentication**: JWT-based login & registration.
- **Certificate Storage**: Upload & serve PDF certificates from S3.
- **Admin Controls**: Issue, revoke, and view certificates.
- **Audit Trail**: Record actions in DynamoDB.

---

## 🏗 Architecture

![Architecture Diagram](./docs/arch.svg)  
_Figure: End-to-end AWS + Kubernetes + CI/CD architecture._

Briefly:

1. **Infrastructure as Code** with **Terraform**
2. **Configuration Management** with **Ansible**
3. **Containerization** with **Docker**
4. **Orchestration** on **EKS** via Kubernetes manifests
5. **Quality Gates**: SonarQube (code), Trivy (container)
6. **CI/CD**: Jenkins pipelines triggered by GitHub webhooks
7. **Monitoring**: Prometheus & Grafana, Slack alerts

---

## 🛠 Tech Stack

| Layer             | Technology                        |
| ----------------- | --------------------------------- |
| **Frontend**      | React, Tailwind CSS, Vite         |
| **Backend**       | Node.js, Express                  |
| **Database**      | AWS DynamoDB                      |
| **Storage**       | AWS S3                            |
| **Infra as Code** | Terraform                         |
| **Config Mgmt**   | Ansible                           |
| **CI/CD**         | Jenkins, GitHub                   |
| **Containers**    | Docker, Docker Compose (local)    |
| **Orchestration** | Kubernetes (EKS), NGINX Ingress   |
| **Quality Gates** | SonarQube, Trivy                  |
| **Monitoring**    | Prometheus, Grafana, Alertmanager |
| **Notifications** | Slack webhook                     |

---

## 🚀 CI/CD Pipeline

1. **Terraform**

   - Provision VPC, EKS cluster (2 nodes + ASG + ELB)
   - Create RDS + Secrets Manager
   - Launch EC2 for Jenkins & SonarQube
   - Daily Jenkins AMI backups via AWS Backup
   - ELB access logs → S3 bucket
   - ECR repositories for frontend & backend

2. **Ansible**

   - Install & configure Jenkins (plugins, credentials)
   - Install CloudWatch Agent on all EC2

3. **Docker**

   - Build application images
   - Local Docker Compose for dev

4. **Kubernetes**

   - Manifests for deployments, services, network policies
   - Ingress for routing and TLS

5. **Jenkins Pipeline**

   - **Multibranch** on GitHub pushes
   - **Stages**:
     1. SonarQube analysis → fail on quality gate
     2. Build & scan Docker images with Trivy
     3. Push to AWS ECR
     4. Deploy to EKS (kubectl apply / Helm)

6. **Monitoring & Alerting**
   - Deploy **Prometheus + Alertmanager + Grafana** via Helm
   - Auto-discover pods & nodes
   - CPU/Memory alerts (> 80% for 2m) → Slack
   - Grafana dashboards for cluster & app metrics
