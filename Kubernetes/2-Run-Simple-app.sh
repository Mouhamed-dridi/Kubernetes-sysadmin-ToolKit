
# Create a deployment
kubectl create deployment kodekloudapp --image=hpranav/kodekloudappcs:v1

# Expose the deployment
kubectl expose deployment kodekloudapp --type=LoadBalancer --port=80 --target-port=80

# Check if the pod is running
kubectl get pods --all-namespaces