import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const LEADS_FILE = path.join(process.cwd(), "leads.json");

  // Load leads helper
  const loadLeads = () => {
    if (!fs.existsSync(LEADS_FILE)) {
      // Seed 3 realistic leads of voters from Rio Grande do Sul to make the CRM look amazing right away!
      const initialLeads = [
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
      fs.writeFileSync(LEADS_FILE, JSON.stringify(initialLeads, null, 2));
      return initialLeads;
    }
    try {
      return JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    } catch (e) {
      return [];
    }
  };

  // Save leads helper
  const saveLeads = (leads: any[]) => {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  };

  // API endpoints
  app.get("/api/leads", (req, res) => {
    try {
      res.json(loadLeads());
    } catch (error) {
      res.status(500).json({ error: "Erro ao ler contatos." });
    }
  });

  app.post("/api/leads", (req, res) => {
    try {
      const { name, email, whatsapp, city, bannertype, notes } = req.body;
      if (!name) {
        return res.status(400).json({ error: "O nome completo é obrigatório." });
      }
      if (!email && !whatsapp) {
        return res.status(400).json({ error: "É necessário informar pelo menos um meio de contato (WhatsApp ou E-mail)." });
      }
      
      const leads = loadLeads();
      const newLead = {
        id: "lead-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        name: name.trim(),
        email: (email || "").trim(),
        whatsapp: (whatsapp || "").trim(),
        city: (city || "").trim(),
        bannertype: bannertype || "Geral",
        status: "Novo Lead",
        notes: (notes || "").trim(),
        createdAt: new Date().toISOString()
      };
      leads.unshift(newLead); // Add to the beginning
      saveLeads(leads);
      res.status(201).json(newLead);
    } catch (error) {
      console.error("Erro ao salvar contato: ", error);
      res.status(500).json({ error: "Erro interno do servidor ao salvar contato." });
    }
  });

  app.put("/api/leads/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, name, email, whatsapp, city, bannertype } = req.body;
      const leads = loadLeads();
      const index = leads.findIndex((l: any) => l.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Contato não encontrado." });
      }
      
      const currentLead = leads[index];
      leads[index] = {
        ...currentLead,
        status: status !== undefined ? status : currentLead.status,
        notes: notes !== undefined ? notes : currentLead.notes,
        name: name !== undefined ? name.trim() : currentLead.name,
        email: email !== undefined ? email.trim() : currentLead.email,
        whatsapp: whatsapp !== undefined ? whatsapp.trim() : currentLead.whatsapp,
        city: city !== undefined ? city.trim() : currentLead.city,
        bannertype: bannertype !== undefined ? bannertype : currentLead.bannertype,
        updatedAt: new Date().toISOString()
      };
      
      saveLeads(leads);
      res.json(leads[index]);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar contato no CRM." });
    }
  });

  app.delete("/api/leads/:id", (req, res) => {
    try {
      const { id } = req.params;
      const leads = loadLeads();
      const filtered = leads.filter((l: any) => l.id !== id);
      if (filtered.length === leads.length) {
        return res.status(404).json({ error: "Contato não encontrado." });
      }
      saveLeads(filtered);
      res.json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir contato do CRM." });
    }
  });

  // Serve static assets in production, otherwise Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
