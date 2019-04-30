window.onload = function() {
    document.getElementById("img_input").onchange = photoUpload;
  document.getElementById("create").onclick = query;
};

function photoUpload(e) {
    var file = e.target.files[0];
    if (!file.type.match('image.*')) {
        return false;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(arg) {
        var img = new Image(200,200);
        img.id = "photo";
        img.src = arg.target.result;
        document.getElementById("preview_box").appendChild(img);
    }
}

function query() {

    const url = "http://" + window.location.hostname + ":" + window.location.port + "/";

    var temp = window.location.href;

    var user = temp.split("?")[1];

    console.log("user = " + user);

      var username = user.split("=")[1];
      var characterName =  document.getElementById("characterName").value;
      var level =  document.getElementById("level").value;
      var role =  document.getElementById("role").value;
      var strength =  document.getElementById("strength").value;
      var constitution =  document.getElementById("constitution").value;
      var dexterity =  document.getElementById("dexterity").value;
      var intelligence =  document.getElementById("intelligence").value;
      var wisdom =  document.getElementById("wisdom").value;
      var charisma =  document.getElementById("charisma").value;
      var photofilename = document.getElementById("photo").src;

    console.log("level = " + level);

    const message = {command: "createCharacter",
            username: username,
            characterName: characterName,
            level: level,
            role: role,
            strength: strength,
            constitution: constitution,
            dexterity: dexterity,
            intelligence: intelligence,
            wisdom: wisdom,
            charisma: charisma,
            photofilename: photofilename};
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
          console.log("error creating character");
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
