function randomFromTo(from, to){
   return Math.floor(Math.random() * (to - from + 1) + from);
}
function addCommas(nStr){
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '.00';
	if (x2.length=='2'){
		x2 = x2 + '0';
	}
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	number = x1 + x2;
	if (number.substring(2,3)==0){
		return '$ ' + number.substring(4,number.length-2) + '<span style="font-size:14px">'+number.substring(number.length-2,number.length)+'</span>';
	}else{
		return '$ ' + number.substring(2,number.length-2) + '<span style="font-size:14px">'+number.substring(number.length-2,number.length)+'</span>';
	}
}
function showJackpot(div){
	var jackp = Math.round((new Date()).getTime() / 100  * 1.14)/100;
	$("#casino_jackpot_total_ticker").html(addCommas(jackp));
	setTimeout(showJackpot,randomFromTo(200,1700));
}