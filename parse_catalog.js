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

var _hrefs = new Array()

//parse a catelog page
function parsePage(data, hrefs, next) {
    var $ = cheerio.load(data)
    $('a.thumbnail-img').each(function(i, ele) {
        var href = $(ele).attr('href');
        //utils.debugLog(href)
        hrefs.push(href)
    });
    next(hrefs)
}

function downloadLink(hrefs, i) {
    if (i >= hrefs.length) return;
    var norm_url = utils.normalizeURL(hrefs[i])
    var fnw = CACHE_PAGE + norm_url
    utils.checkDownloaded(fnw, function() {
        console.log('file has been downloaded:', fnw)
        downloadLink(hrefs, i+1)
    }, function() {
        utils.downloadUrl(hrefs[i], function(body) {
            fs.writeFile(fnw, body, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log(fnw+" was saved!");
                }
            });
            setTimeout(function(hrs, index) {
                downloadLink(hrs, index+1);
            }, WAIT+Math.random()*5000, hrefs, i);
        });
    });
}

//read a single file
function readFile(files, hrefs, i) {
  if(i>=files.length) {
    //utils.debugLog(hrefs)
    downloadLink(hrefs, 0);
    return;
  }
  fs.readFile(CACHE_CATALOG+'/'+files[i], 'utf8', function (err,data) {
    if (err) {
      console.log('ERROR:',i, err);
    }
    console.log('parsing '+files[i]);
    parsePage(data, hrefs, function(hrefs) {
      readFile(files, hrefs, i+1);
    });
  });
}

//iterate thru all files
fs.readdir(CACHE_CATALOG, function(err, files) {
    console.log('#files', files.length);
    readFile(files, _hrefs, 0);
});
