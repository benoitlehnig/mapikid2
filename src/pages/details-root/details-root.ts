import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import GeoFire from 'geofire';
import {TranslateService} from 'ng2-translate';
import * as firebase from 'firebase';
import { MapService } from '../../providers/map-service/map-service';

/**
 * Generated class for the DetailsRootPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  	selector: 'page-details-root',
  	templateUrl: 'details-root.html',
})
export class DetailsRootPage {

	parc: {[k: string]: any} = {};
	map= null ;
	mapDetailsMap =null;
	db: AngularFireDatabase;
	toiletsMarkers : any[];
	numberOfEquipment = 0;
	isLowNumberofEquipment = true;
	placesService: any;
	labelWeekDay : string[] = ['','','','','','',''];
	parcObject: FirebaseObjectObservable<any>;
	marker = null;

	constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams,
		db: AngularFireDatabase, translate: TranslateService,private _map:MapService) {
		console.log(navParams.data.$key);
		this.parcObject = db.object('positions/'+navParams.data.$key);
		this.parcObject.subscribe(snapshot => {
	   		this.parc = snapshot;
	   		console.log(this.parc);
	   		if(!this.parc.facilities){
				this.parc.facilities = null;
			}
			var latLng = new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng);
			if(this.marker){
				this.marker.setPosition(latLng);
			}
			if(this.map){
				this.map.setCenter(latLng);
			}
			this.toiletsMarkers = [];
			this.findClosestToilets();
		});

		
		console.log(this.parc);
		translate.get('parcDetails.MONDAY').subscribe((res: string) => {
			this.labelWeekDay[0]= res;
		});
		translate.get('parcDetails.TUESDAY').subscribe((res: string) => {
			this.labelWeekDay[1]= res;
		});
		translate.get('parcDetails.WEDNESDAY').subscribe((res: string) => {
			this.labelWeekDay[2]= res;
		});
		translate.get('parcDetails.THURSDAY').subscribe((res: string) => {
			this.labelWeekDay[3]= res;
		});
		translate.get('parcDetails.FRIDAY').subscribe((res: string) => {
			this.labelWeekDay[4]= res;
		});
		translate.get('parcDetails.SATURDAY').subscribe((res: string) => {
			this.labelWeekDay[5]= res;
		});
		translate.get('parcDetails.SUNDAY').subscribe((res: string) => {
			this.labelWeekDay[6]= res;
		});		
	}
	

	ngOnInit() {
		this.platform.ready().then(() => {
			this.loadMap();
			this.setUpPlaceService();
			this.triggerGetGoogleData();
			this.setLowNumberofEquipment();
		});
	}
 
 
  	loadMap = function(){		
		let element: HTMLElement = document.getElementById('mapDetail');
		this.map = this._map.createMapJDK(element);
		var latLng = new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng);
		this.map.setCenter(latLng);
		this.map.setZoom(18);
		this.marker = new google.maps.Marker({
            position:  latLng,
            map: this.map,
            title: this.parc.name  
    	});
    	let element2: HTMLElement = document.getElementById('mapStreetView');
    	if(this.mapDetailsMap!==null){
			var parcPosition = new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng );
			this.mapDetailsMap.setPosition(
				parcPosition
			);
		}
		else{
			this.mapDetailsMap = new google.maps.StreetViewPanorama(
	           	element2,
	            {
	             	position: {lat: this.parc.position.lat, lng: this.parc.position.lng},
	             	pov: {heading: 165, pitch: 0},
	              	linksControl: false,
          		  	panControl: false,
          			enableCloseButton: false,
	              	zoom: 1
	            });
		}
  	}
  	setUpPlaceService = function() {
		this.placesService = new google.maps.places.PlacesService(this.map);
  	}
  	setLowNumberofEquipment = function(){
  		this.numberOfEquipment = 0;
  		console.log("setLowNumberofEquipment");
  		console.log(this.parc.facilities)
		if(this.parc.facilities){
			console.log(this.parc.facilities);
			if(this.parc.facilities.animals ===true){this.numberOfEquipment++};
			if(this.parc.facilities.monkeyBridge ===true){this.numberOfEquipment++};
			if(this.parc.facilities.sandbox ===true){this.numberOfEquipment++};
			if(this.parc.facilities.slide ===true){this.numberOfEquipment++};
			if(this.parc.facilities.spider ===true){this.numberOfEquipment++};
			if(this.parc.facilities.swing ===true){this.numberOfEquipment++};
			if(this.parc.facilities.trampoline ===true){this.numberOfEquipment++};
		}
		console.log(this.numberOfEquipment);
		if(this.numberOfEquipment>0){this.isLowNumberofEquipment = false;}
	}
	
  	isToiletsRegistered = function(key) {
		let id :number = -1;
		for (let i in this.toiletsMarkers) {
			if (this.toiletsMarkers[i].key === key) {
				id = +i;
				break;
			}
		}
		return id;
	}

	findClosestToilets = function(){
		let geoFireToilets = new GeoFire( firebase.database().ref('geofireToilets'));
		var geoQuery = geoFireToilets.query({
			center: [	Number(this.parc.position.lat),Number(this.parc.position.lng)],
			radius: 0.2
		});
		var image = './assets/images/toilets.png';
		
		var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
			var toilet= {
				key: key,
				position:location,
				distance:distance
			};
			
			var marker = new google.maps.Marker({
      		 	position:  new google.maps.LatLng(toilet.position[0], toilet.position[1]),
      		 	map: this.map,
      		    icon: image
      		});
			
			if(this.isToiletsRegistered(key)===-1){
				this.toiletsMarkers.push(marker); 
			}
		}.bind(this));

		var onReadyRegistration =  geoQuery.on("ready", function() {
			geoQuery.cancel();
		});
	}

	triggerGetGoogleData = function(){
		var request = 
		{
			location: new google.maps.LatLng(this.parc.position.lat,this.parc.position.lng),
			radius: '20',
			types : ['park', 'garden', 'aquarium','amusement_park']
			  
		};
		this.placesService.nearbySearch(request, 
			function(results, status){
				this.setGoogleData(results, status);
		}.bind(this));
	}

	setGoogleData = function(results,status) {
		console.log(results);
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
		      	var place = results[i];
				var request = {
					placeId: place.place_id					  
				};
				this.placesService.getDetails(request, this.applyGoogleData.bind(this));
		    }
		}
	}
	applyGoogleData = function(results, status){

		console.log(results);
		if(results.opening_hours){
			this.parc.opening_hours = results.opening_hours;
			for(var i=0;i<this.parc.opening_hours.weekday_text.length;i++){
				this.parc.opening_hours.weekday_text[0]= 
					this.labelWeekDay[0] + ": "+ this.parc.opening_hours.weekday_text[0].slice(7);
				this.parc.opening_hours.weekday_text[1]= 
					this.labelWeekDay[1] + ": "+ this.parc.opening_hours.weekday_text[0].slice(8);
				this.parc.opening_hours.weekday_text[2]= 
					this.labelWeekDay[2] + ": "+ this.parc.opening_hours.weekday_text[0].slice(8);
				this.parc.opening_hours.weekday_text[3]= 
					this.labelWeekDay[3] + ": "+ this.parc.opening_hours.weekday_text[0].slice(8);
				this.parc.opening_hours.weekday_text[4]= 
					this.labelWeekDay[4] + ": "+ this.parc.opening_hours.weekday_text[0].slice(8);
				this.parc.opening_hours.weekday_text[5]= 
					this.labelWeekDay[5] + ": "+ this.parc.opening_hours.weekday_text[0].slice(8);
				this.parc.opening_hours.weekday_text[6]= 
					this.labelWeekDay[6] + ": "+ this.parc.opening_hours.weekday_text[0].slice(8);
			}

		}
		if(results.name && this.parc.name ===""){
			this.parc.name = results.name;
		}
			
	}


}
