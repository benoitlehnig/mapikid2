var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
/**
 * Generated class for the OrderByDistancePipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
var OrderByDistancePipe = /** @class */ (function () {
    function OrderByDistancePipe() {
    }
    OrderByDistancePipe.prototype.transform = function (items) {
        //console.log("orderByDistance");
        return items.slice(0, 25);
    };
    OrderByDistancePipe = __decorate([
        Pipe({
            name: 'orderbydistance',
        })
    ], OrderByDistancePipe);
    return OrderByDistancePipe;
}());
export { OrderByDistancePipe };
//# sourceMappingURL=order-by-distance.js.map