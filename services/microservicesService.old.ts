import axios from 'axios';
import { Logger } from '../src/utils/logger';
/**
 * Servicio para conectar el frontend con la arquitectura de microservicios
 * Este servicio permite al frontend comunicarse tanto con el monolito como con microservicios
 */

// URLs base para arquitectura 100% microservicios - REAL API GATEWAY
const MICROSERVICES_GATEWAY_URL = 'http://localhost:8080'; // Express API Gateway (Puerto 8080)
const GATEWAY_HEALTH_URL = `${MICROSERVICES_GATEWAY_URL}/health`;
const GATEWAY_STATUS_URL = `${MICROSERVICES_GATEWAY_URL}/gateway/status`;
const USER_SERVICE_URL = `${MICROSERVICES_GATEWAY_URL}/api/users`; // A través del API Gateway
const APPLICATION_SERVICE_URL = `${MICROSERVICES_GATEWAY_URL}/api/applications`;
const AUTH_SERVICE_URL = `${MICROSERVICES_GATEWAY_URL}/api/auth`;

export interface MicroserviceStatus {
  service: string;
  status: 'UP' | 'DOWN';
  url: string;
  message: string;
  architecture: 'monolith' | 'microservices';
}

export interface ServiceInfo {
  service: string;
  version: string;
  architecture: string;
  description: string;
  endpoints?: string[];
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  service: string;
}

export class MicroservicesService {
  private static instance: MicroservicesService;
  private currentMode: 'microservices' = 'microservices'; // Solo microservicios

  public static getInstance(): MicroservicesService {
    if (!MicroservicesService.instance) {
      MicroservicesService.instance = new MicroservicesService();
    }
    return MicroservicesService.instance;
  }

  /**
   * Detectar disponibilidad de microservicios
   */
  async detectArchitecture(): Promise<'microservices' | 'unavailable'> {
    try {
      Logger.info('🔍 Detectando microservicios disponibles...');
      
      const microservicesStatus = await Promise.allSettled([
        this.checkGatewayHealth(),
        this.checkMicroservicesHealth()
      ]);

      const gatewayAvailable = microservicesStatus[0].status === 'fulfilled';
      const servicesAvailable = microservicesStatus[1].status === 'fulfilled';

      Logger.info('📊 Estado de microservicios:', {
        gateway: gatewayAvailable ? '✅' : '❌',
        servicios: servicesAvailable ? '✅' : '❌'
      });

      if (gatewayAvailable || servicesAvailable) {
        return 'microservices';
      } else {
        throw new Error('Microservicios no disponibles');
      }
    } catch (error) {
      Logger.error('❌ Error detectando microservicios:', error);
      return 'unavailable';
    }
  }

  /**
   * Verificar salud del API Gateway
   */
  async checkGatewayHealth(): Promise<MicroserviceStatus> {
    try {
      const response = await axios.get(GATEWAY_HEALTH_URL, { timeout: 5000 });
      return {
        service: 'api-gateway',
        status: 'UP',
        url: MICROSERVICES_GATEWAY_URL,
        message: response.data.status || 'API Gateway is running',
        architecture: 'microservices'
      };
    } catch (error) {
      throw {
        service: 'api-gateway',
        status: 'DOWN',
        url: MICROSERVICES_GATEWAY_URL,
        message: 'API Gateway is not available',
        architecture: 'microservices'
      };
    }
  }

  /**
   * Verificar salud de los microservicios
   */
  async checkMicroservicesHealth(): Promise<MicroserviceStatus[]> {
    const services = [
      { name: 'user-service', url: USER_SERVICE_DIRECT_URL },
      { name: 'application-service', url: APPLICATION_SERVICE_DIRECT_URL },
      { name: 'evaluation-service', url: EVALUATION_SERVICE_DIRECT_URL },
      { name: 'notification-service', url: NOTIFICATION_SERVICE_DIRECT_URL }
    ];

    const statuses: MicroserviceStatus[] = [];

    for (const service of services) {
      try {
        const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
        statuses.push({
          service: service.name,
          status: 'UP',
          url: service.url,
          message: response.data.message || `${service.name} is running`,
          architecture: 'microservices'
        });
      } catch (error) {
        statuses.push({
          service: service.name,
          status: 'DOWN',
          url: service.url,
          message: `${service.name} is not available`,
          architecture: 'microservices'
        });
      }
    }

    return statuses;
  }

