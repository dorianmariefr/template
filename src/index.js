import Template from "./Template"

document.querySelector("#source").addEventListener("input", render)
document.querySelector("#data").addEventListener("input", render)

let filters = {
  plus: function(value, parameter) {
    return value + parameter
  }
}

function render() {
  let $source = document.querySelector("#source")
  let $data = document.querySelector("#data")
  let $tree = document.querySelector("#tree")
  let $render = document.querySelector("#render")

  let source = $source.value

  let data = {}

  try {
    let tree = Template.parse(source)
    $tree.value = JSON.stringify(tree, undefined, 2)
  } catch(error) {
    $tree.value = error.message || error
  }


  try {
    data = JSON.parse($data.value)
    $render.value = Template.render(source, data, { filters: filters })
  } catch (error) {
    $render.value = error
  }
}

render()
