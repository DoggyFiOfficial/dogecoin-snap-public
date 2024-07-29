#!/bin/bash

# Install top-level dependencies
echo "Installing top-level dependencies..."
yarn install

# Navigate to the packages directory
cd packages

# Loop through each subfolder in the packages directory
for dir in */; do
  # Check if the directory contains a package.json file
  if [ -f "$dir/package.json" ]; then
    echo "Installing dependencies in $dir"
    cd "$dir"
    yarn install
    cd ..
  fi
done

echo "All dependencies installed."
