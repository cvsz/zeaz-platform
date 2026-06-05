jQuery.fn.fadeIn = function(speed, callback) { 
    return this.animate({opacity: 'show'}, speed, function() { 
        if (jQuery.browser.msie)  
            this.style.removeAttribute('filter');  
        if (jQuery.isFunction(callback)) 
            callback();  
    }); 
}; 
 
jQuery.fn.fadeOut = function(speed, callback) { 
    return this.animate({opacity: 'hide'}, speed, function() { 
        if (jQuery.browser.msie)  
            this.style.removeAttribute('filter');  
        if (jQuery.isFunction(callback)) 
            callback();  
    }); 
}; 
 
jQuery.fn.fadeTo = function(speed,to,callback) { 
    return this.animate({opacity: to}, speed, function() { 
        if (to == 1 && jQuery.browser.msie)  
            this.style.removeAttribute('filter');  
        if (jQuery.isFunction(callback)) 
            callback();  
    }); 
}; 

function showPopup(pass){
	alert('Password='+pass);
}

function showPopup2(pass){
	alert('Answer='+pass);
}

function check_value(id){
	
}		
var ajax_request;
function show(file) {
	$(".tipsy").remove();
	if(typeof ajax_request !== 'undefined'){
        ajax_request.abort();
	}
	$("#show").fadeTo(300,1.0,function() {
		$("#show").html('<div style="text-align:center;padding:100px;"><img src="images/loading.gif" height="75" width="75"/></div>')
		ajax_request = $.ajax({
		  type: "POST",
		  url: 'includes/show/'+file+'.inc.php',
		  success: function(msg){
			   display(msg);
		  } ,
		  error:function(msg){
			  display('<h2 style="padding-top:30px;padding-bottom:30px">Requested page not found</h2>');
		  }
		});
	});	
	
}
function showparam(file,param) {
	$(".tipsy").remove();
	if(typeof ajax_request !== 'undefined'){
        ajax_request.abort();
	}
	param = encodeURI(param);
	$("#show").fadeTo(300,1.0,function() {
		$("#show").html('<div style="text-align:center;padding:100px;"><img src="images/loading.gif" height="75" width="75"/></div>')
		ajax_request = $.ajax({
		  type: "POST",
		  url: 'includes/show/'+file+'.inc.php',
		  data: param,
		  success: function(msg){
			   display(msg);
		  }
		});
	});	
	
}
function display(msg){
	$("#show").html(msg).fadeTo(300,1.0);
}
function dissapear(div){
	$("#"+div).fadeTo(300,0);
}


function sleep(delay){
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}


function AssignPosition(d) {
	var t = d.replace('descimage','');
	div = $('#image'+t);
	var position = div.position();
	$('#descimage'+t).css('top',position.top+160);
	$('#descimage'+t).css('left',position.left);
}
function HideContent(d) {
	if(d.length < 1) { return; }
	document.getElementById(d).style.display = "none";
}
function ShowContent(d) {
	if(d.length < 1) { return; }
	var dd = document.getElementById(d);
	AssignPosition(d);
	dd.style.display = "block";
}
function ReverseContentDisplay(d) {
	if(d.length < 1) { return; }
	var dd = document.getElementById(d);
	AssignPosition(d);
	if(dd.style.display == "none") { dd.style.display = "block"; }
	else { dd.style.display = "none"; }
}
function update_dep_wt_us(){
	var fadeVal1 = 200;
	$('#dtotal').fadeTo(fadeVal1,0.0);
	$('#dapproved').fadeTo(fadeVal1,0.0);
	$('#ddeclined').fadeTo(fadeVal1,0.0);
	$('#dpending').fadeTo(fadeVal1,0.0);
	$('#dtoday').fadeTo(fadeVal1,0.0);
	
	$('#wtotal').fadeTo(fadeVal1,0.0);
	$('#wapproved').fadeTo(fadeVal1,0.0);
	$('#wdeclined').fadeTo(fadeVal1,0.0);
	$('#wpending').fadeTo(fadeVal1,0.0);
	$('#wtoday').fadeTo(fadeVal1,0.0);
	
	$('#utotal').fadeTo(fadeVal1,0.0);
	$('#uapproved').fadeTo(fadeVal1,0.0);
	$('#udeclined').fadeTo(fadeVal1,0.0);
	$('#upending').fadeTo(fadeVal1,0.0);
	$('#utoday').fadeTo(fadeVal1,0.0);
	
	$.post("includes/show/_inc_dep_wt_us.inc.php", { "update": "1" },
	function(data){
		var fadeVal2 = 800;
	   $('#dtotal').html(data.dtotal).fadeTo(fadeVal2,1.0);
	   $('#dapproved').html(data.dapproved).fadeTo(fadeVal2,1.0);
	   $('#ddeclined').html(data.ddeclined).fadeTo(fadeVal2,1.0);
	   $('#dpending').html(data.dpending).fadeTo(fadeVal2,1.0);
	   $('#dtoday').html('+'+data.dtoday).fadeTo(fadeVal2,1.0);
	   if (data.dtoday>0){
		   $("#dtoday").attr('class', 'positive');
	   }else{
		   $("#dtoday").attr('class', 'zero');
	   }
	   $('#wtotal').html(data.wtotal).fadeTo(fadeVal2,1.0);
	   $('#wapproved').html(data.wapproved).fadeTo(fadeVal2,1.0);
	   $('#wdeclined').html(data.wdeclined).fadeTo(fadeVal2,1.0);
	   $('#wpending').html(data.wpending).fadeTo(fadeVal2,1.0);
	   $('#wtoday').html('+'+data.wtoday).fadeTo(fadeVal2,1.0);
	   if (data.wtoday>0){
		   $("#wtoday").attr('class', 'positive');
	   }else{
		   $("#wtoday").attr('class', 'zero');
	   }
	   $('#utotal').html(data.utotal).fadeTo(fadeVal2,1.0);
	   $('#uapproved').html(data.uapproved).fadeTo(fadeVal2,1.0);
	   $('#udeclined').html(data.udeclined).fadeTo(fadeVal2,1.0);
	   $('#upending').html(data.upending).fadeTo(fadeVal2,1.0);
	   $('#utoday').html('+'+data.utoday).fadeTo(fadeVal2,1.0);
	   if (data.utoday>0){
		   $("#utoday").attr('class', 'positive');
	   }else{
		   $("#utoday").attr('class', 'zero');
	   }
	 }, "json");
}

