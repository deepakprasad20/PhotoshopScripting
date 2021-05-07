#include json2.js
 
var input = loadJSON('input.json');

var doc = app.activeDocument;

var layerSet = doc.layerSets;


for(var i = 0 ; i < layerSet.length ; i++){
  if(layerSet[i].layers.length > 0){
    for(var j = 0 ; j < layerSet[i].layers.length ; j++){
      var currentLayer = layerSet[i].layers[j];
      //Changing Store Name in a Text Layer
      if(currentLayer.name =="appstoreName"){
        currentLayer.textItem.contents = input.storeName;
        var textWidth = (currentLayer.bounds[2] - currentLayer.bounds[0])/2;
        var textHeight = currentLayer.bounds[3] - currentLayer.bounds[1];
        var docWidth = doc.width/2;
        var docHeight = doc.height;
        //currentLayer.textItem.position = new Array(1000,4000);
      }
      //Changing CTA Text in a Text Layer
      else if(currentLayer.name =="ctaText"){
        currentLayer.textItem.contents = input.ctaText;
        textColor = new SolidColor;
        textColor.rgb.red = input.ctaTextColorList[0];
        textColor.rgb.green = input.ctaTextColorList[1];
        textColor.rgb.blue = input.ctaTextColorList[2];
        currentLayer.textItem.color = textColor;
        //currentLayer.textItem.size = new UnitValue(10,"mm");
      }
      //Changing Developer Name in a Text Layer
      else if(currentLayer.name =="developerName"){
        currentLayer.textItem.contents = input.author;
      }
      //Changing App Name in a Text Layer
      else if(currentLayer.name =="appName"){
        currentLayer.textItem.contents = input.appName;
        currentLayer.textItem.size = new UnitValue(14,"mm");
      }
      else if(currentLayer.name =="ctaColor"){
        var sColor = new SolidColor;
        sColor.rgb.hexValue = rgbToHex(input.ctaBoxColorList[0],input.ctaBoxColorList[1],input.ctaBoxColorList[2]);
        app.activeDocument.activeLayer = currentLayer;
        setColorOfFillLayer(sColor);
      }
    }
  }
} 


// Download the image
var imageURL = input.iconUrl;
var downloadedImagePath = "C:/Users/deepak.prasad/Desktop/python_scrapping/psd/AdobeJSIntegration/logo1.png";
app.system("curl -o " + downloadedImagePath + " " +  imageURL);

//Place the app icon
place_image_here(downloadedImagePath, doc,'logo');
//translate_layer(logoLayer[0].value,logoLayer[1].value);//1804, 2800);

//Place the screenshot image
var schreenshotUrl = input.screenshotUrl[0];
var schreenshotImagePath = "C:/Users/deepak.prasad/Desktop/python_scrapping/psd/AdobeJSIntegration/screenshot.jpg";
app.system("curl -o " + schreenshotImagePath + " " +  schreenshotUrl);
doc = app.activeDocument;
place_image_here(schreenshotImagePath, doc,'appImage');
//translate_layer(screenshotLayer[0].value, screenshotLayer[1].value);

//Place the app Image
var appstoreImagePath = '';
if(input.storeName == "Apple"){
  appstoreImagePath = "C:/Users/deepak.prasad/Desktop/python_scrapping/psd/AdobeJSIntegration/apple.png";
} else if(input.storeName == "Zhushou"){
  appstoreImagePath = "C:/Users/deepak.prasad/Desktop/python_scrapping/psd/AdobeJSIntegration/zhushou.png"
}
else if(input.storeName == "Tencent"){
  appstoreImagePath = "C:/Users/deepak.prasad/Desktop/python_scrapping/psd/AdobeJSIntegration/tencent.png"
}
doc = app.activeDocument;
place_image_here(appstoreImagePath , doc , 'appstoreIcon')

//Saving the template in JPEG Format
saveJpeg(input.appNameForSaving);
app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);


//----------------------- FUNCTIONS -----------------------

//Load JSON
function loadJSON(relPath){
    var script = new File($.fileName);
    var jsonFile = new File(script.path + '/' + relPath);

    jsonFile.open('r');
    var str = jsonFile.read();
    jsonFile.close();

    return JSON.parse(str);
}

//Save JPEG
function saveJpeg(name){

    var fileName = 'C:/Users/deepak.prasad/Desktop/python_scrapping/psd/AdobeJSIntegration'+ '/' + name + '.jpg';
    var file = new File(fileName);
    var i = 1;
    while(file.exists){
      fileName = 'C:/Users/deepak.prasad/Desktop/python_scrapping/psd/AdobeJSIntegration'+ '/' + name + "(" + i + ")"+ '.jpg';
      file = new File(fileName);
      i++;
    }

    var opts = new JPEGSaveOptions();
    opts.quality = 10;                  //High quality JPEG save

    app.activeDocument.saveAs(file, opts, true, Extension.LOWERCASE);
}

