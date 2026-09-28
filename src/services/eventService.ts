/**
 * @file eventService.ts
 * @description Camada de serviço e lógica de negócios para captura de GPS,
 * tratamento de anexos e envio assíncrono de eventos para a API REST.
 */

import {
  CategorySpecificData,
  EventCategoryKey,
  EventReportPayload,
  EventTypeOption,
  LocationData,
  PhotoEvidence,
  SuspectProfile,
} from '../types';

/**
 * Perfil padrão inicial para suspeitos
 */
export const DEFAULT_SUSPECT_PROFILE: SuspectProfile = {
  gender: 'masculino',
  skinTone: 'parda',
  ageRange: '26_35',
  heightRange: 'medio',
  clothingStyle: 'jaqueta_casaco_pesado',
  clothingDetails: '',
  carryingAccessories: ['Mochila Térmica / Forrada'],
};

/**
 * Lista de Filiais cadastradas para o monitoramento
 */
export const BRANCH_OPTIONS = [
  '00 - CENTRAL DE MONITORAMENTO',
  '01 - CEILÂNDIA 070',
  '04 - SOBRADINHO',
  '07 - SIA',
  '08 - TAGUATINGA',
  '12 - FINALIZAÇÃO',
  '13 - LUZIÂNIA',
  '15 - BALNEÁRIO',
  '16 - SANTO ANTÔNIO',
  '17 - CD POLO JK',
  '18 - ÁGUAS LINDAS',
  '19 - CALDAS NOVAS',
  '21 - CEILÂNDIA SUL',
  '25 - NOVO GAMA',
  '26 - CÉSAR LATTES',
  '27 - PLANALTINA GO',
  '28 - ÁGUAS CLARAS',
  '29 - GUARÁ',
  '30 - LEM',
  '32 - CEILÂNDIA CENTRO',
  '33 - PLANALTINADF',
  '34 - SAMAMBAIA',
  '37 - VICENTE PIRES RUA 12',
  '38 - VICENTE PIRES RUA 4',
  '39 - GOIANÉSIA',
  '40 - GURUPI',
  '42 - J. BOTÂNICO',
  '47 - PARECIDA GO',
  '50 - ST MESTRE DARMAS',
  '52 - RIACHO FUNDO I',
  '53 - RIO VERDE',
  '55 - RECANTO DAS EMAS',
  '58 - VICENTE PIRES EPTG',
  '60 - SAMAMBAIA FURNAS',
  '62 - LUZIÂNIA PARQUE JK',
  '63 - FORMOSA',
  '64 - ITUMBIARA - VILA VITORIA I',
  '65 - CEILÂNDIA NORTE QNN9',
  'CD 2',
] as const;

/**
 * Lista das 7 categorias operacionais solicitadas para o monitoramento
 */
export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  {
    id: 'furto',
    label: 'Furto',
    shortLabel: 'Furto',
    description: 'Ocultação de itens, evasão sem pagar ou rompimento de lacre',
    iconName: 'ShieldAlert',
    badgeColor: 'text-rose-600 bg-rose-50 border-rose-200',
    themeColor: 'rose',
    priority: 'alta',
  },
  {
    id: 'inibicao',
    label: 'Inibição',
    shortLabel: 'Inibição',
    description: 'Ação preventiva, ronda ostensiva e abordagem orientativa',
    iconName: 'Eye',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    themeColor: 'blue',
    priority: 'media',
  },
  {
    id: 'colisao',
    label: 'Colisão',
    shortLabel: 'Colisão',
    description: 'Impacto entre veículos, empilhadeiras ou estruturas no pátio',
    iconName: 'Car',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    themeColor: 'media' as any,
    priority: 'media',
  },
  {
    id: 'conflito',
    label: 'Conflito',
    shortLabel: 'Conflito',
    description: 'Discussão acalorada, ameaça verbal ou vias de fato',
    iconName: 'Users',
    badgeColor: 'text-orange-700 bg-orange-50 border-orange-200',
    themeColor: 'orange',
    priority: 'alta',
  },
  {
    id: 'mau_procedimento',
    label: 'Mau Procedimento',
    shortLabel: 'Procedimento',
    description: 'Descumprimento de processo operacional interno ou segurança',
    iconName: 'AlertTriangle',
    badgeColor: 'text-yellow-800 bg-yellow-50 border-yellow-200',
    themeColor: 'yellow',
    priority: 'media',
  },
  {
    id: 'mal_subito',
    label: 'Mal Súbito',
    shortLabel: 'Mal Súbito',
    description: 'Desmaio, convulsão ou emergência médica de cliente/colaborador',
    iconName: 'HeartPulse',
    badgeColor: 'text-red-700 bg-red-50 border-red-200',
    themeColor: 'red',
    priority: 'urgente',
  },
  {
    id: 'acidente',
    label: 'Acidente',
    shortLabel: 'Acidente',
    description: 'Queda em mesmo nível, colisão com produto ou lesão no trabalho',
    iconName: 'Activity',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    themeColor: 'purple',
    priority: 'alta',
  },
];

