"use strict;"

var sqlite3 = require('sqlite3').verbose();
var util = require('util');

var dbfn = './db.sqlite';

function opendb(next) {
  var db = new sqlite3.Database(dbfn,sqlite3.OPEN_READWRITE, function(err) {
    if(err) {
      console.log(err);
      process.exit(1);
    }

    console.log('database successfully opened.');

    exports.insertItemWithImages = function(prop, next) {
        db.serialize(function() {
            db.run('insert into items (title, description, link, likes, feedback, source, createtime, updatetime) values (?,?,?,?,?,"123dapp.com",strftime("%s", "now"),strftime("%s","now"))', prop.title, prop.description, prop.link, prop.likes, prop.feedback);
            db.get('Select id from items where title=?', prop.title, function(err, row){
                console.log('id='+row.id);
                for(var _i = 0; _i < prop.images.length; _i++) {
                    console.log('img link='+prop.images[_i]);
                    db.run('insert into images (item_id, image_src) values (?, ?)', row.id, prop.images[_i]);
                }
            });
        });
        next();
    }

    exports.insertItem = function(prop, next) {
      console.log('db inserting/updating:'+prop.title+' '+prop.description);
      db.get('select * from items where title=? and source="123dapp.com"', prop.title,  function(err, row){
        if(!err) {
          if(!row)  {
            db.run('insert into items (title, description, link, likes, feedback, source, createtime, updatetime) values (?,?,?,?,?,"123dapp.com",strftime("%s", "now"),strftime("%s","now"))', prop.title, prop.description, prop.link, prop.likes, prop.feedback, function(err){
              if(err) {
                console.log('ERROR inserting:', err, prop);
                next(err);
              }
              else  {
                console.log('finished inserting.');
                next();
              }
            });
          } else {
            db.get('update items set price=? , updatetime=strftime("%s","now") where addr=?', prop.price, prop.addr,  function(err, row){
              if(err) {
                console.log('ERROR updating):', err);
                next(err);
              } else  {
                console.log('finished updating.'+row);
                next();
              }
            });
          }
        } else {
          console.log('ERROR selecting:', err);
          next(err);
        }
      });
    };
    exports.insertImage = function(prop, next) {
      console.log('db inserting/images:'+prop.title+' '+prop.description);
      db.get('select * from images where id=?', prop.id,  function(err, row){
        if(!err) {
          if(!row)  {
            db.run('insert into images (item_id, image_src)', prop.id, prop.description, prop.link, prop.likes, prop.feedback, function(err){
              if(err) {
                console.log('ERROR inserting:', err, prop);
                next(err);
              }
              else  {
                console.log('finished inserting.');
                next();
              }
            });
          } else {
            console.log('image already exists.')
          }
        } else {
          console.log('ERROR selecting:', err);
          next(err);
        }
      });
    };

    exports.queryItemsCount= function(cache, next) {
      var k = 'item_total';
      var v = cache.get(k);
      if(v===null) {
          stmt = 'select count(*) as c from items where source="123dapp.com"';
          db.all(stmt,  function(err,rows){
            if(!err) {
              //console.log(rows[0]);
              cache.put(k,rows);
              next(rows);
            } else {
              console.log('[ERROR]:'+err);
            }
          });
      } else {
        next(v);  
      }
    };

    exports.queryItems= function(cache,  current, pagesize, next) {
      //console.log('limit ', (current-1)*pagesize, pagesize);
      var k = 'items-'+'-'+current+'-'+pagesize;
      var v = cache.get(k);
      if(v===null) {
      stmt = 'select * from items where source="123dapp.com" limit ?,?';
      db.all(stmt,  (current-1)*pagesize, pagesize, function(err,rows){
        if(!err) {
          //console.log(rows[0]);
          cache.put(k,rows);
          next(rows);
        } else {
          console.log('[ERROR]:'+err);
        }
      });
      } else {
        next(v);
      }
    };

    exports.queryImages= function(item_id, cache, next) {
      var k = 'iamges-'+item_id;
      var v = cache.get(k);
      if(v===null) {
      stmt = 'select * from images where item_id=?';
      db.all(stmt, item_id , function(err,rows){
        if(!err) {
          cache.put(k,rows);
          next(rows);
        } else {
          console.log('[ERROR]:'+err);
        }
      });
      } else {
        next(v);
      }
    };

   next(db);
 });
}
exports.opendb = opendb;
