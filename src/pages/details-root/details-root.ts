import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable,FirebaseObjectObservable } from 'angularfire2/database';
import GeoFire from 'geofire';
import * as firebase from 'firebase';

/**
 * Generated class for the DetailsRootPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-details-root',
  templateUrl: 'details-root.html',
})
export class DetailsRootPage {

	parc: {[k: string]: any} = {};
	
	db: AngularFireDatabase;
	toiletsMarkers : any[];
	
	constructor(public navCtrl: NavController, public navParams: NavParams,db: AngularFireDatabase) {
		this.parc = navParams.data;
		if(!this.parc.facilities){
			this.parc.facilities = null;
		}
		this.toiletsMarkers = [];
		this.findClosestToilets();
		console.log(this.parc);
		
		
	}

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailsRootPage');
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
		var image = 'images/toilets.png';
		
		var iconPath = {
			  icon: image,
			  fillColor:  '#0000FF',                  
			  scale: 8,
			  strokeColor: '#0000FF',
			  strokeWeight: 4
		};
		
		var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
			var toilet= {
				key: key,
				position:location,
				distance:distance
			};
			
			var marker = {
				position:  new google.maps.LatLng(toilet.position[0], toilet.position[1]),
				key: toilet.key,
				icon: image
			};
			
			if(this.isToiletsRegistered(key)===-1){
				this.toiletsMarkers.push(marker); 
			}
		}.bind(this));

		var onReadyRegistration =  geoQuery.on("ready", function() {
			geoQuery.cancel();
		});
	}

}