//Placing the Image at the Icon Position
function place_image_here(fromimage, toimage, layerName)
{
  var fileRef = new File(fromimage);

  // If it's there, open it!
  if (fileRef.exists)
  {
    //Resize the image to the size of the logo icon
    //alert(toimage.name);
    var currentLayerSet;// = app.documents.getByName(toimage.name).layerSets.getByName(layerName);
    var currentLayer;
    //alert(currentLayer);
    for(var i = 0 ; i < layerSet.length ; i++){
      if(layerSet[i].layers.length > 0){
        for(var j = 0 ; j < layerSet[i].layers.length ; j++){
            if(layerSet[i].layers[j].name == layerName){
              currentLayerSet = layerSet[i];
              currentLayer = layerSet[i].layers[j];
              //alert("Layer Found");
            }
          }
        }
    }
    //var currentLayer = app.documents.getByName(toimage.name).layerSets.getByName(layerName) 
    //alert(currentLayer.name);
    var fWidth = currentLayer.bounds[2]-currentLayer.bounds[0];
    var fHeight = currentLayer.bounds[3]-currentLayer.bounds[1];
    resizeImage(fileRef,fWidth,fHeight);

    app.open(fileRef);

    // Establish the newly opened doc
    // is the from document
    var fromDocName = app.activeDocument.name;

    // Get the name of the destination image
    var toImageName = toimage.name;

    // Establish the from and to documents
    //var to = app.documents.getByName(toImageName);
    var from = app.documents.getByName(fromDocName);

    // Select the tempImage
    app.activeDocument = from;

    // Move from tempImage to the baseImage
    
    var duplicateLayer = activeDocument.activeLayer.duplicate(currentLayerSet);

    // Close the temp image without saving
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    translate_layer(currentLayer.bounds[0],currentLayer.bounds[1]);
    currentLayer.visible = false;
    
  }
  else
  {
    alert("Error opening\n" + fromimage);
  }
}




//TRANSLATE LAYER(dx, dy)
function translate_layer(dx,dy)
{
  // =======================================================
  var id2014 = charIDToTypeID( "Trnf" );
  var desc416 = new ActionDescriptor();
  var id2015 = charIDToTypeID( "null" );
  var ref287 = new ActionReference();
  var id2016 = charIDToTypeID( "Lyr " );
  var id2017 = charIDToTypeID( "Ordn" );
  var id2018 = charIDToTypeID( "Trgt" );
  ref287.putEnumerated( id2016, id2017, id2018 );
  desc416.putReference( id2015, ref287 );
  var id2019 = charIDToTypeID( "FTcs" );
  var id2020 = charIDToTypeID( "QCSt" );
  var id2021 = charIDToTypeID( "Qcsa" );
  desc416.putEnumerated( id2019, id2020, id2021 );
  var id2022 = charIDToTypeID( "Ofst" );
  var desc417 = new ActionDescriptor();
  var id2023 = charIDToTypeID( "Hrzn" );
  var id2024 = charIDToTypeID( "#Pxl" );
  desc417.putUnitDouble( id2023, id2024, dx );
  var id2025 = charIDToTypeID( "Vrtc" );
  var id2026 = charIDToTypeID( "#Pxl" );
  desc417.putUnitDouble( id2025, id2026, dy );
  var id2027 = charIDToTypeID( "Ofst" );
  desc416.putObject( id2022, id2027, desc417 );
  executeAction( id2014, desc416, DialogModes.NO );
}

//Resize the image to the appropriate icon size
function resizeImage(imageFile,fWidth,fHeight){
    
    app.open(imageFile);
    doc = app.activeDocument;

    // change the color mode to RGB.  Important for resizing GIFs with indexed colors, to get better results
    doc.changeMode(ChangeMode.RGB);  

    // these are our values for the END RESULT width and height (in pixels) of our image
    //var fWidth = 1159;
    //var fHeight = 1159;

    // do the resizing.  if height > width (portrait-mode) resize based on height.  otherwise, resize based on width
    doc.resizeImage(UnitValue(fWidth,"px"),UnitValue(fHeight,"px"),null,ResampleMethod.BICUBIC);

    // Convert the canvas size as informed above for the END RESULT
    app.activeDocument.resizeCanvas(UnitValue(fWidth,"px"),UnitValue(fHeight,"px"));
}

function setColorOfFillLayer( sColor ) {
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putEnumerated(stringIDToTypeID('contentLayer'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
  desc.putReference(charIDToTypeID('null'), ref);
  var fillDesc = new ActionDescriptor();
  var colorDesc = new ActionDescriptor();
  colorDesc.putDouble(charIDToTypeID('Rd  '), sColor.rgb.red);
  colorDesc.putDouble(charIDToTypeID('Grn '), sColor.rgb.green);
  colorDesc.putDouble(charIDToTypeID('Bl  '), sColor.rgb.blue);
  fillDesc.putObject(charIDToTypeID('Clr '), charIDToTypeID('RGBC'), colorDesc);
  desc.putObject(charIDToTypeID('T   '), stringIDToTypeID('solidColorLayer'), fillDesc);
  executeAction(charIDToTypeID('setd'), desc, DialogModes.NO);
}

function rgbToHex(r, g, b) {
	return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
