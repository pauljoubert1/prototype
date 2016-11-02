document.writeln('<script src="../Scripts/jQuery-2.2.4.min.js" type="text/javascript"></script>');

		function  ConsulterControles(){
			window.location = "consultercontroles.html";
			window.location.href = "consultercontroles.html";
			window.location.assign("consultercontroles.html");
			window.location.replace("consultercontroles.html");
			self.location = "consultercontroles.html";
			top.location = "consultercontroles.html";;
		}

// Script non utilisé dans cette page mais present a cet endroit pour qu'il soit déplacé avec les autres script dans la page du controleur 

		function  ConsulterRames(){
			window.location = "index.html";
			window.location.href = "index.html";
			window.location.assign("index.html");
			window.location.replace("index.html");
			self.location = "index.html";
			top.location = "index.html";;
		}



$(document).ready(function(){
			$('#filtrerbouton').click(function(){
			//switch avec toutes les propositions des filtres (on doit pouvoir recuperer les infos depuis la bdd, actuellement en statique et ne depend pas de la bdd, on doit rajouter les propositions a la main)
			console.log('controleur.js est actif');
			var a = document.getElementById("Filtre1").value;
			console.log(a);
			var b = document.getElementById("Filtre2").value;
			console.log(b);
			var c = document.getElementById("Filtre3").value;
			console.log(c);
			var d = document.getElementById("Filtre4").value;
			console.log(d);
			var e = document.getElementById("Filtre5").value;
			console.log(e);

			function switchresult1(a){
				switch(a){
					case '1':
					TableSelect1 = 'Site = VSD';
					return TableSelect1;
					break;
					case '2':
					TableSelect1 = 'Site = JS';
					return TableSelect1;
					break;
				}
			}
			var TableSelect1 = switchresult1(a);

			function switchresult2(b){
				switch(b){
					case '1':
					TableSelect2 = 'Serie = Z2N';
					return TableSelect2;
					break;
					case '2':
					TableSelect2 = 'Serie = Z5300';
					return TableSelect2;
					break;
					case '3':
					TableSelect2 = 'Serie = Z50000';
					return TableSelect2;
					break;
				}
			}
			var TableSelect2 = switchresult2(b);

			function switchresult3(c){
				switch(c){
					case '1':
					TableSelect3 = 'Sousserie = Z20500';
					return TableSelect3;
					break;
					case '2':
					TableSelect3 = 'Sousserie = Z5600';
					return TableSelect3;
					break;
					case '3':
					TableSelect3 = 'Sousserie = Z5300';
					return TableSelect3;
					break;
					case '4':
					TableSelect3 = 'Sousserie = Z50000';
					return TableSelect3;
					break;
				}
			}
			var TableSelect3 = switchresult3(c);

			function switchresult4(d){
				switch(d){
					case '1':
					TableSelect4 = 'Visite = MIF01';
					return TableSelect4;
					break;
					case '2':
					TableSelect4 = 'Visite = MIF04';
					return TableSelect4;
					break;
					case '3':
					TableSelect4 = 'Visite = MIP05';
					return TableSelect4;
					break;
					case '4':
					TableSelect4 = 'Visite = GVG';
					return TableSelect4;
					break;
					case '5':
					TableSelect4 = 'Visite = VG';
					return TableSelect4;
					break;
					case '6':
					TableSelect4 = 'Visite = VL';
					return TableSelect4;
					break;
					case '7':
					TableSelect4 = 'Visite = Correctif';
					return TableSelect4;
					break;
				}
			}
			var TableSelect4 = switchresult4(d);

			function switchresult5(e){
				switch(e){
					case '1':
					TableSelect5 = 'Numrame = 01A';
					return TableSelect5;
					break;
					case '2':
					TableSelect5 = 'Numrame = 02A';
					return TableSelect5;
					break;
					case '3':
					TableSelect5 = 'Numrame = 03A';
					return TableSelect5;
					break;
					case '4':
					TableSelect5 = 'Numrame = 04A';
					return TableSelect5;
					break;
					case '5':
					TableSelect5 = 'Numrame = 25A';
					return TableSelect5;
					break;
					case '6':   
					TableSelect5 = 'Numrame = 65A';
					return TableSelect5;
					break;
				}
			}
			var TableSelect5 = switchresult5(e);

			//Créer tableau pour stocker les données de la BDD

			// Appeller les données dans la base de données avec les variables de commandes mises bout a bout et les stocker dans le tableau
			//Créer ma chaine d'appel
			var TableSelect = 'SELECT * WHERE ' + TableSelect1 + ' & ' + TableSelect2 +' & ' + TableSelect3 + ' & ' + TableSelect4 + ' & ' + TableSelect5;
			console.log(TableSelect);
			//Faire l'appel get coté serveur pour recevoir un json des données de la BDD
			$.ajax({
				type: 'GET',
				url: '/Prototype/views%203/server.js',
				// Envoie des elements necessaires pour le controleur (action a faire + demande a la bdd)
				data : /*'action='+action+*/'query='+TableSelect,
				dataType : 'json',
				timeout: 3000,
				//si succes, on recupere les données, on les transforme en une chaine et on la rentre dans un tableau temporaire
				success: function(data) {
					console.log('la requête a abouti');
					var array = jQuery.parseJSON(data);
					console.log('creation tableau reussi');
					var myArray = new Array()();
					array.forEach(function(object) {
						for(var i = 0; i < array.length; i++) {
							myArray[0][i]=object.id;
							myArray[1][i]=object.Site;
							myArray[2][i]=object.Serie;
							myArray[3][i]=object.Sousserie;
							myArray[4][i]=object.Visite;
							myArray[5][i]=object.Numrame;
						}
						console.log('testCréation myArray');
					});
					//on envoit les données du tableau temporaire dans le tableau Tables de notre page index.html
					//datatable pour lus facilement passer dun tableau js a un tableau html
					//on commence par supprimer les elements du tableau present sur la page
					for(var i = 0; i < array.length; i++) {
						$('TableColTitre'+ i).remove();
					}
					//ensuite, on rentre les nouvelles valeurs du tableau dans la tables html
					for(var i = 0; i < myArray.length; i++) {
						//on ajoute un element tr
						$('<tr class = "TableColTitre"'+ i + '></tr>').appendTo($('.TableItem'));
						for(var j = 1; j < myArray[0].length-1; j++){//8
							//on remplie l'element tr qui vient d'etre créer avec les elements th
							$('<th class = "TableLigneTitre">'+ myArray[i][j]+ '</th>').appendTo($('.TableColTitre'+ i));
						}
						// var myArray[0][i]=object.id;
						// var myArray[1][i]=object.Site;
						// var myArray[2][i]=object.Serie;
						// var myArray[3][i]=object.Sousserie;
						// var myArray[4][i]=object.Visite;
						// var myArray[5][i]=object.Numrame;
					}
					// $('element a envoyer').appendTo($('cible de l element'));
					console.log('test changement des tables html');
				},
				error: function() {
					console.log('La requête n\'a pas abouti');     
				}
			});

			// $('#Tables').load('index.html #modif1', function() {
			// 	alert('La première zone a été mise à jour');
			// });
		});
		});