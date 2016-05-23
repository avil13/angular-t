# Angular Templater


***

###### Create HTML elements from JSON decription and wrap it in template;


```html

<templater map="map_object"></templater>

```
Hear `map_object` is a JSON what compile to HTML elements.

#### Exampe:

```JSON
{
  "-e--[div.txt]": "Hello world!"
}
```

convert to:

```html
<div class="txt">Hello world!</div>
```
