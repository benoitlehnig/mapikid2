import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
/*
  Generated class for the WeatherProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class WeatherProvider {
	private appId ='7cd81b269002515c16b42c71e074c4a6';
	private baseUrl ='http://api.openweathermap.org/data/2.5/';
  	

  	constructor(public http: Http) {
   	
  	}

  	city(city: string, country: string){
      	let url = this.baseUrl + 'weather';
      	url+= '?q=' +city;
      	url+=',' +country;
      	url+='&appid=' + this.appId;
      	url+='&units=metric';
   		return this.http.get(url);
  	}
    uvIndex(lat: string , lon:string){
      let url = this.baseUrl +'uvi';
      url+= `?lat=${lat}&lon=${lon}`;
      url+= '&appid=' +this.appId;
      return this.http.get(url);
    }
    pollution(lat: string , lon:string){
      let url = "http://api.openweathermap.org/pollution/v1/co";
      url+= `/${lat},${lon}`;
      url+= '/current';
      url+= '?appid=' +this.appId;
      return this.http.get(url);
    }
  
  	forecastGeographicCoordinates(lat: string , lon:string , numbOfDays:number){

    	let url = this.baseUrl + 'forecast';
    	url+= `?lat=${lat}&lon=${lon}`;
    	url+= '&cnt=' + numbOfDays;
    	url+= '&appid=' + this.appId;
    	url+= '&units=metric';
    	return this.http.get(url);
  	}
  	geographicCoordinates(lat: string , lon:string){

    	let url = this.baseUrl +'weather';
   		url+= `?lat=${lat}&lon=${lon}`;
    	url+= '&appid=' +this.appId;
    	url+= '&units=metric';
    	return this.http.get(url);
  	}
}
