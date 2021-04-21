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

//Rputing and middleware
app.use(myParser.urlencoded({ extended: true }));


app.all('*', function (req, res, next) {
  console.log(`${req.method} request to ${req.path}`);
  next();
});

app.get("/products.json", function (req, res, next) {
  res.json(products);
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
      res.redirect('login.html');
    }

  }
});



// This processed the login form if not
app.post('/login', function (request, response, next){
   username_entered = request.body["username"];
  password_entered = request.body["psw"];
if (typeof user_data[username_entered] != 'undefined') {
if (user_data[username_entered]['password'] == password_entered) {
user_quantity_data['username'] = username_entered;
response.redirect('/invoice.html?' + qs.stringify(user_data_file));
} else {
     response.redirect('login.html');
    }
  }
});

app.get("/register", function (request, response) {
  // only allow login after selecting products
  if (typeof user_quantity_data != 'undefined') {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
  `;
    response.send(str);
  } else {
    str = `
    <head>
    <script>
        alert('You need to select some products before registering!');
        
        window.location = './products_display.html';
    </script>
    </head>
        `;
        response.send(str);
  } 

});

app.post('/register', function (req, res) {
  // add a new user to the DB
  username = req.body["username"];

  user_data[username] = {};
  user_data[username]["password"] = req.body["psw"];
  user_data[username]["email"] = req.body["email"];
  user_data[username]["name"] = req.body["fullname"];
  //same updated user data to file DB
  fs.writeFileSync(user_data_file, JSON.stringify(user_data));
  console.log("Saved: " + user_data);
  user_quantity_data['username'] = username; // add the username to the data that will be sent to the invoice so the user can be identified with this transient data
  response.redirect('/invoice.html?' + qs.stringify(user_quantity_data)); // transient data passed to invoice in a query string
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