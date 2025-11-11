/**
 * Servicio API del Congreso Chileno
 * Implementación en JavaScript de la API de Datos Abiertos del Congreso
 * Equivalente a CongressAPIClient en Python
 */

import axios from "axios";
import { XMLParser } from "fast-xml-parser";

class CongressAPIService {
  constructor() {
    this.BASE_URL = "https://opendata.camara.cl/camaradiputados/WServices";
    this.logs = [];
    this.requestCount = 0;
    this.failedCount = 0;

    // Configurar axios
    this.client = axios.create({
      timeout: 30000,
      headers: {
        "User-Agent": "CongresoChileApp/1.0",
      },
    });
  }

  /**
   * Registrar mensaje en el log
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.logs.push(logEntry);
    console.log(`[${timestamp}] ${level}: ${message}`);

    // Mantener solo los últimos 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  /**
   * Obtener estadísticas de peticiones
   */
  getRequestStats() {
    const tasaExito =
      this.requestCount > 0
        ? ((this.requestCount - this.failedCount) / this.requestCount) * 100
        : 0;

    return {
      peticiones_totales: this.requestCount,
      peticiones_fallidas: this.failedCount,
      tasa_exito: tasaExito.toFixed(1),
    };
  }

  /**
   * Obtener logs recientes
   */
  getRecentLogs(count = 20) {
    return this.logs.slice(-count);
  }

  /**
   * Realizar petición HTTP GET a la API
   */
  async _makeRequest(service, method, params = {}) {
    const url = `${this.BASE_URL}/${service}.asmx/${method}`;
    const startTime = Date.now();

    this.log("INFO", `Realizando petición a ${service}/${method}`);
    this.log("DEBUG", `URL: ${url}`);
    this.log("DEBUG", `Parámetros: ${JSON.stringify(params)}`);

    this.requestCount++;

    try {
      const response = await this.client.get(url, { params });
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(3);

      this.log(
        "INFO",
        `Petición completada en ${elapsedTime}s - Estado: ${response.status}`
      );
      this.log("DEBUG", `Tamaño de respuesta: ${response.data.length} bytes`);

      // Parsear XML a JSON
      const jsonData = await this._parseXML(response.data);
      this.log("DEBUG", `Respuesta XML parseada exitosamente`);
      this.log("DEBUG", `Datos parseados: ${jsonData}...`);
      console.log(jsonData);
      return jsonData;
    } catch (error) {
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(3);
      this.failedCount++;

      this.log(
        "ERROR",
        `Petición falló después de ${elapsedTime}s: ${error.message}`
      );
      this.log("ERROR", `URL fallida: ${url}`);

      throw error;
    }
  }

  /**
   * Parsear XML a JSON
   */
  async _parseXML(xml) {
    try {
      const parser = new XMLParser({
        ignoreAttributes: true,
        removeNSPrefix: true, // Remover namespaces
        parseTagValue: true,
        parseAttributeValue: false,
        trimValues: true,
      });
      const result = parser.parse(xml);
      return result;
    } catch (error) {
      throw new Error(`Error parseando XML: ${error.message}`);
    }
  }

  /**
   * Extraer array de datos de la respuesta XML parseada
   */
  _extractArray(data, key) {
    if (!data) return [];

    const root = data[Object.keys(data)[0]];
    console.log(root);
    if (!root || !root[key]) return [];

    const items = root[key];
    return Array.isArray(items) ? items : [items];
  }

  // ==================== LEGISLADORES (DIPUTADOS) ====================

  /**
   * Obtener todos los legisladores actuales
   */
  async getCurrentLegislators() {
    const data = await this._makeRequest(
      "WSDiputado",
      "retornarDiputadosPeriodoActual"
    );
    return data.DiputadosPeriodoColeccion.DiputadoPeriodo;
  }

  /**
   * Obtener detalles de un legislador específico
   */
  async getLegislator(legislatorId) {
    const data = await this._makeRequest("WSDiputado", "retornarDiputado", {
      prmDiputadoId: legislatorId,
    });
    return data;
  }

  /**
   * Obtener legisladores por período
   */
  async getLegislatorsByPeriod(periodId) {
    const data = await this._makeRequest(
      "WSDiputado",
      "retornarDiputadosXPeriodo",
      {
        prmPeriodoId: periodId,
      }
    );
    return this._extractArray(data, "Diputado");
  }

  // ==================== PROYECTOS DE LEY ====================

  /**
   * Obtener detalles de un proyecto de ley
   */
  async getBill(billId) {
    const data = await this._makeRequest(
      "WSLegislativo",
      "retornarProyectoLey",
      {
        prmProyectoId: billId,
      }
    );
    return data;
  }

