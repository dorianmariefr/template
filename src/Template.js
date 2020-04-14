import parser from "./template.pegjs"
import _ from "underscore"

let Template = {}

Template.parse = function(template) {
  return parser.parse(template)
}

let fetchVariableInData = function(variable, data) {
  let parts = variable.split(".")
  let current = data

  _.each(parts, (part) => {
    let index = null

    if (part.includes("[")) {
      let partIndex = part.split("[")[1]
      index = parseInt(partIndex.substring(0, partIndex.length - 1), 10)
      part = part.split("[")[0]
    }

    if (typeof current !== "object") {
      throw `variable ${variable} not found`
    }

    if (!(part in current)) {
      throw `variable ${variable} not found`
    }

    current = current[part]

    if (index !== null) {
      current = current[index]
    }
  })

  return current
}

let valueToJs = function(value, data) {
  if ("nil" in value) {
    return null
  } else if ("float" in value) {
    return parseFloat(value.float, 10)
  } else if ("string" in value) {
    return value.string
  } else if ("variable" in value) {
    return fetchVariableInData(value.variable, data)
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

let evaluateExpression = (value, filters, data, args) => {
  value = valueToJs(value, data)

  _.each(filters, (filter) => {
    if (!(filter.method in args.filters)) {
      throw "unknown filter " + filter.method
    }

    value = args.filters[filter.method](
      value,
      ..._.map(filter.parameters, (parameter) => valueToJs(parameter.value, data))
    )
  })

  return value
}

let isTruthy = (value) => {
  return value !== undefined && value !== null && value !== false
}

let renderTree = (tree, data, args) => {
  let result = ""

  _.each(tree, (element) => {
    if ("text" in element) {
      result += element.text
    } else if ("interpolation" in element) {
      let value = element.interpolation.value
      let filters = element.interpolation.filters
      value = evaluateExpression(value, filters, data, args)
      result += valueToText(value)
    } else if ("tag" in element) {
      if ("if" in element.tag) { 
        let ifTags = []
        ifTags.push(element.tag.if.if)
        ifTags = ifTags.concat(_.map(element.tag.if.elsif))

        if (element.tag.if.else) {
          ifTags.push({
            value: { boolean: true },
            filters: [],
            template: element.tag.if.else.template
          })
        }

        let tag = _.detect(ifTags, (ifTag) => {
          let value = evaluateExpression(ifTag.value, ifTag.filters, data, args)
          return isTruthy(value)
        })

        if (tag) {
          result += renderTree(tag.template, data, args)
        }
      } else if ("for" in element.tag) {
        let values = evaluateExpression(
          element.tag.for.for.value,
          element.tag.for.for.filters,
          data,
          args
        )

        _.each(values, (value) => {
          let newData = data
          newData[element.tag.for.for.variable] = value
          result += renderTree(element.tag.for.template, newData, args)
        })
      } else {
        throw "unrecognized element"
      }
    } else {
      throw "unrecognized element"
    }
  })

  return result
}

Template.render = function(template, data = {}, args = {}) {
  args.filters = args.filters || {}
  let tree = {}

  try {
    tree = parser.parse(template)
  } catch (error) {
    return error.message || error
  }

  return renderTree(tree, data, args)
}

export default Template
