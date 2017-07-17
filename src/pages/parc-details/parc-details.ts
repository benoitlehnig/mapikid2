import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Tabs,Tab } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable,FirebaseObjectObservable } from 'angularfire2/database';
import { DetailsRootPage } from '../details-root/details-root';
import { ReviewsRootPage } from '../reviews-root/reviews-root';

/**
 * Generated class for the ParcDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
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
	numberOfEquipment = 0;
	isLowNumberofEquipment = true;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, db: AngularFireDatabase) {
	console.log(navParams);
	var parcObject = db.object('positions/'+this.navParams.get('key'));
	parcObject.subscribe(snapshot => {
	   this.parc = snapshot;
	   console.log(this.parc);
	   this.parc.reviewsLength = 0;
	   if(this.parc.reviews){ 
			this.parc.reviewsLength = Object.keys(this.parc.reviews).length;
		}
		this.setLowNumberofEquipment();
	});
	
	
  }
	tabSelected(tab: Tab) {
		console.log(tab);
		console.log(this.tabRef);
		if(this.tabRef.getSelected() === this.tabRef.getByIndex(0)){
			this.selectedTab =0;
		}
		else{
			this.selectedTab =1;
		}
		
		console.log(this.selectedTab);
	}
  
	setLowNumberofEquipment = function(){
			var isLowNumberofEquipment = true;
	
			if(this.parc.facilities){
				for(let facility of this.parc.facilities) {
					if(facility===true){
						this.numberOfEquipment++;
					}
				}
			}
			if(this.numberOfEquipment>1){this.isLowNumberofEquipment = false;}
 
		};
		

  ionViewDidLoad() {
	console.log('ionViewDidLoad ParcDetailsPage');
  }

}
