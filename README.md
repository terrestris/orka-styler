# ORKa.MV Styler

## Description

The ORKa.MV Styler provides a tool to convert Mapfile styles into the QGIS style format.

The [GeoStyler](https://geostyler.org/) is used for this process.

## Prerequisites

This is a Node.js application. This assumes that node and npm are already installed in a
[current version](https://nodejs.org/en/).
The geostyler currently supports version 10 to 14. In these versions this script is also executable.

The code can be downloaded as a zip file or installed in the target directory via the version management system `git`.

## Setup

The following steps must be performed:

1. Clone the project into the target destination:

    ```bash
    git clone git@github.com:terrestris/orka-styler.git
    ```

2. Change to the new directory:

    ```bash
    cd orka-styler
    ```

3. Install necessary dependencies:

    ```bash
    npm i
    ```

## How to use?

Run the script from within the project folder. As a parameter, enter the Mapfile to be parsed, e.g.:

```bash
npm run start -- ./files/in/layers_druck.map
```

The file to be parsed does not have to be in this folder. However, the path to the file must be specified relative to this project folder.

With both the GeoStyler Style and the QML Style, various adjustments are made through post-processing. These include:

- Replacing the "ellipse" symbol to a "mark" symbol,
- Correcting a non-parsable common expression (ref),
- Correcting scale ranges in the label layers,
- Correcting the symbolization and labeling structure of the QML,
- correcting the regular expression in label filters

The parsed styles from the Mapfile are then placed as `*.qml` files in the folder `./files/out/`
