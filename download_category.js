var fs = require('fs');
var request = require('request');
var util = require('util');

WAIT=3000
CACHE_DIR = 'cache/'
DEBUG = true

url = 'http://www.123dapp.com/Gallery/page/%d/content/all'

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

function normalizeURL(url) {
    var link1 = url.replace(/\//g,'-');
    return link1;
} 

function downloadPage(page) {
    console.log('=== downloading page: ' + page)
    url1 = util.format(url,page)
    var options = {
        url: url1,
        headers: headers
    }
    console.log(url1)
    var norm_url = normalizeURL(url1)
    var fnw = CACHE_DIR+norm_url
    checkDownloaded(fnw, function() {
        console.log('file has been downloaded:', fnw)
        downloadPage(page+1);
    }, function() {
        request(options, function(error, response, body) {
            if(error) {
              console.log(error);
            } else { 
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
            }
        });
    })
} 

downloadPage(1)
