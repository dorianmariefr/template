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
    expect(Template.render("hello {{ 2 }}", {})).to.equal(
      "hello 2"
    )
  })

  it("works on a boolean interpolation", function() {
    expect(Template.render("{{ true }} / {{ false }}", {})).to.equal(
      "true / false"
    )
  })

  it("works on an array interpolation", function() {
    expect(Template.render("{{ 1, true, name }}", { "name": "Dorian" })).to.equal(
      "1, true, Dorian"
    )
  })
})
