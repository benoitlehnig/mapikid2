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
import { Platform, App, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { Storage } from '@ionic/storage';
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from '../pages/home/home';
import { FirstVisitPage } from '../pages/first-visit/first-visit';
import { LegalMentionPage } from '../pages/legal-mention/legal-mention';
import { ContactPage } from '../pages/contact/contact';
import { TranslateService } from 'ng2-translate';
import { AuthService } from '../providers/auth-service/auth-service';
import { LanguagePage } from '../pages/language/language';
import { AdMobFree } from '@ionic-native/admob-free';
var MyApp = /** @class */ (function () {
    function MyApp(platform, statusBar, splashScreen, translate, app, storage, afAuth, _auth, ga, modalCtrl, admobFree) {
        var _this = this;
        this.platform = platform;
        this.app = app;
        this.storage = storage;
        this.afAuth = afAuth;
        this._auth = _auth;
        this.ga = ga;
        this.modalCtrl = modalCtrl;
        this.admobFree = admobFree;
        this.rootPage = HomePage;
        this.userSigned = false;
        this.bannerConfig = {
            id: 'ca-app-pub-1937225175114473/3354580488',
            isTesting: false,
            autoShow: true
        };
        this.bannerActivate = false;
        this.showFirstPage = function () {
            this.app.getActiveNav().push(FirstVisitPage);
        };
        this.showContactPage = function () {
            this.app.getActiveNav().push(ContactPage);
        };
        this.showLegalMention = function () {
            this.app.getActiveNav().push(LegalMentionPage);
        };
        this.afAuth.auth.onAuthStateChanged(function (user) {
            this.userSigned = this._auth.authenticated;
        }.bind(this));
        this.platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            if (_this.bannerActivate === true) {
                if (_this.platform.is('android')) {
                    _this.bannerConfig.id = "ca-app-pub-1937225175114473/4113122211";
                }
                _this.admobFree.banner.config(_this.bannerConfig);
                _this.admobFree.banner.prepare()
                    .then(function () {
                    // banner Ad is ready
                    // if we set autoShow to false, then we will need to call the show method here
                    //this.admobFree.banner.show();
                })
                    .catch(function (e) { return console.log(e); });
            }
            splashScreen.hide();
            _this.translate = translate;
            _this.translate.setDefaultLang('fr');
            storage.get('langKey').then(function (val) {
                if (val !== null) {
                    _this.translate.use(val);
                }
                else {
                    _this.translate.use('fr');
                }
            });
            storage.get('firstVisit').then(function (val) {
                //not first visit
                console.log(val);
                if (val !== null) {
                }
                else {
                    _this.app.getActiveNav().push(FirstVisitPage);
                    storage.set('firstVisit', 'false');
                }
            }).catch(function (err) {
                // we got an error
                console.log(err);
            });
            _this.translate.onLangChange.subscribe(function (event) {
                storage.set('langKey', event.lang);
            });
        });
    }
    MyApp.prototype.signInWithGoogle = function () {
        this._auth.signInWithGoogle();
    };
    MyApp.prototype.signInWithFacebook = function () {
        this._auth.signInWithFacebook();
    };
    MyApp.prototype.signOut = function () {
        this._auth.signOut();
    };
    MyApp.prototype.openLanguage = function () {
        var myModal = this.modalCtrl.create(LanguagePage);
        myModal.present();
    };
    MyApp = __decorate([
        Component({
            templateUrl: 'app.html'
        }),
        __metadata("design:paramtypes", [Platform, StatusBar, SplashScreen,
            TranslateService, App, Storage, AngularFireAuth,
            AuthService, FirebaseAnalytics, ModalController, AdMobFree])
    ], MyApp);
    return MyApp;
}());
export { MyApp };
//# sourceMappingURL=app.component.js.map