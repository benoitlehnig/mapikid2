import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailsRootPage } from './details-root';

@NgModule({
  declarations: [
    DetailsRootPage,
  ],
  imports: [
    IonicPageModule.forChild(DetailsRootPage),
  ],
  exports: [
    DetailsRootPage
  ]
})
export class DetailsRootPageModule {}
