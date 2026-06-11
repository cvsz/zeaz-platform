function load_image(imageSrc,gameName,gameId){
  // when the DOM is ready
  var img = new Image();
  // wrap our new image in jQuery, then:
  $(img)
	// once the image has loaded, execute this code
	.load(function () {
	  // set the image hidden by default    
	  $(this).hide();
	
	  // with the holding div #game+gameId, apply:
	  $('#game'+gameId)
		// remove the loading class (so no background spinner), 
		.parent().removeClass('loading')
		// then insert our image
	  $('#game'+gameId).append(this);
	
	  // fade our image in to create a nice effect
	  $(this).fadeIn();
	})
	
	// if there was an error loading the image, react accordingly
	.error(function () {
	  // notify the user that the image could not be loaded
	})
	
	// *finally*, set the src attribute of the new image to our image
	.attr(
	{'src':imageSrc,
	'width':'150',
	'height':'120',
	'style':'border:2px solid #000000;',
	'alt':"Play "+gameName,
	'title':"Play "+gameName,}
	);
}
function jump(sLink, sWidth, sHeight) {

  window.open(sLink, "_games");

}
function close_game(){
	history.go(-1);
}
function gamesrc() {
	//alert('t0');
	//var oldsrc = document.getElementById('image'+id).src;
	//var newsrc = oldsrc.replace('preview.gif','game.gif');
	//$('#image'+id).fadeTo('fast', '', function() {$(this).attr("src",newsrc);});	
	$('#gamepic').stop().animate({"opacity": "0"}, "slow");

}
function previewsrc() {
	///alert('t1');
	//var oldsrc = document.getElementById('image'+id).src;
	//var newsrc = oldsrc.replace('game.gif','preview.gif');
	//$('#image'+id).fadeTo('slow', '', function() {$(this).attr("src",newsrc);});
	$('#gamepic').stop().animate({"opacity": "1"}, "slow");
}
function animateSRC(gmid) {
	//alert('t0');
	//var oldsrc = document.getElementById('image'+id).src;
	//var newsrc = oldsrc.replace('preview.gif','game.gif');
	//$('#image'+id).fadeTo('fast', '', function() {$(this).attr("src",newsrc);});	
	//$("#"+gmid).stop().animate({"opacity": "0.5"}, "slow");

}
function logMein_splash() {
	var username = $("#username").val();
	var password = $("#password").val();
	var captcha = $("#captcha").val();
	var rememberMe = $("#rememberMe").val();
	var gtype = $.cookie("gametype");
	$.post("./login_page/logmein.php", { username: username, password: password,rememberMe:rememberMe,captcha:captcha }, function(welcome) { $("#errorMSG").html(welcome); } );
}
function ShowGames(type){
	$("#games").fadeTo(200,0.0,function() {
				$("#games").html('<div style="padding-left:180px;padding-top:50px;"><img src="images/loader.gif" height="45" width="45" align="center"/></div>').fadeTo(500,1.0);
	});
	$.get("includes/list_games.inc.php", { page: type },
   function(data){
	   $("#games").fadeTo(400,0.0,function() {
				$("#games").html('<div style="text-align:center"><img src="images/loader_acc.gif" height="45" width="45"/></div>').html(data).fadeTo(700,1.0);
				$('a[rel*=cws_popup]').facebox();
 				$("a[rel='rules']").facebox();
			});	
   });
   $("#currentgame").css("top",10);
   $.cookie("gametype", type);
}

prevGameId = 0;
function ShowImage(gameid){
	if (gameid!==prevGameId){
	  prevGameId = gameid;
	  var newsrc = $("#gameImg"+gameid).attr("src");
	  var gamesHeight = $("#games").height();
	  var launchgamer = $(".launchgamer"+gameid).attr("href");
	  var launchgamef = $(".launchgamef"+gameid).attr("href");	  
	  var imglaunch = $("#namelaunch"+gameid).attr("href");
	  if (mousey>gamesHeight-240){
			mousey = mousey-(240-(gamesHeight-mousey));
		}
		if (mousey<10){
			mousey=10;
		}
		$("#gamepic").attr("src",newsrc);
		$("#gamebg").attr("src", newsrc.replace('preview','game'));
		$("#currentgame").css("top",mousey);
		$("#launchgamef").attr("href",launchgamef);
		$("#launchgamer").attr("href",launchgamer);
		$("#imglaunch").attr("href",imglaunch);
		//alert(gameid+'<>'+prevGameId);
	}
}

