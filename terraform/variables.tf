# variables.tf - All input variable declarations

# Global Configuration
variable "aws_region" {
  description = "AWS region where resources will be deployed"
  type        = string
  default     = "us-east-1"
}

variable "key_name" {
  description = "Name of existing EC2 key pair for instance access"
  type        = string
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_count" {
  description = "Number of public subnets to create"
  type        = number
  default     = 2
}

# EKS Configuration
variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "ci-cd-cluster"
}

variable "eks_node_instance_type" {
  description = "Instance type for EKS worker nodes"
  type        = string
  default     = "t3.medium"
}

variable "eks_node_count" {
  description = "Number of worker nodes in EKS cluster"
  type        = number
  default     = 2
}

variable "eks_max_node_count" {
  description = "Maximum number of worker nodes for scaling"
  type        = number
  default     = 3
}

# Jenkins Configuration
variable "jenkins_instance_type" {
  description = "Instance type for Jenkins server"
  type        = string
  default     = "t3.medium"
}

# Backup Configuration
variable "backup_retention_days" {
  description = "Number of days to retain Jenkins backups"
  type        = number
  default     = 7
}

# Load Balancer Configuration
variable "lb_log_retention_days" {
  description = "Number of days to retain ALB access logs"
  type        = number
  default     = 90
}