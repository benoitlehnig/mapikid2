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
import { GoogleMaps, LatLng } from '@ionic-native/google-maps';
import { Http } from '@angular/http';
var MapService = /** @class */ (function () {
    function MapService(googleMaps, http) {
        this.googleMaps = googleMaps;
        this.http = http;
        this.googleMapJDK = null;
        this.baseUrl = 'https://us-central1-parcmap.cloudfunctions.net/listPlaygroundsAround';
    }
    MapService.prototype.createMapNative = function (element, mapTypeControl, mapTtypeId) {
        var location = new LatLng(-34.9290, 138.6010);
        var mapOptions = {
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
              }
        };
        this.googleMapNative = GoogleMaps.create(element, mapOptions);
        return this.googleMapNative;
    };
    MapService.prototype.createMapJDK = function (element, mapTypeControl, mapTtypeId) {
        var mapTypeId = mapTtypeId;
        var mapTypeControlOptions = {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        };
        var googleMapJDK = new google.maps.Map(element, {
            center: { lat: 48.863129, lng: 2.345152 },
            zoom: 7,
            styles: [{
                    featureType: 'poi',
                    stylers: [{ visibility: 'off' }] // Turn off points of interest.
                }, {
                    featureType: 'transit.station',
                    stylers: [{ visibility: 'off' }] // Turn off bus stations, train stations, etc.
                }],
            mapTypeId: mapTypeId,
            streetViewControl: false,
            mapTypeControl: mapTypeControl,
            mapTypeControlOptions: mapTypeControlOptions,
            gestureHandling: 'greedy',
            fullscreenControl: false
        });
        return googleMapJDK;
    };

    MapService.prototype.getGoogleMapJDK = function () {
        return this.googleMapJDK;
    };
    
    MapService.prototype.getIconPath = function (parc) {
        var iconPath = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FE9F1F',
            fillOpacity: 1,
            scale: 8,
            strokeColor: '#FE9F1F',
            strokeWeight: 4
        };
        if (parc.parcItem.source != "community") {
            iconPath.fillColor = '#FE9F1F';
            iconPath.fillOpacity = 0.4;
            iconPath.strokeColor = '#FE9F1F';
        }
        if (!parc.parcItem.open) {
            iconPath.fillColor = "#efefef";
            iconPath.fillOpacity = 0;
            iconPath.strokeColor = "#efefef";
        }
        if (parc.parcItem.free === false) {
            iconPath.fillColor = "#F96466";
            iconPath.strokeColor = "#F2403C";
            iconPath.fillOpacity = 1;
        }
        return iconPath;
    };
    MapService.prototype.getIconPathCurrentPosition = function () {
        var iconPath = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#33B9B2',
            fillOpacity: 1,
            scale: 8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
        };
        return iconPath;
    };
    MapService.prototype.getLabelName = function (parc) {
        var label = { text: '', color: "" };
        if (!parc.parcItem.open) {
            label = { text: 'X', color: "#DDDDDD" };
        }
        if (parc.parcItem.free === false) {
            label = { text: '$', color: "#FFFFFF" };
        }
    };
    MapService.prototype.getPlaygroundsByGeographicCoordinates = function (lat, lon, radius) {
        var url = this.baseUrl + ("?lat=" + lat + "&lng=" + lon + "&radius=" + radius);
        return this.http.get(url);
    };
    MapService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [GoogleMaps, Http])
    ], MapService);
    return MapService;
}());
export { MapService };
//# sourceMappingURL=map-service.js.map