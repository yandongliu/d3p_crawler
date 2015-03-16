"use strict";
var fs = require('fs');
var request = require('request');

var DEBUG = true

var headers = {
  "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
  "accept-language" : "en-US,en;q=0.8",
  "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
  //"accept-encoding" : "gzip,deflate",
};

function normalizeURL(url) {
    var link1 = url.replace(/[\/:]/g,'-');
    return link1;
} 

function debugLog(msg) {
    if (DEBUG)
        console.log(msg)
} 

function downloadUrl(url1, next){
    var options = {
        url: url1,
        headers: headers
    }
    request(options, function(error, response, body) {
        if(error) {
          console.log(error);
        } else {
            next(body)
        }
    });
}

function checkDownloaded(path, nextExist, nextNotExist) {
    debugLog('check download:'+path)
    fs.exists(path, function(exists) {
        if (exists) {
            nextExist();
        } else {
            nextNotExist();
        }
    });
}

exports.debugLog = debugLog
exports.downloadUrl = downloadUrl
exports.normalizeURL = normalizeURL
exports.checkDownloaded = checkDownloaded

console.log(exports)
