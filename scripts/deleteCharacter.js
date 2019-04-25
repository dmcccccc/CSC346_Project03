window.onload = function() {
  document.getElementById("delete").onclick = query;
};

function query() {

    const url = "http://" + window.location.hostname + ":" + window.location.port + "/";

    var temp = window.location.href;

    var user = temp.split("?")[1];

    console.log("user = " + user);

      var username = user.split("=")[1];
      var characterName =  document.getElementById("characterName").value;

    const message = {command: "deleteCharacter",
            username: username,
            characterName: characterName};
    const fetchOptions = {
      method : 'POST',
      headers : {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify(message)
    };

    // POST name and comment and wait for answer from
    // server
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function(responseText) {
        if (responseText == "success"){
          window.location.href = "/user.html?" + user;
        } else {
          console.log("error deleting character");
        }
      })
      .catch(function(error) {
        console.log(error);
      });

}

  // ----------------------------------------------------------
  // when called
  // 1. check for status send back from http
  // 2. if status is between 200 and 300,
  //    then status is okay return the response
  // 3. if status is 404 or other status,
  //    then reject and sent back an error message.
  // ----------------------------------------------------------
  function checkStatus(response) {
    if(response.status >= 200 && response.status < 300) {
      return response.text();
    } else if (response.status == 404) {
      // error
      return Promise.reject(new Error("cannot find page!"));
    } else {
      return Promise.reject(new Error(response.status + ": " + response.statusText));
    }
  }
