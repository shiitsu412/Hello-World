var express = require('express');
var app = express();

app.all('*', function (request, response, next) {
  console.log(request.method + ' to path ' + request.path + 'with query' + JSON.stringify(request.query));
  next();
});

app.get('/test.html', function (request, response, next) {
  response.send('I got a request for /test');
});

app.use(express.static('./public'));

app.listen(8080, function () {
  console.log(`listening on port 8080`)
}
); // note the use of an anonymous function here