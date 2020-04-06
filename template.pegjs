template = (interpolation / tag / text)+

ws = (" " / "\n")*
single_quote = "'"
double_quote = '"'
open_interpolation = "{{"
close_interpolation = "}}"
open_tag = "{%"
close_tag = "%}"
nil = "null"
true = "true"
false = "false"

alpha = [a-zA-Z]+
alpha_num = [a-zA-Z0-9]+
digit = [0-9]+
non_zero_digit = [1-9]+

interpolation =
  open_interpolation ws
  value:(short_hash / short_array / value) ws
  filters:filter*
  ws close_interpolation
  { return { 'interpolation': { filters, value } } }

tag =
  tag:(
    if_:if_
    { return { 'if': if_ } } /
    for_:for_
    { return { 'for': for_ } } /
    assign:assign
    { return { assign } } /
    other:other
    { return { other } }
  ) { return { tag } }

text =
  text:$(!open_interpolation !open_tag .)+
  { return { text } }

filter =
  "|" ws
  method:method ws
  parameters:parameters
  { return { method, parameters } }

parameters =
  (
    ws value:(short_hash / short_array / value) ws
    { return { value } }
  )*

not_close_tag =
  ws !close_tag value:value ws
  { return value }

assign =
  open_tag ws
  variable:variable ws
  "=" ws
  value:value ws
  filters:filter* ws
  close_tag
  { return { variable, value, filters } }

if_ =
  if_value:if_tag
  elsif_values:elsif_tag*
  else_value:else_tag?
  endif_tag
  { return { 'if': if_value, 'elsif': elsif_values, 'else': else_value } }

other =
  other:other_tag
  endother_tag
  { return other }

for_ =
  for_value:for_tag
  template:template?
  endfor_tag
  { return { 'for': for_value, template: template } }

if_tag =
  open_tag ws
  "if" ws
  value:value ws
  filters:filter* ws
  close_tag
  template:template?
  { return { value, filters, template } }

elsif_tag =
  open_tag ws
  "elsif" ws
  value:value ws
  filters:filter* ws
  close_tag
  template:template?
  { return { value, filters, template } }

else_tag =
  open_tag ws
  "else" ws
  close_tag
  template:template?
  { return { template } }

endif_tag = open_tag ws "endif" ws close_tag

other_tag =
  open_tag ws
  name:name ws
  value:value? ws
  filters:filter* ws
  close_tag
  template:template?
  { return { name, value, filters, template } }

endother_tag =
  open_tag ws
  "end" ws
  close_tag

for_tag =
  open_tag ws
  "for" ws
  variable:variable ws
  "in" ws
  value:value ws
  filters:filter* ws
  close_tag
  template:template?
  { return { variable, value, filters, template } }

endfor_tag = open_tag ws "endfor" ws close_tag

value =
  value:(
    nil:nil
    { return { nil } } /
    integer:integer
    { return { integer } } /
    float:float
    { return { float } } /
    string:string
    { return { string } } /
    array:array
    { return { array } } /
    hash:hash
    { return { hash } } /
    boolean:boolean
    { return { boolean } } /
    variable:variable
    { return { variable } }
  )

name = $(alpha (alpha_num / ("_" alpha_num))*)
variable = $(name ("." name)*)
method = name
integer = $(non_zero_digit (digit / "_")*)
float = "-"? integer "." integer ("e" ("+" / "-") integer)
single_quoted_string = single_quote (!single_quote .)* single_quote
double_quoted_string = double_quote (!double_quote .)* double_quote
string = $(single_quoted_string / double_quoted_string)
key = name / string
boolean = true / false

key_value =
  key:key ":" ws value:value ws
  { return { key, value } }

array =
  "[" ws
  values:(
    first_value:value
    other_values:(ws "," ws value:value ws { return value })*
    { return [first_value, ...other_values] }
  )?
  ws "]"
  { return values }

short_array =
  first_value:value
  other_values:(ws "," ws value:value ws { return value })+
  { return { array: [first_value, ...other_values] } }

hash =
  "{" ws
  key_values:(
    first_key_value:key_value
    other_key_values:(
      ws "," ws key_value:key_value
      { return key_value }
    )*
    { return [first_key_value, ...other_key_values] }
  )?
  ws "}"
  { return key_values }

short_hash =
  first_key_value:key_value
  other_key_values:(
    ws "," ws key_value:key_value
    { return key_value }
  )*
  { return { hash: [first_key_value, ...other_key_values] } }
