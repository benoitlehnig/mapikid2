import { NgModule,Component } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReviewsRootPage } from './reviews-root';

@NgModule({
  declarations: [
    ReviewsRootPage,
  ],
  imports: [
    IonicPageModule.forChild(ReviewsRootPage),
  ],
  exports: [
    ReviewsRootPage
  ]
})
export class ReviewsRootPageModule {}
