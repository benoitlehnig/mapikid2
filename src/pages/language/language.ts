import { Component } from '@angular/core';
import { NavController, NavParams,ViewController } from 'ionic-angular';
import {TranslateService,LangChangeEvent} from 'ng2-translate';

/**
 * Generated class for the LanguagePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-language',
  templateUrl: 'language.html',
})
export class LanguagePage {
	currentLanguage:String="";
  constructor(public navCtrl: NavController, public navParams: NavParams,
  	public viewCtrl: ViewController,public translate: TranslateService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LanguagePage');
    this.currentLanguage = this.translate.currentLang;
  }

  changelanguage(langKey) {
  	console.log("change  language");
    this.translate.use(langKey);
    
  }
  close(){
  	this.viewCtrl.dismiss();
  }

}
