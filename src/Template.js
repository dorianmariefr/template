let parser = require("./template.pegjs")

let Template = {}

Template.parse = function(template) {
  return parser.parse(template)
}

Template.render = function(template, data) {
  let tree = {}

  try {
    tree = parser.parse(template)
  } catch (error) {
    return error.message || error
  }

  let result = ""

  tree.forEach((element) => {
    if (element.text) {
      result += element.text
    } else if (element.interpolation) {
      let value = element.interpolation.value

      if (value.variable) {
        result += data[value.variable]
      }
    }
  })

  return result
}

export default Template
