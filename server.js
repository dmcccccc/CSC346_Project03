  // require express
  const express = require("express");
  const app = express();
  
  // require fs
  const fs = require("fs");
  
  // require body-parser
  const bodyParser = require("body-parser");
  const jsonParser = bodyParser.json();
  
  var secretFile = fs.readFileSync('secret.json');
  var secret = JSON.parse(secretFile);

  // require mysql
  const mysql = require("mysql");

  var con = mysql.createConnection({
    host: secret.hostname,
    user: secret.username,
    password: secret.password,
    database: secret.database
  });

  // check connection
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
  
  // add a sha1 hash function
  const crypto = require("crypto");

  // set custom parameter
  app.use(function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Imports the Google Cloud client library
//  const {Storage} = require('@google-cloud/storage');

  // Creates a client
//  const storage = new Storage();

  // Google bucket name
//  const bucketName = 'csc346project03photo';

  require('isomorphic-fetch'); // or another library of choice.
  var Dropbox = require('dropbox').Dropbox;
  var dbx = new Dropbox({ accessToken: 'XWBvqWaFf2AAAAAAAAAAE9GJQZZpOVL0AUhx9AFeZLx7K_jloUv7LXrLVifNbcRJ' });
  dbx.filesListFolder({path: ''})
      .then(function(response) {
          console.log(response);
      })
      .catch(function(error) {
          console.log(error);
      });

  // set public access
//  app.use(express.static("public"));
  
  // post request that will store data to database
  // via mysql
  app.post('/', jsonParser, function(req, res) { 
    res.header("Access-Control-Allow-Origin", "*");
    console.log("req.body.command = " + req.body.command);
    console.log("req.body = " + JSON.stringify(req.body));

    const command = req.body.command;

    switch(command) {
      case "createAccount": {
        var username = con.escape(req.body.username);
		// only store hashed passwords
		// problem will be if user forget password it cannot be recovered
		// user forget password won't be handled for now
        const password = con.escape(crypto.createHash("sha1").update(req.body.password, "utf8").digest("hex"));
        var query = 'INSERT INTO user (username, pw) VALUES (' + username + ', ' + password+ ')';
        console.log("query = " + query);
        con.query(query, function (err, result) {
          if (err) {
            res.send("fail");
            throw err;
          }
          console.log("1 record inserted: " + query);
          res.send("success");
        });
        break;
      }
      case "createCharacter": {
        //const photofilename = con.escape(req.body.photofilename);
          // Uploads a local file to the bucket
          //storage.bucket(bucketName).upload(filename, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
              //gzip: true,
              // By setting the option `destination`, you can change the name of the
              // object you are uploading to a bucket.
              //destination: con.escape(req.body.characterName) + '.jpg',
              //metadata: {
                // Enable long-lived HTTP caching headers
                  // Use only if the contents of the file will never change
                  // (If the contents will change, use cacheControl: 'no-cache')
                  //cacheControl: 'public, max-age=31536000',
              //},
          //});
          //console.log(`${filename} uploaded to ${bucketName}.`);


        var cols = "username, characterName, lvl, role, strength, constitution,"
                   + "dexterity, intelligence, wisdom, charisma, photofilename"

        var query = 'INSERT INTO characters ('
            + cols + ')'
            + 'VALUES ('
            + con.escape(req.body.username) + ', ' + con.escape(req.body.characterName) + ', '
            + con.escape(req.body.level) + ', '
            + con.escape(req.body.role) + ', '
            + con.escape(req.body.strength) + ', '
            + con.escape(req.body.constitution) + ', '
            + con.escape(req.body.dexterity) + ', '
            + con.escape(req.body.intelligence) + ', '
            + con.escape(req.body.wisdom) + ', '
            + con.escape(req.body.charisma) + ', '
            + con.escape(req.body.photofilename) + ')';
        console.log("query = " + query);
        con.query(query, function (err, result) {
          if (err) {
            res.send("fail");
            throw err;
          }
          console.log("1 record inserted: " + query);
          res.send("success");
        });
        break;
      }
      case "deleteCharacter": {
        var username = con.escape(req.body.username);
        var characterName = con.escape(req.body.characterName);
        var query = 'DELETE FROM characters WHERE username=' + username + ' AND characterName=' + characterName;
        console.log("query = " + query);
        con.query(query, function (err, result) {
          if (err) {
            res.send("fail");
            throw err;
          }
          console.log("1 record inserted: " + query);
          res.send("success");
        });
        break;
      }

      default: {
        console.log("invalid command");
        break;
      }
    }

  });

  app.use(express.static("."));

  // get request get will read all comments from a file called 
  // messages.txt and sent it back to the client
  app.get('/', function(req, res){ 
    res.header("Access-Control-Allow-Origin", "*");
    const command = req.query.command;

    console.log("command = " + command);
    // Only 1 case exist right now
    switch(command){
      // get all comment and sent it back as JSON
      case "query": {
        var username = con.escape(req.query.username);
        const password = crypto.createHash("sha1").update(req.query.password, "utf8").digest("hex");
        var query = 'SELECT * FROM user WHERE username =' + username;
        console.log("query = " + query);
        con.query(query, function (err, result, fields) {
          if (err) throw err;
          console.log("result = " + result[0]);
          if (result[0] == undefined){
            res.send("fail");
            return;
          }
          console.log(result);
          console.log(password);
          if (result[0].pw == password){
            res.send("success");
          } else {
            res.send("fail");
          }
        });
        break;
      }
      case "getCharacters": {


        console.log("getting characters...");
        var username = con.escape(req.query.username);
        console.log("username = " + username);

        var query = 'SELECT * FROM characters WHERE username=' + username;
        con.query(query, function(error, result, fields) {
          console.log(result);
          res.send(JSON.stringify(result));
        });
        break;
      }
      case "getCharacter": {
        console.log("getting character...");
        var id = con.escape(req.query.id);
        console.log("id = " + id);

        var query = 'SELECT * FROM characters WHERE id=' + id;
        con.query(query, function(error, result, fields) {
          console.log(result);
          res.send(JSON.stringify(result));
        });
        break;
      }
      default: {
        res.sendFile("./login.html", {root: __dirname});
        break;
      }
    }
  });

  app.listen(3000);
