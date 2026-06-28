apiVersion: apps/v1
kind: Deployment
metadata:
  name: static-web-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: static-web
  template:
    metadata:
      labels:
        app: static-web
    spec:
      containers:
      - name: web
        image: nginx
        ports:
        - containerPort: 80
      nodeSelector:
        node-zone: china
