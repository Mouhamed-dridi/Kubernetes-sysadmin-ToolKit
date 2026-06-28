#!/bin/bash


# install docker 
sudo apt install docker



# buidl the image 
docker build -t teslacars:1.0 .

# run and tetst the image 
docker run -p 8080:80 teslacars:1.0



# tag the image
docker tag teslacars:1.0 moahmed101/teslacars:1.0


# login to docker
docker login

# push the image
docker push moahmed101/teslacars:1.0