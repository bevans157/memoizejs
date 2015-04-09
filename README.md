# MemoizeJS
A javascript library offering plug-in, in memory, client side, cacheing for javascript methods

MemoizeJS supports:

* Caching function calls results based on arguments
* Custom TTL
* Cache flushing
* Cache size limitations
* Last in last out cache cleaning

## Code examples

The concept is to be able to wrap simple function calls and argument set with "memoize" allowing the memoize logic to
determine if the call has a cached value that can be returned or if the code should be executed as normal.

```
// Original Method
function getFullURL(link) {
    var parser = document.createElement('a');
    parser.href = link;
    return parser.href;
};
//
//
// Normal call
full_link = getFullURL('../../somepage.html');
//
//
// Memoized call
// memoize(FUNCTION, ARGS ARRAY, [TTL])
full_link = memoize(getFullURL, ['../../somepage.html']);
//
//
// Memoized integrated call
{ // exmaple of JQuery ajax call modded to use memoize cache support
    var cacheKey = memoizeKey(["my ajax call", "ajax/test.json"]); // Generates a unique cache key
    if (memoizeCheck(cacheKey)) {
        handleResult( memoizeGet(cacheKey) );
    }
    $.getJSON( "ajax/test.json", function( data ) {
        memoizeSet(cacheKey, data);
        handleResult(data);
    });
}
```

NOTE:

The Args are passed as an array, and the TTL value is optional. by default a TTL of 1 day is used. The combination of
function and args are used as a cache key, thus changing either will result in a different cache value.

When generating your oen keys it is recommended that you supply a tag or unique method name, followed by the arguments.

By default 1000 items may be stored in the cache at any time, when full the library will expunge the oldest 10% of
array records.

## Setup

In order to develop this and run the demo's I use :

```
https://github.com/nodeapps/http-server
```

Installed using NPM as follows:

```
npm install http-server -g
```

## Development

Run the http-server

```
http-server ./ -p 9191
```

Point browser at http://localhost:9191/demos/demo1.html


## Deployment

Using https://github.com/mishoo/UglifyJS2

```
npm install uglify-js -g
```

```
uglifyjs ./memoize.js -o ./memoize.min.js -c -m
```
