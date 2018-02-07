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
import { TranslateService } from 'ng2-translate';
/**
 * Generated class for the LanguagePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var LanguagePage = /** @class */ (function () {
    function LanguagePage(navCtrl, navParams, viewCtrl, translate) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
        this.translate = translate;
        this.currentLanguage = "";
    }
    LanguagePage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad LanguagePage');
        this.currentLanguage = this.translate.currentLang;
    };
    LanguagePage.prototype.changelanguage = function (langKey) {
        console.log("change  language");
        this.translate.use(langKey);
    };
    LanguagePage.prototype.close = function () {
        this.viewCtrl.dismiss();
    };
    LanguagePage = __decorate([
        Component({
            selector: 'page-language',
            templateUrl: 'language.html',
        }),
        __metadata("design:paramtypes", [NavController, NavParams,
            ViewController, TranslateService])
    ], LanguagePage);
    return LanguagePage;
}());
export { LanguagePage };
//# sourceMappingURL=language.js.map