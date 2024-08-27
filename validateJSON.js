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

async function performValidation() {
  var files = await fs.readdirSync(schemaPath);

  for (i in files) {
    var schemaFile = files[i]
    var pattern = schemaMapping[schemaFile.replace(".json", "")]
    if (pattern) {
      var filesToValidate = await walkSync(pattern, ".", []);
      for (f in filesToValidate) {
        await validateAgainstSchema(path.join(schemaPath, schemaFile), filesToValidate[f])
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
async function walkSync(pattern, dir, filelist) {
  var files = await fs.readdirSync(dir);
  filelist = filelist || [];
  for (i in files) {;
    var file = files[i];
    if (fs.statSync(path.resolve(dir, file)).isDirectory()) {
      filelist = await walkSync(pattern, path.join(dir, file), filelist);
    }
    else {
      if (file.match(pattern)) {
        filelist.push(path.resolve(dir, file));
      }
    }
  }
  return filelist;
};

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
        errors.push("Invalid: " + ajv.errorsText(validate.errors))
      }
    } catch (error) {
      errors.push("Bad json file: " + tempJsonSource  + "\n" + error)
    }
  }
}
performValidation();
