#!/bin/bash

if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v npx &> /dev/null; then
    npx http-server -p 8000
fi

