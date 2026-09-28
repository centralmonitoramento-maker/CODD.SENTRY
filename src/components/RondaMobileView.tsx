/**
 * @file RondaMobileView.tsx
 * @description Área 1: 'Ronda Mobile' (interface otimizada para celular de uso tático, ergonomia touch, formulários rápidos em Accordions e GPS).
 */

import React, { useState, useCallback } from 'react';
import { 
  Send, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  Activity,
  History,
  AlertOctagon,
  ChevronDown,
  Layers,
  ClipboardList,
  UserCheck,
  MapPin,
  Sparkles,
  Radio,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  CategorySpecificData,
  EventCategoryKey, 
  FormErrors, 
  LocationData, 
  PhotoEvidence, 
  SubmittedReportSummary,
  UnifiedEventRecord,
  SuspectProfile
} from '../types';
import { 
  handleSubmitEvent, 
  getDefaultCategoryData,
  EVENT_TYPE_OPTIONS 
} from '../services/eventService';
import { Header } from './Header';
import { BranchSelector } from './BranchSelector';
import { EventTypeSelector } from './EventTypeSelector';
import { DynamicCategoryForm } from './DynamicCategoryForm';
import { SuspectProfileFields } from './category-forms/SuspectProfileFields';
import { LocationCaptureCard } from './LocationCaptureCard';
import { PhotoUploader } from './PhotoUploader';
import { DescriptionField } from './DescriptionField';
import { SuccessModal } from './SuccessModal';
import { ApiConsoleViewer } from './ApiConsoleViewer';
import { SosEmergencyModal } from './SosEmergencyModal';

interface RondaMobileViewProps {
  onEventSubmitted: (record: UnifiedEventRecord) => void;
}

