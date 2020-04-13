import parser from "./template.pegjs"
import _ from "underscore"

let Template = {}

Template.parse = function(template) {
  return parser.parse(template)
}

let valueToJs = function(value, data) {
  if (value.nil) {
    return null
  } else if (value.float) {
    return parseFloat(value.float, 10)
  } else if (value.string) {
    return value.string
  } else if (value.variable) {
    return data[value.variable]
  } else if (value.integer) {
    return parseInt(value.integer, 10)
  } else if (value.boolean) {
    return value.boolean
  } else if (value.array) {
    return _.map(value.array, (element) => {
      return valueToJs(element, data)
    })
  } else if (value.hash) {
    let hash = {}

    _.each(value.hash, (element) => {
      hash[element.key] = valueToJs(element.value, data)
    })

    return hash
  } else {
    throw "unrecognized value to convert to js"
  }
}

let valueToText = function(value) {
  if (value === null || value === undefined) {
    return "null"
  } else if (typeof value === "number") {
    return value.toString()
  } else if (typeof value === "string") {
    return value
  } else if (typeof value === "boolean") {
    return value.toString()
  } else if (Array.isArray(value)) {
    return "[" + _.map(value, (element) => {
      return valueToText(element)
    }).join(", ") + "]"
  } else if (typeof value === "object") {
    return "{ " +_.map(value, (element, key) => {
      return key + ": " + valueToText(element)
    }).join(", ") + " }"
  } else {
    throw "unrecognized value to convert to text"
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
      result += valueToText(valueToJs(value, data))
    }
  })

  return result
}

export default Template
