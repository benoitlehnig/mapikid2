import { Component,OnInit } from '@angular/core';
import { NavController,Platform } from 'ionic-angular';
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

import {TranslateService} from 'ng2-translate';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit{

	parcDetails = ParcDetailsPage;
	parcs: any[];
	displayedList:any[];
	db: AngularFireDatabase;
	map: GoogleMap ;
	currentPosition:LatLng; 
	autocompleteItems: any;
	autocomplete: any;
	acService:any;
	placesService: any;
	geoQuery:any;
	markersEntered: any[];
	
	constructor(public navCtrl: NavController, db: AngularFireDatabase,private googleMaps: GoogleMaps,
		public platform: Platform,translate: TranslateService,
		private geolocation: Geolocation) {
			
		this.acService = new google.maps.places.AutocompleteService();        
		this.autocompleteItems = [];
		this.autocomplete = {
			query: ''
		};  
		
		translate.setDefaultLang('en');
		translate.use('en');
		
		this.db = db;
		this.parcs =[]

		let gf = new GeoFire( firebase.database().ref('geofire'));
		this.geoQuery = gf.query({
					center: [48.863129,2.345152],
					radius: 5
				});
		this.markersEntered =[];
		
		var onKeyEnteredRegistration = this.geoQuery.on("key_entered", function(key, location, distance) {
			var keyEntered= {
				key:key,
				location:location,
				distance: distance

			};
			this.markersEntered.push(keyEntered);
		}.bind(this));
		
		var onReadyRegistration =  this.geoQuery.on("ready", function() {
			this.geoQuery.cancel();    
			for(var i = 0;i<this.markersEntered.length;i++){
				this.newKeyEntered(this.markersEntered[i].key, this.markersEntered[i].location, this.markersEntered[i].distance);
			}
			
		}.bind(this));
		
		this.geolocation.getCurrentPosition().then((resp) => {
			this.currentPosition =  new LatLng(resp.coords.latitude,resp.coords.longitude);
			console.log(this.currentPosition);
			}).catch((error) => {
			  console.log('Error getting location', error);
		});
		let watch = this.geolocation.watchPosition();
		watch.subscribe((data) => {
		 // data can be a set of coordinates, or an error (if an error occurred).
		 // data.coords.latitude
		 // data.coords.longitude
		});
		
		
			
		
	}
	
	ngOnInit() {
		this.acService = new google.maps.places.AutocompleteService();        
		this.autocompleteItems = [];
		this.autocomplete = {
			query: ''
		};    
		
		this.platform.ready().then(() => {
            console.log("test");
			this.loadMap();
        });		
	}

	newKeyEntered(key, location, distance){
		var parc = {'key':key, 'distance':distance.toString().substring(0,4),'reviewsLength':0,'parcItem': null };

		var parcItem: FirebaseObjectObservable<any>;
        parcItem = this.db.object('positions/'+key);
		parcItem.subscribe(snapshot => {
			parc.parcItem = snapshot;
			console.log(parc.parcItem);
			if(!parc.parcItem.rate){
				parc.parcItem.rate = {'rate': 0};
			}
			this.parcs.push(parc);
			this.displayParcMarker(parc);
			var displayedFullList = this.orderByDistance(this.parcs, 'distance',false);
			this.displayedList = displayedFullList.slice(0,50);

		});	
		
	}
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
	
	displayParcMarker =function(parc){
		let markerOptions: MarkerOptions = {
          position:  new LatLng(parc.parcItem.position.lat, parc.parcItem.position.lng),
          title: parc.parcItem.name
        };
	} 
	
	updateSearch() {
		console.log('modal > updateSearch');
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
			console.log('modal > getPlacePredictions > status > ', status);
			self.autocompleteItems = [];            
			predictions.forEach(function (prediction) {              
				self.autocompleteItems.push(prediction);
			});
		});
	}
	chooseItem(item){
		this.autocompleteItems=[];
		this.geocodeAddress(item);
	}  
	
	geocodeAddress(item){
		console.log(item);
		 var geocoder = new google.maps.Geocoder();
		 geocoder.geocode({'placeId': item.place_id}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
				console.log(results);
				this.parcs = [];
				this.geoQuery.updateCriteria({
                    center: [results[0].geometry.location.lat(),results[0].geometry.location.lng()]
                });
				var onKeyEnteredRegistration = this.geoQuery.on("key_entered", function(key, location, distance) {
						this.newKeyEntered(key, location, distance);
				}.bind(this));
				
			}
			else{
				
			}
		 }.bind(this));
		 
		
	}
	
	loadMap() {

	console.log("loading amp");
	// create a new map by passing HTMLElement
	let element: HTMLElement = document.getElementById('map');

	this.map= this.googleMaps.create(element);

	 // listen to MAP_READY event
	 // You must wait for this event to fire before adding something to the map or modifying it in anyway
	this.map.one(GoogleMapsEvent.MAP_READY).then(
	   () => {
		 console.log('Map is ready!');
		 //this.map.setCenter(this.currentPosition);
		  // create CameraPosition
		let position: CameraPosition = {
		   target: this.currentPosition,
		   zoom: 18,
		   tilt: 30
		 };
		this.map.moveCamera(position);
	   }
	 );

	 // create LatLng object
	 let ionic: LatLng = new LatLng(43.0741904,-89.3809802);



	 // create new marker
	 let markerOptions: MarkerOptions = {
	   position: ionic,
	   title: 'Ionic'
	 };
	this.map.addMarker(markerOptions).then( (marker: Marker) => {
		  marker.showInfoWindow();
		});
	}


}
