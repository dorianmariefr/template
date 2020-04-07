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
  upcase: function(value, arguments = {}) {
    value.toUpperCase()
  },
  downcase: function(value, arguments = {}) {
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
})
