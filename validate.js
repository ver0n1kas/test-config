const validateSchema = require('yaml-schema-validator')

// validate a json OR yml file
validateSchema('api-sys-h2o-2-24678-h2o-vmware-com/Org1/Org.yml', {
  schemaPath: 'schemas/org-schema.yml' // can also be schema.json
})

