//We download all modules we need

// to make server
var express=require('express');
//In order to take  informations in downloaded file
var cheerio = require('cheerio');
var request=require('request');
var fs= require('fs');
var bodyParser=require("body-parser");
var path= require('path');
var jsdom = require("jsdom");
//In order to server works
var app=express();
app.use(bodyParser.urlencoded({ extended: true }));
//To scrapp the web
var urlLeBonCoin;
var urlLesMeilleursAgents="https://www.meilleursagents.com/prix-immobilier/";
var port=3500;
//To read JSON file
var content_LeBonCoin= fs.readFileSync("moduleLeBonCoin.json");
var content_MeilleurAgent= fs.readFileSync("moduleMeilleurAgent.json");
//To work throught the JSON file 
var realEstate=JSON.parse(content_LeBonCoin);
var MeilleurAgent=JSON.parse(content_MeilleurAgent);

var htmlSource=fs.readFileSync("index.html","utf8");


function documentToSource(doc) {
    // The non-standard window.document.outerHTML also exists,
    // but currently does not preserve source code structure as well

    // The following two operations are non-standard
    return doc.doctype.toString()+doc.innerHTML;
}


app.get('/', (request, response) => {response.sendFile(__dirname+'/index.html')});

app.post('/', function(req, res){

     urlLeBonCoin = req.body.p1;//we get back Url from the form

	request(urlLeBonCoin,function(err,resp,body){

		if (err){
		console.log(err);
		}else{
			var $ = cheerio.load(body);
			var	price;
			var city;
			var kindOfEstate;
			var room;
			var squareMeter;
			var GES;
			var energyClass;
			var finalResult;
				
		//Price of real estate
			$('span.value:nth-child(3)').filter(function(){
			var data=$(this);
			price=data.text();
			realEstate.price=price;
			})
		//City of real Estate
			$('div.line:nth-child(6) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			var data=$(this);
			city=data.text();		
			realEstate.city=city;
			})
		//Kind of real estate
			$('div.line:nth-child(7) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			var data=$(this);
			kindOfEstate=data.text();
			realEstate.kindOfEstate=kindOfEstate;
			})
		//Number of room
			$('div.line:nth-child(8) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			var data=$(this);
			room=data.text();		
			realEstate.room=room;
			})
		//Squarred Meter
			$('div.line:nth-child(9) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			var data=$(this);
			squareMeter=data.text();
			realEstate.squareMeter=squareMeter;
			console.log("TEEST3 "+realEstate.squareMeter)
			}) 
		//GES
			$('div.line:nth-child(10) > h2:nth-child(1) > span:nth-child(2) > a:nth-child(1)').filter(function(){
			var data=$(this);
			GES=data.text();
			realEstate.GES=GES;
			})
		//Energy Class
			$('div.line:nth-child(11) > h2:nth-child(1) > span:nth-child(2) > a:nth-child(1)').filter(function(){
			var data=$(this);
			energyClass=data.text();
			realEstate.energyClass=energyClass;
			})

			realEstate.city=Clean(realEstate.city,false);
			realEstate.kindOfEstate=Clean(realEstate.kindOfEstate,false);
			realEstate.price=Clean(realEstate.price,true);
			realEstate.squareMeter=Clean(realEstate.squareMeter,true);
			

		

			console.log("price = "+realEstate.price);
			console.log("city = "+ realEstate.city);
			console.log("kindOfEstate= "+ realEstate.kindOfEstate);
			console.log("room= "+ realEstate.room);
			console.log("squareMeter="+realEstate.squareMeter);
			console.log("GES:"+realEstate.GES);
			console.log("energyClass="+realEstate.energyClass);

		
		 request(urlLesMeilleursAgents+realEstate.city+'/',function(err2,resp2,body2){ 

				if(err2){
				console.log(err2);
				}
				else{

					var $ = cheerio.load(body2);


					switch(realEstate.kindOfEstate){

						case "maison":
						var bestPriceHome=$('div.medium-uncollapse:nth-child(3) > div:nth-child(2)');
						var bestPriceHomeText=bestPriceHome.text();

						var middlePriceHome=$('div.medium-uncollapse:nth-child(3) > div:nth-child(3)');
						var middlePriceHomeText=middlePriceHome.text();

						var worstPriceHome=$('div.medium-uncollapse:nth-child(3) > div:nth-child(4)');
						var worstPriceHomeText=worstPriceHome.text();

						bestPriceHomeText=Clean(bestPriceHomeText,true);
						middlePriceHomeText=Clean(middlePriceHomeText,true);
						worstPriceHomeText=Clean(worstPriceHomeText,true);

						
						MeilleurAgent.home.best=bestPriceHomeText;
						MeilleurAgent.home.middle=middlePriceHomeText;
						MeilleurAgent.home.worst=worstPriceHomeText;

						result(realEstate.kindOfEstate);
						
						break;


						case "appartement":
							var bestPriceAppartement=$('div.medium-uncollapse:nth-child(2) > div:nth-child(2)');

							var bestPriceAppartementText=bestPriceAppartement.text();

							var middlePriceAppartement=$('div.medium-uncollapse:nth-child(2) > div:nth-child(3)');
							var middlePriceAppartementText=middlePriceAppartement.text();

							var worstPriceAppartement=$('div.medium-uncollapse:nth-child(2) > div:nth-child(4)');
							var worstPriceAppartementText=worstPriceAppartement.text();
							
						   	
						   	bestPriceAppartementText=Clean(bestPriceAppartementText,true);
						   	middlePriceAppartementText=Clean(middlePriceAppartementText,true);
						   	worstPriceAppartementText=Clean(worstPriceAppartementText,true);

							MeilleurAgent.appartement.middle=middlePriceAppartementText;		
							MeilleurAgent.appartement.best=bestPriceAppartementText;
							MeilleurAgent.appartement.worst=worstPriceAppartementText;
							console.log("bestPriceAppartmentText = "+MeilleurAgent.appartement.best);
							console.log("middlePriceAppartmentText = "+ MeilleurAgent.appartement.middle);
							console.log("worstPriceAppartmentTexte= "+ MeilleurAgent.appartement.worst);

							finalResult=result(realEstate.kindOfEstate);
							res.send(finalResult);
							//res.send({ some: 'moduleLeBonCoin2.json' });

							
						break;

						case "location":

						var bestPriceLocation=$('div.row:nth-child(4) > div:nth-child(2)');
						var bestPriceLocationText=bestPriceLocation.text();

						var middlePriceLocation=$('div.row:nth-child(4) > div:nth-child(3)');
						var middlePriceLocationText=middlePriceLocation.text();

						var worstPriceLocation=$('div.row:nth-child(4) > div:nth-child(4)');
						var worstPriceLocationText=worstPriceLocation.text();

						bestPriceLocationText=Clean(bestPriceLocationText,true);
						middlePriceLocationText=Clean(middlePriceLocationText,true);
						worstPriceLocationText=Clean(worstPriceLocationText,true);


						MeilleurAgent.location.best=bestPriceLocationText;
						MeilleurAgent.location.middle=middlePriceLocationText;
						MeilleurAgent.location.worst=worstPriceLocationText;

						result(realEstate.kindOfEstate);
						break;

					}
				
				}
				
			})
		}
	})
})

		//a function allow us to have a int or a name of city correctly writted.
