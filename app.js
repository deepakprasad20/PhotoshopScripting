//import translate from 'google-translate-open-api';
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");


const express = require("express");
const { json } = require("body-parser");
const app = express();

app.use(bodyParser());

var PORT = process.env.port || 3000;
function returnOptions(rawText) {
    return {
        method: 'POST',
        url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
        params: {
            to: 'en',
            'api-version': '3.0',
            from: 'zh-Hans',
            profanityAction: 'NoAction',
            textType: 'plain'
        },
        headers: {
            'content-type': 'application/json',
            'x-rapidapi-key': 'd238778c33msh4c9459554943466p116953jsn3a13aeaf9a18',
            'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com'
        },
        data: [{ Text: rawText }]
    };
}

app.get("/app/:storeName/:appId", async function (req, res) {
    let appId = req.params['appId'];
    let storeName = req.params['storeName'];
    let ctaText = "Order Now";
    let APIresponse = await getMetaData(appId, storeName,ctaText);

    res.send(APIresponse);

    /*Write response into "input.json" file. Everytime 
    the below function runs, "input.json" get overridden.
    */
    
    fs.writeFile("./input.json", JSON.stringify(APIresponse, null, 2), err => {
        if (err) {
            console.log(err);
        } else {
            console.log("File sucessfully written");

            //------------------

            //const { exec } = require("child_process");
            //shell commands for windows and macOS may differ.

            var commandtoRun = "C:\\Users\\deepak.prasad\\Desktop\\python_scrapping\\psd\\AdobeJSIntegration\\ScriptDroplet.exe C:\\Users\\deepak.prasad\\Desktop\\python_scrapping\\psd\\AdobeJSIntegration\\Ad-format-final-1.psd";

            const { exec } = require("child_process");
            exec(commandtoRun, (error, data, getter) => {
                if (error) {
                    console.log("error", error.message);
                    return;
                }
                if (getter) {
                    console.log("data", data);
                    return;
                }
                console.log("data", data);

            });
            //-------------------
        }
    });
});


async function getMetaData(appId, storeName,ctaText) {
    if (storeName == "zhushou") {
        return await fetchMetaDataForZhushou(appId,ctaText);
    }
    else if(storeName == "apple"){
        return await fetchMetaDataForApple(appId,ctaText);
    }
}


async function fetchMetaDataForZhushou(appId,ctaText) {
    const url = 'http://zhushou.360.cn/detail/index/soft_id/' + appId;// 'https://itunes.apple.com/lookup?id=284910350';
    try {
        let response = await axios(url);
        const html = response.data;
        const $ = cheerio.load(html);
        //fetching app name in Chinese.
        let appName = $('#app-name').text();
        // converting appName from chinese to english.
        let appNameInEnglish = (await axios(returnOptions(appName))).data[0].translations[0].text;
        let appNameArr = appNameInEnglish.split(" ");
        let appNameForSaving = appNameArr[0] + " " + appNameArr[1];
        let appNameWithNewLineCharacter = "";
        for(var i = 0 ; i < appNameArr.length ; i++){
            if(i % 2 == 0 && i != 0){
                appNameWithNewLineCharacter = appNameWithNewLineCharacter +"\r " + appNameArr[i];
            } else{
                appNameWithNewLineCharacter = appNameWithNewLineCharacter +" "+ appNameArr[i];
            }
        }

        
        let iconUrl = $('.product.btn_type1').find('dl > dt > img').attr('src');
        let scrnshtDiv = $('#scrollbar').attr('data-snaps');
        let scrnshtArr = scrnshtDiv.split(",");
        let author = $('#sdesc').find('div > div > table > tbody > tr').first().find('td')
            .first().text().split("：")[1];
        let authorInEnglish = await axios(returnOptions(author));
        return {
            appName: appNameWithNewLineCharacter,
            appNameForSaving: appNameForSaving,
            iconUrl: iconUrl,
            screenshotUrl: scrnshtArr,
            author : authorInEnglish.data[0].translations[0].text,
            storeName : "Zhushou",
            ctaText : ctaText
        };
    } catch (error) {
        console.log(error);
    }
}

async function fetchMetaDataForApple(appId , ctaText) {
    const url = 'https://itunes.apple.com/lookup?id=' + appId;
    try{
        let response = await axios(url);
        const html = response.data;
        const $ = html.results[0];//cheerio.load(html);
        let appName = $.trackName;
        let appNameArr = appName.split(" ");
        let appNameWithNewLineCharacter = "";
        for(var i = 0 ; i < appNameArr.length ; i++){
            if(i % 2 == 0 && i != 0){
                appNameWithNewLineCharacter = appNameWithNewLineCharacter +"\r " + appNameArr[i];
            } else{
                appNameWithNewLineCharacter = appNameWithNewLineCharacter +" "+ appNameArr[i];
            }
        }
        let appNameForSaving = appNameArr[0] + appNameArr[1];
        let iconUrl = $.artworkUrl512;
        let screenshotUrl = $.screenshotUrls;
        let author = $.sellerName;
        console.log(appName);
        return {
            appName : appNameWithNewLineCharacter,
            appNameForSaving : appNameForSaving,
            iconUrl : iconUrl,
            screenshotUrl : screenshotUrl,
            author : author,
            storeName : "Apple",
            ctaText : ctaText
        };
    } catch(error){
        console.log(error);
    }
}


app.listen(PORT, function (error) {
    if (error) throw error
    console.log("Server created Successfully on PORT", PORT)
});


