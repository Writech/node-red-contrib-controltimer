#!/bin/bash

tsc --build --pretty && \
npm run build:copy-icons && \
npm run build:render-html && \
changeset publish
