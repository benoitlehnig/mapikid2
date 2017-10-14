import { Component } from '@angular/core';
import { NavController, NavParams ,Platform} from 'ionic-angular';
import { DatePipe } from '@angular/common';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AuthService } from '../../providers/auth-service/auth-service';
import { AngularFireDatabase } from 'angularfire2/database';
/**
 * Generated class for the ContactPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
  providers: [DatePipe]
})
export class ContactPage {

	userName:string="";
	message:string="";
	phone:string="";
	email:string="";

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	public db: AngularFireDatabase,private platform: Platform,
  	private ga: GoogleAnalytics,private _auth: AuthService,private datePipe: DatePipe) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactPage');
    this.ga.trackView("Contact Us");
  }

  saveFeedback = function(){
	    var userName ="anonymous";
	    var userAgent ="";
	    if(this.platform.ready()) {
	    	userAgent =  this.platform.platforms();
	    }
	    
	    if (this._auth.authenticated) {
	    	userName =  this._auth.displayName();
	    }
	    var newFeedback = this.db.database.ref('feedback').push();
	    var feedback = {
	      name: userName,
	      email: this.email,
	      phone: this.phone,
	      text: this.message,
	      date : this.datePipe.transform(new Date(),' yyyy-MM-ddTHH:mmZ'),
	      userAgent:  userAgent
	    };
	    newFeedback.set(feedback).then(() => {
	    	this.message ="";
	    	this.ga.trackEvent("SendComment", "SendComment", this.message);
	    	}
	    );
	};

}
