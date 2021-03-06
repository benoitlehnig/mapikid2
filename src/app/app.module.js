var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { ParcDetailsPage } from '../pages/parc-details/parc-details';
import { DetailsRootPage } from '../pages/details-root/details-root';
import { ReviewsRootPage } from '../pages/reviews-root/reviews-root';
import { UpdateParcPage } from '../pages/update-parc/update-parc';
import { FirstVisitPage } from '../pages/first-visit/first-visit';
import { NoNetworkPage } from '../pages/no-network/no-network';
import { AddReviewPage } from '../pages/add-review/add-review';
import { ContactPage } from '../pages/contact/contact';
import { LanguagePage } from '../pages/language/language';
import { LoginPage } from '../pages/login/login';
import { LegalMentionPage } from '../pages/legal-mention/legal-mention';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule } from 'ng2-translate';
import { TranslateLoader, TranslateStaticLoader } from "ng2-translate/src/translate.service";
import { AngularSplitModule } from 'angular-split';
import { StarRatingModule } from 'angular-star-rating';
import { AuthService } from '../providers/auth-service/auth-service';
import { MapService } from '../providers/map-service/map-service';
import { IonicPageModule } from 'ionic-angular';
import { AdMobFree } from '@ionic-native/admob-free';
import { GoogleMaps } from '@ionic-native/google-maps';
import { GoogleMapsClusterProvider } from '../providers/google-maps-cluster/google-maps-cluster';
import { OrderByDistancePipe } from '../pipes/order-by-distance/order-by-distance';
import { WeatherProvider } from '../providers/weather/weather';
export var firebaseConfig = {
    apiKey: "AIzaSyBr7eaeJLc7iosJIBTBTmayxLeN9BvBJ48",
    authDomain: "parcmap.firebaseapp.com",
    databaseURL: "https://parcmap.firebaseio.com",
    storageBucket: "parcmap.appspot.com"
};
export function createTranslateLoader(http) {
    return new TranslateStaticLoader(http, './assets/i18n', '.json');
}
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                MyApp,
                HomePage,
                ListPage,
                ParcDetailsPage,
                DetailsRootPage,
                ReviewsRootPage,
                UpdateParcPage,
                FirstVisitPage,
                AddReviewPage,
                ContactPage,
                LoginPage,
                LanguagePage,
                NoNetworkPage,
                LegalMentionPage,
                OrderByDistancePipe
            ],
            imports: [
                BrowserModule,
                AngularFireModule.initializeApp(firebaseConfig),
                AngularFireDatabaseModule,
                AngularFireAuthModule,
                IonicModule.forRoot(MyApp),
                IonicStorageModule.forRoot(),
                AngularSplitModule,
                IonicPageModule.forChild(DetailsRootPage),
                IonicPageModule.forChild(ReviewsRootPage),
                IonicPageModule.forChild(UpdateParcPage),
                AngularFireDatabaseModule,
                HttpModule,
                StarRatingModule,
                IonicPageModule.forChild(ParcDetailsPage),
                StarRatingModule.forRoot(),
                TranslateModule.forRoot({
                    provide: TranslateLoader,
                    useFactory: createTranslateLoader,
                    deps: [Http]
                })
            ],
            bootstrap: [IonicApp],
            entryComponents: [
                MyApp,
                HomePage,
                ListPage,
                ParcDetailsPage,
                DetailsRootPage,
                ReviewsRootPage,
                UpdateParcPage,
                FirstVisitPage,
                AddReviewPage,
                ContactPage,
                LanguagePage,
                LoginPage,
                LegalMentionPage,
                NoNetworkPage
            ],
            exports: [
                TranslateModule,
                DetailsRootPage,
                ParcDetailsPage,
                ReviewsRootPage,
                UpdateParcPage,
                ContactPage,
                LanguagePage,
                NoNetworkPage
            ],
            providers: [
                StatusBar,
                SplashScreen,
                TranslateModule,
                AuthService,
                MapService,
                Geolocation,
                { provide: ErrorHandler, useClass: IonicErrorHandler },
                GoogleMapsClusterProvider,
                GooglePlus,
                GoogleMaps,
                Facebook,
                Diagnostic,
                OpenNativeSettings,
                GoogleAnalytics,
                FirebaseAnalytics,
                AdMobFree,
                WeatherProvider
            ]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map