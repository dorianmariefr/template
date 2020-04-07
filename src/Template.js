import parser from "./template.pegjs"
import _ from "underscore"

let Template = {}

Template.parse = function(template) {
  return parser.parse(template)
}

let valueToText = function(value, data) {
  if (value.variable) {
    return data[value.variable]
  } else if (value.integer) {
    return value.integer
  } else if (value.boolean) {
    return value.boolean
  } else if (value.array) {
    return "[" + _.map(value.array, (element) => {
      return valueToText(element, data)
    }).join(", ") + "]"
  } else if (value.hash) {
    return "{ " +_.map(value.hash, (element) => {
      return element.key + ": " + valueToText(element.value, data)
    }).join(", ") + " }"
  }
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
      result += valueToText(value, data)
    }
  })

  return result
}

export default Template
