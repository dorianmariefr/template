import parser from "./template.pegjs"
import _ from "underscore"

let Template = {}

Template.parse = function(template) {
  return parser.parse(template)
}

let valueToJs = function(value, data) {
  if ("nil" in value) {
    return null
  } else if ("float" in value) {
    return parseFloat(value.float, 10)
  } else if ("string" in value) {
    return value.string
  } else if ("variable" in value) {
    return data[value.variable]
  } else if ("integer" in value) {
    return parseInt(value.integer, 10)
  } else if ("boolean" in value) {
    return value.boolean
  } else if ("array" in value) {
    return _.map(value.array, (element) => {
      return valueToJs(element, data)
    })
  } else if ("hash" in value) {
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

Template.render = function(template, data = {}, args = {}) {
  let filters = args.filters || {}
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
      value = valueToJs(value, data)
      _.each(element.interpolation.filters, (filter) => {
        if (!(filter.method in filters)) {
          throw "unknown filter " + filter.method
        }

        value = filters[filter.method](
          value,
          ..._.map(filter.parameters, (parameter) => valueToJs(parameter.value))
        )
      })
      result += valueToText(value, data)
    }
  })

  return result
}

export default Template
