var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as MarkerClusterer from 'node-js-marker-clusterer';
import 'rxjs/add/operator/map';
/*
  Generated class for the GoogleMapsClusterProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
var GoogleMapsClusterProvider = /** @class */ (function () {
    function GoogleMapsClusterProvider(http) {
        this.http = http;
        this.mcOptions = {
            maxZoom: '12',
            styles: [
                {
                    url: "./assets/images/m1.png",
                    width: 53,
                    height: 53,
                    textColor: "white",
                },
                {
                    url: "./assets/images/m2.png",
                    width: 56,
                    height: 55,
                    textColor: "white",
                },
                {
                    url: "./assets/images/m3.png",
                    width: 66,
                    height: 65,
                    textColor: "white",
                },
                {
                    url: "./assets/images/m4.png",
                    width: 78,
                    height: 77,
                    textColor: "white",
                },
                {
                    url: "./assets/images/m5.png",
                    width: 90,
                    height: 89,
                    textColor: "white",
                }
            ]
        };
        console.log('Hello GoogleMapsCluster Provider');
        this.markers = [];
    }
    GoogleMapsClusterProvider.prototype.addCluster = function (map, markers) {
        this.markers = markers;
        if (google.maps) {
            this.markerCluster = new MarkerClusterer(map, markers, this.mcOptions);
        }
        else {
            console.warn('Google maps needs to be loaded before adding a cluster');
        }
    };
    GoogleMapsClusterProvider.prototype.addMarker = function (marker) {
        this.markers.push(marker);
        this.markerCluster.addMarker(marker, true);
    };
    GoogleMapsClusterProvider.prototype.redraw = function () {
        this.markerCluster.redraw();
    };
    GoogleMapsClusterProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], GoogleMapsClusterProvider);
    return GoogleMapsClusterProvider;
}());
export { GoogleMapsClusterProvider };
//# sourceMappingURL=google-maps-cluster.js.map