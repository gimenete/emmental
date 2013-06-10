var emmental = require('../emmental')
var fs       = require('fs')
var path     = require('path')

var data = {
	fruits: ['apple', 'banana', 'pineapple', 'pear', 'tomato'],
	films: [
		{id:1, title: 'A film', genre:'drama'},
		{id:2, title: 'Another film', genre:'comedia'},
		{id:3, title: 'Yet another film', genre:'comedia'},
		{id:4, title: 'Another one!', genre:'comedia'},
		{id:5, title: 'And the last one', genre:'comedia',
			characters: [
				{name: 'character1'},
				{name: 'character2'},
			]
		}
	],
	raw_message: '<strong>hello</strong> <em>world</em>!'
}

function loader(template, callback) {
	fs.readFile(path.join(__dirname, template), 'utf8', callback)
}

var http = require('http')
http.createServer(function (req, res) {
	emmental.processTemplate('example.html', data, loader, function(err, out) {
		if (err) {
			res.writeHead(500, {'Content-Type': 'text/html'})
			res.end(''+err)
			return
		}
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.end(out)
	})
}).listen(1337, '127.0.0.1')
console.log('Server running at http://127.0.0.1:1337/')