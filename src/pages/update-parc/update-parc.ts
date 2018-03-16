import { Component } from '@angular/core';
import { NavController, NavParams, ViewController,Platform } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase';
import GeoFire from 'geofire';
import { MapService } from '../../providers/map-service/map-service';
import { AuthService } from '../../providers/auth-service/auth-service';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the ReviewsRootPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-update-parc',
  templateUrl: 'update-parc.html',
})
export class UpdateParcPage {

  map=null ;
  mode:string="update";
  reviews:FirebaseListObservable<any[]>;
  gf = new GeoFire( firebase.database().ref('geofire'));
  marker= null;
  parc: {[k: string]: any} = {
          name: "",
          addedBy: "",
          modifiedBy: "",
          addedByUid: "",
          modifiedByUid: "",
          position: "" ,
          description: "",
          open : true,
          closed: false,
          shade:true,
          free : true,
          events: false,
          facilities:{
            swing : false,
            slide :false,
            trampoline: false,
            water:false,
            wc:false,
            spider:false,
            monkeyBridge:false,
            animals:  false,
            sandbox:  false,
            turnstile:  false,
            seesaw:  false,
            climb:  false,
            football:  false,
            basketball:  false,
            other:false,
            otherDescrition:null
          },
          lessThan2years: false,
          between2and6: false,
          sixandPlus: false
    };
  
  localParc:{[k: string]: any} = {'validated':false,'requestedForDeletion':false};

  constructor(public platform: Platform,public viewCtrl: ViewController,
    public navCtrl: NavController, public navParams: NavParams,
    public db: AngularFireDatabase, private storage: Storage,
    private _map:MapService, private ga: FirebaseAnalytics,private _auth: AuthService,) {
    console.log(this.navParams.get('parc'));
    
    if(this.navParams.get('mode')){
      this.mode = this.navParams.get('mode');
    }
    if(this.mode === 'update'){
      this.parc  =  this.navParams.get('parc');
      if(this.parc.open){
        this.parc.closed = !this.parc.open;
      }
      if(this.parc.facilities === null || !this.parc.facilities){
        this.parc.facilities = {
              swing : false,
              slide :false,
              trampoline: false,
              water:false,
              wc:false,
              spider:false,
              monkeyBridge:false,
              animals:  false,
              sandbox:false,
              other: false,
              turnstile:  false,
              seesaw:  false,
              climb:  false,
              football:  false,
              basketball:  false,
              otherDescription: null
        };
      }
      else {
        if(!this.parc.facilities.swing){this.parc.facilities.swing = false;}
        if(!this.parc.facilities.slide){this.parc.facilities.slide = false;}
        if(!this.parc.facilities.trampoline){this.parc.facilities.trampoline = false;}
        if(!this.parc.facilities.water){this.parc.facilities.water = false;}
        if(!this.parc.facilities.wc){this.parc.facilities.wc = false;}
        if(!this.parc.facilities.spider){this.parc.facilities.spider = false;}
        if(!this.parc.facilities.monkeyBridge){this.parc.facilities.monkeyBridge =false;}
        if(!this.parc.facilities.animals){this.parc.facilities.animals = false;}
        if(!this.parc.facilities.sandbox){this.parc.facilities.sandbox = false;}
        if(!this.parc.facilities.turnstile){this.parc.facilities.turnstile = false;}
        if(!this.parc.facilities.seesaw){this.parc.facilities.seesaw = false;}
        if(!this.parc.facilities.climb){this.parc.facilities.climb = false;}
        if(!this.parc.facilities.football){this.parc.facilities.football = false;}
        if(!this.parc.facilities.basketball){this.parc.facilities.basketball = false;}
        if(!this.parc.facilities.other){this.parc.facilities.other = false;}
        if(!this.parc.facilities.otherDescription){this.parc.facilities.otherDescription = null;}
      }
    }
    else{
      this.parc.position =  this.navParams.get('position');
    }
    storage.get(this.parc.$key).then((val) => {
      console.log(val);
      if(val !==null){
        this.localParc = JSON.parse(val);
     }  
      else{
     
      }
    }).catch(function (err) {
      //   we got an error
     console.log(err);
    });
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.loadMap();
      this.ga.setCurrentScreen("Update Page ");
      this.ga.logEvent("Update Parc Request", {"parc_key":this.parc.$key});
    }); 
  }

  loadMap = function(){
    let element: HTMLElement = document.getElementById('mapUpdateDetail');
    this.map = this._map.createMapJDK(element,true,google.maps.MapTypeId.ROADMAP);
    if(this.mode==='add'){
      console.log(this.navParams.get('position'));
      this.parc.position =  this.navParams.get('position');
    }
    var latLng = new google.maps.LatLng(this.parc.position.lat, this.parc.position.lng);
    this.map.setCenter(latLng);
    this.map.setZoom(18);
    this.marker = new google.maps.Marker({
            position:  latLng,
            map: this.map,
            title: this.parc.name,
            draggable: true  
      });
  }

  closeModal = function(updateMade){
    if(updateMade===true){
       this.viewCtrl.dismiss(this.mode);
    }
    else{
       this.viewCtrl.dismiss('cancel');
    }
  }
  saveParc = function(){
    var location=[this.marker.getPosition().lat(), this.marker.getPosition().lng()];
    this.parc.position = {lat: this.marker.getPosition().lat(), lng: this.marker.getPosition().lng()};
    if(this.parc.closed === false){
        this.parc.open = true;
    }
    else{

      this.parc.open =false;
    }
    if(this.parc.facilities.otherDescription){
       if(this.parc.facilities.otherDescription.replace(/\s+/g,"").length>0){
        this.parc.facilities.other =true;
      }
    }
    else{
      this.parc.facilities.other =false;
      this.parc.facilities.otherDescription =null;
    }
    if(this._auth.authenticated !==false ){
      this.parc.modifiedBy = this._auth.displayName();
      this.parc.modifiedByUid = this._auth.displayUid();
    }
    var validateIncreased = 0;
    if(this.parc.validationNumber){
      validateIncreased = this.parc.validationNumber;
    }
    this.parc.validationNumber = validateIncreased+1;
    this.parc.initialized = false;
    this.localParc.validated = true;
    this.storage.set(this.parc.$key, JSON.stringify(this.localParc));

    console.log(this.parc);
    if(this.mode==='update'){
      var parcObject = this.db.object('positions/'+this.parc.$key);
      console.log(this.parc);
      parcObject.update(this.parc);
      console.log(this.parc.$key);
      this.gf.set(this.parc.$key, location).then(function() {
        this.ga.logEvent("parc_management", {"action":"update","parc_key":this.parc.$key});
      }.bind(this));
     

    }
    if(this.mode==='add'){
      if(this._auth.authenticated !==false ){
        this.parc.addedBy = this._auth.displayName();
        this.parc.addedByUid = this._auth.displayUid();
      }
      var newPosition = this.db.database.ref('positions').push();
      console.log(this.parc);
      newPosition.set(this.parc).then(console.log(newPosition.key));
      console.log(newPosition.$key);
      this.gf.set(newPosition.key, location).then(function() {
          console.log(newPosition.key);
          this.ga.logEvent("parc_management", {"action":"add","parc_key":this.parc.$key});
        }.bind(this));
          
    }
    
    this.closeModal(true);
  }
}
;