/**
 * @file CentralCFTVView.tsx
 * @description Mesa de Operações e Atendimento (Dispatch Center) com fluxo em 3 etapas isoladas:
 * 
 * ETAPA 1 (Visão Inicial): Fila de Ocorrências ampla e despoluída (ocupando a tela toda).
 * ETAPA 2 (Preview/Modal): Modal estritamente somente leitura com os dados originais da loja e botão "Assumir Ocorrência".
 * ETAPA 3 (Tratamento Ativo): Tela dedicada 100% ao trabalho do CFTV (Parecer, Perfil Suspeito, Câmeras, VMS e SLA ao vivo).
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  MonitorPlay,
  Camera,
  Clock,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Eye,
  Video,
  Layers,
  Search,
  Maximize2,
  X,
  Tag,
  Zap,
  UserCheck,
  Smartphone,
  Radio,
  User,
  ShieldAlert,
  Check,
  RotateCcw,
  PlusCircle,
  Activity,
  BadgeAlert,
  Lock,
  Timer,
  Play,
  FileText,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { BRANCH_OPTIONS, EVENT_TYPE_OPTIONS, getDefaultCategoryData } from '../services/eventService';
import { 
  EventCategoryKey, 
  FormErrors, 
  CFTVEvidenceImage, 
  UnifiedEventRecord, 
  CategorySpecificData,
  SuspectProfile,
  RoutineTask
} from '../types';
import { CATEGORY_COLORS, CATEGORY_NAMES, formatBRL, formatDateTimeBR } from '../services/dashboardData';
import { DynamicCategoryForm } from './DynamicCategoryForm';
import { 
  CFTV_QUICK_PRESETS, 
  CFTV_SMART_TAGS, 
  POPULAR_CAMERAS_EXTENDED,
  SuspectPreset 
} from '../services/cftvPresets';
import { RoutineOperatorView } from './RoutineOperatorView';
import { RoutineSupervisionView } from './RoutineSupervisionView';
import { getStoredRoutineTasks, subscribeToRoutineTasks } from '../services/routineService';
import { useAuth } from '../context/AuthContext';
import { Trophy, CheckCheck } from 'lucide-react';

interface CentralCFTVViewProps {
  records: UnifiedEventRecord[];
  onEventSubmitted: (record: UnifiedEventRecord) => void;
  onUpdateRecord?: (record: UnifiedEventRecord) => void;
}

type ViewStage = 'QUEUE' | 'TREATMENT';
type QueueStatusFilter = 'TODOS' | 'PENDENTE' | 'EM_ANALISE' | 'CONCLUIDO';
type CftvSubTab = 'DISPATCH' | 'ROUTINE' | 'SUPERVISION';

/**
 * Helper para formatar duração em segundos no formato MM:SS ou HH:MM:SS
 */
