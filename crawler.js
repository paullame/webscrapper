var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var monJSON=[]; // array final des monstres
var bestiaire1=[]; // liens des monstres du bestiaire 1
var bestiaire2=[]; // liens des monstres du bestiaire 2
var bestiaire3=[]; // liens des monstres du bestiaire 3
var bestiaire4=[]; // liens des monstres du bestiaire 4
var bestiaire5=[]; // liens des monstres du bestiaire 5

crawl("http://paizo.com/pathfinderRPG/prd/bestiary/monsterIndex.html", bestiaire1);
//crawl("http://paizo.com/pathfinderRPG/prd/bestiary2/additionalMonsterIndex.html", bestiaire2);
//crawl("http://paizo.com/pathfinderRPG/prd/bestiary3/monsterIndex.html", bestiaire3);
//crawl("http://paizo.com/pathfinderRPG/prd/bestiary4/monsterIndex.html", bestiaire4);
//crawl("http://paizo.com/pathfinderRPG/prd/bestiary5/index.html", bestiaire5);



//on récupère tous les monstres de chaque bestaire
//il faut séparer les bestiaires car le liens des monstres est rattaché au bestiaire duquel ils sont issus
//il faut donc savoir donc quel bestiaire un monstre vient
function crawl(pageToVisit, monArray) {

	request(pageToVisit, function(error, response, body) {
	   if(error) {
	     console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   if(!error && response.statusCode === 200) {
	   	 console.log("Status code: " + response.statusCode);


	     // on parse le corps de la page
	     var $ = cheerio.load(body);

	     console.log("Visiting page " + pageToVisit);
	     console.log("Page title:  " + $('title').text());

	     

	    //on itère sur chaque ul c'est a dire chaque lettre de l'alphabet
		$('div#monster-index-wrapper.index > ul').each(function( index ) {


			// pour chaque lettre on recupère le liens de chaque li
		    $(this).find('li').each(function(index) {

		    	var link = $(this).find('a').attr('href');
				monArray.push(link); // on stock le liens dans un array


		    });

		  });
		console.log(monArray);
		scrap(monArray); //pour chaque liens on go récuperer les sorts
	   }


	});

}

// on récupère le monstre et ses sorts
function scrap(bestiaires) {

	for (var i = 0; i < bestiaires.length; i++) {


		if(bestiaires===bestiaire1) {

		var link="http://paizo.com/pathfinderRPG/prd/bestiary/"+bestiaires[i]; //les liens sur le 1er bestiaire sont différents....

		}
		else {
		var link="http://paizo.com/"+bestiaires[i]; //cas normal
		}

		//besoin d'utiliser un wrapper pour le callback
		request(link, callbackWrapper(bestiaires[i]));
		



	}



}


// wrapper pour pouvoir acceder a bestaire[i] dans le callback
function callbackWrapper(lien) {

	return function(error, response, body) {
			   if(error) {
			     console.log("Error: " + error);
			   }
			   // Check status code (200 is HTTP OK)


			   if(!error && response.statusCode === 200) {
			     console.log("Status code: " + response.statusCode);

			   	 var splitter=lien.split("#")
				 var soustype=splitter[splitter.length-1];

			   	 var h1tag="h1#"+soustype;

			     // on parse le corps de la page
			     var $ = cheerio.load(body);

			     console.log("Page title:  " + $('title').text());
				 
				 var title=$(h1tag).text().trim();			     
			     var monstre={name:title, spells:[]};


				 // target tout les liens contenant coreRulebook/spells entre le lien h1 et le suivant
				 var start=$(h1tag)
				 start.nextUntil("h1").find("a[href*='coreRulebook/spells']").each(function() {

				 	monstre.spells.push($(this).text().trim()); // on stock le liens dans un array

				 });

		    	
				 console.log(monstre);
		    	 monJSON.push(monstre);


			     }
			     jsonFinal = monJSON.filter(function( monstre ) {
				     return monstre.name !== ""; //on retire tous les key null
				 });

				 // on écrit le JSON
				 var bestiaireString = JSON.stringify(jsonFinal);
				 fs.writeFile("bestaire.json", bestiaireString);

			 }
}






