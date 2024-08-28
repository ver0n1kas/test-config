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
}


async function validateAgainstSchema(schemaFile, jsonFile) {
  var schemaContents =  await fsp.readFile(schemaFile,  'utf8');
  var jsonToValidate = await fsp.readFile(jsonFile, 'utf8')
  if (schemaContents == null || schemaContents == '') {
    throw new Error("Schema file " + schemaFile + " is empty")
  }else if (jsonToValidate == null || jsonToValidate == '') {
    throw new Error("File being validated " + jsonToValidate + " is empty")
  } else {
    try {
      var tempJsonSource = schemaFile
      const schema = JSON.parse(schemaContents);
      const validate = ajv.compile(schema)
      tempJsonSource = jsonFile
      const valid = validate(JSON.parse(jsonToValidate))
      if (!valid){
        throw new Error("Schema validation failed for " + jsonFile + ". " + ajv.errorsText(validate.errors))
      }
    } catch (error) {
      throw new Error("Bad json file: " + tempJsonSource  + "\n" + error)
    }
  }
}
performValidation();