function embedSwf(target, swf, base, width, height) {
	d = document.getElementById( target );
	d.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="' + width + '" height="' + height + '" id="mapcontrols">' +
			'<param name="movie" value="' + swf + '">' +
			'<param name="quality" value="high">' +
			'<param name="wmode" value="transparent"> '+
			'<param name="menu" value="false">' +
			'<param name="width" value="' + width + '">' +
			'<param name="height" value="' + height + '">' +
			'<param name="menu" value="false">' +
			'<param name="scale" value="noscale" />'+
			'<param name="base" value="' + base + '" />' +
			'<param name="allowFullScreen" value="true" />'+
			'<embed allowScriptAccess="sameDomain" src="' + swf + '" menu="false" swLiveConnect="true" quality="high" pluginspage="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash" type="application/x-shockwave-flash" width="' + width + '" height="' + height + '" allowFullScreen="true" wmode="transparent" name="mapcontrols" base="' + base + '">' +
			'</embed>' +
			'</object>';
}

function doContact(){ // function that sends contact data to php
	var name = $("#name").val();
	var email = $("#email").val();
	var attn = $("#attn option:selected").val();
	var vercode = $("#vercode").val();
	var notes = $("#notes").val();
	$.post("./includes/contact.php", { name: name, email: email,attn:attn,vercode:vercode,notes:notes,submit1:'1' }, function(welcome) {  $("#centermenu").fadeOut('slow', function() {
				$("#centermenu").html('<div style="text-align:center"><img src="images/loader_acc.gif" height="45" width="45"/></div>').html(welcome).fadeIn('slow');
	});});
}
// www.zcino software functions
function reinit() {
  $('a[rel*=cws_popup]').facebox() ;
}

function showflag() { // show the correct country flag
	var flag = $.cookie("flag");
	$("#flagc").attr("src","images/lang/"+flag+"_flag.gif");
	$("#flagc").css("margin-bottom","0px");
}
function hideflag() { // hide the country flag
	$("#flagc").attr("src","images/lang/x_flag.gif");
	$("#flagc").css("margin-bottom","20px");
}

