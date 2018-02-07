var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Tabs, ModalController, ToastController, Platform } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../providers/auth-service/auth-service';
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import { DetailsRootPage } from '../details-root/details-root';
import { ReviewsRootPage } from '../reviews-root/reviews-root';
import { UpdateParcPage } from '../update-parc/update-parc';
import { AddReviewPage } from '../add-review/add-review';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { LoginPage } from '../login/login';
/**
 * Generated class for the ParcDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var ParcDetailsPage = /** @class */ (function () {
    function ParcDetailsPage(navCtrl, navParams, platform, db, modalCtrl, storage, afAuth, _auth, toastCtrl, translate, ga) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.platform = platform;
        this.modalCtrl = modalCtrl;
        this.storage = storage;
        this.afAuth = afAuth;
        this._auth = _auth;
        this.toastCtrl = toastCtrl;
        this.ga = ga;
        this.selectedTab = 0;
        this.parc = {};
        this.detailsRootPage = DetailsRootPage;
        this.reviewsRootPage = ReviewsRootPage;
        this.userSigned = false;
        this.localParc = { 'validated': false, 'requestedForDeletion': false };
        this.toastLabelValidated = "";
        this.toastLabelDeleted = "";
        this.toastLabelUpdated = "";
        this.toastLabelAdded = "";
        this.map = null;
        this.login = LoginPage;
        this.openUpdateParcModal = function () {
            var _this = this;
            if (this._auth.authenticated === false) {
                var myModal = this.modalCtrl.create(this.login);
                myModal.present();
            }
            else {
                var obj = { parc: this.parc };
                var myModal = this.modalCtrl.create(UpdateParcPage, obj);
                myModal.onDidDismiss(function (data) {
                    console.log("data", data);
                    if (data === 'update') {
                        _this.presentToast(_this.toastLabelUpdated);
                    }
                    if (data === 'add') {
                        _this.presentToast(_this.toastLabelAdded);
                    }
                });
                myModal.present();
            }
        };
        this.openAddReviewModal = function () {
            var obj = { parc: this.parc };
            var myModal = this.modalCtrl.create(AddReviewPage, obj);
            myModal.present();
        };
        this.validate = function () {
            var validateIncreased = 0;
            if (this.parc.validationNumber) {
                validateIncreased = this.parc.validationNumber;
            }
            validateIncreased = validateIncreased + 1;
            this.parcObject.update({ validationNumber: validateIncreased });
            this.parcObject.update({ initialized: false });
            this.localParc.validated = true;
            this.storage.set(this.parc.$key, JSON.stringify(this.localParc));
            this.presentToast(this.toastLabelValidated);
            this.ga.logEvent("parc_management", { "action": "validate", "parc_key": this.parc.$key });
        };
        this.suggestRemove = function () {
            var removalIncreased = 0;
            if (this.parc.removalRequestNumber) {
                removalIncreased = this.parc.removalRequestNumber;
            }
            this.ga.logEvent("parc_management", { "action": "removal request", "parc_key": this.parc.$key });
            removalIncreased = removalIncreased + 1;
            //removal of the parc
            if (removalIncreased > 5) {
                //$scope.positionRef.child($scope.parc.$key).remove();
                //$scope.geoFire.remove($scope.parc.$key).then($scope.closeParcDetails());
            }
            else {
                this.parcObject.update({ removalRequestNumber: removalIncreased });
            }
            this.localParc.requestedForDeletion = true;
            this.storage.set(this.parc.$key, JSON.stringify(this.localParc));
            this.presentToast(this.toastLabelDeleted);
        };
        console.log(navParams);
        this.parcObject = db.object('positions/' + this.navParams.get('key'));
        this.parcObject.subscribe(function (snapshot) {
            _this.parc = snapshot;
            console.log(_this.parc);
            _this.parc.reviewsLength = 0;
            if (_this.parc.reviews) {
                _this.parc.reviewsLength = Object.keys(_this.parc.reviews).length;
            }
        });
        this.afAuth.auth.onAuthStateChanged(function (user) {
            this.userSigned = this._auth.authenticated;
        }.bind(this));
        storage.get(this.parc.$key).then(function (val) {
            console.log(val);
            if (val !== null) {
                _this.localParc = JSON.parse(val);
            }
            else {
            }
        }).catch(function (err) {
            // 	we got an error
            console.log(err);
        });
        translate.get('parcDetails.SNACKBARLABELVALIDATED').subscribe(function (res) {
            _this.toastLabelValidated = res;
        });
        translate.get('parcDetails.SNACKBARLABELDELETED').subscribe(function (res) {
            _this.toastLabelDeleted = res;
        });
        translate.get('parcUpdate.TOASTPARCADDED').subscribe(function (res) {
            _this.toastLabelAdded = res;
        });
        translate.get('parcUpdate.TOASTPARCUPDATED').subscribe(function (res) {
            _this.toastLabelUpdated = res;
        });
        this.platform.ready().then(function () {
            _this.ga.setCurrentScreen("Details Page " + _this.navParams.get('key'));
        });
    }
    ParcDetailsPage.prototype.tabSelected = function (tab) {
        if (this.tabRef.getSelected() === this.tabRef.getByIndex(0)) {
            this.selectedTab = 0;
        }
        else {
            this.selectedTab = 1;
        }
    };
    ParcDetailsPage.prototype.presentToast = function (message) {
        var toast = this.toastCtrl.create({
            message: message,
            duration: 15000,
            showCloseButton: true,
            closeButtonText: "X"
        });
        toast.present();
    };
    __decorate([
        ViewChild('myTabs'),
        __metadata("design:type", Tabs)
    ], ParcDetailsPage.prototype, "tabRef", void 0);
    ParcDetailsPage = __decorate([
        Component({
            selector: 'page-parc-details',
            templateUrl: 'parc-details.html',
        }),
        __metadata("design:paramtypes", [NavController, NavParams, Platform,
            AngularFireDatabase, ModalController, Storage,
            AngularFireAuth, AuthService,
            ToastController, TranslateService, FirebaseAnalytics])
    ], ParcDetailsPage);
    return ParcDetailsPage;
}());
export { ParcDetailsPage };
//# sourceMappingURL=parc-details.js.map