$(document).ready(function() {
	var pressd = 0;
	// Expand Panel
	$("#open").click(function(){
		$("div#panel").slideDown("slow");
		pressd = 1;
	
	});	
	$(".join").click(function(){
		if (pressd==0){
			$("div#panel").slideDown("slow");
			pressd = 1;
		}else{
			$("div#panel").slideUp("slow");	
			pressd = 0;
		}
		$("#toggle a").toggle();
	
	});	
	
	$("#leftopen").click(function(){
		if (pressd==0){
			$("div#panel").slideDown("slow");
			pressd = 1;
		}else{
			$("div#panel").slideUp("slow");	
			pressd = 0;
		}
		$("#toggle a").toggle();
	
	});	
	
	// Collapse Panel
	$("#close").click(function(){
		$("div#panel").slideUp("slow");	
		pressd = 0;
	});		
	
	// Switch buttons from "Log In | Register" to "Close Panel" on click
	$("#toggle a").click(function () {
		$("#toggle a").toggle();
	});		
		
});