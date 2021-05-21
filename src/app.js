#!/usr/bin/env node
/* eslint-disable import/extensions */
/* eslint-disable new-cap */
/* eslint-disable no-param-reassign */

import { readFile, writeFile, existsSync } from 'fs';
import { MapfileStyleParser } from 'geostyler-mapfile-parser';
import { QGISStyleParser } from 'geostyler-qgis-parser';
import xml2js from 'xml2js';
import symbolProps from './symbol.js';

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

function findNextLowerMaxScaleDenom(scales, filter, scaledenom) {
  let scaleValues = [];
  let foundValue = '0';

  scales.forEach((scale) => {
    if (scale.filter) {
      const buff1 = new Buffer.from(scale.filter);
      const buff2 = new Buffer.from(filter);

      if (buff1.toString('base64') === buff2.toString('base64')) {
        scaleValues.push(parseInt(scale.scalemaxdenom, 10));
      }
    }
  });
  scaleValues.sort((a, b) => a - b);
  scaleValues.reverse();
  scaleValues = [...new Set(scaleValues)];

  scaleValues.forEach((scaleValue, i) => {
    if (scaleValue.toString() === scaledenom.toString()) {
      if (scaleValues[i + 1]) {
        foundValue = scaleValues[i + 1].toString();
      }
    }
  });
  return foundValue;
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
                  if (gsErr) return console.error(gsErr);
                  return true;
                },
              );

              geostylerStyle.forEach((style) => {
                // POSTPROCESSING mapfile-parser

                // replace "ellipse" symbols into "Mark"
                if (style && style.rules && Array.isArray(style.rules)) {
                  style.rules.forEach((rule) => {
                    // fill up special roads_name rule
                    if (rule.filter) {
                      rule.filter.forEach((filter, i) => {
                        if (filter === null) {
                          rule.filter[i] = ['!=', 'ref', ''];
                        }
                      });
                    }
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
                    // POSTPROCESSING qgis-parser
                    let pprcssng = true; // some settings only for labels with background
                    const scales = [];
                    const symbols = [];

                    // exclude label_railway_stations from postprocessing for labels
                    if (style.name.includes('label') && style.name !== 'label_railway_stations') {
                      const qmlParser = new xml2js.Parser();
                      const qmlBuilder = new xml2js.Builder();
                      qmlParser.parseString(qgisStyle, (logErr, result) => {
                        if (logErr) {
                          return console.error('Error in postprocessing stage.');
                        }

                        if (result.qgis['renderer-v2'][0].$.type !== 'nullSymbol') {
                          const symbolRules = result.qgis['renderer-v2'][0].rules[0].rule;
                          if (symbolRules) {
                            symbolRules.forEach((rule) => {
                              scales.push({
                                scalemaxdenom: rule.$.scalemaxdenom !== undefined
                                  ? rule.$.scalemaxdenom
                                  : null,
                                scalemindenom: rule.$.scalemindenom !== undefined
                                  ? rule.$.scalemindenom
                                  : null,
                                filter: rule.$.filter !== undefined
                                  ? rule.$.filter
                                  : null,
                              });
                            });
                            // set scalemindenom if not already set
                            scales.forEach((scale) => {
                              scale.scalemindenom = parseInt(scale.scalemindenom, 10) >= 0
                                ? scale.scalemindenom
                                : (
                                  findNextLowerMaxScaleDenom(
                                    scales, scale.filter, scale.scalemaxdenom,
                                  ));
                            });
                          }
                          const symbolsCollection = result.qgis['renderer-v2'][0].symbols[0].symbol;
                          symbolsCollection.forEach((symbol) => {
                            const symbolData = {};
                            symbol.layer[0].prop.forEach((prop) => {
                              // name
                              if (prop.$.k === 'name') {
                                symbolData.name = prop.$.v;
                              }
                            });
                            symbols.push(symbolData);
                          });

                          // set renderer to nullSymbol type and delete tags rules/symbols
                          result.qgis['renderer-v2'][0].$.type = 'nullSymbol';
                          delete result.qgis['renderer-v2'][0].rules;
                          delete result.qgis['renderer-v2'][0].symbols;
                        } else {
                          pprcssng = false;
                          if (scales.length === 0 && style.rules.length > 0) {
                            style.rules.forEach((rule) => {
                              if (rule.scaleDenominator) {
                                for (let j = 0; j < rule.symbolizers.length; j += 1) {
                                  scales.push(
                                    {
                                      scalemaxdenom: rule.scaleDenominator.max !== undefined
                                        ? rule.scaleDenominator.max
                                        : null,
                                      scalemindenom: rule.scaleDenominator.min !== undefined
                                        ? rule.scaleDenominator.min
                                        : null,
                                      filter: rule.filter !== undefined
                                        ? rule.filter
                                        : null,
                                    },
                                  );
                                }
                              }
                            });
                            // set scalemindenom if not already set
                            scales.forEach((scale) => {
                              scale.scalemindenom = parseInt(scale.scalemindenom, 10) >= 0
                                ? scale.scalemindenom
                                : (
                                  findNextLowerMaxScaleDenom(
                                    scales, scale.filter, scale.scalemaxdenom,
                                  ));
                            });
                          }
                        }
                        // update labeling rules and structure

                        result.qgis.labeling[0].rules[0].rule.forEach((rule, i) => {
                          // scale
                          if (scales.length && scales[i].scalemaxdenom) {
                            rule.$.scalemaxdenom = scales[i].scalemaxdenom;
                          }
                          if (scales.length && scales[i].scalemindenom) {
                            rule.$.scalemindenom = scales[i].scalemindenom;
                          }
                          // settings - text-style
                          // fontWeight
                          rule.settings[0]['text-style'][0].$.fontWeight = 75;

                          // settings
                          // settings - text-style - background
                          if (pprcssng) {
                            const bgData = [
                              {
                                $: {
                                  shapeOffsetX: '0',
                                  shapeFillColor: '255,255,255,255',
                                  shapeRadiiY: '0',
                                  shapeSizeY: '0',
                                  shapeOffsetUnit: 'Point',
                                  shapeRotationType: '0',
                                  shapeOffsetMapUnitScale: '3x:0,0,0,0,0,0',
                                  shapeSizeX: '5',
                                  shapeRadiiMapUnitScale: '3x:0,0,0,0,0,0',
                                  shapeRadiiUnit: 'Point',
                                  shapeSizeMapUnitScale: '3x:0,0,0,0,0,0',
                                  shapeOpacity: '1',
                                  shapeBorderWidth: '0',
                                  shapeOffsetY: '0',
                                  shapeRadiiX: '0',
                                  shapeType: '4',
                                  shapeBorderWidthMapUnitScale: '3x:0,0,0,0,0,0',
                                  shapeSVGFile: symbols[i].name,
                                  shapeDraw: '1',
                                  shapeBorderWidthUnit: 'Point',
                                  shapeSizeType: '0',
                                  shapeSizeUnit: 'Point',
                                  shapeJoinStyle: '64',
                                  shapeBlendMode: '0',
                                  shapeRotation: '0',
                                  shapeBorderColor: '128,128,128,255',
                                },
                              },
                            ];
                            rule.settings[0]['text-style'][0].background = bgData;

                            // settings - text-style - symbol
                            rule.settings[0]['text-style'][0].symbol = symbolProps;
                          }

                          if (rule.settings[0]['text-buffer'] && rule.settings[0]['text-buffer']) {
                            rule.settings[0]['text-style'][0]['text-buffer'] = rule.settings[0]['text-buffer'];
                            delete rule.settings[0]['text-buffer'];
                          }

                          // settings placement
                          const placementData = [
                            {
                              $: {
                                yOffset: '0',
                                maxCurvedCharAngleOut: '-25',
                                quadOffset: '4',
                                offsetUnits: 'MapUnit',
                                centroidInside: '0',
                                dist: '0',
                                maxCurvedCharAngleIn: '25',
                                fitInPolygonOnly: '0',
                                overrunDistance: '0',
                                repeatDistance: '0',
                                rotationAngle: '0',
                                repeatDistanceUnits: 'MM',
                                lineAnchorPercent: '0.5',
                                distMapUnitScale: '3x:0,0,0,0,0,0',
                                geometryGeneratorEnabled: '0',
                                predefinedPositionOrder: 'TR,TL,BR,BL,R,L,TSR,BSR',
                                lineAnchorType: '0',
                                placementFlags: '0',
                                repeatDistanceMapUnitScale: '3x:0,0,0,0,0,0',
                                preserveRotation: '1',
                                overrunDistanceMapUnitScale: '3x:0,0,0,0,0,0',
                                labelOffsetMapUnitScale: '3x:0,0,0,0,0,0',
                                distUnits: 'MM',
                                overrunDistanceUnit: 'MM',
                                centroidWhole: '0',
                                offsetType: '0',
                                placement: pprcssng === true ? '4' : '2', // 2 parallel, 4 horizontal
                                priority: '0',
                                geometryGenerator: '',
                                polygonPlacementFlags: '2',
                                layerType: 'LineGeometry',
                                xOffset: '0',
                                geometryGeneratorType: 'PointGeometry',
                              },
                            },
                          ];
                          rule.settings[0].placement = placementData;
                        });

                        qgisStyle = qmlBuilder.buildObject(result)
                          .replace(
                            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                            '<!DOCTYPE qgis PUBLIC \'http://mrcc.com/qgis.dtd\' \'SYSTEM\'>',
                          );
                        return console.info(`Postprocessing done for ${style.name}`);
                      });
                    }
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
  console.info('Nothing.');
}