function changelang(lang) {
var gtype = $.cookie("gametype");
$("#centermenu").fadeTo(200,0.0,function() {
				$("#centermenu").html('<div style="text-align:center"><img src="images/loader_acc.gif" style="margin-left:390px"  height="90" width="90"/></div>').fadeTo(500,1.0);
	});
$.post("./includes/do_select_lang.inc.php", { lang: lang});
setTimeout("window.location='index.php'",500);
}
// www.zcino software login
function logMein() {
$.facebox.close();
var username = $("#modlgn-username").val();
var password = $("#modlgn-passwd").val();
var rememberMe = $("#rememberMe").val();
var gtype = $.cookie("gametype");
$.post("./do_login.php", { username: username, password: password,rememberMe:rememberMe }, function(welcome) { $("#loginDiv").html(welcome); } );
 setTimeout( function()
      { // send the login details to the php
$("#loginDiv").html('Loading...').load('./do_login.php');	  
$("#showname").html('Loading...').load('./includes/do_name.inc.php'); // update the div that shows the name or "Hello,Guest" text
$("#open").html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="25" width="25"/></div>').load('./includes/do_status.inc.php');// update the div that shows the credits
$("#registerDiv").fadeTo('slow', '', function() {
											$(this).html('<div style="text-align:left;padding-top:60px;padding-left:140px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("do_register.php");
											});
ajaxgamestype(gtype);
	  },1200);
}


// www.zcino software logout
function logMeOut() {
$.facebox.close();
var username = $("#usernameId").val();
var password = $("#passwordId").val(
);
var gtype = $.cookie("gametype");

$("#loginDiv").html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load('./do_logout.php');
 setTimeout( function()
      {
$("#showname").html('Loading...').load('./includes/do_name.inc.php');
$("#open").html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load('./includes/do_status.inc.php');
$("#registerDiv").fadeTo('slow', '', function() {
											$(this).html('<div style="text-align:left;padding-top:60px;padding-left:140px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("do_register.php");
											});
ajaxgamestype(gtype);
	  },500);
}

function refreshcash() { // function that refreshes the credits div and animates the refresh icon
	$("#showname").html('Loading...').load('./includes/do_name.inc.php',function(data){
		if (data.search('Hello')){
		$("#registerDiv").fadeTo('slow', '', function() { // updates the register form with the new language
											$(this).html('<div style="text-align:left;padding-top:60px;padding-left:140px"><img src="images/loader_acc.gif" height="25" width="25"/></div>').load("do_register.php");
											});
$("#loginDiv").fadeTo('slow', '', function() { // updates the login form with the new language
											$(this).html('<div style="text-align:left;padding-top:60px;padding-left:10px"><img src="images/loader_acc.gif" height="25" width="25"/></div>').load("do_login.php");
											});
		}
	});
	$("#cashrefresh").attr("src","images/reficonani.gif");
}
function normalimg() { // function that stops animating the refresh icon
	$("#cashrefresh").attr("src","images/reficon.png");
}
// www.zcino show register form
function refreshGP() {
$('#registerDiv').fadeOut('slow', function() {
				$.post("./do_register.php", {}, function(welcome) { $("#registerDiv").html(welcome).fadeIn('slow'); } );
											});
}


// www.zcino software proccess registration
function registerMe() {

var usernameReg = $("#usernameReg").val();
var emailReg = $("#emailReg").val();
var captchaReg = $("#captchaReg").val();
var valdo = 1;
$.post("./do_register.php", {valdo: valdo, usernameReg: usernameReg,emailReg: emailReg,captchaReg: captchaReg}, function(welcome) { $("#registerDiv").html(welcome); // send data to the php register file
});
}

function showcontent(leftmenu,page) { // show the content ( left menu and middle page )
	if (page=='contact'){
	 $("#centermenu").animate({height: 'toggle'},700, function() {
			$("#centermenu").html('<div style="text-align:center"><img src="images/loader_acc.gif" style="margin-left:390px" height="90" width="90"/></div>').load("includes/contact.php").fadeIn('slow');
			});	
	}else{
		if (page=='home'){
			window.location = '';	
		}else{
	 $("#centermenu").animate({height: 'toggle'},700, function() {
		 $("#centermenu").html('<div style="text-align:center"><img src="images/loader_acc.gif" style="margin-left:390px"  height="90" width="90"/></div>').animate({height: 'toggle'},700, function() {
			 $.post("./pages/load_page.php", {page: page}, function(welcome) { 
			 	$("#centermenu").animate({height: 'toggle'},700, function() {
					$("#centermenu").animate({height: 'toggle'},700, function() {
						$("#centermenu").html(welcome);
				 	});
			 	});
			 });
		 });
	 });
	}
	}
	//alert($("#centermenu").height());
	 $('.home').css('background','');
	 $('.affiliate').css('background','');
	 $('.promotions').css('background','');
	 $('.responsible_gam').css('background','');
	 $('.gamesid').css('background','');
	 $('.toc').css('background','');
	 $('.contact').css('background','');	 
     $('.'+page).css('background','url("template_files3/top-menu-rollover.png") repeat-x');
	 reinit();
}



function referafriend() { // refer a friend function
	var friendemail = $("#friendemail").val();
	var friendname = $("#friendname").val();
	$.post("./includes/referafriend.inc.php", { friendemail: friendemail,friendname:friendname}, function(welcome) { $("#referafriend").html(welcome); } );
}

function randomXToY(minVal,maxVal,floatVal)
{
  var randVal = minVal+(Math.random()*(maxVal-minVal));
  return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}
// www.zcino software show games based on category
function ajaxgamestype(type) {

		 $('.home').css('background','');
		 $('.affiliate').css('background','');
		 $('.promotions').css('background','');
		 $('.responsible_gam').css('background','');
		 $('.gamesid').css('background','');
		 $('.toc').css('background','');
		 $('.contact').css('background','');	 
		 $('.gamesid').css('background','url("template_files3/top-menu-rollover.png") repeat-x');

	$("#centermenu").fadeTo(200,0.0,function() {
				$("#centermenu").html('<div style="text-align:center"><img src="images/loader_acc.gif" style="margin-left:390px"  height="90" width="90"/></div>').fadeTo(500,1.0);
	});
    $.get("includes/showgames.inc.php", { page: type },
    function(data){
	   $("#centermenu").fadeTo(400,0.0,function() {
				$("#centermenu").html('<div style="text-align:center"><img src="images/loader_acc.gif" style="margin-left:390px"  height="90" width="90"/></div>').html(data).fadeTo(700,1.0);
				$('a[rel*=cws_popup]').facebox();
 				$("a[rel='rules']").facebox();
			});	
			
   });
   $.cookie("gametype", type);
   reinit();
}


function voteRat(j,q,t,c,id) { // function that processes the game votes
$.ajax({
	type: "POST",
  	url: 'rpc.php',
  	data: "j=" + j + "&q=" + q + "&t=" + t + "&c=" + c,
  	success: function(data) {
   	 $('#vote'+id).html(data);
  }
});
}



function doChangeMyDetails() { // process data sent from user change user details form
var email = $("#email").val();
var doby = $("#doby").val();
var dobm = $("#dobm").val();
var dobd = $("#dobd").val();
var street = $("#street").val();
var zip = $("#zip").val();
var ort = $("#ort").val();
if(document.form2.ip_notify.checked == true) { var ipnt = 1;}else { var ipnt = 0;}
var country = $("#country option:selected").val();
var mobiletel = $("#mobiletel").val();
$.post("./includes/do_acc_change_details.inc.php", { ip_notify:ipnt,email: email,doby: doby,dobm: dobm,dobd: dobd,street: street,zip: zip,ort: ort,country: country,mobiletel: mobiletel }, function(welcome) { $("#loginDiv").html(welcome); } );
}



function doChangeMyPw() { // process data sent by change user password form
var oldpw = $("#oldpw").val();
var newpw1 = $("#newpw1").val();
var newpw2 = $("#newpw2").val();
var secans = $("#secans").val();
$.post("./includes/do_acc_change_pw.inc.php", { oldpw: oldpw,newpw1: newpw1,newpw2: newpw2,secans: secans}, function(welcome) { $("#loginDiv").html(welcome); } );
}

function doRedeemBonus(bonusid) { // process data sent by BONUS RECEIVE form
$.post("./includes/doRedeem.inc.php", { bonusid: bonusid}, function(welcome) { $("#loginDiv").html(welcome); } );
}

function doDeposit() { // process data sent by DEPOSIT form
var method = $("#method option:selected").text();
var amount = $("#amount").val();
var email = $("#email").val();
var bonus_code = $("#bonus_code").val();
$.post("./includes/do_acc_deposit.inc.php", { method: method,bonus_code:bonus_code,amount: amount,email: email}, function(welcome) { $("#loginDiv").html(welcome); } );
}



function doWithdraw() { // process data sent by BONUS REDEEM form
var method = $("#method option:selected").text();
var amount = $("#amount").val();
var email = $("#email").val();
var accountno = $("#accountno").val();
var branch = $("#branch").val();
var secans = $("#secans").val();
$.post("./includes/do_acc_withdraw.inc.php", { method: method,amount: amount,email: email,accountno:accountno,branch:branch,secans:secans}, function(welcome) { $("#loginDiv").html(welcome); } );
}


function doRedeem() {  // process data sent by coupon bonus enter form
var code = $("#code").val();
$.post("./includes/do_acc_redeem.inc.php", { code: code}, function(welcome) { $("#loginDiv").html(welcome); } );
}

function doOrder() {  // process data sent by coupon bonus enter form
var address = $("#address").val();
var productid = $("#productid").val();
$.post("./includes/points_shop_do.inc.php", { address: address,productid:productid }, function(welcome) { $("#askAddress").html(welcome); } );
}

function askAddress(id) {  // process data sent by coupon bonus enter form
$.post("./includes/points_shop_do.inc.php", { id: id}, function(welcome) { $("#centermenu").html(welcome); } );
}

function doTransfer() { // transfer money from player to player
var receiver = $("#receiver").val();
var amount = $("#amount").val();
var secans = $("#secans").val();
var uid = $("#uid").val();
$.post("./includes/do_acc_transfer.inc.php", { receiver: receiver,amount: amount,secans: secans,uid:uid}, function(welcome) { $("#loginDiv").html(welcome); } );
}


function doClose() { // process data sent by the CLOSE ACCOUNT form
var pass = $("#pass").val();
var secans = $("#secans").val();
var time = $("#time").val();
var reason = $("#reason").val();
$.post("./includes/do_acc_close.inc.php", { pass: pass,secans: secans,time: time,reason: reason}, function(welcome) { $("#loginDiv").html(welcome); } );
}
// www.zcino software functions
// refresh balance functions
var timeok = 1;
function redotimeok() {
	timeok = 1;
	setTimeout(leave,500);
}
//
function onmenter()
{
if (timeok == 1) 
    {
  enter();
  timeok = 0;
	}
onmleave();
}
//
function onmleave()
{
  setTimeout(redotimeok, 5000);
}
//

function enter(){
  $("#showname").load('./includes/do_name.inc.php');
  $("#cashrefresh").attr("src","images/reficonani.gif");
}

function leave(){
  $("#cashrefresh").attr("src","images/reficon.png");
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
