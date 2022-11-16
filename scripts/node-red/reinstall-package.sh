#!/bin/bash

echo '### Changes detected. Re-applying changes. ###' && \
npm run build && \
cd ~/.node-red && \
npm uninstall --save node-red-contrib-controltimer && \
npm install --save "~/GithubProjects/node-red-contrib-controltimer/node-red-contrib-controltimer-0.2.3.tgz" && \
docker restart node-red-testing && \
echo '### Changes applied. ###'
