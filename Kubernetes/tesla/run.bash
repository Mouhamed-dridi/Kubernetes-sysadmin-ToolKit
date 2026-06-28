

# run the dep
kubectl create -f dep.yml



# run the service

kubectl apply -f service.yml

# expose the service

kubectl port-forward service/teslacars-service 9090:80



