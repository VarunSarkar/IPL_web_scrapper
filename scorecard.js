const cheerio = require("cheerio");
const request = require("request");
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');


function scorecard(url){
    request(url, cb);
}
function cb(error, response, html) {
    if (error){
        console.log(error);
    }
    else if(response.statusCode == 404){
        console.log("Page Not Found");
    }
    else{
        matchDataExtractor(html);
    }
}

function matchDataExtractor(html){

    let searchTool = cheerio.load(html);

    
    let matchDes = searchTool(".match-info-MATCH .description").text();

    let result = searchTool(".match-info-MATCH .status-text").text();
    
    let matchArr = matchDes.split(",");
    let venue = matchArr[1].trim();
    let date = matchArr[2].trim();
    
    let bothInningArr = searchTool(".Collapsible");
    for (let i = 0; i < bothInningArr.length; i++) {

        let teamNameElem = searchTool(bothInningArr[i]).find("h5");
        let teamName = teamNameElem.text();
        teamName = teamName.split("INNINGS")[0];
        teamName = teamName.trim();

        let opponentTeamIndex = i == 0 ? 1 : 0;

        let opponentTeamElem = searchTool(bothInningArr[opponentTeamIndex]).find("h5");
        let opponentTeam = opponentTeamElem.text();
        opponentTeam = opponentTeam.split("INNINGS")[0];
        opponentTeam = opponentTeam.trim();

        let batsManTableBodyAllRows = searchTool(bothInningArr[i]).find(".table.batsman tbody tr");
        let data = {};

        for (let j = 0; j < batsManTableBodyAllRows.length; j++) {
            let numberofTds = searchTool(batsManTableBodyAllRows[j]).find("td");
            let isWorthy = searchTool(numberofTds[0]).hasClass("batsman-cell");

            if (isWorthy == true) {
                let playerName = searchTool(numberofTds[0]).text();
                let run = searchTool(numberofTds[2]).text();
                let balls = searchTool(numberofTds[3]).text();
                let fours = searchTool(numberofTds[5]).text();
                let sixes = searchTool(numberofTds[6]).text();
                let sr = searchTool(numberofTds[7]).text();

                    data.Team = teamName;
                    data.OpponentTeam = opponentTeam;
                    data.Venue = venue;
                    data.Date = date;
                    data.Run = run;
                    data.Balls = balls;
                    data.Fours = fours;
                    data.Sixes = sixes;
                    data.SR = sr;

                    console.log(data);
                    processPlayer(teamName, playerName ,data);
            }
        }

    }
}

function processPlayer(teamName, playerName, data){
  let teamPath = path.join(__dirname,"ipl",teamName);
  dirCreator(teamPath);
  let filePath = path.join(teamPath,playerName+".xlsx");
  let content = excelReader(filePath,playerName);
  
  content.push(data);
  excelWriter(filePath,content,playerName); 
}

function dirCreator(filePath){
  if(fs.existsSync(filePath)==false){
  fs.mkdirSync(filePath);
  }
}

function excelWriter(filePath, json, sheetName) {

  let newWB = xlsx.utils.book_new();
  let newWS = xlsx.utils.json_to_sheet(json);
  xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
  xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName) {
  if (fs.existsSync(filePath) == false) {
      return [];
  }
  let wb = xlsx.readFile(filePath);
  let excelData = wb.Sheets[sheetName];
  let ans = xlsx.utils.sheet_to_json(excelData);
  return ans;

}


module.exports = {
    scorecard : scorecard
}