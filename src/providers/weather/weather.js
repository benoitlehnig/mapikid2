var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
/*
  Generated class for the WeatherProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
var WeatherProvider = /** @class */ (function () {
    function WeatherProvider(http) {
        this.http = http;
        this.appId = '7cd81b269002515c16b42c71e074c4a6';
        this.baseUrl = 'http://api.openweathermap.org/data/2.5/';
    }
    WeatherProvider.prototype.city = function (city, country) {
        var url = this.baseUrl + 'weather';
        url += '?q=' + city;
        url += ',' + country;
        url += '&appid=' + this.appId;
        url += '&units=metric';
        return this.http.get(url);
    };
    WeatherProvider.prototype.uvIndex = function (lat, lon) {
        var url = this.baseUrl + 'uvi';
        url += "?lat=" + lat + "&lon=" + lon;
        url += '&appid=' + this.appId;
        return this.http.get(url);
    };
    WeatherProvider.prototype.pollution = function (lat, lon) {
        var url = "http://api.openweathermap.org/pollution/v1/co";
        url += "/" + lat + "," + lon;
        url += '/current';
        url += '?appid=' + this.appId;
        return this.http.get(url);
    };
    WeatherProvider.prototype.forecastGeographicCoordinates = function (lat, lon, numbOfDays) {
        var url = this.baseUrl + 'forecast';
        url += "?lat=" + lat + "&lon=" + lon;
        url += '&cnt=' + numbOfDays;
        url += '&appid=' + this.appId;
        url += '&units=metric';
        return this.http.get(url);
    };
    WeatherProvider.prototype.geographicCoordinates = function (lat, lon) {
        var url = this.baseUrl + 'weather';
        url += "?lat=" + lat + "&lon=" + lon;
        url += '&appid=' + this.appId;
        url += '&units=metric';
        return this.http.get(url);
    };
    WeatherProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], WeatherProvider);
    return WeatherProvider;
}());
export { WeatherProvider };
//# sourceMappingURL=weather.js.map