var express = require('express');
var app = express();
var myParser = require("body-parser");
app.use(myParser.urlencoded({ extended: true }));
var qs = require('qs');
var fs = require('fs');
const e = require('express');

var products = require('./products.json');

var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');

app.use(session({secret: "ITM352 rocks!"}));

app.get('/set_session', function(req,res,next){
  res.send(`welcome, your session ID is ${req.session.id}`);
  next();
});

app.get('/use_session', function(req,res,next){
  res.send(`Your session ID is ${req.session.id}`);
  next();
});

app.get('/set_cookie', function(req, res, next) {
  //console.log(req.cookie)
  let my_name='Airi Shiitsu';
  now= new Date();
  res.cookie('my_name', my_name, {expire:5000 + now.getTime()});
  res.send(`Cookie for ${my_name} sent`);
  next();
});


app.get('/use_cookie', function(req, res, next) {
  //console.log(req.cookie);
  if(typeof req.cookies["my_name"] != 'undefined'){
    let username = req.cookies["username"];
    res.cookie('username', username,{"maxAge": 10*100});

    res.send(`${user_data[username]["name"]}is logged in`);
  }else{
    res.send("You're not logged in")
  }
  next();
});


// var user_data = require('./user_data.json');
// Read user data file
var user_data_file = './user_data.json';
if (fs.existsSync(user_data_file)) {
  var file_stats = fs.statSync(user_data_file);
  //console.log(`${user_data_file} has ${file_stats["size"]} characters`);
  var user_data = JSON.parse(fs.readFileSync(user_data_file, 'utf-8'));
} else {
  console.log(`${user_data_file} does not exist!`);
}

app.all('*', function (req, res, next) {
  console.log(req.method, req.path);
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
  }});

app.post('/process_register', function(req, res, next){
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



app.get("/login", function (request, response) {
  // Give a simple login form
  str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
  `;
  response.send(str);
});


// This processed the login form 
app.post('/process_login', function (request, response, next) {
  let username_entered = request.body["username"];
  let password_entered = request.body["psw"];
  if(typeof user_data[username_entered] !='undefined'){
    if(user_data[username_entered]['password']== password_entered){
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

// This processed the login form 
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