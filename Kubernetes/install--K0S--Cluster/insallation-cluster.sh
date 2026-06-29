#!/bin/bash
# k0s — Single Node Kubernetes Cluster Install
# Docs: https://docs.k0sproject.io/


# --- Step 1: Update & Reboot ---
sudo apt update && sudo apt upgrade -y
# Re-run the rest of this script after reboot
sudo reboot


# --- Step 2: Install k0s ---
curl --proto 'https' --tlsv1.2 -sSf https://get.k0s.sh | sudo sh


# --- Step 3: Verify ---
k0s version


# --- Step 4: Install Controller + Worker (single node) ---
sudo k0s install controller --enable-worker --no-taints

# Alternative: controller only (no workloads on this node)
# sudo k0s install controller --single


# --- Step 5: Start & Enable Service ---
sudo systemctl start k0scontroller
sudo systemctl enable k0scontroller


# --- Step 6: Check Status ---
sudo k0s status


# --- Step 7: Configure kubectl ---
mkdir -p ~/.kube
sudo k0s kubeconfig admin > ~/.kube/config
chmod 600 ~/.kube/config


# --- Step 8: List Nodes ---
# Node may take 30-60s to reach Ready state
kubectl get nodes