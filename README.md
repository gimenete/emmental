# Goal

Emmental is a simple server-side template engine with one goal in mind: to be able to use the same file as mockup and template. Usually designers create HTML mockups and then a developer copies this file to another file and starts to insert things like ${} <?php?> <%=%>,… breaking the HTML syntax, and making it impossible to be edited for a designer.

The idea of emmental is to create a template engine that doesn't break the HTML. So the designer can keep using their toolkit, and the file is always capable to be rendered by a web browser.

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

## Loops: "foreach" and "in" attributes

To loop over a collection you will use the "foreach" and "in" operators. Example:

		<ul foreach="fruit" in="fruits">
			<li>foo</li>
			<li>bar</li>
			<li>baz</li>
		</ul>

With the "foreach" attribute you define the name of the current element in the collection in each iteration. With the "in" attribute you define the collection that has to be iterated.

The convention is that the first element is used as template for each loop and the rest are simply ignored and removed.

The previous code will generate just four \<li>foo</li> elements which is not very useful. The complete example could be:

		<ul foreach="fruit" in="fruits">
			<li put="fruit">foo</li>
			<li>bar</li>
			<li>baz</li>
		</ul>

In a near future you will have access to more information such as the index in the loop, if it is the first element, if it is the last element,…

I am also planning to be able to insert some kind of element by intervals. For example: insert "<br>" if "index % 4 == 0". This may be included as an element with an special attribute:

    <br every="<condition>">

In each iteration the condition is evaluated, and when it evaluates to true the element is inserted.

## Conditional rendering

You can use the "if" attribute to do conditional rendering. If the result of evaluating the expression is not "true" then the element is removed. For example:

    <p if="fruits.length === 0">There are no fruits.</p>

There is no "else" support and not is planned.

## Attribute override

You can override attributes with "put-*". For example, if you have this markup:

    <a href="detail-mockup.html">more info</a>

You can override the href attribute with "put-href". Example:

    <a href="detail-mockup.html" put-href="'/film/'+film.id">more info</a>

Again, you can use any javascript expression.

# Usage

Emmental depends on [domjs](https://github.com/jldailey/domjs). Checkout its source code inside a "domjs" directory.

Usage:

	var emmenta = require('./emmental')
	var html = fs.readFileSync('./example.html', 'utf8')
	var out = emmental.processTemplate(html, data) // "out" is a DOM document
	console.log(out.toString())

You can find a complete example inside the "examples" folder in this repository.

# Known problems

Emmental uses [domjs](https://github.com/jldailey/domjs) that is a recent implementation of the DOM interface an has some problems. See the [issues list](https://github.com/jldailey/domjs/issues)

Emmental uses the `vm` module of NodeJS to evaluate the expressions inside HTML attributes. So don't use untrusted code in your HTML attributes :) Nevertheless the evaluated code doesn't have access to any node module. You can't even use `setTimeout()`, `setInterval()`, `console.log()`,…

# expressjs

I will try to integrate emmental to work with expressjs

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