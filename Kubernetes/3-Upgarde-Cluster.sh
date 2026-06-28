

# check curent version

az aks list -o table

kubectl cluster-info
 
az aks show --name azuer-k8s --resource-group AKA-LAB --query kubernetesVersion

# before you upgrade your cluster, you can check if your deployments, services, and configs will still work on the new version.

datree test --schema-version "1.35.0" my-deployment.yaml

# upgrade cluster

az aks upgrade --name azuer-k8s --resource-group AKA-LAB --kubernetes-version 1.35.0*


# check supported versions

link : https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions?tabs=azure-cli