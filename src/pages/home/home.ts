import { Component,OnInit } from '@angular/core';

import { NavController,Platform,LoadingController,ToastController,ModalController} from 'ionic-angular';
import GeoFire from 'geofire';
import * as firebase from 'firebase';
import { AngularFireDatabase,FirebaseObjectObservable } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 GoogleMapOptions,
 CameraPosition,
 MarkerOptions,
 MarkerCluster,
 Marker,
 LatLng
} from '@ionic-native/google-maps';

import {googlemaps} from 'googlemaps';
import {ParcDetailsPage} from '../parc-details/parc-details';
import {UpdateParcPage} from '../update-parc/update-parc';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../providers/auth-service/auth-service';
import { MapService } from '../../providers/map-service/map-service';
import { GoogleMapsClusterProvider } from '../../providers/google-maps-cluster/google-maps-cluster';
import { Subject } from 'rxjs/Subject';
import { OrderByDistancePipe } from "../../pipes/order-by-distance/order-by-distance";
import {TranslateService} from 'ng2-translate';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';



@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})

export class HomePage implements OnInit{

	parcDetails = ParcDetailsPage;
	parcUpdate = UpdateParcPage;
	login =LoginPage;
	parcs: any[];
	parcsList: any[]=[];
	userPicture:String="";
	db: AngularFireDatabase;
	googleMapJDK=null ;
	googleMapNative= null;
	mapClusterNative:MarkerCluster=null;
	currentPosition:LatLng; 
	autocompleteItems: any;
	autocomplete: any;
	acService:any;
	geoQuery:any;
	markersEntered: 0;
	mapHeight:String="0px";
	radius: number = 3;
	quickRadius: number = 0.5;
	numberOfParcsToBeLoaded: number = 0;
	numberParcLoaded : number=0; // 0 is the initial value
	mapCenter= {lat:0, lng:0};	
	keys=[];	
	markers =[];
	markerCluster =[];
	loading = null;
	lastRequestParcsAround = new Date().getTime();
	geolocationNotAllowedLabel ="";
	playgroundNoName ="";
	tapHereLabel ="";
	noParcReturned:boolean=false;
	geoLocationMarker = new google.maps.Marker({
		    position:  new google.maps.LatLng(0,0),
		    map: this.googleMapJDK,
		    icon:this._map.getIconPathCurrentPosition()
	   	});
	markerAddress= new google.maps.Marker({
            position: {lat: 0, lng: 0},
            draggable: false,
            icon: 'https://www.google.com.au/maps/vt/icon/name=assets/icons/spotlight/spotlight_pin_v2_shadow-1-small.png,assets/icons/spotlight/spotlight_pin_v2-1-small.png,assets/icons/spotlight/spotlight_pin_v2_dot-1-small.png,assets/icons/spotlight/spotlight_pin_v2_accent-1-small.png&highlight=ff000000,ea4335,960a0a,ffffff&color=ff000000?scale=1'
         });
	geoLocationMarkerNative:Marker=null;
	loadingCompleted: boolean=true;
	httpRequestActivated: boolean = false;
	useNativeMap:boolean = true;

	constructor(public navCtrl: NavController, db: AngularFireDatabase,
		public platform: Platform,
		public geolocation: Geolocation,
		public afAuth: AngularFireAuth, private _auth: AuthService, private _map:MapService,
		public mapCluster: GoogleMapsClusterProvider,
		public loadingCtrl: LoadingController,private translate: TranslateService,
		private diagnostic: Diagnostic,public toastCtrl: ToastController,private openNativeSettings: OpenNativeSettings,
		private ga: FirebaseAnalytics,private storage: Storage, public modalCtrl: ModalController) {


		this.acService = new google.maps.places.AutocompleteService();        
		this.autocompleteItems = [];
		this.autocomplete = {
			query: ''
		};
		
		this.db = db;
		this.parcs =[];
	}

