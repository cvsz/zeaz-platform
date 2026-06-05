<?php
#developed by www.zcino
@require_once('config.inc.php');
if (!isset($_SESSION['username'])) { 
		echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['You+are+not+logged+in'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
				$(\'#registerDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_register.php").fadeIn(\'slow\');
			});
</script>';
		exit;
	}
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE `login`='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con']));
$row = mysqli_fetch_array($sql);
?>
<form method="post" name="form2" onsubmit="return false">
<div>
<div style="float:left;width:140px;">
<table width="496" cellpadding="0" cellspacing="0">
<tr style="height:22px">
<td>
<b><?php if ($row['gender']=='M') { echo 'Mr.';}else{ echo 'Ms.';}?> <?php echo $row['name'];?></b><br />
<span class="inform"><?php echo $lang['Name+cannot+be+changed'];?></span>
</td>
<td>
<span style="font-weight:bold;color:#CFF"><?=$lang['Request+email+approval']?> <br />
<?=$lang['when+my+login+IP+changes']?></span>
<input <?php if ($row['ip_notify']=='1'){echo 'checked';}?> type="checkbox" id="ip_notify" name="ip_notify" style="padding:5px; vertical-align:middle"/>
</td>
<tr style="height:22px">
  <td width="177"><?php echo $lang['Date+of+birth'];?> <span style="color:#999">E.g.(12/29/1976)</span></td><td width="317">
  <?php
  $date_pieces = explode('/',$row['dob']);
  ?>
  <input class="field" name="dobm" type="text" style="font-size:12px;width:25px" id="dobm" value="<?php echo $date_pieces[0]; ?>" />
  <input class="field" name="dobd" type="text" style="font-size:12px;width:25px" id="dobd" value="<?php echo $date_pieces[1]; ?>" />
  <input class="field" name="doby" type="text" style="font-size:12px;width:70px" id="doby" value="<?php echo $date_pieces[2]; ?>" /></td>
