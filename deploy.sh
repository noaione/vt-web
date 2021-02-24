#!/bin/bash

# Since I'm using NVM
source ~/.profile
cd /var/www/vt-web

git pull

npm install
npm run build

pm2 restart VTFrontend
