-- phpMyAdmin SQL Dump
-- version 3.5.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 17, 2013 at 05:19 PM
-- Server version: 5.5.33
-- PHP Version: 5.4.17

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `cws_gM81iWjSqy2E`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank_tbl`
--

CREATE TABLE IF NOT EXISTS `bank_tbl` (
  `name` varchar(10) NOT NULL DEFAULT 'bank1',
  `bank` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `coef` int(3) NOT NULL DEFAULT '90',
  `funcoef` int(3) NOT NULL DEFAULT '100',
  `jackpot_percent` decimal(6,4) NOT NULL DEFAULT '0.0100',
  `jackpot_global` decimal(15,4) NOT NULL DEFAULT '25.3531',
  `profit_percent` decimal(5,2) NOT NULL DEFAULT '10.00',
  `currentprofit` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `poker_house` decimal(15,5) NOT NULL DEFAULT '0.00000',
  `slots_house` decimal(15,5) NOT NULL DEFAULT '0.00000',
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `bank_tbl`
--

INSERT INTO `bank_tbl` (`name`, `bank`, `coef`, `funcoef`, `jackpot_percent`, `jackpot_global`, `profit_percent`, `currentprofit`, `poker_house`, `slots_house`) VALUES
('bank1', 0.0000, 99, 99, 10.0000, 0.0000, 20.00, 0.0000, 0.00, 25.00000);

-- --------------------------------------------------------

--
-- Table structure for table `cws_affiliate_settings`
--

CREATE TABLE IF NOT EXISTS `cws_affiliate_settings` (
  `mrp_players` int(11) NOT NULL,
  `mrp_months` int(11) NOT NULL,
  `mrp_dep` int(11) NOT NULL,
  `nco` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `aff_rev` decimal(5,2) NOT NULL DEFAULT '0.00',
  `aff_bon` decimal(10,2) NOT NULL DEFAULT '0.00',
  `aff_rollover` smallint(5) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cws_affiliate_settings`
--

INSERT INTO `cws_affiliate_settings` (`mrp_players`, `mrp_months`, `mrp_dep`, `nco`, `status`, `aff_rev`, `aff_bon`, `aff_rollover`) VALUES
(3, 5, 10, 1, 1, 10.00, 10.00, 10);

-- --------------------------------------------------------

--
-- Table structure for table `cws_bans_ip`
--

CREATE TABLE IF NOT EXISTS `cws_bans_ip` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `client_ip` varchar(20) NOT NULL,
  `duration_minutes` int(8) NOT NULL DEFAULT '5',
  `ban_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(10) NOT NULL DEFAULT 'frontend',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `cws_bans_ip`
--


-- --------------------------------------------------------

--
-- Table structure for table `cws_bonuses`
--

CREATE TABLE IF NOT EXISTS `cws_bonuses` (
  `id` int(15) NOT NULL AUTO_INCREMENT,
  `user` varchar(45) NOT NULL DEFAULT 'n/a',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `code` varchar(25) NOT NULL,
  `type` varchar(25) NOT NULL DEFAULT 'deposit_bonus',
  `date_started` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unlock_limit` decimal(10,2) NOT NULL DEFAULT '1.00',
  `redeemed` int(1) NOT NULL DEFAULT '0',
  `date_activated` datetime NOT NULL,
  `status` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

-- --------------------------------------------------------

--
-- Table structure for table `cws_bonuses_instant`
--

