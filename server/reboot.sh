#! /bin/bash

sudo docker image rm clippy
sudo docker system prune -y
sudo docker build -t clippy .
sudo docker run -p 8080:8080 -d clippy