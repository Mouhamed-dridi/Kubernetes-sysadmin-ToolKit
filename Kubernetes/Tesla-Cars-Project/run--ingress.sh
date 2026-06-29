







# download and install ingress controller-nginx 
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.2/deploy/static/provider/cloud/deploy.yaml

# apply ingress yaml
kubectl apply -f ingress.yaml

# start service ingress
kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx


# test ingress
curl -H "Host: teslacars.local" http://172.22.53.160:32123


# all port windows machine powerhell
netsh advfirewall firewall add rule name="WSL Kubernetes" dir=in action=allow protocol=TCP localport=32123


# lunux get ip 
hostname -I

