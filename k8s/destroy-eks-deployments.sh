#!/bin/bash

set -e

echo "🧨 Deleting Kubernetes workloads..."
kubectl delete -f k8s/ingress.yaml --ignore-not-found
kubectl delete -f k8s/frontend-deployment.yaml --ignore-not-found
kubectl delete -f k8s/frontend-service.yaml --ignore-not-found
kubectl delete -f k8s/backend-deployment.yaml --ignore-not-found
kubectl delete -f k8s/backend-service.yaml --ignore-not-found

echo "🔐 Deleting Kubernetes secrets..."
kubectl delete secret app-secret --ignore-not-found

echo "🧼 Deleting NGINX Ingress Controller..."
helm uninstall ingress-nginx -n ingress-nginx || true
kubectl delete ns ingress-nginx --ignore-not-found

echo "✅ Everything cleaned up from EKS."
