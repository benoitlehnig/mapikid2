import { Component,ViewChild } from '@angular/core';
import { Platform, App, ModalController  } from 'ionic-angular';

import { CommonModule } from '@angular/common';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { Storage } from '@ionic/storage';
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from '../pages/home/home';
import { FirstVisitPage } from '../pages/first-visit/first-visit';
import { ContactPage } from '../pages/contact/contact';
import {TranslateService,LangChangeEvent} from 'ng2-translate';
import { AuthService } from '../providers/auth-service/auth-service';
import * as firebase from 'firebase/app';

import { LanguagePage } from '../pages/language/language';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  translate: TranslateService;
  userSigned: boolean=false;

  constructor(private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    translate: TranslateService,private app: App, private storage: Storage, public afAuth: AngularFireAuth, 
    private _auth: AuthService,private ga: GoogleAnalytics,public modalCtrl: ModalController) {

    this.afAuth.auth.onAuthStateChanged(function(user) {
        this.userSigned = this._auth.authenticated;
    }.bind(this));

    this.platform.ready().then(() => { 
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

        this.ga.startTrackerWithId("UA-89879030-1");
        
    });
  }

  
  showFirstPage = function(){
      this.app.getActiveNav().push(FirstVisitPage);
  }
  showContactPage = function(){
    this.app.getActiveNav().push(ContactPage);
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
  openLanguage():void{
    let myModal = this.modalCtrl.create(LanguagePage);
     myModal.present();
  }

}

