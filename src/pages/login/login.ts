import { Component } from '@angular/core';
import { NavController, NavParams,ViewController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service/auth-service';

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private _auth: AuthService,public viewCtrl: ViewController,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
  signInWithFacebook(): void {
    this._auth.signInWithFacebook();
    this.viewCtrl.dismiss();
  }
  
  close(){
  	this.viewCtrl.dismiss();
  }
}
