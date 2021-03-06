import { Component } from '@angular/core';
import { NavController, NavParams,ViewController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable,FirebaseObjectObservable } from 'angularfire2/database';
import {IStarRatingOnRatingChangeEven} from 'angular-star-rating';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { AuthService } from '../../providers/auth-service/auth-service';
import * as moment from 'moment';
/**
 * Generated class for the AddReviewPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-add-review',
  templateUrl: 'add-review.html',
})
export class AddReviewPage {
	reviews:FirebaseListObservable<any[]>;
	review:any={'rate' :0, 'description':""};
	parcObject: FirebaseObjectObservable<any>;
	photoUrl:string="";
	userName:string="";
	date = moment().format('YYYY-MM-DDTHH:mmZ');  

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, 
  	public navParams: NavParams, public db: AngularFireDatabase,
  	private ga: FirebaseAnalytics,private _auth: AuthService) {
	
	this.reviews = db.list('reviews/'+this.navParams.get('parc').$key);
	this.photoUrl = this._auth.displayPicture();
	this.userName = this._auth.displayName();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddReviewPage');
    this.ga.setCurrentScreen("Add Review Page");
  }
  closeModal = function(){
  	this.viewCtrl.dismiss();
  }
  saveReview = function(){
  	var newReview= {
  		name: this._auth.displayName(),
		text: this.review.description,	
		uid: this._auth.displayUid(),
		photoUrl: this._auth.displayPicture(),
		rate: this.review.rate,
		date: this.date
	};
	this.ga.logEvent("parc_management", 
		{"action": "Add_review", "parc_key": this.navParams.get('parc').$key, "review": this.review.description}
	);
  	this.reviews.push(newReview).then(
  		newReview  =>{
  			this.closeModal();
  		});
 	}

 	onRatingChange = function($event:IStarRatingOnRatingChangeEven) {
        this.review.rate = $event.rating;
    }
}
