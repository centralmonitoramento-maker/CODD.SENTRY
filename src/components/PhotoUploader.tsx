/**
 * @file PhotoUploader.tsx
 * @description Componente de upload de evidência fotográfica com suporte a Drag & Drop,
 * captura direta pela câmera do celular e preview imediato da imagem.
 */

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, UploadCloud, CheckCircle } from 'lucide-react';
import { PhotoEvidence } from '../types';
import { fileToBase64, formatBytes } from '../services/eventService';

interface PhotoUploaderProps {
  photo: PhotoEvidence | null;
  onPhotoSelected: (photo: PhotoEvidence) => void;
  onPhotoRemoved: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photo,
  onPhotoSelected,
  onPhotoRemoved,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  /**
   * Processa o arquivo selecionado ou arrastado
   */
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);

      const evidence: PhotoEvidence = {
        id: `img_${Date.now()}`,
        file,
        name: file.name || 'evidencia_fotografica.jpg',
        size: file.size,
        type: file.type,
        previewUrl,
        base64,
        capturedAt: new Date().toISOString(),
      };

      onPhotoSelected(evidence);
    } catch (err) {
      console.error('Falha ao converter imagem para base64:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5">
          <span>Evidência Visual</span>
          <span className="text-[11px] text-slate-400 font-normal lowercase">(opcional)</span>
        </label>
        {photo && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Foto Anexada
          </span>
        )}
      </div>

      {/* Inputs ocultos nativos */}
      <input
        ref={fileInputRef}
        type="file"
        id="input-file-upload"
        accept="image/png, image/jpeg, image/webp, image/heic"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        id="input-camera-capture"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {!photo ? (
        /* Estado Vazio: Área Clicável Drag & Drop + Botão de Câmera */
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Zona Principal de Upload */}
          <div
            id="dropzone-photo-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            className={`sm:col-span-3 border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[96px] ${
              isDragging
                ? 'border-blue-500 bg-blue-50/80 text-blue-800'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center border border-slate-200 shadow-sm">
                <UploadCloud className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">
                  {isProcessing ? 'Processando imagem...' : 'Toque para anexar foto'}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Arraste ou busque na galeria (JPG, PNG)
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Câmera Nativa (Mobile Rápido) */}
          <button
            type="button"
            id="btn-camera-trigger"
            onClick={() => cameraInputRef.current?.click()}
            className="sm:col-span-1 h-full min-h-[52px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex sm:flex-col items-center justify-center gap-2 p-3 text-slate-700 hover:text-slate-900 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold sm:text-[11px]">Abrir Câmera</span>
          </button>
        </div>
      ) : (
        /* Estado com Foto Anexada: Thumbnail Sleek */
        <div
          id="photo-preview-card"
          className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm animate-fadeIn"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300/80 shrink-0 relative shadow-inner">
              <img
                src={photo.previewUrl}
                alt="Prévia da evidência"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-slate-800 truncate">{photo.name}</p>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {formatBytes(photo.size)} • {photo.type.split('/')[1]?.toUpperCase() || 'IMG'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-remove-photo"
            onClick={onPhotoRemoved}
            title="Remover foto anexada"
            aria-label="Remover foto anexada"
            className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
