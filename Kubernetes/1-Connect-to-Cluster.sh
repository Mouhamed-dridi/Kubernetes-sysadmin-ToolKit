# Get the current subscription
az account show --query "{name:name, id:id}" -o table

# Set the default resource group
az configure --defaults group=AKA-LAB


# Get the current context 
kubectl config current-context



# Set the subscription
az account set --subscription 59d574d4-1c03-4092-ab22-312ed594eec9



# Get the credentials for the AKS cluster
az aks get-credentials --resource-group AKA-LAB --name azuer-k8s --overwrite-existing