import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the OrderByDistancePipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'orderbydistance',
})
export class OrderByDistancePipe implements PipeTransform {
  
  transform(items) {
  	//console.log("orderByDistance");

    return items.slice(0,25);
  }
}
