import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

import {ParcDetailsPage} from '../parc-details/parc-details';
import { AuthService } from '../../providers/auth-service/auth-service';


/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  profileObject: FirebaseObjectObservable<any>;
  profile: {[k: string]: any} = {};
  pictureUrl:string;
  displayName:string;
  displayEmail:string;
  reviews:any[] = [];
  numberOfPlaygroundsUpdated:0;
  numberOfPlaygroundsAdded:0;
  addedPlaygrounds :any[]=[];
  updatedPlaygrounds :any[]=[];
  parcDetails = ParcDetailsPage;
  score = 0;
  scorePercentile = 3;

  constructor(public navCtrl: NavController, public navParams: NavParams,private _auth: AuthService, public db: AngularFireDatabase) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
    this.profileObject = this._auth.getProfile();
    
    this.profileObject.subscribe(snapshot => {
    	console.log(snapshot);
    	this.profile = snapshot;
    	this.pictureUrl = this._auth.displayPicture();
    	this.displayName = this._auth.displayName();
    	this.displayEmail = this._auth.displayEmail();
    	if(this.profile.updatedPlaygrounds){
    		Object.keys(this.profile.updatedPlaygrounds).forEach((prop) => { 
    			console.log(this.profile.updatedPlaygrounds[prop]);
    			var item ={
    				playgroundId: this.profile.updatedPlaygrounds[prop].key,
    				name:"",
    				date:""
    			}
    			if(this.profile.updatedPlaygrounds[prop].date){
    				item.date = this.profile.updatedPlaygrounds[prop].date;
    			}
    			var playground = this.db.object('positions/'+item.playgroundId);
	  			playground.subscribe(snapshot => {
	  				if(snapshot.$value !==null){
	  					item.name = snapshot.name;
	  					this.updatedPlaygrounds.push(item);
              this.computeScore();
	  				}
	  			});
    			
    		});
		  }
  		if(this.profile.addedPlaygrounds){
  			Object.keys(this.profile.addedPlaygrounds).forEach((prop) => { 
      			console.log("addedPlaygrounds",this.profile.addedPlaygrounds[prop]);
      			var item ={
      				playgroundId: this.profile.addedPlaygrounds[prop].key,
      				name:"",
      				date:""
      			}
      			if(this.profile.addedPlaygrounds[prop].date){
      				item.date = this.profile.addedPlaygrounds[prop].date;
      			}
      			var playground = this.db.object('positions/'+item.playgroundId);
  	  			playground.subscribe(snapshot => {
  	  				if(snapshot.$value !==null){
  	  					item.name = snapshot.name;
  	  					this.addedPlaygrounds.push(item);

                this.computeScore();
  	  				}
  	  				
  	  			});
      			

      	});	
  		}

    	this.formatReviews();
      
    });
  }

  computeScore(){
    var settingScore = this.db.object('settings/score');
      settingScore.subscribe(snapshot => {
        console.log("computeScore",this.reviews.length,this.addedPlaygrounds.length , this.updatedPlaygrounds.length);
        var maxScore = snapshot.maxScore;
        var weightAdded = snapshot.weightAdded;
        var weightUpdated = snapshot.weightUpdated;
        var weightReview = snapshot.weightReview;
        this.score = weightReview*this.reviews.length + weightUpdated*this.updatedPlaygrounds.length + weightAdded*this.addedPlaygrounds.length;
        this.scorePercentile = Math.round(100*this.score/maxScore);
        console.log(this.scorePercentile,this.scorePercentile);
    });
  }

	formatReviews() {
  	if(this.profile.reviews){
  		Object.keys(this.profile.reviews).forEach((prop) => { 
  			console.log(this.profile.reviews[prop],this.profile.reviews[prop].length,prop);
  			var reviewPlayground = {
  				playgroundId : prop,
  				name:"",
  				reviews : this.profile.reviews[prop],
  				reviewsArray:[]
  			}
  			var playground = this.db.object('positions/'+reviewPlayground.playgroundId);
  			playground.subscribe(snapshot => {
  				if(snapshot.$value !==null){
  					reviewPlayground.name = snapshot.name;
  					Object.keys(reviewPlayground.reviews).forEach((prop2) => { 
  						reviewPlayground.reviewsArray.push(reviewPlayground.reviews[prop2]);
  					});
  					this.reviews.push(reviewPlayground);
            this.computeScore();
  				}
  			});
  			
  		});
		
  	}
	}

}
