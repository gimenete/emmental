var htmlparser = require('htmlparser2')
var _          = require('underscore')

var singletonTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source']

function createEscapeFunction(exp, tags) {
	return function(str) {
		str = (str && str.toString()) || ''
		return str.replace(exp, function(tag) {
			return tags[tag] || tag
		})
	}
}

var escapeText = createEscapeFunction(/[&<>]/g, {'&': '&amp;', '<': '&lt;', '>': '&gt;' })
var escapeAttr = createEscapeFunction(/[&<>"]/g, {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })

function evaluate(code, options) {
	var keys = []
	var values = []
	for (var key in options) {
		if (options.hasOwnProperty(key)) {
			keys.push(key)
			values.push(options[key])
		}
	}
	keys.push(code)

	var f = Function.apply({}, keys)
	return f.apply({}, values)
}

function processTemplate(template, data, loader, callback) {
	var out = []
	var layout = []

	function processArray(parentName, children, data) {
		for (var i = 0; i < children.length; i++) {
			var child = children[i]
			if (child.type === 'tag' || child.type === 'script') {
				processElement(child, data)
			} else if (child.type === 'text') {
				var str = child.data
				if (parentName === 'script') {
					str = str.replace(/\${[^}]+}/g, function(expr) {
						var code = expr.substring(2, expr.length-1)
						var val =  evaluate('return '+code, data)
						return val
					})
					out.push(str)
				} else {
					out.push(escapeText(str))
				}
			} else if (child.type === 'directive') {
				out.push('<', escapeText(child.data), '>')
			} else if (child.type === 'comment') {
				out.push('<!--', escapeText(child.data), '-->')
			}
		}
	}

	function printElement(element, data) {
		var name = element.name
		var attr = _.clone(element.attribs)
		var ignore = name === 'o'

		if (!ignore) {
			out.push('<', name)
		}
		// evaluate
		var keys = _.keys(attr)
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]
			if (key.indexOf('put-') === 0) {
				attr[key.substring(4)] = evaluate('return '+attr[key], data)
				delete attr[key]
			}
		}

		var _text = null
		if (attr['put']) {
			_text = evaluate('return '+attr['put'], data)
			delete attr['put']
		}

		var _raw = null
		if (attr['raw']) {
			_raw = evaluate('return '+attr['raw'], data)
			delete attr['raw']
		}

		// print
		if (!ignore) {
			if (_.size(attr) > 0) {
				for (var key in attr) {
					if (attr.hasOwnProperty(key)) {
						var value = escapeAttr(attr[key])
						if (value !== '') {
							out.push(' ', key, '="', escapeAttr(attr[key]), '"')
						} else {
							out.push(' ', key)
						}
					}
				}
			}
			out.push('>')
		}

		if (_text !== null) {
			out.push(escapeText(_text))
		} else if (_raw !== null) {
			out.push(_raw)
		} else {
			var children = element.children
			if (children) {
				processArray(name, children, data)
			}
		}
		if (!ignore && element.children.length > 0 && singletonTags.indexOf(name) === -1) {
			out.push('</', name, '>') // TODO: omit special tags like <img>, <br>,...
		}
	}

	function findBlock(children, name) {
		for (var i = 0; i < children.length; i++) {
			var child = children[i]
			if (child.type === 'tag') {
				if (child.attribs['block'] === name) {
					return child
				}
				var e = findBlock(child.children, name)
				if (e) return e
			}
		}
		return null
	}

	function processElement(element, data) {
		var attr = element.attribs

		var block = attr['block']
		delete attr['block']
		if (block) {
			var el = findBlock(layout, block)
			if (el) {
				processElement(el, data)
				return
			}
		}

		if (attr['if']) {
			var value = evaluate('return '+attr['if'], data)
			if (!value) return
			delete attr['if']
		}

		if (attr['loop'] && attr['as']) {
			var arr = evaluate('return '+attr['loop'], data)
			var as = attr['as']
			delete attr['loop']
			delete attr['as']

			for (var i = 0; i < arr.length; i++) {
				var value = arr[i]
				var _data = _.clone(data)
				_data[as] = value
				printElement(element, _data)
			}
		} else {
			printElement(element, data)
		}
	}

	var handler = new htmlparser.DomHandler(function(err, dom) {
		if (err) { return callback(err) }

		var _extends = null
		for (var i = 0; i < dom.length; i++) {
			var el = dom[i]
			if (el.attribs && el.attribs['extends']) {
				_extends = el.attribs['extends']
				break
			}
		}

		function process() {
			processArray(null, dom, data)
			callback(null, out.join(''))
		}

		if (_extends) {
			loader(_extends, function(err, html) {
				if (err) { return callback(err) }

				var parser = new htmlparser.Parser(new htmlparser.DomHandler(function(err, _layout) {
					if (err) { return callback(err) }

					layout = dom
					dom = _layout
					process()
				}))
				parser.write(html)
				parser.end()
			})
		} else {
			process()
		}
	})

	loader(template, function(err, html) {
		if (err) { return callback(err) }

		var parser = new htmlparser.Parser(handler)
		parser.write(html)
		parser.end()
	})
}

exports.processTemplate = processTemplate
