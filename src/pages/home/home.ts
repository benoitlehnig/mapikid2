import { Component,OnInit,Input, Output, EventEmitter } from '@angular/core';

import { NavController,Platform,LoadingController} from 'ionic-angular';
import GeoFire from 'geofire';
import * as firebase from 'firebase';
import { AngularFireDatabase, FirebaseListObservable,FirebaseObjectObservable } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 LatLng,
 MarkerOptions,
CameraPosition,
 Marker
} from '@ionic-native/google-maps';

import {googlemaps} from 'googlemaps';
import {ParcDetailsPage} from '../parc-details/parc-details';
import {UpdateParcPage} from '../update-parc/update-parc';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../providers/auth-service/auth-service';
import { MapService } from '../../providers/map-service/map-service';
import { GoogleMapsClusterProvider } from '../../providers/google-maps-cluster/google-maps-cluster';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})

export class HomePage implements OnInit{

	parcDetails = ParcDetailsPage;
	parcUpdate = UpdateParcPage;
	parcs: any[];
	userPicture:String="";
	displayedList:any[];
	db: AngularFireDatabase;
	map: GoogleMap=null ;
	googleMapJDK=null ;
	currentPosition:LatLng; 
	autocompleteItems: any;
	autocomplete: any;
	acService:any;
	geoQuery:any;
	markersEntered: any[];
	mapHeight:String="0px";
	radius: number = 5;
	numberOfParcsToBeLoaded:0;
	numberParcLoaded : Subject<number> // 0 is the initial value
	mapCenter=null;	
	keys=[];	
	loading = null;
	lastRequestParcsAround = new Date().getTime();
	
	constructor(public navCtrl: NavController, db: AngularFireDatabase,private googleMaps: GoogleMaps,
		public platform: Platform,
		private geolocation: Geolocation,
		public afAuth: AngularFireAuth, private _auth: AuthService, private _map:MapService,
		public mapCluster: GoogleMapsClusterProvider,
		public loadingCtrl: LoadingController) {

		this.numberParcLoaded = new Subject();
		this.numberParcLoaded.next(0);
		this.numberParcLoaded.subscribe((value)  => {
			this.checkCompleteLoad(value);
 		})
		this.acService = new google.maps.places.AutocompleteService();        
		this.autocompleteItems = [];
		this.autocomplete = {
			query: ''
		};  
		this.loading = this.loadingCtrl.create({
	    	content: 'Please wait while playgrounds are loading'
	 	});
		this.db = db;
		this.parcs =[];
		
		
	}

	ngOnInit() {
		this.afAuth.auth.onAuthStateChanged(function(user) {
	        if (user) {
	         	console.log(user);
	         	document.getElementById('user-pic').style.backgroundImage = 'url(' + this._auth.displayPicture() + ')';
	        }
	        else{
	        	console.log("logged out");
	        	document.getElementById('user-pic').style.backgroundImage = 'url(../../assets/images/profile_placeholder.png)';
	        }
		}.bind(this));
		this.acService = new google.maps.places.AutocompleteService();        
		this.autocompleteItems = [];
		this.autocomplete = {
			query: ''
		};    
		
		this.platform.ready().then(() => {
			
			this.loadMap();
			let gf = new GeoFire( firebase.database().ref('geofire'));
			
			
			
			var positionOptions = {timeout: 10000, enableHighAccuracy: true};
			this.geolocation.getCurrentPosition(positionOptions).then((resp) => {
				console.log('geolocation done');
				this.currentPosition =  new LatLng(resp.coords.latitude,resp.coords.longitude);
				this.geoQuery = gf.query({
					center: [resp.coords.latitude,resp.coords.longitude],
					radius: this.radius 
				});	
				
				this.loading.present(); 
				var latLng = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
				this.googleMapJDK.setCenter(latLng);
				this.mapCenter = this.googleMapJDK.getCenter();
				this.setupInitialGeoQuery();
			}).catch((error) => {
				console.log('Error getting location', error);
				var latLng = new google.maps.LatLng(48.863129, 2.345152);
				this.currentPosition =  new LatLng( 48.863129, 2.345152);
				this.googleMapJDK.setCenter(latLng);
				this.mapCenter = this.googleMapJDK.getCenter();
				this.geoQuery = gf.query({
					center:  [48.863129, 2.345152],
					radius: this.radius 
				});	
				
				this.setupInitialGeoQuery();
			});			
        });		
	}
	checkCompleteLoad(value){
		if(this.numberOfParcsToBeLoaded!=0){

			if(value === Number(this.numberOfParcsToBeLoaded)-1){
				console.log("all parcs loaded");
				try{
					this.loading.dismiss();
				}
				catch(err) {
				    console.log("error", err);
				}
				this.numberOfParcsToBeLoaded = 0;
				this.updateDistance();
				
				this.displayedList = this.parcs.slice(0,25);
			}
		}
		

	}

	setupInitialGeoQuery(){
		console.log("setupInitialGeoQuery");
		this.markersEntered =[];
			var onKeyEnteredRegistration = this.geoQuery.on("key_entered", function(key, location, distance) {
				console.log("onKeyEnteredRegistration");
				var keyEntered= {
                    key:key,
                    location:location,
                    distance: distance
                };
                this.markersEntered.push(keyEntered);
			}.bind(this));
					
			
			var onReadyRegistration =  this.geoQuery.on("ready", function() {
				console.log("onReadyRegistration");
				this.numberOfParcsToBeLoaded =this.markersEntered.length;
				for(var i = 0;i<this.markersEntered.length;i++){
					this.newKeyEntered(i,this.markersEntered[i].key, this.markersEntered[i].location, this.markersEntered[i].distance);
				}
				
				this.markersEntered =[];
				
			}.bind(this));

	}

