const validateSchema = require('yaml-schema-validator')
const fs = require('fs');
const fsp = require('node:fs/promises');
var path = require('path');

var failedValidation = false

const schemaMapping = {"org-schema": ".*\\Org\.(yml|yaml)$",
  "orgstate-schema" : ".*\\Org[0-9]*_OrgState\.(yml|yaml)$",
  "space-schema": ".*\\spaceConfig\.(yml|yaml)$"
}
const schemaPath = "schemas"

fileToValidate = process.argv[2]

async function performValidation() {
  var schemaFiles = await fs.readdirSync(schemaPath);

  for (i in schemaFiles) {
    var schemaFile = schemaFiles[i]
    var pattern = schemaMapping[schemaFile.replace(".yml", "")]
    if (pattern) {
        if (fileToValidate.match(pattern)) {
          console.log("Validating " + fileToValidate)
          await validateAgainstSchema(path.join(schemaPath, schemaFile), fileToValidate)
        }
    }
  }
  if (failedValidation) {
    throw new Error("Schema validation failed for " + fileToValidate)
  } 
}

async function validateAgainstSchema(schemaFile, yamlFile) {
  try {
    var validationResult = validateSchema(yamlFile, {
      schemaPath: schemaFile
    })
    if (validationResult.length > 0){
      failedValidation = true
    }
  } catch (error) {
    throw new Error("Bad yaml file" + error)
  }
}
performValidation();