CREATE TABLE IF NOT EXISTS `cws_bonuses_instant` (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `type` varchar(25) NOT NULL DEFAULT 'free_chip',
  `userid` int(12) NOT NULL,
  `deposit` decimal(12,2) NOT NULL DEFAULT '0.00',
  `bonus` decimal(12,2) NOT NULL DEFAULT '0.00',
  `rollover` int(5) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=123 ;

--
-- Dumping data for table `cws_bonuses_instant`
--


--
-- Table structure for table `cws_codes_bonus`
--

CREATE TABLE IF NOT EXISTS `cws_codes_bonus` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `code` varchar(35) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(35) NOT NULL,
  `ctype` varchar(1) NOT NULL DEFAULT 'a',
  `status` int(1) NOT NULL DEFAULT '0',
  `times_used` int(6) NOT NULL DEFAULT '0',
  `limit_per_account` smallint(4) NOT NULL DEFAULT '9999',
  `type` varchar(7) NOT NULL DEFAULT 'fixed',
  `unlock_limit` int(5) NOT NULL DEFAULT '100',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=36 ;

--
-- Dumping data for table `cws_codes_bonus`
--



--
-- Table structure for table `cws_codes_prepaid`
--

CREATE TABLE IF NOT EXISTS `cws_codes_prepaid` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `code` varchar(35) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(35) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `used_by` varchar(35) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=36 ;

--
-- Dumping data for table `cws_codes_prepaid`
--



--
-- Table structure for table `cws_currencies`
--

CREATE TABLE IF NOT EXISTS `cws_currencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(15) NOT NULL,
  `symbol` varchar(15) NOT NULL,
  `current` varchar(15) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

--
-- Dumping data for table `cws_currencies`
--

INSERT INTO `cws_currencies` (`id`, `code`, `symbol`, `current`, `status`) VALUES
(1, 'EUR', '&euro;', '1', 1),
(2, 'USD', '$', '0', 1),
(3, 'GBP', '&pound;', '0', 1),
(4, 'Points', 'points', '0', 1),
(5, 'BRL', 'R$', '0', 1),
(7, 'ARS', '$', '0', 1);

-- --------------------------------------------------------

--
-- Table structure for table `cws_deposits`
--

CREATE TABLE IF NOT EXISTS `cws_deposits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(50) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `notes` varchar(10) DEFAULT NULL,
  `details` varchar(250) NOT NULL DEFAULT '',
  `ip` varchar(25) NOT NULL DEFAULT 'N/A',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=28 ;

--
-- Dumping data for table `cws_deposits`
--


-- --------------------------------------------------------

--
-- Table structure for table `cws_depositsettings`
--

CREATE TABLE IF NOT EXISTS `cws_depositsettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(77) NOT NULL,
  `deposit_email` varchar(77) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Dumping data for table `cws_depositsettings`
--

INSERT INTO `cws_depositsettings` (`id`, `name`, `deposit_email`, `status`) VALUES
(2, 'NO OPTION', 'NO OPTION', 1);

-- --------------------------------------------------------

--
-- Table structure for table `cws_fwinners`
--



--
-- Table structure for table `cws_gameplays`
--

CREATE TABLE IF NOT EXISTS `cws_gameplays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user` varchar(100) NOT NULL DEFAULT '',
  `balance` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `odds` decimal(15,4) NOT NULL DEFAULT '9999999.9999',
  `bet` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `payout` tinyint(3) NOT NULL DEFAULT '90',
  `won` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `gamename` int(6) NOT NULL DEFAULT '0',
  `mode` varchar(4) NOT NULL DEFAULT 'N/A',
  `status` varchar(9) NOT NULL DEFAULT 'started',
  `rollov_status` tinyint(1) NOT NULL DEFAULT '0',
  `ip` varchar(20) NOT NULL DEFAULT 'N/A',
  `token` varchar(25) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3017 ;

--
-- Dumping data for table `cws_gameplays`
--


--
-- Table structure for table `cws_gameplays_logs`
--

CREATE TABLE IF NOT EXISTS `cws_gameplays_logs` (
  `id` int(11) NOT NULL,
  `player_hand` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cws_gameplays_logs`
--
--
-- Table structure for table `cws_games`
--

CREATE TABLE IF NOT EXISTS `cws_games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) DEFAULT NULL,
  `description` text,
  `preview_pic` varchar(250) DEFAULT NULL,
  `status` varchar(12) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `base_directory` varchar(150) DEFAULT NULL,
  `date` datetime NOT NULL,
  `rules` text NOT NULL,
  `jackpot` decimal(15,4) NOT NULL DEFAULT '5000.0000',
  `jp_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `jp_min_pay` int(12) NOT NULL DEFAULT '1000',
  `coef` decimal(5,2) NOT NULL DEFAULT '0.00',
  `bank` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `currentprofit` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `freespins_bank` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `megawin_bank` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `ultrawin_bank` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `game_type` varchar(25) NOT NULL DEFAULT 'other',
  `min_bet` decimal(8,2) NOT NULL DEFAULT '1.00',
  `max_bet` decimal(8,2) NOT NULL DEFAULT '1000.00',
  `max_win` decimal(8,2) NOT NULL DEFAULT '999.00',
  `coin_size` decimal(5,2) NOT NULL DEFAULT '1.00',
  `bet_sizes` varchar(100) NOT NULL DEFAULT '0',
  `autofullscreen` tinyint(1) NOT NULL DEFAULT '2',
  `animation_speed` tinyint(1) NOT NULL DEFAULT '0',
  `bonus` tinyint(1) NOT NULL DEFAULT '0',
  `bonus2` varchar(10) NOT NULL DEFAULT '0',
  `bonus_bank` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `expanding_wild` int(1) NOT NULL DEFAULT '0',
  `freespins` tinyint(1) NOT NULL DEFAULT '0',
  `paylines` tinyint(2) NOT NULL DEFAULT '0',
  `pays_rtl` tinyint(1) NOT NULL DEFAULT '0',
  `win_mult` int(5) NOT NULL DEFAULT '0',
  `firstreelstop` int(5) NOT NULL DEFAULT '0',
  `reelstop` int(5) NOT NULL DEFAULT '0',
  `freespins_odds` varchar(100) NOT NULL DEFAULT '0',
  `symbols_odds` varchar(250) NOT NULL DEFAULT '0',
  `megawin_mult` int(10) NOT NULL DEFAULT '999999',
  `jp_win_chances` int(6) NOT NULL DEFAULT '40',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=11019 ;

--
-- Dumping data for table `cws_games`
--


--
-- Table structure for table `cws_languages`
--

CREATE TABLE IF NOT EXISTS `cws_languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(4) NOT NULL,
  `name` varchar(25) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=17 ;

--
-- Dumping data for table `cws_languages`
--

INSERT INTO `cws_languages` (`id`, `code`, `name`, `status`) VALUES
(1, 'en', 'ENGLISH', 1),
(15, 'th', 'THAI', 1);

-- --------------------------------------------------------

--
-- Table structure for table `cws_pages`
--

CREATE TABLE IF NOT EXISTS `cws_pages` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `pagecode` varchar(15) NOT NULL,
  `name` varchar(25) NOT NULL,
  `content` text NOT NULL,
  `status` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=11 ;

--
-- Dumping data for table `cws_pages`
--

INSERT INTO `cws_pages` (`id`, `pagecode`, `name`, `content`, `status`, `date`) VALUES
(1, 'home', 'Home', '<script type="text/javascript">\n$(document).ready(function(){\n$(''.slider'').advancedSlider({width:750, height:386, pauseSlideshowOnHover:true, slideProperties:{\n																					0:{effectType:''scale'', horizontalSlices:''6'', verticalSlices:''3'', slicePattern:''spiralCenterToMarginCW'', sliceDelay:''80'',\n																					   captionSize:''35'', captionHideEffect:''slide''},\n																					1:{effectType:''fade'', horizontalSlices:''1'', verticalSlices:''1'', slicePattern:''leftToRight'', captionPosition:''custom'',\n																					   captionShowEffect:''fade'', captionHeight:120, slideshowDelay:12000},\n																					2:{effectType:''slide'', horizontalSlices:''10'', verticalSlices:''1'', slicePattern:''rightToLeft'', sliceDuration:''700''},\n																					3:{effectType:''height'', horizontalSlices:''10'', verticalSlices:''1'', slicePattern:''leftToRight'', slicePoint:''centerBottom'',\n																					   sliceDuration:''500'', captionSize:''45''}\n																				}\n									});\n});\n</script>\n<div class="slider" style="margin-left:25px">\n    	<div class="slider-item">\n    		<img src="images/slider/1.jpg" height="345" width="750"/>\n    		<img class="thumbnail" src="images/slider/thumb/1.jpg"/>\n			<div class="caption"></div>\n      </div>\n        \n        <div class="slider-item">\n            <img src="images/slider/2.jpg" height="345" width="750"/>\n            <img class="thumbnail" src="images/slider/thumb/2.jpg"/>\n			<div class="caption"></div>\n      </div>\n        \n        <div class="slider-item">\n            <img src="images/slider/3.jpg" height="345" width="750"/>\n            <img class="thumbnail" src="images/slider/thumb/3.jpg"/>\n      </div>\n        \n        <div class="slider-item">\n            <img src="images/slider/4.jpg" height="345" width="750"/>\n            <img class="thumbnail" src="images/slider/thumb/4.jpg"/>\n			<div class="caption"></div>\n      </div>\n\n    </div>', 1, '2013-11-08 03:09:24'),
(3, 'privacy', 'Privacy Policy', '<h1>Privacy Policy</h1>\n<p>&nbsp;</p>\n<div style="text-align:left">\n<p>IMPORTANT: BY USING THIS WEBSITE YOU GIVE YOUR CONSENT THAT ALL PERSONAL DATA SUBMITTED BY YOU MAY BE PROCESSED BY US FOR THE PURPOSES SET OUT BELOW<br>\n  We take care to protect the privacy of our customers. This policy explains how we process information about website visitors and those registered with Casinowebscripts.com. There are several security features on Our site. Your personal details are protected by firewalls, encryption, and other security measures. Our employees do not have access to your full debit/credit card details. We are committed to the security of your personal details. </p>\n<p>Casinowebscripts.com complies with Data Protection Law (Bailiwick of Guernsey) 2001. In addition, Casinowebscripts.com consults the EU privacy laws and the OECD guidelines regularly to ensure the protection of players'' privacy and transborder data flow. </p>\n<p>Personal information is collated and stored primarily during the registration process, but is also monitored when there is activity on your account and when you use the website. As with many other websites, we may use software known as ''cookies'' to store information relating to your preferences to enable us to improve our service to you. </p>\n<p>Personal data submitted by you to Casinowebscripts.com will be used for the following purposes only. We will only collect and retain personal data to the extent that it is strictly necessary for one of the following purposes: assisting us in setting up and managing your account; building an accurate customer profile; making information from Casinowebscripts licensees and Casinowebscripts.com marketing partners available: and publishing on the website and in other promotional materials, for the purpose of promoting the site, information relating to wins of ï¿½10 or more comprising the amount of the win and the abbreviated name, home town, state or province and country of the winner. </p>\n<p>Please note that Website.com have access to your account information. However, this information will only be used within the rules and guidelines that govern this site. </p>\n<p>Personal data collected about you when you visit this site will be disclosed only to the following types of persons or partners of Casinowebscripts.com; reputable marketing partners selected by us; any company or other entity to whom we may sell all or part of our business; any competent legal, regulatory or law enforcement authority including the AGCC. In the latter case, you will not be informed of any disclosure nor of any reasons for such disclosure and you hereby waive any and all rights that you may have, whether at law or otherwise, of any nature and in any jurisdiction, in connection with such disclosure; our professional advisers or other appropriate third parties, if your use of our service, our Games or this website is in breach of these terms and conditions; and other users of the site and persons receiving promotional materials, in each case pursuant to the information we provide about winners detailed above. </p>\n<p>To make data corrections or to obtain access to the data we have about you, you must send us a written request that should be addressed to the Director of Customer Services for Casinowebscripts.com. We will disclose to you your personal data held by us, we shall correct or delete inaccurate details, and notify any third party recipients of the necessary changes. Changes to certain parts of your account information can also be made by accessing ''My Account''. We regularly delete data that is no longer required. </p>\n<p>Casinowebscripts.com is part of the World Wide Web and because of this your personal data may be transferred outside Europe and the European Economic Area. Whenever such transfers are effected pursuant to arrangements made by us, we shall enter into agreements requiring the recipients of your personal data to adhere to standards of data protection substantially similar to those prevailing in Europe and the European Economic Area. However, the Internet is made up of a large variety of international connections and if you are visiting this website the various communications may well result in the transfer of information outside the European Economic Area other than pursuant to contractual arrangements made by us. By visiting the website and communicating electronically with us you consent to these transfers. All sensitive player data is protected in accordance with the Data Protection Law (Bailiwick of Guernsey) 2001. In addition, Casinowebscripts.com consults the EU privacy laws and the OECD guidelines regularly to ensure the protection of players'' privacy and transborder data flow. </p>\n<p>If you do not wish to receive promotional or other information then please check the appropriate box during the registration process. </p>\n<p>For further information on what data is held about you can be obtained by contacting Us as follows - </p>\n<p>Casinowebscripts.com Gaming Support</p>\n<p>With the exception of your personal details, all other information, including, but not limited to, ideas, submissions, emails, suggestions, concepts, graphics, chatroom contents including material and statements, posted on this site or submitted to us will become our property and we shall not be subject to any obligation of confidentiality and will be free to reproduce, modify, edit, adapt, publish, translate, distribute and display by Us or anyone we designate in any and all media now known or in the future created. </p>\n<p>This Our Promise forms part of our website Terms and Conditions and as such it shall be governed by and construed in accordance with the laws of England. You irrevocably agree that the courts of England and Wales shall have exclusive jurisdiction to resolve any dispute or claim of whatever nature arising out of or relating to this policy and consent or otherwise to the use of your personal data, and that the laws of England shall govern such dispute or claim. However, we retain the right to bring legal proceedings in any jurisdiction where we believe that infringement of our intellectual property rights or breach of those terms is taking place or originating.</p>\n</div>', 1, '2012-02-24 10:28:52'),
(4, 'promotions', 'Promotions', '<script type="text/javascript">\n$(document).ready(function(){\n$(''.slider'').advancedSlider({width:750, height:386, pauseSlideshowOnHover:true, slideProperties:{\n																					0:{effectType:''scale'', horizontalSlices:''6'', verticalSlices:''3'', slicePattern:''spiralCenterToMarginCW'', sliceDelay:''80'',\n																					   captionSize:''35'', captionHideEffect:''slide''},\n																					1:{effectType:''fade'', horizontalSlices:''1'', verticalSlices:''1'', slicePattern:''leftToRight'', captionPosition:''custom'',\n																					   captionShowEffect:''fade'', captionHeight:120, slideshowDelay:12000},\n																					2:{effectType:''slide'', horizontalSlices:''10'', verticalSlices:''1'', slicePattern:''rightToLeft'', sliceDuration:''700''},\n																					3:{effectType:''height'', horizontalSlices:''10'', verticalSlices:''1'', slicePattern:''leftToRight'', slicePoint:''centerBottom'',\n																					   sliceDuration:''500'', captionSize:''45''}\n																				}\n									});\n});\n</script>\n<div class="slider" style="margin-left:25px">\n    	<div class="slider-item">\n    		<img src="images/slider/1.jpg" height="345" width="750"/>\n    		<img class="thumbnail" src="images/slider/thumb/1.jpg"/>\n			<div class="caption"></div>\n      </div>\n        \n        <div class="slider-item">\n            <img src="images/slider/2.jpg" height="345" width="750"/>\n            <img class="thumbnail" src="images/slider/thumb/2.jpg"/>\n			<div class="caption"></div>\n      </div>\n        \n        <div class="slider-item">\n            <img src="images/slider/3.jpg" height="345" width="750"/>\n            <img class="thumbnail" src="images/slider/thumb/3.jpg"/>\n      </div>\n        \n        <div class="slider-item">\n            <img src="images/slider/4.jpg" height="345" width="750"/>\n            <img class="thumbnail" src="images/slider/thumb/4.jpg"/>\n			<div class="caption"></div>\n      </div>\n\n    </div>', 1, '2013-11-06 05:44:13'),
(6, 'toc', 'ToC', 'kkkj', 1, '2013-11-21 10:34:08'),
(5, 'responsible_gam', 'Responsible Gaming', 'Responsible Gaming,\n&amp;nbsp;\n\nWe want to ensure that our customers always enjoy their experience when they visit Our CASINO.\nThat&#039;s why we ask you to play responsibly. Gaming can be great entertainment, provided you stay in control.\nWe will always endeavour to help you if you find yourself in difficulties.\n\nOur CASINO has achieved high standards in player protection and social responsibility and recognises the need to assist their customers to play responsibly. The following practices have been implemented:\nAge verification systems\n  Controls for customer spend\n  Reality checks within game screens\n  Self exclusion options for players\n  Information about responsible gambling and sources of advice and support\n  Training for customer services in problem gambling and social responsibility\n\n&amp;nbsp;\nGambling Problems?\n  If you are unsure whether or not you may have developed a gambling problem, you can use the following simple checklist for self-assessment. If you answer positively to at lest four of the following questions it is recommended you call our customer service staff and seek professional advice.\nPreoccupation: Do you find that you are becoming preoccupied with past gambling successes or find yourself spending increasingly more time planning future gambling?\n  Tolerance: Do you find that you need to increase the amount of money you gamble to achieve the same enjoyment and excitement?\n  Unable to Stop: Have you recently tried to stop gambling but were unsuccessful?\n  Irritability: Do you become moody or impatient when you are cutting down how much you gamble?\n  Escape from Reality: Do you ever use gambling a way of ignoring stress in your in life or even pick you up when you feel down?\n  Chase losses: Do you ever try to win back the money you lost by increasing the size or frequency of your wagers?\n  Conceal Involvement: Do you ever hide how much or how often you gamble from significant others?\n  Unsociable Behaviour: Have you ever committed fraud or theft to get money to gamble with?\n  Ruin a Relationship/Opportunity: Has gambling ever ruined a personal relationship or an occupational or educational opportunity?\n  Bail-out: Have you ever needed others to relieve a financial problem created by gambling?\n\n', 1, '2013-09-30 13:05:50');

-- --------------------------------------------------------

--
-- Table structure for table `cws_permissions`
--

CREATE TABLE IF NOT EXISTS `cws_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL DEFAULT '-',
  `shortname` varchar(40) NOT NULL,
  `category` varchar(40) NOT NULL DEFAULT 'Other',
  `operator` tinyint(1) NOT NULL DEFAULT '1',
  `agent` tinyint(1) NOT NULL DEFAULT '1',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `menu` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=106 ;

--
-- Dumping data for table `cws_permissions`
--

INSERT INTO `cws_permissions` (`id`, `name`, `shortname`, `category`, `operator`, `agent`, `status`, `menu`) VALUES
(14, 'Casino Activity', 'fn_transactions.inc.php', 'Statistics', 1, 1, 1, 1),
(32, 'Games statistics', 'st_games.inc.php', 'Statistics', 1, 1, 1, 1),
(76, 'Profit Evolution', 'st_profit.inc.php', 'Statistics', 1, 1, 1, 1),
(77, 'Profit Chart - Embed', 'st_profit_chart.inc.php', 'Statistics', 1, 1, 1, 0),
(21, 'User gameplays statistics', 'st_users.inc.php', 'Statistics', 1, 1, 1, 1),
(71, 'User Stats Table', 'user_stats.inc.php', 'Statistics', 1, 1, 1, 0),
(12, 'Ban IP', 'sec_bans_add.inc.php', 'Security', 0, 0, 1, 1),
(70, 'Edit banned IP', 'sec_bans_edit.inc.php', 'Security', 0, 0, 1, 0),
(4, 'List All  Banned IP', 'sec_bans_list.inc.php', 'Security', 0, 0, 1, 1),
(10, 'Add product', 'pt_add.inc.php', 'Point+based+system', 0, 0, 1, 1),
(52, 'Edit product', 'pt_edit.inc.php', 'Point+based+system', 0, 0, 1, 0),
(36, 'List products', 'pt_list.inc.php', 'Point+based+system', 0, 0, 1, 1),
(1, 'Orders ', 'pt_orders.inc.php', 'Point+based+system', 0, 0, 1, 1),
(28, 'Settings', 'pt_settings.inc.php', 'Point+based+system', 0, 0, 1, 1),
(37, 'Transfer Funds to Agent', 'transfer_funds_a.inc.php', 'Persons+Management', 1, 1, 1, 1),
(22, 'Transfer Funds to User', 'transfer_funds_u.inc.php', 'Persons+Management', 1, 1, 1, 1),
(24, 'Create Agent', 'um_create_a.inc.php', 'Persons+Management', 1, 1, 1, 1),
(13, 'Create Operator', 'um_create_o.inc.php', 'Persons+Management', 0, 0, 1, 1),
(54, 'Create User', 'um_create_u.inc.php', 'Persons+Management', 1, 1, 1, 1),
(31, 'Edit Agent', 'um_edit_a.inc.php', 'Persons+Management', 1, 1, 1, 0),
(57, 'Edit Operator', 'um_edit_o.inc.php', 'Persons+Management', 0, 0, 1, 0),
(65, 'Edit User', 'um_edit_u.inc.php', 'Persons+Management', 1, 1, 1, 0),
(9, 'List Agents', 'um_list_a.inc.php', 'Persons+Management', 1, 1, 1, 1),
(64, 'List Operators', 'um_list_o.inc.php', 'Persons+Management', 0, 0, 1, 1),
(6, 'List Users', 'um_list_u.inc.php', 'Persons+Management', 1, 1, 1, 1),
(82, 'Documentation', 'documentation.inc.php', 'Other', 1, 1, 1, 0),
(73, 'My Profile', 'mydetails.inc.php', 'Other', 1, 1, 1, 0),
(11, 'Newsletter', 'newsletter.inc.php', 'Other', 0, 0, 1, 1),
(25, 'Newsletter Send', 'newsletter_do.inc.php', 'Other', 0, 0, 1, 0),
(29, 'PDF Deposit Invoice', 'pdf_invoice.php', 'Other', 1, 1, 1, 0),
(45, 'PDF Transfer Invoice', 'pdf_invoice_tr.php', 'Other', 1, 1, 1, 0),
(78, 'Generate Data for DEP WITH and USERS', '_inc_dep_wt_us.inc.php', 'Other', 1, 1, 1, 0),
(95, 'Update credit', '_inc_bet_won_pf.inc.php', 'Other', 1, 1, 1, 0),
(92, 'Settings', 'sicbo_settings.inc.php', 'Multiplayer+Sicbo', 0, 0, 1, 1),
(93, 'View Bets', 'sicbo_bets.inc.php', 'Multiplayer+Sicbo', 1, 1, 1, 1),
(94, 'View Results', 'sicbo_results.inc.php', 'Multiplayer+Sicbo', 1, 1, 1, 1),
(79, 'View Results', 'gm_rl.inc.php', 'Multiplayer+Roulette', 1, 1, 1, 1),
(80, 'View Bets', 'gm_rl_bets.inc.php', 'Multiplayer+Roulette', 1, 1, 1, 1),
(91, 'Settings', 'gm_rl_settings.inc.php', 'Multiplayer+Roulette', 0, 0, 1, 1),
(81, 'View Results', 'race_results.inc.php', 'Multiplayer+Races', 1, 1, 1, 1),
(84, 'Settings', 'race_settings.inc.php', 'Multiplayer+Races', 0, 0, 1, 1),
(83, 'View Bets', 'race_tickets.inc.php', 'Multiplayer+Races', 1, 1, 1, 1),
(88, 'View Ticket', 'raceticketid.inc.php', 'Multiplayer+Races', 1, 1, 1, 0),
(5, 'View Results', 'dog_results.inc.php', 'Multiplayer+Dog+Races', 0, 0, 1, 1),
(69, 'View Bet Statistics', 'dog_stats.inc.php', 'Multiplayer+Dog+Races', 0, 0, 1, 1),
(67, 'View Bets', 'dog_tickets.inc.php', 'Multiplayer+Dog+Races', 0, 0, 1, 1),
(34, 'View Race Videos', 'dog_videos.inc.php', 'Multiplayer+Dog+Races', 0, 0, 1, 1),
(19, 'Edit Video', 'dog_videos_edit.inc.php', 'Multiplayer+Dog+Races', 0, 0, 1, 0),
(56, 'Dog Races - Process ticket', 'getData.php', 'Multiplayer+Dog+Races', 0, 0, 1, 0),
(62, 'Print Ticket', 'printTicket.php', 'Multiplayer+Dog+Races', 0, 0, 1, 0),
(66, 'View Dog Race Ticket', 'ticketid.inc.php', 'Multiplayer+Dog+Races', 0, 0, 1, 0),
(96, 'Add Video', 'dog_videos_add.inc.php', 'Multiplayer+Dog+Races', 0, 0, 1, 0),
(8, 'View Ticket', 'bingoticket.inc.php', 'Multiplayer+Bingo+Live', 0, 0, 1, 0),
(26, 'View Results', 'bingo_results.inc.php', 'Multiplayer+Bingo+Live', 1, 1, 1, 1),
(61, 'Settings', 'bingo_settings.inc.php', 'Multiplayer+Bingo+Live', 0, 0, 1, 1),
(2, 'View All Tickets', 'bingo_tickets.inc.php', 'Multiplayer+Bingo+Live', 1, 1, 1, 1),
(18, 'Add Game', 'gm_add.inc.php', 'Games+Management', 0, 0, 0, 0),
(85, 'Reset all Gameplays Records', 'gm_games_reset.inc.php', 'Games+Management', 0, 0, 1, 1),
(75, 'Reset all Jackpots', 'gm_jackpot_reset.inc.php', 'Games+Management', 0, 0, 1, 1),
(40, 'List All Games', 'gm_list.inc.php', 'Games+Management', 0, 0, 1, 1),
(59, 'Edit Game', 'gm_list_e.inc.php', 'Games+Management', 0, 0, 1, 0),
(17, 'Gameplays Data', 'st_gameplays.inc.php', 'Games+Management', 1, 1, 1, 1),
(86, 'Player Statistics', 'st_player.inc.php', 'Games+Management', 1, 1, 1, 0),
(87, 'Player Hand View', 'st_player_hand.inc.php', 'Games+Management', 1, 1, 1, 0),
(97, 'Jackpot Winners', 'st_jackpots.inc.php', 'Games+Management', 0, 0, 1, 1),
(98, 'Reset all Banks', 'gm_empty_banks.inc.php', 'Games+Management', 0, 0, 1, 1),
(46, 'Payment Methods', 'cas_payments.inc.php', 'Finances', 0, 0, 1, 1),
(42, 'Edit Payment Settings', 'cas_payments_e.inc.php', 'Finances', 0, 0, 1, 0),
(7, 'My Earnings', 'earnings.inc.php', 'Finances', 1, 1, 1, 1),
(60, 'Bonus - Deposit Bonus Code - Add', 'fn_bonus_a.inc.php', 'Finances', 0, 0, 1, 1),
(27, 'Edit Deposit Bonus Code', 'fn_bonus_e.inc.php', 'Finances', 0, 0, 1, 0),
(15, 'Bonus - Deposit Bonus Codes - List', 'fn_bonus_list.inc.php', 'Finances', 1, 1, 1, 1),
(55, 'Cashout', 'fn_cashout.inc.php', 'Finances', 0, 0, 1, 0),
(35, 'Deposits', 'fn_deposits.inc.php', 'Finances', 1, 1, 1, 1),
(39, 'Prepaid Code - Add', 'fn_prepaid_a.inc.php', 'Finances', 0, 0, 1, 1),
(30, 'Edit Prepaid Code', 'fn_prepaid_e.inc.php', 'Finances', 0, 0, 1, 0),
(23, 'Prepaid Codes - List', 'fn_prepaid_list.inc.php', 'Finances', 1, 1, 1, 1),
(48, 'Credit Transfers', 'fn_transfers.inc.php', 'Finances', 1, 1, 1, 1),
(33, 'Withdrawals', 'fn_withdrawals.inc.php', 'Finances', 1, 1, 1, 1),
(90, 'Clear All Financial Records', 'fn_clear.inc.php', 'Finances', 0, 0, 1, 1),
(51, 'Add Content Page', 'cms_add.inc.php', 'Content+Management', 0, 0, 1, 1),
(58, 'Edit Content Page', 'cms_edit.inc.php', 'Content+Management', 0, 0, 1, 0),
(74, 'List Content Pages', 'cms_list.inc.php', 'Content+Management', 0, 0, 1, 1),
(72, 'Backup Database', 'cas_backup.inc.php', 'Casino+Settings', 0, 0, 1, 1),
(41, 'General Settings', 'cas_general.inc.php', 'Casino+Settings', 0, 0, 1, 1),
(49, 'Admin Language', 'cas_language.inc.php', 'Casino+Settings', 1, 1, 1, 1),
(38, 'Go Live', 'cas_live.inc.php', 'Casino+Settings', 0, 0, 1, 1),
(20, 'Casino Payout and Win Rate', 'cas_percent.inc.php', 'Casino+Settings', 0, 0, 1, 1),
(89, 'Administrator Panel Permissions', 'cas_permissions.inc.php', 'Casino+Settings', 0, 0, 1, 1),
(102, 'Bonus - Active Instant Bonuses', 'fn_freec_list.inc.php', 'Finances', 1, 1, 1, 1),
(103, 'Bonus - Free Chips Add', 'fn_freec_a.inc.php', 'Finances', 0, 0, 1, 1),
(104, 'Bonus - Free Chips Edit', 'fn_freec_e.inc.php', 'Other', 0, 0, 1, 0),
(105, 'Affiliate Settings', 'aff_settings.inc.php', 'Casino+Settings', 0, 0, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `cws_settings`
--

CREATE TABLE IF NOT EXISTS `cws_settings` (
  `affilperc` decimal(3,0) NOT NULL DEFAULT '0',
  `currency` varchar(6) NOT NULL DEFAULT 'EUR',
  `banned_games` varchar(10000) NOT NULL,
  `transfer_fee` decimal(4,2) NOT NULL DEFAULT '0.50',
  `thousand_sep` tinyint(1) NOT NULL DEFAULT '1',
  `minimumdeposit` decimal(12,2) NOT NULL DEFAULT '10.00',
  `maximumdeposit` decimal(12,2) NOT NULL DEFAULT '1000.00',
  `minimumwithdrawal` decimal(12,2) NOT NULL,
  `maximumwithdrawal` decimal(12,2) NOT NULL,
  `points_shop` tinyint(1) NOT NULL DEFAULT '0',
  `phone_number` varchar(35) NOT NULL DEFAULT '000-0000-0000',
  `allowfunplay` tinyint(1) NOT NULL DEFAULT '1',
  `allowrealplay` tinyint(1) NOT NULL DEFAULT '1',
  `allowent` tinyint(1) NOT NULL DEFAULT '1',
  `global_mode` tinyint(1) NOT NULL DEFAULT '0',
  `vipmode` tinyint(1) NOT NULL DEFAULT '1',
  `reg_bonus` decimal(12,2) NOT NULL DEFAULT '0.00',
  `login_bonus` decimal(15,2) NOT NULL DEFAULT '0.00',
  UNIQUE KEY `currency` (`currency`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cws_settings`
--

INSERT INTO `cws_settings` (`affilperc`, `currency`, `banned_games`, `transfer_fee`, `thousand_sep`, `minimumdeposit`, `maximumdeposit`, `minimumwithdrawal`, `maximumwithdrawal`, `points_shop`, `phone_number`, `allowfunplay`, `allowrealplay`, `allowent`, `global_mode`, `vipmode`, `reg_bonus`, `login_bonus`) VALUES
(25, 'EUR', '707,758,757,756,755,1009,1012,1102,1013,706', 1.00, 1, 10.00, 1000.00, 10.00, 1000.00, 0, '0800-080-00', 1, 1, 1, 1, 1, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `cws_shop_orders`
--

CREATE TABLE IF NOT EXISTS `cws_shop_orders` (
  `id` int(15) NOT NULL AUTO_INCREMENT,
  `productid` int(10) NOT NULL,
  `buyerid` int(10) NOT NULL,
  `address` varchar(400) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `cws_shop_products`
--

CREATE TABLE IF NOT EXISTS `cws_shop_products` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(125) NOT NULL,
  `description` varchar(355) NOT NULL,
  `category` varchar(2) NOT NULL DEFAULT '0',
  `image_url` varchar(355) NOT NULL,
  `points_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shipping_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `cws_staffs`
--

CREATE TABLE IF NOT EXISTS `cws_staffs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(35) NOT NULL,
  `pass` varchar(35) NOT NULL,
  `email` varchar(30) NOT NULL,
  `name` varchar(35) NOT NULL,
  `percent` decimal(10,2) NOT NULL DEFAULT '1.00',
  `cash` decimal(12,2) NOT NULL DEFAULT '0.00',
  `cash_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `owner` varchar(35) NOT NULL,
  `staff_type` varchar(35) NOT NULL DEFAULT 'agent',
  `clubid` int(10) NOT NULL DEFAULT '0',
  `has_subagent` tinyint(1) NOT NULL DEFAULT '1',
  `ip_last` varchar(25) NOT NULL DEFAULT 'N/A',
  `last_activity` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=100 ;

--
-- Dumping data for table `cws_staffs`
--

INSERT INTO `cws_staffs` (`id`, `login`, `pass`, `email`, `name`, `percent`, `cash`, `cash_paid`, `status`, `date`, `owner`, `staff_type`, `clubid`, `has_subagent`, `ip_last`, `last_activity`) VALUES
(1, 'admin', 'QGRtaW4xMjNhZG1pbg==', 'admin', 'Administrator', 100.00, 999837824.80, 0.00, 1, '2010-09-11 13:35:30', '-', 'admin', 0, 1, '86.121.174.93', '2013-12-13 19:00:58');

CREATE TABLE IF NOT EXISTS `cws_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `selected` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;


INSERT INTO `cws_templates` (`id`, `name`, `date`, `status`, `selected`) VALUES
(11, 'Custom', '2011-05-15 16:08:15', '1', '1');


CREATE TABLE IF NOT EXISTS `cws_transfers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(12) DEFAULT NULL,
  `sender_cash_b4` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `sender_type` varchar(50) DEFAULT NULL,
  `status` varchar(1) DEFAULT '1',
  `receiver_type` varchar(12) DEFAULT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `notes` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=116 ;

--
-- Dumping data for table `cws_transfers`
--


--
-- Table structure for table `cws_users`
--

CREATE TABLE IF NOT EXISTS `cws_users` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `login` varchar(35) NOT NULL,
  `cash` decimal(10,2) DEFAULT '0.00',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `logged_in` tinyint(1) NOT NULL DEFAULT '0',
  `last_activity` datetime NOT NULL,
  `owner` varchar(30) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=898 ;

--
-- Dumping data for table `cws_users`
--



--
-- Table structure for table `cws_users_info`
--

CREATE TABLE IF NOT EXISTS `cws_users_info` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `pass` varchar(35) NOT NULL,
  `nickname` varchar(25) NOT NULL DEFAULT '',
  `aff_id` varchar(10) NOT NULL DEFAULT '',
  `aff_status` tinyint(1) NOT NULL DEFAULT '1',
  `in_play` decimal(10,2) NOT NULL DEFAULT '0.00',
  `email` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmcode` varchar(50) DEFAULT NULL,
  `gender` varchar(1) NOT NULL DEFAULT 'M',
  `street` varchar(100) NOT NULL DEFAULT '',
  `zip` varchar(20) NOT NULL DEFAULT '',
  `ort` varchar(100) NOT NULL DEFAULT '',
  `country` varchar(50) NOT NULL DEFAULT '',
  `dob` varchar(25) NOT NULL DEFAULT '',
  `mobiletel` varchar(20) NOT NULL DEFAULT '',
  `secques` varchar(50) NOT NULL DEFAULT '',
  `secans` varchar(50) NOT NULL DEFAULT '',
  `nrsh` tinyint(3) NOT NULL DEFAULT '1',
  `whereknowfrom` varchar(40) NOT NULL DEFAULT 'N/A',
  `ip_notify` tinyint(1) NOT NULL DEFAULT '0',
  `ip_reg` varchar(30) NOT NULL DEFAULT '',
  `ip_last` varchar(30) NOT NULL DEFAULT '',
  `last_lbonus` datetime NOT NULL,
  `ban_expire` varchar(35) NOT NULL DEFAULT '',
  `vipPoints` decimal(14,2) NOT NULL DEFAULT '0.00',
  `fb_login` varchar(255) NOT NULL DEFAULT 'no',
  `roulette` datetime NOT NULL,
  `sicbo` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=898 ;

--
-- Dumping data for table `cws_users_info`
--


--
-- Table structure for table `cws_withdrawals`
--

CREATE TABLE IF NOT EXISTS `cws_withdrawals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(40) DEFAULT NULL,
  `email` varchar(80) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `notes` varchar(10) DEFAULT NULL,
  `details` varchar(50) DEFAULT NULL,
  `ip` varchar(25) NOT NULL DEFAULT 'N/A',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=221 ;

--
-- Dumping data for table `cws_withdrawals`
--

INSERT INTO `cws_games` (`id`, `name`, `description`, `preview_pic`, `status`, `location`, `base_directory`, `date`, `rules`, `jackpot`, `jp_enabled`, `jp_min_pay`, `coef`, `bank`, `currentprofit`, `freespins_bank`, `megawin_bank`, `ultrawin_bank`, `game_type`, `min_bet`, `max_bet`, `max_win`, `coin_size`, `bet_sizes`, `autofullscreen`, `animation_speed`, `bonus`, `bonus2`, `bonus_bank`, `expanding_wild`, `freespins`, `paylines`, `pays_rtl`, `win_mult`, `firstreelstop`, `reelstop`, `freespins_odds`, `symbols_odds`, `megawin_mult`, `jp_win_chances`) VALUES
(755, 'European Roulette 3D', '<p>Try your  European-style luck with the glamorous European Roulette 3D, a fantastic game  which will appeal to players of all categories. Whether you&rsquo;re an expert or a  novice, this game will definitely manage to appeal to your through its  interesting graphics and simple rules. You can play the game for fun until you  understand how it works, and then you can pass on to the real deal, and start  playing for money.<br />\r\n  It is so  easy to win and so much fun that it would be a pity to give up all the  adrenaline. Likewise, the entire game develops just like in a real casino.  First you have to place your bets on the table, on your favorite number  combination hoping that you will make a lucky choice. Then you spin the wheel  and the dealer will announce if you have won. The place where the ball has  stopped is displayed on the screen too, and if you won, your gains are collected  automatically after you are announced. And, to make everything even more  facile, the players are given the possibility to undo or clear their bets, as  well as re-bet. Be a winner, prepare to cash in and play European Roulette to  keep yourself busy and engaged on a daily basis.</p>\r\n', 'resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/preview.gif', '1', 'resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/Roulette.swf', 'resources/games_flash/CWS_OTHER_EUROPEAN_ROULETTE_3D/', '2011-11-12 22:55:05', ' <h1>European Roulette</h1>\r\n<h2>Description</h2>\r\n<p>The current single zero roulette game based on the classic French variation is known worldwide as European Roulette. It is a game of pure chance based on predicting the number of a slot where the ball stops upon spinning the wheel. The game offers a variety of bets with different odds from 1:1 to 35:1. Moreover, European roulette features side bets placed on a special racetrack and covering different combinations of numbers.</p>\r\n<h2>Game Rules</h2>\r\n<p><strong>European Roulette</strong> is a widely known Roulette variation played on a wheel with 37 slots. Numbers 1 to 36 alternate black and red, there is also a green pocket, numbered 0. Players can place a great variety of bets &ndash; on a single number or a range of numbers, red or black colors, whether the number is odd or even, and higher or lower than 18. Our European Roulette also includes Call bets, placed on a special racetrack. Once the bets are made, the wheel and ball are spun. As a result, the ball lands in a randomly selected pocket.</p>\r\n<h3>Objective</h3>\r\n<p> The aim of the game is to correctly predict the slot in which the ball will land. By predicting the right number, you earn a payoff on your bet. Your winnings depend on the type of the bet you''ve placed.</p>\r\n<h3>Betting Tips </h3>\r\n<table width="100%" cellspacing="0" cellpadding="0" border="0" class="innertable">\r\n <tbody><tr>\r\n <th valign="top">To:\r\n </th><th valign="top">Tip:\r\n </th></tr>\r\n <tr>\r\n <td valign="top">Select a chip</td>\r\n <td valign="top">Just click the required chip at the bottom right of the table</td>\r\n </tr>\r\n <tr>\r\n <td valign="top">Place your bet </td>\r\n <td valign="top">Click the corresponding betting field. Two bets of equal value will be placed. </td>\r\n </tr>\r\n <tr>\r\n <td valign="top">Increase your bet </td>\r\n <td valign="top">Every click on the betting field adds one chip of the selected value to both your stacks </td>\r\n </tr>\r\n\r\n <tr>\r\n <td valign="top">Remove all the bets placed </td>\r\n <td valign="top">Use <strong>CLEAR</strong> control </td>\r\n </tr>\r\n <tr>\r\n <td valign="top">Play again</td>\r\n <td valign="top">Click <strong>NEW GAME </strong>to remove all the chips and cards from the table once the game is completed </td>\r\n </tr>\r\n <tr>\r\n <td valign="top">Repeat your bet </td>\r\n <td valign="top">Click <strong>REBET</strong> to place the same stakes as in the previous round and start dealing </td>\r\n </tr>\r\n</tbody></table>\r\n<h3>Betting Limits </h3>\r\n<ul>\r\n <li><strong>Min/Max</strong> sign indicates minimum amount that can be placed on each betting field as well as maximum amount that can be placed on each betting field and on the whole table. </li>\r\n</ul>\r\n<h3>Play</h3>\r\n<p> Once the bet is placed, click <strong>SPIN</strong>. When the ball stops in one of the numbered pockets of the roulette wheel, that number is declared as the winning number for that game round. You are paid depending on the bet type placed. </p>\r\n<h3>Bet Types </h3>\r\n<p> All the numbers on a European Roulette table are arranged in 12 rows and 3 columns and at the top of the number field is the number zero. There are <em>inside</em> bets, placed on numbers and lines between them on the internal area of the table, and <em>outside</em> bets, placed outside the numbered playing area. </p>\r\n<table width="100%" cellspacing="0" cellpadding="0" border="0" class="innertable">\r\n <tbody><tr>\r\n <th valign="top" colspan="2">Inside Bets</th>\r\n <th valign="top" align="center">Payout</th>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Straight </em></td>\r\n <td valign="top">Bet on any individual number. Place your bet directly on a single number, including 0. This bet covers 1 number. <strong> </strong></td>\r\n <td valign="top" align="center">35:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Split </em></td>\r\n <td valign="top">Bet on any two adjoining numbers either horizontal or vertical. Place your bet on the line that separates two numbers. This bet covers 2 numbers. <strong> </strong></td>\r\n <td valign="top" align="center">17:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Street</em></td>\r\n <td valign="top">Bet on a row of three numbers. Place your bet on the outer right boundary line of the roulette table, next to the corresponding row of three numbers. This bet covers three numbers. <strong> </strong></td>\r\n <td valign="top" align="center">11:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Trio </em></td>\r\n <td valign="top">Bet on the group of 0, 1 and 2, or 0, 2 and 3. Place your bet on the intersecting point between 0, 1 and 2, or 0, 2 and 3. This bet covers 3 numbers. </td>\r\n <td valign="top" align="center">11:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Corner </em></td>\r\n <td valign="top">Bet on four numbers in a square layout. Place your bet at the intersection of four numbers. The bet covers 4 numbers.<strong> </strong></td>\r\n <td valign="top" align="center">8:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Line </em></td>\r\n <td valign="top">Bet on two adjoining streets. Place your bet on the intersection of two rows of three numbers (covers 6 numbers). </td>\r\n <td valign="top" align="center">5:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top" colspan="2"><strong>Outside Bets </strong></td>\r\n <td valign="top" align="center"><strong> </strong></td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Column bet</em></td>\r\n <td valign="top">Bet on all 12 numbers on any of the three vertical lines (columns). Place your bet in one of the boxes marked ''2 to 1'' at the end of the column. This bet covers 12 numbers. <strong> </strong></td>\r\n <td valign="top" align="center">2:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Dozen bet </em></td>\r\n <td valign="top">Bet on the first (1-12), second (13-24), or third group (25-36) of twelve numbers. Place your bet in one of the three boxes marked "1st 12", ''2nd 12'' or ''3rd 12''. This bet covers 12 numbers. </td>\r\n <td valign="top" align="center">2:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Low/High</em></td>\r\n <td valign="top">Bet on one of the first low eighteen/ the last high eighteen numbers coming up. Place your bet in ''1 to 18'' or ''19 to 36'' box on the outside betting area. This bet covers 18 numbers. Zero is not considered a red or black number. </td>\r\n <td valign="top" align="center">1:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Odd/ Even</em></td>\r\n <td valign="top">Bet on an even or odd number. Place a chip in the box with text ODD or EVEN. Zero is not considered an odd or even. <strong> </strong></td>\r\n <td valign="top" align="center">1:1</td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Red/ Black </em></td>\r\n <td valign="top">Bet on which color the roulette wheel will show. Place your bet in the box holding a red or black diamond. Zero is not considered a red or black number.<strong> </strong></td>\r\n <td valign="top" align="center">1:1</td>\r\n </tr>\r\n</tbody></table>\r\n<p>There is also special racetrack to the left of the table, using which you can place call bets or <em>''annonces</em><em>''</em>. The numbers on the racetrack duplicate the arrangement of numbers on the wheel itself. These bets come from French Roulette that is why French names are used. Each bet corresponds to a particular wheel section and represents a combination of several standard bets.</p>\r\n<table width="100%" cellspacing="0" cellpadding="0" border="0" class="innertable">\r\n <tbody><tr>\r\n <th valign="top" colspan="2">Call Bets</th>\r\n <th valign="top">Payouts</th>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em>Voisins de Zero</em></td>\r\n <td valign="top">Includes numbers which lie between 22 and 25 on the wheel. You need 9 chips of the selected value. 2 chips are placed on the <em>0/2/3</em><strong> </strong>trio; 1 on the <em>4/7</em> split; 1 on <em>12/15</em>; 1 on <em>18/21</em>; 1 on <em>19/22</em>; 2 on <em>25/26/28/29</em><strong> </strong>corner; and 1 on <em>32/35</em>. To place this bet click ''VOISINS'' on the racetrack. </td>\r\n <td valign="top">Payout is equivalent to the bets made. Trio - 11:1, Split bet - 17:1 and Corner &ndash; 8:1. </td>\r\n </tr>\r\n <tr>\r\n <td valign="top"><em> Tiers</em><strong> </strong></td>\r\n <td valign="top">Includes numbers which lie on the opposite side of the wheel between 27 and 33. You need 6 chips of the selected value. 1 chip is placed on each of the following splits <em>5/8; 10/11; 13/16; 23/24; 27/30; 33/36. </em>Click ''TIERS''<strong> </strong>on the racetrack to place this bet. </td>\r\n <td valign="top">Payout is equivalent to a Split bet 17:1 </td>\r\n </tr>\r\n <tr>\r\n <td><p><em>Orphelins</em></p></td>\r\n <td><p>Numbers included make up the two slices of the wheel outside the Tiers and Voisins. You need 5 chips of the selected value. 1 chip is placed straight-up on 1 and 1 chip on each of the splits: <em>6/9; 14/17; 17/20</em> and <em>31/34</em>. Click ''ORPHELINS''<strong> </strong>on the racetrack to place this bet. </p></td>\r\n <td><p>Payout is equivalent to the bets made. Straight bet 35:1, and Split bet 17:1</p></td>\r\n </tr>\r\n <tr>\r\n <td><p><em>Jeu 0</em></p></td>\r\n <td><p>You need 4 chips of the selected value. 1 chip is placed on <em>0/3</em><strong> </strong>split, 1 on <em>12/15</em><strong> </strong>split, 1 on <em>32/35</em> split and 1 chip is a straight bet on number <em>26</em>. Click ''JEU 0''<strong> </strong>on the racetrack to place this bet. </p></td>\r\n <td><p>Payout is equivalent to the bets made. Straight bet 35:1, and Split bet 17:1 </p></td>\r\n </tr>\r\n <tr>\r\n <td><p><em>Number and its Neighbours</em></p></td>\r\n <td><p>5-piece bet on a certain number on the wheel, which covers that number and two numbers on either side of it. Click on any number on the racetrack to place this bet. </p></td>\r\n <td><p>Payout is equivalent to a Straight bet 35:1 </p></td>\r\n </tr>\r\n</tbody></table>\r\n\r\n<p> Malfunction voids all plays and pays! </p>\r\n \r\n </div>', 0.0000, 0, 1000, 65.00, 7220.0960, 19062.8100, 0.0000, 0.0000, 0.0000, 'table roulette', 1.00, 1000.00, 20000.00, 0.00, '1,100', 1, 0, 0, '0', 0.0000, 0, 0, 0, 0, 0, 0, 0, '0', '0', 999999, 127);


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
