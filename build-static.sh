#!/bin/bash

# Make sure the script is executable
chmod +x static-build.js

# Run the static build process
echo "Starting static build process..."
node static-build.js

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo ""
  echo "========================================"
  echo "Static build completed successfully!"
  echo "========================================"
  echo ""
  echo "To test the static build locally:"
  echo "1. cd dist"
  echo "2. node static-server.js"
  echo ""
  echo "To deploy the static build:"
  echo "Upload the contents of the dist/public directory to any static hosting provider."
else
  echo ""
  echo "========================================"
  echo "Static build failed!"
  echo "========================================"
fi