	ngOnInit() {
		this.ga.setCurrentScreen("Home_Page");
		this.afAuth.auth.onAuthStateChanged(function(user) {
	        if (user) {
	         	document.getElementById('user-pic').style.backgroundImage = 'url(' + this._auth.displayPicture() + ')';
	        }
	        else{
	        	document.getElementById('user-pic').style.backgroundImage = 'url(../../assets/images/profile_placeholder.png)';
	        }
		}.bind(this));
		this.acService = new google.maps.places.AutocompleteService();        
		this.autocompleteItems = [];
		this.autocomplete = {
			query: ''
		};    
		
		this.platform.ready().then(() => {
			this.storage.get('langKey').then((val) => {
	          	if(val !==null){
	              	this.translate.use(val);
	         	}
	          	else{
	            	this.translate.use('fr');
	          	}
	          	
				this.translate.get('map.GEOLOCATIONNOTALLOWED').subscribe((res: string) => {
					this.geolocationNotAllowedLabel = res;
				});
				this.translate.get('map.NONAMEPARC').subscribe((res: string) => {
					this.playgroundNoName = res;
				});
				this.translate.get('map.TAPHERE').subscribe((res: string) => {			
					this.tapHereLabel = res;
				});
				this.loadingCompleted = false;
				if( this.platform.is('core')  ) {
				  this.useNativeMap = false;
				} 
				this.loadMap();
				
				if(this.useNativeMap === false){
					this.startGeolocation();
				}
	        });	
	       
		});			
	}
	
	setLocationMarker = function(lat,lng){
		if(this.useNativeMap ===true){
			console.log("geoLocationMarkerNative");
			this.geoLocationMarkerNative.setPosition( {
				lat: lat,
				lng: lng
			});
		}
		else{
			var latLng = new google.maps.LatLng(lat,lng);
			this.geoLocationMarker.setMap(this.googleMapJDK);
			this.geoLocationMarker.setPosition(latLng);
		}
	}
	startGeolocation = function(){
		let gf = new GeoFire( firebase.database().ref('geofire'));
		var positionOptions = {timeout: 10000, enableHighAccuracy: true};
		this.geolocation.getCurrentPosition(positionOptions).then((resp) => {

			this.currentPosition =  new LatLng(resp.coords.latitude,resp.coords.longitude);
			var latLng = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
			this._map.setMapCenter(resp.coords.latitude,resp.coords.longitude);
			this._map.setCurrentMapCenter();
			this.setLocationMarker(resp.coords.latitude,resp.coords.longitude);

			if(this.httpRequestActivated ===true){
				this._map.getPlaygroundsByGeographicCoordinates(Number(resp.coords.latitude),Number(resp.coords.longitude),2).map(data => data.json())
				.subscribe(data=> {
				});
			}
			else{
				this.geoQuery = gf.query({
					center: [resp.coords.latitude,resp.coords.longitude],
					radius: this.radius 
				});	
				this.setupInitialGeoQuery();
			}		
			
		}).catch((error) => {
			this.errorCallback(error);			
		});		
	};


	checkCompleteLoad(){
		let returnedValue = false;
		if(this.numberOfParcsToBeLoaded - this.numberParcLoaded <=0){
			returnedValue = true;
			try{
				this.loadingCompleted =true;
			}
			catch(err) {
				    console.log("error", err);
			}
			this.numberOfParcsToBeLoaded = 0;
			this.numberParcLoaded = 0;
			this.updateDistance();	
			
			
			if(this.useNativeMap === false){
				this.mapCluster.redraw();
			}
			else{

			}
		}
		else{
			this.loadingCompleted = false;
		}
		return returnedValue;
	}
	defaultGeoLocation = function(){
		let gf = new GeoFire( firebase.database().ref('geofire'));
		this.currentPosition =  new LatLng( 48.863129, 2.345152);
		this._map.setMapCenter(48.863129,2.345152);
		this._map.setCurrentMapCenter();

		this.geoQuery = gf.query({
			center:  [48.863129, 2.345152],
			radius: this.radius 
		});	
		this.setupInitialGeoQuery();
	}

