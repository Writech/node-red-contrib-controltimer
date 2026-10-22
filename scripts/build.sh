#!/bin/bash

npm run clean:artifacts && \
npm run compile && \
npm pack
