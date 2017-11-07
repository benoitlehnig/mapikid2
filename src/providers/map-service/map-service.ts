
import { Injectable } from '@angular/core';
import {googlemaps} from 'googlemaps';

@Injectable()
export class MapService {
  
   private googleMapJDK=null ;

  	
  constructor() {
    
  }

  createMapJDK(element){
  	var mapTypeId = google.maps.MapTypeId.ROADMAP;
	  var mapTypeControl = true;
	  var mapTypeControlOptions = {
		  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
	  };

  	var googleMapJDK = new google.maps.Map(element, {
		center: {lat: 48.863129, lng: 2.345152},
		zoom: 12,
		styles: [{
			featureType: 'poi',
      stylers: [{ visibility: 'off' }]  // Turn off points of interest.
      }, {
	  	featureType: 'transit.station',
      stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
      }],
      mapTypeId: mapTypeId,
      streetViewControl: false,
      mapTypeControl: mapTypeControl,
      mapTypeControlOptions: mapTypeControlOptions,
      gestureHandling : 'greedy',
      fullscreenControl: false
	});
	return googleMapJDK;

  }
  getGoogleMapJDK() {
  	return this.googleMapJDK
  }


  getIconPath(parc){
  	var iconPath = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor:  '#FE9F1F',  
      fillOpacity: 1,                
      scale: 8,
      strokeColor: '#FE9F1F',
      strokeWeight: 4
    };
  	if(parc.parcItem.source !="community"){
	 	  iconPath.fillColor= '#FE9F1F';
      iconPath.fillOpacity = 0.4;
	 	  iconPath.strokeColor= '#FE9F1F';
	  }
	  if(!parc.parcItem.open){
	 	  iconPath.fillColor= "#efefef";
      iconPath.fillOpacity= 0;
	 	  iconPath.strokeColor= "#efefef";
	  }

  	if(parc.parcItem.free===false){
      iconPath.fillColor= "#F96466";
      iconPath.strokeColor= "#F2403C";
      iconPath.fillOpacity= 1;
  	}	
  	return iconPath;
  }
  getLabelName(parc){
		var label = {text: '', color: ""};
		if(!parc.parcItem.open){
	   	label = {text: 'X', color: "#DDDDDD"};
	  }
    if(parc.parcItem.free===false){
      label = {text: '$', color: "#FFFFFF"};
    }
	}
 
}