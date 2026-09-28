import React from 'react';
import {
  CategorySpecificData,
  EventCategoryKey,
  FurtoFormData,
  InibicaoFormData,
  ColisaoFormData,
  ConflitoFormData,
  MauProcedimentoFormData,
  MalSubitoFormData,
  AcidenteFormData,
} from '../types';
import { FurtoForm } from './category-forms/FurtoForm';
import { InibicaoForm } from './category-forms/InibicaoForm';
import { ColisaoForm } from './category-forms/ColisaoForm';
import { ConflitoForm } from './category-forms/ConflitoForm';
import { MauProcedimentoForm } from './category-forms/MauProcedimentoForm';
import { MalSubitoForm } from './category-forms/MalSubitoForm';
import { AcidenteForm } from './category-forms/AcidenteForm';

interface DynamicCategoryFormProps {
  category: EventCategoryKey;
  data: CategorySpecificData;
  onChange: (updated: CategorySpecificData) => void;
  errors?: Record<string, string>;
  hideProfileSection?: boolean;
}

export const DynamicCategoryForm: React.FC<DynamicCategoryFormProps> = ({
  category,
  data,
  onChange,
  errors,
  hideProfileSection = false,
}) => {
  return (
    <div
      id="section-dynamic-category-form"
      className="p-1 sm:p-2 space-y-4"
    >
      {category === 'furto' && (
        <FurtoForm
          data={data as FurtoFormData}
          onChange={(updated) => onChange(updated)}
          errors={errors}
          hideProfileSection={hideProfileSection}
        />
      )}

      {category === 'inibicao' && (
        <InibicaoForm
          data={data as InibicaoFormData}
          onChange={(updated) => onChange(updated)}
          errors={errors}
          hideProfileSection={hideProfileSection}
        />
      )}

      {category === 'colisao' && (
        <ColisaoForm
          data={data as ColisaoFormData}
          onChange={(updated) => onChange(updated)}
          errors={errors}
        />
      )}

      {category === 'conflito' && (
        <ConflitoForm
          data={data as ConflitoFormData}
          onChange={(updated) => onChange(updated)}
          errors={errors}
        />
      )}

      {category === 'mau_procedimento' && (
        <MauProcedimentoForm
          data={data as MauProcedimentoFormData}
          onChange={(updated) => onChange(updated)}
          errors={errors}
        />
      )}

      {category === 'mal_subito' && (
        <MalSubitoForm
          data={data as MalSubitoFormData}
          onChange={(updated) => onChange(updated)}
          errors={errors}
        />
      )}

      {category === 'acidente' && (
        <AcidenteForm
          data={data as AcidenteFormData}
          onChange={(updated) => onChange(updated)}
          errors={errors}
        />
      )}
    </div>
  );
};
