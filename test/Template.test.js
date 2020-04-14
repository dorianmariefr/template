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
  ],
  languages: {
    ruby: {
      favorite: true
    }
  },
  users: [{ name: "Alpha" }, { name: "Beta" }] 
}

let filters = {
  not: (value) => { return !value }
}

describe("Template", function() {
  it("works on an empty string", function() {
    expect(Template.render("")).to.equal("")
  })

  it("works on a simple string", function() {
    expect(Template.render("hello")).to.equal("hello")
  })

  it("works on a simple variable interpolation", function() {
    expect(Template.render("hello {{ name }}", data)).to.equal(
      "hello Dorian"
    )
  })

  it("works on a number interpolation", function() {
    expect(Template.render("hello {{ 2 }}")).to.equal(
      "hello 2"
    )
  })

  it("works on a boolean interpolation", function() {
    expect(Template.render("{{ true }} / {{ false }}")).to.equal(
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
      "{{ null, 1.2, 'hello' }}"
    )).to.equal(
      "[null, 1.2, hello]"
    )
  })

  it("works on an edge cases", function() {
    expect(Template.render(
      "{{ 0, '0', \"\", '', -1 }}"
    )).to.equal(
      "[0, 0, , , -1]"
    )
  })

  it("works with a filter", function() {
    expect(Template.render(
      "{{ 10 | plus 15.5 }}", {}, {
        filters: { plus: (value, parameter) => value + parameter }
      }
    )).to.equal(
      "25.5"
    )
  })

  it("works with chained filters", function() {
    expect(Template.render(
      "{{ 10 | plus 15.5 | plus 10 | minus 30 }}", {}, {
        filters: {
          plus: (value, parameter) => { return value + parameter },
          minus: (value, parameter) => { return value - parameter },
        }
      }
    )).to.equal(
      "5.5"
    )
  })

  it("works on array variable interpolation", function() {
    expect(Template.render(
      "{{ name }} reads {{ books[0].title }} by {{ books[0].author }}", data 
    )).to.equal(
      "Dorian reads Hackers and Painters by Paul Graham"
    )
  })

  it("works on chained variable interpolation", function() {
    expect(Template.render(
      "Is ruby {{ name }}'s favorite? {{ languages.ruby.favorite }}", data 
    )).to.equal(
      "Is ruby Dorian's favorite? true"
    )
  })

  it("works with if conditional", function() {
    expect(Template.render(
      "{% if sleeping | not %}not sleeping{% endif %}", data, { filters: filters }
    )).to.equal(
      "not sleeping"
    )
  })

  it("works with else conditional", function() {
    expect(Template.render(
      "{% if sleeping %}sleeping{% else %}not sleeping{% endif %}", data
    )).to.equal(
      "not sleeping"
    )
  })

  it("works with elsif conditional", function() {
    expect(Template.render(
      `{% if sleeping %}sleeping
       {% elsif sleeping | not %}not sleeping{% else %}
       something else{% endif %}`, data, { filters: filters }
    )).to.equal(
      "not sleeping"
    )
  })

  it("works with for loop", function() {
    expect(Template.render(
      "{% for user in users %}{{ user.name }} {% endfor %}", data
    )).to.equal(
      "Alpha Beta "
    )
  })

  it("works with assign", function() {
    expect(Template.render(
      "{% a = 1 %}{{ a }}"
    )).to.equal(
      "1"
    )
  })
})
