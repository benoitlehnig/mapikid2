import { Component } from '@angular/core';
import { NavController, NavParams ,Platform,ToastController} from 'ionic-angular';
import { DatePipe } from '@angular/common';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { AuthService } from '../../providers/auth-service/auth-service';
import { AngularFireDatabase } from 'angularfire2/database';
import {TranslateService} from 'ng2-translate';
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
	toastLabelSent="";

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	public db: AngularFireDatabase,private platform: Platform,translate: TranslateService,
  	private ga: FirebaseAnalytics,public toastCtrl: ToastController,
  	 private _auth: AuthService,private datePipe: DatePipe) {

  	translate.get('feedback.FEEDBACKSENT').subscribe((res: string) => {
			this.toastLabelSent = res;
		});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactPage');
    this.ga.setCurrentScreen("Contact Us");
  }

  saveFeedback = function(){
	    var userName ="anonymous";
	    var userAgent ="";
	    if(this.platform.ready()) {
	    	userAgent =  this.platform.platforms();
	    }
	    
	    if(this._auth.authenticated) {
	    	userName =  this._auth.displayName();
	    }
	    var feedbackList = this.db.list('feedback');
	    var feedback = {
	      name: userName,
	      email: this.email,
	      phone: this.phone,
	      text: this.message,
	      date : this.datePipe.transform(new Date(),' yyyy-MM-ddTHH:mmZ'),
	      userAgent:  userAgent
	    };
	    feedbackList.push(feedback).then(() => {
	    	this.ga.logEvent("SendComment", {"action" : "SendComment", "message": this.message});
	    	this.message ="";
		    let toast = this.toastCtrl.create({
		      	message: this.toastLabelSent,
		      	duration: 15000,
		        showCloseButton: true,
		        closeButtonText: "X"
		    });
		    toast.present();
 	 
	    });
	};

}
