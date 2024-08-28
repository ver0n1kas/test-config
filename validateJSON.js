const Ajv = require("ajv")
const ajv = new Ajv({allErrors: true})
const fs = require('fs');
const fsp = require('node:fs/promises');
var path = require('path');

const errors = []

const schemaMapping = {"org-schema": ".*\\Org\.json$",
  "orgstate-schema" : ".*\\Org[0-9]*_OrgState\.json$"
}
const schemaPath = "schemas"

//get file from arg

fileToValidate = process.argv[2]

async function performValidation() {
  var schemaFiles = await fs.readdirSync(schemaPath);

  for (i in schemaFiles) {
    var schemaFile = schemaFiles[i]
    var pattern = schemaMapping[schemaFile.replace(".json", "")]
    if (pattern) {
      // var filesToValidate = await walkSync(pattern, ".", []);
      // for (f in filesToValidate) {
      //   if (filesToValidate[f].match(pattern)) {
      //     validateAgainstSchema(path.join(schemaPath, schemaFile), filesToValidate[f])
      //   }
      // }
        if (fileToValidate.match(pattern)) {
          await validateAgainstSchema(path.join(schemaPath, schemaFile), fileToValidate)
        }
    }
  } 
  if (errors.length > 0) {
    var errorString = "";
    for (e in errors) {
      errorString += errors[e]
      errorString += "\n"
    }
    throw new Error(errorString)
  } 
}


async function validateAgainstSchema(schemaFile, jsonFile) {
  var schemaContents =  await fsp.readFile(schemaFile,  'utf8');
  var jsonToValidate = await fsp.readFile(jsonFile, 'utf8')
  if (schemaContents == null || schemaContents == '') {
    errors.push("Schema file " + schemaFile + " is empty")
  }else if (jsonToValidate == null || jsonToValidate == '') {
    errors.push("File being validated " + jsonToValidate + " is empty")
  } else {
    try {
      var tempJsonSource = schemaFile
      const schema = JSON.parse(schemaContents);
      const validate = ajv.compile(schema)
      tempJsonSource = jsonFile
      const valid = validate(JSON.parse(jsonToValidate))
      if (!valid){
        errors.push("Schema validation failed for " + jsonFile + ". " + ajv.errorsText(validate.errors))
      }
    } catch (error) {
      errors.push("Bad json file: " + tempJsonSource  + "\n" + error)
    }
  }
}
// performValidation();
console.log("TEST" + fileToValidate)
if (fileToValidate == "api-sys-h2o-2-24678-h2o-vmware-com/Org1/Org.json" || fileToValidate == "schemas/org-state-schema.json") {
  throw new Error("test3")
}

