#!/usr/bin/env node

import { readFile, writeFile, existsSync } from 'fs';
import { MapfileStyleParser } from 'geostyler-mapfile-parser';
import { QGISStyleParser } from 'geostyler-qgis-parser';

const parser = new MapfileStyleParser();
const qgisParser = new QGISStyleParser();

function checkArgs() {
  const path = process.argv[2] || undefined;

  if (path === undefined) {
    console.error('Please specify a valid path to the Mapfile');
    return false;
  } else return true;
}

function checkIfMapfileExists() {
  const path = process.argv[2] || undefined;
  try {
    if (path && existsSync(path)) {
      return true;
    } else {
      console.error('Please specify a valid path to the Mapfile');
      return false;
    }
  } catch (err) {
    return false;
  }
}

function start() {
  // TODO replace with parameter
  readFile(process.argv[2], function (err, data) {
    // Check for errors
    if (err) {
      console.error('Please specify a valid path to the Mapfile');
    }

    async function styleFiles() {
      try {
        parser
          .readMultiStyles(data.toString())
          .then((geostylerStyle) => {
            if (geostylerStyle) {
              // TODO remove writing the gs style
              writeFile(
                './files/out/geostyler-style.json',
                JSON.stringify(geostylerStyle),
                function (err) {
                  if (err) return console.log(err);
                }
              );

              geostylerStyle.forEach((style) => {
                // POSTPROCESSING

                // replace "ellipse" symbols into "Mark"
                if (style && style.rules && Array.isArray(style.rules)) {
                  style.rules.forEach((rule) => {
                    if (rule.symbolizers) {
                      rule.symbolizers.forEach((symbolizer) => {
                        if (
                          symbolizer.kind &&
                          symbolizer.kind === 'Icon' &&
                          symbolizer.image &&
                          symbolizer.image === 'ellipse'
                        ) {
                          symbolizer.kind = 'Mark';
                          symbolizer.wellKnownName = 'circle';
                          symbolizer.radius = symbolizer.size / 2;

                          delete symbolizer.size;
                          delete symbolizer.image;
                        }
                      });
                    }
                  });
                }
                qgisParser
                  .writeStyle(style)
                  .then((qgisStyle) => {
                    writeFile(
                      `./files/out/${style.name}.qml`,
                      qgisStyle,
                      function (err) {
                        if (err) return console.error(err);
                        console.info(
                          `QGIS Style is written successfully to the file ${style.name}`
                        );
                      }
                    );
                  })
                  .catch((error) => {
                    console.error(`Error writing style for ${style.name}`);
                    console.error(error);
                  });
              });
            }
          })
          .catch((error) => {
            console.error(`There was an error parsing the mapfile:`);
            throw error;
          });
      } catch (err) {
        console.error(err);
      }
    }

    styleFiles();
  });
}

if (checkArgs() && checkIfMapfileExists()) {
  start();
} else {
  console.log('Nothing.');
}
