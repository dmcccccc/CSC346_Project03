window.onload = function(){
    query();
}

var id;

// TODO: Display all the character from SQL(get array of Object from SQL)
function query(){

    const url = "http://" + window.location.hostname + ":" + window.location.port + "/";

    var temp = window.location.href;

    var user = temp.split("?")[1];

    const query = "?command=getCharacters&" + user;

    console.log("user = " + user);

    fetch(url + query)
      .then(checkStatus)
      .then(function(responseText) {
        let q = JSON.parse(responseText);
        displayTable(q);
    })
    .catch(function(error) {
      console.log(error);
    });

}



function displayTable(result) {
    result.forEach(displayCharacter);
/*
    document.getElementById("characterName").innerHTML=result[0].characterName;
    document.getElementById("level").innerHTML=result[0].lvl;
    document.getElementById("role").innerHTML=result[0].role;
*/
}

    function displayCharacter(value) {
        var table = document.getElementById("characterTable");
        var row = table.insertRow(1);
        var characterName = row.insertCell(0);
        var role = row.insertCell(1);
        var level = row.insertCell(2);
        var buttonRow = row.insertCell(3);
        characterName.innerHTML = value.characterName;
        role.innerHTML = value.role;
        level.innerHTML = value.lvl;
        var button = document.createElement("button");
        button.innerHTML="Select";
        button.setAttribute("onclick","goToCharacter()");
        button.setAttribute("id",value.id);
        buttonRow.appendChild(button);
    }

    function createNewCharacter() {
        var temp = window.location.href;

        var user = temp.split("?")[1];
        window.location.href = "createNewCharacter.html?" + user;
    }

    function deleteCharacter() {
        var temp = window.location.href;

        var user = temp.split("?")[1];
        window.location.href = "deleteCharacter.html?" + user;
    }

    // TODO: Character name onclick direct to character.html and fill the table with data from SQL
    function goToCharacter() {
        var temp = window.location.href;

        var user = temp.split("?")[1];

        console.log("this is " + this.event.target);

        var id = this.event.target.getAttribute("id");
        console.log("id = " + id);

        window.location.href = "character.html?" + user + "&id=" + id;
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
