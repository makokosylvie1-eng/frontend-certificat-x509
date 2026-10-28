import { HttpInterceptorFn } from '@angular/common/http';
import { getStoredToken } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getStoredToken();

  if (token && req.url.includes('/api/')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};