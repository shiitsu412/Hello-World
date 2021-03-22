
function isNonNegInt(q, returnErrors=false){
    errors = []; // assume no errors at first
    if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    returnErrors ? errors : (errors.length == 0);
}


attributes  =  "Airi;21;MIS";
parst = attributes.sprit(';');

for(part in parts){
    console.log(isNonNegInt(part.true));
}
//console.log(parts);

function deposit(amount)
{
    console.log(typeof balance);
    //var balance =0;
    balance += amount;
    console.log("New balance is " + balance);
}
var balance =600;
deposit(50);
console.log("balance is " + balance);
*/

function isNonNegInt(val, returnErrors=false){
    errors = []; 
    if(Number(val) != val) errors.push('Not a number!'); 
    if(val < 0) errors.push('Negative value!'); 
    if(parseInt(val) != val) errors.push('Not an integer!'); 
    returnErrors ? errors : ((errors.length > 0)?false:true)
}

myArray = 'Airi;21;21.5;-21.5;'.split(".");
myArray.forEach(function(item,index){console.log(isNomMegInt(item,))});
myArray.forEach(function(item){console.log((typeof item == 'string'))});

function asyncFunction (callback){
    setTimeout(callback,0,"I'm first!");// passes foo to the call
}

asyncFunction(function(param){
    console.log(param)
});

function asyncFunction2 (foo) {
    console.log(foo);
}
asyncFunction2("I'm first2!")



console.log("No you're not!")