app.post('/app/:storeName/:appId',async function(req,res){

    //console.log(req.body.templateName);
    let appId = req.params['appId'];
    let storeName = req.params['storeName'];
    let templateName = req.body.templateName;
    let ctaText = req.body.ctaText;
    let ctaBoxColorList = req.body.ctaBoxColorList;
    let APIresponse = await getMetaData(appId, storeName,ctaText);
    APIresponse['ctaBoxColorList'] = ctaBoxColorList;

    

    /*Write response into "input.json" file. Everytime 
    the below function runs, "input.json" get overridden.
    */
    fs.writeFile("./input.json", JSON.stringify(APIresponse, null, 2), err => {
        if (err) {
            console.log(err);
        } else {
            console.log("File sucessfully written!");

            //------------------

            //const { exec } = require("child_process");
            //shell commands for windows and macOS may differ.

            var commandtoRun = "C:\\Users\\deepak.prasad\\Desktop\\python_scrapping\\psd\\AdobeJSIntegration\\ScriptDroplet.exe C:\\Users\\deepak.prasad\\Desktop\\python_scrapping\\psd\\AdobeJSIntegration\\" + templateName;
            console.log(commandtoRun);

            const { exec } = require("child_process");
            exec(commandtoRun, (error, data, getter) => {
                if (error) {
                    console.log("error", error.message);
                    return;
                }
                if (getter) {
                    console.log("data", data);
                    return;
                }
                console.log("data", data);

            });
            //-------------------
        }
    });
    res.send(APIresponse);
});
app.post('/app/:storeName/:appId/:info',async function(req,res){

    //console.log(req.body.templateName);
    let appId = req.params['appId'];
    let storeName = req.params['storeName'];
    let info = req.params['info']
    let templateName = req.body.templateName;
    let ctaText = req.body.ctaText;
    let ctaBoxColorList = req.body.ctaBoxColorList;
    let APIresponse = await fetchMetaDataForTencent(appId,info);
    APIresponse['ctaBoxColorList'] = ctaBoxColorList;
    APIresponse['ctaText'] = ctaText;
    APIresponse['storeName'] = 'Tencent';
    APIresponse['ctaTextColorList'] = req.body.ctaTextColorList;

    

    /*Write response into "input.json" file. Everytime 
    the below function runs, "input.json" get overridden.
    */
    fs.writeFile("./input.json", JSON.stringify(APIresponse, null, 2), err => {
        if (err) {
            console.log(err);
        } else {
            console.log("File sucessfully written!");

            //------------------

            //const { exec } = require("child_process");
            //shell commands for windows and macOS may differ.

            var commandtoRun = "C:\\Users\\deepak.prasad\\Desktop\\python_scrapping\\psd\\AdobeJSIntegration\\ScriptDroplet.exe C:\\Users\\deepak.prasad\\Desktop\\python_scrapping\\psd\\AdobeJSIntegration\\" + templateName;
            console.log(commandtoRun);

            const { exec } = require("child_process");
            exec(commandtoRun, (error, data, getter) => {
                if (error) {
                    console.log("error", error.message);
                    return;
                }
                if (getter) {
                    console.log("data", data);
                    return;
                }
                console.log("data", data);

            });
            //-------------------
        }
    });
    res.send(APIresponse);
});

async function fetchMetaDataForTencent(appId , info){
    const url = 'https://android.myapp.com/myapp/detail.htm?apkName=' +appId + '&info='+info;
    try{
        let response = await axios(url);
        const html = response.data;
        const $ = cheerio.load(html);
        ////*[@id="J_DetDataContainer"]/div/div[1]/div[2]/div[1]/div[1]/font/font
        let appName = $('#J_DetDataContainer').find('div').first()
            .find('div').find('.det-ins-data').first()
            .find('.det-name').first().find('.det-name-int').first().text();
            
        let appNameInEnglish = (await axios(returnOptions(appName))).data[0].translations[0].text;
        let appNameArr = appNameInEnglish.split(" ");
        let appNameWithNewLineCharacter = "";
        for (var i = 0; i < appNameArr.length; i++) {
            if (i % 2 == 0 && i != 0) {
                appNameWithNewLineCharacter = appNameWithNewLineCharacter + "\r " + appNameArr[i];
            } else {
                appNameWithNewLineCharacter = appNameWithNewLineCharacter + " " + appNameArr[i];
            }
        }
        let appNameForSaving = '';
        if(appNameArr.length > 1){
         appNameForSaving = appNameArr[0] +" " + appNameArr[1];
        } else{
            appNameForSaving = appNameInEnglish
        }
            
        

        //*[@id="J_DetDataContainer"]/div/div[1]/div[1]/img
        let iconUrl = $('#J_DetDataContainer').find('div').first().find('.det-icon > img').attr('src');

        //*[@id="picInImgBoxImg0"]
        let screenshotUrlArray = [];
        $('#J_PicTurnHoverBox').find('span > span > div').map((i,elm) => {
            screenshotUrlArray.push($(elm).find('img').first().attr('data-src'));
        });

        //*[@id="J_DetDataContainer"]/div/div[3]/div[6]/font/font
        let author = $('#J_DetDataContainer').find('div').first().find('.det-othinfo-container .det-othinfo-data').eq(2).text();
        let authorInEnglish = (await axios(returnOptions(author))).data[0].translations[0].text;
        let authorArr = authorInEnglish.split(" ");
        let authorName = "";
        if(authorArr.length > 3){
            for(var i = 0 ; i < authorArr.length ; i++){
                if(i%3 == 0 && i != 0){
                    authorName = authorName + "\r " + authorArr[i];
                } else{
                    authorName = authorName + " " + authorArr[i];
                }
            }
        }
        console.log(author);
        return {
            appName: appNameWithNewLineCharacter,
            iconUrl: iconUrl,
            screenshotUrl : screenshotUrlArray,
            author : authorName,
            appNameForSaving : appNameForSaving
        };
    }catch(error){
        console.log(error);
    }
}


module.exports = { getMetaData };
