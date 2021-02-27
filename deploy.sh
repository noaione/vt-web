#!/bin/bash

# Since I'm using NVM
PATH=~/.nvm/versions/node/v14.15.1/bin:$PATH
cd /var/www/vt-web

git pull

npm install
npm run build

pm2 --silent restart VTFrontend
