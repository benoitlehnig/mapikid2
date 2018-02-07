var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
// Do not import from 'firebase' as you'll lose the tree shaking benefits
import * as firebase from 'firebase/app';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
var AuthService = /** @class */ (function () {
    function AuthService(afAuth, platform, googlePlus, fb) {
        var _this = this;
        this.afAuth = afAuth;
        this.platform = platform;
        this.googlePlus = googlePlus;
        this.fb = fb;
        afAuth.authState.subscribe(function (user) { return _this.currentUser = user; });
    }
    Object.defineProperty(AuthService.prototype, "authenticated", {
        get: function () {
            return this.currentUser !== null;
        },
        enumerable: true,
        configurable: true
    });
    /*signInWithFacebook(): firebase.Promise<any> {
      return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    }
    */
    AuthService.prototype.signInWithFacebook = function () {
        var _this = this;
        if (this.platform.is('cordova')) {
            return this.fb.login(['email', 'public_profile']).then(function (res) {
                var facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
                return _this.afAuth.auth.signInWithCredential(facebookCredential);
            });
        }
        else {
            return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
        }
    };
    /*
    signInWithGoogle(): firebase.Promise<any> {
      return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
  */
    AuthService.prototype.signInWithGoogle = function () {
        var _this = this;
        if (this.platform.is('cordova')) {
            return this.googlePlus.login({ 'scopes': '',
                'webClientId': '173150624731-3gj50f18au5gtvqtbq5o1pa50hj832nk.apps.googleusercontent.com',
                // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                'offline': true
            })
                .then(function (res) {
                console.log(res);
                var googleCredential = firebase.auth.GoogleAuthProvider.credential(res.idToken);
                return _this.afAuth.auth.signInWithCredential(googleCredential);
            }).catch(function (err) {
                alert('Error' + err);
            });
        }
        else {
            return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        }
    };
    AuthService.prototype.signOut = function () {
        this.afAuth.auth.signOut();
    };
    AuthService.prototype.displayName = function () {
        if (this.currentUser !== null) {
            return this.currentUser.displayName;
        }
        else {
            return '';
        }
    };
    AuthService.prototype.displayPicture = function () {
        if (this.currentUser !== null) {
            return this.currentUser.providerData[0].photoURL;
        }
        else {
            return '';
        }
    };
    AuthService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [AngularFireAuth, Platform,
            GooglePlus, Facebook])
    ], AuthService);
    return AuthService;
}());
export { AuthService };
//# sourceMappingURL=auth-service.js.map