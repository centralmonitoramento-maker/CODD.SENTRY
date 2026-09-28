/**
 * @file LocationCaptureCard.tsx
 * @description Componente de captura de geolocalização com sensor GPS e card de confirmação de coordenadas.
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  Compass, 
  ShieldCheck 
} from 'lucide-react';
import { LocationData } from '../types';
import { captureGPSLocation } from '../services/eventService';

interface LocationCaptureCardProps {
  location: LocationData | null;
  onLocationCaptured: (data: LocationData) => void;
  onLocationCleared: () => void;
  error?: string;
}

export const LocationCaptureCard: React.FC<LocationCaptureCardProps> = ({
  location,
  onLocationCaptured,
  onLocationCleared,
  error,
}) => {
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  /**
   * Dispara a captura de GPS assíncrona com animação e feedback tátil
   */
  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const coords = await captureGPSLocation();
      onLocationCaptured(coords);
    } catch (err) {
      console.error('Erro na captura de GPS:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Cabeçalho do Bloco com Indicador Obrigatório */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1">
          <span>Localização (GPS)</span>
          <span className="text-blue-600 font-bold">*</span>
        </label>
        {location && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> GPS Ativo
          </span>
        )}
      </div>

      {!location ? (
        /* Estado 1: Botão de Captura Primário Tático de Alto Destaque */
        <div className="space-y-2">
          <button
            type="button"
            id="btn-capture-gps"
            disabled={isCapturing}
            onClick={handleCapture}
            className={`w-full bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 group hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] cursor-pointer border border-blue-400/30 relative overflow-hidden ${
              error
                ? 'ring-2 ring-rose-500 shadow-rose-500/20'
                : ''
            }`}
          >
            {/* Efeito de radar sutil */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white/10 to-transparent pointer-events-none" />
            
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              {isCapturing ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <Navigation className="w-6 h-6 stroke-[2.5]" />
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md">
                  OBRIGATÓRIO
                </span>
                {isCapturing && (
                  <span className="text-[10px] font-bold text-blue-200 animate-pulse">
                    CALIBRANDO...
                  </span>
                )}
              </div>
              <p className="text-base font-extrabold text-white tracking-tight mt-0.5">
                {isCapturing ? 'Obtendo posição via satélite...' : 'Capturar Coordenadas (GPS)'}
              </p>
              <p className="text-xs text-blue-100 font-medium truncate">
                {isCapturing ? 'Aguarde a calibração de precisão...' : 'Toque para fixar o ponto exato da ocorrência'}
              </p>
            </div>
          </button>

          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            Georreferenciamento tático de alta precisão (Latitude / Longitude)
          </p>
        </div>
      ) : (
        /* Estado 2: Card de Sucesso Sleek com Coordenadas e Endereço Capturados */
        <div
          id="card-gps-success"
          className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 shadow-sm space-y-3 transition-all animate-fadeIn"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-300">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                    GPS FIXADO
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ±{location.accuracy}m precisão
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 tracking-tight mt-1 truncate">
                  {location.address || 'Localização obtida com precisão'}
                </p>
              </div>
            </div>

            {/* Ação de Recapturar */}
            <button
              type="button"
              id="btn-recapture-gps"
              onClick={handleCapture}
              disabled={isCapturing}
              title="Atualizar coordenadas GPS"
              className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isCapturing ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
          </div>

          {/* Banner de Dados Técnicos */}
          <div className="bg-white/90 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
            <span className="text-xs font-mono font-bold text-emerald-900 tracking-tight truncate">
              LAT: {location.latitude.toFixed(6)} • LONG: {location.longitude.toFixed(6)}
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0 ml-2" />
          </div>
        </div>
      )}

      {/* Alerta de Validação */}
      {error && !location && (
        <div
          id="error-location-required"
          role="alert"
          className="flex items-center gap-1.5 text-xs text-rose-600 font-medium px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 animate-shake"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
