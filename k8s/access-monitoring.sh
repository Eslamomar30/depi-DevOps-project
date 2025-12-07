#!/bin/bash
# Script to access Prometheus and Grafana via port-forward
# Usage: ./access-monitoring.sh [grafana|prometheus|both]

NAMESPACE="monitoring"

check_pod_status() {
    local pod_name=$1
    local status=$(kubectl get pod -n $NAMESPACE -l app.kubernetes.io/name=$pod_name -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
    
    if [ "$status" = "Running" ]; then
        return 0
    else
        return 1
    fi
}

case "$1" in
    grafana)
        echo "Checking Grafana pod status..."
        if check_pod_status "grafana"; then
            echo "✅ Grafana pod is running. Starting port-forward..."
            echo "Access Grafana at: http://localhost:3000"
            echo "Default username: admin"
            echo "Get password: kubectl get secret monitoring-grafana -n monitoring -o jsonpath='{.data.admin-password}' | base64 -d"
            echo ""
            kubectl port-forward -n $NAMESPACE svc/monitoring-grafana 3000:80
        else
            echo "❌ Grafana pod is not running yet. Current status:"
            kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=grafana
            echo ""
            echo "Wait for the pod to be Running, then try again."
        fi
        ;;
    prometheus)
        echo "Checking Prometheus pod status..."
        if kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=prometheus | grep -q Running; then
            echo "✅ Prometheus pod is running. Starting port-forward..."
            echo "Access Prometheus at: http://localhost:9090"
            echo ""
            kubectl port-forward -n $NAMESPACE svc/monitoring-kube-prometheus-prometheus 9090:9090
        else
            echo "❌ Prometheus pod is not running yet. Current status:"
            kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=prometheus
            echo ""
            echo "Wait for the pod to be Running, then try again."
        fi
        ;;
    both|"")
        echo "=== Monitoring Access Script ==="
        echo ""
        echo "Checking pod status..."
        echo ""
        
        GRAFANA_RUNNING=false
        PROMETHEUS_RUNNING=false
        
        if check_pod_status "grafana"; then
            GRAFANA_RUNNING=true
            echo "✅ Grafana: Running"
        else
            echo "❌ Grafana: Not running"
        fi
        
        if kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=prometheus | grep -q Running; then
            PROMETHEUS_RUNNING=true
            echo "✅ Prometheus: Running"
        else
            echo "❌ Prometheus: Not running"
        fi
        
        echo ""
        
        if [ "$GRAFANA_RUNNING" = true ] && [ "$PROMETHEUS_RUNNING" = true ]; then
            echo "Both services are running!"
            echo ""
            echo "To access Grafana, run in one terminal:"
            echo "  kubectl port-forward -n $NAMESPACE svc/monitoring-grafana 3000:80"
            echo "  Then open: http://localhost:3000"
            echo ""
            echo "To access Prometheus, run in another terminal:"
            echo "  kubectl port-forward -n $NAMESPACE svc/monitoring-kube-prometheus-prometheus 9090:9090"
            echo "  Then open: http://localhost:9090"
            echo ""
            echo "Grafana default credentials:"
            echo "  Username: admin"
            echo "  Password: $(kubectl get secret monitoring-grafana -n monitoring -o jsonpath='{.data.admin-password}' 2>/dev/null | base64 -d 2>/dev/null || echo 'Run: kubectl get secret monitoring-grafana -n monitoring -o jsonpath=\"{.data.admin-password}\" | base64 -d')"
        else
            echo "⚠️  Some pods are not running yet. Wait for AWS quota increase or check status:"
            echo "  kubectl get pods -n $NAMESPACE"
        fi
        ;;
    status)
        echo "=== Monitoring Pods Status ==="
        kubectl get pods -n $NAMESPACE
        echo ""
        echo "=== Services ==="
        kubectl get svc -n $NAMESPACE | grep -E "grafana|prometheus"
        ;;
    *)
        echo "Usage: $0 [grafana|prometheus|both|status]"
        echo ""
        echo "Commands:"
        echo "  grafana    - Port-forward to Grafana (port 3000)"
        echo "  prometheus - Port-forward to Prometheus (port 9090)"
        echo "  both       - Show instructions for both (default)"
        echo "  status     - Check pod and service status"
        exit 1
        ;;
esac




