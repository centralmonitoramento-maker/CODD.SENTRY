/**
 * @file cftvPresets.ts
 * @description Listas padronizadas de suspeição, modus operandi, características físicas e textos de preenchimento rápido (auto-complete) para a Central CFTV e Ronda.
 */

import { EventCategoryKey, SuspectProfile } from '../types';

export interface SuspectPreset {
  id: string;
  label: string;
  descriptionText: string;
  characteristics: string;
  modusOperandi?: string;
  category: EventCategoryKey;
  suspectProfile?: SuspectProfile;
  productSector?: string;
}

// Modelos de Suspeição e Ocorrência Padronizados (Preenchimento Rápido com 1 clique)
export const CFTV_QUICK_PRESETS: SuspectPreset[] = [
  {
    id: 'furto-bebidas-mochila',
    label: '🍾 Furto Bebidas / Mochila Térmica',
    category: 'furto',
    productSector: 'Bebidas Quentes / Destilados',
    characteristics: 'Indivíduo masculino, 30-40 anos, cor parda, altura média, boné escuro, camiseta escura e mochila térmica forrada.',
    modusOperandi: 'Ocultação em bolsa / mochila / sacola',
    descriptionText: 'Operador identificou indivíduo no corredor de destilados retirando 4 garrafas de whisky importado e ocultando diretamente na mochila térmica forrada. Suspeito monitorado até a linha de caixas, passando sem pagar. Abordado pela fiscalização externa com recuperação total.',
    suspectProfile: {
      gender: 'masculino',
      skinTone: 'parda',
      ageRange: '26_35',
      heightRange: 'medio',
      clothingStyle: 'jaqueta_casaco_pesado',
      clothingDetails: 'Camiseta preta, calça jeans escura, boné preto',
      carryingAccessories: ['Mochila Térmica / Forrada', 'Boné / Chapéu / Gorro'],
    },
  },
  {
    id: 'furto-carnes-jaleco',
    label: '🥩 Furto Carnes Nobres / Sob Vestes',
    category: 'furto',
    productSector: 'Carnes Nobres / Açougue',
    characteristics: 'Indivíduo masculino, 25-35 anos, cor branca, estatura alta, jaqueta volumosa fechada.',
    modusOperandi: 'Ocultação sob vestimentas / bolsos',
    descriptionText: 'Suspeito visualizado na ilha de congelados/carnes nobres selecionando peças de picanha e inserindo sob a vestimenta volumosa. Deslocou-se rapidamente para a saída sem transitar pelos caixas. Detido com apoio da equipe de solo.',
    suspectProfile: {
      gender: 'masculino',
      skinTone: 'branca',
      ageRange: '26_35',
      heightRange: 'alto',
      clothingStyle: 'jaqueta_casaco_pesado',
      clothingDetails: 'Casaco puffer volumoso azul marinho, calça sarja',
      carryingAccessories: ['Cinto / Suporte Oculto'],
    },
  },
  {
    id: 'furto-perfumaria-bolsa',
    label: '🧴 Furto Perfumaria / Rompimento Lacre',
    category: 'furto',
    productSector: 'Perfumaria / Higiene & Beleza',
    characteristics: 'Dupla feminina, 20-30 anos, peles branca e parda, bolsa lateral de grande porte com alicate.',
    modusOperandi: 'Rompimento / corte de etiqueta antifurto',
    descriptionText: 'Operador flagrou suspeita utilizando alicate de unha para romper lacres rígidos de cosméticos importados enquanto comparsa realizava cobertura visual. Mercadorias ocultadas em bolsa forrada.',
    suspectProfile: {
      gender: 'dupla_mista',
      skinTone: 'branca',
      ageRange: '18_25',
      heightRange: 'medio',
      clothingStyle: 'vestido_saia',
      clothingDetails: 'Vestido longo estampado e blusa cropped preta com calça jeans',
      carryingAccessories: ['Bolsa Feminina Grande', 'Óculos Escuros / Grau'],
    },
  },
  {
    id: 'inibicao-presenca',
    label: '🛡️ Inibição por Monitoramento / Rádio',
    category: 'inibicao',
    productSector: 'Eletrônicos / Telefonia & Bazar',
    characteristics: 'Dois indivíduos masculinos, 18-25 anos, moletom com capuz e boné, atitude de ronda de gôndolas.',
    modusOperandi: 'Desistência após alerta de fiscalização',
    descriptionText: 'Identificada atitude suspeita e nervosismo no setor de eletrônicos/bazar. Operador acionou fiscal de salão via rádio comunicador. Com a aproximação ostensiva do fiscal, os suspeitos abandonaram as mercadorias na gôndola e evadiram-se do estabelecimento.',
    suspectProfile: {
      gender: 'masculino',
      skinTone: 'parda',
      ageRange: '18_25',
      heightRange: 'medio',
      clothingStyle: 'moletom_capuz',
      clothingDetails: 'Moletom cinza com capuz levantado, bermuda jeans',
      carryingAccessories: ['Boné / Chapéu / Gorro', 'Mochila Convencional'],
    },
  },
  {
    id: 'colisao-estacionamento',
    label: '🚗 Colisão Estacionamento / Manobra',
    category: 'colisao',
    characteristics: 'Veículo de cliente manobrando em marcha à ré.',
    modusOperandi: 'Abalroamento em manobra',
    descriptionText: 'Imagens registraram colisão em baixa velocidade durante manobra de estacionamento, atingindo mureta de proteção/outro veículo. Imagens arquivadas para perícia e acordo entre as partes.',
  },
  {
    id: 'conflito-caixa',
    label: '🗣️ Conflito / Altercação em Checkout',
    category: 'conflito',
    characteristics: 'Clientes em discussão verbal acalorada na fila de atendimento.',
    modusOperandi: 'Desentendimento sobre fila prioritária / troco',
    descriptionText: 'Câmera do checkout registrou princípio de tumulto e discussão entre clientes. Fiscal de prevenção e encarregado de frente de caixa intervieram imediatamente pacificando a situação.',
  },
  {
    id: 'mau-procedimento-doca',
    label: '📦 Mau Procedimento em Doca / Palete',
    category: 'mau_procedimento',
    characteristics: 'Colaborador da logística/reposição sem EPI ou manuseio incorreto.',
    modusOperandi: 'Descumprimento de norma de segurança operacional',
    descriptionText: 'Filmagem registrou movimentação de carga sobreposta sem amarração com filme stretch na doca de expedição, gerando risco de queda. Fiscalização orientou readequação imediata da carga.',
  },
  {
    id: 'acidente-queda-mercadoria',
    label: '⚠️ Queda de Mercadoria / Altura',
    category: 'acidente',
    characteristics: 'Empilhadeira retrátil em operação no corredor de armazenagem.',
    modusOperandi: 'Queda de fardo durante descida de pallet',
    descriptionText: 'Registrada queda acidental de caixa com produtos frágeis durante manobra de descida do porta-palete. Área foi imediatamente isolada e limpa sem registro de vítimas.',
  },
  {
    id: 'mal-subito-atendimento',
    label: '🩺 Mal Súbito de Cliente no Salão',
    category: 'mal_subito',
    characteristics: 'Cliente atendido por brigadistas no corredor central.',
    modusOperandi: 'Queda de pressão / mal estar súbito',
    descriptionText: 'Câmera flagrou cliente sentindo tontura e sentando no piso. Brigada de emergência e socorristas da filial prestaram primeiros socorros imediatos até restabelecimento.',
  }
];