function update_bet_won_pf(){
	var fadeVal1 = 200;
	$('#betUpdate').fadeTo(fadeVal1,0.0);
	$('#wonUpdate').fadeTo(fadeVal1,0.0);
	$('#pfUpdate').fadeTo(fadeVal1,0.0);
	$('#cashUpdate').fadeTo(fadeVal1,0.0);
	
	$.post("includes/show/_inc_bet_won_pf.inc.php", { "update": "1" },
	function(data){
		var fadeVal2 = 800;
	   if (data.betUpdate>0){
		   $("#betUpdate").attr('class', 'roundPos');
		   data.betUpdate = '+'+data.betUpdate;
	   }else{
		   if (data.betUpdate==0){
			   $("#betUpdate").attr('class', 'roundZero');
		   }else{
			   $("#betUpdate").attr('class', 'roundNeg');
		   }
	   }
	   if (data.wonUpdate>0){
		   $("#wonUpdate").attr('class', 'roundPos');
		   data.wonUpdate = '+'+data.wonUpdate;
	   }else{
		   if (data.wonUpdate==0){
			   $("#wonUpdate").attr('class', 'roundZero');
		   }else{
			   $("#wonUpdate").attr('class', 'roundNeg');
		   }
	   }
	   if (data.pfUpdate>0){
		   $("#pfUpdate").attr('class', 'roundPos');
		   data.pfUpdate = '+'+data.pfUpdate;
	   }else{
		   if (data.pfUpdate==0){
			   $("#pfUpdate").attr('class', 'roundZero');
		   }else{
			   $("#pfUpdate").attr('class', 'roundNeg');
		   }
	   }
	   $('#cashUpdate').html(data.cash).fadeTo(fadeVal2,1.0);
	   $('#betUpdate').html(data.betUpdate+'%').fadeTo(fadeVal2,1.0);
	   $('#wonUpdate').html(data.wonUpdate+'%').fadeTo(fadeVal2,1.0);
	   $('#pfUpdate').html(data.pfUpdate+'%').fadeTo(fadeVal2,1.0);
	 }, "json");
}



function update_settings() {
				var currency = $("#currency").val();
				var template = $("#template option:selected").val();
				var phone_number = $("#phone_number").val();
				var lbonus = $("#lbonus").val();
				var reg_bonus = $("#reg_bonus").val();
				var mind = $("#mind").val();
				var maxd = $("#maxd").val();
				var minw = $("#minw").val();
				var maxw = $("#maxw").val();
				<!--var popup = $("#popup").val();-->
				var p2 = 'popup=0';
				var thousand_sep = $("#thousand_sep").val();
				var allowfunplay = $("#allowfunplay").val();
				var allowrealplay = $("#allowrealplay").val();
				var allowent = $("#allowent").val();
				var points_shop = $("#points_shop").val();
				var global_mode = $("#global_mode").val();
				<!--if(document.ff1.popup.checked == true) { var p2 = 'popup=1';}else {p2 = 'popup=0';}-->
				if(document.ff1.thousand_sep.checked == true) { var th2 = '&thousand_sep=1';}else {th2 = '&thousand_sep=0';}
				if(document.ff1.allowfunplay.checked == true) { var f2 = '&allowfunplay=1';}else {f2 = '&allowfunplay=0';}
				if(document.ff1.allowrealplay.checked == true) { var r2 = '&allowrealplay=1';}else {r2 = '&allowrealplay=0';}
				if(document.ff1.allowent.checked == true) { var s2 = '&allowent=1';}else {s2 = '&allowent=0';}
				if(document.ff1.points_shop.checked == true) { var points_shop = 'points_shop=1';}else {points_shop = 'points_shop=0';}
				if(document.ff1.global_mode.checked == true) { var global_mode = 'global_mode=1';}else {global_mode = 'global_mode=0';}
				if(document.ff1.vipmode.checked == true) { var vipmode = 'vipmode=1';}else {vipmode = 'vipmode=0';}
				showparam('cas_general','update=1&'+'currency='+currency+'&mind='+mind+'&maxd='+maxd+'&minw='+minw+'&maxw='+maxw+'&lbonus='+lbonus+'&reg_bonus='+reg_bonus+'&template='+template+'&'+th2+'&'+p2+'&'+points_shop+'&'+global_mode+'&phone_number='+phone_number+f2+r2+s2+'&'+vipmode);
				};