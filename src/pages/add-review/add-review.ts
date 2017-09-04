import { Component } from '@angular/core';
import { NavController, NavParams,ViewController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable,FirebaseObjectObservable } from 'angularfire2/database';
import {IStarRatingOnRatingChangeEven} from 'angular-star-rating';

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

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, public db: AngularFireDatabase) {
	this.reviews = db.list('positions/'+this.navParams.get('parc').$key+ '/reviews');
	this.parcObject = db.object('positions/'+this.navParams.get('parc').$key);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddReviewPage');
  }
  closeModal = function(){
  	this.viewCtrl.dismiss();
  }
  saveReview = function(){
  	var newReview= {
  		name: 'test',
		text: this.review.description,	
		uid: 'test',
		photoUrl: '/images/profile_placeholder.png',
		rate: this.review.rate
	};
  	this.reviews.push(newReview).then(
  		newReview  =>{
  			this.saveReviewAverageRate();
  		}	
  		);
 	}

 	onRatingChange = function($event:IStarRatingOnRatingChangeEven) {
        this.review.rate = $event.rating;
    }

 	saveReviewAverageRate = function(){
 		let averageRate:number = this.review.rate;
		let numberRate:number=1;
		this.reviews.subscribe(snapshots=>{
	        snapshots.forEach(snapshot => {
	          	console.log(snapshot);
	          	if(snapshot.rate){
					averageRate = snapshot.rate+averageRate;
					numberRate = numberRate+1;
	        	}
        	});
   		})
		
		averageRate = averageRate/numberRate;
		var newRate={'rate':averageRate, 'numberRate':numberRate};
		console.log(newRate);
		this.parcObject.update({rate:newRate}).then( 
			
			_ => this.closeModal()
		).catch(err => console.log(err, "Failed"));
 	}
}