function formatSlaTimer(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const CentralCFTVView: React.FC<CentralCFTVViewProps> = ({ 
  records, 
  onEventSubmitted, 
  onUpdateRecord 
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sub-abas da Central CFTV
  const [cftvSubTab, setCftvSubTab] = useState<CftvSubTab>('DISPATCH');

  // Estado e sincronização em tempo real das Tarefas de Rotina Preventiva
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>(() => getStoredRoutineTasks());

  useEffect(() => {
    const unsubscribe = subscribeToRoutineTasks((updated) => {
      setRoutineTasks(updated);
    });
    return () => unsubscribe();
  }, []);

  const refreshRoutineTasks = () => {
    setRoutineTasks(getStoredRoutineTasks());
  };

  // ==========================================
  // OPERADOR DA CENTRAL CFTV ATIVO
  // ==========================================
  const [operatorId] = useState<string>(currentUser ? currentUser.name : 'Operador CFTV #402 (Juliana C.)');

  // ==========================================
  // ESTADO DO FLUXO DINÂMICO DE 3 ETAPAS
  // ==========================================
  // ETAPA 1: 'QUEUE' (Fila Ampla) | ETAPA 3: 'TREATMENT' (Mesa de Tratamento)
  const [currentStage, setCurrentStage] = useState<ViewStage>('QUEUE');
  
  // ETAPA 2: Modal de Preview Imutável (Aberto quando tem um registro selecionado)
  const [previewModalRecord, setPreviewModalRecord] = useState<UnifiedEventRecord | null>(null);

  // ID do registro em tratamento ativo (ETAPA 3)
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [isDirectCftvMode, setIsDirectCftvMode] = useState<boolean>(false);

  // ==========================================
  // RELÓGIO AO VIVO E TICK DE SLA
  // ==========================================
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // FILTROS DA FILA (ETAPA 1)
  // ==========================================
  const [queueStatusFilter, setQueueStatusFilter] = useState<QueueStatusFilter>('TODOS');
  const [queueBranchFilter, setQueueBranchFilter] = useState<string>('TODAS');
  const [queueSearchQuery, setQueueSearchQuery] = useState<string>('');

  // ==========================================
  // ESTADOS DO FORMULÁRIO DE TRATAMENTO CFTV (ETAPA 3)
  // ==========================================
  const [branch, setBranch] = useState<string>('00 - CENTRAL DE MONITORAMENTO');
  const [cameraNumber, setCameraNumber] = useState<string>('CAM-04');
  const [cameraLocationSector, setCameraLocationSector] = useState<string>('Corredor 04 - Bebidas Quentes & Destilados');
  
  const getNowFormatted = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 19);
  };

  const [recordingTimestamp, setRecordingTimestamp] = useState<string>(getNowFormatted());
  const [recordingDurationMinutes, setRecordingDurationMinutes] = useState<string>('15');
  const [incidentCategory, setIncidentCategory] = useState<EventCategoryKey>('furto');
  const [categoryData, setCategoryData] = useState<CategorySpecificData>(getDefaultCategoryData('furto'));
  const [cftvNotes, setCftvNotes] = useState<string>('');
  const [preservationStatus, setPreservationStatus] = useState<'backup_vms' | 'exportado_pendrive' | 'enviado_policia' | 'aguardando_analise'>('backup_vms');
  const [images, setImages] = useState<CFTVEvidenceImage[]>([]);

  // Estados de controle da interface
  const [isOriginalReportCollapsed, setIsOriginalReportCollapsed] = useState<boolean>(false);
  const [previewPhotoZoomUrl, setPreviewPhotoZoomUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (notificationToast) {
      const t = setTimeout(() => setNotificationToast(null), 4500);
      return () => clearTimeout(t);
    }
  }, [notificationToast]);

  // Registro ativo na mesa de tratamento
  const activeRecord = useMemo(() => {
    if (isDirectCftvMode) return null;
    return records.find((r) => r.id === activeIncidentId) || null;
  }, [records, activeIncidentId, isDirectCftvMode]);

  // Sincroniza formulário quando o registro ativo muda
  useEffect(() => {
    if (activeRecord) {
      setBranch(activeRecord.branch);
      setIncidentCategory(activeRecord.category);
      
      // Carrega dados específicos da categoria
      if (activeRecord.details && (activeRecord.details as any).categoryData) {
        setCategoryData((activeRecord.details as any).categoryData);
      } else if (activeRecord.details) {
        setCategoryData(activeRecord.details as any);
      } else {
        const def = getDefaultCategoryData(activeRecord.category);
        if (activeRecord.suspectProfile) {
          (def as any).suspectProfile = activeRecord.suspectProfile;
        }
        setCategoryData(def);
      }

      // Câmera & VMS
      setCameraNumber(activeRecord.cameraAssigned || 'CAM-04');
      setCameraLocationSector(activeRecord.cameraSector || activeRecord.cameraOrLocation || 'Corredor Monitorado');
      setRecordingTimestamp(activeRecord.recordingTimestamp || getNowFormatted());
      setRecordingDurationMinutes(activeRecord.recordingDurationMinutes || '15');
      setPreservationStatus(activeRecord.preservationStatus || 'backup_vms');

      // Observações próprias do CFTV
      setCftvNotes(activeRecord.cftvNotes || '');

      // Frames e Snapshots
      if (activeRecord.cftvFrames && activeRecord.cftvFrames.length > 0) {
        setImages(activeRecord.cftvFrames);
      } else {
        setImages([]);
      }

      setErrors({});
      setActivePresetId(null);
    }
  }, [activeRecord]);

  // ==========================================
  // CÁLCULO DE SLA EM TEMPO REAL
  // ==========================================
  const currentSlaSeconds = useMemo(() => {
    if (!activeRecord) return 0;
    if (activeRecord.status === 'EM_ANALISE' && activeRecord.claimedAt) {
      const startMs = new Date(activeRecord.claimedAt).getTime();
      return Math.max(0, Math.floor((nowMs - startMs) / 1000));
    }
    if (activeRecord.status === 'CONCLUIDO') {
      return activeRecord.slaDurationSeconds || 0;
    }
    return 0;
  }, [activeRecord, nowMs]);

  // ==========================================
  // FILTRAGEM DA FILA DE OCORRÊNCIAS (ETAPA 1)
  // ==========================================
  const filteredQueue = useMemo(() => {
    return records.filter((rec) => {
      if (queueStatusFilter !== 'TODOS' && rec.status !== queueStatusFilter) {
        return false;
      }
      if (queueBranchFilter !== 'TODAS' && rec.branch !== queueBranchFilter) {
        return false;
      }
      if (queueSearchQuery.trim()) {
        const q = queueSearchQuery.toLowerCase();
        const matchesProto = rec.protocol.toLowerCase().includes(q);
        const matchesBranch = rec.branch.toLowerCase().includes(q);
        const matchesSummary = rec.summary.toLowerCase().includes(q);
        const matchesAgent = rec.operatorOrAgent.toLowerCase().includes(q);
        const matchesLoc = rec.cameraOrLocation.toLowerCase().includes(q);
        if (!matchesProto && !matchesBranch && !matchesSummary && !matchesAgent && !matchesLoc) {
          return false;
        }
      }
      return true;
    });
  }, [records, queueStatusFilter, queueBranchFilter, queueSearchQuery]);

  const statusCounts = useMemo(() => {
    const total = records.length;
    const novos = records.filter((r) => r.status === 'PENDENTE').length;
    const emAnalise = records.filter((r) => r.status === 'EM_ANALISE').length;
    const tratados = records.filter((r) => r.status === 'CONCLUIDO').length;
    return { total, novos, emAnalise, tratados };
  }, [records]);

  // ==========================================
  // ETAPA 1 -> ETAPA 2: ABRIR MODAL DE PREVIEW
  // ==========================================
  const handleOpenPreviewModal = (record: UnifiedEventRecord) => {
    setPreviewModalRecord(record);
  };

  const handleClosePreviewModal = () => {
    setPreviewModalRecord(null);
  };

  // ==========================================
  // ETAPA 2 -> ETAPA 3: ASSUMIR OCORRÊNCIA & ENTRAR NO TRATAMENTO
  // ==========================================
  const handleAssumeIncidentFromModal = async (recordToAssume: UnifiedEventRecord) => {
    setIsProcessingAction(true);

    try {
      await new Promise((r) => setTimeout(r, 250));
      const nowIso = new Date().toISOString();

      const updated: UnifiedEventRecord = {
        ...recordToAssume,
        status: 'EM_ANALISE',
        assignedOperator: operatorId,
        claimedAt: recordToAssume.claimedAt || nowIso,
        cameraAssigned: cameraNumber,
        cameraSector: cameraLocationSector,
        enrichedAt: nowIso,
      };

      if (onUpdateRecord) {
        onUpdateRecord(updated);
      }

      // Fecha o Modal de Preview
      setPreviewModalRecord(null);
      
      // Ativa o registro na mesa de tratamento e muda para a Etapa 3
      setIsDirectCftvMode(false);
      setActiveIncidentId(recordToAssume.id);
      setCurrentStage('TREATMENT');

      setNotificationToast({
        message: `🚨 Ocorrência ${recordToAssume.protocol} assumida! SLA iniciado em tempo real.`,
        type: 'info',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Abrir tratamento direto para itens já em análise ou concluídos
  const handleContinueTreatmentFromModal = (record: UnifiedEventRecord) => {
    setPreviewModalRecord(null);
    setIsDirectCftvMode(false);
    setActiveIncidentId(record.id);
    setCurrentStage('TREATMENT');
  };

  // Modo Nova Ocorrência Direta CFTV (Criação autônoma)
  const handleStartDirectCFTV = () => {
    setIsDirectCftvMode(true);
    setActiveIncidentId(null);
    setBranch('00 - CENTRAL DE MONITORAMENTO');
    setCameraNumber('CAM-04');
    setCameraLocationSector('Corredor 04 - Bebidas Quentes');
    setIncidentCategory('furto');
    setCategoryData(getDefaultCategoryData('furto'));
    setCftvNotes('');
    setImages([]);
    setErrors({});
    setActivePresetId(null);
    setCurrentStage('TREATMENT');
  };

  // Voltar para a Fila (Etapa 3 -> Etapa 1)
  const handleBackToQueue = () => {
    setCurrentStage('QUEUE');
  };

  // ==========================================
  // ETAPA 3: FINALIZAR TRATAMENTO & RETORNAR À FILA
  // ==========================================
  const handleFinalizeIncident = async () => {
    if (!validateForm()) return;
    setIsProcessingAction(true);

    try {
      await new Promise((r) => setTimeout(r, 400));

      const nowIso = new Date().toISOString();

      // Cálculo do SLA final
      let finalSlaSeconds = currentSlaSeconds;
      if (activeRecord?.claimedAt) {
        const startMs = new Date(activeRecord.claimedAt).getTime();
        finalSlaSeconds = Math.max(1, Math.floor((Date.now() - startMs) / 1000));
      }
      const finalSlaFormatted = formatSlaTimer(finalSlaSeconds);

      // Extração de valores e perfil suspeito
      let lossVal = 0;
      let recVal = 0;

      const anyData = categoryData as any;
      const suspectProfile = anyData.suspectProfile as SuspectProfile || activeRecord?.suspectProfile || undefined;
      const productSector = anyData.sector || anyData.sectorProtected || activeRecord?.productSector || undefined;

      if (incidentCategory === 'furto') {
        const fData = categoryData as any;
        lossVal = parseFloat((fData.estimatedLossValue || '0').replace(/\./g, '').replace(',', '.')) || 0;
        if (fData.recoveryStatus === 'recuperado_total') {
          recVal = lossVal;
        } else if (fData.recoveryStatus === 'recuperado_parcial') {
          recVal = lossVal * 0.5;
        }
      } else if (incidentCategory === 'inibicao') {
        const iData = categoryData as any;
        recVal = parseFloat((iData.estimatedProtectedValue || '0').replace(/\./g, '').replace(',', '.')) || 0;
      } else if (incidentCategory === 'colisao') {
        const cData = categoryData as any;
        lossVal = parseFloat((cData.estimatedCost || '0').replace(/\./g, '').replace(',', '.')) || 0;
      }

      const categoryMeta = EVENT_TYPE_OPTIONS.find((c) => c.id === incidentCategory);

      if (activeRecord) {
        // Preservação estrita do relato original intacto
        const originalFieldReport = activeRecord.fieldReport || {
          locationAddress: activeRecord.cameraOrLocation,
          agentNotes: activeRecord.summary,
          agentName: activeRecord.operatorOrAgent,
          photoUrl: activeRecord.evidenceUrl,
          timestamp: activeRecord.timestamp,
          initialCategory: activeRecord.category,
        };

        // Síntese unificada: Relato Original intacto + Parecer CFTV
        const originalText = originalFieldReport.agentNotes || activeRecord.summary;
        const cftvAddition = cftvNotes.trim() ? ` [CFTV]: ${cftvNotes.trim()}` : '';
        const unifiedSummary = `${originalText}${cftvAddition}`;

        const updated: UnifiedEventRecord = {
          ...activeRecord,
          branch,
          category: incidentCategory,
          categoryLabel: categoryMeta ? categoryMeta.label : incidentCategory,
          status: 'CONCLUIDO',
          assignedOperator: operatorId,
          concludedAt: nowIso,
          slaDurationSeconds: finalSlaSeconds,
          slaFormatted: finalSlaFormatted,
          cameraOrLocation: `${cameraNumber} (${cameraLocationSector})`,
          cameraAssigned: cameraNumber,
          cameraSector: cameraLocationSector,
          recordingTimestamp,
          recordingDurationMinutes,
          preservationStatus,
          lossValue: lossVal > 0 ? lossVal : activeRecord.lossValue,
          recoveredValue: recVal > 0 ? recVal : activeRecord.recoveredValue,
          summary: unifiedSummary,
          cftvNotes: cftvNotes.trim(),
          cftvFrames: images,
          evidenceCount: (activeRecord.evidenceUrl ? 1 : 0) + images.length,
          suspectProfile,
          productSector,
          // Mantém o bloco de solo 100% preservado
          fieldReport: originalFieldReport,
          details: {
            ...(activeRecord.details || {}),
            categoryData,
            cftvNotes: cftvNotes.trim(),
            preservationStatus,
            recordingDurationMinutes,
            recordingTimestamp,
            handledBy: operatorId,
            handledAt: nowIso,
            slaFormatted: finalSlaFormatted,
          },
        };

        if (onUpdateRecord) {
          onUpdateRecord(updated);
        }

        setNotificationToast({
          message: `✅ Ocorrência ${activeRecord.protocol} encerrada com sucesso! SLA: ${finalSlaFormatted}.`,
          type: 'success',
        });
      } else {
        // Novo registro autônomo da central
        const year = new Date().getFullYear();
        const code = Math.floor(10000 + Math.random() * 90000);
        const protocol = `CFTV-${year}-${code}`;

        const newRecord: UnifiedEventRecord = {
          id: `cftv-${Date.now()}`,
          protocol,
          source: 'CENTRAL_CFTV',
          branch,
          category: incidentCategory,
          categoryLabel: categoryMeta ? categoryMeta.label : incidentCategory,
          timestamp: recordingTimestamp,
          lossValue: lossVal,
          recoveredValue: recVal,
          status: 'CONCLUIDO',
          operatorOrAgent: operatorId,
          assignedOperator: operatorId,
          concludedAt: nowIso,
          slaDurationSeconds: 120,
          slaFormatted: '02:00',
          cameraOrLocation: `${cameraNumber} - ${cameraLocationSector}`,
          cameraAssigned: cameraNumber,
          cameraSector: cameraLocationSector,
          summary: cftvNotes.trim() || `Ocorrência detectada e encerrada pela Central CFTV (${cameraNumber}).`,
          cftvNotes: cftvNotes.trim(),
          evidenceCount: images.length,
          evidenceUrl: images[0]?.previewUrl,
          cftvFrames: images,
          details: {
            categoryData,
            cftvNotes: cftvNotes.trim(),
            preservationStatus,
            recordingDurationMinutes,
            recordingTimestamp,
          },
          suspectProfile,
          productSector,
        };

        onEventSubmitted(newRecord);

        setNotificationToast({
          message: `Nova ocorrência CFTV ${protocol} registrada e encerrada com sucesso!`,
          type: 'success',
        });
      }

      // Retorna para a Fila após encerramento
      setCurrentStage('QUEUE');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Reabrir Ocorrência
  const handleReopenIncident = () => {
    if (!activeRecord) return;
    const updated: UnifiedEventRecord = {
      ...activeRecord,
      status: 'EM_ANALISE',
      claimedAt: new Date().toISOString(),
    };
    if (onUpdateRecord) {
      onUpdateRecord(updated);
    }
    setNotificationToast({
      message: `Ocorrência ${activeRecord.protocol} reaberta para complementação de análise e filmagem.`,
      type: 'warning',
    });
  };

  // Simular Alerta da Ronda
  const handleSimulateNewFieldAlert = () => {
    const sampleStores = ['01 - CEILÂNDIA 070', '08 - TAGUATINGA', '07 - SIA', '04 - SOBRADINHO', '13 - LUZIÂNIA'];
    const sampleAgents = ['Fiscal Ronda #033 (André L.)', 'Fiscal Ronda #091 (Valmir S.)', 'Fiscal Ronda #105 (Juliana F.)', 'Fiscal Ronda #062 (Rodrigo P.)'];
    const sampleSectors = [
      { cat: 'furto' as EventCategoryKey, sec: 'Bebidas Quentes / Destilados', desc: 'Indivíduo monitorado ocultando garrafas de whisky em jaqueta no corredor 04. Ronda solicitando apoio de PTZ.', val: 920 },
      { cat: 'inibicao' as EventCategoryKey, sec: 'Perfumaria / Higiene & Beleza', desc: 'Presença de dupla suspeita com sacolas forradas manipulando desodorantes e lâminas.', val: 450 },
      { cat: 'furto' as EventCategoryKey, sec: 'Carnes Nobres / Açougue', desc: 'Suspeito inseriu 3 peças de picanha dentro da mochila e desloca-se para a frente de caixa.', val: 580 },
    ];

    const pickSec = sampleSectors[Math.floor(Math.random() * sampleSectors.length)];
    const pickStore = sampleStores[Math.floor(Math.random() * sampleStores.length)];
    const pickAgent = sampleAgents[Math.floor(Math.random() * sampleAgents.length)];
    const year = new Date().getFullYear();
    const code = Math.floor(10000 + Math.random() * 90000);
    const protocol = `MOB-${year}-${code}`;

    const newAlert: UnifiedEventRecord = {
      id: `live-alert-${Date.now()}`,
      protocol,
      source: 'RONDA_MOBILE',
      branch: pickStore,
      category: pickSec.cat,
      categoryLabel: CATEGORY_NAMES[pickSec.cat] || pickSec.cat,
      timestamp: new Date().toISOString(),
      lossValue: pickSec.val,
      recoveredValue: 0,
      status: 'PENDENTE',
      operatorOrAgent: pickAgent,
      cameraOrLocation: `Corredor de Vendas (${pickSec.sec})`,
      summary: pickSec.desc,
      evidenceCount: 1,
      evidenceUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
      productSector: pickSec.sec,
      fieldReport: {
        locationAddress: `Atacadão Dia a Dia - ${pickStore}`,
        agentNotes: pickSec.desc,
        agentName: pickAgent,
        photoUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
        timestamp: new Date().toISOString(),
        initialCategory: pickSec.cat,
      },
      suspectProfile: {
        gender: 'masculino',
        skinTone: 'parda',
        ageRange: '26_35',
        heightRange: 'medio',
        clothingStyle: 'jaqueta_casaco_pesado',
        clothingDetails: 'Casaco escuro e bermuda',
        carryingAccessories: ['Mochila Térmica / Forrada'],
      },
      details: {
        categoryData: {
          sector: pickSec.sec,
          estimatedLossValue: `${pickSec.val},00`,
          recoveryStatus: 'nao_recuperado',
        }
      }
    };

    onEventSubmitted(newAlert);

    setNotificationToast({
      message: `⚡ NOVO ALERTA DA RONDA: Protocolo ${protocol} (${pickStore}). Clique no card para visualizar o preview.`,
      type: 'warning',
    });
  };

  // Presets de 1 clique do CFTV
  const handleApplyPreset = (preset: SuspectPreset) => {
    setActivePresetId(preset.id);
    setIncidentCategory(preset.category);
    
    const defaultData = getDefaultCategoryData(preset.category);
    
    if (preset.category === 'furto') {
      const fData = defaultData as any;
      fData.sector = preset.productSector || 'Bebidas Quentes / Destilados';
      fData.itemCategory = 'Bebidas Alcoólicas / Destilados';
      fData.estimatedLossValue = '750,00';
      fData.recoveryStatus = 'recuperado_total';
      if (preset.suspectProfile) {
        fData.suspectProfile = preset.suspectProfile;
      }
    } else if (preset.category === 'inibicao') {
      const iData = defaultData as any;
      iData.sectorProtected = preset.productSector || 'Eletrônicos / Telefonia & Bazar';
      iData.estimatedProtectedValue = '1.200,00';
      iData.preventionMethod = 'Monitoramento por CFTV com alerta na equipe via rádio';
      if (preset.suspectProfile) {
        iData.suspectProfile = preset.suspectProfile;
      }
    }

    setCategoryData(defaultData);
    setCftvNotes(preset.descriptionText);
  };

  const handleAddSmartTag = (tag: string) => {
    if (cftvNotes.includes(tag)) return;
    setCftvNotes((prev) => (prev ? `${prev}. ${tag}` : tag));
  };

  const handleQuickTimeAdjust = (minutesAgo: number) => {
    const target = new Date(Date.now() - minutesAgo * 60 * 1000);
    const offset = target.getTimezoneOffset() * 60000;
    setRecordingTimestamp(new Date(target.getTime() - offset).toISOString().slice(0, 19));
  };

  const handleSelectPresetCamera = (cam: { id: string; name: string; sector: string }) => {
    setCameraNumber(cam.id);
    setCameraLocationSector(cam.name);
  };

  // Upload e Captura de Frames VMS
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newImg: CFTVEvidenceImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: reader.result as string,
          capturedTimestamp: new Date().toLocaleTimeString('pt-BR'),
          cameraName: cameraNumber || 'CFTV',
        };
        setImages((prev) => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSimulateLiveCapture = () => {
    const sampleFrames = [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
    ];
    const randomFrame = sampleFrames[Math.floor(Math.random() * sampleFrames.length)];
    const timeStr = new Date().toLocaleTimeString('pt-BR');
    
    const newImg: CFTVEvidenceImage = {
      id: `capture-${Date.now()}`,
      name: `VMS_Frame_${cameraNumber}_${timeStr.replace(/:/g, '')}.jpg`,
      size: 512000,
      type: 'image/jpeg',
      previewUrl: randomFrame,
      capturedTimestamp: timeStr,
      cameraName: `${cameraNumber} (${cameraLocationSector.slice(0, 18)})`,
    };

    setImages((prev) => [...prev, newImg]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const validateForm = (): boolean => {
    const errs: FormErrors = {};
    if (!branch.trim()) errs.branch = 'Selecione a filial monitorada.';
    if (!cameraNumber.trim()) errs.cameraNumber = 'Informe o número da câmera.';
    if (!recordingTimestamp) errs.recordingTimestamp = 'Informe a data e hora da gravação.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const currentTags = CFTV_SMART_TAGS[incidentCategory] || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ========================================================================= */}
      {/* CABEÇALHO SUPERIOR DA CENTRAL CFTV COM PLACAR DE GAMIFICAÇÃO              */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Central de Monitoramento CFTV</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                VMS Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Despacho de ocorrências com SLA, auditoria de câmeras e rotina preventiva gamificada.
            </p>
          </div>
        </div>

        {/* Telemetria do Operador & Placar Gamificado */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          
          {/* Placar de Pontos e Nível */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 px-3.5 py-2 rounded-2xl border border-amber-500/40 text-amber-300 shadow-sm">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
            <span className="font-bold text-amber-300">
              {currentUser?.score || currentUser?.pontosTotais || 850} pts
            </span>
            <span className="text-[10px] text-amber-400/80 font-sans font-bold">
              • {currentUser?.level || 'Operador Ouro 🥇'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 text-slate-300">
            <User className="w-4 h-4 text-blue-400" />
            <span>{operatorId}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{new Date(nowMs).toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* SUB-NAVEGAÇÃO PRINCIPAL DA CENTRAL: DESPACHO VS ROTINA PREVENTIVA VS SUPERVISÃO */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="btn-tab-cftv-dispatch"
            onClick={() => setCftvSubTab('DISPATCH')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              cftvSubTab === 'DISPATCH'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fila de Despacho & Atendimento</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-700 text-white font-mono">
              {records.filter((r) => r.status !== 'CONCLUIDO').length}
            </span>
          </button>

          <button
            type="button"
            id="btn-tab-cftv-routine"
            onClick={() => setCftvSubTab('ROUTINE')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              cftvSubTab === 'ROUTINE'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCheck className="w-4 h-4 text-amber-500" />
            <span>Minha Rotina / Checklists</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black font-mono">
              {routineTasks.filter((t) => t.status === 'PENDENTE').length} pendentes
            </span>
          </button>

          <button
            type="button"
            id="btn-tab-cftv-supervision"
            onClick={() => setCftvSubTab('SUPERVISION')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              cftvSubTab === 'SUPERVISION'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Supervisão & Ranking da Equipe</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-3 hidden lg:block">
          {cftvSubTab === 'ROUTINE' && '🎯 Complete auditorias nos momentos sem ocorrência ativa para somar pontos!'}
          {cftvSubTab === 'DISPATCH' && '🚨 Despacho de ocorrências em tempo real com SLA de 20 minutos.'}
          {cftvSubTab === 'SUPERVISION' && '🏆 Pódio e taxa de produtividade da equipe.'}
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL POR SUB-ABA */}
      {cftvSubTab === 'ROUTINE' && (
        <RoutineOperatorView
          tasks={routineTasks}
          onTaskUpdated={refreshRoutineTasks}
        />
      )}

      {cftvSubTab === 'SUPERVISION' && (
        <RoutineSupervisionView
          tasks={routineTasks}
          onTaskUpdated={refreshRoutineTasks}
        />
      )}

      {cftvSubTab === 'DISPATCH' && (
        <>
      {/* Toast Notification Alert */}
      {notificationToast && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-fadeIn ${
          notificationToast.type === 'warning'
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
            : notificationToast.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : 'bg-blue-950/80 border-blue-500/40 text-blue-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <BadgeAlert className="w-4 h-4 shrink-0" />
            <span>{notificationToast.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotificationToast(null)}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ETAPA 1: VISÃO INICIAL (FILA DE OCORRÊNCIAS AMPLA E DESPOLUÍDA)           */}
      {/* ========================================================================= */}
      {currentStage === 'QUEUE' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* BARRA DE CONTROLE, FILTROS E AÇÕES RÁPIDAS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Fila de Atendimento & Despacho
                </h3>
                <p className="text-xs text-slate-400">
                  Selecione qualquer ocorrência para abrir o preview do relato de campo e iniciar o atendimento.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="btn-simulate-ronda-alert"
                  onClick={handleSimulateNewFieldAlert}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Simular Alerta da Ronda</span>
                </button>

                <button
                  type="button"
                  id="btn-start-direct-cftv"
                  onClick={handleStartDirectCFTV}
                  className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Novo Registro Direto CFTV</span>
                </button>
              </div>
            </div>

            {/* Abas de Status da Fila */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setQueueStatusFilter('TODOS')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  queueStatusFilter === 'TODOS'
                    ? 'bg-slate-800 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
                }`}
              >
                <span>Todas</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-200 text-[11px] font-mono">
                  {statusCounts.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQueueStatusFilter('PENDENTE')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  queueStatusFilter === 'PENDENTE'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md shadow-rose-950/40'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span>Novas (Pendentes)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-200 text-[11px] font-mono">
                  {statusCounts.novos}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQueueStatusFilter('EM_ANALISE')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  queueStatusFilter === 'EM_ANALISE'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md shadow-amber-950/40'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-amber-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Em Análise</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 text-[11px] font-mono">
                  {statusCounts.emAnalise}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQueueStatusFilter('CONCLUIDO')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  queueStatusFilter === 'CONCLUIDO'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-emerald-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tratadas</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 text-[11px] font-mono">
                  {statusCounts.tratados}
                </span>
              </button>
            </div>

            {/* Barra de Busca e Filtro de Filial */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
              <div className="md:col-span-8 relative">
                <input
                  type="text"
                  value={queueSearchQuery}
                  onChange={(e) => setQueueSearchQuery(e.target.value)}
                  placeholder="Buscar por protocolo, loja, relato, fiscal ou local..."
                  className="w-full h-11 pl-10 pr-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>

              <div className="md:col-span-4">
                <select
                  value={queueBranchFilter}
                  onChange={(e) => setQueueBranchFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TODAS">Todas as Filiais ({records.length})</option>
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* LISTA AMPLA DE CARDS DA FILA */}
          <div className="space-y-3">
            {filteredQueue.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Nenhuma ocorrência encontrada</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Ajuste os filtros de status ou a busca textual para visualizar os registros da central.
                </p>
              </div>
            ) : (
              filteredQueue.map((item) => {
                // Cálculo de tempo de espera ou SLA
                let timeBadgeLabel = formatDateTimeBR(item.timestamp).slice(11, 16);
                if (item.status === 'EM_ANALISE' && item.claimedAt) {
                  const runningSecs = Math.max(0, Math.floor((nowMs - new Date(item.claimedAt).getTime()) / 1000));
                  timeBadgeLabel = `⏱️ SLA: ${formatSlaTimer(runningSecs)}`;
                } else if (item.status === 'CONCLUIDO') {
                  timeBadgeLabel = item.slaFormatted ? `Tempo: ${item.slaFormatted}` : 'Concluído';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenPreviewModal(item)}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-blue-950/30 group space-y-3"
                  >
                    {/* Linha Superior: Status + Protocolo + Origem + Horário */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {item.status === 'PENDENTE' && (
                          <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                            Novo
                          </span>
                        )}
                        {item.status === 'EM_ANALISE' && (
                          <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-sm">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Em Análise
                          </span>
                        )}
                        {item.status === 'CONCLUIDO' && (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Tratado
                          </span>
                        )}

                        <span className="font-mono text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors">
                          {item.protocol}
                        </span>

                        <span
                          className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[item.category]}20`,
                            color: CATEGORY_COLORS[item.category],
                            border: `1px solid ${CATEGORY_COLORS[item.category]}40`,
                          }}
                        >
                          {item.categoryLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          {item.source === 'RONDA_MOBILE' ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Smartphone className="w-3.5 h-3.5" /> Ronda Mobile
                            </span>
                          ) : (
                            <span className="text-blue-400 flex items-center gap-1">
                              <MonitorPlay className="w-3.5 h-3.5" /> CFTV
                            </span>
                          )}
                        </span>

                        <span className="text-slate-600">•</span>

                        <span className="text-slate-300 font-bold">
                          {timeBadgeLabel}
                        </span>
                      </div>

                    </div>

                    {/* Linha Central: Filial, Localização e Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      <div className="md:col-span-8 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-white text-sm">
                            {item.branch}
                          </span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-300 font-medium">
                            {item.cameraOrLocation}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.fieldReport?.agentNotes || item.summary}
                        </p>
                      </div>

                      {/* Miniatura de Foto e Ação de Clique */}
                      <div className="md:col-span-4 flex items-center justify-end gap-3">
                        {item.evidenceUrl && (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0 relative">
                            <img
                              src={item.evidenceUrl}
                              alt="Evidência"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          className="px-4 py-2.5 rounded-2xl bg-blue-600/10 group-hover:bg-blue-600 text-blue-400 group-hover:text-white border border-blue-500/30 group-hover:border-blue-500 text-xs font-bold flex items-center gap-2 transition-all shrink-0"
                        >
                          <span>{item.status === 'PENDENTE' ? 'Visualizar & Assumir' : item.status === 'EM_ANALISE' ? 'Continuar Tratamento' : 'Ver Detalhes'}</span>
                          <span className="text-sm">➔</span>
                        </button>
                      </div>

                    </div>

                    {/* Rodapé do Card: Fiscal / Agente responsável */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                      <span>Responsável: <strong className="text-slate-400 font-sans">{item.assignedOperator || item.operatorOrAgent}</strong></span>
                      <span>Registrado em: {formatDateTimeBR(item.timestamp)}</span>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ETAPA 2: MODAL DE PREVIEW / DETALHES IMUTÁVEIS DA LOJA                   */}
      {/* ========================================================================= */}
      {previewModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 text-white relative">
            
            {/* Fechar Modal */}
            <button
              type="button"
              onClick={handleClosePreviewModal}
              className="absolute top-6 right-6 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-base font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-xl">
                  {previewModalRecord.protocol}
                </span>

                <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase font-mono ${
                  previewModalRecord.status === 'PENDENTE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : previewModalRecord.status === 'EM_ANALISE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {previewModalRecord.status === 'PENDENTE' ? '🔴 Novo Acionamento' : previewModalRecord.status === 'EM_ANALISE' ? '🟡 Em Análise' : '🟢 Concluído'}
                </span>

                <span
                  className="px-3 py-1 rounded-xl text-xs font-bold uppercase"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[previewModalRecord.category]}20`,
                    color: CATEGORY_COLORS[previewModalRecord.category],
                    border: `1px solid ${CATEGORY_COLORS[previewModalRecord.category]}40`,
                  }}
                >
                  {previewModalRecord.categoryLabel}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white pt-1">
                Relato Original Lançado pela Loja / Ronda
              </h3>
              <p className="text-xs text-slate-400">
                Dados brutos capturados no celular pelo fiscal de solo. Modo estritamente somente leitura para garantir integridade.
              </p>
            </div>

            {/* Banner de Imutabilidade */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-blue-200">
              <Lock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>Integridade Assegurada:</strong> Este relato é 100% imutável e será anexado na íntegra ao parecer final da Central CFTV.
              </span>
            </div>

            {/* Grid com Dados do Relato Original */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Filial / Unidade:
                </span>
                <span className="text-sm font-bold text-white">
                  {previewModalRecord.branch}
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Localização / Ponto de Venda:
                </span>
                <span className="text-sm font-bold text-slate-200">
                  {previewModalRecord.fieldReport?.locationAddress || previewModalRecord.cameraOrLocation}
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fiscal Responsável (Solo):
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  {previewModalRecord.fieldReport?.agentName || previewModalRecord.operatorOrAgent}
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Data & Hora do Envio:
                </span>
                <span className="text-sm font-mono font-semibold text-slate-300">
                  {formatDateTimeBR(previewModalRecord.fieldReport?.timestamp || previewModalRecord.timestamp)}
                </span>
              </div>

            </div>

            {/* Texto do Relato na Íntegra */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Narrativa Original do Fiscal:
              </span>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                {previewModalRecord.fieldReport?.agentNotes || previewModalRecord.summary}
              </div>
            </div>

            {/* Foto de Evidência da Ronda */}
            {(previewModalRecord.fieldReport?.photoUrl || previewModalRecord.evidenceUrl) && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Foto Registrada pelo Celular do Fiscal:
                </span>
                <div 
                  onClick={() => setPreviewPhotoZoomUrl(previewModalRecord.fieldReport?.photoUrl || previewModalRecord.evidenceUrl || null)}
                  className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-64 flex items-center justify-center relative cursor-zoom-in group"
                >
                  <img
                    src={previewModalRecord.fieldReport?.photoUrl || previewModalRecord.evidenceUrl}
                    alt="Evidência do Campo"
                    className="max-h-64 w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                    <Maximize2 className="w-4 h-4" />
                    <span>Clique para Ampliar</span>
                  </div>
                </div>
              </div>
            )}

            {/* BOTÃO DE DESTAQUE / AÇÃO PRINCIPAL */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClosePreviewModal}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Voltar à Fila
              </button>

              {previewModalRecord.status === 'PENDENTE' && (
                <button
                  type="button"
                  id="btn-assume-from-modal"
                  disabled={isProcessingAction}
                  onClick={() => handleAssumeIncidentFromModal(previewModalRecord)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-rose-600/40 hover:scale-[1.02] cursor-pointer"
                >
                  {isProcessingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>ASSUMIR OCORRÊNCIA & INICIAR SLA</span>
                </button>
              )}

              {previewModalRecord.status === 'EM_ANALISE' && (
                <button
                  type="button"
                  onClick={() => handleContinueTreatmentFromModal(previewModalRecord)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-amber-600/40 hover:scale-[1.02] cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>CONTINUAR TRATAMENTO CFTV</span>
                </button>
              )}

              {previewModalRecord.status === 'CONCLUIDO' && (
                <button
                  type="button"
                  onClick={() => handleContinueTreatmentFromModal(previewModalRecord)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-600/40 hover:scale-[1.02] cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>VER TRATAMENTO CFTV / REABRIR</span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ETAPA 3: ÁREA DE TRATAMENTO ATIVO (100% FOCADA NO CFTV E SLA)            */}
      {/* ========================================================================= */}
      {currentStage === 'TREATMENT' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* BARRA SUPERIOR DE NAVEGAÇÃO E CRONÔMETRO DE SLA AO VIVO */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                id="btn-back-to-queue"
                onClick={handleBackToQueue}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para a Fila</span>
              </button>

              <div className="h-6 w-px bg-slate-800 hidden sm:block" />

              <span className="font-mono text-sm sm:text-base font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-xl">
                {isDirectCftvMode ? 'NOVO REGISTRO CFTV' : activeRecord?.protocol}
              </span>

              {activeRecord && (
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase font-mono ${
                  activeRecord.status === 'EM_ANALISE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {activeRecord.status === 'EM_ANALISE' ? '🟡 Em Tratamento Ativo' : '🟢 Concluído'}
                </span>
              )}
            </div>

            {/* CRONÔMETRO DE SLA AO VIVO */}
            <div className="flex items-center gap-3">
              {activeRecord && activeRecord.status === 'EM_ANALISE' && (
                <div className="flex items-center gap-3 bg-amber-950/80 border border-amber-500/50 px-4 py-2 rounded-2xl shadow-lg shadow-amber-950/50">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      SLA de Tratamento:
                    </span>
                    <span className="font-mono text-base font-extrabold text-amber-200 tracking-wider">
                      ⏱️ {formatSlaTimer(currentSlaSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {activeRecord && activeRecord.status === 'CONCLUIDO' && (
                <div className="flex items-center gap-2.5 bg-emerald-950/80 border border-emerald-500/50 px-4 py-2 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-300 uppercase block">Tempo Total SLA:</span>
                    <span className="font-mono text-sm font-bold text-emerald-200">
                      {activeRecord.slaFormatted || formatSlaTimer(activeRecord.slaDurationSeconds || 0)}
                    </span>
                  </div>
                </div>
              )}

              {activeRecord && activeRecord.status === 'CONCLUIDO' && (
                <button
                  type="button"
                  onClick={handleReopenIncident}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reabrir</span>
                </button>
              )}

              <button
                type="button"
                id="btn-finalize-treatment"
                disabled={isProcessingAction}
                onClick={handleFinalizeIncident}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.02] cursor-pointer"
              >
                {isProcessingAction ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Encerrar Tratamento</span>
              </button>
            </div>

          </div>

          {/* CARD SUPERIOR MINIMIZADO: RELATO ORIGINAL DA LOJA (CONSULTA) */}
          {activeRecord && activeRecord.fieldReport && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
              <div 
                onClick={() => setIsOriginalReportCollapsed(!isOriginalReportCollapsed)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      Relato Original da Loja (Modo Consulta)
                      <span className="text-[10px] text-slate-400 font-mono">
                        • {activeRecord.fieldReport.agentName || activeRecord.operatorOrAgent}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {activeRecord.branch} • {activeRecord.fieldReport.locationAddress || activeRecord.cameraOrLocation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
                  <span>{isOriginalReportCollapsed ? 'Expandir' : 'Minimizar'}</span>
                  {isOriginalReportCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>

              {!isOriginalReportCollapsed && (
                <div className="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-start text-xs animate-fadeIn">
                  <div className="md:col-span-9 p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 text-slate-300 font-sans leading-relaxed">
                    {activeRecord.fieldReport.agentNotes || activeRecord.summary}
                  </div>

                  {activeRecord.fieldReport.photoUrl && (
                    <div 
                      onClick={() => setPreviewPhotoZoomUrl(activeRecord.fieldReport?.photoUrl || null)}
                      className="md:col-span-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-28 flex items-center justify-center relative cursor-zoom-in group"
                    >
                      <img
                        src={activeRecord.fieldReport.photoUrl}
                        alt="Foto de Solo"
                        className="max-h-28 w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Ampliar
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ÁREA DE TRABALHO CFTV: FORMULÁRIOS DE ENRIQUECIMENTO */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
            
            {/* 1. MODELOS DE 1 CLIQUE PARA AUTO-PREENCHIMENTO */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-3xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                    Modelos Rápidos CFTV (1 Clique)
                  </h4>
                </div>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Preenche modus operandi e perfil suspeito
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CFTV_QUICK_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                          : 'bg-white hover:bg-blue-100/50 border-blue-200/80 text-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">
                        {preset.label}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {preset.productSector}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. CÂMERAS E REGISTROS VMS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Video className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Câmeras e Dados da Gravação VMS
                </h4>
              </div>

              {/* Atalhos Rápidos de Câmeras */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500">
                  Setores & Câmeras Críticas Monitoradas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CAMERAS_EXTENDED.map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => handleSelectPresetCamera(cam)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        cameraNumber === cam.id
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      }`}
                    >
                      {cam.id} - {cam.name.split(' - ')[1] || cam.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Câmera Identificada: *
                  </label>
                  <input
                    type="text"
                    value={cameraNumber}
                    onChange={(e) => setCameraNumber(e.target.value)}
                    placeholder="Ex: CAM-04"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.cameraNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.cameraNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Setor do Enquadramento:
                  </label>
                  <input
                    type="text"
                    value={cameraLocationSector}
                    onChange={(e) => setCameraLocationSector(e.target.value)}
                    placeholder="Ex: Corredor de Bebidas"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custódia das Imagens:
                  </label>
                  <select
                    value={preservationStatus}
                    onChange={(e) => setPreservationStatus(e.target.value as any)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="backup_vms">Salvo no Backup do VMS</option>
                    <option value="exportado_pendrive">Exportado em Mídia / Pendrive</option>
                    <option value="enviado_policia">Entregue à Polícia / Perícia</option>
                    <option value="aguardando_analise">Aguardando Gravação Completa</option>
                  </select>
                </div>
              </div>

              {/* Timestamp da Gravação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data e Hora do Fato (Gravação): *
                  </label>
                  <input
                    type="datetime-local"
                    value={recordingTimestamp}
                    onChange={(e) => setRecordingTimestamp(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.recordingTimestamp && <p className="text-[11px] text-rose-600 mt-1">{errors.recordingTimestamp}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ajuste Rápido de Timestamp:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickTimeAdjust(0)}
                      className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Agora
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTimeAdjust(15)}
                      className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      -15m
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTimeAdjust(60)}
                      className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      -1h
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTimeAdjust(240)}
                      className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      -4h
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PERFIL DO SUSPEITO & FORMULÁRIO DINÂMICO BI */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Perfil do Suspeito & Padronização Gerencial (BI)
                </h4>
              </div>

              <DynamicCategoryForm
                category={incidentCategory}
                data={categoryData}
                onChange={(newData) => setCategoryData(newData)}
                errors={errors}
              />
            </div>

            {/* 4. PARECER TÉCNICO DO OPERADOR CFTV */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <label className="text-sm font-bold text-slate-900">
                    Parecer Técnico & Complementação CFTV:
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">
                  Adicionado ao relatório final
                </span>
              </div>

              {/* Tags Rápidas */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Tags Rápidas:
                </span>
                {currentTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddSmartTag(tag)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <textarea
                value={cftvNotes}
                onChange={(e) => setCftvNotes(e.target.value)}
                placeholder="Descreva a cronologia dos fatos observados no CFTV: identificação do suspeito, modus operandi, câmeras de rastreio, atitude na frente de caixa ou descarte de itens..."
                rows={4}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
              />
            </div>

            {/* 5. SNAPSHOTS E FRAMES DO VMS */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    Frames e Evidências VMS ({images.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Faça upload de fotos das câmeras ou capture frames do VMS.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateLiveCapture}
                    className="px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-amber-600" />
                    <span>Capturar Frame VMS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Frames</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Galeria de Imagens */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group aspect-video"
                    >
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewPhotoZoomUrl(img.previewUrl)}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute bottom-1 left-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-black/70 text-[10px] font-mono text-slate-200 truncate">
                        {img.cameraName || cameraNumber} • {img.capturedTimestamp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTÕES INFERIORES DE CONCLUSÃO */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBackToQueue}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para a Fila</span>
              </button>

              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleFinalizeIncident}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.02] cursor-pointer"
              >
                {isProcessingAction ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                <span>FINALIZAR TRATAMENTO & ENCERRAR</span>
              </button>
            </div>

          </div>

        </div>
      )}
      </>
      )}

      {/* ========================================================================= */}
      {/* MODAL GLOBAL DE ZOOM EM ALTA RESOLUÇÃO                                    */}
      {/* ========================================================================= */}
      {previewPhotoZoomUrl && (
        <div 
          onClick={() => setPreviewPhotoZoomUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewPhotoZoomUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPhotoZoomUrl}
              alt="Ampliação"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain border border-slate-700 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
};
