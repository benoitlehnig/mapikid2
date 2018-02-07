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
import { NavController, NavParams, App } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { HomePage } from '../home/home';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
/**
 * Generated class for the FirstVisitPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var FirstVisitPage = /** @class */ (function () {
    function FirstVisitPage(navCtrl, navParams, app, db, ga) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.app = app;
        this.ga = ga;
        this.numberOfParcs = 0;
        this.close = function () {
            this.app.getActiveNav().setRoot(HomePage);
            this.ga.logEvent("First Visit Page", { "action": "close" });
        };
        var statistics = db.object('statistics/numberOfParcs');
        statistics.subscribe(function (snapshot) {
            _this.numberOfParcs = snapshot.$value;
        });
    }
    FirstVisitPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad FirstVisitPage');
        this.ga.setCurrentScreen("First Visit Page");
    };
    FirstVisitPage = __decorate([
        Component({
            selector: 'page-first-visit',
            templateUrl: 'first-visit.html',
        }),
        __metadata("design:paramtypes", [NavController, NavParams, App,
            AngularFireDatabase, FirebaseAnalytics])
    ], FirstVisitPage);
    return FirstVisitPage;
}());
export { FirstVisitPage };
//# sourceMappingURL=first-visit.js.map