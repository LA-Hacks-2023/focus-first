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
      else {
        on = false;
      }

      storage.local.set({"on": on, "blocked": 0});

      updateOnButton();
      updateIcon();
    });
  }

  /* Open the options tab */
  function optionsButtonClick(){
    chrome.tabs.create({"url": "html/settings.html"});
  }

  /* Upload the file that MIGHT unlock your predicament */
  function uploadButtonClick(){
    var fileInput = document.getElementById("fileInput");
    var file = fileInput.files[0];
    var formData = new FormData();
    formData.append("file", file);
    chrome.runtime.sendMessage({type: "upload", data: formData});
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
