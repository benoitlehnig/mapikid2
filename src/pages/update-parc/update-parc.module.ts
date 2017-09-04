import { NgModule,Component } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateParcPage } from './update-parc';

@NgModule({
  declarations: [
    UpdateParcPage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateParcPage),
  ],
  exports: [
    UpdateParcPage
  ]
})
export class UpdateParcPageModule {}
