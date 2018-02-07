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
import { AngularFireDatabase } from 'angularfire2/database';
/**
 * Generated class for the ReviewsRootPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var ReviewsRootPage = /** @class */ (function () {
    function ReviewsRootPage(navCtrl, navParams, db) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        console.log(navParams);
        this.reviews = db.list('positions/' + navParams.data.$key + '/reviews');
        console.log(this.reviews);
    }
    ReviewsRootPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad ReviewsRootPage');
    };
    ReviewsRootPage = __decorate([
        Component({
            selector: 'page-reviews-root',
            templateUrl: 'reviews-root.html',
        }),
        __metadata("design:paramtypes", [NavController, NavParams, AngularFireDatabase])
    ], ReviewsRootPage);
    return ReviewsRootPage;
}());
export { ReviewsRootPage };
//# sourceMappingURL=reviews-root.js.map