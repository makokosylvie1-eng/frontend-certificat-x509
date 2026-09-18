import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificatService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/certificates';

  parseCertificate(certPem: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/parse`, { certificate: certPem });
  }
}