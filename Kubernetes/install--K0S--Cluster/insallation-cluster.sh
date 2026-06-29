sudo apt update && sudo apt upgrade -y
sudo reboot


curl --proto 'https' --tlsv1.2 -sSf https://get.k0s.sh | sudo sh


k0s version

sudo k0s install controller --enable-worker --no-taints

sudo k0s install controller --single



sudo systemctl start k0scontroller
sudo systemctl enable k0scontroller


sudo k0s status

mkdir -p ~/.kube
sudo k0s kubeconfig admin > ~/.kube/config
chmod 600 ~/.kube/config

# 
kubectl get nodes