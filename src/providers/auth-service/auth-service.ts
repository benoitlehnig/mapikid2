import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
// Do not import from 'firebase' as you'll lose the tree shaking benefits
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

@Injectable()
export class AuthService {
  private currentUser: firebase.User;

  constructor(public afAuth: AngularFireAuth, public platform:Platform,
    private googlePlus: GooglePlus,private fb: Facebook, public db: AngularFireDatabase) {
    afAuth.authState.subscribe((user: firebase.User) => this.currentUser = user);
  }

  get authenticated(): boolean {
    return this.currentUser !== null;
  }

  /*signInWithFacebook(): firebase.Promise<any> {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }
  */
  signInWithFacebook(): firebase.Promise<any> {
    if (this.platform.is('cordova')) {
      return this.fb.login(['email', 'public_profile']).then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return this.afAuth.auth.signInWithCredential(facebookCredential);
      });
    } else {
      return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    }

  }
  /*
  signInWithGoogle(): firebase.Promise<any> {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
*/
  signInWithGoogle(): firebase.Promise<any> {
    if (this.platform.is('cordova')) {
      return this.googlePlus.login(
        {'scopes': '', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': '173150624731-3gj50f18au5gtvqtbq5o1pa50hj832nk.apps.googleusercontent.com',
         // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true
        }
        )
      .then(res => {
        console.log(res);
        const googleCredential = firebase.auth.GoogleAuthProvider.credential(res.idToken);
        return this.afAuth.auth.signInWithCredential(googleCredential);
      }).catch((err) => {
        alert('Error' + err);
    });
    } else {
      return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

  }
  signOut(): void {
    this.afAuth.auth.signOut();
  }

  displayName(): string {
    if (this.currentUser !== null) {
      return this.currentUser.displayName;
    } else {
      return '';
    }
  }
  displayEmail(): string {
    if (this.currentUser !== null) {
      return this.currentUser.email;
    } else {
      return '';
    }
  }
  displayUid(): string {
    if (this.currentUser !== null) {
      return this.currentUser.uid;
    } else {
      return '';
    }
  }
  displayPicture(): string {
    if (this.currentUser !== null) {
      return this.currentUser.providerData[0].photoURL;
    } else {
      return '';
    }
  }

  getProfile(): FirebaseObjectObservable<any> {
    if(this.currentUser !== null) {
      if(this.currentUser.uid){
        return  this.db.object('users/'+this.currentUser.uid);
      }

    }
  }
}