const smart = require( "./dist/smart_callout.js");

console.log(Object.keys(smart), typeof smart.smart_callout, {module: {
    type: typeof module,
    keys: Object.keys(module)
}});


