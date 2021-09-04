const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");
const path = require("path");

const allMatchObj = require("./allMatch.js");

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

const iplPath = path.join(__dirname,"ipl");
dirCreator(iplPath);

request(url, cb);

function cb(error, response, html) {
    if (error){
        console.log(error);
    }
    else if(response.statusCode == 404){
        console.log("Page Not Found");
    }
    else{
        dataExtractor(html);
    }
}

function dataExtractor(html){

    let searchTool = cheerio.load(html);


    let result = searchTool(".widget-items.cta-link");
    let aElem = searchTool(result).find("a");
    let link = aElem.attr("href");
        
    let fullLink = `https://www.espncricinfo.com${link}`;
    allMatchObj.processAllMatch(fullLink);
}

function dirCreator(filePath){
  if(fs.existsSync(filePath)==false){
  fs.mkdirSync(filePath);
  }
}