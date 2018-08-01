
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
import { Geolocation } from '@ionic-native/geolocation';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class MapService {
  
  private googleMapJDK=null ;
  private googleMapNative: GoogleMap; null;
  private baseUrl ='https://us-central1-parcmap.cloudfunctions.net/listPlaygroundsAround';
  private nominatimUrl  ='http://nominatim.openstreetmap.org/reverse?format=json&accept-language=en';
  private mapCenter= {lat:0, lng:0};  
  private useNativeMap:boolean = true;
  private defaultMapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: 48.863129, 
          lng:  2.345152
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
  constructor(private googleMaps: GoogleMaps, public http: Http, public _geoLoc: Geolocation,public db: AngularFireDatabase,) {
    
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
        'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      }
    };
    this.googleMapNative = GoogleMaps.create(element, mapOptions);
    this.googleMapNative.one(GoogleMapsEvent.MAP_READY).then( () => {
      this.getLocation().then(res=>{ 

        let location = new LatLng(res.coords.latitude, res.coords.longitude);
        let options : CameraPosition<any> = {
          target:location,
          zoom: 18,
          tilt: 30

        }
        this.setMapCenter(location.lat,location.lng);
        this.googleMapNative.moveCamera(options);
      });
      this.googleMapNative.on(GoogleMapsEvent.MAP_CLICK).subscribe(
            (data) => {
                alert("Click MAP");
            });
       this.googleMapNative.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(
            (data) => {
                alert("Click MAP_DRAG_END");
            });
       this.googleMapNative.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(
            (data) => {
                alert("Click MY_LOCATION_BUTTON_CLICK");
            });

      
    });
    this.useNativeMap = true;
    return this.googleMapNative;
  }

  getLocation(){
    var positionOptions = {timeout: 10000, enableHighAccuracy: true};
        return this._geoLoc.getCurrentPosition(positionOptions);   
  }
    
  onCameraEvents(cameraPosition) {
     console.log(cameraPosition.target.lat);
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
    var image = this.getIconNative(parc);
  	var icon = {
        url: image.url,
        size: new google.maps.Size(25, 32)
    };
  	return icon;
  }
  getIconNative(playground){
    let parc = playground.parcItem;
    console.log("getIcon:",parc);
    var baseUrl="./assets/images/map/";
    var url =baseUrl+"notValidated_standard.png";

    //closed playground
    if(!parc.open){
      url =baseUrl+"closed.png";
    }
    else if(parc.free===false){
      url =baseUrl+"notFree.png";
    }
    else{
      //parc opened and not validated
      if(parc.validationNumber !== undefined){
        console.log("(parc.validationNumber !== undefined");
        if(parc.validationNumber >=1){
          url =baseUrl+"validated_standard.png";
          //validated playground
          //testing inclusive
          if(parc.inclusive ===undefined){
            //not inclusive
          }else{
            //validated playground and inclusive
            if(parc.inclusive ===true){
              url =baseUrl+"validated_accessible.png";
            }
          }
          if(parc.highway === undefined){
            //not highway

          }
          else{
            if(parc.highway === true){
              //validated playground and highway
              url =baseUrl+"validated_highway.png";
            }
          }
        }
        else{
          //not a validated playground
          //testing inclusive
          url =baseUrl+"notValidated_standard.png";
          if(parc.inclusive ===undefined){
            //not inclusive

          }else{
            //not validated playground and inclusive
            if(parc.inclusive ===true){
              url =baseUrl+"notValidated_accessible.png";
            }
          }
          if(parc.highway === undefined){
            //not highway
          }
          else{
            if(parc.highway === true){
              //not validated playground and highway
               url =baseUrl+"notValidated_highway.png";
            }
          }
        }
      }
      else{
        // not validated
        url =baseUrl+"notValidated_standard.png";
        if(parc.inclusive ===undefined){
          //not inclusive
        }else{
          //not validated playground and inclusive
          if(parc.inclusive ===true){
            url =baseUrl+"notValidated_accessible.png";
          }
        }
        if(parc.highway === undefined){
          //not highway
        }
        else{
          if(parc.highway === true){
            //not validated playground and highway
             url =baseUrl+"notValidated_highway.png";
          }
        }
      }
    }

    let image = {
      url: url,
      size: {
        width: 25,
        height: 32
      }
    };
    return image;
  }

   getIconPathCurrentPositionNative(){
    let image = {
      url: './assets/images/location.png',
      size: {
        width: 30,
        height: 30
      }
    };
    return image;
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
    if(this.useNativeMap ===true){
    }
    else{
      if(this.googleMapJDK !==null){
         this.mapCenter = {lat: this.googleMapJDK.getCenter().lat(), lng: this.googleMapJDK.getCenter().lng()};  
      }
    }
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
  setCenter = function(lat,lng){
     this.mapCenter = {lat: lat, lng:lng}; ;
  }
  
  getAddress = function(mlat,mlng){
    let nominatimURL = 'http://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat='+mlat+'&lon=' + mlng;
    return this.http.get(nominatimURL);
  }
  saveAddress = function(mlat,mlng,key){
      var nominatimURL = this.nominatimUrl+'&lat='+mlat+'&lon=' + mlng;
      this.http.get(nominatimURL).map(data => data.json())
      .subscribe(data=> {
        var json = data;
        var parcObject = this.db.object('positions/'+key);
        parcObject.subscribe(snapshot => {
            if(snapshot.$value!==null){
              var parc = snapshot;
              parc.address = json.address;
              parcObject.update(parc);
            }
            
        });
      });
 

    };
  getDefaultMapOptions(){
    return this.defaultMapOptions;
  }

}