#!/bin/bash
# Headlamp Dashboard — Install into Kubernetes Cluster
# Docs: https://headlamp.dev/docs/latest/installation/in-cluster/


# --- Authentication: Create Service Account Token ---
# Log in to Headlamp using a Service Account bearer token (RBAC-based)

# 1. Create the service account
kubectl -n kube-system create serviceaccount headlamp-admin

# 2. Grant cluster-admin rights
kubectl create clusterrolebinding headlamp-admin \
  --serviceaccount=kube-system:headlamp-admin \
  --clusterrole=cluster-admin

# 3. Generate a token (Kubernetes 1.24+)
kubectl create token headlamp-admin -n kube-system

# Paste the token output into the Headlamp login screen


# --- Option 1: Helm (Recommended) ---
helm repo add headlamp https://kubernetes-sigs.github.io/headlamp/

# Default install
helm install my-headlamp headlamp/headlamp --namespace kube-system

# Custom values install
helm install my-headlamp headlamp/headlamp \
  --namespace kube-system \
  --values cluster-inventory-values.yaml


# --- Option 2: Plain YAML (No Helm) ---
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/headlamp/main/kubernetes-headlamp.yaml


# --- Option 3: Ingress (Production) ---
# Replace the URL with your actual domain before applying
curl -s https://raw.githubusercontent.com/kubernetes-sigs/headlamp/main/kubernetes-headlamp-ingress-sample.yaml \
  | sed -e s/__URL__/headlamp.mydeployment.io/ \
  > headlamp-ingress.yaml

kubectl apply -f ./headlamp-ingress.yaml


# --- Option 4: Port-Forward (Dev/Test) ---
# Access at http://localhost:8080
kubectl port-forward -n kube-system service/headlamp 8080:80


