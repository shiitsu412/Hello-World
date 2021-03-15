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

