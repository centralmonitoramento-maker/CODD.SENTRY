/**
 * @file types.ts
 * @description Definições de tipos e interfaces para o módulo de Registro de Eventos.
 * Estruturado para garantir tipagem estrita com formulários dedicados por categoria
 * e módulo de Perfil Suspeito (Gênero, Cor da Pele, Faixa Etária, Estatura, Tipo de Vestimenta e Acessórios).
 */

export type EventCategoryKey = 
  | 'furto'
  | 'inibicao'
  | 'colisao'
  | 'conflito'
  | 'mau_procedimento'
  | 'mal_subito'
  | 'acidente';

export interface EventTypeOption {
  id: EventCategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  badgeColor: string;
  themeColor: string;
  priority: 'alta' | 'media' | 'baixa' | 'urgente';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number; // em metros
  altitude?: number | null;
  address?: string;
  timestamp: string; // ISO 8601
  isSimulated?: boolean;
}

export interface PhotoEvidence {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  base64?: string;
  capturedAt: string;
}

/* =========================================================================
 * MÓDULO DE PERFIL DO SUSPEITO (PADRONIZAÇÃO PARA INDICADOR BI)
 * ========================================================= */
export type GenderOption = 'masculino' | 'feminino' | 'dupla_mista' | 'grupo_multiplo' | 'nao_identificado';
export type SkinToneOption = 'branca' | 'parda' | 'preta' | 'amarela' | 'indigena' | 'nao_identificada';
export type AgeRangeOption = 'menor_18' | '18_25' | '26_35' | '36_50' | 'acima_50' | 'indeterminado';
export type HeightRangeOption = 'baixo' | 'medio' | 'alto' | 'muito_alto' | 'indeterminado';
export type ClothingStyleOption = 
  | 'jaqueta_casaco_pesado'
  | 'moletom_capuz'
  | 'camiseta_bermuda'
  | 'camisa_social_polo'
  | 'vestido_saia'
  | 'roupa_esportiva_treino'
  | 'uniforme_trabalho'
  | 'outro_traje';

export interface SuspectProfile {
  gender: GenderOption;
  skinTone: SkinToneOption;
  ageRange: AgeRangeOption;
  heightRange: HeightRangeOption;
  clothingStyle: ClothingStyleOption;
  clothingDetails?: string; // Ex: Jaqueta preta fechada, calça jeans escura
  carryingAccessories: string[]; // Ex: Mochila térmica, Bolsa grande, Sacola de outra loja, Boné/Chapéu, Óculos escuros
}

/* =========================================================================
 * FORMULÁRIOS ESPECÍFICOS POR CATEGORIA
 * ========================================================================= */

// 1. FURTO
export interface FurtoFormData {
  sector: string;
  itemCategory: string;
  estimatedLossValue: string;
  modusOperandi: string;
  suspectsCount: string;
  recoveryStatus: 'recuperado_total' | 'recuperado_parcial' | 'nao_recuperado';
  policeNotified: boolean;
  notes?: string;
  suspectProfile: SuspectProfile;
}

// 2. INIBIÇÃO
export interface InibicaoFormData {
  preventionMethod: string;
  sectorProtected: string;
  preventedBehavior: string;
  outcomeResult: string;
  estimatedProtectedValue?: string;
  notes?: string;
  suspectProfile: SuspectProfile;
}

// 3. COLISÃO
export interface ColisaoFormData {
  collisionLocation: string;
  vehicleTypeA: string;
  vehicleTypeB: string;
  platesOrIds: string;
  damageSeverity: 'leve' | 'moderada' | 'grave';
  insuranceOrAgreement: string;
  notes?: string;
}

// 4. CONFLITO
export interface ConflitoFormData {
  involvedParties: string;
  triggerReason: string;
  conflictIntensity: 'verbal' | 'ameaca' | 'fisica' | 'arma_ou_objeto';
  resolutionAction: string;
  policeCalled: boolean;
  medicalSupportNeeded: boolean;
  notes?: string;
}

// 5. MAU PROCEDIMENTO
export interface MauProcedimentoFormData {
  department: string;
  violationType: string;
  collaboratorRole: string;
  operationalImpact: 'baixo' | 'medio' | 'critico';
  immediateActionTaken: string;
  notes?: string;
}

// 6. MAL SÚBITO
export interface MalSubitoFormData {
  victimProfile: string;
  symptomObserved: string;
  emergencyServiceContacted: string;
  victimState: 'consciente' | 'inconsciente' | 'atendimento_medico' | 'removido_hospital';
  companionStatus: string;
  notes?: string;
}

// 7. ACIDENTE
export interface AcidenteFormData {
  accidentType: string;
  victimCategory: string;
  bodyPartAffected: string;
  injurySeverity: 'leve' | 'moderada' | 'grave';
  workSafetyNotified: boolean;
  notes?: string;
}

export type CategorySpecificData = 
  | FurtoFormData 
  | InibicaoFormData 
  | ColisaoFormData 
  | ConflitoFormData 
  | MauProcedimentoFormData 
  | MalSubitoFormData 
  | AcidenteFormData;

/**
 * Payload formal JSON preparado para envio ao endpoint backend REST (POST /api/v1/events)
 */
export interface EventReportPayload {
  protocol: string;
  branch: string;
  eventType: EventCategoryKey;
  eventTypeLabel: string;
  categoryDetails: CategorySpecificData;
  location: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    formattedAddress?: string;
    capturedAt: string;
  };
  evidence?: {
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    base64Data?: string;
  } | null;
  additionalDescription: string;
  deviceMetadata: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    networkOnline: boolean;
  };
  reportedAt: string; // ISO 8601
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO';
}

