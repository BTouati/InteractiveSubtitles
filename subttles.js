//This file was made by Benjamin Touati. It works but it remains to be improved, especially the comments are gibberish frenglish

function load() {
	var request;

	if (window.XMLHttpRequest) { // Firefox
		request = new XMLHttpRequest();
	}
	else if (window.ActiveXObject) { // IE
		request = new ActiveXObject("Microsoft.XMLHTTP");
	}
	else {
		return; // Unsuported
	}	

	request.open('GET', '/videojs-transcript-master/captions/captions.en.vtt', false); // put here the link to the subtitles of the video
	request.send(null);

	return request.responseText;
}

//create links.
function createLinks(start, text){
	var newP='' ;

	for (i=0; i<text.length; i+=1){

		newP=newP + '<p id="sen'+i+'"><A href="#" onClick=player.currentTime='+start[i]+';>'+text[i]+'</A></p>'
	}

	document.getElementById("page").innerHTML=newP; 
}
function recordSubtitles(){
	subtitles=load();

//si on est face à un retour à la ligne et que ce retour à la ligne n'est pas précédé d'une lettre(i.e. si c'est un nombre ou un retour à la ligne), le retour à laligne est replacé par '-->'
	var back=subtitles[6]
	for (i=0; i<subtitles.length; i+=1) {
		if (subtitles[i]==back && isNaN(subtitles[i-1])==false){
			subtitles=subtitles.slice(0,i)+'-->'+subtitles.slice(i+1, subtitles.length);
			i+=1;
		
		}

	}
	for (i=7; i<subtitles.length; i+=1) {
		if (subtitles[i]==back && i>6){
			subtitles=subtitles.slice(0,i-1)+ subtitles.slice(i+1, subtitles.length);
		}
	}
	subtitles=subtitles.split('-->');
	return subtitles;
}



//create the text list and the time list wher time[0]= starts and time[1]=ends en gros la c'est le découpage, mais il faut récuper p
function splitTextTime(subtitles){
	text=[];
	start=[];
	end=[];
	for (i=1; i<subtitles.length; i+=3) {
		size=text.length;
		start[size]=subtitles[i];
		end[size]=subtitles[i+1];
		text[size]=subtitles[i+2];
	}
 	return {start: start, end: end, text: text};
}


//convert string into number (to be readible by the player) Note: faire une fonction
function ConvertTime(time){
	for(i=0; i<time.length; i+=1) {	
		time1=time[i].split(":");
		time2=(+time1[0])*3600+(+time1[1])*60+(+time1[2]);
		time[i]=time2;
	}
	
	return time;
}
//afficher subtitles to do: expliquer le délire avec cette histoire de cut

function cutCount(text){
	cuts=0
	for (b=0; b<text.length; b+=35){
		cuts+=1;
	}
	return cuts;
}

function cutting(text, cuts){
	var step=[];
	for (i=0; i<cuts; i+=1){
		step[i]=Math.trunc((i+1)*(text.length-1)/cuts);
	}
	return step;
}
function makeCompteur(sentence_id){
//transformer ça en multiplication serait plus rationnel
	compt=0;
	for (i=0; i<sentence_id; i+=1){
		compt=compt+33,3;

	}
	

	return compt;
}
function follow_window(sentence_id){
	if (makeCompteur(sentence_id)>mydiv.scrollTop && makeCompteur(sentence_id)<mydiv.scrollTop+mydiv.offsetHeight){
		console.log(makeCompteur(sentence_id));
		mydiv.scrollTop=makeCompteur(sentence_id);
	}
}

//START
// Let's input the subtitles

subtitles=recordSubtitles();

//let's separe the subtitltes into thre lists: 'text' where the text is sotred, 'start' where the start of each subtitle is stored and 'end' where the end of each subtitle is stored (note that text and its correspondig start and end share the sameid in each lists)
textTime=splitTextTime(subtitles);
text=textTime.text;
start=textTime.start;
end=textTime.end;

//converting h:min:s into s
start=ConvertTime(start);
end=ConvertTime(end);

//put the subtitltes into the window, each subtitle is linked to its corresponding position in the video
createLinks(start, text);

//let's split the text into four big groups
var cuts=cutCount(text);
var step=cutting(text, cuts);


var mydiv = document.getElementById("page");

//put to 0 some variables that will be usefull
var former_surlignage=0;
var recorded_position=0;
var nextPosition=0;

player = document.querySelector('#video');
function update(player) {
//main function. Penser à transformer une partie en fonction

	if (player.currentTime>=start[nextPosition] || player.currentTime<start[recorded_position]){ //s'il y a déjà eu un sous titre surligné, la boucle for ne se lancera que si le currentTime est inférieur au départ de la dernière position ou s'il est supérieur au départ de la dernière position+1 (i.e. la dernière positon+1 étant la futur position si on ne fait rien)

		for (i=0; i<cuts; i+=1){
			j=Math.trunc(i*(text.length-1)/cuts)
			
			if (player.currentTime<=end[step[i]]){
				//console.log(player.currentTime, i, j);
				for (j; j<=step[i]; j+=1){
					
					console.log(recorded_position, j)
	
			    		if(player.currentTime>start[j] && player.currentTime<end[j]) {
	
						
						surlignage=document.getElementById("sen"+j);
						if (j-recorded_position<-1 || j-recorded_position>1){
							mydiv.scrollTop=makeCompteur(j);
						}
						if (surlignage.innerHTML.slice(0,5)!="<span"){
							console.log(surlignage.innerHTML);
							surlignage.innerHTML='<span style="background:#FFFF00">'+surlignage.innerHTML+'</span>';
							console.log(surlignage.innerHTML);
							if(former_surlignage!=0){
								former_surlignage.innerHTML=former_surlignage.innerHTML.slice(33,former_surlignage.innerHTML.length-7);
								}
							former_surlignage=surlignage;
							follow_window(j);
							recorded_position=j
							nextPosition=j+1
						}
						return;
					}
					
				}
				
			}
		}
	}
	return;
}


