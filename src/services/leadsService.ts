import { Lead, CRMStatus } from "../types";

const LOCAL_STORAGE_KEY = "crm_leads";

const SEED_LEADS: Lead[] = [
  {
    id: "seed-1",
    name: "Ronaldo Silveira da Silva",
    email: "ronaldo.silveira@gmail.com",
    whatsapp: "(51) 98122-3490",
    city: "São Luiz Gonzaga",
    bannertype: "Agricultura e Produção de Leite",
    status: "Apoiador Ativo",
    notes: "Agricultor familiar do interior, interessado nas propostas do PL 287/2020 e irrigação de pastagens.",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: "seed-2",
    name: "Maria Eduarda Medeiros Torres",
    email: "madu.torres@bol.com.br",
    whatsapp: "(55) 99124-5566",
    city: "Santo Ângelo",
    bannertype: "Saúde Pública e Hospitalar",
    status: "Novo Lead",
    notes: "Agradeceu os recursos mandados para o hospital de Santo Ângelo, quer atuar como voluntária de campanha.",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "seed-3",
    name: "Sargento Cláudio Antunes",
    email: "claudio.antunes@outlook.com",
    whatsapp: "(51) 99788-2233",
    city: "Giruá",
    bannertype: "Segurança Pública",
    status: "Pendente",
    notes: "Policial militar aposentado, quer agendar reunião sobre o projeto de saúde mental de agentes de segurança (PL 43/2021).",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

// Helper to get local storage leads
function getLocalLeads(): Lead[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_LEADS));
    return SEED_LEADS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return SEED_LEADS;
  }
}

// Helper to save local storage leads
function saveLocalLeads(leads: Lead[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
}

export const leadsService = {
  async getLeads(): Promise<Lead[]> {
    try {
      const response = await fetch("/api/leads");
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        console.warn("API was not OK or not JSON. Using LocalStorage fallback.");
        return getLocalLeads();
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Formato inválido recebido do servidor.");
      }
      // Sync local storage cache mirror
      saveLocalLeads(data);
      return data;
    } catch (e) {
      console.warn("Server API not available. Falling back to LocalStorage.", e);
      return getLocalLeads();
    }
  },

  async addLead(leadData: { name: string; email: string; whatsapp: string; city: string; bannertype: string; notes: string }): Promise<Lead> {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta inválida do servidor ao salvar contato.");
      }
      const savedLead = await response.json();
      
      // Mirror to local storage
      const local = getLocalLeads();
      local.unshift(savedLead);
      saveLocalLeads(local);
      
      return savedLead;
    } catch (e) {
      console.warn("Server API error during save. Saving to LocalStorage.", e);
      const local = getLocalLeads();
      const newLead: Lead = {
        id: "lead-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        status: "Novo Lead",
        createdAt: new Date().toISOString(),
        ...leadData
      };
      local.unshift(newLead);
      saveLocalLeads(local);
      return newLead;
    }
  },

  async updateLead(id: string, updates: { status: CRMStatus; notes: string }): Promise<Lead> {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta inválida do servidor ao atualizar contato.");
      }
      const updatedLead = await response.json();

      // Mirror to local storage
      const local = getLocalLeads();
      const index = local.findIndex((l) => l.id === id);
      if (index !== -1) {
        local[index] = updatedLead;
        saveLocalLeads(local);
      }
      
      return updatedLead;
    } catch (e) {
      console.warn("Server API error during update. Updating LocalStorage.", e);
      const local = getLocalLeads();
      const index = local.findIndex((l) => l.id === id);
      if (index === -1) {
        throw new Error("Contato não encontrado.");
      }
      const updated: Lead = {
        ...local[index],
        status: updates.status,
        notes: updates.notes,
        updatedAt: new Date().toISOString()
      };
      local[index] = updated;
      saveLocalLeads(local);
      return updated;
    }
  },

  async deleteLead(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Resposta do servidor inválida ao excluir contato.");
      }
      // Mirror to local storage
      const local = getLocalLeads();
      const filtered = local.filter((l) => l.id !== id);
      saveLocalLeads(filtered);
    } catch (e) {
      console.warn("Server API error during delete. Deleting from LocalStorage.", e);
      const local = getLocalLeads();
      const filtered = local.filter((l) => l.id !== id);
      saveLocalLeads(filtered);
    }
  }
};
