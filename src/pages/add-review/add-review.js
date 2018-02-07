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
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { AuthService } from '../../providers/auth-service/auth-service';
/**
 * Generated class for the AddReviewPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var AddReviewPage = /** @class */ (function () {
    function AddReviewPage(navCtrl, viewCtrl, navParams, db, ga, _auth) {
        this.navCtrl = navCtrl;
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.db = db;
        this.ga = ga;
        this._auth = _auth;
        this.review = { 'rate': 0, 'description': "" };
        this.photoUrl = "";
        this.userName = "";
        this.closeModal = function () {
            this.viewCtrl.dismiss();
        };
        this.saveReview = function () {
            var _this = this;
            var newReview = {
                name: this._auth.displayName(),
                text: this.review.description,
                uid: this._auth.displayName(),
                photoUrl: this._auth.displayPicture(),
                rate: this.review.rate
            };
            this.ga.logEvent("parc_management", { "action": "Add_review", "parc_key": this.navParams.get('parc').$key, "review": this.review.description });
            this.reviews.push(newReview).then(function (newReview) {
                _this.saveReviewAverageRate();
            });
        };
        this.onRatingChange = function ($event) {
            this.review.rate = $event.rating;
        };
        this.saveReviewAverageRate = function () {
            var _this = this;
            var averageRate = this.review.rate;
            var numberRate = 1;
            this.reviews.subscribe(function (snapshots) {
                snapshots.forEach(function (snapshot) {
                    console.log(snapshot);
                    if (snapshot.rate) {
                        averageRate = snapshot.rate + averageRate;
                        numberRate = numberRate + 1;
                    }
                });
            });
            averageRate = averageRate / numberRate;
            var newRate = { 'rate': averageRate, 'numberRate': numberRate };
            console.log(newRate);
            this.parcObject.update({ rate: newRate }).then(function (_) { return _this.closeModal(); }).catch(function (err) { return console.log(err, "Failed"); });
        };
        this.reviews = db.list('positions/' + this.navParams.get('parc').$key + '/reviews');
        this.parcObject = db.object('positions/' + this.navParams.get('parc').$key);
        this.photoUrl = this._auth.displayPicture();
        this.userName = this._auth.displayName();
    }
    AddReviewPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad AddReviewPage');
        this.ga.setCurrentScreen("Add Review Page");
    };
    AddReviewPage = __decorate([
        Component({
            selector: 'page-add-review',
            templateUrl: 'add-review.html',
        }),
        __metadata("design:paramtypes", [NavController, ViewController,
            NavParams, AngularFireDatabase,
            FirebaseAnalytics, AuthService])
    ], AddReviewPage);
    return AddReviewPage;
}());
export { AddReviewPage };
//# sourceMappingURL=add-review.js.map