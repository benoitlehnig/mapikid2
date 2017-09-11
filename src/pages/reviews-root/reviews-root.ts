import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';


/**
 * Generated class for the ReviewsRootPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-reviews-root',
  templateUrl: 'reviews-root.html',
})
export class ReviewsRootPage {

	reviews:FirebaseListObservable<any[]>;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,db: AngularFireDatabase) {
	console.log(navParams)
	this.reviews = db.list('positions/'+navParams.data.$key+ '/reviews');
	console.log(this.reviews);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReviewsRootPage');
  }

}
