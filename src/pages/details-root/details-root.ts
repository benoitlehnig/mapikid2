import { Component,Input } from '@angular/core';
import { NavController, NavParams,ModalController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';
import GeoFire from 'geofire';
import {TranslateService} from 'ng2-translate';
import * as firebase from 'firebase';
import { MapService } from '../../providers/map-service/map-service';
import { WeatherProvider } from '../../providers/weather/weather';
import {ReviewsRootPage} from '../reviews-root/reviews-root';
import {AddReviewPage} from '../add-review/add-review';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginPage } from '../login/login';
import { AuthService } from '../../providers/auth-service/auth-service';
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

	@Input() parcKey:string;
	parc: {[k: string]: any} = {'rate':{'numberRate':0}};
	map= null ;
	mapDetailsMap =null;
	toiletsMarkers : any[]=[];
	numberOfEquipment = 0;
	isLowNumberofEquipment = true;
	placesService: any;
	labelWeekDay : string[] = ['','','','','','',''];
	parcObject: FirebaseObjectObservable<any>;
	marker = null;
	mapURL = "https://www.google.com/maps/dir/?api=1&destination=";
	public localWeather:Object;
	public localWeatherForecast:Object;
	public uvIndex:Object;
	public pollution:Object;
	firstReviews =[];
	reviewsList:FirebaseListObservable<any[]>;
	reviews=[];
	parcReviews = ReviewsRootPage;
	userSigned: boolean=false;
	login = LoginPage;

	constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams,
		private db: AngularFireDatabase, translate: TranslateService,private _map:MapService,
		public modalCtrl: ModalController,
		private weatherService:WeatherProvider,public afAuth: AngularFireAuth, private _auth: AuthService) {
		
		
		
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
		this.afAuth.auth.onAuthStateChanged(function(user) {
        	this.userSigned = this._auth.authenticated;
    	}.bind(this));
	}
	

	ngOnInit() {
		this.platform.ready().then(() => {

			console.log("this.parKey",this.parcKey);
			if(this.parcKey){
				this.parcObject = this.db.object('positions/'+this.parcKey);
				this.parcObject.subscribe(snapshot => {
			   		
			   		if(snapshot.$value!==null){
			   			this.parc = snapshot;
			   			if(this.parc.rate ===null || !this.parc.rate){
				   			this.parc.rate= {'numberRate':0};
				   		}
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
						this.getWeather();
						this.codeAddress();
						this.mapURL = this.mapURL+this.parc.position.lat+","+this.parc.position.lng;
						this.setLowNumberofEquipment();
						this.loadMap();
						this.setUpPlaceService();
						this.triggerGetGoogleData();
			   		}
				});
				this.reviewsList = this.db.list('reviews/'+this.parcKey,{
					query: {
				        orderByChild: 'date',
				        limitToLast: (3)
				    }
				}).map( (arr) => { return (arr as Array<any>).reverse(); } ) as FirebaseListObservable<any[]>;
				
			}
		});
	}
 
 
  	loadMap = function(){		
		let element: HTMLElement = document.getElementById('mapDetail');
		this.map = this._map.createMapJDK(element,true,google.maps.MapTypeId.HYBRID);
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
  		console.log(this.parc.facilities)
		if(this.parc.facilities){
			console.log(this.parc.facilities);
			if(this.parc.facilities.water ===true){this.numberOfEquipment++};
			if(this.parc.facilities.wc ===true){this.numberOfEquipment++};
			if(this.parc.facilities.animals ===true){this.numberOfEquipment++};
			if(this.parc.facilities.monkeyBridge ===true){this.numberOfEquipment++};
			if(this.parc.facilities.sandbox ===true){this.numberOfEquipment++};
			if(this.parc.facilities.slide ===true){this.numberOfEquipment++};
			if(this.parc.facilities.spider ===true){this.numberOfEquipment++};
			if(this.parc.facilities.swing ===true){this.numberOfEquipment++};
			if(this.parc.facilities.turnstile ===true){this.numberOfEquipment++};
			if(this.parc.facilities.seesaw ===true){this.numberOfEquipment++};
			if(this.parc.facilities.climb ===true){this.numberOfEquipment++};
			if(this.parc.facilities.football ===true){this.numberOfEquipment++};
			if(this.parc.facilities.basketball ===true){this.numberOfEquipment++};
			if(this.parc.facilities.trampoline ===true){this.numberOfEquipment++};
			if(this.parc.facilities.other){this.numberOfEquipment++};
		}
		console.log(this.numberOfEquipment);
		if(this.numberOfEquipment>0){this.isLowNumberofEquipment = false;}
	}
	getWeather(){
		this.weatherService.geographicCoordinates(this.parc.position.lat, this.parc.position.lng)
		.map(data => data.json())
			.subscribe(data=> {
			  this.localWeather = data;
			  console.log(data);
			});
		this.weatherService.uvIndex(this.parc.position.lat, this.parc.position.lng)
		.map(data => data.json())
			.subscribe(data=> {
			  this.uvIndex = data;
			  console.log(data);
			});
		/*this.weatherService.pollution(this.parc.position.lat, this.parc.position.lng)
		.map(data => data.json())
			.subscribe(data=> {
			  this.pollution = data;
			  console.log(data);
			});*/
		this.weatherService.forecastGeographicCoordinates(this.parc.position.lat, this.parc.position.lng,4)
		.map(data => data.json())
			.subscribe(data=> {
			  this.localWeatherForecast = data.list;
			  console.log(data);
			});


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

	openAddReviewModal = function(){
		if(this._auth.authenticated ===false ){
  			let myModal = this.modalCtrl.create(this.login);
    		myModal.present();
  		}
  		else{
  			let obj = {parc: this.parc};
  			let myModal = this.modalCtrl.create(AddReviewPage,obj);
    		myModal.present();
  		}  		
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
	codeAddress = function() {
			console.log("codeAddress");
			var geocoder = new google.maps.Geocoder();
		    var latLng = new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng);
		    geocoder.geocode( {'location': latLng}, function(results, status) {
		      if(status === google.maps.GeocoderStatus.OK) {
		       	for( var j=0;j<results.length;j++){
					console.log("street_address test", results[j].types[0], results[j].formatted_address);
					if(results[j].types[0] === "street_address"){
						console.log("street_address", results[j].formatted_address);
						this.parc.street_address = results[j].formatted_address;
					}
				}
		      } else {
		        console.log('Geocode was not successful for the following reason: ' + status);
		      }
		}.bind(this));
	};

	round(value: number): number {
        return Math.round(value);
    }

    
   
}
