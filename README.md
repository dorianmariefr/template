# .template

# examples

```liquid
<p>{{ "hello " | plus "world" }}</p>
```

```liquid
{% for user in users %}
  {{ user.name }}
{% endfor %}
```

```liquid
{% if user.admin %}
  {{ "delete everything" | link_to "/secret/button" }}
{% endif %}
```

```liquid
<p>
  hi {{ user.name }}
</p>

<p>
  welcome to the {{ repo.name }} repository, you might want to check out
  those other projects:
</p>

<ul>
  {% for project in projects %}
    {% unless project.fork %}
      <li>
        <a href="{{ project.url }}">
          {{ project.name }}
        </a>
      </li>
    {% endunless %}
  {% endfor %}
</ul>

<p>
  thanks for reading this on a {{ "now" | date "%A" | downcase }}
</p>
````

```liquid
hello {{ user.name | capitalize }}

{% for todo in user.todos %}
  {{ todo.done | true_false "DONE" "TODO" }}
  {{ todo.name }}

  {% now = "now" | to_date %}
  {% if todo.due_date | and (todo.due_date | to_date | more_than now) %}
    due by {{ todo.due_date | to_date "short" }}
  {% endif %}
{% endfor %}
```
