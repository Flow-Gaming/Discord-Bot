#!/bin/bash

git pull origin master
sudo docker build -t flow-gaming-discord-bot .
sudo docker rm -f flow-gaming-discord-bot
sudo docker run --name flow-gaming-discord-bot --network="host" --restart always -d flow-gaming-discord-bot:latest
sudo docker ps
