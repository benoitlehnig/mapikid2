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
import { NavController, NavParams, ViewController, Platform } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import GeoFire from 'geofire';
import { MapService } from '../../providers/map-service/map-service';
import { AuthService } from '../../providers/auth-service/auth-service';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
/**
 * Generated class for the ReviewsRootPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var UpdateParcPage = /** @class */ (function () {
    function UpdateParcPage(platform, viewCtrl, navCtrl, navParams, db, _map, ga, _auth) {
        this.platform = platform;
        this.viewCtrl = viewCtrl;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.db = db;
        this._map = _map;
        this.ga = ga;
        this._auth = _auth;
        this.map = null;
        this.mode = "update";
        this.gf = new GeoFire(firebase.database().ref('geofire'));
        this.marker = null;
        this.parc = {
            name: "",
            addedBy: "",
            position: "",
            description: "",
            open: true,
            closed: false,
            shade: true,
            free: true,
            events: false,
            facilities: {
                swing: false,
                slide: false,
                trampoline: false,
                water: false,
                wc: false,
                spider: false,
                monkeyBridge: false,
                animals: false,
                sandbox: false,
                turnstile: false,
                seesaw: false,
                climb: false,
                football: false,
                basketball: false,
                other: false,
                otherDescrition: null
            },
            lessThan2years: false,
            between2and6: false,
            sixandPlus: false
        };
        this.loadMap = function () {
            var element = document.getElementById('mapUpdateDetail');
            this.map = this._map.createMapJDK(element, true, google.maps.MapTypeId.ROADMAP);
            if (this.mode === 'add') {
                console.log(this.navParams.get('position'));
                this.parc.position = this.navParams.get('position');
            }
            var latLng = new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng);
            this.map.setCenter(latLng);
            this.map.setZoom(18);
            this.marker = new google.maps.Marker({
                position: latLng,
                map: this.map,
                title: this.parc.name,
                draggable: true
            });
        };
        this.closeModal = function (updateMade) {
            if (updateMade === true) {
                this.viewCtrl.dismiss(this.mode);
            }
            else {
                this.viewCtrl.dismiss('cancel');
            }
        };
        this.saveParc = function () {
            var location = [this.marker.getPosition().lat(), this.marker.getPosition().lng()];
            this.parc.position = { lat: this.marker.getPosition().lat(), lng: this.marker.getPosition().lng() };
            if (this.parc.closed === false) {
                this.parc.open = true;
            }
            else {
                this.parc.open = false;
            }
            if (this.parc.facilities.otherDescription) {
                if (this.parc.facilities.otherDescription.replace(/\s+/g, "").length > 0) {
                    this.parc.facilities.other = true;
                }
            }
            else {
                this.parc.facilities.other = false;
                this.parc.facilities.otherDescription = null;
            }
            if (this._auth.authenticated !== false) {
                this.parc.modifiedBy = this._auth.displayName();
            }
            console.log(this.parc);
            if (this.mode === 'update') {
                var parcObject = this.db.object('positions/' + this.parc.$key);
                console.log(this.parc);
                parcObject.update(this.parc);
                console.log(this.parc.$key);
                this.gf.set(this.parc.$key, location).then(function () {
                    this.ga.logEvent("parc_management", { "action": "update", "parc_key": this.parc.$key });
                }.bind(this));
            }
            if (this.mode === 'add') {
                if (this._auth.authenticated !== false) {
                    this.parc.addedBy = this._auth.displayName();
                }
                var newPosition = this.db.database.ref('positions').push();
                console.log(this.parc);
                newPosition.set(this.parc).then(console.log(newPosition.key));
                console.log(newPosition.$key);
                this.gf.set(newPosition.key, location).then(function () {
                    console.log(newPosition.key);
                    this.ga.logEvent("parc_management", { "action": "add", "parc_key": this.parc.$key });
                }.bind(this));
            }
            this.closeModal(true);
        };
        console.log(this.navParams.get('parc'));
        if (this.navParams.get('mode')) {
            this.mode = this.navParams.get('mode');
        }
        if (this.mode === 'update') {
            this.parc = this.navParams.get('parc');
            if (this.parc.open) {
                this.parc.closed = !this.parc.open;
            }
            if (this.parc.facilities === null || !this.parc.facilities) {
                this.parc.facilities = {
                    swing: false,
                    slide: false,
                    trampoline: false,
                    water: false,
                    wc: false,
                    spider: false,
                    monkeyBridge: false,
                    animals: false,
                    sandbox: false,
                    other: false,
                    turnstile: false,
                    seesaw: false,
                    climb: false,
                    football: false,
                    basketball: false,
                    otherDescription: null
                };
            }
            else {
                if (!this.parc.facilities.swing) {
                    this.parc.facilities.swing = false;
                }
                if (!this.parc.facilities.slide) {
                    this.parc.facilities.slide = false;
                }
                if (!this.parc.facilities.trampoline) {
                    this.parc.facilities.trampoline = false;
                }
                if (!this.parc.facilities.water) {
                    this.parc.facilities.water = false;
                }
                if (!this.parc.facilities.wc) {
                    this.parc.facilities.wc = false;
                }
                if (!this.parc.facilities.spider) {
                    this.parc.facilities.spider = false;
                }
                if (!this.parc.facilities.monkeyBridge) {
                    this.parc.facilities.monkeyBridge = false;
                }
                if (!this.parc.facilities.animals) {
                    this.parc.facilities.animals = false;
                }
                if (!this.parc.facilities.sandbox) {
                    this.parc.facilities.sandbox = false;
                }
                if (!this.parc.facilities.turnstile) {
                    this.parc.facilities.turnstile = false;
                }
                if (!this.parc.facilities.seesaw) {
                    this.parc.facilities.seesaw = false;
                }
                if (!this.parc.facilities.climb) {
                    this.parc.facilities.climb = false;
                }
                if (!this.parc.facilities.football) {
                    this.parc.facilities.football = false;
                }
                if (!this.parc.facilities.basketball) {
                    this.parc.facilities.basketball = false;
                }
                if (!this.parc.facilities.other) {
                    this.parc.facilities.other = false;
                }
                if (!this.parc.facilities.otherDescription) {
                    this.parc.facilities.otherDescription = null;
                }
            }
        }
        else {
            this.parc.position = this.navParams.get('position');
        }
    }
    UpdateParcPage.prototype.ngOnInit = function () {
        var _this = this;
        this.platform.ready().then(function () {
            _this.loadMap();
            _this.ga.setCurrentScreen("Update Page ");
            _this.ga.logEvent("Update Parc Request", { "parc_key": _this.parc.$key });
        });
    };
    UpdateParcPage = __decorate([
        Component({
            selector: 'page-update-parc',
            templateUrl: 'update-parc.html',
        }),
        __metadata("design:paramtypes", [Platform, ViewController,
            NavController, NavParams,
            AngularFireDatabase,
            MapService, FirebaseAnalytics, AuthService])
    ], UpdateParcPage);
    return UpdateParcPage;
}());
export { UpdateParcPage };
;
//# sourceMappingURL=update-parc.js.map