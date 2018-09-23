import { Component,ViewChild,Renderer,ElementRef } from '@angular/core';
import { NavController, NavParams,Tabs,Tab,ModalController,ToastController,Platform,App	   } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../providers/auth-service/auth-service';

import { Storage } from '@ionic/storage';
import {TranslateService} from 'ng2-translate';

import { DetailsRootPage } from '../details-root/details-root';
import { HomePage } from '../home/home';
import { ReviewsRootPage } from '../reviews-root/reviews-root';
import { UpdateParcPage } from '../update-parc/update-parc';
import { AddReviewPage } from '../add-review/add-review';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { LoginPage } from '../login/login';

import {timer} from 'rxjs/observable/timer';

/**
 * Generated class for the ParcDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-parc-details',
  templateUrl: 'parc-details.html',
})

export class ParcDetailsPage {
	
	@ViewChild('myTabs') tabRef: Tabs;
	@ViewChild('validateFabButton', {read:ElementRef}) validateFabButton;
	
	selectedTab =0;
	parcObject: FirebaseObjectObservable<any>;
	parc: {[k: string]: any} = {};
	detailsRootPage = DetailsRootPage;
	reviewsRootPage = ReviewsRootPage;
	userSigned: boolean=false;
	localParc:{[k: string]: any} = {'validated':false,'requestedForDeletion':false};
	toastLabelValidated :String= "";
	toastLabelDeleted:String = "";
	toastLabelUpdated:String = "";
	toastLabelAdded:String = "";
	firstReviews=[];
	map=null;
	login = LoginPage;
	parcKey:string="";
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform,
  	public db: AngularFireDatabase,public modalCtrl: ModalController, private storage: Storage,
  	public renderer:Renderer,
  	public afAuth: AngularFireAuth, private _auth: AuthService,private app: App,
  	public toastCtrl: ToastController,translate: TranslateService,private ga: FirebaseAnalytics) {
		console.log(navParams);
	
		this.parcObject = db.object('positions/'+this.navParams.get('key'));
		this.parcKey  = this.navParams.get('key');
		this.parcObject.subscribe(snapshot => {
	   		this.parc = snapshot;
	   		if(!this.parc.rate){
					this.parc.rate = {'rate': 0};
				}	
	   		
		});
		this.afAuth.auth.onAuthStateChanged(function(user) {
        	this.userSigned = this._auth.authenticated;
    	}.bind(this));
    	storage.get(this.parc.$key).then((val) => {
          	console.log(val);
          	if(val !==null){
          		this.localParc = JSON.parse(val);
         	}	
          	else{
           
          	}
        }).catch(function (err) {
        	// 	we got an error
          	console.log(err);
      	});

      	translate.get('parcDetails.SNACKBARLABELVALIDATED').subscribe((res: string) => {
			this.toastLabelValidated = res;
		});
		translate.get('parcDetails.SNACKBARLABELDELETED').subscribe((res: string) => {
			this.toastLabelDeleted = res;
		});
		translate.get('parcUpdate.TOASTPARCADDED').subscribe((res: string) => {
			this.toastLabelAdded = res;
		});
		translate.get('parcUpdate.TOASTPARCUPDATED').subscribe((res: string) => {
			this.toastLabelUpdated = res;
		});
		this.platform.ready().then(() => {
            this.ga.setCurrentScreen("Details Page " + this.navParams.get('key'));
        });
		
 	}

 	

	tabSelected(tab: Tab) {
		if(this.tabRef.getSelected() === this.tabRef.getByIndex(0)){
			this.selectedTab =0;
		}
		else{
			this.selectedTab =1;
		}
	}
  
	
		
  	openUpdateParcModal = function(){
  		if(this._auth.authenticated ===false ){
  			let myModal = this.modalCtrl.create(this.login);
    		myModal.present();
  		}
  		else{
  			let obj = {parc: this.parc};
  			let myModal = this.modalCtrl.create(UpdateParcPage,obj);
	  		myModal.onDidDismiss(data => {
	  			console.log("data",data);
	  			if(data ==='update'){
	  				this.localParc.validated = true;
	     		 	this.presentToast(this.toastLabelUpdated);
	  			}
	  			if(data ==='add'){
	  				this.localParc.validated = true;
	  				this.presentToast(this.toastLabelAdded);
	  			}
	   		});
	    	myModal.present();
  		}
  	}

  	

  	validate = function(){
		var validateIncreased = 0;
		if(this.parc.validationNumber){
			validateIncreased = this.parc.validationNumber;
		}
		validateIncreased = validateIncreased+1;
		this.parcObject.update({ validationNumber: validateIncreased });
		this.parcObject.update({ initialized: false });
		
	    this.storage.set(this.parc.$key, JSON.stringify(this.localParc));
	    this.presentToast(this.toastLabelValidated);
	    this.ga.logEvent("parc_management", {"action":"validate","parc_key":this.parc.$key});
	    console.log("this.validateFabButton",this.validateFabButton);
	    this.renderer.setElementStyle(this.validateFabButton.nativeElement,'bottom','-200px');
	    timer(3000).subscribe(()=>this.localParc.validated = true);
	}

	suggestRemove = function(){
		var removalIncreased = 0;
		if(this.parc.removalRequestNumber){
			removalIncreased = this.parc.removalRequestNumber;
		}
		this.ga.logEvent("parc_management", {"action":"removal request","parc_key":this.parc.$key});
		
		
		removalIncreased = removalIncreased+1;
		var canRemove = false;
		//if this is the same user who created it and no one else validated it
		console.log(this.parc.addedByUid,this._auth.displayUid() , this.parc.validationNumber,removalIncreased);
		if(this.parc.addedByUid === this._auth.displayUid() && this.parc.validationNumber === 1){
			console.log("can be removed : same user");
			canRemove = true;
		}
		//if this is the same user who created it and no one else validated it
		else if(this.parc.removalIncreased > 3){
			console.log("can be removed : more removal request than validation");
			canRemove = true;
		}
		//removal of the parc
		if(canRemove ===true){	
			console.log(this.parcObject);
			
			var geoFireObject = this.db.object('geofire/'+this.navParams.get('key'));
			geoFireObject.subscribe(snapshot => {
				console.log(snapshot);
				console.log(geoFireObject);
				
			});
			geoFireObject.remove();
			this.parcObject.remove().then(this.app.getActiveNav().setRoot(HomePage));			
		}
		else{
			this.parcObject.update({ removalRequestNumber: removalIncreased });
		}
		this.localParc.requestedForDeletion = true;
	    this.storage.set(this.parc.$key, JSON.stringify(this.localParc));
	    this.presentToast(this.toastLabelDeleted);

	}
	presentToast(message) {
	    let toast = this.toastCtrl.create({
	      message: message,
	      duration: 5000,
	      showCloseButton: true,
	      closeButtonText: "X",
	      position: 'top',
	      cssClass: "toastClass"
	    });
	    toast.present();
 	 }
	    
}
