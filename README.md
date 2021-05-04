# Photoshop_Scripting

This project has two major components.
1. Web Scraping
   The file app.js scrapes meta data from different app stores(like itune , zhushou, tencent) and returns a JSON comprising of app name , iconUrl , screenshots, author and other datas that are required to build a informative Creatives for any ads of any app. 

   The JSON return gets automatically saved after each API hit in a file called input.json. The file keeps getting updated by the a new JSON returned everytime the API is called.

2. Adobe Script
   The script.jsx file takes input.json as a source of metadata which is supposed to be layerd on the psd file.
   script is ran internally using command to run shell scripts which will automatically run the scripts and will do all the task automatically.
   Command for macOs is:   

        open -a <absolute path of the droplet file> <absolute path of the .psd  file on which the script is supposed to be performed.>
        
   Command for windows is :
   
         <absolute path of the droplet file> <absolute path of the .psd  file on which the script is supposed to be performed.>

    This script edits the text and smart object layer of the psd file given by replacing the app name and app icon, and finally saves the edit file in a .JPEG format.
