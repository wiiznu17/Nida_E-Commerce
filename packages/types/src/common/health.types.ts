export type HealthOverallStatus = 'ok' | 'degraded' | 'error';

export type ServiceConnectionStatus = 'connected' | 'degraded' | 'disconnected';

export interface ApiHealthServiceStatus {
  status: ServiceConnectionStatus;
  latencyMs?: number;
  message?: string;
  configured?: boolean;
}

export interface ApiHealthCheckResponse {
  status: HealthOverallStatus;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  services: {
    database: ApiHealthServiceStatus;
    redis: ApiHealthServiceStatus;
    queue?: ApiHealthServiceStatus;
    mailer?: ApiHealthServiceStatus;
    storage?: ApiHealthServiceStatus;
  };
  memory?: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
}
