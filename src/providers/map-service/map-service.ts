
import { Injectable } from '@angular/core';
import {googlemaps} from 'googlemaps';
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 GoogleMapOptions,
 CameraPosition,
 MarkerOptions,
 Marker,
 LatLng 
} from '@ionic-native/google-maps';
import { Http,Headers,RequestOptions } from '@angular/http';

@Injectable()
export class MapService {
  
  private googleMapJDK=null ;
  private googleMapNative: GoogleMap; null;
  private baseUrl ='https://us-central1-parcmap.cloudfunctions.net/listPlaygroundsAround';
  private mapCenter= {lat:0, lng:0};  
  private useNativeMap:boolean = true;
  constructor(private googleMaps: GoogleMaps, public http: Http) {
    
  }

  createMapNative(element, mapTypeControl,mapTtypeId){
    let location = new LatLng(-34.9290,138.6010);
    let mapOptions: GoogleMapOptions = {
        camera: {
          target: {
            lat: 43.0741904,
            lng: -89.3809802
          },
          zoom: 18,
          tilt: 30
        },
        controls: {
          compass: true,
          myLocationButton: true,
          indoorPicker: true,
          zoom: true
        },
    };
    this.googleMapNative = GoogleMaps.create(element, mapOptions);
    this.useNativeMap = true;
    return this.googleMapNative;
  }


  createMapJDK(element, mapTypeControl,mapTtypeId){
  	var mapTypeId = mapTtypeId;

	  var mapTypeControlOptions = {
		  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
	  };


  	var googleMapJDK = new google.maps.Map(element, {
		center: {lat: 48.863129, lng: 2.345152},
		zoom: 14,
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
    this.useNativeMap = false;
    this.googleMapJDK = googleMapJDK;
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
  getIconPathCurrentPosition(){
    var iconPath = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor:  '#33B9B2',  
      fillOpacity: 1,                
      scale: 8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2
    };
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

   getPlaygroundsByGeographicCoordinates(lat: number , lon:number, radius:number){
      let url = this.baseUrl +`?lat=${lat}&lng=${lon}&radius=${radius}`;
      return this.http.get(url);
    }

    getPlaygroundDetails( listOfParcs){
      let headers = new Headers();
      headers.append( 'Content-Type', 'application/x-www-form-urlencoded');
      let bodyForm = new FormData();
      let bodyInside =[];
      for(var i=0;i<listOfParcs.length;i++){
        bodyForm.append("key", listOfParcs[i].key)
        var key = {"key": listOfParcs[i].key};
        bodyInside.push(key);
      }
      let options = new RequestOptions({ headers: headers });
      //let body = JSON.stringify(bodyInside);
      //console.log(body);

      let url = 'https://us-central1-parcmap.cloudfunctions.net/getPlaygroundDetails';
      return this.http.post(url,bodyForm,options);
    }
  
   setCurrentMapCenter = function(){  
    console.log("setCurrentMapCenter>>", this.mapCenter);  
    if(this.useNativeMap ===true){
      var target = this.googleMapNative.getCameraTarget();
      this.mapCenter = {lat: target.lat, lng: target.lng};
    }
    else{
      if(this.googleMapJDK !==null){
         this.mapCenter = {lat: this.googleMapJDK.getCenter().lat(), lng: this.googleMapJDK.getCenter().lng()}; ; 
      }
     
    }
    console.log("setCurrentMapCenter>> end ",this.mapCenter);
  }
  setMapCenter = function(lat,lng){
    if(this.useNativeMap ===true){
    }
    else{
      var latLng = new google.maps.LatLng(lat,lng);
      this.googleMapJDK.setCenter(latLng);
    }
  }
  getCenter = function(){
    return this.mapCenter;
  }
  
  getAddress = function(mlat,mlng){
    let nominatimURL = 'http://nominatim.openstreetmap.org/reverse?format=json&lat='+mlat+'&lon=' + mlng;
    return this.http.get(nominatimURL);
  }

}