// Tags inteligentes padronizadas para acréscimo rápido na descrição do CFTV
export const CFTV_SMART_TAGS: Record<EventCategoryKey, string[]> = {
  furto: [
    'Ocultação em mochila térmica',
    'Ocultação sob vestimentas',
    'Rompimento de etiqueta de segurança',
    'Abordagem na saída sem pagar',
    'Apreensão em flagrante delito',
    'Polícia Militar 190 acionada',
    'Sem agressão física / colaborativo',
    'Tentativa de evasão frustrada',
    'Mercadoria 100% recuperada e apta para venda',
    'Confissão gravada no setor de fiscalização',
  ],
  inibicao: [
    'Presença ostensiva do fiscal de salão',
    'Alerta imediato repassado via rádio',
    'Abandono de mercadorias no corredor',
    'Evasão rápida sem consumação',
    'Prevenção de dano financeiro',
    'Comportamento típico de observador/olheiro',
    'Produtos recolocados no estoque',
  ],
  colisao: [
    'Manobra em marcha à ré',
    'Colisão contra pilastra/mureta',
    'Abalroamento lateral entre veículos',
    'Veículo de fornecedor na doca de descarga',
    'Acordo amigável entre os envolvidos',
    'Gravação preservada para seguro',
  ],
  conflito: [
    'Desentendimento em fila de checkout',
    'Discussão sobre preço de gôndola',
    'Intervenção imediata da gerência',
    'Situação pacificada sem agressão',
    'Registro preventivo de imagens',
  ],
  mau_procedimento: [
    'Falta de conferência de fundo de carrinho',
    'Palete transportado sem amarração',
    'Porta de emergência destrancada indevidamente',
    'Descarte inadequado de avarias',
    'Reciclagem de treinamento solicitada',
  ],
  mal_subito: [
    'Queda da própria altura',
    'Atendimento imediato por socorrista da loja',
    'SAMU 192 acionado',
    'Familiar informado e presente',
    'Encaminhado para UPA/Hospital',
  ],
  acidente: [
    'Piso molhado com sinalização',
    'Queda de produto da gôndola',
    'Isolamento imediato do setor',
    'Sem lesões corporais graves',
    'Relatório de segurança do trabalho emitido',
  ]
};