export type AppTab = 'ronda' | 'cftv' | 'dashboard' | 'admin_users';

/* =========================================================================
 * AUTENTICAÇÃO E CONTROLE DE ACESSO BASEADO EM FUNÇÃO (RBAC) E GAMIFICAÇÃO
 * ========================================================================= */
export type UserRole = 'ROLE_RONDA' | 'ROLE_CFTV' | 'ROLE_GERENCIAL' | 'ROLE_MASTER';

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
  color?: string;
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  roleLabel: string;
  branch?: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
  // Gamificação e Desempenho
  score?: number;
  pontosTotais?: number;
  completedTasksCount?: number;
  level?: string;
  badges?: UserBadge[];
  streakDays?: number;
}

/* =========================================================================
 * ROTINA PREVENTIVA E GAMIFICAÇÃO (GESTÃO DE CHECKLISTS DA CENTRAL)
 * ========================================================================= */
export type RoutineTaskStatus = 'PENDENTE' | 'CONCLUIDA';
export type RoutineTaskPriority = 'baixa' | 'media' | 'alta' | 'critica';
export type RoutineTaskCategory = 
  | 'auditoria_cameras'
  | 'teste_panico'
  | 'ronda_virtual'
  | 'link_nvr'
  | 'saidas_emergencia'
  | 'qualidade_imagem'
  | 'preservacao_vms'
  | 'inspecao_perimetral';

export interface ChecklistSubItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface RoutineTask {
  id: string;
  title: string;
  description: string;
  category: RoutineTaskCategory;
  categoryLabel: string;
  status: RoutineTaskStatus;
  points: number; // ou pontosGanhos
  pontosGanhos?: number;
  priority: RoutineTaskPriority;
  estimatedMinutes: number;
  assignedTo: string; // Ex: 'usr-cftv-01' ou 'ALL' ou nome do operador
  assignedToName?: string;
  branch?: string; // Filial relacionada
  checklistItems?: ChecklistSubItem[];
  // Dados de Conclusão
  completedAt?: string;
  completedBy?: {
    id: string;
    name: string;
    username: string;
  };
  completionNotes?: string;
  cameraObserved?: string;
  evidenceUrl?: string;
  // Metadados
  createdAt: string;
  scheduledTime?: string; // Ex: '09:00', '14:30'
}

export interface OperatorPerformanceStats {
  operatorId: string;
  operatorName: string;
  username: string;
  role: UserRole;
  branch: string;
  totalPoints: number;
  completedTasks: number;
  pendingTasks: number;
  completionRatePercent: number;
  avgExecutionMinutes: number;
  level: string;
  rankPosition: number;
  streakDays: number;
  idleTimePreventedHours: number; // Horas de tempo ocioso convertidas em prevenção
}

export interface AuthContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  users: AppUser[];
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateUser: (id: string, updates: Partial<AppUser>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };
  resetPassword: (id: string, newPass: string) => { success: boolean; error?: string };
  addPointsToUser: (userId: string, points: number) => void;
  allowedTabs: AppTab[];
  canAccessTab: (tab: AppTab) => boolean;
}

export interface CFTVEvidenceImage {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  capturedTimestamp?: string;
  cameraName?: string;
}

export interface CFTVReportData {
  branch: string;
  cameraNumber: string;
  cameraLocationSector: string;
  recordingTimestamp: string; // YYYY-MM-DDTHH:mm:ss
  incidentCategory: EventCategoryKey;
  operatorId: string;
  suspectDescription: string;
  description: string;
  preservationStatus: 'backup_vms' | 'exportado_pendrive' | 'enviado_policia' | 'aguardando_analise';
  estimatedLossValue: number;
  recoveredValue: number;
  images: CFTVEvidenceImage[];
}

export interface UnifiedEventRecord {
  id: string;
  protocol: string;
  source: 'RONDA_MOBILE' | 'CENTRAL_CFTV';
  branch: string;
  category: EventCategoryKey;
  categoryLabel: string;
  timestamp: string;
  lossValue: number;
  recoveredValue: number;
  status: 'PENDENTE' | 'EM_ANALISE' | 'CONCLUIDO';
  operatorOrAgent: string;
  cameraOrLocation: string;
  summary: string;
  evidenceCount: number;
  details?: Record<string, unknown>;
  evidenceUrl?: string;
  suspectProfile?: SuspectProfile;
  productSector?: string;
  // Campos de enriquecimento e despacho da Central CFTV
  assignedOperator?: string;
  claimedAt?: string;
  concludedAt?: string;
  slaDurationSeconds?: number;
  slaFormatted?: string;
  cftvNotes?: string;
  cftvFrames?: CFTVEvidenceImage[];
  cameraAssigned?: string;
  cameraSector?: string;
  preservationStatus?: 'backup_vms' | 'exportado_pendrive' | 'enviado_policia' | 'aguardando_analise';
  recordingDurationMinutes?: string;
  recordingTimestamp?: string;
  enrichedAt?: string;
  fieldReport?: {
    locationAddress?: string;
    agentNotes?: string;
    agentName?: string;
    photoUrl?: string;
    timestamp?: string;
    initialCategory?: EventCategoryKey;
    coordinates?: { lat: number; lng: number };
  };
}

export interface FormErrors {
  branch?: string;
  eventType?: string;
  location?: string;
  photo?: string;
  categoryFields?: Record<string, string>;
  general?: string;
  cameraNumber?: string;
  recordingTimestamp?: string;
  operatorId?: string;
}

export interface SubmittedReportSummary {
  protocol: string;
  payload: EventReportPayload | Record<string, unknown>;
  submittedAt: string;
  estimatedResolutionTime?: string;
  source?: 'RONDA_MOBILE' | 'CENTRAL_CFTV';
}
