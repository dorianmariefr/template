import { expect } from "chai"
import Template from "../src/Template"

describe("Template", function() {
  it("works on an empty string", function() {
    expect(Template.render("", {})).to.equal("")
  })

  it("works on a simple string", function() {
    expect(Template.render("hello", {})).to.equal("hello")
  })

  it("works on a simple variable interpolation", function() {
    expect(Template.render("hello {{ name }}", { "name": "Dorian" })).to.equal(
      "hello Dorian"
    )
  })

  it("works on a number interpolation", function() {
    expect(Template.render("hello {{ 2 }}", { "name": "Dorian" })).to.equal(
      "hello 2"
    )
  })

  it("works on a boolean interpolation", function() {
    expect(Template.render("{{ true }} / {{ false }}", { "name": "Dorian" })).to.equal(
      "true / false"
    )
  })
})
