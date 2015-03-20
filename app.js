
"use strict;"
/**
 * Module dependencies.
 */

process.setMaxListeners(0);
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err); 
});

Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

/*
var cache={}; 
function cacheGet(k) {
  var v = cache[k];
  return v;
}
function cacheSet(k,v) {
  cache[k]=v;
}
*/

var express = require('express'),
  routes = require('routes'),
  http = require('http'),
  model = require('./db_sqlite.js'),
  pagination = require('pagination'),
  async = require('async'),
  path = require('path');

var cache = require('memory-cache');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.compress());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use('/static', express.static(path.join(__dirname, '/public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

model.opendb(function(db) {
  console.log('successfully opened db.'+db);
  app.get('/', function(req, res){
    console.log(req.connection.remoteAddress);
    var order=req.query.order||'ctime desc';
    var pagesize=parseInt(req.query.pagesize)||10;
    var current=parseInt(req.query.page)||1;
    async.series([
      function(cb) {
        model.queryItemsCount(cache, function(items) {
          console.log('total:'+items[0].c);
          cb(null, items[0].c);
        });
      },
      function(cb) {
        model.queryItems(cache, current, pagesize, function(items) {
            items.forEach(function(item) {
                //console.log(item.title);
            });
          cb(null, items);
        });
      },
    ],
    function(err,results) {
      if(err) {
        res.send(err);
      } else {
        var paginator = new pagination.SearchPaginator({prelink:'/', current: current, rowsPerPage: pagesize, totalResult: results[0]});
        async.each(results[1], function(item, cb){
            model.queryImages(item.id, cache, function(images) {
                item.images = new Array();
                for(var i=0; i<images.length; i++) {
                    item.images.push(images[i].image_src);
                }
                cb();
            });
        }, function(err) {
            console.log(results[1]);
            res.render('index', {
              total: results[0],
              items: results[1],
              pageData:paginator.getPaginationData(),
            }); 
        });
      }
    });

  });//end of get /

  app.get('/cache', function(req, res){
    str=''
    keys = cache.keys();
    
    res.send(keys.join('<br/>'));
  }); 

});//opendb



app.get('/about', function(req, res){
  console.log(req.query);
  res.render('about', {
    title: 'About'
  });
});

app.get('/contact', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//model.close();