  /**
   * Obtener votaciones por proyecto de ley
   */
  async getVotesByBill(billId) {
    const data = await this._makeRequest(
      "WSLegislativo",
      "retornarVotacionesXProyectoLey",
      {
        prmProyectoId: billId,
      }
    );
    return this._extractArray(data, "Votacion");
  }

  /**
   * Obtener votaciones por año
   */
  async getVotesByYear(year) {
    const data = await this._makeRequest(
      "WSLegislativo",
      "retornarVotacionesXAnno",
      {
        prmAnno: year.toString(),
      }
    );
    return this._extractArray(data, "Votacion");
  }

  /**
   * Obtener detalle de una votación
   */
  async getVoteDetail(voteId) {
    const data = await this._makeRequest(
      "WSLegislativo",
      "retornarVotacionDetalle",
      {
        prmVotacionId: voteId.toString(),
      }
    );
    return data;
  }

  // ==================== COMISIONES ====================

  /**
   * Obtener comisiones activas
   */
  async getActiveCommittees() {
    const data = await this._makeRequest(
      "WSComision",
      "retornarComisionesVigentes"
    );
    return this._extractArray(data, "Comision");
  }

  /**
   * Obtener detalles de una comisión
   */
  async getCommittee(committeeId) {
    const data = await this._makeRequest("WSComision", "retornarComision", {
      prmComisionId: committeeId.toString(),
    });
    return data;
  }

  /**
   * Obtener sesiones de comisión por año
   */
  async getCommitteeSessions(committeeId, year) {
    const data = await this._makeRequest(
      "WSComision",
      "retornarSesionesXComisionYAnno",
      {
        prmComisionId: committeeId.toString(),
        prmAnno: year.toString(),
      }
    );
    return this._extractArray(data, "Sesion");
  }

  // ==================== SESIONES PLENARIAS ====================

  /**
   * Obtener sesiones plenarias por año
   */
  async getPlenarySessionsByYear(year) {
    const data = await this._makeRequest("WSSala", "retornarSesionesXAnno", {
      prmAnno: year.toString(),
    });
    return this._extractArray(data, "Sesion");
  }

  /**
   * Obtener asistencia de una sesión
   */
  async getSessionAttendance(sessionId) {
    const data = await this._makeRequest("WSSala", "retornarSesionAsistencia", {
      prmSesionId: sessionId.toString(),
    });
    return data;
  }

  // ==================== INFORMACIÓN LEGISLATIVA ====================

  /**
   * Obtener período legislativo actual
   */
  async getCurrentLegislativePeriod() {
    const data = await this._makeRequest(
      "WSLegislativo",
      "retornarPeriodoLegislativoActual"
    );
    return data;
  }

  /**
   * Obtener legislatura actual
   */
  async getCurrentLegislature() {
    const data = await this._makeRequest(
      "WSLegislativo",
      "retornarLegislaturaActual"
    );
    return data;
  }

  /**
   * Obtener materias legislativas
   */
  async getLegislativeMatters() {
    const data = await this._makeRequest("WSLegislativo", "retornarMaterias");
    return this._extractArray(data, "Materia");
  }

  /**
   * Obtener mociones por año
   */
  async getMotionsByYear(year) {
    const data = await this._makeRequest(
      "WSLegislativo",
      "retornarMocionesXAnno",
      {
        prmAnno: year.toString(),
      }
    );
    return this._extractArray(data, "Mocion");
  }

  /**
   * Obtener mensajes presidenciales por año
   */
  async getMessagesByYear(year) {
    const data = await this._makeRequest(
      "WSLegislativo",
      "retornarMensajesXAnno",
      {
        prmAnno: year.toString(),
      }
    );
    return this._extractArray(data, "Mensaje");
  }

  // ==================== DATOS COMUNES ====================

  /**
   * Obtener regiones de Chile
   */
  async getRegions() {
    const data = await this._makeRequest("WSComun", "retornarRegiones");
    return this._extractArray(data, "Region");
  }

  /**
   * Obtener comunas de Chile
   */
  async getCommunes() {
    const data = await this._makeRequest("WSComun", "retornarComunas");
    return this._extractArray(data, "Comuna");
  }

  /**
   * Obtener tipos de votación
   */
  async getVoteTypes() {
    const data = await this._makeRequest("WSComun", "retornarTiposVotacion");
    return this._extractArray(data, "TipoVotacion");
  }
}

export default new CongressAPIService();
