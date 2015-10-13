# Goal

Emmental is a simple server-side template engine with one goal in mind: to be able to use the same file as a mockup and as a template as well. Usually designers create HTML mockups and then developers copy those files to another directory and start to insert things like ${} <?php?> <%=%>,… breaking the HTML syntax, and making it impossible to be edited for a designer.

The idea of emmental is to create a template engine that doesn't break the HTML. So the designer can keep using their tools, and the file is always capable to be rendered by a web browser.

# How?

The emmental purpose is to use non-standard HTML attributes that the web browser ignores but the template engine interprets.

# Example

For example you have the following markup:

	<p>There are 3 fruits in the basket:</p>

	<ul>
		<li>fruit1</li>
		<li>fruit2</li>
		<li>fruit3</li>
	</ul>

This is dummy text. And now you would like to fill this HTML with real data (maybe fetched from a database or any other data source). For simplicity think that we have this data:

    var fruits = ['apple', 'pear', 'banana', 'pineapple']

With emmental is easy to convert the previous mackup in a real template capable to be filled with data.

## The simplest attribute: "put"

Use "put" to change the text contained within an HTML element. For example:

    <p>There are <span put="fruits.length">3</span> fruits in the baket:</p>

As you can see you can use any javascript expression in the "put" attribute.

## Loops: "loop" and "as" attributes

To loop over a collection you will use the "loop" and "as" attributes. Example:

		<ul>
			<li loop="fruits" as="fruit">foo</li>
			<li>bar</li>
			<li>baz</li>
		</ul>

With the "loop" attribute you define which collection will be iterated. With the "as" attribute you define the variable name to access each item in the collection while iterating.

The previous code will generate just four \<li>foo</li> elements which is not very useful. The complete example could be:

		<ul>
			<li loop="fruits" as="fruit" put="fruit">foo</li>
			<li>bar</li>
			<li>baz</li>
		</ul>

Now you want to remove the last two <li> elements because they are dummy data. You can do the following

		<ul>
			<li loop="fruits" as="fruit" put="fruit">foo</li>
			<li if="0">bar</li>
			<li if="0">baz</li>
		</ul>

## Conditional rendering

You can use the "if" attribute to do conditional rendering. The expression result is a falsy value then the element is removed. For example:

    <p if="fruits.length === 0">There are no fruits.</p>

There is no "else" support and not is planned.

## Attribute override

You can override attributes with "put-*". For example, if you have this markup:

    <a href="detail-mockup.html">more info</a>

You can override the href attribute with "put-href". Example:

    <a href="detail-mockup.html" put-href="'/film/'+film.id">more info</a>

Again, you can use any javascript expression.

# Usage

Usage:

	var emmental = require('emmental')
	var html = fs.readFileSync('./example.html', 'utf8')
	var out = emmental.processTemplate(html, data, function(err, out) {
		console.log(out) // "out" is a string with the HTML output
	})

You can find a complete example inside the "examples" folder in this repository.

# LICENSE

	Copyright (c) 2011 Alberto Gimeno Brieba <gimenete@gmail.com>
	
	Permission is hereby granted, free of charge, to any
	person obtaining a copy of this software and associated
	documentation files (the "Software"), to deal in the
	Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the
	Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice
	shall be included in all copies or substantial portions of
	the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
	KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
	WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
	PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
	OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