// Câmeras pré-configuradas do sistema CFTV com setores de risco
export const POPULAR_CAMERAS_EXTENDED = [
  { id: 'CAM-01', name: 'Entrada Principal / Portaria Social', sector: 'Acesso de Clientes' },
  { id: 'CAM-02', name: 'Estacionamento Coberto Vagas A/B', sector: 'Área Externa' },
  { id: 'CAM-04', name: 'Corredor 04 - Bebidas Quentes & Destilados', sector: 'Alto Risco (PAR)' },
  { id: 'CAM-06', name: 'Corredor 06 - Leites, Fórmulas & Nutrição', sector: 'Alto Risco (PAR)' },
  { id: 'CAM-08', name: 'Corredor 08 - Perfumaria, Desodorantes & Lâminas', sector: 'Alto Risco (PAR)' },
  { id: 'CAM-09', name: 'Corredor 09 - Bazar, Ferramentas & Pilhas', sector: 'Alto Risco (PAR)' },
  { id: 'CAM-12', name: 'Frente de Caixas (PDV 01 ao 08)', sector: 'Checkout' },
  { id: 'CAM-14', name: 'Frente de Caixas (PDV 09 ao 16 / Autoatendimento)', sector: 'Checkout' },
  { id: 'CAM-18', name: 'Corredor Carnes Nobres, Frios & Vácuo', sector: 'Perecíveis / Alto Risco' },
  { id: 'CAM-22', name: 'Estoque Central / Porta-Paletes Altos', sector: 'Armazenagem' },
  { id: 'CAM-28', name: 'Doca de Carga & Descarga 04', sector: 'Logística & Expedição' },
  { id: 'CAM-33', name: 'Saída de Emergência Lateral Oeste', sector: 'Perímetro' },
  { id: 'CAM-41', name: 'Pátio Externo de Manobras e Caminhões', sector: 'Área Externa' },
];
