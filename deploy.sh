#!/bin/bash

cd /var/www/vt-web

git pull

npm install
npm run build

pm2 restart VTFrontend
