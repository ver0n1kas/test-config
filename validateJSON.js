const Ajv = require("ajv")
const ajv = new Ajv({allErrors: true})
const fs = require('node:fs');

validateAgainstSchema(process.argv[2],process.argv[3])

const schemaMapping = {"org": "org-schema",
  "orgstate" : "orgstate-schema"
}
const schemaPath = "schemas"
function validateAgainstSchema(schemaFile, jsonFile) {
  fs.readFile(schemaFile, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    fs.readFile(jsonFile, 'utf8', (err, jsonToValidate) => {
      if (err) {
        console.error(err);
        return;
      }
      const schema = JSON.parse(data);
      const validate = ajv.compile(schema)
      const valid = validate(JSON.parse(jsonToValidate))
      if (valid) console.log("Valid!")
      else console.log("Invalid: " + ajv.errorsText(validate.errors))
    });
  });
}
