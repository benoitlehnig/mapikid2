import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { ParcDetailsPage } from '../pages/parc-details/parc-details';
import { DetailsRootPage } from '../pages/details-root/details-root';
import { ReviewsRootPage } from '../pages/reviews-root/reviews-root';


import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { Geolocation } from '@ionic-native/geolocation';

import {HttpModule,Http} from '@angular/http';
import {TranslateModule} from 'ng2-translate';
import { TranslateLoader, TranslateStaticLoader } from "ng2-translate/src/translate.service";
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { StarRatingModule } from 'angular-star-rating';

import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 LatLng,
 MarkerOptions,
 Marker
} from '@ionic-native/google-maps';

export const firebaseConfig = {
	apiKey: "AIzaSyBr7eaeJLc7iosJIBTBTmayxLeN9BvBJ48",
  	authDomain: "parcmap.firebaseapp.com",
  	databaseURL: "https://parcmap.firebaseio.com",
  	storageBucket: "parcmap.appspot.com"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
	ParcDetailsPage,
	DetailsRootPage,
	ReviewsRootPage
  ],
  imports: [
	BrowserModule,
	AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp),
	SplitPaneModule,
	AngularFireDatabaseModule,
	HttpModule,
	StarRatingModule,
	StarRatingModule.forRoot(),
    TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, './assets/i18n', '.json'),
            deps: [Http]
        })  ],
	  bootstrap: [IonicApp],
	  entryComponents: [
		 MyApp,
    HomePage,
    ListPage,
	ParcDetailsPage,
	DetailsRootPage,
	ReviewsRootPage
	],
	 exports: [
        TranslateModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
	GoogleMaps,
    TranslateModule,
	Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
