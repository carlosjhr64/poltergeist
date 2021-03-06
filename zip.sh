#!/bin/bash

rm -f poltergeist.zip
mkdir -p ./tmp
mkdir -p ./tmp/schemas
cp ./schemas/gschemas.compiled ./tmp/schemas
cp ./schemas/org.gnome.shell.extensions.poltergeist.gschema.xml ./tmp/schemas
cp extension.js ./tmp/
cp LICENSE ./tmp/
cp metadata.json ./tmp/
cp prefs.js ./tmp/
cd ./tmp
zip -r ../poltergeist.zip .
cd ../
rm -rf ./tmp
