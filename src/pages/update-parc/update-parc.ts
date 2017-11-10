import { Component } from '@angular/core';
import { NavController, NavParams, ViewController,Platform } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase';
import GeoFire from 'geofire';
import { MapService } from '../../providers/map-service/map-service';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
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
            sandbox:  false
          },
          lessThan2years: false,
          between2and6: false,
          sixandPlus: false
    };
  
  constructor(public platform: Platform,public viewCtrl: ViewController,
    public navCtrl: NavController, public navParams: NavParams,
    public db: AngularFireDatabase,
    private _map:MapService, private ga: FirebaseAnalytics) {
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
              sandbox:false
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
      }
    }
    else{
      console.log(this.navParams.get('position'));
      console.log()
      this.parc.position =  {lat: this.navParams.get('position').lat(), lng: this.navParams.get('position').lng()} ;
    }
    console.log(this.parc);
   
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.loadMap();
      this.ga.setCurrentScreen("Update Page ");
      this.ga.logEvent("Update Parc Request", {"parc key":this.parc.$key});
    }); 
  }

  loadMap = function(){
    let element: HTMLElement = document.getElementById('mapUpdateDetail');
    this.map = this._map.createMapJDK(element,true,google.maps.MapTypeId.ROADMAP);
    if(this.mode==='add'){
      console.log(this.navParams.get('position'));
      this.parc.position =  {lat: this.navParams.get('position').lat(), lng: this.navParams.get('position').lng()} ;
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
    console.log(this.parc);
    if(this.mode==='update'){
      var parcObject = this.db.object('positions/'+this.parc.$key);
      console.log(this.parc);
      parcObject.update(this.parc);
      console.log(this.parc.$key);
      this.gf.set(this.parc.$key, location).then(function() {
        this.ga.logEvent("parc_management", {"action":"update","parc key":this.parc.$key});
      }.bind(this));
     

    }
    if(this.mode==='add'){
      var newPosition = this.db.database.ref('positions').push();
      console.log(this.parc);
      newPosition.set(this.parc).then(console.log(newPosition.key));
      console.log(newPosition.$key);
      this.gf.set(newPosition.key, location).then(function() {
          console.log(newPosition.key);
          this.ga.logEvent("parc_management", {"action":"add","parc key":this.parc.$key});
        }.bind(this));
          
    }
    
    this.closeModal(true);
  }

  

}
;