let token;
let authHeader;
let matchList = null;
let currPath = "";
let pathHistory = [];

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
			getContentFolder();
			
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
//refreshes the File explorer
function refreshFileExplorer() {
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

	  .deleteButton{

		padding: 10px:
		background-color: #f44336;
	  }
  
	  .folderIcon {
		margin-right: 10px;
	  }
  
	  .fileIcon {
		margin-right: 10px;
	  }
	</style>
	<script src="script.js"></script>`

	document.body.innerHTML = `
	  <header>
		<button class="logout" onclick="logout()">Logout</button>
	  </header>
	  <h1>File Explorer</h1>
	  <div id="fileExplorer"></div>
	`

	let explorerDiv = document.getElementById("fileExplorer");

	// Process the provided contents (folders/files)
	if(matchList != null){
		for (var i = 0; i < matchList.length; i++) {
			var folderDiv = document.createElement("div");
			folderDiv.className = 'explorerItem';
			

	  		var button = document.createElement('button');
	  		button.className = 'explorerItem';

			var buttonDelete = document.createElement("button");
			buttonDelete.className = "deleteButton";

			let text = matchList[i][1];
			let icon = document.createElement('span');
			icon.className = "folderIcon";
			icon.textContent = "Folder"

			if(matchList[i][2] == "dir"){
				icon.textContent = "📁";
				button.addEventListener("click", function() {
					getContentFolder(this);
				});
				buttonDelete.addEventListener("click", function() {
					deleteFolder(this);
				});
			}
			else{
				icon.textContent = "📄";
				button.addEventListener("click", function() {
					getContentFile(this);
				});
				buttonDelete.addEventListener("click", function() {
					deleteFile(this);
				});
			}
			button.setAttribute("Name",text);
	  		button.textContent = text;

			buttonDelete.setAttribute("Name",text);
			buttonDelete.textContent = "Delete";

			button.setAttribute("fileType", matchList[i][2]);

			folderDiv.appendChild(icon);
	  		folderDiv.appendChild(button);
			folderDiv.appendChild(buttonDelete);
			explorerDiv.appendChild(folderDiv);
			explorerDiv.appendChild(document.createElement('br'));
		}
	}
	//the upload button
	var uploadButton = document.createElement("button");
	uploadButton.className = "uploadButton";
	uploadButton.addEventListener("click", function() {
		uploadFile();
	});
	uploadButton.textContent = "Upload a File";
	document.body.appendChild(uploadButton);

	//the create file button
	var createFileButton = document.createElement("button");
	createFileButton.className = "createButton";
	createFileButton.addEventListener("click", function() {
		createTextFile();
	});
	createFileButton.textContent = "Create a Text File";
	document.body.appendChild(createFileButton);

	//the create Folder button
	var createFolderButton = document.createElement("button");
	createFolderButton.className = "createButton";
	createFolderButton.addEventListener("click", function() {
		createFolder();
	});
	createFolderButton.textContent = "Create a Folder";
	document.body.appendChild(createFolderButton);

	//the go back button
	var backButton = document.createElement("button");
	backButton.className = "backButton";
	backButton.addEventListener("click", function() {
		goBack();
	});
	backButton.textContent = "Go Back";
	document.body.appendChild(backButton);


}

  //resets the page to the login in website
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
	currPath = "";

}
//if no argument refreshes current Page from currPath or opens new folder if argument given
function getContentFolder(folder = null){
	var folderName = "";
	if(folder != null){
		folderName = folder.name;
	}
	var xhr = new XMLHttpRequest();
	currPath = currPath + folderName +"/"
	var url = "http://localhost:8080"+ currPath.substring(0, currPath.length - 1);

	//opens request and sets auth header
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Authorization", authHeader);

	xhr.onload = function() {
	  if (xhr.readyState == 4) {
	    if (xhr.status == 200) {
	      	// Request completed successfully
	      	var response = xhr.responseText;

			const regex = /{"Name":"(.*?)","Type":"(.*?)"}/g;
			matchList = [...response.matchAll(regex)];
			refreshFileExplorer();
	    } 
		else {
	      // Request failed
	      console.error("Request failed with status: " + xhr.status);
	    }
	  }
	};

	xhr.send();
	return false;
}
  

  function getContentFile(file)
  {
	var request = new XMLHttpRequest();
	var path = currPath + file.name +"/"
	var url = "http://localhost:8080"+ path.substring(0, path.length - 1);

	//opens request and sets auth header
	request.open("GET", url, true);
	request.setRequestHeader("Authorization", authHeader);
	request.responseType = "blob"
  
	request.onload = function () //eine if-Bedingung fuer jeden Typ
	{
		var explorerDiv = document.getElementById("fileExplorer");
		//gets the file Type of the file i.e. image or text etc. from the name ending
	  	if (file.name.includes(".mp4"))
	  	{
			var videoTag = document.createElement("video");
			videoTag.controls = true;
			videoTag.src = URL.createObjectURL(request.response);
			videoTag.type = file.fileType;
			explorerDiv.innerHTML = ""; 
			explorerDiv.appendChild(videoTag);
			explorerDiv.style.display = "block";
	  	} else if (file.name.includes(".img"))
	  	{
			var imgTag = document.createElement("img");
			imgTag.src = URL.createObjectURL(request.response);
			explorerDiv.innerHTML = ""; 
			explorerDiv.appendChild(imgTag);
			explorerDiv.style.display = "block"; 
	  	} else if (file.name.includes(".mp3"))
	  	{
			var audioTag = document.createElement("audio");
			audioTag.controls = true;
			audioTag.src = URL.createObjectURL(request.response);
			explorerDiv.innerHTML = ""; 
			explorerDiv.appendChild(audioTag);
			explorerDiv.style.display = "block"; 
	  	} else if (file.name.includes("txt"))
	  	{
			var reader = new FileReader();
			reader.onload = function ()
			{
			  var textContainer = document.createElement("pre");
			  textContainer.textContent = reader.result;
			  explorerDiv.innerHTML = ""; 
			  explorerDiv.appendChild(textContainer);
			  explorerDiv.style.display = "block"; 
			};
			reader.readAsText(request.response);
	  	}
	};
	request.send();
  }

  //deletes a file
  function deleteFile(file)
  	{
	var path = currPath + file.name;
	var url = "http://localhost:8080"+ path;

	var request = new XMLHttpRequest();
	request.open("DELETE", url);
	request.setRequestHeader("Authorization", authHeader);

	request.onload = function ()
	{
	  if (request.status === 200)
	  {
		console.log(request.response);
		getContentFolder();
	  } 
	  else
	  {
		alert(request.response);
	  }
	};

	request.send();
	return false;
}

  //deletes a folder
  function deleteFolder(file)
  	{
	var path = currPath + file.name;
	var url = "http://localhost:8080"+ path;
  
	var request = new XMLHttpRequest();
	request.open("DELETE", url);
	request.setRequestHeader("Authorization", authHeader);
  
	request.onload = function ()
	{
	  if (request.status === 200)
	  {
		console.log(request.response);
		getContentFolder();
	  } 
	  else
	  {
		alert(request.response);
	  }
	};
  
	request.send();
	return false;
  }

  function createTextFile()
  {
	var fileName = prompt("Enter the name for the new text file:");
	if (!fileName.endsWith(".txt"))
	{
	  fileName = fileName.concat(".txt");
	}
	if (fileName)
	{
	  var path = currPath + fileName;
	  var request = new XMLHttpRequest();
	  var url = "http://localhost:8080"+ path;
	  request.open("POST", url);
	  request.setRequestHeader("Authorization", authHeader);
	  request.setRequestHeader("Content-Type", "text/plain");
	  request.onload = function ()
	  {
		if (request.status === 200)
		{
			console.log(request.response);
			getContentFolder();
		} 
		else
		{
		  console.error("Failed to create text file");
		  alert("Failed to create text file");
		}
	  };
	  request.send("type=text");
	}
	return false;
  }

  function createFolder()
{
  var directoryName = prompt("Enter the name for the new directory:");
  if (directoryName)
  {
    var path = currPath + directoryName;
	var url = "http://localhost:8080"+ path;

    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader("Authorization", authHeader);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = function ()
    {
      if (request.status === 200)
      {
        console.log(request.response);
		getContentFolder();
      } 
	  else
      {
        alert("Failed to create directory");
      }
    };
    request.send("type=dir");
  }
  return false;
}

  //upload a local file from your computer
  function uploadFile()
  {
	var fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = ".*"; 
	
	fileInput.addEventListener("change", function (event)
	{
	  var file = event.target.files[0];
	  if (file)
	  {
		var reader = new FileReader();
		reader.onload = function ()
		{
		  var base64Data = reader.result.split(",")[1];
		  var requestData = "content=" + encodeURIComponent(base64Data);
		  var request = new XMLHttpRequest();
		  var path = currPath + file.name
		  var url = "http://localhost:8080"+ path;
		  request.open("POST", url);
		  request.setRequestHeader("Authorization", authHeader);
		  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  
		  request.onload = function ()
		  {
			if (request.status === 200)
			{
				console.log(request.response);
				getContentFolder();
			} 
			else
			{
			  console.error("Failed to upload file");
			  alert("Failed to upload file");
			}
		  };
  
		  request.send(requestData);
		};
		reader.readAsDataURL(file);
	  }
	});
  
	//loest Eingabedialog fuer die Datei aus
	fileInput.click();
	return false;
  }

function goBack(){
	//checks if last char in currPath is / and removes it
	if(currPath.substring(currPath.length-1, currPath.length) === "/"){
		currPath = currPath.substring(0, currPath.length-1);
	}
	//divides currentPath into levels
	var levels = currPath.substring(0, currPath.length-1).split("/");
	currPath = "";
	//rebuilds currPath without last level
	for(var i=0; i<levels.length-1;i++){
		currPath = currPath + levels[i] + "/" 
	}
	//refreshes the Page so the new path is shown
	getContentFolder();
}