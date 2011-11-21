var emmental = require('../emmental')
var fs = require('fs')

var data = {
	fruits: ['apple', 'banana', 'pineapple', 'pear', 'tomato'],
	films: [
		{id:1, title: 'Una película', genre:'drama'},
		{id:2, title: 'Otra película', genre:'comedia'},
		{id:3, title: 'Y otra más película', genre:'comedia'},
		{id:4, title: 'Y otra!!', genre:'comedia'},
		{id:5, title: 'Y la última que ya vale', genre:'comedia',
			characters: [
				{name: 'character1'},
				{name: 'character2'},
			]
		}
	]
}

var http = require('http');
http.createServer(function (req, res) {
	var html = fs.readFileSync('./example.html', 'utf8')
	var out = emmental.processTemplate(html, data)
	console.log(out.toString())
	res.writeHead(200, {'Content-Type': 'text/html'})
	res.end(out.toString())
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');