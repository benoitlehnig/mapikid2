import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParcDetailsPage } from './parc-details';

@NgModule({
  declarations: [
    ParcDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ParcDetailsPage),
  ],
  exports: [
    ParcDetailsPage
  ]
})
export class ParcDetailsPageModule {}