	newKeyEntered(index,key, location, distance){
		console.log(key + "entered");
		if(this.keys[key]){
			
		}
		else{
			this.keys[key] = key;
			var parc = {'key':key, 'distance':distance.toString().substring(0,4),'reviewsLength':0,'parcItem': null };
			var parcItem: FirebaseObjectObservable<any>;
	        parcItem = this.db.object('positions/'+key);
			parcItem.subscribe(snapshot => {
				parc.parcItem = snapshot;
				
				if(!parc.parcItem.rate){
					parc.parcItem.rate = {'rate': 0};
				}
				//if(this.isParcRegistered(key) !==null){
				//	this.parcs[this.isParcRegistered(key)] = parc;
				//}
				
				this.parcs.push(parc);
				console.log(parc);		
				this.displayParcMarkerJDK(parc);
				this.numberParcLoaded.next(index);				
			});	
		}
		
		
	}
	isParcRegistered = function(key) {
        var id:string= null;
        for (var i in this.parcs.length) {
            if (this.parcs[i].key === key) {
                id = i;
                break;
            }
        }
        return id;
    };

	orderByDistance = function(items, field, reverse) {
	    var filtered = [];
	    for(let item of items){
	       filtered.push(item);
	    };
	    filtered.sort(function (a, b) {
	        return (a[field] > b[field] ? 1 : -1);
	    });
	    if(reverse) filtered.reverse();
	  
	    return filtered;
    }
	
	displayParcMarkerJDK =function(parc){

		var marker = new google.maps.Marker({
	        position:  new google.maps.LatLng(parc.parcItem.position.lat, parc.parcItem.position.lng),
	        map: this.googleMapJDK,
	        title: parc.parcItem.name,
	        icon:this._map.getIconPath(parc),
	   	});
	    marker.addListener('click', function() {
      		this.navCtrl.push(ParcDetailsPage, {key:parc.key, map:this.map} );
      
      	}.bind(this));
		this.mapCluster.addMarker(marker, true);
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
		
		 var geocoder = new google.maps.Geocoder();
		 geocoder.geocode({'placeId': item.place_id}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {

				this.parcs = [];
                var latLng = new google.maps.LatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
                this.googleMapJDK.setCenter(latLng);
                this.mapCenter = this.googleMapJDK.getCenter();
                this.displayParcsAround();
			}
			else{
				
			}
		 }.bind(this));
	}
	
	loadMap() {
		// create a new map by passing HTMLElement
		this.mapHeight = String(this.platform.height()/2)+"px";
		let element: HTMLElement = document.getElementById('map');

		this.googleMapJDK = this._map.createMapJDK(element);

		this.googleMapJDK.addListener('dragend', function() {
	        this.displayParcsAround(false,false);
	        this.mapCenter = this.googleMapJDK.getCenter();
	        this.updateDistance();
	    }.bind(this));
		this.mapCluster.addCluster(this.googleMapJDK, []);
		this.mapCenter = this.googleMapJDK.getCenter();
	};

	
	displayParcsAround = function(cleanParc, forceRequest){
      if(new Date().getTime() - this.lastRequestParcsAround > 300 || forceRequest ===true ){
            this.lastRequestParcsAround = new Date().getTime();

		if(cleanParc){
		      this.cleanParcsDisplayed();
		}
		this.geoQuery.updateCriteria({
			center: [this.googleMapJDK.getCenter().lat(),this.googleMapJDK.getCenter().lng()],
			radius: this.radius 
		}); 
		this.loading = this.loadingCtrl.create({
	    	content: 'Please wait while playgrounds are loading'
	 	});
	 	this.loading.present();
      }
    };

    updateDistance = function(){
        console.log(">>update distance", this.parcs.length);
      	for (var i=0; i<this.parcs.length; i++){
  			this.parcs[i].distance = GeoFire.distance(
  				[this.googleMapJDK.getCenter().lat(),this.googleMapJDK.getCenter().lng()],
  				[parseFloat(this.parcs[i].parcItem.position.lat), parseFloat(this.parcs[i].parcItem.position.lng)]
  			).toString().substring(0,4);
  		}
  		
  		if(this.parcs){
  			this.parcs = this.orderByDistance(this.parcs, 'distance',false);
  		}
    };

	positionChanged = function(){
		this.getCameraPosition(function(camera) {
			var buff = ["Current camera position:\n",
				    "latitude:" + camera.target.lat,
				    "longitude:" + camera.target.lng,
				    "zoom:" + camera.zoom,
				    "tilt:" + camera.tilt,
				    "bearing:" + camera.bearing].join("\n");
			
     		this.geoQuery.updateCriteria({
                center: [camera.target.lat,camera.target.lng]
            })
       	}.bind(this))
	}
	geolocate = function(){
		var positionOptions = {timeout: 10000, enableHighAccuracy: true};
			this.geolocation.getCurrentPosition(positionOptions).then((resp) => {
				this.parcs = [];
				console.log('geolocation done');
				this.currentPosition =  new LatLng(resp.coords.latitude,resp.coords.longitude);
				var latLng = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
                this.googleMapJDK.setCenter(latLng);
                this.mapCenter = this.googleMapJDK.getCenter();
                this.displayParcsAround();
				
			}).catch((error) => {
				console.log('Error getting location', error);
				
			});		

	}
}