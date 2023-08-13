let token;
let authHeader;

function login(event) 
{
	event.preventDefault(); // Prevents the form from submitting normally
  
	// Retrieve the values from the input fields
  	let username = document.getElementById("username").value;
  	let password = document.getElementById("password").value;
  
  	let logInRequest = new XMLHttpRequest();
  	let url = "http://localhost:8080/login";
  	let params = `username=${username}&password=${password}`;

  	logInRequest.open("POST", url, true);
  	logInRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  	logInRequest.onreadystatechange = function() {
  		if (logInRequest.readyState == 4 && logInRequest.status == 200) {
    		// Request completed successfully
      		let response = logInRequest.responseText;
      
    		// Putting response in right format
      		response = response.split(":");
      		response = response[1].trim();
      		response = response.substring(1, response.length-2);
			//creates the correct authCode and base64 encodes it
			token = response;
			authHeader = "Basic "+btoa(username + ":" + response);

      		document.getElementById("error").innerText = "";
			//gets the folders of the basic page
			let stuff = getContentFolder();
			showFileExplorer();
    	}
    	else if (logInRequest.readyState == 4 && logInRequest.status == 401) {
      		//if login data wrong status is 401 Unauthorized
      		document.getElementById("error").innerText = "Wrong credentials";

    	}
  	};

  	logInRequest.send(params);
  	// You can redirect to another page or perform any other action here
  
  	return false;
  }


function logout(){
  	//Function to logout or invalidade the current token
	var logOutRequest = new XMLHttpRequest();
	var url = "http://localhost:8080/logout";

	//opens request and sets auth header
	logOutRequest.open("GET", url, true);
	logOutRequest.setRequestHeader("Authorization", authHeader);
	
	logOutRequest.onreadystatechange = function() {
	if (logOutRequest.readyState == 4) {
	  if (logOutRequest.status == 200) {
		// Request completed successfully
		var response = logOutRequest.responseText;
		// Process the response as needed
		resetToLogin();
	  } 
	  else {
		// Request failed
		console.error("Request failed with status: " + logOutRequest.status);
	  }
	}
	};
	
	logOutRequest.send();

	return false;
}

function getContentFolder(folderName = ""){
	var xhr = new XMLHttpRequest();
	var url = "http://localhost:8080/"+folderName;

	//opens request and sets auth header
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Authorization", authHeader);

	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
	    if (xhr.status == 200) {
	      // Request completed successfully
	      var response = xhr.responseText;
	      console.log(response);
	      // Process the response as needed
	    } 
		else {
	      // Request failed
	      console.error("Request failed with status: " + xhr.status);
	    }
	  }
	};

	xhr.send();
}

function showFileExplorer(contents = null) {
	// Clear the existing content
	document.body.innerHTML = '';
	document.head.innerHTML = `
	<title>File Explorer</title>
	<style>
	  body {
		font-family: Arial, sans-serif;
		background-color: #f4f4f4;
		margin: 0;
		padding: 0;
	  }
  
	  header {
		background-color: #333;
		color: white;
		padding: 10px;
		display: flex;
		justify-content: flex-end;
	  }
  
	  button.logout {
		background-color: #d9534f;
		color: white;
		border: none;
		padding: 5px 10px;
		cursor: pointer;
	  }
  
	  h1 {
		text-align: center;
		margin-top: 20px;
	  }
  
	  #fileExplorer {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
	  }
  
	  .explorerItem {
		padding: 10px;
		border-bottom: 1px solid #ccc;
		display: flex;
		align-items: center;
		cursor: pointer;
	  }
  
	  .folderIcon {
		margin-right: 10px;
	  }
  
	  .fileIcon {
		margin-right: 10px;
	  }
  
	  /* Add more styling as needed */
	</style>
	<script src="script.js"></script>`

	document.body.innerHTML = `
	  <header>
		<button class="logout" onclick="logout()">Logout</button>
	  </header>
	  <h1>File Explorer</h1>
	  <div id="fileExplorer"></div>
	`

	//let explorerDiv = document.body.getElementById("fileExplorer");

	// Process the provided contents (folders/files)
	if(contents != null){
		for (var i = 0; i < contents.length; i++) {
	  	var item = document.createElement('div');
	  	item.className = 'explorerItem';
	  	item.textContent = contents[i];
	  	explorerDiv.appendChild(item);
		}
	}
	// You can add your CSS styling here or link to an external stylesheet
  }

  function resetToLogin() {
	document.head.innerHTML = `<title>Login Page</title>
	<style>
	  body {
		font-family: Arial, sans-serif;
		text-align: center;
	  }
  
	  header {
		display: flex;
		justify-content: flex-end;
		padding: 10px;
	  }
  
	  form {
		margin-top: 50px;
	  }
  
	  input[type="text"], input[type="password"] {
		padding: 10px;
		margin-top: 10px;
	  }
  
	  input[type="submit"] {
		padding: 10px 20px;
		background-color: #4CAF50;
		color: white;
		border: none;
		cursor: pointer;
	  }
  
	  button.logout {
		padding: 5px 10px;
		background-color: #f44336;
		color: white;
		border: none;
		cursor: pointer;
	  }
	</style>
	<script src="skript.js"></script>`

	document.body.innerHTML = `
	  <h1>Login</h1>
	  <form onsubmit="return login(event)">
		<input type="text" id="username" placeholder="Username" required>
		<br>
		<input type="password" id="password" placeholder="Password" required>
		<br>
		<br>
		<input type="submit" value="Login">
	  </form>
	  <p id ="error" style="color: red;"></p>
	`;

  }
  