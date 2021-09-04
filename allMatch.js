let cheerio = require("cheerio");
let request = require("request");
let scorecardObj = require("./scorecard.js");

function processAllMatch(url){
    request(url, cb);
    function cb(error, response, html) {
        if (error){
            console.log(error);
        }
        else if(response.statusCode == 404){
            console.log("Page Not Founnd");
        }
        else{
            extractAllMatchScorecard(html);
        }
    }   
}

function extractAllMatchScorecard(html){
    let searchTool = cheerio.load(html);
    let scorecardArr = searchTool("a[data-hover='Scorecard']");
    for(let i = 0; i < scorecardArr.length; i++){
        let SingleMatch = searchTool(scorecardArr[i]).attr("href");
        let fullLink = `https://www.espncricinfo.com${SingleMatch}`;
        console.log(fullLink);
        scorecardObj.scorecard(fullLink);
    }
}

module.exports = {
    processAllMatch : processAllMatch
}