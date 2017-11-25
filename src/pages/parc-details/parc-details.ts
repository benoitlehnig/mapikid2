import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams,Tabs,Tab,ModalController,ToastController,Platform   } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../providers/auth-service/auth-service';

import { Storage } from '@ionic/storage';
import {TranslateService} from 'ng2-translate';

import { DetailsRootPage } from '../details-root/details-root';
import { ReviewsRootPage } from '../reviews-root/reviews-root';
import { UpdateParcPage } from '../update-parc/update-parc';
import { AddReviewPage } from '../add-review/add-review';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { LoginPage } from '../login/login';


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
	map=null;
	login = LoginPage;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform,
  	db: AngularFireDatabase,public modalCtrl: ModalController, private storage: Storage,
  	public afAuth: AngularFireAuth, private _auth: AuthService,
  	public toastCtrl: ToastController,translate: TranslateService,private ga: FirebaseAnalytics) {
		console.log(navParams);
	
		this.parcObject = db.object('positions/'+this.navParams.get('key'));
		this.parcObject.subscribe(snapshot => {
	   		this.parc = snapshot;
	   		console.log(this.parc);
	   		this.parc.reviewsLength = 0;
	   		if(this.parc.reviews){ 
				this.parc.reviewsLength = Object.keys(this.parc.reviews).length;
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

	     		 this.presentToast(this.toastLabelUpdated);
	  			}
	  			if(data ==='add'){
	  				this.presentToast(this.toastLabelAdded);
	  			}
	   		});
	    	myModal.present();
  		}
  	}

  	openAddReviewModal = function(){
  		let obj = {parc: this.parc};
  		let myModal = this.modalCtrl.create(AddReviewPage,obj);
    	myModal.present();
  	}

  	validate = function(){
		var validateIncreased = 0;
		if(this.parc.validationNumber){
			validateIncreased = this.parc.validationNumber;
		}
		validateIncreased = validateIncreased+1;
		this.parcObject.update({ validationNumber: validateIncreased });
		this.parcObject.update({ initialized: false });
		this.localParc.validated = true;
	    this.storage.set(this.parc.$key, JSON.stringify(this.localParc));
	    this.presentToast(this.toastLabelValidated);
	    this.ga.logEvent("parc_management", {"action":"validate","parc key":this.parc.$key});
	}

	suggestRemove = function(){
		var removalIncreased = 0;
		if(this.parc.removalRequestNumber){
			removalIncreased = this.parc.removalRequestNumber;
		}
		this.ga.logEvent("parc_management", {"action":"removal request","parc key":this.parc.$key});
		removalIncreased = removalIncreased+1;
		//removal of the parc
		if(removalIncreased>5){	
			//$scope.positionRef.child($scope.parc.$key).remove();
			//$scope.geoFire.remove($scope.parc.$key).then($scope.closeParcDetails());
			
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
	      duration: 15000,
	      showCloseButton: true,
	      closeButtonText: "X"
	    });
	    toast.present();
 	 }
	    
}
