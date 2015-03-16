//parse catalog pages
"use strict";

var fs = require('fs');
var request = require('request');
var util = require('util');
var cheerio = require ('cheerio')
var utils = require ('./utils.js')

var WAIT=3000
var CACHE_PAGE = 'cache/page/'
var CACHE_CATALOG = 'cache/catalog/'

//parse a catelog page
function parsePage(data, next) {
    var $ = cheerio.load(data)
    var hrefs = new Array()
    $('a.thumbnail-img').each(function(i, ele) {
        var href = $(ele).attr('href');
        utils.debugLog(href)
        var norm_url = utils.normalizeURL(href)
        var fnw = CACHE_PAGE + norm_url
        //hrefs.push(href)
        utils.checkDownloaded(fnw, function() {
            console.log('file has been downloaded:', fnw)
        }, function() {
            utils.downloadUrl(href, function(body) {
                fs.writeFile(fnw, body, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(fnw+" was saved!");
                    }
                });
                setTimeout(function() {
                }, WAIT+Math.random()*5000);
            });
        });
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
