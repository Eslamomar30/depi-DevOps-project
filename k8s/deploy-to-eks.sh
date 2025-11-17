#!/bin/bash

set -e

# === CONFIG ===
CLUSTER_NAME="nti-devops-cluster"
REGION="us-east-1"
ENV_FILE=".env"
NAMESPACE="default"

echo "🔧 Updating kubeconfig for EKS..."
aws eks --region $REGION update-kubeconfig --name $CLUSTER_NAME

echo "📦 Installing NGINX Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.publishService.enabled=true

echo "⏳ Waiting for LoadBalancer IP..."
sleep 30
kubectl get svc -n ingress-nginx

echo "🔐 Creating Kubernetes secret from .env..."
kubectl delete secret app-secret --ignore-not-found
kubectl create secret generic app-secret --from-env-file=$ENV_FILE

echo "🚀 Deploying backend, frontend, and services..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml

echo "✅ Deployment completed."
kubectl get ingress
