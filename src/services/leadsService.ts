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

let serverOffline = false;

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
    if (serverOffline) {
      return getLocalLeads();
    }
    try {
      const response = await fetch("/api/leads");
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        console.warn("API was not OK or not JSON. Switching CRM to LocalStorage mode.");
        serverOffline = true;
        return getLocalLeads();
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Formato inválido recebido do servidor.");
      }
      return data;
    } catch (e) {
      console.warn("Server API not available. Falling back to LocalStorage.", e);
      serverOffline = true;
      return getLocalLeads();
    }
  },

  async addLead(leadData: { name: string; email: string; whatsapp: string; city: string; bannertype: string; notes: string }): Promise<Lead> {
    if (serverOffline) {
      const leads = getLocalLeads();
      const newLead: Lead = {
        id: "lead-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        status: "Novo Lead",
        createdAt: new Date().toISOString(),
        ...leadData
      };
      leads.unshift(newLead);
      saveLocalLeads(leads);
      return newLead;
    }
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
        serverOffline = true;
        return this.addLead(leadData); // retry recursively on fallback
      }
      return await response.json();
    } catch (e) {
      serverOffline = true;
      return this.addLead(leadData);
    }
  },

  async updateLead(id: string, updates: { status: CRMStatus; notes: string }): Promise<Lead> {
    if (serverOffline) {
      const leads = getLocalLeads();
      const index = leads.findIndex((l) => l.id === id);
      if (index === -1) {
        throw new Error("Contato não encontrado.");
      }
      const updated: Lead = {
        ...leads[index],
        status: updates.status,
        notes: updates.notes,
        updatedAt: new Date().toISOString()
      };
      leads[index] = updated;
      saveLocalLeads(leads);
      return updated;
    }
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
        serverOffline = true;
        return this.updateLead(id, updates); // retry recursively on fallback
      }
      return await response.json();
    } catch (e) {
      serverOffline = true;
      return this.updateLead(id, updates);
    }
  },

  async deleteLead(id: string): Promise<void> {
    if (serverOffline) {
      const leads = getLocalLeads();
      const filtered = leads.filter((l) => l.id !== id);
      saveLocalLeads(filtered);
      return;
    }
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          serverOffline = true;
          return this.deleteLead(id); // retry recursively on fallback
        }
        const errData = await response.json();
        throw new Error(errData?.error || "Erro ao excluir contato.");
      }
    } catch (e) {
      serverOffline = true;
      return this.deleteLead(id);
    }
  }
};