  /**
   * Obtener información de todos los servicios
   */
  async getServicesInfo(): Promise<ServiceInfo[]> {
    const services: ServiceInfo[] = [];

    try {
      // Información del User Service (microservicio)
      const userServiceInfo = await axios.get(`${USER_SERVICE_DIRECT_URL}/info`, { timeout: 5000 });
      services.push(userServiceInfo.data);
    } catch (error) {
      Logger.warn('⚠️ No se pudo obtener información del User Service');
    }

    // Información del monolito (si está disponible)
    try {
      services.push({
        service: 'monolith',
        version: '1.0.0',
        architecture: 'monolith',
        description: 'Monolithic backend service',
        endpoints: ['/api/auth', '/api/applications', '/api/interviews', '/api/evaluations']
      });
    } catch (error) {
      Logger.warn('⚠️ Monolito no disponible');
    }

    return services;
  }

  /**
   * Obtener usuarios desde el microservicio
   */
  async getUsersFromMicroservice(): Promise<UserData[]> {
    try {
      Logger.info('👥 Obteniendo usuarios del microservicio...');
      const response = await axios.get(`${USER_SERVICE_DIRECT_URL}/demo-users`);
      Logger.info('✅ Usuarios obtenidos del microservicio:', response.data);
      return response.data;
    } catch (error) {
      Logger.error('❌ Error obteniendo usuarios del microservicio:', error);
      throw new Error('No se pudieron obtener usuarios del microservicio');
    }
  }

  /**
   * Probar conexión con microservicio
   */
  async testMicroserviceConnection(data: any = {}): Promise<any> {
    try {
      Logger.info('🧪 Probando conexión con microservicio...');
      const response = await axios.post(`${USER_SERVICE_DIRECT_URL}/test-connection`, {
        ...data,
        from: 'frontend',
        timestamp: new Date().toISOString(),
        testData: 'Connection test from React frontend'
      });
      Logger.info('✅ Conexión con microservicio exitosa:', response.data);
      return response.data;
    } catch (error) {
      Logger.error('❌ Error en conexión con microservicio:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del microservicio
   */
  async getMicroserviceStats(): Promise<any> {
    try {
      Logger.info('📊 Obteniendo estadísticas del microservicio...');
      const response = await axios.get(`${USER_SERVICE_DIRECT_URL}/stats`);
      Logger.info('✅ Estadísticas del microservicio:', response.data);
      return response.data;
    } catch (error) {
      Logger.error('❌ Error obteniendo estadísticas del microservicio:', error);
      throw error;
    }
  }

  /**
   * Obtener modo actual (siempre microservicios)
   */
  getCurrentMode(): 'microservices' {
    return this.currentMode;
  }

  /**
   * Obtener URL base del API Gateway
   */
  getBaseUrl(): string {
    return MICROSERVICES_GATEWAY_URL;
  }

  /**
   * Obtener URL del API Gateway (puerto único para el frontend)
   */
  getGatewayUrl(): string {
    return MICROSERVICES_GATEWAY_URL;
  }

  /**
   * Verificar si los microservicios están disponibles
   */
  async areMicroservicesAvailable(): Promise<boolean> {
    try {
      await this.checkMicroservicesHealth();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener dashboard de estado de todos los servicios
   */
  async getServicesDashboard(): Promise<{
    architecture: string;
    services: MicroserviceStatus[];
    recommendations: string[];
  }> {
    const services: MicroserviceStatus[] = [];
    const recommendations: string[] = [];

    // Verificar API Gateway
    try {
      const gatewayStatus = await this.checkGatewayHealth();
      services.push(gatewayStatus);
      recommendations.push('✅ API Gateway funcionando - punto de entrada único para el frontend');
    } catch (error: any) {
      services.push(error);
      recommendations.push('⚠️ API Gateway no disponible - verificar que Docker esté ejecutándose');
    }

    // Verificar microservicios
    try {
      const microservicesStatus = await this.checkMicroservicesHealth();
      services.push(...microservicesStatus);
      
      const upServices = microservicesStatus.filter(s => s.status === 'UP').length;
      const totalServices = microservicesStatus.length;
      
      if (upServices === totalServices) {
        recommendations.push('🎉 Todos los microservicios están funcionando correctamente');
      } else if (upServices > 0) {
        recommendations.push(`⚠️ ${upServices}/${totalServices} microservicios funcionando - verificar servicios inactivos`);
      } else {
        recommendations.push('❌ Ningún microservicio está funcionando - verificar Docker Compose');
      }
    } catch (error: any) {
      recommendations.push('❌ Error verificando microservicios - ejecutar start-microservices-only.sh');
    }

    const architecture = await this.detectArchitecture();

    return {
      architecture,
      services,
      recommendations
    };
  }
}

// Instancia singleton
export const microservicesService = MicroservicesService.getInstance();