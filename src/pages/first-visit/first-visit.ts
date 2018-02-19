import { Component } from '@angular/core';
import { NavController, NavParams,App } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { HomePage } from '../home/home';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
/**
 * Generated class for the FirstVisitPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-first-visit',
  templateUrl: 'first-visit.html',
})
export class FirstVisitPage {

	numberOfParcs = 0;
 	
 	constructor(public navCtrl: NavController, public navParams: NavParams,private app: App,
     db: AngularFireDatabase,private ga: FirebaseAnalytics) {
  		var statistics = db.object('statistics/numberOfParcs');
		  statistics.subscribe(snapshot => {

	   		this.numberOfParcs = snapshot.$value;
		});
	
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FirstVisitPage');
    this.ga.setCurrentScreen("First_Visit_Page");
  }
  close = function(){
  	this.app.getActiveNav().setRoot(HomePage);
    this.ga.logEvent("First_Visit_Page", {"action": "close"});
  }

}
