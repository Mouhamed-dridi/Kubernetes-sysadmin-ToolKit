docker build -t moahmed101/myconfigmap:v1 .



docker push moahmed101/myconfigmap:v1


docker run -d -p 80:80 moahmed101/myconfigmap:v1




kubectl create configmap login-config --from-file=/home/user/ConfigMap/.properties


# check

kubectl get service login-service


kubectl get nodes -o wide


kubectl port-forward svc/login-service 8080:80


kubectl logs <pod-name>


# check file insde pod kubectl exec -it <pod-name> -- sh

kubectl exec -it <pod-name> -- sh


ls /usr/share/nginx/html/


curl http://localhost:8084


kubectl exec -it <pod-name> -- curl localhost:80


kubectl get pods --show-labels


browserv : http://localhost:8084/