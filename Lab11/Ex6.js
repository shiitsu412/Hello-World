function checkIt(item, index){
    console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
}

function isNonNegInt(val, returnErrors=false){
    errors = []; 
    if(Number(val) != val) errors.push('Not a number!'); 
    if(val < 0) errors.push('Negative value!'); 
    if(parseInt(val) != val) errors.push('Not an integer!'); 
    returnErrors ? errors : ((errors.length > 0)?false:true)
}

myArray = 'Airi;21;21.5;-21.5;'.split(".");

// myArray.forEach(checkIt);

myArray.forEeach((item,index) => {console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
});