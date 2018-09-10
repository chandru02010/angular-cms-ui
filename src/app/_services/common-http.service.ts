import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommonHttpService {

  constructor(private http: HttpClient) { }

  getContactGroup(obj):Observable<any> {
    return this.http.get<any>(obj.url)
    .pipe(
      catchError(this.errorHandler)
    );

  }
  errorHandler(error: HttpErrorResponse) {
    return throwError(error || 'Server Error');
  }
}
