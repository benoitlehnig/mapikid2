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
import { GoogleMaps, GoogleMapsEvent, LatLng } from '@ionic-native/google-maps';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
var MapService = /** @class */ (function () {
    function MapService(googleMaps, http, _geoLoc) {
        this.googleMaps = googleMaps;
        this.http = http;
        this._geoLoc = _geoLoc;
        this.googleMapJDK = null;
        this.baseUrl = 'https://us-central1-parcmap.cloudfunctions.net/listPlaygroundsAround';
        this.mapCenter = { lat: 0, lng: 0 };
        this.useNativeMap = true;
        this.defaultMapOptions = {
            camera: {
                target: {
                    lat: 48.863129,
                    lng: 2.345152
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
        this.setCurrentMapCenter = function () {
            console.log("setCurrentMapCenter>>", this.mapCenter);
            if (this.useNativeMap === true) {
                // var target = this.googleMapNative.getCameraTarget();
                // this.mapCenter = {lat: target.lat, lng: target.lng};
            }
            else {
                if (this.googleMapJDK !== null) {
                    this.mapCenter = { lat: this.googleMapJDK.getCenter().lat(), lng: this.googleMapJDK.getCenter().lng() };
                }
            }
            console.log("setCurrentMapCenter>> end ", this.mapCenter);
        };
        this.setMapCenter = function (lat, lng) {
            if (this.useNativeMap === true) {
            }
            else {
                var latLng = new google.maps.LatLng(lat, lng);
                this.googleMapJDK.setCenter(latLng);
            }
        };
        this.getCenter = function () {
            return this.mapCenter;
        };
        this.setCenter = function (lat, lng) {
            this.mapCenter = { lat: lat, lng: lng };
            ;
        };
        this.getAddress = function (mlat, mlng) {
            var nominatimURL = 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + mlat + '&lon=' + mlng;
            return this.http.get(nominatimURL);
        };
    }
    MapService.prototype.createMapNative = function (element, mapTypeControl, mapTtypeId) {
        var _this = this;
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
            },
        };
        this.googleMapNative = GoogleMaps.create(element, mapOptions);
        this.googleMapNative.one(GoogleMapsEvent.MAP_READY).then(function () {
            _this.getLocation().then(function (res) {
                var location = new LatLng(res.coords.latitude, res.coords.longitude);
                var options = {
                    target: location,
                    zoom: 18,
                    tilt: 30
                };
                _this.setMapCenter(location.lat, location.lng);
                _this.googleMapNative.moveCamera(options);
                console.log(res);
            });
            console.log("camera ready");
            _this.googleMapNative.on(GoogleMapsEvent.MAP_CLICK).subscribe(function (data) {
                alert("Click MAP");
            });
            _this.googleMapNative.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(function (data) {
                alert("Click MAP_DRAG_END");
            });
            _this.googleMapNative.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(function (data) {
                alert("Click MY_LOCATION_BUTTON_CLICK");
            });
        });
        this.useNativeMap = true;
        return this.googleMapNative;
    };
    MapService.prototype.getLocation = function () {
        var positionOptions = { timeout: 10000, enableHighAccuracy: true };
        return this._geoLoc.getCurrentPosition(positionOptions);
    };
    MapService.prototype.onCameraEvents = function (cameraPosition) {
        console.log(cameraPosition.target.lat);
    };
    MapService.prototype.createMapJDK = function (element, mapTypeControl, mapTtypeId) {
        var mapTypeId = mapTtypeId;
        var mapTypeControlOptions = {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        };
        var googleMapJDK = new google.maps.Map(element, {
            center: { lat: 48.863129, lng: 2.345152 },
            zoom: 14,
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
        this.useNativeMap = false;
        this.googleMapJDK = googleMapJDK;
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
    MapService.prototype.getIconNative = function (parc) {
        var image = {
            url: './assets/images/marker_open.png',
            size: {
                width: 18,
                height: 18
            }
        };
        if (!parc.parcItem.open) {
            image.url = './assets/images/marker_closed.png';
        }
        if (parc.parcItem.free === false) {
            image.url = './assets/images/marker_fee.png';
        }
        return image;
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
    MapService.prototype.getPlaygroundDetails = function (listOfParcs) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var bodyForm = new FormData();
        var bodyInside = [];
        for (var i = 0; i < listOfParcs.length; i++) {
            bodyForm.append("key", listOfParcs[i].key);
            var key = { "key": listOfParcs[i].key };
            bodyInside.push(key);
        }
        var options = new RequestOptions({ headers: headers });
        //let body = JSON.stringify(bodyInside);
        //console.log(body);
        var url = 'https://us-central1-parcmap.cloudfunctions.net/getPlaygroundDetails';
        return this.http.post(url, bodyForm, options);
    };
    MapService.prototype.getDefaultMapOptions = function () {
        return this.defaultMapOptions;
    };
    MapService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [GoogleMaps, Http, Geolocation])
    ], MapService);
    return MapService;
}());
export { MapService };
//# sourceMappingURL=map-service.js.map