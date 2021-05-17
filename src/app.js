#!/usr/bin/env node
/* eslint-disable no-param-reassign */

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
  } return true;
}

function checkIfMapfileExists() {
  const path = process.argv[2] || undefined;
  try {
    if (path && existsSync(path)) {
      return true;
    }
    console.error('Please specify a valid path to the Mapfile');
    return false;
  } catch (err) {
    return false;
  }
}

function start() {
  readFile(process.argv[2], (err, data) => {
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
                (gsErr) => {
                  if (gsErr) return console.log(gsErr);
                  return true;
                },
              );

              geostylerStyle.forEach((style) => {
                // POSTPROCESSING

                // replace "ellipse" symbols into "Mark"
                if (style && style.rules && Array.isArray(style.rules)) {
                  style.rules.forEach((rule) => {
                    if (rule.symbolizers) {
                      rule.symbolizers.forEach((symbolizer) => {
                        if (
                          symbolizer.kind
                          && symbolizer.kind === 'Icon'
                          && symbolizer.image
                          && symbolizer.image === 'ellipse'
                        ) {
                          symbolizer.kind = 'Mark';
                          symbolizer.wellKnownName = 'circle';
                          symbolizer.radius = symbolizer.size / 2;
                          symbolizer.strokeOpacity = 0;
                          symbolizer.opacity = 1;

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
                      (qgisErr) => {
                        if (qgisErr) return console.error(qgisErr);
                        console.info(
                          `QGIS Style is written successfully to the file ${style.name}`,
                        );
                        return true;
                      },
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
            console.error('There was an error parsing the mapfile:');
            throw error;
          });
      } catch (parseErr) {
        console.error(parseErr);
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
