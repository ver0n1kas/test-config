const validateSchema = require('yaml-schema-validator')
const fs = require('fs');
const fsp = require('node:fs/promises');
var path = require('path');

var errors = ""

const schemaMapping = {"org-schema": ".*\\Org\.(yml|yaml)$",
  "orgstate-schema" : ".*\\Org[0-9]*_OrgState\.(yml|yaml)$"
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
  if (errors != null && errors != "") {
    throw new Error("Schema validation failed for " + fileToValidate + ".\n" + errors)
  } 
}

async function validateAgainstSchema(schemaFile, yamlFile) {
  try {
    var validationResult = validateSchema(yamlFile, {
      schemaPath: schemaFile
    })
    if (validationResult.length > 0){
      for (i in validationResult) {
        path = validationResult[i].path
        message = validationResult[i].message
        errors = `Validation error: ${message} Path: ${path}`
        errors += "\n"
      }
    }
  } catch (error) {
    throw new Error("Bad yaml file" + error)
  }
}
performValidation();
