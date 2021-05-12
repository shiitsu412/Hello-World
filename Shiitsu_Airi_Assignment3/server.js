var express = require('express');
var app = express();
var myParser = require("body-parser");
var session = require('express-session');
var products_data = require('./products.json');
var nodemailer = require('nodemailer');

app.use(myParser.urlencoded({ extended: true }));
app.use(session({ secret: "ITM352 rocks!" }));

var qs = require('qs');
var fs = require('fs');
const e = require('express');

var user_quantity_data; // make a global variable to hold the product selections until we get to the invoice

var cookieParser = require('cookie-parser');
app.use(cookieParser());



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


app.all('*', function (request, response, next) {
  //Im not sure whether I need this code or not line 75
  console.log(`Got a ${request.method} to path ${request.path}`);

  // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
  // anytime it's used
  if (typeof request.session.cart == 'undefined') { request.session.cart = {}; }

  if (typeof request.get('Referrer') != 'undefined') {
    if (!request.get('Referrer').includes('login.html')) {

      request.session.lastpage = request.get('Referrer');
    }
  }
  next();
});



app.post("/get_products_data", function (request, response) {
  response.json(products_data);
});

app.get("/add_to_cart", function (request, response) {
  var products_key = request.query['products_key']; // get the product key sent from the form post
  var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
  request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
  response.redirect('./cart.html');
});

app.post("/get_cart", function (request, response) {
  response.json(request.session.cart);
});

// to send users' products data to invoice
app.get("/confirm", function (request, response, next) {
  console.log(request.body);
  // send user to the invice.html if they login
  //send them to the login.html if they is not login
  if (typeof request.cookies['login_username'] != 'undefined') {
    response.redirect('/invoice.html?' + qs.stringify(request.query));
  }else{
    response.redirect('/login.html?'+ qs.stringify(request.query)); 
}});



app.get("/checkout", function (request, response) {
  // Generate HTML invoice string

  var invoice_str = `Thank you for your order!<table border><th>Quantity</th><th></th>`;
  var shopping_cart = request.session.cart;
  for (product_key in products_data) {
    for (i = 0; i < products_data[product_key].length; i++) {
      if (typeof shopping_cart[product_key] == 'undefined') continue;
      qty = shopping_cart[product_key][i];
      if (qty > 0) {
        invoice_str += `<tr><td>${qty}</td><td>${products_data[product_key][i].name}</td><tr>`;
      }
    }
  }
  invoice_str += '</table>';


  // Set up mail server. Only will work on UH Network due to security restrictions
  var transporter = nodemailer.createTransport({
    host: "mail.hawaii.edu",
    port: 25,
    secure: false, // use TLS
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  var user_email = user_data[request.cookies['login_username']]['email'];
  var mailOptions = {
    from: 'shiitsu@hawaii.edu',
    to: user_email,
    subject: 'Your boba receipt',
    html: invoice_str
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      invoice_str += '<br>There was an error and your invoice could not be emailed :(';
    } else {
      invoice_str += `<br>Your invoice was mailed to ${user_email}`;
    }
    response.send(invoice_str);
  });

});

//This is for register page

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
  res.redirect('/display_products.html?' + qs.stringify(req.query)); // transient data passed to invoice in a query string
});



//This is for login page




// This processed the login form 
app.post('/process_login', function (request, response, next) {
  let username_entered = request.body["username"];
  let password_entered = request.body["psw"];
  if (typeof user_data[username_entered] != 'undefined') {
    if (user_data[username_entered]['password'] == password_entered) {

      //set cookic with username after 10 min
      response.cookie('login_username', username_entered, { maxAge: 1000 * 60 * 10 });
      response.redirect(request.session.lastpage)

    } else {
      response.redirect('/login.html?' + qs.stringify(request.query));
    }
  }
});

app.get("/logout", function (request, response, next) {
  response.clearCookie("login_username");
  response.redirect(request.session.lastpage);
});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));