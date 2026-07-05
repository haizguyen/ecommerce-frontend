import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { environment } from '../environments/environment';
import { mockBackendInterceptor } from './mock/mock-backend.interceptor';

/**
 * The mock interceptor is only registered when the mock build configuration is
 * active (environment.useMockData === true, via file replacement). Normal and
 * production builds get a plain HttpClient that talks to the real /api gateway,
 * so no component code needs to change to switch modes.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(...(environment.useMockData ? [withInterceptors([mockBackendInterceptor])] : []))
  ]
};
