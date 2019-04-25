window.onload = function(){
  document.getElementById("createAccount").onclick = createAccount;
};

function createAccount(){
  const user = document.getElementById("username").value;
  const pw = document.getElementById("password").value;

  // ask for the current url to run query with
  const url = "http://" + window.location.hostname + ":" + window.location.port + "/";

  const message = {
    command : "createAccount",
    username : user,
    password : pw
  };

  const fetchOptions = {
    method : 'POST',
    headers : {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify(message)
  };

  console.log("client query message = " + message);

  fetch(url, fetchOptions)
    .then(checkStatus)
    .then(function(responseText) {
      console.log("responseText = " + responseText);
      if (responseText == "success"){
        window.location.href = '/login.html';
      } else {
        console.log("Fail to create Account!");
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response.text();
  } else if (response.status == 404) {
    return Promise.reject(new Error("cannot find page!"));
  } else {
    return Promise.reject(new Error(response.status + ": " + response.statusText));
  }
}
