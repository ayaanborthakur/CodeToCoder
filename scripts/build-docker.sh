#!/bin/bash

# Default to empty string if not provided
BASE_URL=${1:-""}

echo "Building Docker image with BASE_URL='$BASE_URL'..."

docker build \
  --build-arg BASE_URL="$BASE_URL" \
  -t code2coder \
  .

echo "Build complete! Run 'docker run -p 8080:80 code2coder' to test."
