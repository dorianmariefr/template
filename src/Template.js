import parser from "./template.pegjs"
import { each, map, detect } from "underscore"

let Template = {}

Template.parse = function(template) {
  return parser.parse(template)
}

let fetchVariableInData = function(variable, data) {
  let parts = variable.split(".")
  let current = data

  each(parts, (part) => {
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
  if (value === null || "nil" in value) {
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
    return map(value.array, (element) => {
      return valueToJs(element, data)
    })
  } else if ("hash" in value) {
    let hash = {}

    each(value.hash, (element) => {
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
    return "[" + map(value, (element) => {
      return valueToText(element)
    }).join(", ") + "]"
  } else if (typeof value === "object") {
    if (Object.keys(value).length === 0) {
      return "{}"
    } else {
      return "{ " + map(value, (element, key) => {
        return key + ": " + valueToText(element)
      }).join(", ") + " }"
    }
  } else {
    throw "unrecognized value to convert to text"
  }
}

let evaluateExpression = (value, filters, data, args) => {
  value = valueToJs(value, data)

  each(filters, (filter) => {
    if (!(filter.method in args.filters)) {
      throw "unknown filter " + filter.method
    }

    value = args.filters[filter.method](
      value,
      ...map(filter.parameters, (parameter) => valueToJs(parameter.value, data))
    )
  })

  return value
}

let isTruthy = (value) => {
  return value !== undefined && value !== null && value !== false
}

let renderTree = (tree, data, args) => {
  let result = ""

  each(tree, (element) => {
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
        ifTags = ifTags.concat(map(element.tag.if.elsif))

        if (element.tag.if.else) {
          ifTags.push({
            value: { boolean: true },
            filters: [],
            template: element.tag.if.else.template
          })
        }

        let tag = detect(ifTags, (ifTag) => {
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

        each(values, (value) => {
          let newData = data
          newData[element.tag.for.for.variable] = value
          result += renderTree(element.tag.for.template, newData, args)
        })
      } else if ("assign" in element.tag) {
        data[element.tag.assign.variable] = evaluateExpression(
          element.tag.assign.value,
          element.tag.assign.filters,
          data,
          args
        )
      } else if ("other" in element.tag) {
        if (!(element.tag.other.name in args.tags)) {
          throw "unknown tag " + element.tag.other.name
        }

        let values = evaluateExpression(
          element.tag.other.value,
          element.tag.other.filters,
          data,
          args
        )

        result += args.tags[element.tag.other.name](
          renderTree(element.tag.other.template, data, args),
          values
        )
      } else {
        throw "unrecognized tag element"
      }
    } else {
      throw "unrecognized element"
    }
  })

  return result
}

Template.render = function (template, data = {}, args = {}) {
  args.filters = args.filters || {}
  args.tags = args.tags || {}
  let tree = {}

  try {
    tree = parser.parse(template)
  } catch (error) {
    return error.message || error
  }

  return renderTree(tree, data, args)
}

export default Template
