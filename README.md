# AdobeJSIntegration

This project has two major components.
1. Web Scraping
   The file app.js scrapes meta data from different app stores and returns a JSON comprising of app name, app icon and several creatives of the app published on the app store. 

   The JSON return gets automatically saved after each API hit in a file called input.json. The file keeps getting updated by the a new JSON returned everytime the API is called.

2. Adobe Script
   The script.jsx file takes input.json as a source of metadata which is supposed to be layerd on the psd file.

   NOTE: The script needs to be executed through command line with the following command. 

        open -a <absolute path of the droplet file> <absolute path of the .psd  file on which the script is supposed to be performed.>

    This script edits the text and smart object layer of the psd file given by replacing the app name and app icon, and finally saves the edit file in a .JPEG format.