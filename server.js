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


  // set custom parameter
  app.use(function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept");
    next();
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
        var username = req.body.username;
        const password = req.body.password;
        var query = 'INSERT INTO user (username, pw) VALUES (\'' + username + '\', \'' + password + '\')';
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

        var cols = "username, characterName, lvl, role, strength, constitution,"
                   + "dexterity, intelligence, wisdom, charisma"

        var query = 'INSERT INTO characters ('
            + cols + ')'
            + 'VALUES (\''
            + req.body.username + '\', \'' + req.body.characterName + '\' ,'
            + req.body.level + ', \''
            + req.body.role + '\', '
            + req.body.strength + ', '
            + req.body.constitution + ', '
            + req.body.dexterity + ', '
            + req.body.intelligence + ', '
            + req.body.wisdom + ', '
            + req.body.charisma + ')';
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
        var username = req.body.username;
        var characterName = req.body.characterName;
        var query = 'DELETE FROM characters WHERE username=\'' + username + '\' AND characterName=\'' + characterName + '\'';
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
        var username = req.query.username;
        const password = req.query.password;
        var query = 'SELECT * FROM user WHERE username = \'' + username + '\'';
        console.log("query = " + query);
        con.query(query, function (err, result, fields) {
          if (err) throw err;
          console.log("result = " + result[0]);
          if (result[0] == undefined){
            res.send("fail");
            return;
          }
          console.log(result[0].pw.length);
          console.log(password.length);
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
        var username = req.query.username;
        console.log("username = " + username);

        var query = 'SELECT * FROM characters WHERE username=\'' + username + '\'';
        con.query(query, function(error, result, fields) {
          console.log(result);
          res.send(JSON.stringify(result));
        });
        break;
      }
      case "getCharacter": {
        console.log("getting character...");
        var id = req.query.id;
        console.log("id = " + id);

        var query = 'SELECT * FROM characters WHERE id=\'' + id + '\'';
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
