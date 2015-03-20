//download from catelog pages
"use strict";

var fs = require('fs');
var request = require('request');
var util = require('util');
var utils = require('./utils.js');

var WAIT=20000
var CACHE_DIR = 'cache/catalog/'
var DEBUG = true

var url = 'http://www.123dapp.com/Gallery/page/%d/content/all' 

function downloadPage(page) {
    console.log('=== downloading page: ' + page)
    var url1 = util.format(url,page)
    console.log(url1)
    var norm_url = utils.normalizeURL(url1)
    var fnw = CACHE_DIR+norm_url
    utils.checkDownloaded(fnw, function() {
        console.log('file has been downloaded:', fnw)
        downloadPage(page+1);
    }, function() {
        utils.downloadUrl(url1, function(body) {
            console.log('writing file:', fnw)
            fs.writeFile(fnw, body, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log(fnw+" was saved!");
                }
            });
            setTimeout(function(page) {
                downloadPage(page+1);
            }, WAIT+Math.random()*5000, page);
        });
    })
} 

downloadPage(1)
