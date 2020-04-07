import { expect } from "chai"
import Template from "../src/Template"

describe("Template", function() {
  it("works on an empty string", function() {
    expect(Template.render("", {})).to.equal("")
  })

  it("works on an simple string", function() {
    expect(Template.render("hello", {})).to.equal("hello")
  })

  it("works on an simple variable interpolation", function() {
    expect(Template.render("hello {{ name }}", { "name": "Dorian" })).to.equal(
      "hello Dorian"
    )
  })
})
