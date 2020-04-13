import { expect } from "chai"
import Template from "../src/Template"

let data = {
  name: "Dorian",
  sleeping: false,
  books: [
    {
      title: "Hackers and Painters",
      author: "Paul Graham"
    }
  ]
}

let filters = {
  upcase: function(value, args = {}) {
    value.toUpperCase()
  },
  downcase: function(value, args = {}) {
    value.toLowerCase()
  }
}

describe("Template", function() {
  it("works on an empty string", function() {
    expect(Template.render("", data)).to.equal("")
  })

  it("works on a simple string", function() {
    expect(Template.render("hello", data)).to.equal("hello")
  })

  it("works on a simple variable interpolation", function() {
    expect(Template.render("hello {{ name }}", data)).to.equal(
      "hello Dorian"
    )
  })

  it("works on a number interpolation", function() {
    expect(Template.render("hello {{ 2 }}", data)).to.equal(
      "hello 2"
    )
  })

  it("works on a boolean interpolation", function() {
    expect(Template.render("{{ true }} / {{ false }}", data)).to.equal(
      "true / false"
    )
  })

  it("works on an array interpolation", function() {
    expect(Template.render("{{ 1, true, name }}", data)).to.equal(
      "[1, true, Dorian]"
    )
  })

  it("works on an hash interpolation", function() {
    expect(Template.render(
      "{{ name: name, numbers: [1, 2, 3] }}", data
    )).to.equal(
      "{ name: Dorian, numbers: [1, 2, 3] }"
    )
  })

  it("works on an nil, float, string interpolation", function() {
    expect(Template.render(
      "{{ null, 1.2, 'hello' }}", data
    )).to.equal(
      "[null, 1.2, hello]"
    )
  })

  it("works on an edge cases", function() {
    expect(Template.render(
      "{{ 0, '0', \"\", '', -1 }}", data
    )).to.equal(
      "[0, 0, , , -1]"
    )
  })

  it("works with a filter", function() {
    expect(Template.render(
      "{{ 10 | plus 15.5 }}", data, {
        filters: { plus: (value, parameter) => value + parameter }
      }
    )).to.equal(
      "25.5"
    )
  })

  it("works with chained filters", function() {
    expect(Template.render(
      "{{ 10 | plus 15.5 | plus 10 | minus 30 }}", data, {
        filters: {
          plus: (value, parameter) => { return value + parameter },
          minus: (value, parameter) => { return value - parameter },
        }
      }
    )).to.equal(
      "5.5"
    )
  })
})
