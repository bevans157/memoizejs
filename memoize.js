/*! MemoizeJS v0.1.0-alpha: https://github.com/bevans157/memoizejs */
/*
 * Copyright 2015, Ben Evans
 * Released under the MIT License.
 */

(function(global) {
    // global is window when running in the usual browser environment.

    "use strict";

    if (global.memoize) { return; } // Memoize already loaded

    //===============
    // Top-level vars
    //===============
    var cacheMode = 'LOCALSTORAGE'; // Defualt 'MEMORY', other values LOCALSTORAGE
    var cacheLimit = 1000; // Number of entries allowed in the cache (must be greater than 2
    var cache = {};
    var defaultTTL = 2*60*60*1000; // 2 hours

    //==========
    // Utilities
    //==========

    //
    // Generate a hash to index the Force an include to a target DOM element
    function keyGen(args) {
        var hash = '';
        var argsLen = args.length;
        for (var i = 0; i < argsLen; i++) {
            hash += hashCode(forceString(args[i])).toString();
        }
        return hash;
    };

    //
    // Force data to string
    function forceString(obj) {
        var type = typeof obj;
        switch (type) {
            case 'string':
                return obj;
                break;
            case 'undefined':
                return 'undefined';
                break;
            case 'function':
                try {return obj.toString();}
                catch (e) {
                    try {return obj.toSource();}
                    catch (e) {return "" + obj + "" ;}
                }
                break;
            case 'symbol':
            case 'object':
            case 'number':
            case 'boolean':
                try {return obj.toString();}
                catch (e) {return "" + obj + "" ;}
                break;
            default:
                return "" + obj + "";
        }
    }

    //
    // Generate Hash from string
    function hashCode(str) {
        var hash = 0, i, chr, len;
        if (str.length == 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };


    //=====
    // Main
    //=====

    // Force an include to a target DOM element
    global.memoize = function (func, args, ttl) {
        if (!func) {return;}
        if (!args) {args = [];}
        if (!ttl) {ttl = defaultTTL;}
        var key = keyGen( [func].concat(args) );
        if (checkCache(key, ttl)){
            return getCache(key);
        }
        else {
            var output = func.apply(this, args);
            setCache(key, output);
            return output;
        }
    };

    //
    // Set a value directly in the cache
    global.memoizeSet = function (key, val) {
        return setCache(key, val);
    };

    //
    // Check for a value in the cache
    global.memoizeCheck = function (key, ttl) {
        if (!ttl) {ttl = defaultTTL;}
        return checkCache(key, ttl);
    };

    //
    // Retrieve a value from the cache
    global.memoizeGet = function (key, ttl) {
        if (!ttl) {ttl = defaultTTL;}
        return getCache(key, ttl);
    };

    //
    // Generate a unique key for cache handling
    global.memoizeKey = function (args) {
        return keyGen(args);
    };

    //
    // Generate a unique key for cache handling
    global.memoizeConfig = function (args) {
        if (!args) {
            return {
                'mode': cacheMode,
                'limit': cacheLimit,
                'ttl': defaultTTL
            }

        }
        else {
            if (args && args['mode']) {
                cacheMode = args['mode'];
            }
            if (args && args['limit']) {
                cacheMode = args['limit'];
            }
            if (args && args['ttl']) {
                cacheMode = args['ttl'];
            }
            return;
        }
    };



    //=============
    // Cache Memory
    //=============

    //
    // Sort cache keys by age
    function cacheSort(a, b) {
        try {
            if ( cache[a]['age'] > cache[b]['age'] ) {
                return -1;
            }
            if ( cache[b]['age'] > cache[a]['age'] ) {
                return 1;
            }
        }
        catch (e) {}
        // a must be equal to b
        return 0;
    }

    //
    // Set cache value
    function setCache(key, val){
        cacheGetStorage();
        var d = new Date();
        var cacheSize = Object.keys(cache).length;
        if (cacheSize > cacheLimit) {
            var newCacheLimit = Math.floor(cacheLimit * 0.9);
            var keyCount = 0
            Object.keys(cache).sort(cacheSort).forEach(function(v, i) {
                keyCount++;
                if (keyCount > newCacheLimit) {
                    delete cache[v];
                }
            });
        }
        cache[key] = {
            'value':val,
            'age':d.getTime()
        };
        cacheSetStorage();
    }

    //
    // Check cache
    function checkCache(key, ttl){
        cacheGetStorage();
        var d = new Date();
        if (!ttl) {ttl = d.getTime();}
        if (cache[key] && cache[key]['age'] && cache[key]['age'] > (d.getTime()-ttl) ) {
            return true;
        }
        return false;
    }

    //
    // Get cache
    function getCache(key, ttl){
        cacheGetStorage();
        var d = new Date();
        if (!ttl) {ttl = d.getTime();}
        if (cache[key] && cache[key]['age'] && cache[key]['age'] > (d.getTime()-ttl) ) {
            return cache[key]['value'];
        }
        return false;
    }

    //
    // Get cache
    function cacheGetStorage() {
        if (cacheMode == 'MEMORY'){
            // Do Nothing
        }
        if (cacheMode == 'LOCALSTORAGE'){
            try {
                cache = JSON.parse(window.localStorage.getItem("memoizejs"));
                if (!(typeof cache === 'object')){
                    cache = {}
                }
            }
            catch (e){
                cache = {}
            }
        }
    }


    function cacheSetStorage() {
        if (cacheMode == 'MEMORY'){
            // Do Nothing
        }
        if (cacheMode == 'LOCALSTORAGE'){
            window.localStorage.setItem("memoizejs", JSON.stringify(cache));
        }
    }







})(this);