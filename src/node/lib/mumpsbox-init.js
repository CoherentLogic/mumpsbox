const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const manifestFile = path.join(process.cwd(), "mumpsbox.json");

if(fs.existsSync(manifestFile)) {
    console.error(chalk.bold.red("A package already exists here. Aborting."));
    process.exit(1);
}

const homeDirectory = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

const fieldNames = {
    name: "Package name",
    description: "Package description",
    vendor: "Vendor",
    version: "Package semantic version",   
    packageType: "Type of package (valid values are 'package' and 'engine')",
    license: "SPDX license name"
};

var manifestDefaultKeys = {};

try {
    manifestTabWidth = require(homeDirectory + "/.mumpsbox/defaults.js").manifestTabWidth;
}
catch (ex) {
    manifestTabWidth = 4;
}

try {
    manifestDefaultKeys = require(homeDirectory + "/.mumpsbox/defaults.js").manifest;

}
catch (ex) {
    manifestDefaultKeys = {
        name: {
            def: "",
            validate: (value) => {
                const validator = require('validate-npm-package-name');

                if(validator(value).validForNewPackages) {
                    return true;
                }
                else {
                    console.error(chalk.bold.red("Invalid package name '" + value + "'"));
                    return false;
                }
            }
        },
        description: {
            def: "",
            validate: (value) => {
                return true;
            }
        },
        vendor: {
            def: "",
            validate: (value) => {
                return true;
            }
        },
        version: {
            def: "0.1.0",
            validate: (value) => {
                const semver = require('semver');

                if(semver.valid(value) || value === "") {
                    return true;
                }
                else {
                    console.error(chalk.bold.red("Invalid semantic version string."));
                    return false;
                }
            }
        },        
        packageType: {
            def: "package",
            validate: (value) => {
                if(value === "package" || value === "engine") {
                    return true;
                }
                else {
                    console.error(chalk.bold.red("'" + value + "' is not a valid package type. Must be 'package' or 'engine'."));
                    return false;
                }
            }
        },
        license: {
            def: "AGPL-3.0",
            validate: (value) => {
                const spdx = require('spdx');

                if(value === "") {
                    value = "NONE";
                }

                if(spdx.valid(value) || value === "NONE" || value === "NOASSERTION") {
                    return true;
                }
                else {
                    console.error(chalk.bold.red("Invalid SPDX license string."));
                    return false;
                }
            }
        }
    };
}

var promptStr = "";
var def = "";
var response = "";
var finalResponse = "";
var manifest = {};

for(var key in manifestDefaultKeys) {
    if(manifestDefaultKeys.hasOwnProperty(key)) {

        if(manifestDefaultKeys[key].def.length > 0) {
            def = " (" + manifestDefaultKeys[key].def + ")";
        }
        else {
            def = "";
        }

        promptStr = fieldNames[key] + def + ": ";                
        
        do {
            response = prompt(promptStr);
            if(response !== "") {
                finalResponse = response;
            }
            else {
                finalResponse = manifestDefaultKeys[key].def;
            }
        }    
        while(manifestDefaultKeys[key].validate(finalResponse) !== true);

        manifest[key] = finalResponse;

    }
}

var proposedManifest = JSON.stringify(manifest, null, manifestTabWidth);

console.log(chalk.cyan(proposedManifest));

response = "";

do {
    response = prompt(chalk.green.bold("Does this look OK? (y/n) "));
}
while(response !== "y" && response !== "Y" && response !=="n" && response !=="N");

if(response === "y" || response === "Y") {
    fs.writeFile(manifestFile, proposedManifest, (err) => {
        if(!err) {
            console.log(chalk.bold.green("Wrote package manifest to " + manifestFile));
        }
        else {
            console.log(chalk.bold.red("Error writing " + manifestFile));
        }
    });
}