export function getDefaultCategoryData(category: EventCategoryKey): CategorySpecificData {
  switch (category) {
    case 'furto':
      return {
        sector: 'Bebidas Quentes / Destilados',
        itemCategory: 'Bebidas Alcoólicas / Destilados',
        estimatedLossValue: '250,00',
        modusOperandi: 'Ocultação em bolsa / mochila / sacola',
        suspectsCount: '1 suspeito',
        recoveryStatus: 'recuperado_total',
        policeNotified: false,
        notes: '',
        suspectProfile: {
          gender: 'masculino',
          skinTone: 'parda',
          ageRange: '26_35',
          heightRange: 'medio',
          clothingStyle: 'jaqueta_casaco_pesado',
          clothingDetails: 'Casaco escuro fechado, calça jeans',
          carryingAccessories: ['Mochila Térmica / Forrada'],
        },
      };
    case 'inibicao':
      return {
        preventionMethod: 'Posicionamento ostensivo do fiscal no corredor',
        sectorProtected: 'Bebidas Quentes / Destilados',
        preventedBehavior: 'Tentativa de ocultação sob vestimentas / bolsa',
        outcomeResult: 'Mercadoria abandonada na gôndola e evasão pacífica',
        estimatedProtectedValue: '350,00',
        notes: '',
        suspectProfile: {
          gender: 'masculino',
          skinTone: 'parda',
          ageRange: '26_35',
          heightRange: 'medio',
          clothingStyle: 'moletom_capuz',
          clothingDetails: 'Moletom cinza com capuz, bermuda escura',
          carryingAccessories: ['Boné / Chapéu / Gorro', 'Mochila Convencional'],
        },
      };
    case 'colisao':
      return {
        collisionLocation: 'Estacionamento de Clientes (Vaga / Corredor)',
        vehicleTypeA: 'Veículo de Passeio (Cliente)',
        vehicleTypeB: 'Estrutura Fixa (Poste / Cancela / Mureta)',
        platesOrIds: 'ABC-1D23',
        damageSeverity: 'leve',
        insuranceOrAgreement: 'Acordo amigável formalizado no local',
        notes: '',
      };
    case 'conflito':
      return {
        involvedParties: 'Cliente x Colaborador (Frente de Caixa)',
        triggerReason: 'Divergência de preço no PDV / Cupom',
        conflictIntensity: 'verbal',
        resolutionAction: 'Mediação pacífica realizada pela Gerência',
        policeCalled: false,
        medicalSupportNeeded: false,
        notes: '',
      };
    case 'mau_procedimento':
      return {
        department: 'Frente de Caixa / Operadores de PDV',
        violationType: 'Não cancelamento de item com conferência do fiscal',
        collaboratorRole: 'Operador de Caixa',
        operationalImpact: 'medio',
        immediateActionTaken: 'Orientação técnica e recontagem de lote realizada',
        notes: '',
      };
    case 'mal_subito':
      return {
        victimProfile: 'Cliente',
        symptomObserved: 'Desmaio / Síncope com perda transitória de consciência',
        emergencyServiceContacted: 'SAMU 192 acionado',
        victimState: 'consciente',
        companionStatus: 'Acompanhado por familiar no local',
        notes: '',
      };
    case 'acidente':
      return {
        accidentType: 'Queda de mesmo nível / Escorregão em piso',
        victimCategory: 'Colaborador CLT da Loja',
        bodyPartAffected: 'Membros Superiores (Braço / Punho)',
        injurySeverity: 'leve',
        workSafetyNotified: true,
        notes: '',
      };
  }
}

