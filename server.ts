import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";

// Helper to define standard beautiful starter seed data
const getSeedLeads = () => [
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

// Local JSON disk backup persistence 
const LEADS_FILE = path.join(process.cwd(), "leads.json");

const getLocalLeads = () => {
  if (!fs.existsSync(LEADS_FILE)) {
    const initialLeads = getSeedLeads();
    fs.writeFileSync(LEADS_FILE, JSON.stringify(initialLeads, null, 2));
    return initialLeads;
  }
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
  } catch (e) {
    return getSeedLeads();
  }
};

const saveLocalLead = (newLead: any) => {
  const leads = getLocalLeads();
  leads.unshift(newLead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
};

const updateLocalLead = (id: string, updates: any) => {
  const leads = getLocalLeads();
  const index = leads.findIndex((l: any) => l.id === id);
  if (index !== -1) {
    leads[index] = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    return leads[index];
  }
  return null;
};

const deleteLocalLead = (id: string) => {
  const leads = getLocalLeads();
  const filtered = leads.filter((l: any) => l.id !== id);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(filtered, null, 2));
};

// Lazy initialization of Firebase instance
let dbInstance: any = null;

function getDb() {
  if (!dbInstance) {
    try {
      const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(firebaseConfigPath)) {
        const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
        const app = initializeApp(firebaseConfig);
        dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        console.log("Firebase connection established on database:", firebaseConfig.firestoreDatabaseId);
      } else {
        console.warn("firebase-applet-config.json file is absent. Using local fallback.");
      }
    } catch (err) {
      console.error("Firebase startup lookup failed:", err);
    }
  }
  return dbInstance;
}

// Master Fetcher
async function loadLeads() {
  const firestoredb = getDb();
  if (!firestoredb) {
    return getLocalLeads();
  }
  try {
    const leadsCol = collection(firestoredb, "leads");
    const q = query(leadsCol, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((docRef) => {
      list.push({ id: docRef.id, ...docRef.data() });
    });
    
    // Seed Firestore database if it is currently empty
    if (list.length === 0) {
      const initial = getSeedLeads();
      for (const item of initial) {
        const { id, ...rest } = item;
        await setDoc(doc(leadsCol, id), rest);
      }
      return initial;
    }
    return list;
  } catch (err) {
    console.error("Failed to list leads from Cloud Firestore. Falling back dynamically.", err);
    return getLocalLeads();
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // GET ALL LEADS
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await loadLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error serving leads API:", error);
      res.status(500).json({ error: "Erro ao ler contatos." });
    }
  });

  // CREATE NEW LEAD (SUPPORT SECTIONS OR MANUAL INSERTIONS)
  app.post("/api/leads", async (req, res) => {
    try {
      const { name, email, whatsapp, city, bannertype, notes } = req.body;
      if (!name) {
        return res.status(400).json({ error: "O nome completo é obrigatório." });
      }
      if (!email && !whatsapp) {
        return res.status(400).json({ error: "É necessário informar pelo menos um meio de contato (WhatsApp ou E-mail)." });
      }

      const newId = "lead-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
      const leadData = {
        name: name.trim(),
        email: (email || "").trim(),
        whatsapp: (whatsapp || "").trim(),
        city: (city || "").trim(),
        bannertype: bannertype || "Geral",
        status: "Novo Lead",
        notes: (notes || "").trim(),
        createdAt: new Date().toISOString()
      };

      const firestoredb = getDb();
      if (firestoredb) {
        try {
          await setDoc(doc(firestoredb, "leads", newId), leadData);
          saveLocalLead({ id: newId, ...leadData }); // Keep local fallback file synced
          return res.status(201).json({ id: newId, ...leadData });
        } catch (firebaseErr) {
          console.error("Failed writing lead to Cloud Firestore:", firebaseErr);
        }
      }

      // Rollback fallback directly to disk
      saveLocalLead({ id: newId, ...leadData });
      res.status(201).json({ id: newId, ...leadData });
    } catch (error) {
      console.error("Erro ao salvar contato: ", error);
      res.status(500).json({ error: "Erro interno do servidor ao salvar contato." });
    }
  });

  // UPDATE LEAD STATUS/NOTES (CRM CONSOLE)
  app.put("/api/leads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, name, email, whatsapp, city, bannertype } = req.body;

      const firestoredb = getDb();
      if (firestoredb) {
        try {
          const docRef = doc(firestoredb, "leads", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const current = docSnap.data();
            const updated = {
              ...current,
              status: status !== undefined ? status : current.status,
              notes: notes !== undefined ? notes : current.notes,
              name: name !== undefined ? name.trim() : current.name,
              email: email !== undefined ? email.trim() : current.email,
              whatsapp: whatsapp !== undefined ? whatsapp.trim() : current.whatsapp,
              city: city !== undefined ? city.trim() : current.city,
              bannertype: bannertype !== undefined ? bannertype : current.bannertype,
              updatedAt: new Date().toISOString()
            };
            await setDoc(docRef, updated);
            updateLocalLead(id, updated); // Keep local fallback file synced
            return res.json({ id, ...updated });
          }
        } catch (firebaseErr) {
          console.error("Failed updating lead in Cloud Firestore:", firebaseErr);
        }
      }

      // Synchronize in local database if cloud write failed or is pending
      const updatedLocal = updateLocalLead(id, { status, notes, name, email, whatsapp, city, bannertype });
      if (!updatedLocal) {
        return res.status(404).json({ error: "Contato não encontrado." });
      }
      res.json(updatedLocal);
    } catch (error) {
      console.error("Err updates lead api:", error);
      res.status(500).json({ error: "Erro ao atualizar contato no CRM." });
    }
  });

  // DELETE LEAD
  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const firestoredb = getDb();
      let docExisted = false;

      if (firestoredb) {
        try {
          const docRef = doc(firestoredb, "leads", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            docExisted = true;
            await deleteDoc(docRef);
          }
          deleteLocalLead(id); // Keep local fallback file synced
          if (docExisted) {
            return res.json({ success: true, id });
          }
        } catch (firebaseErr) {
          console.error("Failed deleting lead from Cloud Firestore:", firebaseErr);
        }
      }

      const leads = getLocalLeads();
      const existsLocally = leads.some((l: any) => l.id === id);
      if (!existsLocally && !docExisted) {
        return res.status(404).json({ error: "Contato não encontrado." });
      }
      deleteLocalLead(id);
      res.json({ success: true, id });
    } catch (error) {
      console.error("Err deleting lead api:", error);
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
