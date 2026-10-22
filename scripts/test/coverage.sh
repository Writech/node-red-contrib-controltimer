#!/bin/bash

node --import tsx --test --experimental-test-coverage \
    --test-coverage-include="src/**/*.ts" \
    --test-coverage-exclude="src/render-html.ts" \
    "test/unit/**/*.test.ts" "test/integration/**/*.test.ts"
