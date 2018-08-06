import { Component,ViewChild } from '@angular/core';
import { Platform, App, ModalController  } from 'ionic-angular';

import { CommonModule } from '@angular/common';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { Network } from '@ionic-native/network';

import { Storage } from '@ionic/storage';
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from '../pages/home/home';
import { FirstVisitPage } from '../pages/first-visit/first-visit';
import { LegalMentionPage } from '../pages/legal-mention/legal-mention';
import { NoNetworkPage } from '../pages/no-network/no-network';
import { ProfilePage } from '../pages/profile/profile';
import { ContactPage } from '../pages/contact/contact';
import {TranslateService,LangChangeEvent} from 'ng2-translate';
import { AuthService } from '../providers/auth-service/auth-service';
import * as firebase from 'firebase/app';

import { LanguagePage } from '../pages/language/language';

import { AppRate } from '@ionic-native/app-rate';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  translate: TranslateService;
  userSigned: boolean=false;

  bannerActivate:boolean = false;
  pictureUrl:string;
  displayName:string;
  displayEmail:string;

  
  constructor(private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    translate: TranslateService,private app: App, private storage: Storage, public afAuth: AngularFireAuth, 
    private _auth: AuthService,private ga: FirebaseAnalytics,public modalCtrl: ModalController,
    private network: Network,private appRate: AppRate) {

    this.afAuth.auth.onAuthStateChanged(function(user) {
        this.userSigned = this._auth.authenticated;
        this.pictureUrl = this._auth.displayPicture();
        this.displayName = this._auth.displayName();
        this.displayEmail = this._auth.displayEmail();
    }.bind(this));

    this.platform.ready().then(() => { 
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        statusBar.backgroundColorByHexString('#8EC63F');
         let disconnectSub = this.network.onDisconnect().subscribe(() => {
          console.log('you are offline');
          this.app.getActiveNav().push(NoNetworkPage);
        });

        let connectSub = this.network.onConnect().subscribe(()=> {
          console.log('you are online');
          this.app.getActiveNav().push(FirstVisitPage);
        });
        
        
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


        //app rate
        this.appRate.preferences = {
          usesUntilPrompt: 2,
          storeAppURL: {
           ios: '1307446141',
           android: 'market://details?id=com.mapikid.com'
          }
        };   
        
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
  showLegalMention = function(){
    this.app.getActiveNav().push(LegalMentionPage);
  }
  showProfilePage = function(){
    this.app.getActiveNav().push(ProfilePage);
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

