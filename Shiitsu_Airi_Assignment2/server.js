var express = require('express');
var app = express();
var myParser = require("body-parser");
app.use(myParser.urlencoded({ extended: true }));
var qs = require('qs');
var fs = require('fs');
const e = require('express');

var products = require('./products.json');
var user_quantity_data; // make a global variable to hold the product selections until we get to the invoice

//var user_data = require('./user_data.json');
// Read user data file
var user_data_file = './user_data.json';
if (fs.existsSync(user_data_file)) {
  var file_stats = fs.statSync(user_data_file);
  data = fs.readFileSync(user_data_file, 'utf-8');
  user_data = JSON.parse(data);
} else {
  console.log(user_data_file + ' does not exist!');
}



app.all('*', function (req, res, next) {
  console.log(`${req.method} request to ${req.path}`);
  next();
});

app.get("/products.js", function (req, res, next) {
  res.send(`var products=${JSON.stringify(products)}; `);

});

// I copied from professor's server.js file
app.get('/purchase', function (req, res, next) {
  user_quantity_data = req.query; // save for later
  if (typeof req.query['purchase_submit'] != 'undefined') {
    console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.query));

    user_quantity_data = req.query; // get the query string data which has the form data
    // form was submitted so check that quantities are valid then redirect to invoice if ok.

    has_errors = false; // assume quantities are valid from the start
    total_qty = 0; // need to check if something was selected so we will look if the total > 0
    for (i = 0; i < products.length; i++) {
      if (user_quantity_data[`quantity${i}`] != 'undefined') {
        a_qty = user_quantity_data[`quantity${i}`];
        total_qty += a_qty;
        if (!isNonNegInt(a_qty)) {
          has_errors = true; // oops, invalid quantity
        }
      }
    }
    // Now respond to errors or redirect to login if all is ok
    if (has_errors || total_qty == 0) {
      res.redirect('products_display.html?' + qs.stringify(user_quantity_data));
    } else { // all good to go!
      res.redirect('login.html?' + qs.stringify(user_quantity_data));
    }

  }
});



// This processed the login form if not
app.post('/login', function (request, response, next) {
  username_entered = request.body["username"];
  password_entered = request.body["psw"];
  if (typeof user_data[username_entered] != 'undefined') {
    if (user_data[username_entered]['password'] == password_entered) {
      //add username and email address to query string
      request.query['username'] = username_entered;
      request.query['email'] = user_data[username_entered]['email'];
      request.query['name'] = user_data[username_entered]['name'];
      response.redirect('/invoice.html?' + qs.stringify(request.query));
    } else {
      response.redirect('/login.html?' + qs.stringify(request.query));
    }
  }
});


app.post('/process_register', function (req, res, next) {
  console.log(req.body);
  // add a new user to the DB
  username = req.body["username"];

  user_data[username] = {};
  user_data[username]["password"] = req.body["psw"];
  user_data[username]["email"] = req.body["email"];
  user_data[username]["name"] = req.body["fullname"];
  //same updated user data to file DB
  fs.writeFileSync(user_data_file, JSON.stringify(user_data));
  console.log("Saved: " + user_data);
  res.redirect('/invoice.html?' + qs.stringify(req.query)); // transient data passed to invoice in a query string
});


app.use(express.static('./static'));

var listener = app.listen(8080, () => { console.log('server started listening on port' + listener.address().port) });

// just in case to help functions
function isNonNegInt(q, return_errors = false) {
  errors = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); // Check if string is a number value
  else if (q < 0) errors.push('<font color="red">Negative value!</font>'); // Check if it is non-negative
  else if (parseInt(q) != q) errors.push('<font color="red">Not an integer!</font>'); // Check that it is an integer
  return return_errors ? errors : (errors.length == 0);
}