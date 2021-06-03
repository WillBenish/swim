var _ = require("underscore");
var fs = require("fs");
var path = require('path');
const rp = require('request-promise');
const cheerio = require('cheerio');


var router = require("express").Router();
router.route("/meetResults").get(getEventList);
router.route("/eventResult:eventHTML?").get(getEventResults);

var baseUrl = 'http://www.txlameetresults.com'

async function getEventList(req,res){

	//

	 var reqUrl = baseUrl+'/evtindex.htm'

	 var options = {
	 	method:"GET",
	 	uri: reqUrl,
	 	json: false

	 };

	 rawResult = await rp(options);
	 const $ = cheerio.load(rawResult);
	 eventLinks = [];
	 $('a').each((i,link) => {
	 	event = {
	 		href:link.attribs.href,
	 		name:link.children[0].data
	 	}
	 	eventLinks.push(event);
	 })
	 console.log(eventLinks);
	 response = {
	 	meets:eventLinks
	 }
	res.json(response);
}

async function getEventResults(req,res){
	console.log(req.query);
	eventHTM = req.query.eventHTM;
	 var reqUrl = baseUrl+'/'+req.query.eventHTM+'.htm'

	  var options = {
	 	method:"GET",
	 	uri: reqUrl,
	 	json: false

	 };

	 rawResult = await rp(options);
	 const $ = cheerio.load(rawResult);
	 swimRaw = [];
	 bigText = $.text().split('\n');

	 var pargroup =0
	 var heatNum = 0
	 var swim = -1
	 var heat = 'N/A'

	 for(i=0;i<bigText.length;i++){
	 	eachRow = bigText[i]
	 	//console.log('row: '+i+' swim: ' +swim+' content: ' + eachRow)
	 	//console.log(swimRaw)
	 	if(eachRow == '========================================================================='){
	 		pargroup+=1
	 	}
	 	//console.log(eachRow.substring(27,32))
	 	if(eachRow.substring(27,32)==' === '||eachRow.substring(25,30)==' === '){
	 		heatNum+=1;
	 	}
	 	//console.log('"'+eachRow.substring(0,4)+'"')
	 	if(eachRow.substring(0,4)=='    '&& swim>0){
	 		//console.log(swimRaw[swim])
	 		newRawRow = swimRaw[swim].rawRow + eachRow
	 		swimRaw[swim].rawRow = newRawRow
	 		//console.log('update swim')
	 	} else {

	 		//console.log('new swim')
	 		swim += 1;

	 		newSwim = {
		 		swimNum: swim,
		 		rawRow: eachRow,
		 		section: pargroup,
		 		heat:heatNum
		 	}

	 		swimRaw.push(newSwim);
	 	}
	 	
	 }


	console.log(swimRaw)
	finalResult = []
	swimRaw.map(each => {
		rawText = each.rawRow;
		each.name = rawText.substring(4,21).trim()
		each.numberRaw = rawText.substring(1,4).trim()
		each.finalTime = rawText.substring(49,60).trim()
		each.splits = [];
		splitsRaw = rawText.substring(81,1000).split('  ').map(split => {
			if(split.length> 0){
				timesArray = split.replace(')','').split('(')
				cumulativeTime = timesArray[0].trim();
				if(timesArray.length==2){
					splitTime = timesArray[1].trim()
				} else {
					splitTime = cumulativeTime
				}
				newTime = {"split":splitTime,
							"cummulative":cumulativeTime
							}
				each.splits.push(newTime);
			}
		})
		if(each.section==2&&heatNum>0&&each.name!==''&&each.finalTime!==''){
		finalResult.push(each)
	}
	}
	)
	console.log(finalResult)
	res.json(finalResult);
}


module.exports = router;