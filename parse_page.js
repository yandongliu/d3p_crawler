//parse pages
"use strict";

var fs = require('fs');
var request = require('request');
var util = require('util');
var cheerio = require ('cheerio')
var utils = require ('./utils.js')
var db = require('./db_sqlite.js')

var WAIT=3000
var CACHE_PAGE = 'cache/page/'
var CACHE_CATALOG = 'cache/catalog/'

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

//parse an item page
function parsePage(data, next) {
    var $ = cheerio.load(data)
    var prop = {}
    prop['images'] = new Array();
    $('link[rel="canonical"]').each(function(i, ele) {
        prop['link'] = $(ele).attr('href')
    });
    $('span.AssetFullPreviewAssetName').each(function(i, ele) {
        prop['title'] = $(ele).text()
    });
    $('p.AssetFullPreviewDesc').each(function(i, ele) {
        prop['description'] = $(ele).text()
    });
    $('span.FavoriteCount').each(function(i, ele) {
        prop['favcount'] = $(ele).text()
    });
    $('.AssetPrivate+ .text-center h4').each(function(i, ele) {
        prop['feedback'] = $(ele).text()
    });
    $('.mt-20+ .overview .panel-body').each(function(i, ele) {
        prop['misc'] = $(ele).html()
    });
    $('#previewThumb .img-responsive').each(function(i, ele) {
        var src = $(ele).attr('src'); 
        prop['images'].push(src)
        //utils.debugLog(src)
    });
    console.log(prop)
    next(prop)
}

function insertToDB(item) {
    console.log('insert to db', item)
}

//read a single file
function readFile(files, i) {
  if(i>=files.length) {
    return;
  }
  if(i>=2) {
    //return;
  }
    if (files[i].endsWith('.swp')) {
        readFile(files,i+1)
        return
    }
  fs.readFile(CACHE_PAGE+'/'+files[i], 'utf8', function (err,data) {
    if (err) {
      console.log('ERROR:',i, err);
    }
    console.log('parsing '+files[i]);
    parsePage(data, function(prop) {
        if(prop['title'] == undefined)
            prop['title'] = 'untitled'
        db.insertItemWithImages(prop, function(err) {
            if(err) {
                console.log('ERROR:'+err);
            }
            //db.insertImages(prop, function(err) {
                //if(err) {
                    //console.log('ERROR:'+err);
                //}
                readFile(files, i+1);
            //});
        })
    });
  });
}

db.opendb(function(_db) { 
    //iterate thru all files
    fs.readdir(CACHE_PAGE, function(err, files) {
        console.log('#files', files.length);
        readFile(files, 0);
    });
}); 