function Clean(arg,kind){
		
		if(kind){
		arg=arg.replace(/€/g,"");
		arg=arg.replace(/m2/g,"");
		arg=arg.replace(/\s/g,"");
		arg=arg.trim();
		arg=parseInt(arg,10);
		
		}
		else if (!kind){ 
		arg=arg.toLowerCase();
		arg=arg.trim();
		arg=arg.replace(/ /g,"-");
		
		}
		else{
			console.log(" one of your arguments are not correct")
		}
		return arg;

		}

//this function allow us to tell if either a good deal or a bad deal.
function result(kind){

	var buyIt=" buy it , you wil never find better !! ";
	var goodDeal="it's a good deal ";
	var youCanHaveBetter="you can have better .. you have to negociate ";
	var dontBuyIt="it's a joke ! don't buy it ";
	var priceSquareMetter=(realEstate.price)/(realEstate.squareMeter); 
  	var RealLowPrice;
	var RealmiddlePrice;
	var RealHightPrice;

   switch(kind){

  	case("maison"):
   	console.log("home priceSquareMetter : " + priceSquareMetter);

  	RealLowPrice = MeilleurAgent.home.best;
	RealmiddlePrice = MeilleurAgent.home.middle;
	RealHightPrice = MeilleurAgent.home.worst;
	
	if( priceSquareMetter<=RealLowPrice){

		console.log(buyIt);
		return buyIt;
		
	}
	else if (priceSquareMetter>RealLowPrice &&  priceSquareMetter<=RealmiddlePrice){
		console.log(goodDeal);
		return goodDeal;

	}
	else if ( priceSquareMetter>RealmiddlePrice && priceSquareMetter<=RealHightPrice){

		console.log(youCanHaveBetter);
		return youCanHaveBetter;
	}
	else{
		console.log(dontBuyIt);
		return dontBuyIt;
	}
	break;
	
  	case ("appartement"):
  	RealLowPrice = MeilleurAgent.appartement.best;
	RealmiddlePrice = MeilleurAgent.appartement.middle;
	RealHightPrice = MeilleurAgent.appartement.worst;
	console.log("appartement priceSquareMetter : " + priceSquareMetter);
	
	if( priceSquareMetter<=RealLowPrice){

		console.log(buyIt);
		return buyIt;

	}
	else if(priceSquareMetter>RealLowPrice &&  priceSquareMetter<=RealmiddlePrice){
		console.log(goodDeal);
		return goodDeal;
	}
	else if ( priceSquareMetter>RealmiddlePrice && priceSquareMetter<=RealHightPrice){

		console.log(youCanHaveBetter);
		return youCanHaveBetter;
	}
	else{
		console.log(dontBuyIt);
		return dontBuyIt;
	}
	break;	

  	case("location"):
  	 RealLowPrice = MeilleurAgent.location.best;
	 RealmiddlePrice = MeilleurAgent.location.middle;
	 RealHightPrice = MeilleurAgent.location.worst;
	 console.log("location priceSquareMetter : " + priceSquareMetter);

	if( priceSquareMetter<=RealLowPrice){

		console.log(buyIt);
		return buyIt
	}
	else if(priceSquareMetter>RealLowPrice &&  priceSquareMetter<=RealmiddlePrice){
		console.log(goodDeal);
		return goodDeal;
	}
	else if ( priceSquareMetter>RealmiddlePrice && priceSquareMetter<=RealHightPrice){

		console.log(youCanHaveBetter);
		return youCanHaveBetter;
	}
	else{
		console.log(dontBuyIt);
		return dontBuyIt;
	}
	break;


   }
}

app.listen(port);
console.log("express server is listening on port "+port);