	setupInitialGeoQuery(){
		this.markersEntered =0;
		this.loadingCompleted = false;
		this.numberOfParcsToBeLoaded=0;
		var onKeyEnteredRegistration = this.geoQuery.on("key_entered", function(key, location, distance) {
			var keyEntered= {
                key:key,
                location:location,
                distance: distance
            };
            this.markersEntered++;
            this.numberOfParcsToBeLoaded = this.numberOfParcsToBeLoaded +1;
            this.newKeyEntered(keyEntered.key, keyEntered.location, keyEntered.distance);
		}.bind(this));

		var onReadyRegistration =  this.geoQuery.on("ready", function() {
			if(this.markersEntered ===0 && this.parcs.length ===0){
				console.log("onReadyRegistration","this.markersEntered ===0 && this.parcs.length ===0");
				this.noParcReturned = true;
				this.checkCompleteLoad();
			}
			else if(this.markersEntered ===0 && this.parcs.length !==0){
				console.log("onReadyRegistration","this.markersEntered ===0 && this.parcs.length !==0");
				this.checkCompleteLoad();
			}
			else{
				console.log("onReadyRegistration","this.noParcReturned");
				this.noParcReturned = false;
			}
			this.markersEntered =0;
		}.bind(this));


		var onKeyExitdRegistration =  this.geoQuery.on("key_exited", function(key, location, distance) {
			console.log(key, location, distance);
		}.bind(this));
	}


	newKeyEntered(key, location, distance){
		if(this.keys[key]){
			this.numberParcLoaded = this.numberParcLoaded+1;
			this.checkCompleteLoad();
		}
		else{
			var parc = {'key':key, 'distance':distance.toString().substring(0,4),'reviewsLength':0,'parcItem': null };
			var parcItemObject: FirebaseObjectObservable<any>;
	        parcItemObject = this.db.object('positions/'+key);
			var subscription = parcItemObject.subscribe(snapshot => {			
				parc.parcItem = snapshot;
				if(!parc.parcItem.rate){
					parc.parcItem.rate = {'rate': 0};
				}				
				
				if(!this.keys[key]){
					this.parcs.push(parc);	
					this.keys[key] = key;
					this.displayParcMarker(parc,'add');
					this.numberParcLoaded = this.numberParcLoaded +1;
					this.checkCompleteLoad();
				}
				else{
					console.log(this.getPlaygroundPosition(key));
					if(this.getPlaygroundPosition(key) !==-1 ){
						this.parcs[this.getPlaygroundPosition(key)].parcItem = snapshot;
					}
					this.displayParcMarker(parc,'update');
				}
				
				
			});	
		}
	}

