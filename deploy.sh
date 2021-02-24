#!/bin/bash

# Since I'm using NVM
source ~/.profile
cd /var/www/vt-web

git pull

~/.nvm/versions/node/v14.15.1/bin/npm install
~/.nvm/versions/node/v14.15.1/bin/npm run build

~/.nvm/versions/node/v14.15.1/bin/pm2 restart VTFrontend
