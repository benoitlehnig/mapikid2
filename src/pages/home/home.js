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
import { GoogleMaps, GoogleMapsEvent, LatLng } from '@ionic-native/google-maps';
import { ParcDetailsPage } from '../parc-details/parc-details';
import { UpdateParcPage } from '../update-parc/update-parc';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../providers/auth-service/auth-service';
import { MapService } from '../../providers/map-service/map-service';
import { GoogleMapsClusterProvider } from '../../providers/google-maps-cluster/google-maps-cluster';
import { TranslateService } from 'ng2-translate';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, db, platform, geolocation, afAuth, _auth, _map, mapCluster, loadingCtrl, translate, diagnostic, toastCtrl, openNativeSettings, ga, storage, modalCtrl) {
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
        this.mapClusterNative = null;
        this.mapHeight = "0px";
        this.radius = 3;
        this.quickRadius = 0.5;
        this.numberOfParcsToBeLoaded = 0;
        this.numberParcLoaded = 0; // 0 is the initial value
        this.mapCenter = { lat: 0, lng: 0 };
        this.keys = [];
        this.markers = [];
        this.loading = null;
        this.lastRequestParcsAround = new Date().getTime();
        this.geolocationNotAllowedLabel = "";
        this.playgroundNoName = "";
        this.noParcReturned = false;
        this.geoLocationMarker = new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
            map: this.googleMapJDK,
            icon: this._map.getIconPathCurrentPosition()
        });
        this.markerAddress = new google.maps.Marker({
            position: { lat: 0, lng: 0 },
            draggable: false,
            icon: 'https://www.google.com.au/maps/vt/icon/name=assets/icons/spotlight/spotlight_pin_v2_shadow-1-small.png,assets/icons/spotlight/spotlight_pin_v2-1-small.png,assets/icons/spotlight/spotlight_pin_v2_dot-1-small.png,assets/icons/spotlight/spotlight_pin_v2_accent-1-small.png&highlight=ff000000,ea4335,960a0a,ffffff&color=ff000000?scale=1'
        });
        this.loadingCompleted = true;
        this.httpRequestActivated = false;
        this.useNativeMap = true;
        this.setLocationMarker = function (lat, lng) {
            if (this.useNativeMap === true) {
            }
            else {
                var latLng = new google.maps.LatLng(lat, lng);
                this.geoLocationMarker.setMap(this.googleMapJDK);
                this.geoLocationMarker.setPosition(latLng);
            }
        };
        this.startGeolocation = function () {
            var _this = this;
            var gf = new GeoFire(firebase.database().ref('geofire'));
            var positionOptions = { timeout: 10000, enableHighAccuracy: true };
            this.geolocation.getCurrentPosition(positionOptions).then(function (resp) {
                _this.currentPosition = new LatLng(resp.coords.latitude, resp.coords.longitude);
                var latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                _this._map.setMapCenter(resp.coords.latitude, resp.coords.longitude);
                _this._map.setCurrentMapCenter();
                _this.setLocationMarker(resp.coords.latitude, resp.coords.longitude);
                if (_this.httpRequestActivated === true) {
                    _this._map.getPlaygroundsByGeographicCoordinates(Number(resp.coords.latitude), Number(resp.coords.longitude), 2).map(function (data) { return data.json(); })
                        .subscribe(function (data) {
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
            this.currentPosition = new LatLng(48.863129, 2.345152);
            this._map.setMapCenter(48.863129, 2.345152);
            this._map.setCurrentMapCenter();
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
        this.displayParcMarker = function (parc, mode) {
            var _this = this;
            if (this.useNativeMap === true) {
                var name_1 = this.playgroundNoName;
                if (parc.parcItem.name !== '') {
                    name_1 = parc.parcItem.name;
                }
                if (mode === 'add') {
                    this.googleMapNative.addMarker({
                        'position': {
                            lat: parc.parcItem.position.lat,
                            lng: parc.parcItem.position.lng
                        },
                        'title': name_1,
                        'snippet': "Tap here to get more details!",
                        'icon': this._map.getIconNative(parc)
                    }).then(function (marker) {
                        _this.markers[parc.key] = marker;
                        marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(function () {
                            _this.navCtrl.push(ParcDetailsPage, { key: parc.key });
                        });
                    });
                    this.markers.push({
                        'position': {
                            lat: parc.parcItem.position.lat,
                            lng: parc.parcItem.position.lng
                        },
                        'title': name_1,
                        'snippet': "Tap here to get more details!",
                        'icon': this._map.getIconNative(parc)
                    });
                }
                else {
                    this.markers[parc.key].setPosition({
                        lat: parc.parcItem.position.lat,
                        lng: parc.parcItem.position.lng
                    });
                }
            }
            else {
                this.displayParcMarkerJDK(parc, mode);
            }
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
                                this.navCtrl.push(ParcDetailsPage, { key: parc.key });
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
            this.loadingCompleted = false;
            this._map.setCurrentMapCenter();
            if (this.httpRequestActivated === false) {
                if (new Date().getTime() - this.lastRequestParcsAround > 300 || forceRequest === true) {
                    this.lastRequestParcsAround = new Date().getTime();
                    if (cleanParc) {
                        this.cleanParcsDisplayed();
                    }
                    this.geoQuery.updateCriteria({
                        center: [this._map.getCenter().lat, this._map.getCenter().lng],
                        radius: this.radius
                    });
                }
            }
            else {
                this.getPlaygroundsAround(false, false, this.quickRadius);
                this.getPlaygroundsAround(false, false, this.radius);
            }
        };
        this.cleanParcsDisplayed = function () {
            for (var i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(null);
            }
            this.markers = [];
            this.parcs = [];
            this.keys = [];
            if (this.useNativeMap === true) {
                this.mapClusterNative.empty();
            }
            else {
                this.mapCluster.clearMarkers();
            }
        };
        this.getPlaygroundsAround = function (cleanParc, forceRequest, radius) {
            var _this = this;
            if (this.httpRequestActivated === true) {
                if (new Date().getTime() - this.lastRequestParcsAround > 300 || forceRequest === true) {
                    this.lastRequestParcsAround = new Date().getTime();
                    if (cleanParc) {
                        this.cleanParcsDisplayed();
                    }
                    this.loadingCompleted = false;
                    this._map.getPlaygroundsByGeographicCoordinates(this._map.getCenter().lat, this._map.getCenter().lng, radius).map(function (data) { return data.json(); })
                        .subscribe(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            var parc = { 'key': data[i].key, 'distance': 0, 'reviewsLength': 0, 'parcItem': data[i].content };
                            if (_this.keys[data[i].key]) {
                                _this.displayParcMarker(parc, 'update');
                            }
                            else {
                                if (!parc.parcItem.rate) {
                                    parc.parcItem.rate = { 'rate': 0 };
                                }
                                _this.displayParcMarker(parc, 'add');
                                _this.keys[data[i].key] = data[i].key;
                                _this.parcs.push(parc);
                            }
                        }
                        _this.updateDistance();
                        _this.loadingCompleted = true;
                        if (_this.useNativeMap === false) {
                            _this.mapCluster.redraw();
                        }
                    });
                }
            }
        };
        this.getPlaygroundsDetails = function () {
            this._map.getPlaygroundDetails(this.parcs).map(function (data) { return data.json(); })
                .subscribe(function (data) { console.log(data); });
        };
        this.updateDistance = function () {
            var lat = Number(this._map.getCenter().lat);
            var lng = Number(this._map.getCenter().lng);
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
                _this._map.setMapCenter(resp.coords.latitude, resp.coords.longitude);
                _this.displayParcsAround(false, false);
                _this.setLocationMarker(resp.coords.latitude, resp.coords.longitude);
                _this.markerAddress.setMap(null);
            }).catch(function (error) {
                console.log('Error getting location', error);
                _this.errorCallback();
            });
        };
        this.errorCallback = function (e) {
            //alert(this.geolocationNotAllowedLabel)
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
                document.getElementById('user-pic').style.backgroundImage = 'url(' + this._auth.displayPicture() + ')';
            }
            else {
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
                _this.translate.get('map.NONAMEPARC').subscribe(function (res) {
                    console.log(res);
                    _this.playgroundNoName = res;
                });
                _this.loadingCompleted = false;
                _this.loadMap();
                if (_this.platform.is('ios')) {
                    if (_this.useNativeMap === false) {
                        _this.startGeolocation();
                    }
                }
                else {
                    if (_this.useNativeMap === false) {
                        _this.diagnostic.isLocationAuthorized().then((_this.startGeolocation).bind(_this), _this.errorCallback.bind(_this));
                    }
                }
            });
        });
    };
    HomePage.prototype.checkCompleteLoad = function () {
        var returnedValue = false;
        if (this.numberOfParcsToBeLoaded - this.numberParcLoaded <= 0) {
            returnedValue = true;
            try {
                this.loadingCompleted = true;
            }
            catch (err) {
                console.log("error", err);
            }
            this.numberOfParcsToBeLoaded = 0;
            this.numberParcLoaded = 0;
            this.updateDistance();
            this.parcsList = this.parcs.slice(0, 20);
            if (this.useNativeMap === false) {
                this.mapCluster.redraw();
            }
            else {
            }
        }
        else {
            this.loadingCompleted = false;
        }
        return returnedValue;
    };
    HomePage.prototype.setupInitialGeoQuery = function () {
        this.markersEntered = 0;
        this.loadingCompleted = false;
        this.numberOfParcsToBeLoaded = 0;
        var onKeyEnteredRegistration = this.geoQuery.on("key_entered", function (key, location, distance) {
            var keyEntered = {
                key: key,
                location: location,
                distance: distance
            };
            this.markersEntered++;
            this.numberOfParcsToBeLoaded = this.numberOfParcsToBeLoaded + 1;
            this.newKeyEntered(keyEntered.key, keyEntered.location, keyEntered.distance);
        }.bind(this));
        var onReadyRegistration = this.geoQuery.on("ready", function () {
            if (this.markersEntered === 0 && this.parcs.length === 0) {
                this.noParcReturned = true;
                this.checkCompleteLoad();
            }
            else {
                this.noParcReturned = false;
            }
            this.markersEntered = 0;
        }.bind(this));
    };
    HomePage.prototype.newKeyEntered = function (key, location, distance) {
        var _this = this;
        if (this.keys[key]) {
            this.numberParcLoaded = this.numberParcLoaded + 1;
            this.checkCompleteLoad();
        }
        else {
            var parc = { 'key': key, 'distance': distance.toString().substring(0, 4), 'reviewsLength': 0, 'parcItem': null };
            var parcItemObject;
            parcItemObject = this.db.object('positions/' + key);
            var subscription = parcItemObject.subscribe(function (snapshot) {
                parc.parcItem = snapshot;
                if (!parc.parcItem.rate) {
                    parc.parcItem.rate = { 'rate': 0 };
                }
                _this.parcs.push(parc);
                if (!_this.keys[key]) {
                    _this.displayParcMarker(parc, 'add');
                }
                else {
                    _this.displayParcMarker(parc, 'update');
                }
                _this.numberParcLoaded = _this.numberParcLoaded + 1;
                _this.checkCompleteLoad();
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
                if (this.useNativeMap === false) {
                    this._map.setMapCenter(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                }
                else {
                    var location_1 = new LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                    var options = {
                        target: location_1,
                        zoom: 18,
                        tilt: 30
                    };
                    this.googleMapNative.moveCamera(options);
                }
                this.markerAddress.setPosition({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
                console.log(this.markerAddress.getPosition().lat(), this.markerAddress.getPosition().lng());
                this.markerAddress.setTitle(item.description);
                if (this.useNativeMap === false) {
                    this.markerAddress.setMap(this.googleMapJDK);
                    console.log(this.markerAddress);
                }
                this.displayParcsAround(true, false);
            }
            else {
            }
        }.bind(this));
    };
    HomePage.prototype.loadMapNative = function () {
        this.mapHeight = String(this.platform.height() / 2) + "px";
        var element = document.getElementById('map');
        this.googleMapNative = this.createMapNative(element, false, google.maps.MapTypeId.ROADMAP);
    };
    HomePage.prototype.loadMap = function () {
        if (this.useNativeMap === true) {
            this.loadMapNative();
        }
        else {
            this.mapHeight = String(this.platform.height() / 2) + "px";
            var element = document.getElementById('map');
            this.googleMapJDK = this._map.createMapJDK(element, false, google.maps.MapTypeId.ROADMAP);
            var centerControlDiv = document.createElement('div');
            centerControlDiv.id = "centerControlDiv";
            var centerControl = this.centerControl(centerControlDiv, this.googleMapJDK);
            this.googleMapJDK.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
            this.googleMapJDK.addListener('dragend', function () {
                //console.log('dragend');
                this._map.setCurrentMapCenter();
                //this._map.setMapCenter(this._map.getCenter().lat,this._map.getCenter().lng);
                this.displayParcsAround(false, false);
            }.bind(this));
            google.maps.event.addDomListener(window, 'resize', function () {
                this._map.setMapCenter(this._map.getCenter().lat, this._map.getCenter().lng);
            }.bind(this));
            this.mapCluster.addCluster(this.googleMapJDK, []);
        }
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
            this.navCtrl.push(this.parcUpdate, { mode: 'add', position: this._map.getCenter() });
        }
    };
    HomePage.prototype.createMapNative = function (element, mapTypeControl, mapTtypeId) {
        var _this = this;
        var location = new LatLng(-34.9290, 138.6010);
        var mapOptions = this._map.getDefaultMapOptions();
        this.googleMapNative = GoogleMaps.create(element, mapOptions);
        this.googleMapNative.one(GoogleMapsEvent.MAP_READY).then(function () {
            console.log("camera ready");
            _this.getLocation().then(function (res) {
                console.log(res);
                var location = new LatLng(res.coords.latitude, res.coords.longitude);
                var options = {
                    target: location,
                    zoom: 18,
                    tilt: 30
                };
                _this._map.setMapCenter(location.lat, location.lng);
                _this.setupInitialGeoQuery();
                _this.googleMapNative.moveCamera(options);
            })
                .catch(function (error) {
                console.log('Error getting location', error);
                _this.errorCallback(error);
            });
            _this.googleMapNative.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(function (data) {
                console.log("CAMERA_MOVE_END", data);
                var target = _this.googleMapNative.getCameraTarget();
                var mapCenter = { lat: target.lat, lng: target.lng };
                console.log(mapCenter);
                _this._map.setMapCenter(mapCenter.lat, mapCenter.lng);
                _this._map.setCenter(mapCenter.lat, mapCenter.lng);
                _this.displayParcsAround(false, false);
                console.log(_this._map.getCenter());
            });
            _this.googleMapNative.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(function (data) {
                _this.getLocation().then(function (res) {
                    var location = new LatLng(res.coords.latitude, res.coords.longitude);
                    var options = {
                        target: location,
                        zoom: 18,
                        tilt: 30
                    };
                    _this.googleMapNative.moveCamera(options);
                    _this._map.setMapCenter(location.lat, location.lng);
                    _this._map.setCenter(location.lat, location.lng);
                    _this.displayParcsAround(false, false);
                });
            });
            _this.mapClusterNative = _this.googleMapNative.addMarkerCluster({
                //maxZoomLevel: 5,
                boundsDraw: true,
                markers: _this.markers
            }, function (markerCluster) {
                this.mapClusterNative = markerCluster;
                console.log(this.mapClusterNative);
            });
        });
        this.useNativeMap = true;
        return this.googleMapNative;
    };
    HomePage.prototype.getLocation = function () {
        var positionOptions = { timeout: 10000, enableHighAccuracy: true };
        return this.geolocation.getCurrentPosition(positionOptions);
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