/**
 * Gera um identificador único de protocolo no formato EVT-AAAA-XXXXX
 */
export function generateProtocol(): string {
  const year = new Date().getFullYear();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  return `EVT-${year}-${randomCode}`;
}

/**
 * Captura as coordenadas do usuário via Geolocation API do navegador,
 * com fallback inteligente para simulação realista caso a permissão seja negada ou indisponível.
 * 
 * @returns Promise<LocationData> Coordenadas e endereço formatado
 */
export async function captureGPSLocation(): Promise<LocationData> {
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          const accuracy = Math.round(position.coords.accuracy || 8);

          resolve({
            latitude: lat,
            longitude: lng,
            accuracy,
            altitude: position.coords.altitude,
            address: `Lat: ${lat}°, Lng: ${lng}° (Precisão: ±${accuracy}m)`,
            timestamp: new Date().toISOString(),
            isSimulated: false,
          });
        },
        () => {
          resolve(getSimulatedLocation());
        },
        options
      );
    } else {
      resolve(getSimulatedLocation());
    }
  });
}

/**
 * Simulação de coordenadas GPS realistas para ambiente de desenvolvimento/preview
 */
function getSimulatedLocation(): LocationData {
  const baseLat = -15.7942;
  const baseLng = -47.8822;
  const jitterLat = (Math.random() - 0.5) * 0.015;
  const jitterLng = (Math.random() - 0.5) * 0.015;

  const lat = parseFloat((baseLat + jitterLat).toFixed(6));
  const lng = parseFloat((baseLng + jitterLng).toFixed(6));

  return {
    latitude: lat,
    longitude: lng,
    accuracy: Math.floor(Math.random() * 8) + 4,
    altitude: 1172,
    address: `Setor de Armazenagem e Abastecimento (SIA Trecho 3/4) - Brasília, DF`,
    timestamp: new Date().toISOString(),
    isSimulated: true,
  };
}

/**
 * Formata bytes em formato legível (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Converte arquivo em Base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Envia o evento de segurança para o backend REST
 */
export async function handleSubmitEvent(
  branch: string,
  eventType: EventCategoryKey,
  categoryData: CategorySpecificData,
  location: LocationData,
  photo: PhotoEvidence | null,
  additionalDescription: string
): Promise<{ success: boolean; protocol: string; payload: EventReportPayload }> {
  const protocol = generateProtocol();
  const meta = EVENT_TYPE_OPTIONS.find((t) => t.id === eventType);

  const payload: EventReportPayload = {
    protocol,
    branch,
    eventType,
    eventTypeLabel: meta ? meta.label : eventType,
    categoryDetails: categoryData,
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracyMeters: location.accuracy,
      formattedAddress: location.address,
      capturedAt: location.timestamp,
    },
    evidence: photo
      ? {
          fileName: photo.name,
          fileSizeBytes: photo.size,
          mimeType: photo.type,
          base64Data: photo.base64 || (photo.previewUrl.startsWith('data:') ? photo.previewUrl : undefined),
        }
      : null,
    additionalDescription,
    deviceMetadata: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node/Test',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Linux',
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080',
      networkOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    },
    reportedAt: new Date().toISOString(),
    status: 'CONCLUIDO',
  };

  // Simulação de latência de rede com resposta HTTP 201 Created
  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    success: true,
    protocol,
    payload,
  };
}
