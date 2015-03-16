//parse catalog pages
"use strict";

var fs = require('fs');
var request = require('request');
var util = require('util');
var cheerio = require ('cheerio')

var WAIT=3000
var CACHE_DIR = 'cache/page/'
var CACHE_CATALOG = 'cache/catalog/'
var DEBUG = true 

var headers = {
  "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
  "accept-language" : "en-US,en;q=0.8",
  "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
  //"accept-encoding" : "gzip,deflate",
};

function debugLog(msg) {
    if (DEBUG)
        console.log(msg)
} 

//parse a catelog page
function parsePage(data, next) {
    var $ = cheerio.load(data)
    var hrefs = new Array()
    $('a.thumbnail-img').each(function(i, ele) {
        var href = $(ele).attr('href');
        debugLog(href)
        hrefs.push(href)
    });
    next(hrefs)
}

//read a single file
function readFile(files, i) {
  if(i>=files.length) return;
  fs.readFile(CACHE_CATALOG+'/'+files[i], 'utf8', function (err,data) {
    if (err) {
      console.log('ERROR'+ err);
    }
    console.log('parsing '+files[i]);
    parsePage(data, function(hrefs) {
      readFile(files, i+1);
    });
  });
}

//iterate thru all files
fs.readdir(CACHE_CATALOG, function(err, files) {
    console.log('#files', files.length);
    readFile(files, 0);
});
