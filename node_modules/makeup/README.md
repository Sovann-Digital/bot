# makeup

connect/express middleware for serving `require` enabled css files for use with web widgets.

## example

In our app/server/whatever.js

```javascript
app.use('/css/widgets.css', makeup(__dirname + '/css/widgets.css'));
```

widgets.css would look similar to
```css
/*
@require typeahead
*/

/* other css rules can go here */
.foo {}
.bar {}
```

Typeahead is a widget we installed via npm. It provides some javascript (ala commonjs style) and a base stylesheet. We want to use that base stylesheet and customize it for our needs.

Our widgets.css remains a valid css file. If passed through makeup, the @require statements will load any css which the [typeahead](https://github.com/shtylman/typeahead) module provided (via the package.json:style) field.

When we visit `site.com/css/widgets.css` we will be served a single css file with the rules for our typeahead widget.

All of the typeahead widget rules will be namespaced with `.typeahead`.

## install

```
npm install makeup
```
