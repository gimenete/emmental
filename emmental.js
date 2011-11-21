var fs = require('fs')
var dom = require('./domjs/dom')
var parser = require('./domjs/html/parser')
var vm = require('vm')

function expand(obj1, obj2) {
	for (var key in obj1) {
		obj2[key] = obj1[key]
	}
	return obj2
}

function findFirstElement(node) {
	var children = node.childNodes
	var found = null
	for (var i=0; i < children.length; i++) {
		var child = children[i]
		if (child.nodeType === 1) { // element
			if (!found) {
				found = child
			}
			child.parentNode.removeChild(child)
		}
	}
	return found
}

function processElement(doc, node, data, tab) {
	var attrs = node.attributes
	
	if (attrs['if']) {
		var val = evaluate(data, attrs['if'])
		if (!val) {
			var parent = node.parentNode
			parent.removeChild(node)
			return
		}
		delete attrs['if']
	}
	
	for (var key in attrs) {
		if (key.indexOf('put-') === 0) {
			var val = evaluate(data, attrs[key])
			_key = key.substring(4)
			attrs[_key] = val
			delete attrs[key]
		}
	}
	
	if (attrs['put']) {
		var val = evaluate(data, attrs['put'])
		node.childNodes = [doc.createTextNode(val)]
		delete attrs.put
		return
	}
	
	if (node.attributes['foreach'] && node.attributes['in']) {
		var foreach = node.attributes['foreach']
		var _in = node.attributes['in']
		var col = evaluate(data, _in) || []

		var template = findFirstElement(node)
		for (var j=0; j < col.length; j++) {
			var val = col[j]
			var clone = deepClone(template) // template.cloneNode(true)
			node.appendChild(clone)
			var ex = {}; ex[foreach] = val
			processElement(doc, clone, expand(data, ex), tab+' ')
		}

		delete attrs.foreach
		delete attrs.in
	} else {
		var children = node.childNodes
		for (var i=0; i < children.length; i++) {
			var child = children[i]
			processElement(doc, child, data, tab+' ')
		}
	}
}

function deepClone(node) {
	var n = node.cloneNode()
	var children = node.childNodes
	for (var i=0; i < children.length; i++) {
		n.appendChild(deepClone(children[i]))
	}
	
	var attrs = node.attributes
	for (var key in attrs) {
		n.attributes[key] = attrs[key]
	}
	return n
}

function evaluate(data, code) {
	try {
		vm.runInNewContext('result = '+code, data)
	} catch(e) {
		return ''
	}
	result = data.result
	delete data.result
	return result
}

function processTemplate(html, data) {
	var d = dom.createDocument()
	var doc = parser.parse(html, d)
	processElement(d, doc, data, ' ')
	return doc
}

exports.processTemplate = processTemplate