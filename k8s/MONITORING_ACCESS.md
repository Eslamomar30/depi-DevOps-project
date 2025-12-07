# Monitoring Access Guide

## Quick Access Commands

### Check Status
```bash
cd /home/islam/dep-Devops-project/k8s
./access-monitoring.sh status
```

### Access Grafana (when pods are running)
```bash
# Option 1: Use the script
./access-monitoring.sh grafana

# Option 2: Direct command
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```
Then open: **http://localhost:3000**

**Default Credentials:**
- Username: `admin`
- Password: Get it with:
  ```bash
  kubectl get secret monitoring-grafana -n monitoring -o jsonpath='{.data.admin-password}' | base64 -d
  ```

### Access Prometheus (when pods are running)
```bash
# Option 1: Use the script
./access-monitoring.sh prometheus

# Option 2: Direct command
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9090:9090
```
Then open: **http://localhost:9090**

### Access via LoadBalancer (Grafana only)
Once Grafana pods are running, you can access directly via:
```
http://a2fcc56d05a074e098af0a4b3d1f3f2f-156922080.us-east-1.elb.amazonaws.com
```

## Current Status

⚠️ **Note:** Monitoring pods are currently **Pending** due to AWS vCPU quota limits.

Once you get more AWS quota and pods start running:
1. Check status: `./access-monitoring.sh status`
2. Use port-forward or LoadBalancer URL to access

## What's Configured

✅ **Grafana** - Automatically linked to Prometheus as data source
✅ **Prometheus** - Ready to collect metrics from your cluster
✅ **Alertmanager** - Configured for Slack notifications
✅ **Alert Rules** - CPU and Memory alerts configured

## Troubleshooting

If port-forward doesn't work:
1. Check if pods are running: `kubectl get pods -n monitoring`
2. Check if services exist: `kubectl get svc -n monitoring`
3. Verify namespace: `kubectl get namespace monitoring`




