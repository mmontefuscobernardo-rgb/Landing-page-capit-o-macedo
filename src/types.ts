export type CRMStatus = 
  | "Novo Lead" 
  | "Pendente" 
  | "Contatado" 
  | "Apoiador Ativo" 
  | "Multiplicador" 
  | "Arquivado";

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  bannertype: string; // The flag/theme of interest (e.g., "Segurança", "Agricultura")
  status: CRMStatus;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LegislativeProject {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string;
  impactRegion?: string;
}

export interface ParliamentaryFront {
  id: string;
  title: string;
  category: "Economia" | "Educação" | "Saúde" | "Infraestrutura" | "Segurança";
  description: string;
}
