var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import GeoFire from 'geofire';
import { TranslateService } from 'ng2-translate';
import * as firebase from 'firebase';
import { MapService } from '../../providers/map-service/map-service';
import { WeatherProvider } from '../../providers/weather/weather';
/**
 * Generated class for the DetailsRootPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var DetailsRootPage = /** @class */ (function () {
    function DetailsRootPage(platform, navCtrl, navParams, db, translate, _map, weatherService) {
        var _this = this;
        this.platform = platform;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this._map = _map;
        this.weatherService = weatherService;
        this.parc = {};
        this.map = null;
        this.mapDetailsMap = null;
        this.numberOfEquipment = 0;
        this.isLowNumberofEquipment = true;
        this.labelWeekDay = ['', '', '', '', '', '', ''];
        this.marker = null;
        this.loadMap = function () {
            var element = document.getElementById('mapDetail');
            this.map = this._map.createMapJDK(element, true, google.maps.MapTypeId.HYBRID);
            var latLng = new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng);
            this.map.setCenter(latLng);
            this.map.setZoom(18);
            this.marker = new google.maps.Marker({
                position: latLng,
                map: this.map,
                title: this.parc.name
            });
            var element2 = document.getElementById('mapStreetView');
            if (this.mapDetailsMap !== null) {
                var parcPosition = new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng);
                this.mapDetailsMap.setPosition(parcPosition);
            }
            else {
                this.mapDetailsMap = new google.maps.StreetViewPanorama(element2, {
                    position: { lat: this.parc.position.lat, lng: this.parc.position.lng },
                    pov: { heading: 165, pitch: 0 },
                    linksControl: false,
                    panControl: false,
                    enableCloseButton: false,
                    zoom: 1
                });
            }
        };
        this.setUpPlaceService = function () {
            this.placesService = new google.maps.places.PlacesService(this.map);
        };
        this.setLowNumberofEquipment = function () {
            this.numberOfEquipment = 0;
            console.log(this.parc.facilities);
            if (this.parc.facilities) {
                console.log(this.parc.facilities);
                if (this.parc.facilities.water === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.wc === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.animals === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.monkeyBridge === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.sandbox === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.slide === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.spider === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.swing === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.turnstile === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.seesaw === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.climb === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.football === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.basketball === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.trampoline === true) {
                    this.numberOfEquipment++;
                }
                ;
                if (this.parc.facilities.other) {
                    this.numberOfEquipment++;
                }
                ;
            }
            console.log(this.numberOfEquipment);
            if (this.numberOfEquipment > 0) {
                this.isLowNumberofEquipment = false;
            }
        };
        this.isToiletsRegistered = function (key) {
            var id = -1;
            for (var i in this.toiletsMarkers) {
                if (this.toiletsMarkers[i].key === key) {
                    id = +i;
                    break;
                }
            }
            return id;
        };
        this.findClosestToilets = function () {
            var geoFireToilets = new GeoFire(firebase.database().ref('geofireToilets'));
            var geoQuery = geoFireToilets.query({
                center: [Number(this.parc.position.lat), Number(this.parc.position.lng)],
                radius: 0.2
            });
            var image = './assets/images/toilets.png';
            var onKeyEnteredRegistration = geoQuery.on("key_entered", function (key, location, distance) {
                var toilet = {
                    key: key,
                    position: location,
                    distance: distance
                };
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(toilet.position[0], toilet.position[1]),
                    map: this.map,
                    icon: image
                });
                if (this.isToiletsRegistered(key) === -1) {
                    this.toiletsMarkers.push(marker);
                }
            }.bind(this));
            var onReadyRegistration = geoQuery.on("ready", function () {
                geoQuery.cancel();
            });
        };
        this.triggerGetGoogleData = function () {
            var request = {
                location: new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng),
                radius: '20',
                types: ['park', 'garden', 'aquarium', 'amusement_park']
            };
            this.placesService.nearbySearch(request, function (results, status) {
                this.setGoogleData(results, status);
            }.bind(this));
        };
        this.setGoogleData = function (results, status) {
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
        };
        this.applyGoogleData = function (results, status) {
            console.log(results);
            if (results.opening_hours) {
                this.parc.opening_hours = results.opening_hours;
                for (var i = 0; i < this.parc.opening_hours.weekday_text.length; i++) {
                    this.parc.opening_hours.weekday_text[0] =
                        this.labelWeekDay[0] + ": " + this.parc.opening_hours.weekday_text[0].slice(7);
                    this.parc.opening_hours.weekday_text[1] =
                        this.labelWeekDay[1] + ": " + this.parc.opening_hours.weekday_text[0].slice(8);
                    this.parc.opening_hours.weekday_text[2] =
                        this.labelWeekDay[2] + ": " + this.parc.opening_hours.weekday_text[0].slice(8);
                    this.parc.opening_hours.weekday_text[3] =
                        this.labelWeekDay[3] + ": " + this.parc.opening_hours.weekday_text[0].slice(8);
                    this.parc.opening_hours.weekday_text[4] =
                        this.labelWeekDay[4] + ": " + this.parc.opening_hours.weekday_text[0].slice(8);
                    this.parc.opening_hours.weekday_text[5] =
                        this.labelWeekDay[5] + ": " + this.parc.opening_hours.weekday_text[0].slice(8);
                    this.parc.opening_hours.weekday_text[6] =
                        this.labelWeekDay[6] + ": " + this.parc.opening_hours.weekday_text[0].slice(8);
                }
            }
            if (results.name && this.parc.name === "") {
                this.parc.name = results.name;
            }
        };
        console.log(navParams.data.$key);
        this.parcObject = db.object('positions/' + navParams.data.$key);
        this.parcObject.subscribe(function (snapshot) {
            _this.parc = snapshot;
            console.log(_this.parc);
            if (!_this.parc.facilities) {
                _this.parc.facilities = null;
            }
            var latLng = new google.maps.LatLng(_this.parc.position.lat, _this.parc.position.lng);
            if (_this.marker) {
                _this.marker.setPosition(latLng);
            }
            if (_this.map) {
                _this.map.setCenter(latLng);
            }
            _this.toiletsMarkers = [];
            _this.findClosestToilets();
            _this.getWeather();
        });
        console.log(this.parc);
        translate.get('parcDetails.MONDAY').subscribe(function (res) {
            _this.labelWeekDay[0] = res;
        });
        translate.get('parcDetails.TUESDAY').subscribe(function (res) {
            _this.labelWeekDay[1] = res;
        });
        translate.get('parcDetails.WEDNESDAY').subscribe(function (res) {
            _this.labelWeekDay[2] = res;
        });
        translate.get('parcDetails.THURSDAY').subscribe(function (res) {
            _this.labelWeekDay[3] = res;
        });
        translate.get('parcDetails.FRIDAY').subscribe(function (res) {
            _this.labelWeekDay[4] = res;
        });
        translate.get('parcDetails.SATURDAY').subscribe(function (res) {
            _this.labelWeekDay[5] = res;
        });
        translate.get('parcDetails.SUNDAY').subscribe(function (res) {
            _this.labelWeekDay[6] = res;
        });
    }
    DetailsRootPage.prototype.ngOnInit = function () {
        var _this = this;
        this.platform.ready().then(function () {
            _this.loadMap();
            _this.setUpPlaceService();
            _this.triggerGetGoogleData();
            _this.setLowNumberofEquipment();
        });
    };
    DetailsRootPage.prototype.getWeather = function () {
        var _this = this;
        this.weatherService.geographicCoordinates(this.parc.position.lat, this.parc.position.lng)
            .map(function (data) { return data.json(); })
            .subscribe(function (data) {
            _this.localWeather = data;
            console.log(data);
        });
        this.weatherService.uvIndex(this.parc.position.lat, this.parc.position.lng)
            .map(function (data) { return data.json(); })
            .subscribe(function (data) {
            _this.uvIndex = data;
            console.log(data);
        });
        /*this.weatherService.pollution(this.parc.position.lat, this.parc.position.lng)
        .map(data => data.json())
            .subscribe(data=> {
              this.pollution = data;
              console.log(data);
            });*/
        this.weatherService.forecastGeographicCoordinates(this.parc.position.lat, this.parc.position.lng, 4)
            .map(function (data) { return data.json(); })
            .subscribe(function (data) {
            _this.localWeatherForecast = data.list;
            console.log(data);
        });
    };
    DetailsRootPage.prototype.round = function (value) {
        return Math.round(value);
    };
    DetailsRootPage = __decorate([
        Component({
            selector: 'page-details-root',
            templateUrl: 'details-root.html',
        }),
        __metadata("design:paramtypes", [Platform, NavController, NavParams,
            AngularFireDatabase, TranslateService, MapService, WeatherProvider])
    ], DetailsRootPage);
    return DetailsRootPage;
}());
export { DetailsRootPage };
//# sourceMappingURL=details-root.js.map