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

  /* Load the websites to block and pass it to the callback */
  function loadWebsites(callback){
    /* Set or get the websites to block */
    var websites;

    storage.local.get(["defaultWebsites", "customWebsites"], function(items){
      //First, load the default websites to block
      if(items.defaultWebsites === undefined){
        websites =
        [
          
        ];

        storage.local.set({"defaultWebsites": websites});
      }
      else {
        websites = items.defaultWebsites;
      }

      //Then load the customs websites to block
      if(items.customWebsites === undefined){
        storage.local.set({"customWebsites": []});
      }
      else {
        websites = websites.concat(items.customWebsites);
      }

      //Call the callback and pass the resulting array
      if(typeof callback === "function"){
        callback(websites);
      }
    });
  }

  async function isHwValid(data){
    const apiKey = "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";

    prompt = `Does the following homework seem reasonably completed? Only output a single letter, "Y" for yes or "N" for no: ${data}`;
    console.log("chatgpt prompt: ", prompt);
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
       body: JSON.stringify({
        "model": "text-davinci-003",
        "prompt": prompt ,
        "max_tokens": 4000
      })
    }).catch((err) => {
      console.log('Error: ', err);
    });
    console.log("response: ", response);
    if(response.ok)
    {
      const data = await response.json();
      const text = data.choices[0].text;
      console.log("chatgpt reply:", `_${text}_`);

      // only released if homework if good enough
      if(text.at(-1) == "Y")
      {
        storage.local.get("on", function(item){
          if(item.on === true){
            console.log("accessed on, turning off");
            storage.local.set({"on": false, "blocked": 0});
            
            // send message to toggle button
            chrome.runtime.sendMessage({switch: "off"});
          }
          else {
            console.log("accessed off");
          }
        });
      }
    }
    else
    {
      const error = await response.json();
      throw new Error(`Error`, error);
    }

    console.log('async done');
  }

  /* Check if the url contains words from the keywords array */
  function urlContains(url, keywords){
    var result = false;

    for(var index in keywords){
      if(keywords[index].on && url.indexOf(keywords[index].url) != -1){
        result = true;
        break;
      }
    }

    return result;
  }
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);

    if (request.type === 'fetchMathpix') {
      fetch(request.url, request.options)
        .then((response) => {
          console.log('API response status:', response.status);
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(
              `Error: ${response.status} ${response.statusText}`
            );
          }
        })
        .then((data) => {
          console.log('API response data:', data);
          sendResponse({ success: true, data: data });
          console.log("math data: ", data.text);
          
          // calls chatgpt using mathpix output
          isHwValid(data.text);

        })
        .catch((error) => {
          console.error('API error:', error);
          sendResponse({ success: false, error: error.toString() });
        });
      return true;
    } 
    else if (request.type === "upload") {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "your-upload-url", true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          sendResponse({success: true});
        } else {
          sendResponse({success: false});
        }
      };
      xhr.send(request.data);
      return true;
    }
  });

  /* Redirect if necessary */
  function analyzeUrl(details){
    storage.local.get("on", function(item){
      if(item.on === true){

        loadWebsites(function(websites){
          /* FrameId test to be sure that the navigation event doesn't come from a subframe */
          if(details.frameId === 0 && urlContains(details.url, websites)){
            var id = details.tabId;

            chrome.tabs.update(id, {"url": "html/message.html"});

            /* update the number of blocked attempts */
            storage.local.get("blocked", function(item){
              storage.local.set({"blocked": item.blocked+1});
              console.log(item);
            });
          }
        });
      }
    });
  }

  /* Attach event callback */
  chrome.webNavigation.onCommitted.addListener(analyzeUrl);

  storage.local.get("on", function(item){
    if(item.on === undefined){
      /* deactivated by default & set the number of blocked attempts*/
      storage.local.set({"on": false, "blocked": 0});
    }
  });

  /* Load on start */
  loadWebsites();
})();
