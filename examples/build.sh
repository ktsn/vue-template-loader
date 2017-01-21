#!/bin/sh

for name in scoped-css css-modules; do
  echo "Building ${name}..."
  $(npm bin)/webpack --config examples/${name}/webpack.config.js
done
