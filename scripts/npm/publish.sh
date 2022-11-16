#!/bin/bash

npm run clean:all && \
npm install && \
npm run tidy:format && \
npm run tidy:lint-fix && \
npm run build && \
npm publish node-red-contrib-controltimer-0.2.3.tgz --dry-run
