import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as MarkerClusterer from 'node-js-marker-clusterer';
import 'rxjs/add/operator/map';

/*
  Generated class for the GoogleMapsClusterProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class GoogleMapsClusterProvider {

  	markerCluster: any;
    markers: any;
   	private mcOptions = {
    	maxZoom: '12',
      	styles:[
        {
            url: "./assets/images/m1.png",
            width: 53,
            height:53,
            textColor:"white",
        },
        {
            url: "./assets/images/m2.png",
            width: 56,
            height:55,
            textColor:"white",
        },
        {
            url: "./assets/images/m3.png",
            width: 66,
            height:65,
            textColor:"white",
        },
        {
            url: "./assets/images/m4.png",
            width:78,
            height:77,
            textColor:"white",
        },
        {
            url: "./assets/images/m5.png",
            width:90,
            height:89,
            textColor:"white",
        }]

    };
    constructor(public http: Http) {
        console.log('Hello GoogleMapsCluster Provider');
 
        this.markers = [           
        ];
    }
 
    addCluster(map,markers){
 		this.markers = markers;
        if(google.maps){
 			
            this.markerCluster = new MarkerClusterer(map, markers, this.mcOptions);
 
        } else {
            console.warn('Google maps needs to be loaded before adding a cluster');
        }
 
    }
    addMarker(marker){
    	this.markers.push(marker);
    	this.markerCluster.addMarker(marker, true);
    }
 	redraw(){
    	this.markerCluster.redraw();
    }
    clearMarkers(){
        this.markerCluster.clearMarkers();
    }

}
