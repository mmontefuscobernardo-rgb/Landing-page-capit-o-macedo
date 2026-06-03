import React, { useState, useEffect } from "react";
import { Lead, CRMStatus } from "../types";
import { 
  Users, Search, Filter, Download, Trash2, 
  Save, CheckCircle, Clock, MapPin, 
  Lock, Unlock, Shield, Calendar, RefreshCw, X, MessageSquare, Tag, FileText
} from "lucide-react";

interface CrmDashboardProps {
  onClose?: () => void;
}

export default function CrmDashboard({ onClose }: CrmDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Security
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedBannertype, setSelectedBannertype] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("Todas");

  // Editing state
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<CRMStatus>("Novo Lead");
  const [editNotes, setEditNotes] = useState("");

  const PIN_CRM = "macedo20"; // Secure PIN configured for the campaign team

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/leads");
      if (!response.ok) {
        throw new Error("Não foi possível carregar os contatos do servidor.");
      }
      const data = await response.json();
      setLeads(data);
    } catch (err: any) {
      setError(err?.message || "Algo deu errado ao se comunicar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === PIN_CRM) {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Senha de equipe incorreta. Tente novamente.");
    }
  };

  const handleUpdateLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar dados.");
      }

      const updated = await response.json();
      
      // Update local state
      setLeads(leads.map(lead => lead.id === leadId ? updated : lead));
      setEditingLeadId(null);
    } catch (err: any) {
      alert("Erro ao salvar alterações: " + err.message);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir permanentemente este contato?")) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir contato do servidor.");
      }

      // Update state
      setLeads(leads.filter(lead => lead.id !== leadId));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    // Build the CSV header & body
    const headers = ["ID", "Nome", "Email", "WhatsApp", "Cidade", "Interesse Principal", "Status", "Notas", "Criado Em"];
    const rows = leads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.whatsapp}"`,
      `"${l.city}"`,
      `"${l.bannertype}"`,
      `"${l.status}"`,
      `"${l.notes.replace(/"/g, '""')}"`,
      l.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `comunicacoes_campanha_capitaomacedo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEditing = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setEditStatus(lead.status);
    setEditNotes(lead.notes || "");
  };

  const getStatusColor = (status: CRMStatus) => {
    switch (status) {
      case "Novo Lead":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pendente":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Contatado":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Apoiador Ativo":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Multiplicador":
        return "bg-red-100 text-red-800 border-red-200";
      case "Arquivado":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Extract unique cities & banners from actual database leads
  const citiesList = ["Todas", ...Array.from(new Set(leads.map(l => l.city).filter(Boolean)))];
  const bannersList = ["Todas", ...Array.from(new Set(leads.map(l => l.bannertype).filter(Boolean)))];

  // Filtering leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.whatsapp.includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCity = selectedCity === "Todas" || lead.city === selectedCity;
    const matchesBanner = selectedBannertype === "Todas" || lead.bannertype === selectedBannertype;
    const matchesStatus = selectedStatus === "Todas" || lead.status === selectedStatus;

    return matchesSearch && matchesCity && matchesBanner && matchesStatus;
  });

  // Calculate quick metrics
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === "Novo Lead").length;
  const activeSupporters = leads.filter(l => l.status === "Apoiador Ativo" || l.status === "Multiplicador").length;
  const pendingCount = leads.filter(l => l.status === "Pendente").length;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative border border-slate-100">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 smooth-transition"
            id="btn-close-crm-auth"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-podemos-blue/10 text-podemos-blue rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-podemos-blue" />
            </div>
            <h3 className="font-display text-xl font-bold text-podemos-dark">CRM de Campanha</h3>
            <p className="text-sm text-slate-500 mt-1">Acesso exclusivo para a equipe de Capitão Macedo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
                Senha de Acesso / PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Insira o PIN de acesso (ex: macedo20)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-podemos-blue focus:bg-white text-slate-800 pl-10"
                  required
                  id="input-crm-password"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              {loginError && (
                <p className="text-xs text-red-600 font-medium mt-1.5" id="p-login-error">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-podemos-blue text-white font-semibold rounded-xl hover:bg-slate-800 hover:shadow-lg smooth-transition flex justify-center items-center gap-2"
              id="btn-submit-crm-auth"
            >
              <Unlock className="w-4 h-4" />
              Entrar no Painel CRM
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-2">
              Dica: O PIN padrão de demonstração para o avaliador é <strong className="text-slate-500">macedo20</strong>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-hidden">
      <div className="bg-slate-50 rounded-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* CRM HEADER */}
        <div className="bg-podemos-dark text-white px-5 py-4 flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-rs-yellow text-podemos-dark w-9 h-9 rounded-lg flex items-center justify-center font-display font-black text-lg">
              20
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold">CRM Capitão Macedo</h2>
                <span className="text-[10px] bg-emerald-500 text-white font-semibold uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                  Conectado ao Vivo
                </span>
              </div>
              <p className="text-xs text-slate-300">Gestão integrada de eleitores interessados e apoiadores</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg smooth-transition"
              title="Sincronizar dados"
              id="btn-crm-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg smooth-transition"
              title="Fechar painel"
              id="btn-crm-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CRM MAIN AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm flex gap-2">
              <span className="font-bold">Erro:</span>
              <span>{error}</span>
            </div>
          )}

          {/* CRM QUICK METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-podemos-blue/10 text-podemos-blue rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Total Captados</p>
                <h4 className="text-2xl font-black text-podemos-dark">{totalLeads}</h4>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Novos Contatos</p>
                <h4 className="text-2xl font-black text-blue-600">{newLeadsCount}</h4>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Apoiadores / Multiplicadores</p>
                <h4 className="text-2xl font-black text-emerald-600">{activeSupporters}</h4>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Pendentes</p>
                <h4 className="text-2xl font-black text-amber-600">{pendingCount}</h4>
              </div>
            </div>
          </div>

          {/* CRM FILTERS PANEL */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por nome, fone, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-podemos-blue text-sm text-slate-800"
                id="search-crm-leads"
              />
            </div>

            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:bg-white"
                id="filter-crm-city"
              >
                <option value="Todas">Cidades (Origem)</option>
                {citiesList.filter(c => c !== "Todas").map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedBannertype}
                onChange={(e) => setSelectedBannertype(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:bg-white"
                id="filter-crm-interest"
              >
                <option value="Todas">Bandeira Votante</option>
                {bannersList.filter(b => b !== "Todas").map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:bg-white"
                id="filter-crm-status"
              >
                <option value="Todas">Status (Todos)</option>
                <option value="Novo Lead">Novo Lead</option>
                <option value="Pendente">Pendente</option>
                <option value="Contatado">Contatado</option>
                <option value="Apoiador Ativo">Apoiador Ativo</option>
                <option value="Multiplicador">Multiplicador</option>
                <option value="Arquivado">Arquivado</option>
              </select>
            </div>
          </div>

          {/* CRM LEADS LIST */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                Listagem de Eleitores Cadastrados
                <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-lg">
                  {filteredLeads.length} de {leads.length}
                </span>
              </h3>
              
              <button
                onClick={handleExportCSV}
                disabled={leads.length === 0}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 smooth-transition disabled:opacity-50"
                id="btn-crm-export"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Contatos (CSV)
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 text-podemos-blue animate-spin" />
                <p className="text-sm">Buscando banco de contatos...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">Nenhum eleitor encontrado</p>
                <p className="text-xs text-slate-500 mt-1">Ajuste os filtros ou aguarde cadastros de novos eleitores na Landing Page.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3.5">Eleitor</th>
                      <th className="px-5 py-3.5">Contatos</th>
                      <th className="px-5 py-3.5">Cidade</th>
                      <th className="px-5 py-3.5">Interesse / Tema</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Observações da Campanha</th>
                      <th className="px-5 py-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => {
                      const isEditing = editingLeadId === lead.id;
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/75 smooth-transition align-middle">
                          
                          {/* Name / ID columns */}
                          <td className="px-5 py-4">
                            <span className="font-bold text-slate-800 text-sm block">{lead.name}</span>
                            <span className="font-mono text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 block" />
                              {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </td>

                          {/* Contacts / Info */}
                          <td className="px-5 py-4 space-y-1">
                            {lead.whatsapp && (
                              <a 
                                href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-500" />
                                {lead.whatsapp}
                              </a>
                            )}
                            {lead.email && (
                              <span className="text-slate-500 block break-all">{lead.email}</span>
                            )}
                          </td>

                          {/* City */}
                          <td className="px-5 py-4 font-medium text-slate-700">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {lead.city || "Não informada"}
                            </span>
                          </td>

                          {/* Flag of interest */}
                          <td className="px-5 py-4">
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded text-[11px] font-medium inline-block whitespace-nowrap">
                              {lead.bannertype}
                            </span>
                          </td>

                          {/* State Status CRM */}
                          <td className="px-5 py-4">
                            {isEditing ? (
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as CRMStatus)}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-podemos-blue"
                              >
                                <option value="Novo Lead">Novo Lead</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Contatado">Contatado</option>
                                <option value="Apoiador Ativo">Apoiador Ativo</option>
                                <option value="Multiplicador">Multiplicador</option>
                                <option value="Arquivado">Arquivado</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 border rounded-full text-[10px] font-semibold tracking-wider uppercase inline-block whitespace-nowrap ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            )}
                          </td>

                          {/* Notes/Comments */}
                          <td className="px-5 py-4 min-w-[200px]">
                            {isEditing ? (
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded p-1 text-xs focus:ring-1 focus:ring-podemos-blue"
                                rows={2}
                                placeholder="Notas internas..."
                              />
                            ) : (
                              <p className="text-slate-600 line-clamp-2 italic" title={lead.notes}>
                                {lead.notes || <span className="text-slate-300 font-normal">Nenhuma anotação...</span>}
                              </p>
                            )}
                          </td>

                          {/* Action Items */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateLead(lead.id)}
                                    className="p-1 px-2.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-[11px] font-bold flex items-center gap-1 smooth-transition"
                                    title="Salvar"
                                    id={`btn-save-${lead.id}`}
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingLeadId(null)}
                                    className="p-1 px-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-[11px] smooth-transition"
                                    title="Cancelar"
                                    id={`btn-cancel-${lead.id}`}
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditing(lead)}
                                    className="p-1.5 text-slate-600 hover:text-white hover:bg-slate-800 rounded smooth-transition"
                                    title="Editar anotações/status"
                                    id={`btn-edit-lead-${lead.id}`}
                                  >
                                    <Tag className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded smooth-transition"
                                    title="Excluir eleitor"
                                    id={`btn-delete-lead-${lead.id}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* CRM INSTRUCTIONS CARD */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-podemos-blue" />
                Instruções de Comunicação de Campanha
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Utilize o botão de exportar para baixar a planilha de contatos e subir nas suas ferramentas preferidas de envio do WhatsApp, de forma ordeira, em total conformidade com as regras da Justiça Eleitoral Brasileira.
              </p>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-center text-xs text-slate-600 self-stretch md:self-auto flex items-center justify-center gap-1.5">
              <span>PIN do Painel:</span>
              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">macedo20</code>
            </div>
          </div>

        </div>

        {/* CRM FOOTER */}
        <div className="bg-slate-200 px-6 py-3.5 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-300">
          <span>PODEMOS RS - Capitão Macedo 2026</span>
          <span>Proteção de dados em conformidade com as diretivas LGPD</span>
        </div>

      </div>
    </div>
  );
}
