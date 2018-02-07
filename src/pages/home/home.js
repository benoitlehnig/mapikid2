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
import { NavController, Platform, LoadingController, ToastController, ModalController } from 'ionic-angular';
import GeoFire from 'geofire';
import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMapsEvent, LatLng } from '@ionic-native/google-maps';
import { ParcDetailsPage } from '../parc-details/parc-details';
import { UpdateParcPage } from '../update-parc/update-parc';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../providers/auth-service/auth-service';
import { MapService } from '../../providers/map-service/map-service';
import { GoogleMapsClusterProvider } from '../../providers/google-maps-cluster/google-maps-cluster';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from 'ng2-translate';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, db, platform, geolocation, afAuth, _auth, _map, mapCluster, loadingCtrl, translate, diagnostic, toastCtrl, openNativeSettings, ga, storage, modalCtrl) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.platform = platform;
        this.geolocation = geolocation;
        this.afAuth = afAuth;
        this._auth = _auth;
        this._map = _map;
        this.mapCluster = mapCluster;
        this.loadingCtrl = loadingCtrl;
        this.translate = translate;
        this.diagnostic = diagnostic;
        this.toastCtrl = toastCtrl;
        this.openNativeSettings = openNativeSettings;
        this.ga = ga;
        this.storage = storage;
        this.modalCtrl = modalCtrl;
        this.parcDetails = ParcDetailsPage;
        this.parcUpdate = UpdateParcPage;
        this.login = LoginPage;
        this.userPicture = "";
        this.googleMapJDK = null;
        this.googleMapNative = null;
        this.mapHeight = "0px";
        this.radius = 5;
        this.quickRadius = 0.5;
        this.numberOfParcsToBeLoaded = 0;
        this.mapCenter = null;
        this.keys = [];
        this.markers = [];
        this.loading = null;
        this.lastRequestParcsAround = new Date().getTime();
        this.geolocationNotAllowedLabel = "";
        this.noParcReturned = false;
        this.geoLocationMarker = new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
            map: this.googleMapJDK,
            icon: this._map.getIconPathCurrentPosition()
        });
        this.loadingCompleted = true;
        this.httpRequestActivated = false;
        this.useNativeMap = false;
        this.setCurrentMapCenter = function () {
            if (this.useNativeMap === true) {
                var target = this.googleMapNative.getCameraTarget();
                this.mapCenter = { lat: target.lat, lng: target.lng };
            }
            else {
                this.mapCenter = this.googleMapJDK.getCenter();
            }
        };
        this.getCenter = function () {
            return this.mapCenter;
        };
        this.startGeolocation = function () {
            var _this = this;
            var gf = new GeoFire(firebase.database().ref('geofire'));
            var positionOptions = { timeout: 10000, enableHighAccuracy: true };
            this.geolocation.getCurrentPosition(positionOptions).then(function (resp) {
                //console.log('geolocation done');
                _this.currentPosition = new LatLng(resp.coords.latitude, resp.coords.longitude);
                var latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                _this.googleMapJDK.setCenter(latLng);
                _this.googleMapJDK.setZoom(12);
                _this.setCurrentMapCenter();
                _this.geoLocationMarker.setMap(_this.googleMapJDK);
                _this.geoLocationMarker.setPosition(latLng);
                if (_this.httpRequestActivated === true) {
                    _this._map.getPlaygroundsByGeographicCoordinates(Number(resp.coords.latitude), Number(resp.coords.longitude), 2).map(function (data) { return data.json(); })
                        .subscribe(function (data) {
                        console.log(data);
                    });
                }
                else {
                    _this.geoQuery = gf.query({
                        center: [resp.coords.latitude, resp.coords.longitude],
                        radius: _this.radius
                    });
                    _this.setupInitialGeoQuery();
                }
            }).catch(function (error) {
                console.log('Error getting location', error);
                _this.errorCallback();
            });
        };
        this.defaultGeoLocation = function () {
            var gf = new GeoFire(firebase.database().ref('geofire'));
            var latLng = new google.maps.LatLng(48.863129, 2.345152);
            this.currentPosition = new LatLng(48.863129, 2.345152);
            this.googleMapJDK.setCenter(latLng);
            this.setCurrentMapCenter();
            this.geoQuery = gf.query({
                center: [48.863129, 2.345152],
                radius: this.radius
            });
            this.setupInitialGeoQuery();
        };
        this.orderByDistance = function (items, field, reverse) {
            var filtered = [];
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                filtered.push(item);
            }
            ;
            filtered.sort(function (a, b) {
                return (parseFloat(a[field]) > parseFloat(b[field]) ? 1 : -1);
            });
            if (reverse)
                filtered.reverse();
            return filtered;
        };
        this.displayParcMarkerJDK = function (parc, mode) {
            if (parc.parcItem) {
                if (parc.parcItem.position) {
                    if (parc.parcItem.position.lat && parc.parcItem.position.lng) {
                        if (mode === 'add') {
                            var marker = new google.maps.Marker({
                                position: new google.maps.LatLng(parc.parcItem.position.lat, parc.parcItem.position.lng),
                                map: this.googleMapJDK,
                                title: parc.parcItem.name,
                                icon: this._map.getIconPath(parc)
                            });
                            marker.addListener('click', function () {
                                this.navCtrl.push(ParcDetailsPage, { key: parc.key, map: this.map });
                            }.bind(this));
                            this.markers[parc.key] = marker;
                            this.mapCluster.addMarker(marker, true);
                        }
                        else {
                            this.markers[parc.key].setPosition(new google.maps.LatLng(parc.parcItem.position.lat, parc.parcItem.position.lng));
                        }
                    }
                }
                else {
                    console.log("issue parc: ", parc);
                }
            }
        };
        this.displayParcsAround = function (cleanParc, forceRequest) {
            if (this.httpRequestActivated === false) {
                if (new Date().getTime() - this.lastRequestParcsAround > 300 || forceRequest === true) {
                    this.lastRequestParcsAround = new Date().getTime();
                    if (cleanParc) {
                        this.cleanParcsDisplayed();
                    }
                    this.geoQuery.updateCriteria({
                        center: [this.mapCenter.lat, this.mapCenter.lng],
                        radius: this.radius
                    });
                }
            }
            else {
                this.getPlaygroundsAround(false, false, this.quickRadius);
                this.getPlaygroundsAround(false, false, this.radius);
            }
        };
        this.getPlaygroundsAround = function (cleanParc, forceRequest, radius) {
            var _this = this;
            if (this.httpRequestActivated === true) {
                console.log("getPlaygroundsAround", radius, new Date().getTime());
                if (new Date().getTime() - this.lastRequestParcsAround > 300 || forceRequest === true) {
                    this.lastRequestParcsAround = new Date().getTime();
                    if (cleanParc) {
                        this.cleanParcsDisplayed();
                    }
                    this.loadingCompleted = false;
                    this._map.getPlaygroundsByGeographicCoordinates(this.mapCenter.lat, this.mapCenter.lng, radius).map(function (data) { return data.json(); })
                        .subscribe(function (data) {
                        console.log(data);
                        for (var i = 0; i < data.length; i++) {
                            console.log(data[i]);
                            var parc = { 'key': data[i].key, 'distance': 0, 'reviewsLength': 0, 'parcItem': data[i].content };
                            if (_this.keys[data[i].key]) {
                                _this.displayParcMarkerJDK(parc, 'update');
                            }
                            else {
                                if (!parc.parcItem.rate) {
                                    parc.parcItem.rate = { 'rate': 0 };
                                }
                                _this.displayParcMarkerJDK(parc, 'add');
                                _this.keys[data[i].key] = data[i].key;
                                _this.parcs.push(parc);
                            }
                            console.log(parc);
                        }
                        _this.updateDistance();
                        console.log("getPlaygroundsAround end", new Date().getTime());
                        _this.loadingCompleted = true;
                        _this.displayedList = _this.parcs;
                        _this.mapCluster.redraw();
                    });
                }
            }
        };
        this.updateDistance = function () {
            var lat = this.mapCenter.lat;
            var lng = this.mapCenter.lng;
            for (var i = 0; i < this.parcs.length; i++) {
                this.parcs[i].distance = GeoFire.distance([lat, lng], [parseFloat(this.parcs[i].parcItem.position.lat), parseFloat(this.parcs[i].parcItem.position.lng)]).toString().substring(0, 4);
            }
            if (this.parcs) {
                this.parcs = this.orderByDistance(this.parcs, 'distance', false);
            }
        };
        this.geolocateUser = function () {
            var _this = this;
            var positionOptions = { timeout: 10000, enableHighAccuracy: true };
            this.geolocation.getCurrentPosition(positionOptions).then(function (resp) {
                _this.currentPosition = new LatLng(resp.coords.latitude, resp.coords.longitude);
                var latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                _this.googleMapJDK.setCenter(latLng);
                _this.setCurrentMapCenter();
                _this.displayParcsAround(false, false);
                _this.getPlaygroundsAround(false, false, _this.quickRadius);
                _this.getPlaygroundsAround(false, false, _this.radius);
                _this.geoLocationMarker.setMap(_this.googleMapJDK);
                _this.geoLocationMarker.setPosition(latLng);
            }).catch(function (error) {
                console.log('Error getting location', error);
                _this.errorCallback();
            });
        };
        this.errorCallback = function (e) {
            //alert(this.geolocationNotAllowedLabel);
            var toast = this.toastCtrl.create({
                message: this.geolocationNotAllowedLabel,
                duration: 10000,
                showCloseButton: true,
                closeButtonText: "X"
            });
            toast.present();
            this.diagnostic.requestLocationAuthorization();
            this.defaultGeoLocation();
        };
        this.geolocate = function () {
            if (this.platform.is('ios')) {
                this.startGeolocation();
            }
            else {
                this.diagnostic.isLocationAuthorized().then((this.startGeolocation).bind(this), this.errorCallback.bind(this));
            }
        };
        this.numberParcLoaded = new Subject();
        this.numberParcLoaded.next(0);
        this.numberParcLoaded.subscribe(function (value) {
            _this.checkCompleteLoad(value);
        });
        this.acService = new google.maps.places.AutocompleteService();
        this.autocompleteItems = [];
        this.autocomplete = {
            query: ''
        };
        this.db = db;
        this.parcs = [];
    }
    HomePage.prototype.ngOnInit = function () {
        var _this = this;
        this.ga.setCurrentScreen("Home Page");
        this.afAuth.auth.onAuthStateChanged(function (user) {
            if (user) {
                //console.log(user);
                document.getElementById('user-pic').style.backgroundImage = 'url(' + this._auth.displayPicture() + ')';
            }
            else {
                //console.log("logged out");
                document.getElementById('user-pic').style.backgroundImage = 'url(../../assets/images/profile_placeholder.png)';
            }
        }.bind(this));
        this.acService = new google.maps.places.AutocompleteService();
        this.autocompleteItems = [];
        this.autocomplete = {
            query: ''
        };
        this.platform.ready().then(function () {
            _this.storage.get('langKey').then(function (val) {
                if (val !== null) {
                    _this.translate.use(val);
                }
                else {
                    _this.translate.use('fr');
                }
                _this.translate.get('map.GEOLOCATIONNOTALLOWED').subscribe(function (res) {
                    _this.geolocationNotAllowedLabel = res;
                });
                _this.loadingCompleted = false;
                _this.loadMap();
                if (_this.useNativeMap === true) {
                    _this.loadMapNative();
                }
                if (_this.platform.is('ios')) {
                    _this.startGeolocation();
                }
                else {
                    _this.diagnostic.isLocationAuthorized().then((_this.startGeolocation).bind(_this), _this.errorCallback.bind(_this));
                }
            });
        });
    };
    HomePage.prototype.checkCompleteLoad = function (value) {
        if (this.numberOfParcsToBeLoaded !== 0 || value === -1) {
            if (value >= Number(this.numberOfParcsToBeLoaded) - 1 || value === -1) {
                console.log("all parcs loaded");
                try {
                    this.loadingCompleted = true;
                }
                catch (err) {
                    console.log("error", err);
                }
                this.numberOfParcsToBeLoaded = 0;
                this.numberParcLoaded.next(0);
                this.updateDistance();
                this.displayedList = this.parcs;
                this.mapCluster.redraw();
            }
        }
    };
    HomePage.prototype.setupInitialGeoQuery = function () {
        this.markersEntered = [];
        var onKeyEnteredRegistration = this.geoQuery.on("key_entered", function (key, location, distance) {
            //console.log("key entered", key,this.numberOfParcsToBeLoaded, this.markersEntered.length)
            var keyEntered = {
                key: key,
                location: location,
                distance: distance
            };
            this.markersEntered.push(keyEntered);
            this.newKeyEntered(this.markersEntered.length, keyEntered.key, keyEntered.location, keyEntered.distance);
            if (this.markersEntered.length === 10) {
                this.loadingCompleted = false;
            }
        }.bind(this));
        var onReadyRegistration = this.geoQuery.on("ready", function () {
            //console.log("onReadyRegistration",this.numberOfParcsToBeLoaded,this.markersEntered.length )
            this.numberOfParcsToBeLoaded = this.markersEntered.length;
            //no parc return
            console.log(this.noParcReturned);
            if (this.markersEntered.length === 0) {
                this.noParcReturned = true;
            }
            else {
                this.noParcReturned = false;
            }
            for (var i = 0; i < this.markersEntered.length; i++) {
                //this.newKeyEntered(i,this.markersEntered[i].key, this.markersEntered[i].location, this.markersEntered[i].distance);
            }
            if (this.markersEntered.length === 0) {
                this.numberParcLoaded.next(-1);
            }
            this.markersEntered = [];
        }.bind(this));
    };
    HomePage.prototype.newKeyEntered = function (index, key, location, distance) {
        var _this = this;
        if (this.keys[key]) {
            this.numberParcLoaded.next(index);
        }
        else {
            var parc = { 'key': key, 'distance': distance.toString().substring(0, 4), 'reviewsLength': 0, 'parcItem': null };
            var parcItemObject;
            parcItemObject = this.db.object('positions/' + key);
            parcItemObject.subscribe(function (snapshot) {
                parc.parcItem = snapshot;
                if (!parc.parcItem.rate) {
                    parc.parcItem.rate = { 'rate': 0 };
                }
                _this.parcs.push(parc);
                if (!_this.keys[key]) {
                    _this.displayParcMarkerJDK(parc, 'add');
                }
                else {
                    _this.displayParcMarkerJDK(parc, 'update');
                }
                _this.numberParcLoaded.next(index);
                _this.keys[key] = key;
            });
        }
    };
    HomePage.prototype.updateSearch = function () {
        if (this.autocomplete.query == '') {
            this.autocompleteItems = [];
            return;
        }
        var self = this;
        var config = {
            //types:  ['geocode'], // other types available in the API: 'establishment', 'regions', and 'cities'
            input: this.autocomplete.query,
            componentRestrictions: {}
        };
        this.acService.getPlacePredictions(config, function (predictions, status) {
            if (status === "OK") {
                self.autocompleteItems = [];
                predictions.forEach(function (prediction) {
                    self.autocompleteItems.push(prediction);
                });
            }
        });
    };
    HomePage.prototype.chooseItem = function (item) {
        this.autocompleteItems = [];
        this.geocodeAddress(item);
    };
    HomePage.prototype.geocodeAddress = function (item) {
        this.ga.logEvent('pageview', { "page:": 'list_' + item.description });
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'placeId': item.place_id }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                this.autocomplete.query = item.description;
                this.parcs = [];
                this.keys = [];
                var latLng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                this.googleMapJDK.setCenter(latLng);
                this.setCurrentMapCenter();
                this.displayParcsAround(false, false);
            }
            else {
            }
        }.bind(this));
    };
    HomePage.prototype.loadMapNative = function () {
        this.mapHeight = String(this.platform.height() / 2) + "px";
        var element = document.getElementById('map');
        this.googleMapNative = this._map.createMapNative(element, false, google.maps.MapTypeId.ROADMAP);
        this.googleMapNative.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(function (data) { return function () {
            console.log(data);
            this.setCurrentMapCenter();
            this.displayParcsAround(false, false);
            this.getPlaygroundsAround(false, false, this.quickRadius);
            this.getPlaygroundsAround(false, false, this.radius);
        }; });
    };
    HomePage.prototype.loadMap = function () {
        // create a new map by passing HTMLElement
        this.mapHeight = String(this.platform.height() / 2) + "px";
        var element = document.getElementById('map');
        this.googleMapJDK = this._map.createMapJDK(element, false, google.maps.MapTypeId.ROADMAP);
        var centerControlDiv = document.createElement('div');
        centerControlDiv.id = "centerControlDiv";
        var centerControl = this.centerControl(centerControlDiv, this.googleMapJDK);
        this.googleMapJDK.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
        this.googleMapJDK.addListener('dragend', function () {
            //console.log('dragend');
            this.setCurrentMapCenter();
            this.displayParcsAround(false, false);
            this.getPlaygroundsAround(false, false, this.quickRadius);
            this.getPlaygroundsAround(false, false, this.radius);
            this.googleMapJDK.setCenter(this.mapCenter);
        }.bind(this));
        google.maps.event.addDomListener(window, 'resize', function () {
            this.googleMapJDK.setCenter(this.googleMapJDK.getCenter());
        }.bind(this));
        this.mapCluster.addCluster(this.googleMapJDK, []);
        this.googleMapJDK.setCenter(this.mapCenter);
    };
    ;
    HomePage.prototype.centerControl = function (controlDiv, map) {
        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);
        // Set CSS for the control interior.
        var controlText = document.createElement('i');
        controlText.className = 'material-icons';
        controlText.innerHTML = 'my_location';
        controlUI.appendChild(controlText);
        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            this.geolocate();
        }.bind(this));
    };
    HomePage.prototype.addParc = function () {
        if (this._auth.authenticated === false) {
            var myModal = this.modalCtrl.create(this.login);
            myModal.present();
        }
        else {
            this.navCtrl.push(this.parcUpdate, { mode: 'add', position: this.mapCenter });
        }
    };
    HomePage = __decorate([
        Component({
            selector: 'page-home',
            templateUrl: 'home.html'
        }),
        __metadata("design:paramtypes", [NavController, AngularFireDatabase,
            Platform,
            Geolocation,
            AngularFireAuth, AuthService, MapService,
            GoogleMapsClusterProvider,
            LoadingController, TranslateService,
            Diagnostic, ToastController, OpenNativeSettings,
            FirebaseAnalytics, Storage, ModalController])
    ], HomePage);
    return HomePage;
}());
export { HomePage };
//# sourceMappingURL=home.js.map