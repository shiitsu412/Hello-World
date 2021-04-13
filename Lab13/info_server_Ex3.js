var express = require('express');
var app = express();
var myParser = require("body-parser");
app.use(myParser.urlencoded({ extended: true }));

var qs = require('qs');

app.all('*', function (request, response, next) {
  console.log(request.method + ' to path ' + request.path + 'with query' + JSON.stringify(request.query));
  next();
});

app.get('/test.html', function (request, response, next) {
  response.send('I got a request for /test');
});

app.post('/displsy_purchase.html', function(request,response, next){
  user_data={'username':'itm352','password':'grader'};
  post_data = request.body;
  if( post_data['quantity_textbox']){
    the_qty=post_data['quantity_textbox'];
    if(isNonNegInt(the_qty)){
      qstring = qs.string(request.query);
      response.redirect('invoice.html?+qstring+&quantity_textbox='+the_qty);
      return;
    }else {
      response.redirect('./order_page.html?quantity_textbox='+the_qty);
      return;
      }
    }
});

app.use(express.static('./public'));

app.listen(8080, function () {
  console.log(`listening on port 8080`)
}
); // note the use of an anonymous function here

function isNonNegInt(val, returnErrors = false) {
  if (val=='') val=0;
  var errors = []; 
  if(Number(val) != val) errors.push('Not a number!'); 
  if(val < 0) errors.push('Negative value!'); 
  if(parseInt(val) != val) errors.push('Not an integer!'); 

  return returnErrors ? errors : ((errors.length > 0)?false:true)
}