/*
╠═ f4.Player ══════════════════════════════════════════════════════════════
  Software: f4.Player - flash video player
   Version: alpha 2.1
   Support: http://f4player.org
    Author: goker cebeci
   Contact: goker [at] cebeci .name
 -------------------------------------------------------------------------
   License: Distributed under the Lesser General Public License (LGPL)
            http://www.gnu.org/copyleft/lesser.html
 This program is distributed in the hope that it will be useful - WITHOUT
 ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.
═══════════════════════════════════════════════════════════════════════════ */
package f4 {
	import flash.display.StageScaleMode; 
	import flash.display.StageAlign;
	import flash.display.StageDisplayState;  
	import flash.display.MovieClip;
	import flash.display.Loader;
	import flash.display.SimpleButton;
	import flash.display.Bitmap;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.NetConnection;
	import flash.net.NetStream;		
	import flash.media.Video;
	import flash.media.SoundTransform
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent; 		
	import flash.events.NetStatusEvent;
	import flash.utils.Timer;
	import flash.geom.Rectangle;   
	
    public class Player extends MovieClip {
		public var player:MovieClip; 
		public var videourl:String;
		public var thumbnailurl:String;
		public var autoplay:Boolean;
		public var fullScreen:Boolean;
		public var X:int;
		public var Y:int;
		public var W:int;
		public var H:int;		
		private static var padding:int = 13; //  Navigation Bar padding
		private var barPadding:int;		
		private var seekBarWidth:int; // seek-bar width
		private var barWidth:int;
//--------------------------------------  ### ------------------------------------------
		private var ns:NetStream;
		private var netStatusCache:String;					
		private var video:Video;				
		private var thumbnail:Bitmap;				
		private var meta:Object;
		private var progress:int;
		private var ready:Boolean = false;
		private var bufferFlush:Boolean = false;
		private var invalidTime:Boolean = false;
		private var seeking:Boolean = false;			
		private var progressBarTimer:Timer = new Timer(250);
		private var playingBarTimer:Timer = new Timer(250);
        public function Player(videourl:String,thumbnailurl:String,W:int,H:int,skin:String,autoplay:Boolean=false,fullScreen:Boolean=true,Y:int=0,X:int=0) {
			this.videourl = videourl;
			this.thumbnailurl = thumbnailurl;
			this.autoplay = autoplay;
			this.fullScreen = fullScreen;
			this.X = X;
			this.Y = Y;
			this.W = W?(W<150?150:W):480;
			this.H = H?(H<150?150:H):270;
			skin = skin ? skin : 'skins/default.swf'
			var skinLoader:Loader = new Loader();
			skinLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, skinCompleteEvent);
			//skinLoader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, skinProgressEvent);
			skinLoader.load(new URLRequest(skin));
        }
// EVENT ╠═════════════	  # SKIN COMPLETE EVENT #	═════════════
		private function skinCompleteEvent(event:Event):void {
			player = event.currentTarget.content;
			this.addChild(player);			
			//set skin [
			player.overBtn.visible = false;
			player.playBtn.visible = false;
			player.navigator.visible = false;
			var nav:MovieClip = player.navigator;
			seekBarWidth = nav.seekBar.width;
			nav.playBtn.x = padding;
			nav.pauseBtn.visible = false;
			nav.pauseBtn.y = nav.playBtn.y;				
			nav.bar.x = nav.playBtn.width + padding * 2;
			nav.container.x = nav.bar.x + padding;
			barPadding = (nav.container.height - nav.playingBar.height)*.5;			
			nav.progressBar.x = nav.playingBar.x = nav.seekBar.x = nav.container.x + barPadding;
			nav.progressBar.y = nav.playingBar.y = nav.seekBar.y = nav.container.y + barPadding;
			nav.seeker.x = nav.container.x+barPadding;
			nav.seeker.y = nav.container.y-barPadding;
			nav.playingBar.width = 0;
			setPosition();
			// ] set skin
//--------------------------------------  ### ------------------------------------------
			//thumbnailurl [
			if(thumbnailurl){
				var tn = new Loader();
				var tnEvent:Function = function(event:Event):void {
					thumbnail = tn.content; 
					var dim = 1;
					var vert:Boolean = (W/H) > 1;
					if(thumbnail.width > thumbnail.height && vert){
						dim = H / thumbnail.height;
					} else {
						dim = W / thumbnail.width;
					}
					thumbnail.width = thumbnail.width * dim;
					thumbnail.height = thumbnail.height * dim;
					thumbnail.x = (W - thumbnail.width) / 2 >> 0;	
					thumbnail.y = (H - thumbnail.height) / 2 >> 0;
					player.screen.addChildAt(thumbnail,0);
					// screen size fix [
					//player.screen.width = image.width;	
					//player.screen.height = image.height;
					// ]
					//image.x = player.screen.x;
					//image.y = player.screen.y;
				}
				tn.contentLoaderInfo.addEventListener(Event.COMPLETE, tnEvent);
				tn.load(new URLRequest(thumbnailurl));
			}
			// ] thumbnailurl
//--------------------------------------  ### ------------------------------------------
			var client:Object = new Object();
			client.onMetaData = metaDataObject;			
			var c:NetConnection = new NetConnection();
            c.connect(null);
			ns = new NetStream(c);
			ns.bufferTime = 5; // buffer time 5 sec.
			ns.client = client;	
			ns.addEventListener(NetStatusEvent.NET_STATUS, netStatusEvent);	
//--------------------------------------  ### ------------------------------------------
			// PLAYER
			video = new Video();	
			video.smoothing = true;			
			//video.x = player.screen.x;
			//video.y = player.screen.y;
			//video.width = player.screen.width;
			//video.height = player.screen.height;
			video.attachNetStream(ns);
			player.addChildAt(video,1);
			player.playBtn.addEventListener(MouseEvent.CLICK, playEvent);
			// AUTOPLAY
			if(this.autoplay) {
				var clicker:Function = playEvent;
				clicker(new MouseEvent(MouseEvent.CLICK));
			} else player.playBtn.visible = true;
//--------------------------------------  ### ------------------------------------------
		}
// FUNC ╠═════════════		# SET POSITION #		═════════════
		private function setPosition():void{
			player.background.x = X;
			player.background.y = Y;
			player.background.width = W;
			player.background.height = H;			
			var Width:int = W;
			var Height:int = H;
			var dim = 1;
			var vert:Boolean = (W/H) > 1;
			/*// VIDEO RATIO
			if(Width > int(Height * 1.3333)){ // 1.3333 => 4/3 || 1.7777 => 16/9 format
				player.screen.width = int(Height * 1.7777);
				player.screen.height = Height;
			} else {
				player.screen.width = Width;
				player.screen.height = int(Width * .75); // .75 => 4/3 || .5625 => 16/9 format
			}
			*/
			//player.screen.width = Width;
			//player.screen.height = Height;
			
			player.overBtn.width = Width;
			player.overBtn.height = Height;			
			var nav:MovieClip = player.navigator;
			player.overBtn.x = player.screen.x = nav.x = X;
			player.overBtn.y = player.screen.y = Y;
			player.bufferMovie.x = player.screen.x + (Width-player.bufferMovie.width)*.5;
			player.bufferMovie.y = player.screen.y + (Height-player.bufferMovie.height)*.5;			
			player.playBtn.x = player.screen.x + (Width-player.playBtn.width)*.5;
			player.playBtn.y = player.screen.y + (Height-player.playBtn.height)*.5;
			//NAVIGATOR POSITION
				nav.y = player.screen.y + Height - nav.height - padding *.5;				
				nav.bar.width = W - nav.bar.x - padding;
				var endPoint:int = nav.bar.x + nav.bar.width;
				if(fullScreen)
					endPoint = nav.fullScreen.x = endPoint - nav.fullScreen.width - padding;
				else nav.fullScreen.visible = false;
				endPoint = nav.volumeBar.x = endPoint - nav.volumeBar.width - padding;
				nav.container.width = endPoint - nav.container.x - padding;
				nav.progressBar.width = nav.playingBar.width = nav.seekBar.width = barWidth = nav.container.width - barPadding * 2;
				if(progress){ // progress bar size
					var newWidth:Number =((progress * barWidth *.01) >> 0);
					nav.progressBar.x = nav.seekBar.x + newWidth;
					nav.progressBar.width = barWidth - newWidth;
				}
			// VIDEO
			if(video){
				dim = 1;
				if(video.width > video.height && vert){
					dim = H / video.height;
				} else {
					dim = W / video.width;
				}
				video.width = video.width * dim;
				video.height = video.height * dim;
				video.x = (W - video.width) / 2 >> 0;	
				video.y = (H - video.height) / 2 >> 0;
			}
			if(thumbnail){
				dim = 1;
				if(thumbnail.width > thumbnail.height && vert){
					dim = H / thumbnail.height;
				} else {
					dim = W / thumbnail.width;
				}
				thumbnail.width = thumbnail.width * dim;
				thumbnail.height = thumbnail.height * dim;
				thumbnail.x = (W - thumbnail.width) / 2 >> 0;	
				thumbnail.y = (H - thumbnail.height) / 2 >> 0;
			}
		}
// EVENT ╠═════════════		# RESIZE EVENT #		═════════════
		public function resizeEvent(event:Event):void {
			W = stage.stageWidth;
			H = stage.stageHeight;
			setPosition();
		}
// EVENT ╠═════════════	  # NET  STATUS EVENT #		═════════════
		private function netStatusEvent(event:NetStatusEvent):void {		
			if(netStatusCache != event.info.code){
				switch (event.info.code) {
					case "NetStream.Play.Start" :
						playingBarTimer.start();
					break;
					case "NetStream.Buffer.Empty" :
					break;
					case "NetStream.Buffer.Full" :
					break;
					case "NetStream.Buffer.Flush" :
						bufferFlush = true;
					break;
					case "NetStream.Seek.Notify" :
						invalidTime = false;				
					break;
					case "NetStream.Seek.InvalidTime" :
						bufferFlush = false;
						invalidTime = true;						
					break;
					case "NetStream.Play.Stop" :
						if(bufferFlush) STOP();			
					break;
				}
				netStatusCache = event.info.code;
			}
		}
// OBJECT ╠═════════════	   # META DATA OBJECT #		═════════════
		private function metaDataObject(data:Object):void {
			meta = data;
			player.bufferMovie.visible = false;
			//video.scaleMode = VideoScaleMode.MAINTAIN_ASPECT_RATIO;
			playingBarTimer.addEventListener(TimerEvent.TIMER, playingBarTimerEvent);
			var nav:MovieClip = player.navigator;
			nav.playBtn.addEventListener(MouseEvent.CLICK, playPauseEvent);
			nav.pauseBtn.addEventListener(MouseEvent.CLICK, playPauseEvent);
			player.overBtn.visible = true;
			player.overBtn.buttonMode = true;
			player.overBtn.addEventListener(MouseEvent.CLICK, playPauseEvent);
			player.overBtn.addEventListener(MouseEvent.MOUSE_OVER, controlDisplayEvent);
			player.overBtn.addEventListener(MouseEvent.MOUSE_OUT, controlDisplayEvent);
			nav.addEventListener(MouseEvent.MOUSE_OVER, controlDisplayEvent);
			nav.addEventListener(MouseEvent.MOUSE_OUT, controlDisplayEvent);
			/// seeker [
				nav.seeker.buttonMode = true;
				nav.seeker.addEventListener(MouseEvent.MOUSE_DOWN, seekerEvent);
				this.stage.addEventListener(MouseEvent.MOUSE_UP, stageMouseUpEvent);			
				nav.playingBar.buttonMode = true;
				nav.playingBar.addEventListener(MouseEvent.MOUSE_DOWN, playingBarEvent);
				nav.seekBar.buttonMode = true;
				nav.seekBar.addEventListener(MouseEvent.MOUSE_DOWN, seekBarEvent);
			// ] seeker
			// volume [
				volumeTransform = new SoundTransform();	
				nav.volumeBar.mute.addEventListener(MouseEvent.CLICK, volumeEvent);	
				nav.volumeBar.mute.addEventListener(MouseEvent.ROLL_OVER, volumeEvent);				
				nav.volumeBar.volumeOne.addEventListener(MouseEvent.CLICK, volumeEvent);		
				nav.volumeBar.volumeOne.addEventListener(MouseEvent.ROLL_OVER, volumeEvent);
				nav.volumeBar.volumeTwo.addEventListener(MouseEvent.CLICK, volumeEvent);
				nav.volumeBar.volumeTwo.addEventListener(MouseEvent.ROLL_OVER, volumeEvent);
				nav.volumeBar.volumeThree.addEventListener(MouseEvent.CLICK, volumeEvent);
				nav.volumeBar.volumeThree.addEventListener(MouseEvent.ROLL_OVER, volumeEvent);
				nav.volumeBar.volumeFour.addEventListener(MouseEvent.CLICK, volumeEvent);
				nav.volumeBar.volumeFour.addEventListener(MouseEvent.ROLL_OVER, volumeEvent);
				nav.volumeBar.volumeFive.addEventListener(MouseEvent.CLICK, volumeEvent);
				nav.volumeBar.volumeFive.addEventListener(MouseEvent.ROLL_OVER, volumeEvent);
			// ] volume
			// fullScreen [
				nav.fullScreen.buttonMode = true;
				nav.fullScreen.addEventListener(MouseEvent.CLICK, fullScreenHandler);
			// ] fullScreen
		}
// EVENT ╠═════════════  # PROGRESSBAR TIMER EVENT #	═════════════
		private function progressBarTimerEvent(event:TimerEvent):void {
			progress = (( ns.bytesLoaded / ns.bytesTotal * 100 ) >> 0);
			var w:Number =((progress * barWidth *.01) >> 0);
      		player.navigator.progressBar.x = player.navigator.seekBar.x + w;
			player.navigator.progressBar.width = barWidth - w;
			if(progress >= 100){
				progressBarTimer.stop();
			}
		}
// EVENT ╠═════════════  # PLAYINGBAR TIMER EVENT #	═════════════
		private function playingBarTimerEvent(event:TimerEvent):void {
			player.navigator.seeker.currentTime.text = formatTime(ns.time);
			var percent:Number = (ns.time / meta.duration * barWidth).toFixed(2);
			player.navigator.playingBar.width = percent;
			player.navigator.seeker.x = player.navigator.playingBar.x + percent;
		}
// FUNC ╠═════════════		# FORMAT TIME #			═════════════
		private function formatTime(time:Number):String {
			if(time > 0){
			var integer:String = String((time*.0166)>>0);
			var decimal:String = String((time%60)>>0);
			return ((integer.length<2)?"0"+integer:integer)+":"+((decimal.length<2)?"0"+decimal:decimal);
			} else return String("00:00");
		}
// EVENT ╠═════════════	  	# PLAY EVENT #			═════════════
		private function playEvent(event:MouseEvent):void {
			ready = true;
			var dim = 1;
			var vert:Boolean = (W/H) > 1;
			if(video.width > video.height && vert){
				dim = H / video.height;
			} else {
				dim = W / video.width;
			}
			video.width = video.width * dim;
			video.height = video.height * dim;
			video.x = (W - video.width) / 2 >> 0;	
			video.y = (H - video.height) / 2 >> 0;
			
			
			player.navigator.playBtn.visible = (player.navigator.playBtn.visible?false:true);
			player.navigator.pauseBtn.visible = (player.navigator.pauseBtn.visible?false:true);
			player.playBtn.visible = false;
			player.screen.visible = false;
			ns.play(videourl); // *** play video file				
			// PROGRESS
			progressBarTimer.addEventListener(TimerEvent.TIMER, progressBarTimerEvent);			
			progressBarTimer.start();
		}
// EVENT ╠═════════════	  # PLAY&PAUSE EVENT #		═════════════
		private function playPauseEvent(event:MouseEvent):void {
			TOGGLEPAUSE();
		}
// EVENT ╠═════════════	# CONTROL DISPLAY EVENT #	═════════════	
		private function controlDisplayEvent(event:MouseEvent):void {
			if(event.type == 'mouseOver'){
				player.navigator.visible = true;
			} else 	player.navigator.visible = false;
		}
// EVENT ╠═════════════		 # SEEKER EVENT #		═════════════
		private function seekerEvent(event:MouseEvent):void {
			seeking = true;
			var rectangle:Rectangle = new Rectangle(player.navigator.playingBar.x, player.navigator.seeker.y, barWidth, 0);
			player.navigator.seeker.startDrag(false, rectangle);
			TOGGLEPAUSE();
			this.stage.addEventListener(MouseEvent.MOUSE_MOVE, stageMouseMoveEvent);
		}
// EVENT ╠═════════════  # STAGE MOUSE MOVE EVENT #	═════════════
		private function stageMouseMoveEvent(event:MouseEvent):void { // for seeker position
			if(meta.duration > 0) {
			   if(seeking) {
					var point:int = (((player.navigator.seeker.x - player.navigator.playingBar.x) / barWidth) * meta.duration) >> 0;
					if(point <= 0 || point >= (meta.duration >> 0)) player.navigator.seeker.stopDrag();
						player.navigator.seeker.currentTime.text = formatTime(point);				
						ns.seek(point);
				}
			}
		}
// EVENT ╠═════════════    # STAGE MOUSE UP EVENT #	═════════════
		private function stageMouseUpEvent(event:MouseEvent):void { // for stop seeking
			if(seeking){
				seeking = false;
				player.navigator.seeker.stopDrag();
				TOGGLEPAUSE();
			}
		}
// EVENT ╠═════════════      # PLAYINGBAR EVENT #		═════════════
		private function playingBarEvent(event:MouseEvent):void { //click to seek
			var point:Number = (meta.duration * (event.localX*player.navigator.playingBar.width/seekBarWidth) / barWidth);
			ns.seek(point);
		}
// EVENT ╠═════════════       # SEEKBAR EVENT #		═════════════
		private function seekBarEvent(event:MouseEvent):void { //click to seek
			var point:Number = (event.localX * meta.duration / seekBarWidth);
			ns.seek(point);
		}
// EVENT ╠═════════════       # VOLUME EVENT #		═════════════
		private function volumeEvent(event:MouseEvent):void {
			var thisMC:MovieClip = event.currentTarget as MovieClip;
			if(event.buttonDown || event.type == 'click')
			switch (event.currentTarget) {
				case player.navigator.volumeBar.mute :
				if(volumeTransform.volume > 0) {					
					volumeCache = .1;
					setVolume(0);
				} else setVolume(volumeCache);
				break;
				case player.navigator.volumeBar.volumeOne :		setVolume(.2);	break;
				case player.navigator.volumeBar.volumeTwo :		setVolume(.4);	break;
				case player.navigator.volumeBar.volumeThree :	setVolume(.6);	break;
				case player.navigator.volumeBar.volumeFour :	setVolume(.8);	break;
				case player.navigator.volumeBar.volumeFive :	setVolume(1);	break;
			}
		}
// FUNC ╠═════════════		 # SET VOLUME #			═════════════
		public function setVolume(newVolume):void{
			volumeTransform.volume = newVolume;
			ns.soundTransform = volumeTransform;
			player.navigator.volumeBar.mute.gotoAndStop((newVolume > 0)?1:2);
			player.navigator.volumeBar.volumeOne.gotoAndStop((newVolume >= 0.2)?1:2);
			player.navigator.volumeBar.volumeTwo.gotoAndStop((newVolume >= 0.4)?1:2);
			player.navigator.volumeBar.volumeThree.gotoAndStop((newVolume >= 0.6)?1:2);
			player.navigator.volumeBar.volumeFour.gotoAndStop((newVolume >= 0.8)?1:2);
			player.navigator.volumeBar.volumeFive.gotoAndStop((newVolume == 1)?1:2);
		}
// EVENT ╠═════════════     # FULLSCREEN EVENT #		═════════════		
		private function fullScreenHandler(event:MouseEvent):void {
			if(this.stage.displayState == StageDisplayState.FULL_SCREEN){
				this.stage.displayState = StageDisplayState.NORMAL;
			} else {
				this.stage.displayState = StageDisplayState.FULL_SCREEN;
			}
		}
// FUNC ╠═════════════	   # TOGGLE PAUSE #			═════════════
		public function TOGGLEPAUSE():void {	
			if(invalidTime){ ns.seek(0); invalidTime = false; }
			player.navigator.playBtn.visible = (player.navigator.playBtn.visible?false:true);
			player.navigator.pauseBtn.visible = (player.navigator.pauseBtn.visible?false:true);
			player.playBtn.visible = false;
			player.screen.visible = false;
			ns.togglePause();		
		}
// FUNC ╠═════════════		 	# STOP #			═════════════
		public function STOP():void {
			player.navigator.playBtn.visible = true;
			player.navigator.pauseBtn.visible = false;
			player.screen.visible = true;
			player.playBtn.visible = true;
			ns.seek(0);
			ns.pause();
		}
    }
}
