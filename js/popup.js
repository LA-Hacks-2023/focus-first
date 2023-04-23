/*******************************************************************************
Copyright (C) 2015 Adrien Coppola

This file is part of Focus Mode.

Focus Mode is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Focus Mode is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Focus Mode.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************/

(function(){
  var storage = chrome.storage;

  /* Update the value of the button */
  function updateOnButton(){
    var onButton = document.getElementById("onButton");

    storage.local.get("on", function(item){
      if(item.on === true){
        onButton.innerText = "Release";
      }
      else {
        onButton.innerText = "Restrict";
      }
    });
  }

  /* Update icon to show the extension state */
  function updateIcon(){
    storage.local.get("on", function(item){
      if(item.on === true){
        chrome.browserAction.setIcon({"path": "../images/restrict.png"});
      }
      else {
        chrome.browserAction.setIcon({"path": "../images/release.png"});
      }
    });
  }

  /* Activate or Deactivate the work mode */
  function onButtonClick(){
    storage.local.get(["on", "blocked"], function(item){
      console.log(item.on);
      var on;

      if(item.on === undefined || item.on === false){
        on = true;
      }
      // else {
      //   on = false;
      // }

      storage.local.set({"on": on, "blocked": 0});

      updateOnButton();
      updateIcon();
    });
  }

  // receive message to toggle button once homework is good enough
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.switch === "off")
        updateOnButton();
        updateIcon();
      console.log("off received")
    }
  );

  /* Open the options tab */
  function optionsButtonClick(){
    chrome.tabs.create({"url": "html/settings.html"});
  }

  /* Upload the file that MIGHT unlock your predicament */
  function uploadButtonClick(){
    var fileInput = document.getElementById("fileInput");
    var file = fileInput.files[0];
    //console.log('dickandballs');
    imageToText(file);
    var formData = new FormData();
    formData.append("file", file);
    chrome.runtime.sendMessage({type: "upload", data: formData});
  }

  async function imageToText(file) {
    if (!file) {
      alert('Please select an image file.');
      return;
    }
  
    try {
      // Encode the image as a base64 string
      console.log('trying');
      const reader = new FileReader();
      reader.onloadend = async function () {
        console.log('sent to background path');
        const encodedImage = reader.result.split(',')[1];
  
        // Set up the API request headers
        const headers = {
          
          'Content-Type': 'application/json',
          'app_id': 'jeongjooho1995_gmail_com_1f0f89_a1c675',
          'app_key': '6c9826233604a6aaf8a6f2f1816e1474a779fc2c85b2d41324887be8061a5c43'
        };
  
        // Set up the API request payload
        const payload = {
          
          src: `data:image/png;base64,${encodedImage}`,
          formats: ['text'],
          data_options: {
            include_asciimath: true,
            include_latex: true
          }
        };
        console.log('tset up payload');
        // Send the request to the API using the background script
        chrome.runtime.sendMessage(
          {
            type: 'fetchMathpix',
            url: 'https://api.mathpix.com/v3/text',
            options: {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(payload),
            },
          },
          //console.log('response?');
          (response) => {
            console.log('response.');
            if (response.success) {
              const result = response.data;
              // Check if the result has the desired property and extract the text
              if (result.text) {
                console.log('ur there');
                const text = result.text;
                console.log('Extracted text:', text);
              } else {
                console.error(
                  'Error: The response does not have the expected structure. Response:',
                  JSON.stringify(result, null, 2)
                );
              }
            } else {
              console.error('Error:', response.error);
            }
          }
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  

  /* update the number of attempts */
  function updateAttempts(){
    var nbAttempts = 0;

    storage.local.get("blocked", function(item){
      if(item.blocked !== undefined){
        nbAttempts = item.blocked;
      }

      var number = document.getElementsByTagName("number")[0];
      number.innerText = nbAttempts;
    });
  }

  //Update on each popup openning
  updateAttempts();
  updateOnButton();
  updateIcon();

  /* Attach onclick functions */
  var onButton = document.getElementById("onButton");
  var optionsButton = document.getElementById("optionsButton");
  var uploadButton = document.getElementById("uploadButton");

  onButton.addEventListener("click", onButtonClick);
  optionsButton.addEventListener("click", optionsButtonClick);
  uploadButton.addEventListener("click", uploadButtonClick);
})();