</tr>
<tr style="height:22px">
<td><?php echo $lang['Email'];?></td><td><input class="field" name="email" type="text" style="font-size:12px;width:125px" id="email" value="<?php echo $row['email']; ?>" /></td>
</tr>
<tr style="height:22px">
<td><?php echo $lang['Street'];?></td><td><input class="field" name="street" type="text" style="font-size:12px;width:125px" id="street" value="<?php echo $row['street']; ?>" /></td>
</tr>
<tr style="height:22px">
<td><?php echo $lang['ZIP+Code'];?></td><td><input class="field" name="zip" type="text" style="font-size:12px;width:125px" id="zip" value="<?php echo $row['zip']; ?>" /></td>
</tr><tr style="height:22px">
<td><?php echo $lang['City'];?></td><td><input class="field" name="ort" type="text" style="font-size:12px;width:125px" id="ort" value="<?php echo $row['ort']; ?>" /></td>
</tr>
<tr style="height:22px">
<td><?php echo $lang['Phone'];?></td><td><input class="field" name="mobiletel" type="text" style="font-size:12px;width:125px" id="mobiletel" value="<?php echo $row['mobiletel']; ?>" /></td>
</tr>
<tr style="height:22px">
<td><?php echo $lang['Country'];?></td>
<td>
<select name="country" id="country">				
<?php $country = $row['country'];?>						
<option value="0">Please choose a country</option>
<option value="no" <?php if($country=="us"){echo "selected=\"selected\"";} ?>>USA</option>                                      
<option value="se" <?php if($country=="se"){echo "selected=\"selected\"";} ?>>Sweden</option>                                     
<option value="fr" <?php if($country=="fr"){echo "selected=\"selected\"";} ?>>France</option>
<option value="no" <?php if($country=="no"){echo "selected=\"selected\"";} ?>>Norway</option>
<option value="dk" <?php if($country=="dk"){echo "selected=\"selected\"";} ?>>Denmark</option>
<option value="it" <?php if($country=="it"){echo "selected=\"selected\"";} ?>>Italy</option>
<option value="de" <?php if($country=="de"){echo "selected=\"selected\"";} ?>>Germany</option>
<option value="fi" <?php if($country=="fi"){echo "selected=\"selected\"";} ?>>Finland</option>
<option value="pl" <?php if($country=="pl"){echo "selected=\"selected\"";} ?>>Poland</option>
<option value="nl" <?php if($country=="nl"){echo "selected=\"selected\"";} ?>>Netherlands</option>
<option value="be" <?php if($country=="be"){echo "selected=\"selected\"";} ?>>Belgium</option>
<option value="af" <?php if($country=="af"){echo "selected=\"selected\"";} ?>>Afghanistan</option>
<option value="al" <?php if($country=="al"){echo "selected=\"selected\"";} ?>>Albania</option>
<option value="dz" <?php if($country=="dz"){echo "selected=\"selected\"";} ?>>Algeria</option>
<option value="ad" <?php if($country=="ad"){echo "selected=\"selected\"";} ?>>Andorra</option>
<option value="ao" <?php if($country=="ao"){echo "selected=\"selected\"";} ?>>Angola</option>
<option value="ai" <?php if($country=="ai"){echo "selected=\"selected\"";} ?>>Anguilla</option>
<option value="aq" <?php if($country=="aq"){echo "selected=\"selected\"";} ?>>Antarctica</option>
<option value="ag" <?php if($country=="ag"){echo "selected=\"selected\"";} ?>>Antigua and Barbuda</option>
<option value="ar" <?php if($country=="ar"){echo "selected=\"selected\"";} ?>>Argentina</option>
<option value="am" <?php if($country=="am"){echo "selected=\"selected\"";} ?>>Armenia</option>
<option value="aw" <?php if($country=="aw"){echo "selected=\"selected\"";} ?>>Aruba</option>
<option value="au" <?php if($country=="au"){echo "selected=\"selected\"";} ?>>Australia</option>
<option value="at" <?php if($country=="at"){echo "selected=\"selected\"";} ?>>Austria</option>
<option value="az" <?php if($country=="az"){echo "selected=\"selected\"";} ?>>Azerbaidjan</option>
<option value="bs" <?php if($country=="bs"){echo "selected=\"selected\"";} ?>>Bahamas</option>
<option value="bh" <?php if($country=="bh"){echo "selected=\"selected\"";} ?>>Bahrain</option>
<option value="bd" <?php if($country=="bd"){echo "selected=\"selected\"";} ?>>Bangladesh</option>
<option value="bb" <?php if($country=="bb"){echo "selected=\"selected\"";} ?>>Barbados</option>
<option value="by" <?php if($country=="by"){echo "selected=\"selected\"";} ?>>Belarus</option>
<option value="bz" <?php if($country=="bz"){echo "selected=\"selected\"";} ?>>Belize</option>
<option value="bj" <?php if($country=="bj"){echo "selected=\"selected\"";} ?>>Benin</option>
<option value="bm" <?php if($country=="bm"){echo "selected=\"selected\"";} ?>>Bermuda</option>
<option value="bt" <?php if($country=="bt"){echo "selected=\"selected\"";} ?>>Bhutan</option>
<option value="bo" <?php if($country=="bo"){echo "selected=\"selected\"";} ?>>Bolivia</option>
<option value="ba" <?php if($country=="ba"){echo "selected=\"selected\"";} ?>>Bosnia-Herzegovina</option>
<option value="bw" <?php if($country=="bw"){echo "selected=\"selected\"";} ?>>Botswana</option>
<option value="bv" <?php if($country=="bv"){echo "selected=\"selected\"";} ?>>Bouvet Island</option>
<option value="br" <?php if($country=="br"){echo "selected=\"selected\"";} ?>>Brazil</option>
<option value="io" <?php if($country=="io"){echo "selected=\"selected\"";} ?>>British Indian Ocean Territory</option>
<option value="bn" <?php if($country=="bn"){echo "selected=\"selected\"";} ?>>Brunei Darussalam</option>
<option value="bg" <?php if($country=="bg"){echo "selected=\"selected\"";} ?>>Bulgaria</option>
<option value="bf" <?php if($country=="bf"){echo "selected=\"selected\"";} ?>>Burkina Faso</option>
<option value="bi" <?php if($country=="bi"){echo "selected=\"selected\"";} ?>>Burundi</option>
<option value="kh" <?php if($country=="kh"){echo "selected=\"selected\"";} ?>>Cambodia, Kingdom of</option>
<option value="cm" <?php if($country=="cm"){echo "selected=\"selected\"";} ?>>Cameroon</option>
<option value="ca" <?php if($country=="ca"){echo "selected=\"selected\"";} ?>>Canada</option>
<option value="cv" <?php if($country=="cv"){echo "selected=\"selected\"";} ?>>Cape Verde</option>
<option value="ky" <?php if($country=="ky"){echo "selected=\"selected\"";} ?>>Cayman Islands</option>
<option value="cf" <?php if($country=="cf"){echo "selected=\"selected\"";} ?>>Central African Republic</option>
<option value="td" <?php if($country=="td"){echo "selected=\"selected\"";} ?>>Chad</option>
<option value="cl" <?php if($country=="cl"){echo "selected=\"selected\"";} ?>>Chile</option>
<option value="cn" <?php if($country=="cn"){echo "selected=\"selected\"";} ?>>China</option>
<option value="cx" <?php if($country=="cx"){echo "selected=\"selected\"";} ?>>Christmas Island</option>
<option value="cc" <?php if($country=="cc"){echo "selected=\"selected\"";} ?>>Cocos (Keeling) Islands</option>
<option value="co" <?php if($country=="co"){echo "selected=\"selected\"";} ?>>Colombia</option>
<option value="km" <?php if($country=="km"){echo "selected=\"selected\"";} ?>>Comoros</option>
<option value="cg" <?php if($country=="cg"){echo "selected=\"selected\"";} ?>>Congo</option>
<option value="cd" <?php if($country=="cd"){echo "selected=\"selected\"";} ?>>Congo, The Democratic Republic of the</option>
<option value="ck" <?php if($country=="ck"){echo "selected=\"selected\"";} ?>>Cook Islands</option>
<option value="cr" <?php if($country=="cr"){echo "selected=\"selected\"";} ?>>Costa Rica</option>
<option value="hr" <?php if($country=="hr"){echo "selected=\"selected\"";} ?>>Croatia</option>
<option value="cu" <?php if($country=="cu"){echo "selected=\"selected\"";} ?>>Cuba</option>
<option value="cy" <?php if($country=="cy"){echo "selected=\"selected\"";} ?>>Cyprus</option>
<option value="cz" <?php if($country=="cz"){echo "selected=\"selected\"";} ?>>Czech Republic</option>
<option value="dj" <?php if($country=="dj"){echo "selected=\"selected\"";} ?>>Djibouti</option>
<option value="dm" <?php if($country=="dm"){echo "selected=\"selected\"";} ?>>Dominica</option>
<option value="do" <?php if($country=="do"){echo "selected=\"selected\"";} ?>>Dominican Republic</option>
<option value="tp" <?php if($country=="tp"){echo "selected=\"selected\"";} ?>>East Timor</option>
<option value="ec" <?php if($country=="ec"){echo "selected=\"selected\"";} ?>>Ecuador</option>
<option value="eg" <?php if($country=="eg"){echo "selected=\"selected\"";} ?>>Egypt</option>
<option value="sv" <?php if($country=="sv"){echo "selected=\"selected\"";} ?>>El Salvador</option>
<option value="gq" <?php if($country=="gq"){echo "selected=\"selected\"";} ?>>Equatorial Guinea</option>
<option value="er" <?php if($country=="er"){echo "selected=\"selected\"";} ?>>Eritrea</option>
<option value="ee" <?php if($country=="ee"){echo "selected=\"selected\"";} ?>>Estonia</option>
<option value="et" <?php if($country=="et"){echo "selected=\"selected\"";} ?>>Ethiopia</option>
<option value="fk" <?php if($country=="fk"){echo "selected=\"selected\"";} ?>>Falkland Islands</option>
<option value="fo" <?php if($country=="fo"){echo "selected=\"selected\"";} ?>>Faroe Islands</option>
<option value="fj" <?php if($country=="fj"){echo "selected=\"selected\"";} ?>>Fiji</option>
<option value="gf" <?php if($country=="gf"){echo "selected=\"selected\"";} ?>>French Guyana</option>
<option value="tf" <?php if($country=="tf"){echo "selected=\"selected\"";} ?>>French Southern Territories</option>
<option value="ga" <?php if($country=="ga"){echo "selected=\"selected\"";} ?>>Gabon</option>
<option value="gm" <?php if($country=="gm"){echo "selected=\"selected\"";} ?>>Gambia</option>
<option value="ge" <?php if($country=="ge"){echo "selected=\"selected\"";} ?>>Georgia</option>
<option value="gh" <?php if($country=="gh"){echo "selected=\"selected\"";} ?>>Ghana</option>
<option value="gi" <?php if($country=="gi"){echo "selected=\"selected\"";} ?>>Gibraltar</option>
<option value="gr" <?php if($country=="gr"){echo "selected=\"selected\"";} ?>>Greece</option>
<option value="gl" <?php if($country=="gl"){echo "selected=\"selected\"";} ?>>Greenland</option>
<option value="gd" <?php if($country=="gd"){echo "selected=\"selected\"";} ?>>Grenada</option>
<option value="gp" <?php if($country=="gp"){echo "selected=\"selected\"";} ?>>Guadeloupe (French)</option>
<option value="gt" <?php if($country=="gt"){echo "selected=\"selected\"";} ?>>Guatemala</option>
<option value="gn" <?php if($country=="gn"){echo "selected=\"selected\"";} ?>>Guinea</option>
<option value="gw" <?php if($country=="gw"){echo "selected=\"selected\"";} ?>>Guinea Bissau</option>
<option value="gy" <?php if($country=="gy"){echo "selected=\"selected\"";} ?>>Guyana</option>
<option value="ht" <?php if($country=="ht"){echo "selected=\"selected\"";} ?>>Haiti</option>
<option value="hm" <?php if($country=="hm"){echo "selected=\"selected\"";} ?>>Heard and McDonald Islands</option>
<option value="va" <?php if($country=="va"){echo "selected=\"selected\"";} ?>>Holy See (Vatican City State)</option>
<option value="hn" <?php if($country=="hn"){echo "selected=\"selected\"";} ?>>Honduras</option>
<option value="hk" <?php if($country=="hk"){echo "selected=\"selected\"";} ?>>Hong Kong</option>
<option value="hu" <?php if($country=="hu"){echo "selected=\"selected\"";} ?>>Hungary</option>
<option value="is" <?php if($country=="is"){echo "selected=\"selected\"";} ?>>Iceland</option>
<option value="in" <?php if($country=="in"){echo "selected=\"selected\"";} ?>>India</option>
<option value="id" <?php if($country=="id"){echo "selected=\"selected\"";} ?>>Indonesia</option>
<option value="ir" <?php if($country=="ir"){echo "selected=\"selected\"";} ?>>Iran</option>
<option value="iq" <?php if($country=="iq"){echo "selected=\"selected\"";} ?>>Iraq</option>
<option value="ie" <?php if($country=="ie"){echo "selected=\"selected\"";} ?>>Ireland</option>
<option value="il" <?php if($country=="il"){echo "selected=\"selected\"";} ?>>Israel</option>
<option value="ci" <?php if($country=="ci"){echo "selected=\"selected\"";} ?>>Ivory Coast (Cote D'Ivoire)</option>
<option value="jm" <?php if($country=="jm"){echo "selected=\"selected\"";} ?>>Jamaica</option>
<option value="jp" <?php if($country=="jp"){echo "selected=\"selected\"";} ?>>Japan</option>
<option value="jo" <?php if($country=="jo"){echo "selected=\"selected\"";} ?>>Jordan</option>
<option value="kz" <?php if($country=="kz"){echo "selected=\"selected\"";} ?>>Kazakhstan</option>
<option value="ke" <?php if($country=="ke"){echo "selected=\"selected\"";} ?>>Kenya</option>
<option value="ki" <?php if($country=="ki"){echo "selected=\"selected\"";} ?>>Kiribati</option>
<option value="kw" <?php if($country=="kw"){echo "selected=\"selected\"";} ?>>Kuwait</option>
<option value="kg" <?php if($country=="kg"){echo "selected=\"selected\"";} ?>>Kyrgyz Republic (Kyrgyzstan)</option>
<option value="la" <?php if($country=="la"){echo "selected=\"selected\"";} ?>>Laos</option>
<option value="lv" <?php if($country=="lv"){echo "selected=\"selected\"";} ?>>Latvia</option>
<option value="lb" <?php if($country=="lb"){echo "selected=\"selected\"";} ?>>Lebanon</option>
<option value="ls" <?php if($country=="ls"){echo "selected=\"selected\"";} ?>>Lesotho</option>
<option value="lr" <?php if($country=="lr"){echo "selected=\"selected\"";} ?>>Liberia</option>
<option value="ly" <?php if($country=="ly"){echo "selected=\"selected\"";} ?>>Libya</option>
<option value="li" <?php if($country=="li"){echo "selected=\"selected\"";} ?>>Liechtenstein</option>
<option value="lt" <?php if($country=="lt"){echo "selected=\"selected\"";} ?>>Lithuania</option>
<option value="lu" <?php if($country=="lu"){echo "selected=\"selected\"";} ?>>Luxembourg</option>
<option value="mo" <?php if($country=="mo"){echo "selected=\"selected\"";} ?>>Macau</option>
<option value="mk" <?php if($country=="mk"){echo "selected=\"selected\"";} ?>>Macedonia</option>
<option value="mg" <?php if($country=="mg"){echo "selected=\"selected\"";} ?>>Madagascar</option>
<option value="mw" <?php if($country=="mw"){echo "selected=\"selected\"";} ?>>Malawi</option>
<option value="my" <?php if($country=="my"){echo "selected=\"selected\"";} ?>>Malaysia</option>
<option value="mv" <?php if($country=="mv"){echo "selected=\"selected\"";} ?>>Maldives</option>
<option value="ml" <?php if($country=="ml"){echo "selected=\"selected\"";} ?>>Mali</option>
<option value="mt" <?php if($country=="mt"){echo "selected=\"selected\"";} ?>>Malta</option>
<option value="mh" <?php if($country=="mh"){echo "selected=\"selected\"";} ?>>Marshall Islands</option>
<option value="mq" <?php if($country=="mq"){echo "selected=\"selected\"";} ?>>Martinique (French)</option>
<option value="mr" <?php if($country=="mr"){echo "selected=\"selected\"";} ?>>Mauritania</option>
<option value="mu" <?php if($country=="mu"){echo "selected=\"selected\"";} ?>>Mauritius</option>
<option value="yt" <?php if($country=="yt"){echo "selected=\"selected\"";} ?>>Mayotte</option>
<option value="mx" <?php if($country=="mx"){echo "selected=\"selected\"";} ?>>Mexico</option>
<option value="fm" <?php if($country=="fm"){echo "selected=\"selected\"";} ?>>Micronesia</option>
<option value="md" <?php if($country=="md"){echo "selected=\"selected\"";} ?>>Moldavia</option>
<option value="mc" <?php if($country=="mc"){echo "selected=\"selected\"";} ?>>Monaco</option>
<option value="mn" <?php if($country=="mn"){echo "selected=\"selected\"";} ?>>Mongolia</option>
<option value="ms" <?php if($country=="ms"){echo "selected=\"selected\"";} ?>>Montserrat</option>
<option value="ma" <?php if($country=="ma"){echo "selected=\"selected\"";} ?>>Morocco</option>
<option value="mz" <?php if($country=="mz"){echo "selected=\"selected\"";} ?>>Mozambique</option>
<option value="mm" <?php if($country=="mm"){echo "selected=\"selected\"";} ?>>Myanmar</option>
<option value="na" <?php if($country=="na"){echo "selected=\"selected\"";} ?>>Namibia</option>
<option value="nr" <?php if($country=="nr"){echo "selected=\"selected\"";} ?>>Nauru</option>
<option value="np" <?php if($country=="np"){echo "selected=\"selected\"";} ?>>Nepal</option>
<option value="nc" <?php if($country=="nc"){echo "selected=\"selected\"";} ?>>New Caledonia (French)</option>
<option value="nz" <?php if($country=="nz"){echo "selected=\"selected\"";} ?>>New Zealand</option>
<option value="ni" <?php if($country=="ni"){echo "selected=\"selected\"";} ?>>Nicaragua</option>
<option value="ne" <?php if($country=="ne"){echo "selected=\"selected\"";} ?>>Niger</option>
<option value="ng" <?php if($country=="ng"){echo "selected=\"selected\"";} ?>>Nigeria</option>
<option value="nu" <?php if($country=="nu"){echo "selected=\"selected\"";} ?>>Niue</option>
<option value="nf" <?php if($country=="nf"){echo "selected=\"selected\"";} ?>>Norfolk Island</option>
<option value="kp" <?php if($country=="kp"){echo "selected=\"selected\"";} ?>>North Korea</option>
<option value="om" <?php if($country=="om"){echo "selected=\"selected\"";} ?>>Oman</option>
<option value="pk" <?php if($country=="pk"){echo "selected=\"selected\"";} ?>>Pakistan</option>
<option value="pw" <?php if($country=="pw"){echo "selected=\"selected\"";} ?>>Palau</option>
<option value="pa" <?php if($country=="pa"){echo "selected=\"selected\"";} ?>>Panama</option>
<option value="pg" <?php if($country=="pg"){echo "selected=\"selected\"";} ?>>Papua New Guinea</option>
<option value="py" <?php if($country=="py"){echo "selected=\"selected\"";} ?>>Paraguay</option>
<option value="pe" <?php if($country=="pe"){echo "selected=\"selected\"";} ?>>Peru</option>
<option value="ph" <?php if($country=="ph"){echo "selected=\"selected\"";} ?>>Philippines</option>
<option value="pn" <?php if($country=="pn"){echo "selected=\"selected\"";} ?>>Pitcairn Island</option>
<option value="pf" <?php if($country=="pf"){echo "selected=\"selected\"";} ?>>Polynesia (French)</option>
<option value="pt" <?php if($country=="pt"){echo "selected=\"selected\"";} ?>>Portugal</option>
<option value="qa" <?php if($country=="qa"){echo "selected=\"selected\"";} ?>>Qatar</option>
<option value="re" <?php if($country=="re"){echo "selected=\"selected\"";} ?>>Reunion (French)</option>
<option value="ro" <?php if($country=="ro"){echo "selected=\"selected\"";} ?>>Romania</option>
<option value="ru" <?php if($country=="ru"){echo "selected=\"selected\"";} ?>>Russian Federation</option>
<option value="rw" <?php if($country=="rw"){echo "selected=\"selected\"";} ?>>Rwanda</option>
<option value="gs" <?php if($country=="gs"){echo "selected=\"selected\"";} ?>>S. Georgia &amp; S. Sandwich Isls.</option>
<option value="sh" <?php if($country=="sh"){echo "selected=\"selected\"";} ?>>Saint Helena</option>
<option value="kn" <?php if($country=="kn"){echo "selected=\"selected\"";} ?>>Saint Kitts &amp; Nevis Anguilla</option>
<option value="lc" <?php if($country=="lc"){echo "selected=\"selected\"";} ?>>Saint Lucia</option>
<option value="pm" <?php if($country=="pm"){echo "selected=\"selected\"";} ?>>Saint Pierre and Miquelon</option>
<option value="st" <?php if($country=="st"){echo "selected=\"selected\"";} ?>>Saint Tome (Sao Tome) and Principe</option>
<option value="vc" <?php if($country=="vc"){echo "selected=\"selected\"";} ?>>Saint Vincent &amp; Grenadines</option>
<option value="ws" <?php if($country=="ws"){echo "selected=\"selected\"";} ?>>Samoa</option>
<option value="sm" <?php if($country=="sm"){echo "selected=\"selected\"";} ?>>San Marino</option>
<option value="sa" <?php if($country=="sa"){echo "selected=\"selected\"";} ?>>Saudi Arabia</option>
<option value="sn" <?php if($country=="sn"){echo "selected=\"selected\"";} ?>>Senegal</option>
<option value="sc" <?php if($country=="sc"){echo "selected=\"selected\"";} ?>>Seychelles</option>
<option value="sl" <?php if($country=="sl"){echo "selected=\"selected\"";} ?>>Sierra Leone</option>
<option value="sg" <?php if($country=="sg"){echo "selected=\"selected\"";} ?>>Singapore</option>
<option value="sk" <?php if($country=="sk"){echo "selected=\"selected\"";} ?>>Slovak Republic</option>
<option value="si" <?php if($country=="si"){echo "selected=\"selected\"";} ?>>Slovenia</option>
<option value="sb" <?php if($country=="sb"){echo "selected=\"selected\"";} ?>>Solomon Islands</option>
<option value="so" <?php if($country=="so"){echo "selected=\"selected\"";} ?>>Somalia</option>
<option value="za" <?php if($country=="za"){echo "selected=\"selected\"";} ?>>South Africa</option>
<option value="kr" <?php if($country=="kr"){echo "selected=\"selected\"";} ?>>South Korea</option>
<option value="es" <?php if($country=="es"){echo "selected=\"selected\"";} ?>>Spain</option>
<option value="lk" <?php if($country=="lk"){echo "selected=\"selected\"";} ?>>Sri Lanka</option>
<option value="sd" <?php if($country=="sd"){echo "selected=\"selected\"";} ?>>Sudan</option>
<option value="sr" <?php if($country=="sr"){echo "selected=\"selected\"";} ?>>Suriname</option>
<option value="sj" <?php if($country=="sj"){echo "selected=\"selected\"";} ?>>Svalbard and Jan Mayen Islands</option>
<option value="sz" <?php if($country=="sz"){echo "selected=\"selected\"";} ?>>Swaziland</option>
<option value="ch" <?php if($country=="ch"){echo "selected=\"selected\"";} ?>>Switzerland</option>
<option value="sy" <?php if($country=="sy"){echo "selected=\"selected\"";} ?>>Syria</option>
<option value="tj" <?php if($country=="tj"){echo "selected=\"selected\"";} ?>>Tadjikistan</option>
<option value="tw" <?php if($country=="tw"){echo "selected=\"selected\"";} ?>>Taiwan</option>
<option value="tz" <?php if($country=="tz"){echo "selected=\"selected\"";} ?>>Tanzania</option>
<option value="th" <?php if($country=="th"){echo "selected=\"selected\"";} ?>>Thailand</option>
<option value="tg" <?php if($country=="tg"){echo "selected=\"selected\"";} ?>>Togo</option>
<option value="tk" <?php if($country=="tk"){echo "selected=\"selected\"";} ?>>Tokelau</option>
<option value="to" <?php if($country=="to"){echo "selected=\"selected\"";} ?>>Tonga</option>
<option value="tt" <?php if($country=="tt"){echo "selected=\"selected\"";} ?>>Trinidad and Tobago</option>
<option value="tn" <?php if($country=="tn"){echo "selected=\"selected\"";} ?>>Tunisia</option>
<option value="tr" <?php if($country=="tr"){echo "selected=\"selected\"";} ?>>Turkey</option>
<option value="tm" <?php if($country=="tm"){echo "selected=\"selected\"";} ?>>Turkmenistan</option>
<option value="tc" <?php if($country=="tc"){echo "selected=\"selected\"";} ?>>Turks and Caicos Islands</option>
<option value="tv" <?php if($country=="tv"){echo "selected=\"selected\"";} ?>>Tuvalu</option>
<option value="ug" <?php if($country=="ug"){echo "selected=\"selected\"";} ?>>Uganda</option>
<option value="ua" <?php if($country=="ua"){echo "selected=\"selected\"";} ?>>Ukraine</option>
<option value="ae" <?php if($country=="ae"){echo "selected=\"selected\"";} ?>>United Arab Emirates</option>
<option value="uk" <?php if($country=="uk"){echo "selected=\"selected\"";} ?>>United Kingdom</option>
<option value="uy" <?php if($country=="uy"){echo "selected=\"selected\"";} ?>>Uruguay</option>
<option value="uz" <?php if($country=="uz"){echo "selected=\"selected\"";} ?>>Uzbekistan</option>
<option value="vu" <?php if($country=="vu"){echo "selected=\"selected\"";} ?>>Vanuatu</option>
<option value="ve" <?php if($country=="ve"){echo "selected=\"selected\"";} ?>>Venezuela</option>
<option value="vn" <?php if($country=="vn"){echo "selected=\"selected\"";} ?>>Vietnam</option>
<option value="vg" <?php if($country=="vg"){echo "selected=\"selected\"";} ?>>Virgin Islands (British)</option>
<option value="vg" <?php if($country=="vg"){echo "selected=\"selected\"";} ?>>Virgin Islands (British)</option>
<option value="wa" <?php if($country=="wa"){echo "selected=\"selected\"";} ?>>Wales</option>
<option value="wf" <?php if($country=="wf"){echo "selected=\"selected\"";} ?>>Wallis and Futuna Islands</option>
<option value="eh" <?php if($country=="eh"){echo "selected=\"selected\"";} ?>>Western Sahara</option>
<option value="ye" <?php if($country=="ye"){echo "selected=\"selected\"";} ?>>Yemen</option>
<option value="zr" <?php if($country=="zr"){echo "selected=\"selected\"";} ?>>Zaire</option>
<option value="zm" <?php if($country=="zm"){echo "selected=\"selected\"";} ?>>Zambia</option>
<option value="zw" <?php if($country=="zw"){echo "selected=\"selected\"";} ?>>Zimbabwe</option>										
<option value="other" <?php if($country=="other"){echo "selected=\"selected\"";} ?>>Other</option>
</select>
</td>
</tr>
<tr style="height:25px">
<td colspan="2">
<input class="field" name="submit" type="submit" value="<?php echo $lang['Update'];?>" style="font-size:12px;width:125px;" onclick="javascript: doChangeMyDetails();" id="SubmitAccDet"/>
<input class="field" name="submit" type="submit" value="<?php echo $lang['Go+Back'];?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />
</td>
</tr>
</table>
</div>
<div class="extradata">

<script type="text/javascript">
$("#gobackshowaccount").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/account.inc.php").fadeIn('slow');
			});
		});
</script>
</div>
</div>
</form>