	orderByDistance = function(items, field, reverse) {
	    var filtered = [];
	    for(let item of items){
	       filtered.push(item);
	    };
	    filtered.sort(function (a, b) {
	        return ( parseFloat(a[field]) >  parseFloat(b[field]) ? 1 : -1);
	    });
	    if(reverse) filtered.reverse();
	  
	    return filtered;
    }
	displayParcMarker =function(parc, mode){
		if(this.useNativeMap === true){
			let name = this.playgroundNoName;
			if(parc.parcItem.name !==''){
				name = parc.parcItem.name;
			}
			if(mode==='add'){
				this.googleMapNative.addMarker({
				    'position': {
				      lat: parc.parcItem.position.lat,
				      lng: parc.parcItem.position.lng
				    },
				    'title': name,
				    'snippet': this.tapHereLabel,
				    'icon': this._map.getIconNative(parc)
				  }).then((marker: Marker) => {
				  		this.markers[parc.key]= marker;
				  		/*this.markerCluster.push({
					    'position': {
					      lat: parc.parcItem.position.lat,
					      lng: parc.parcItem.position.lng
					    },
					    'title': name,
					    'snippet': "Tap here to get more details!",
					    'icon': this._map.getIconNative(parc)
					  });
					  */
				  		marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
				          	this.navCtrl.push(ParcDetailsPage, {key:parc.key} );
				        });
				        
				  });
				 
			}
			else{
				this.markers[parc.key].setPosition({
				      lat: parc.parcItem.position.lat,
				      lng: parc.parcItem.position.lng
				    })
			}
		}
		else{
			this.displayParcMarkerJDK(parc,mode);
		}
	};

	displayParcMarkerJDK =function(parc, mode){
		if(parc.parcItem){
			if(parc.parcItem.position){
				if(parc.parcItem.position.lat && parc.parcItem.position.lng){
					if(mode==='add'){
				   	var marker = new google.maps.Marker({
				        position:  new google.maps.LatLng(parc.parcItem.position.lat, parc.parcItem.position.lng),
				        map: this.googleMapJDK,
				        title: parc.parcItem.name,
				        icon:this._map.getIconPath(parc)
			   		});
			   		marker.addListener('click', function() {
		      			this.navCtrl.push(ParcDetailsPage, {key:parc.key} );
			      	}.bind(this));
			      	this.markers[parc.key]= marker;
					this.mapCluster.addMarker(marker, true);
				   	}
				   	else{
				   		this.markers[parc.key].setPosition(new google.maps.LatLng(parc.parcItem.position.lat, parc.parcItem.position.lng));	
				   	}
				}
			}
			else{
				console.log("issue parc: ", parc);
			}			
		}
	} 
	
	updateSearch() {
		if (this.autocomplete.query == '') {
			this.autocompleteItems = [];
			return;
		}
		let self = this; 
		let config = { 
			//types:  ['geocode'], // other types available in the API: 'establishment', 'regions', and 'cities'
			input: this.autocomplete.query, 
			componentRestrictions: {  } 
		}
		this.acService.getPlacePredictions(config, function (predictions, status) {
			if(status ==="OK"){
				self.autocompleteItems = [];            
				predictions.forEach(function (prediction) {              
				self.autocompleteItems.push(prediction);
			});
			}
			
		});
	}
	chooseItem(item){
		this.autocompleteItems=[];
		this.geocodeAddress(item);
	}  
	
	geocodeAddress(item){
		this.ga.logEvent('pageview', {"page:" :'list_'+ item.description});
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'placeId': item.place_id}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
            	this.autocomplete.query = item.description;
				this.parcs = [];
				this.keys =[];
				if(this.useNativeMap ===false){
                	this._map.setMapCenter(results[0].geometry.location.lat(),results[0].geometry.location.lng());
            	}
            	else{
            		let location = new LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
		        	let options : CameraPosition<any> = {
		          		target:location,
		          		zoom: 12,
		          		tilt: 0

		        	};
		        	this._map.setMapCenter(results[0].geometry.location.lat(),results[0].geometry.location.lng());
					this._map.setCenter(results[0].geometry.location.lat(),results[0].geometry.location.lng());
		        	this.googleMapNative.moveCamera(options);
            	}
                this.markerAddress.setPosition({lat: results[0].geometry.location.lat(), lng:results[0].geometry.location.lng()});
                console.log(this.markerAddress.getPosition().lat(), this.markerAddress.getPosition().lng());
                this.markerAddress.setTitle(item.description);
                if(this.useNativeMap === false){
                	this.markerAddress.setMap( this.googleMapJDK);
                	console.log(this.markerAddress);
                }
                else{
                	this.googleMapNative.addMarker({
				    'position': {
				      lat: results[0].geometry.location.lat(),
				      lng: results[0].geometry.location.lng()
				    },
				    'title': item.description
				  });
                }

                this.displayParcsAround(true,false);
			}
			else{
				
			}
		}.bind(this));
	}
	
	loadMapNative(){
		this.mapHeight = String(this.platform.height()/2)+"px";
		let element: HTMLElement = document.getElementById('map');
		this.googleMapNative = this.createMapNative(element,false,google.maps.MapTypeId.ROADMAP);
		
	}
	dragEnd(e: {gutterNum: number, sizes: Array<number>}) {
        if(this.useNativeMap ===true){
	        let element: HTMLElement = document.getElementById('map');
	        let element2: HTMLElement = document.getElementById('mapSplit');
	        console.log(element2.offsetHeight);
	        element.style.height = String(element2.offsetHeight)+"px";
	        this.googleMapNative.setDiv(element);
    	}
    }
    
	loadMap() {
		if(this.useNativeMap ===true){
			this.loadMapNative();
		}
		else{
			this.mapHeight = String(this.platform.height()/2)+"px";
			let element: HTMLElement = document.getElementById('map');
			
			this.googleMapJDK = this._map.createMapJDK(element,false,google.maps.MapTypeId.ROADMAP);
			
			var centerControlDiv = document.createElement('div');
			centerControlDiv.id="centerControlDiv";
	      	var centerControl = this.centerControl(centerControlDiv, this.googleMapJDK);
	      	this.googleMapJDK.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);

			this.googleMapJDK.addListener('dragend', function() {
				//console.log('dragend');
				this._map.setCurrentMapCenter();
		        //this._map.setMapCenter(this._map.getCenter().lat,this._map.getCenter().lng);
		        this.displayParcsAround(false,false);

		        
		    }.bind(this));
		    google.maps.event.addDomListener(window, 'resize', function() {
		    		 this._map.setMapCenter(this._map.getCenter().lat,this._map.getCenter().lng);
				}.bind(this));
			this.mapCluster.addCluster(this.googleMapJDK, []);
		}
		
	};
	
	displayParcsAround = function(cleanParc, forceRequest){
		this.loadingCompleted = false;
		this._map.setCurrentMapCenter();
		if(this.httpRequestActivated === false){
			if(new Date().getTime() - this.lastRequestParcsAround > 300 || forceRequest ===true ){
            	this.lastRequestParcsAround = new Date().getTime();
				if(cleanParc){
			      this.cleanParcsDisplayed();
				}
				
				this.geoQuery.updateCriteria({
					center: [this._map.getCenter().lat,this._map.getCenter().lng],
					radius: this.radius 
				}); 
			}
		}
		else{
			this.getPlaygroundsAround(false,false,this.quickRadius);
	        this.getPlaygroundsAround(false,false,this.radius);
		}
    };

    cleanParcsDisplayed = function(){
    	for(var i=0;i<this.markers.length;i++){
    		if(this.useNativeMap ===true){
    			this.markers[i].remove();
    		}
    		else{
    			this.markers[i].setMap(null);
    		}
    	
    	}
    	this.markers =[];
    	this.parcs = [];
  		this.keys = [];
  		if(this.useNativeMap ===true){
			//this.mapClusterNative.empty();
		}
		else{
			this.mapCluster.clearMarkers();
		}
      	
    }

    getPlaygroundsAround =  function(cleanParc, forceRequest,radius){
    	if(this.httpRequestActivated ===true){
	    	if(new Date().getTime() - this.lastRequestParcsAround > 300 || forceRequest ===true ){
	            this.lastRequestParcsAround = new Date().getTime();
				if(cleanParc){
			      this.cleanParcsDisplayed();
				}
				this.loadingCompleted = false;
		    	this._map.getPlaygroundsByGeographicCoordinates(this._map.getCenter().lat,this._map.getCenter().lng,radius).map(data => data.json())
					.subscribe(data=> {
					  	for(var i = 0;i<data.length;i++){
						  	var parc = {'key':data[i].key, 'distance':0,'reviewsLength':0,'parcItem': data[i].content };
							if(this.keys[data[i].key]){
								this.displayParcMarker(parc,'update');
								console.log(this.getPlaygroundPosition(data[i].key));
								console.log(this.parcs[this.getPlaygroundPosition(data[i].key)]);
							}
							else{
								if(!parc.parcItem.rate){
									parc.parcItem.rate = {'rate': 0};
								}
								this.displayParcMarker(parc,'add');
								this.keys[data[i].key] = data[i].key;
								this.parcs.push(parc);	
							}													
						}
						this.updateDistance();
						this.loadingCompleted = true;
						
						if(this.useNativeMap === false){
							this.mapCluster.redraw();
						}
					});
				}
    	}
    };
    getPlaygroundsDetails =  function(){
    	this._map.getPlaygroundDetails(this.parcs).map(data => data.json())
			.subscribe(data=> {console.log(data)})
  
    }

    getPlaygroundPosition(key){
    	var returnedValue = -1;
    	for (var i=0; i<this.parcs.length; i++){
    		if(this.parcs[i].key === key){
    			returnedValue = i
    		}
    	}
    	return returnedValue;
    }

    updateDistance = function(){
    	console.log("updateDistance start ");
    	var lat= Number(this._map.getCenter().lat);
		var lng = Number(this._map.getCenter().lng);
		console.log(lat,lng);
      	for (var i=0; i<this.parcs.length; i++){
      		if(this.parcs[i]){
      			this.parcs[i].distance = GeoFire.distance(
  				[lat,lng],
  				[parseFloat(this.parcs[i].parcItem.position.lat), parseFloat(this.parcs[i].parcItem.position.lng)]
  				).toString().substring(0,4);
      		}
  			
  		}
  		if(this.parcs){
  			this.parcs = this.orderByDistance(this.parcs, 'distance',false);
  		}
  		this.parcsList = this.parcs.slice(0,10);
  		console.log("updateDistance end ");
    };

    geolocateUser = function(){
    	var positionOptions = {timeout: 10000, enableHighAccuracy: true};
		this.geolocation.getCurrentPosition(positionOptions).then((resp) => {
			this.currentPosition =  new LatLng(resp.coords.latitude,resp.coords.longitude);
			var latLng = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
            this._map.setMapCenter(resp.coords.latitude,resp.coords.longitude);
            this.displayParcsAround(false,false);
            this.setLocationMarker(resp.coords.latitude,resp.coords.longitude);
            this.markerAddress.setMap(null);
		}).catch((error) => {
			this.errorCallback(error);			
		});		

    }
    
    errorCallback = function(e) {
    	console.log(e);
    	let message = this.geolocationNotAllowedLabel
    	if(e.code ===1 || e.code ===2 ){
    		message = this.geolocationNotAllowedLabel;
    	}
    	else{
    		message = e.message;
    	}
    	let toast = this.toastCtrl.create({
	      message: message,
	      duration: 10000,
	      showCloseButton: true,
	      closeButtonText: "Settings"
	    });
	    if(this.navCtrl.getActive().name === "HomePage" || this.navCtrl.getActive().name ==="l"){
	    	toast.present();
    		toast.onDidDismiss((data, role) => {    
	       	 	console.log('Dismissed toast');
	        	if(role== "close") {
	        		if(this.useNativeMap ===true){
	           			this.openNativeSettings.open("location"); 
	           		}
	        	}
	    	});
    		this.diagnostic.requestLocationAuthorization();
	    }
    	this.defaultGeoLocation();
    }

	geolocate = function(){
		this.startGeolocation();
	}

	centerControl(controlDiv, map) {
	    // Set CSS for the control border.
	    var controlUI = document.createElement('div');
	    controlUI.style.textAlign = 'center';
	    controlUI.title = 'Click to recenter the map';
	    controlDiv.appendChild(controlUI);
	    // Set CSS for the control interior.
	    var controlText = document.createElement('i');
	    controlText.className = 'material-icons';
	    controlText.innerHTML = 'my_location';
	    controlUI.appendChild(controlText);

	    // Setup the click event listeners: simply set the map to Chicago.
	    controlUI.addEventListener('click', function() {
	      this.geolocate();
	    }.bind(this));

  	}

  	addParc(){
  		if(this._auth.authenticated ===false ){
  			let myModal = this.modalCtrl.create(this.login);
    		myModal.present();
  		}
  		else{
  			this.navCtrl.push(this.parcUpdate, {mode:'add', position:this._map.getCenter()} );
  		}
  	}

  	createMapNative(element, mapTypeControl,mapTtypeId){
    	let location = new LatLng(-34.9290,138.6010);
    	let mapOptions: GoogleMapOptions = this._map.getDefaultMapOptions();
    	this.googleMapNative = GoogleMaps.create(element, mapOptions);
    	this.googleMapNative.one(GoogleMapsEvent.MAP_READY).then( () => {
    		console.log("camera ready");
    		let gf = new GeoFire( firebase.database().ref('geofire'));
    		
	      	this.getLocation().then(res=>{ 
	        	
	        	let location = new LatLng(res.coords.latitude, res.coords.longitude);
	        	this._map.setCenter(location.lat,location.lng);
	        	this.geoQuery = gf.query({
					center: [res.coords.latitude,res.coords.longitude],
					radius: this.radius 
				});	
		        let options : CameraPosition<any> = {
		          target:location,
		          zoom: 12,
		          tilt: 0
		        };
		        this.googleMapNative.addMarker({
				    'position': {
				     	lat: res.coords.latitude,
				      	lng: res.coords.longitude
				    },
				    'icon': this._map.getIconPathCurrentPositionNative()

				  }).then((marker: Marker) => {
				  		this.geoLocationMarkerNative = marker;
				});
	        	this.setupInitialGeoQuery();
	       		this.googleMapNative.moveCamera(options);
	       		this.currentPosition =  location;
				
	        })
	     	.catch((error) => {
				 this.googleMapNative.addMarker({
				    'position': {
				     	lat: 48.863129,
				      	lng: 2.345152
				    },
				    'icon': this._map.getIconPathCurrentPositionNative()
				}).then((marker: Marker) => {
				  		this.geoLocationMarkerNative = marker;
				});

				this.errorCallback(error);
				
			});
      	
      
       		this.googleMapNative.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(
            (data) => {
 
                var target = this.googleMapNative.getCameraTarget();
     			var mapCenter = {lat: target.lat, lng: target.lng};
				this._map.setMapCenter(mapCenter.lat,mapCenter.lng);
				this._map.setCenter(mapCenter.lat,mapCenter.lng);
				this.displayParcsAround(false,false);
            });
      		this.googleMapNative.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(
            (data) => {
                this.getLocation().then(res=>{ 
	            	let location = new LatLng(res.coords.latitude, res.coords.longitude);
		        	let options : CameraPosition<any> = {
		          		target:location,
		          		zoom: 12,
		          		tilt: 0

		        	};
		        	this.googleMapNative.moveCamera(options);
	        		this._map.setMapCenter(location.lat,location.lng);
	        		this._map.setCenter(location.lat,location.lng);
	        		this.currentPosition =  location;
					this.setLocationMarker(res.coords.latitude,res.coords.longitude);
	        		this.displayParcsAround(false,false);
	        	}).catch((error) => {
					this.errorCallback(error);
					
					
				});	
            });
      		/*
            this.googleMapNative.addMarkerCluster({
		   		//maxZoomLevel: 5,
		    	boundsDraw: true,
		    	markers: this.markerCluster,
		    	icons: [
		            {min: 20, max: 49, url: 'assets/images/m1.png', anchor: {x: 16, y: 16}},
		            {min: 50, max: 99, url: 'assets/images/m2.png.png', anchor: {x: 16, y: 16}},
		            {min: 100, max: 199, url: 'assets/images/m3.png.png', anchor: {x: 24, y: 24}},
		            {min: 200, max: 499, url: 'assets/images/m4.png.png', anchor: {x: 32, y: 32}},
		            {min: 500, max: 5000, url: 'assets/images/m5.png.png', anchor: {x: 32, y: 32}}
		         ]
		  	}).then((markerCluster: MarkerCluster) => {
		  		this.mapClusterNative =markerCluster ;
		  		console.log(markerCluster)
		  	});
		  	*/
		  	
    	});
    	this.useNativeMap = true;
    	return this.googleMapNative;
  	}

  getLocation(){
    var positionOptions = {timeout: 10000, enableHighAccuracy: true};
    return this.geolocation.getCurrentPosition(positionOptions);   
  }
}