export const RondaMobileView: React.FC<RondaMobileViewProps> = ({ onEventSubmitted }) => {
  // ==========================================
  // ESTADOS DO FORMULÁRIO
  // ==========================================
  const [branch, setBranch] = useState<string>('00 - CENTRAL DE MONITORAMENTO');
  const [eventType, setEventType] = useState<EventCategoryKey | ''>('furto');
  const [categoryData, setCategoryData] = useState<CategorySpecificData>(getDefaultCategoryData('furto'));
  const [location, setLocation] = useState<LocationData | null>(null);
  const [photo, setPhoto] = useState<PhotoEvidence | null>(null);
  const [description, setDescription] = useState<string>('');

  // Perfil do Envolvido / Suspeito centralizado (Seção 3)
  const [suspectProfile, setSuspectProfile] = useState<SuspectProfile>({
    gender: 'masculino',
    skinTone: 'parda',
    ageRange: '26_35',
    heightRange: 'medio',
    clothingStyle: 'jaqueta_casaco_pesado',
    clothingDetails: '',
    carryingAccessories: ['Mochila Térmica / Forrada'],
  });

  // Controle dos Accordions (Seção 1 aberta por padrão)
  const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>({
    1: true,  // Seção 1: Classificação do Evento (aberta por padrão)
    2: true,  // Seção 2: Detalhes da Ocorrência
    3: false, // Seção 3: Perfil do Envolvido (fechada)
    4: false, // Seção 4: Evidências e Localização (fechada)
  });

  // Estados de controle de UI, envio e SOS
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedReportSummary | null>(null);
  const [isApiInspectorOpen, setIsApiInspectorOpen] = useState<boolean>(false);
  const [recentReports, setRecentReports] = useState<SubmittedReportSummary[]>([]);
  const [showRecentDrawer, setShowRecentDrawer] = useState<boolean>(false);

  const isFormDirty = Boolean(location || photo || description.trim() || branch !== '00 - CENTRAL DE MONITORAMENTO');

  // Alternador de Accordion
  const toggleSection = (sectionIndex: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  const toggleAllSections = (open: boolean) => {
    setOpenSections({
      1: open,
      2: open,
      3: open,
      4: open,
    });
  };

  // Atualização do Perfil do Envolvido (sincroniza com categoryData se aplicável)
  const handleProfileChange = (updatedProfile: SuspectProfile) => {
    setSuspectProfile(updatedProfile);
    if (eventType === 'furto' || eventType === 'inibicao') {
      setCategoryData((prev: any) => ({
        ...prev,
        suspectProfile: updatedProfile,
      }));
    }
  };

  // Seleção de filial & tipo
  const handleBranchSelect = (selectedBranch: string) => {
    setBranch(selectedBranch);
    if (errors.branch) {
      setErrors((prev) => ({ ...prev, branch: undefined }));
    }
  };

  const handleTypeSelect = (selectedType: EventCategoryKey) => {
    setEventType(selectedType);
    const newCatData = getDefaultCategoryData(selectedType);
    if (selectedType === 'furto' || selectedType === 'inibicao') {
      (newCatData as any).suspectProfile = suspectProfile;
    }
    setCategoryData(newCatData);
    if (errors.eventType) {
      setErrors((prev) => ({ ...prev, eventType: undefined }));
    }
  };

  const handleLocationCaptured = (data: LocationData) => {
    setLocation(data);
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  const handleLocationCleared = () => {
    setLocation(null);
  };

  // Validação
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!branch.trim()) {
      newErrors.branch = 'Selecione a filial da ocorrência.';
      setOpenSections((prev) => ({ ...prev, 1: true }));
    }

    if (!eventType) {
      newErrors.eventType = 'Selecione uma categoria de evento.';
      setOpenSections((prev) => ({ ...prev, 1: true }));
    }

    if (!location) {
      newErrors.location = 'A captura do GPS é obrigatória para o despacho da ocorrência.';
      setOpenSections((prev) => ({ ...prev, 4: true }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submissão
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([100, 50, 100]);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Injeta o suspectProfile no categoryData
      const finalCategoryData: any = { ...categoryData };
      if (eventType === 'furto' || eventType === 'inibicao' || !finalCategoryData.suspectProfile) {
        finalCategoryData.suspectProfile = suspectProfile;
      }

      const result = await handleSubmitEvent(
        branch,
        eventType as EventCategoryKey,
        finalCategoryData,
        location!,
        photo,
        description
      );

      const summary: SubmittedReportSummary = {
        protocol: result.protocol,
        payload: result.payload,
        submittedAt: new Date().toISOString(),
        estimatedResolutionTime: '30 a 60 minutos',
        source: 'RONDA_MOBILE',
      };

      setSubmittedSummary(summary);
      setRecentReports((prev) => [summary, ...prev]);

      // Extração de valores de perda/recuperação
      let lossVal = 0;
      let recVal = 0;

      if (eventType === 'furto') {
        const fData = finalCategoryData;
        lossVal = parseFloat((fData.estimatedLossValue || '0').replace(/\./g, '').replace(',', '.')) || 0;
        if (fData.recoveryStatus === 'recuperado_total') {
          recVal = lossVal;
        } else if (fData.recoveryStatus === 'recuperado_parcial') {
          recVal = lossVal * 0.5;
        }
      } else if (eventType === 'inibicao') {
        const iData = finalCategoryData;
        recVal = parseFloat((iData.estimatedProtectedValue || '0').replace(/\./g, '').replace(',', '.')) || 0;
      }

      const typeMeta = EVENT_TYPE_OPTIONS.find((t) => t.id === eventType);
      const productSector = finalCategoryData.sector || finalCategoryData.sectorProtected || undefined;

      const unifiedRecord: UnifiedEventRecord = {
        id: `ronda-${Date.now()}`,
        protocol: result.protocol,
        source: 'RONDA_MOBILE',
        branch,
        category: eventType as EventCategoryKey,
        categoryLabel: typeMeta ? typeMeta.label : (eventType as string),
        timestamp: new Date().toISOString(),
        lossValue: lossVal,
        recoveredValue: recVal,
        status: 'PENDENTE',
        operatorOrAgent: 'Fiscal Ronda (Mobile)',
        cameraOrLocation: location?.address || 'Coordenadas GPS de Campo',
        summary: description || `${typeMeta?.label}: Ocorrência registrada via Ronda Mobile no setor de campo.`,
        evidenceCount: photo ? 1 : 0,
        evidenceUrl: photo?.previewUrl,
        details: finalCategoryData,
        suspectProfile,
        productSector,
        fieldReport: {
          locationAddress: location?.address || 'Área de Vendas / Loja',
          agentNotes: description,
          agentName: 'Fiscal Ronda (Mobile)',
          photoUrl: photo?.previewUrl,
          timestamp: new Date().toISOString(),
          initialCategory: eventType as EventCategoryKey,
          coordinates: location ? { lat: location.latitude, lng: location.longitude } : undefined,
        },
      };

      onEventSubmitted(unifiedRecord);
    } catch (err) {
      console.error('Falha no envio do evento:', err);
      setErrors({ general: 'Falha na conexão com a central. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = useCallback(() => {
    setBranch('00 - CENTRAL DE MONITORAMENTO');
    setEventType('furto');
    setCategoryData(getDefaultCategoryData('furto'));
    setLocation(null);
    setPhoto(null);
    setDescription('');
    setErrors({});
    setSubmittedSummary(null);
    setOpenSections({
      1: true,
      2: true,
      3: false,
      4: false,
    });
  }, []);

  const handleHeaderBack = () => {
    if (isFormDirty) {
      const confirmReset = window.confirm('Deseja descartar as informações deste evento?');
      if (confirmReset) {
        handleResetForm();
      }
    }
  };

  // Disparo de SOS recebido pelo modal
  const handleSosTriggered = (sosRecord: UnifiedEventRecord) => {
    onEventSubmitted(sosRecord);
    const summary: SubmittedReportSummary = {
      protocol: sosRecord.protocol,
      payload: {
        protocol: sosRecord.protocol,
        branch: sosRecord.branch,
        eventType: sosRecord.category,
        eventTypeLabel: sosRecord.categoryLabel,
        categoryDetails: sosRecord.details,
        location: {
          latitude: sosRecord.fieldReport?.coordinates?.lat || -23.55052,
          longitude: sosRecord.fieldReport?.coordinates?.lng || -46.633308,
          accuracyMeters: 8,
          formattedAddress: sosRecord.fieldReport?.locationAddress || 'Alerta Tático em Tempo Real',
          capturedAt: new Date().toISOString(),
        },
        additionalDescription: sosRecord.summary,
        deviceMetadata: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          networkOnline: navigator.onLine,
        },
        reportedAt: sosRecord.timestamp,
        status: 'PENDENTE',
      },
      submittedAt: sosRecord.timestamp,
      estimatedResolutionTime: 'Ação Imediata (Emergência)',
      source: 'RONDA_MOBILE',
    };
    setRecentReports((prev) => [summary, ...prev]);
  };

  const currentCategoryMeta = EVENT_TYPE_OPTIONS.find((t) => t.id === eventType);

  // Resumos para os cabeçalhos dos accordions
  const section1Summary = `${branch.split(' - ')[0]} • ${currentCategoryMeta?.label || 'Evento'}`;
  
  const getSection2Summary = () => {
    if (!eventType) return 'Aguardando categoria...';
    const anyData = categoryData as any;
    if (eventType === 'furto') {
      return anyData.estimatedLossValue ? `Perda: R$ ${anyData.estimatedLossValue}` : 'Preencher detalhes';
    }
    if (eventType === 'inibicao') {
      return anyData.estimatedProtectedValue ? `Preservado: R$ ${anyData.estimatedProtectedValue}` : 'Preencher método';
    }
    if (eventType === 'colisao') {
      return anyData.collisionLocation || 'Estacionamento / Pátio';
    }
    if (eventType === 'conflito') {
      return anyData.conflictIntensity ? `Intensidade: ${anyData.conflictIntensity}` : 'Partes envolvidas';
    }
    if (eventType === 'mal_subito') {
      return anyData.victimState || 'Estado da vítima';
    }
    return 'Detalhes da Ocorrência';
  };

  const section3Summary = `${
    suspectProfile.gender === 'masculino' ? 'Masc.' :
    suspectProfile.gender === 'feminino' ? 'Fem.' :
    suspectProfile.gender === 'dupla_mista' ? 'Dupla Mista' :
    suspectProfile.gender === 'grupo_multiplo' ? 'Grupo/Quadrilha' : 'Não Ident.'
  } • Pele ${suspectProfile.skinTone} • ${
    suspectProfile.heightRange === 'baixo' ? 'Baixa' :
    suspectProfile.heightRange === 'medio' ? 'Média' :
    suspectProfile.heightRange === 'alto' ? 'Alta' : 'Muito Alta'
  }`;

  const section4Summary = location ? 'GPS Coletado' : 'GPS Pendente';

  const allOpen = Object.values(openSections).every(Boolean);

  return (
    <div className="w-full flex flex-col justify-center items-center py-2 sm:py-6">
      {/* Container Mobile-First Centralizado */}
      <div className="w-full max-w-md flex flex-col bg-white sm:rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:border border-slate-100 overflow-hidden relative min-h-screen sm:min-h-[760px]">
        
        {/* Cabeçalho Fixo do Aplicativo */}
        <Header 
          onBack={handleHeaderBack} 
          onReset={handleResetForm}
          isDirty={isFormDirty}
        />

        {/* ========================================================================= */}
        {/* BARRA FIXA DE SOS / ALERTA GERAL NO TOPO ABSOLUTO (REQUISITO 1) */}
        {/* ========================================================================= */}
        <div className="p-3 sm:px-4 bg-linear-to-r from-red-700 via-rose-600 to-red-700 border-b border-red-800 shadow-md">
          <button
            type="button"
            id="btn-sos-alerta-geral"
            onClick={() => setIsSosOpen(true)}
            className="w-full h-13 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border-2 border-white/30 text-white font-extrabold flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-red-950/20 backdrop-blur-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-red-600 flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
                <AlertOctagon className="w-5 h-5 fill-red-600 text-white stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm tracking-wide uppercase text-white font-black">
                    🚨 SOS / ALERTA GERAL
                  </span>
                  <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping shrink-0" />
                </div>
                <p className="text-[10px] text-red-100 font-semibold tracking-tight">
                  Furto em Andamento • Quadrilha • Mal Súbito
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 group-hover:bg-white group-hover:text-red-700 transition-colors">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ACIONAR</span>
            </div>
          </button>
        </div>

        {/* Faixa Informativa de Filial e Histórico */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-2 text-slate-700 font-semibold truncate max-w-[220px]">
            <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{branch}</span>
          </span>

          <div className="flex items-center gap-3">
            {/* Alternador Rápido de Expandir/Recolher Accordions */}
            <button
              type="button"
              id="btn-toggle-all-accordions"
              onClick={() => toggleAllSections(!allOpen)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
              title={allOpen ? 'Recolher todos os cards' : 'Expandir todos os cards'}
            >
              {allOpen ? (
                <>
                  <Minimize2 className="w-3 h-3 text-slate-400" />
                  <span>Recolher</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3 text-slate-400" />
                  <span>Expandir</span>
                </>
              )}
            </button>

            {recentReports.length > 0 && (
              <button
                type="button"
                id="btn-toggle-recent-drawer"
                onClick={() => setShowRecentDrawer(!showRecentDrawer)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold transition-colors shrink-0 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                {recentReports.length} {recentReports.length === 1 ? 'enviado' : 'enviados'}
              </button>
            )}
          </div>
        </div>

        {/* FORMULÁRIO PRINCIPAL ORGANIZADO EM ACCORDIONS RETRÁTEIS */}
        <main className="flex-1 p-4 sm:p-5 space-y-3.5 pb-32 overflow-y-auto">
          
          {/* Mensagem Geral de Erro */}
          {errors.general && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 1: CLASSIFICAÇÃO DO EVENTO (Filial e Categoria - Aberta por padrão) */}
          {/* ========================================================================= */}
          <div 
            id="accordion-section-1"
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm transition-all overflow-hidden"
          >
            {/* Cabeçalho do Accordion 1 */}
            <button
              type="button"
              id="btn-toggle-section-1"
              onClick={() => toggleSection(1)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                  1
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Classificação do Evento
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      Obrigatório
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {section1Summary}
                  </p>
                </div>
              </div>

              <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-200 shrink-0 ${
                openSections[1] ? 'rotate-180 bg-blue-50 text-blue-600' : ''
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {/* Conteúdo Expansível 1 */}
            {openSections[1] && (
              <div className="p-4 pt-1 space-y-4 border-t border-slate-100 animate-fadeIn">
                {/* Filial */}
                <BranchSelector
                  value={branch}
                  onChange={handleBranchSelect}
                  error={errors.branch}
                />

                {/* Seletor de Categoria Touch-Friendly */}
                <EventTypeSelector
                  value={eventType}
                  onChange={handleTypeSelect}
                  error={errors.eventType}
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 2: DETALHES DA OCORRÊNCIA (Formulário Operacional Específico) */}
          {/* ========================================================================= */}
          <div 
            id="accordion-section-2"
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm transition-all overflow-hidden"
          >
            {/* Cabeçalho do Accordion 2 */}
            <button
              type="button"
              id="btn-toggle-section-2"
              onClick={() => toggleSection(2)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                  2
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Detalhes da Ocorrência
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                      {currentCategoryMeta?.label || 'Operacional'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {getSection2Summary()}
                  </p>
                </div>
              </div>

              <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-200 shrink-0 ${
                openSections[2] ? 'rotate-180 bg-amber-50 text-amber-600' : ''
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {/* Conteúdo Expansível 2 */}
            {openSections[2] && eventType && (
              <div className="p-4 pt-1 border-t border-slate-100 animate-fadeIn">
                <DynamicCategoryForm
                  category={eventType}
                  data={categoryData}
                  onChange={setCategoryData}
                  errors={errors.categoryFields}
                  hideProfileSection={true}
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 3: PERFIL DO ENVOLVIDO (Gênero, Etnia, Idade, Estatura, Vestimenta) */}
          {/* ========================================================================= */}
          <div 
            id="accordion-section-3"
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm transition-all overflow-hidden"
          >
            {/* Cabeçalho do Accordion 3 */}
            <button
              type="button"
              id="btn-toggle-section-3"
              onClick={() => toggleSection(3)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                  3
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Perfil do Envolvido / Suspeito
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-mono">
                      BI Estatístico
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {section3Summary}
                  </p>
                </div>
              </div>

              <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-200 shrink-0 ${
                openSections[3] ? 'rotate-180 bg-indigo-50 text-indigo-600' : ''
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {/* Conteúdo Expansível 3 */}
            {openSections[3] && (
              <div className="p-4 pt-1 border-t border-slate-100 animate-fadeIn">
                <SuspectProfileFields
                  profile={suspectProfile}
                  onChange={handleProfileChange}
                  accentColor={eventType === 'furto' ? 'rose' : 'blue'}
                  title="Características & Perfil do Suspeito / Envolvido"
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 4: EVIDÊNCIAS E LOCALIZAÇÃO (GPS em Destaque, Fotos e Descrição) */}
          {/* ========================================================================= */}
          <div 
            id="accordion-section-4"
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm transition-all overflow-hidden"
          >
            {/* Cabeçalho do Accordion 4 */}
            <button
              type="button"
              id="btn-toggle-section-4"
              onClick={() => toggleSection(4)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                  location 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' 
                    : 'bg-rose-50 border border-rose-200 text-rose-600 animate-pulse'
                }`}>
                  4
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Evidências e Localização
                    </h3>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      location 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {location ? 'GPS Ativo' : 'GPS Obrigatório'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {section4Summary} {photo ? '• Foto anexada' : ''}
                  </p>
                </div>
              </div>

              <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-200 shrink-0 ${
                openSections[4] ? 'rotate-180 bg-emerald-50 text-emerald-600' : ''
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {/* Conteúdo Expansível 4 */}
            {openSections[4] && (
              <div className="p-4 pt-1 space-y-4 border-t border-slate-100 animate-fadeIn">
                {/* 1. CAPTURA DE LOCALIZAÇÃO GPS EM DESTAQUE MÁXIMO */}
                <div className="space-y-1">
                  <LocationCaptureCard
                    location={location}
                    onLocationCaptured={handleLocationCaptured}
                    onLocationCleared={handleLocationCleared}
                    error={errors.location}
                  />
                </div>

                {/* 2. ANEXAR FOTO / EVIDÊNCIA */}
                <div className="pt-1">
                  <PhotoUploader
                    photo={photo}
                    onPhotoSelected={setPhoto}
                    onPhotoRemoved={() => setPhoto(null)}
                  />
                </div>

                {/* 3. DESCRIÇÃO ADICIONAL */}
                <div className="pt-1">
                  <DescriptionField
                    value={description}
                    onChange={setDescription}
                    category={eventType}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rodapé Informativo */}
          <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              Ronda Mobile • 39 Filiais
            </span>
            <span className="font-mono font-bold text-slate-400">GPS Tático • v3.5</span>
          </div>
        </main>

        {/* BOTÃO DE ENVIO FIXO (Sticky Footer) */}
        <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 sm:px-6 pb-6 sm:pb-5 shadow-[0_-10px_25px_rgba(0,0,0,0.04)]">
          <div className="max-w-md mx-auto space-y-2">
            <button
              type="button"
              id="btn-submit-event"
              disabled={isSubmitting}
              onClick={onSubmit}
              className={`w-full h-14 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.98] cursor-pointer ${
                isSubmitting
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-slate-600 font-bold">Enviando evento para a central...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    Registrar {currentCategoryMeta ? currentCategoryMeta.label : 'Evento'}
                  </span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Preenchimento rápido e despacho em tempo real
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAIS: SOS DE EMERGÊNCIA, SUCESSO & INSPETOR API */}
      {/* ========================================================================= */}
      
      {/* Modal de Emergência SOS */}
      <SosEmergencyModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        branch={branch}
        onTriggerSos={handleSosTriggered}
      />

      {/* Modal de Sucesso */}
      {submittedSummary && (
        <SuccessModal
          summary={submittedSummary}
          onNewReport={handleResetForm}
          onViewPayload={() => setIsApiInspectorOpen(true)}
        />
      )}

      {/* Inspetor de Payload REST */}
      <ApiConsoleViewer
        payload={submittedSummary ? (submittedSummary.payload as any) : null}
        isOpen={isApiInspectorOpen}
        onClose={() => setIsApiInspectorOpen(false)}
      />

      {/* Drawer de Histórico Recente */}
      {showRecentDrawer && recentReports.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 space-y-4 max-h-[70vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Histórico de Envios nesta Sessão
              </h3>
              <button
                type="button"
                onClick={() => setShowRecentDrawer(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
            <div className="space-y-2.5">
              {recentReports.map((report) => (
                <div key={report.protocol} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-blue-700 block">{report.protocol}</span>
                    <span className="text-slate-800 font-semibold">
                      {report.payload && 'eventTypeLabel' in report.payload ? (report.payload as any).eventTypeLabel : 'Evento'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{new Date(report.submittedAt).toLocaleTimeString('pt-BR')}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold">
                    Enviado
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
