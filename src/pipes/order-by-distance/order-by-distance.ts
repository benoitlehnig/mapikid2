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

  	var filtered = [];
  	if(items){
  		for(let item of items){
       		filtered.push(item);
    	};
    	filtered.sort(function (a, b) {
        	return ( parseFloat(a['distance']) >  parseFloat(b['distance']) ? 1 : -1);
    	});	 
  	}

    return items.slice(0,10);
  }
}
