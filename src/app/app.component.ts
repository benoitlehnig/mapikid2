import { Component,ViewChild } from '@angular/core';
import { Nav,Platform, NavController, App  } from 'ionic-angular';

import { CommonModule } from '@angular/common';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from '../pages/home/home';
import { FirstVisitPage } from '../pages/first-visit/first-visit';
import {TranslateService,LangChangeEvent} from 'ng2-translate';
import { AuthService } from '../providers/auth-service/auth-service';
import * as firebase from 'firebase/app';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  translate: TranslateService;
  userSigned: boolean=false;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    translate: TranslateService,private app: App, private storage: Storage, public afAuth: AngularFireAuth, 
    private _auth: AuthService) {

    this.afAuth.auth.onAuthStateChanged(function(user) {
        this.userSigned = this._auth.authenticated;
    }.bind(this));

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        splashScreen.hide();
        this.translate= translate;
        this.translate.setDefaultLang('fr');
        
        
        storage.get('langKey').then((val) => {
          if(val !==null){
              this.translate.use(val);
          }
          else{
            this.translate.use('fr');
          }
        });
        storage.get('firstVisit').then((val) => {
          //not first visit
          console.log(val);
          if(val !==null){

          }
          else{
            this.app.getActiveNav().push(FirstVisitPage);
            storage.set('firstVisit', 'false');
          }
        }).catch(function (err) {
        // we got an error
          console.log(err);
        });
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
          storage.set('langKey', event.lang);
        });
      
     
    });
  }

  changelanguage(langKey) {
      
      this.translate.use(langKey);
  }
  showFirstPage = function(){
      this.app.getActiveNav().push(FirstVisitPage);
  }
  signInWithGoogle(): void {
    this._auth.signInWithGoogle()
  }
  signInWithFacebook(): void {
    this._auth.signInWithFacebook()
  }
  signOut(): void{
    this._auth.signOut();
  }

}

