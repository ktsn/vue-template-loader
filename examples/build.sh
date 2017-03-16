#!/bin/sh

for name in scoped-css css-modules complex; do
  echo "Building ${name}..."
  $(npm bin)/webpack --config examples/${name}/webpack.config.js
done
