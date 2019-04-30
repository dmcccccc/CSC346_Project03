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

    var Dropbox = require('dropbox').Dropbox;

    const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
    var ACCESS_TOKEN = 'XWBvqWaFf2AAAAAAAAAAE9GJQZZpOVL0AUhx9AFeZLx7K_jloUv7LXrLVifNbcRJ';
    var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
    var fileInput = document.getElementById('img_input');
    var file = fileInput.files[0];



    if (file.size < UPLOAD_FILE_SIZE_LIMIT) { // File is smaller than 150 Mb - use filesUpload API
        dbx.filesUpload({path: '/' + file.name, contents: file})
            .then(function(response) {
                console.log(response);
            })
            .catch(function(error) {
                console.error(error);
            });
    } else { // File is bigger than 150 Mb - use filesUploadSession* API
        const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size
        var workItems = [];

        var offset = 0;
        while (offset < file.size) {
            var chunkSize = Math.min(maxBlob, file.size - offset);
            workItems.push(file.slice(offset, offset + chunkSize));
            offset += chunkSize;
        }

        const task = workItems.reduce((acc, blob, idx, items) => {
            if (idx == 0) {
                // Starting multipart upload of file
                return acc.then(function() {
                    return dbx.filesUploadSessionStart({ close: false, contents: blob})
                        .then(response => response.session_id)
                });
            } else if (idx < items.length-1) {
                // Append part to the upload session
                return acc.then(function(sessionId) {
                    var cursor = { session_id: sessionId, offset: idx * maxBlob };
                    return dbx.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob }).then(() => sessionId);
                });
            } else {
                // Last chunk of data, close session
                return acc.then(function(sessionId) {
                    var cursor = { session_id: sessionId, offset: file.size - blob.size };
                    var commit = { path: '/' + file.name, mode: 'add', autorename: true, mute: false };
                    return dbx.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });
                });
            }
        }, Promise.resolve());
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
      var photofilename = document.getElementById('img_input')[0].name;

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
