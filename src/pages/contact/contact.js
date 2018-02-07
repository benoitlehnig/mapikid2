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
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DatePipe } from '@angular/common';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { AuthService } from '../../providers/auth-service/auth-service';
import { AngularFireDatabase } from 'angularfire2/database';
/**
 * Generated class for the ContactPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var ContactPage = /** @class */ (function () {
    function ContactPage(navCtrl, navParams, db, platform, ga, _auth, datePipe) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.db = db;
        this.platform = platform;
        this.ga = ga;
        this._auth = _auth;
        this.datePipe = datePipe;
        this.userName = "";
        this.message = "";
        this.phone = "";
        this.email = "";
        this.saveFeedback = function () {
            var _this = this;
            var userName = "anonymous";
            var userAgent = "";
            if (this.platform.ready()) {
                userAgent = this.platform.platforms();
            }
            if (this._auth.authenticated) {
                userName = this._auth.displayName();
            }
            var newFeedback = this.db.database.ref('feedback').push();
            var feedback = {
                name: userName,
                email: this.email,
                phone: this.phone,
                text: this.message,
                date: this.datePipe.transform(new Date(), ' yyyy-MM-ddTHH:mmZ'),
                userAgent: userAgent
            };
            newFeedback.set(feedback).then(function () {
                _this.ga.logEvent("SendComment", { "action": "SendComment", "message": _this.message });
                _this.message = "";
            });
        };
    }
    ContactPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad ContactPage');
        this.ga.setCurrentScreen("Contact Us");
    };
    ContactPage = __decorate([
        Component({
            selector: 'page-contact',
            templateUrl: 'contact.html',
            providers: [DatePipe]
        }),
        __metadata("design:paramtypes", [NavController, NavParams,
            AngularFireDatabase, Platform,
            FirebaseAnalytics, AuthService, DatePipe])
    ], ContactPage);
    return ContactPage;
}());
export { ContactPage };
//# sourceMappingURL=contact.js.map