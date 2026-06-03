import React, { useState, useEffect } from "react";
import { 
  Users, Search, Filter, MapPin, 
  Lock, Shield, Calendar, RefreshCw, X, MessageSquare, Tag, FileText,
  User, Mail, Phone, Sprout, ShieldAlert, GraduationCap, ChevronRight, ChevronDown, Check,
  ArrowRight, HeartPulse, Menu, Quote, Globe, Vote, CheckCircle, DollarSign, Heart, MessageCircle
} from "lucide-react";
import { Lead, LegislativeProject, ParliamentaryFront } from "./types";
import { CANDIDATE_INFO, LEGISLATIVE_PROJECTS, PARLIAMENTARY_FRONTS, MUNICIPALITIES_SERVED, CAMPAIGN_FLAGS } from "./data";
import CrmDashboard from "./components/CrmDashboard";

// Import candidate campaign portrait generated in previous step
import candidateImage from "./assets/images/capitao_macedo_correto_1780458885720.png";

// Inline Custom SVG for the "Podemos 20 RS" Logo (Matches user attachment)
function PodemosRsLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="46" fill="#0A1C33" stroke="#FFCD00" strokeWidth="2.5" />
      {/* Dynamic ribbon styled like 'P' with Rio Grande do Sul colors */}
      <path d="M30 75 L30 35 C30 25, 45 20, 58 20 C70 20, 75 28, 75 38 C75 48, 68 56, 52 56 L38 56" stroke="#FFCD00" strokeWidth="2" strokeDasharray="2 2" fill="none" />
      {/* Tricolor loop of RS */}
      <path d="M26,38 C28,26 44,22 58,22 C72,22 76,32 76,42 C76,56 62,64 48,64 L34,64 L34,80 L26,80 Z" fill="#004D8C" opacity="0.2" />
      <g>
        {/* Top Green Stripe */}
        <path d="M36,28 C44,25 54,25 62,28" stroke="#009639" strokeWidth="8" strokeLinecap="round" />
        {/* Middle Red Stripe */}
        <path d="M34,38 C44,35 54,35 64,38" stroke="#DA291C" strokeWidth="8" strokeLinecap="round" />
        {/* Bottom Yellow Stripe */}
        <path d="M32,48 C42,45 52,45 62,48" stroke="#FFCD00" strokeWidth="8" strokeLinecap="round" />
        {/* Tail trailing down */}
        <path d="M34,48 Q30,62 30,76" stroke="#FFCD00" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* Crisp White Text for party number 20 */}
      <text x="49" y="44" fill="#FFFFFF" fontSize="23" fontWeight="900" textAnchor="middle" fontFamily="'Outfit', sans-serif">20</text>
      {/* Crisp White Text for state indicator RS */}
      <text x="50" y="73" fill="#FFFFFF" fontSize="13" fontWeight="800" letterSpacing="1" textAnchor="middle" fontFamily="'Outfit', sans-serif">RS</text>
    </svg>
  );
}

export default function App() {
  // Mobile navigation drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Tab/Filter for legislative projects (All vs Specific categories)
  const [expandedProject, setExpandedProject] = useState<string | null>("PL-287-2020"); // Default expand dairy law
  const [activeSegment, setActiveSegment] = useState<"todos" | "agro" | "seguranca" | "saude">("todos");

  // Municipalities Finder state
  const [citySearch, setCitySearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Todas");
  
  // Lead form submission state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCity, setFormCity] = useState("Porto Alegre");
  const [formBanner, setFormBanner] = useState("Agricultura e Produção de Leite");
  const [formOpinion, setFormOpinion] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // CRM access state
  const [isCrmOpen, setIsCrmOpen] = useState(false);

  // Phone input formatting Brazilian standard (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.substring(0, 11);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    }
    if (val.length > 7) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    }
    setFormPhone(formatted);
  };

  // Submit Lead via fetch to Express API
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    if (!formName.trim()) {
      setSubmitError("Por favor, informe seu nome completo.");
      setSubmitting(false);
      return;
    }

    if (!formPhone && !formEmail) {
      setSubmitError("Por favor, informe ao menos um contato (WhatsApp ou E-mail).");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          whatsapp: formPhone,
          city: formCity,
          bannertype: formBanner,
          notes: formOpinion || "Cadastro voluntário via Landing Page."
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error || "Ocorreu um erro ao enviar.");
      }

      setSubmitSuccess(true);
      // Clear form
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormOpinion("");
    } catch (err: any) {
      setSubmitError(err?.message || "Algo deu errado ao processar seu cadastro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter project categories
  const filteredProjects = LEGISLATIVE_PROJECTS.filter(project => {
    if (activeSegment === "todos") return true;
    if (activeSegment === "agro") return project.id.includes("517") || project.id.includes("287") || project.id.includes("279") || project.id.includes("529");
    if (activeSegment === "seguranca") return project.id.includes("43") || project.id.includes("530") || project.id.includes("200");
    if (activeSegment === "saude") return project.id.includes("43") || project.id.includes("200") || project.id.includes("163");
    return true;
  });

  // Filter municipalities list
  const filteredMunicipalities = MUNICIPALITIES_SERVED.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(citySearch.toLowerCase()) || 
                          city.resources.toLowerCase().includes(citySearch.toLowerCase());
    const matchesRegion = selectedRegion === "Todas" || city.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const regionsList = ["Todas", "Missões", "Noroeste", "Serra", "Vale do Taquari", "Fronteira Oeste", "Litoral Norte", "Norte"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative select-none">
      
      {/* 1. STATE BORDER - RIO GRANDE DO SUL OFFICIAL TRI-COLOR STRIP */}
      <div className="w-full h-1.5 flex shrink-0 sticky top-0 z-40">
        <div className="flex-1 bg-rs-green"></div>
        <div className="flex-1 bg-rs-red"></div>
        <div className="flex-1 bg-rs-yellow"></div>
      </div>

      {/* TOP ANNOUNCEMENT BANNER FOR VAQUINHA & COORDINATION */}
      <div className="bg-gradient-to-r from-rs-yellow via-amber-400 to-[#FFC72C] text-slate-900 py-2.5 px-4 text-center text-xs font-bold shadow-md flex flex-wrap justify-center items-center gap-1.5 sm:gap-3 relative z-35 border-b border-amber-500">
        <span className="inline-flex items-center gap-1 bg-slate-900 text-rs-yellow text-[9px] uppercase px-2 py-0.5 rounded font-black tracking-wider animate-pulse">
          Vaquinha Coletiva
        </span>
        <span className="text-slate-950 font-sans tracking-tight">
          Apoie nossa caminhada participando de nossa Vaquinha Online! Sra. Josi (Coordenação): <a href="https://wa.me/555193687702?text=Olá%20sra.%20Josi,%20gostaria%20de%20apoiar%20a%20campanha%20do%20Capitão%20Macedo!" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-800 font-extrabold">+55 51 9368-7702</a>
        </span>
        <a 
          href="https://queroapoiar.com.br/capitaomacedoprofessor?fbclid=IwdGRzaASMf5ljbGNrBIx_hWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHl4MY0buUyGOpL2aN-k7ISvslZlWA_0AIDR8bGofEkJD-rKrLoqt_PjdTsLS_aem_5EjP02OShasPiH3tRzfWtA&sfnsn=wiwspwa"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-black uppercase px-2.5 py-1 rounded shadow-sm hover:shadow smooth-transition inline-flex items-center gap-1.5 shrink-0"
        >
          <span>QUERO APOIAR</span>
          <ArrowRight className="w-3 h-3 text-rs-yellow" />
        </a>
      </div>

      {/* 2. HEADER NAVBAR */}
      <header className="bg-podemos-dark text-white sticky top-1.5 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          
          {/* Logo Brand Brand */}
          <a href="#inicio" className="flex items-center gap-3 hover:opacity-95 smooth-transition">
            <PodemosRsLogo className="w-12 h-12" />
            <div>
              <span className="font-display font-black text-lg tracking-wider block text-white leading-none uppercase">
                {CANDIDATE_INFO.partyName}
                <span className="text-rs-yellow font-display ml-1">{CANDIDATE_INFO.partyNumber}</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-350 block mt-0.5">
                Capitão Macedo
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <a href="#apresentacao" className="text-slate-305 hover:text-rs-yellow smooth-transition">Biografia</a>
            <a href="#frentes" className="text-slate-305 hover:text-rs-yellow smooth-transition">Bandeiras</a>
            <a href="#projetos" className="text-slate-305 hover:text-rs-yellow smooth-transition">Projetos de Lei</a>
            <a href="#municipios" className="text-slate-305 hover:text-rs-yellow smooth-transition">Entregas</a>
            <a href="#captura" className="text-slate-305 hover:text-rs-yellow smooth-transition">Apoiar Caminhada</a>
          </nav>

          {/* Action buttons (CRM & Apoio) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsCrmOpen(true)}
              className="px-3.5 py-1.5 border border-slate-700 hover:border-rs-yellow text-slate-300 hover:text-rs-yellow rounded-lg text-xs font-semibold flex items-center gap-1.5 smooth-transition"
              id="btn-nav-crm-trigger"
            >
              <Shield className="w-3.5 h-3.5 text-rs-yellow" />
              CRM Administrativo
            </button>
            <a
              href="#captura"
              className="px-4 py-2 bg-rs-yellow hover:bg-white text-podemos-dark font-display font-extrabold rounded-lg text-xs tracking-wider uppercase shadow-md hover:shadow-lg smooth-transition"
              id="btn-nav-apoio-trigger"
            >
              Ser Apoiador
            </a>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg smooth-transition"
            aria-label="Abrir menu"
            id="btn-mobile-menu"
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 md:hidden animate-fade-in" id="mobile-drawer">
          <div className="bg-podemos-dark text-white w-4/5 max-w-sm h-full p-6 flex flex-col justify-between border-r border-slate-800">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PodemosRsLogo className="w-10 h-10" />
                  <span className="font-display font-bold text-md text-white uppercase">Podemos 20</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-800 text-slate-400 rounded-lg"
                  id="btn-close-mobile-menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-center text-xs">
                <span className="text-slate-400 block mb-0.5">Pré-Candidato a Deputado Estadual</span>
                <span className="font-display font-black text-rs-yellow text-md tracking-wider">CAPITÃO MACEDO</span>
              </div>

              <nav className="flex flex-col gap-4 text-base font-semibold">
                <a 
                  href="#apresentacao" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 border-b border-slate-800 text-slate-200 hover:text-rs-yellow hover:translate-x-1 smooth-transition"
                >
                  Biografia
                </a>
                <a 
                  href="#frentes" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 border-b border-slate-800 text-slate-200 hover:text-rs-yellow hover:translate-x-1 smooth-transition"
                >
                  As 5 Grandes Bandeiras
                </a>
                <a 
                  href="#projetos" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 border-b border-slate-800 text-slate-200 hover:text-rs-yellow hover:translate-x-1 smooth-transition"
                >
                  Projetos de Lei
                </a>
                <a 
                  href="#municipios" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 border-b border-slate-800 text-slate-200 hover:text-rs-yellow hover:translate-x-1 smooth-transition"
                >
                  Projetos nos Municípios
                </a>
                <a 
                  href="#captura" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 border-b border-slate-800 text-slate-200 hover:text-rs-yellow hover:translate-x-1 smooth-transition"
                >
                  Fazer Parte do Grupo
                </a>
                <a 
                  href="https://queroapoiar.com.br/capitaomacedoprofessor?fbclid=IwdGRzaASMf5ljbGNrBIx_hWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHl4MY0buUyGOpL2aN-k7ISvslZlWA_0AIDR8bGofEkJD-rKrLoqt_PjdTsLS_aem_5EjP02OShasPiH3tRzfWtA&sfnsn=wiwspwa"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 bg-rs-yellow/10 border border-rs-yellow/30 rounded-lg text-rs-yellow hover:bg-rs-yellow hover:text-slate-900 group smooth-transition font-bold flex items-center justify-between mt-2"
                >
                  <span>Contribua na Vaquinha</span>
                  <DollarSign className="w-4 h-4 text-rs-yellow group-hover:text-slate-900 smooth-transition" />
                </a>
                <a 
                  href="https://wa.me/555193687702?text=Olá%20sra.%20Josi,%20gostaria%20de%20apoiar%20a%20campanha%20do%20Capitão%20Macedo!"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 group smooth-transition font-bold flex items-center justify-between"
                >
                  <span>Falar com Josi (Coordenação)</span>
                  <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:text-slate-950 smooth-transition animate-bounce" />
                </a>
              </nav>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCrmOpen(true);
                }}
                className="w-full py-3 border border-slate-700 text-slate-300 hover:text-rs-yellow hover:border-rs-yellow rounded-xl text-sm font-semibold flex items-center justify-center gap-2 smooth-transition"
                id="btn-drawer-crm"
              >
                <Shield className="w-4 h-4 text-rs-yellow" />
                Painel CRM da Campanha
              </button>

              <div className="text-center text-[10px] text-slate-500">
                PODEMOS RS - Capitão Macedo 2026
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HERO SECTION (TELA INICIAL) */}
      <section id="inicio" className="bg-gradient-to-br from-podemos-dark via-slate-900 to-podemos-dark text-white relative overflow-hidden py-10 md:py-16 lg:py-20">
        
        {/* Subtle decorative background - Rio Grande do Sul colors in glow */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-rs-green/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-rs-red/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-rs-yellow/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* HERO LEFT - CANDIDATE TITLES & KEY CAPTURE */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
              
              {/* Campaign tag */}
              <div className="inline-flex items-center gap-1.5 bg-slate-800/85 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-slate-200 uppercase shadow-inner mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-rs-red block"></span>
                <span>Pré-Candidato a Deputado Estadual</span>
                <span className="w-1 h-3 bg-rs-yellow block rounded-full"></span>
                <span className="text-rs-yellow font-black">PODEMOS RS</span>
              </div>

              {/* Display name with high visual weight */}
              <div className="space-y-3">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Trabalho, Coerência e <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rs-yellow via-[#FFE57F] to-white font-black block mt-2">
                    Compromisso com o RS
                  </span>
                </h1>
                
                {/* Tagline citation */}
                <p className="font-display font-medium text-lg md:text-xl text-slate-200 mt-2 italic flex items-center justify-center lg:justify-start gap-2">
                  <Quote className="w-5 h-5 text-rs-yellow shrink-0 block" />
                  "{CANDIDATE_INFO.tagline}"
                </p>
              </div>

              {/* Descriptive introduction */}
              <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                {CANDIDATE_INFO.slogan} Uma trajetória que une a seriedade da <strong className="text-white">carreira militar</strong> (Capitão da Brigada Militar), a força da <strong className="text-white">educação acadêmica</strong> como Professor e o profundo respeito a quem trabalha no <strong className="text-white">agronegócio e interior</strong>.
              </p>

              {/* Quick campaign badge highlights */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                <span className="px-3.5 py-1.5 bg-slate-800/50 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-rs-green" />
                  Liderança Propositiva
                </span>
                <span className="px-3.5 py-1.5 bg-slate-800/50 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-rs-yellow" />
                  Apoio ao Produtor de Leite
                </span>
                <span className="px-3.5 py-1.5 bg-slate-800/50 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rs-red" />
                  Ordem e Segurança Pública
                </span>
              </div>

              {/* Primary Call to Action buttons */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#captura"
                  className="px-7 py-4 bg-rs-yellow hover:bg-white text-podemos-dark font-display font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:translate-y-[-2px] smooth-transition text-center"
                  id="btn-hero-lead"
                >
                  Apoiar Pré-Campanha
                </a>
                <a
                  href="#projetos"
                  className="px-7 py-4 border border-slate-600 hover:border-slate-300 text-white font-medium text-sm rounded-xl hover:bg-slate-800 text-center smooth-transition"
                  id="btn-hero-projects"
                >
                  Ver Projetos de Lei
                </a>
              </div>

            </div>

            {/* HERO RIGHT - CANDIDATE PHOTO WITH RS FLAG & PARTY BADGE DECOR */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center">
              
              {/* Solid Frame with Rio Grande do Sul design colors around portrait */}
              <div className="absolute inset-0 bg-gradient-to-tr from-rs-green via-rs-red to-rs-yellow opacity-20 rounded-2xl rotate-3 scale-102 filter blur-sm pointer-events-none"></div>
              
              {/* Outer frame containing candidate photo */}
              <div className="relative bg-gradient-to-b from-slate-800 to-podemos-dark/60 p-2.5 rounded-2xl border border-slate-705 shadow-2xl max-w-sm w-full mx-auto animate-fade-in z-10 overflow-hidden">
                
                {/* Floating Big badge of "PODEMOS 20" */}
                <div className="absolute top-4 left-4 bg-podemos-dark/95 text-white p-2 rounded-xl flex items-center gap-2 border border-slate-700 shadow-md backdrop-blur-sm z-20">
                  <PodemosRsLogo className="w-10 h-10" />
                  <div className="text-left font-display">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Partido</span>
                    <span className="text-sm font-black text-rs-yellow leading-none uppercase">PODEMOS</span>
                  </div>
                </div>

                {/* Candidate main photograph */}
                <div className="rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-750 relative select-none">
                  <img 
                    src={candidateImage} 
                    alt="Capitão Macedo, pré-candidato a deputado estadual"
                    className="w-full h-full object-cover smooth-transition hover:scale-105"
                    referrerPolicy="no-referrer"
                    id="img-hero-candidate"
                  />
                  {/* Tri-color flag stripe overlay */}
                  <div className="absolute bottom-0 inset-x-0 h-2 flex z-10">
                    <div className="flex-1 bg-rs-green"></div>
                    <div className="flex-1 bg-rs-red"></div>
                    <div className="flex-1 bg-rs-yellow"></div>
                  </div>
                </div>

                {/* Legend container beneath photograph */}
                <div className="pt-3.5 pb-2 px-3 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <div>
                      <h3 className="font-display font-extrabold text-white text-lg leading-tight">
                        CAPITÃO MACEDO
                      </h3>
                      <p className="text-xs text-slate-350">
                        Professor Universitário & Capitão da Brigada
                      </p>
                    </div>
                    <div className="bg-rs-yellow/10 text-rs-yellow border border-rs-yellow/20 px-2.5 py-1 rounded text-xs font-black self-center sm:self-auto uppercase tracking-wider">
                      PODEMOS 20
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. HIGH LEGISLATIVE PRODUCTION BAR OVERVIEW */}
      <section className="bg-gradient-to-r from-rs-green via-slate-900 to-rs-green text-white py-6 shadow-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-700/60 text-center">
          
          <div className="pb-4 md:pb-0">
            <span className="text-white font-display text-4xl font-black block tracking-tight">
              38
            </span>
            <span className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-1 block">
              Projetos de Lei Apresentados
            </span>
          </div>

          <div className="py-4 md:py-0">
            <span className="text-[#FFE57F] font-display text-3xl font-black block tracking-tight flex justify-center items-center gap-1">
              <Sprout className="w-7 h-7 text-rs-yellow block" />
              100%
            </span>
            <span className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-1 block">
              Alinhamento com o Interior e Produtor
            </span>
          </div>

          <div className="pt-4 md:pt-0">
            <span className="text-[#FFE57F] font-display text-3xl font-black block tracking-tight">
              20+
            </span>
            <span className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-1 block">
              Municípios com Emendas de Saúde
            </span>
          </div>

        </div>
      </section>

      {/* SECTION: APOIO FINANCEIRO COLETIVO E COORDENAÇÃO DE CAMPANHA */}
      <section className="py-12 bg-slate-100/60 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest text-rs-red uppercase block mb-1">
              Colaboração Cidadã e Diálogo
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-podemos-dark">
              Participe da Nossa Caminhada
            </h3>
            <div className="w-16 h-1 bg-rs-yellow mx-auto mt-2 rounded-full"></div>
            <p className="text-slate-600 mt-3 text-sm leading-relaxed font-normal">
              Toda caminhada vitoriosa se constrói com a união de pessoas sérias. Veja abaixo como apoiar financeiramente de maneira legal e como falar diretamente com nossa coordenação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            
            {/* CARD 1: CROWDFUNDING */}
            <div className="bg-gradient-to-br from-white to-amber-50/20 p-6 rounded-2xl border border-amber-250 shadow-sm flex flex-col justify-between hover:shadow-md smooth-transition">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  <DollarSign className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 text-lg">
                    Vaquinha On-line Oficial
                  </h4>
                  <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">
                    Financiamento Coletivo Homologado pelo TSE
                  </p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Sua contribuição é fundamental para levarmos a mensagem de Ordem, Educação e Defesa da Cadeia Leiteira a todo o Rio Grande do Sul. Qualquer valor é bem-vindo e processado com segurança através do nosso portal parceiro.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 leading-normal font-normal">
                  <strong>Segurança em primeiro lugar:</strong> A doação eleitoral é registrada, com emissão de recibo e prestação de contas integral à Justiça Eleitoral.
                </div>
                <a
                  href="https://queroapoiar.com.br/capitaomacedoprofessor?fbclid=IwdGRzaASMf5ljbGNrBIx_hWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHl4MY0buUyGOpL2aN-k7ISvslZlWA_0AIDR8bGofEkJD-rKrLoqt_PjdTsLS_aem_5EjP02OShasPiH3tRzfWtA&sfnsn=wiwspwa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#FFC72C] hover:bg-slate-900 text-slate-950 hover:text-white font-display font-black text-xs uppercase tracking-wider rounded-xl text-center shadow-sm hover:shadow smooth-transition flex justify-center items-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-current shrink-0" />
                  Ir para a Vaquinha Online
                </a>
              </div>
            </div>

            {/* CARD 2: COORDINATION TEAM CONTACT */}
            <div className="bg-gradient-to-br from-white to-emerald-50/10 p-6 rounded-2xl border border-emerald-200/80 shadow-sm flex flex-col justify-between hover:shadow-md smooth-transition">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 text-lg">
                    Coordenação da Campanha
                  </h4>
                  <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">
                    Fale com a Sra. Josi (Responsável)
                  </p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Quer solicitar adesivos, materiais de campanha, tirar dúvidas sobre as propostas e frentes parlamentares de Capitão Macedo, ou convidar o pré-candidato para visitar o seu município ou bacia leiteira? Fale diretamente com a sra. Josi.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <div className="text-[11px] text-emerald-800 leading-snug font-normal">
                    <strong className="block font-bold">Sra. Josi — Mobilização Oficial</strong>
                    WhatsApp direto de atendimento ao apoiador gaúcho: +55 51 9368-7702
                  </div>
                </div>
                <a
                  href="https://wa.me/555193687702?text=Olá%20sra.%20Josi,%20gostaria%20de%20apoiar%20a%20campanha%20do%20Capitão%20Macedo!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl text-center shadow-sm hover:shadow smooth-transition flex justify-center items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  Chamar no WhatsApp (+55 51 9368-7702)
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. PRESENTATION & BIOGRAPHY ROADMAP */}
      <section id="apresentacao" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xs font-bold tracking-widest text-[#E11D48] uppercase mb-1">
              Trajetória de Serviço
            </h2>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-podemos-dark">
              Quem é o Capitão Macedo?
            </h3>
            <div className="w-16 h-1 bg-rs-yellow mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-600 mt-4 text-sm sm:text-base leading-relaxed">
              Formado em <strong className="text-slate-800">Direito</strong> e em <strong className="text-slate-800">Contabilidade</strong>, acumulou experiência de lavoura, de caserna militar e do magistério para servir ao Rio Grande do Sul com coerência e clareza de princípios.
            </p>
          </div>

          {/* Interactive Biography layout (Core pillars) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            
            {/* Biography textual citation */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm relative">
                <Quote className="w-10 h-10 text-[#FFE57F] absolute -top-4 -left-2 opacity-55" />
                <p className="text-slate-700 italic text-sm leading-relaxed relative z-10">
                  "Há trajetórias que se explicam pelos cargos que ocuparam. Outras, porém, se explicam pelos valores que as formaram. A de Aparecido Macedo pertence a esta segunda categoria. Sua história traz as marcas d’água do interior, do trabalho duro e de uma formação construída com muito esforço, disciplina e constância."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-rs-red text-white font-bold rounded-full flex items-center justify-center font-display text-xs">
                    CM
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-slate-850 text-xs">Aparecido Macedo</h5>
                    <p className="text-[10px] text-slate-500">Conhecido como Capitão Macedo</p>
                  </div>
                </div>
              </div>

              {/* Core Values Alert box */}
              <div className="bg-red-50 border-l-4 border-rs-red p-5 rounded-r-xl">
                <h4 className="font-bold text-rs-red text-xs uppercase tracking-wider">
                  Valores que Norteiam o Mandato
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed font-normal">
                  Fidelidade intocável a princípios conservadores, defesa inequívoca da segurança e da ordem pública, oposição ferrenha ao assistencialismo e compromisso com o desenvolvimento das cooperativas e de quem produz no interior gaúcho.
                </p>
              </div>
            </div>

            {/* Core Interactive Pillars list */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-slate-50 border border-slate-1 corners hover:border-slate-300 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 smooth-transition hover:bg-white">
                <div className="w-12 h-12 bg-emerald-100 text-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <Sprout className="w-6 h-6 text-[#009639]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-850 text-base">
                    Filho da Agricultura Familiar e da Terra
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Cresceu no campo onde trabalhou durante anos na lavoura do interior gaúcho. É desta base que nasce o profundo compromisso com o setor agropecuário e a defesa incondicional das famílias que vivem da produção de leite e pequenas lavouras.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-1 corners hover:border-slate-300 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 smooth-transition hover:bg-white">
                <div className="w-12 h-12 bg-red-100 text-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-[#DA291C]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-850 text-base">
                    Capitão de Carreira da Brigada Militar
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Anos de serviço dedicados à proteção de vidas e à manutenção da ordem pública. Forjado no respeito, disciplina operacional e autoridade legítima, conhece de perto a complexidade do policiamento e a necessidade de saúde mental para o policial.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-1 corners hover:border-slate-300 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 smooth-transition hover:bg-white">
                <div className="w-12 h-12 bg-blue-100 text-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-[#004D8C]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-850 text-base">
                    Educador e Profissional Qualificado
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Formado em Direito e em Contabilidade, alia formação científica à experiência prática. Atuou como professor de nível superior, defendendo que a verdadeira autoridade se constrói com sabedoria, preparo, seriedade e dedicação.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. BANDEIRAS DA CAMINHADA (THEMATIC PRIORITIES) */}
      <section id="frentes" className="py-12 md:py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xs font-bold tracking-widest text-[#009639] uppercase mb-1">
              Eixos Temáticos
            </h2>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-podemos-dark">
              Principais Bandeiras de Defesa
            </h3>
            <div className="w-16 h-1 bg-rs-green mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-600 mt-4 text-sm sm:text-base">
              Eixos concretos construídos no Parlamento sob forma de projetos de lei e ação diária de apoio ao eleitor cativo gaúcho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAMPAIGN_FLAGS.map((flag) => (
              <div 
                key={flag.id} 
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg smooth-transition flex flex-col justify-between hover:border-slate-300"
              >
                <div>
                  <div className="bg-slate-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                    {flag.id === "flag-agro" && <Sprout className="w-5 h-5 text-rs-green" />}
                    {flag.id === "flag-seg" && <ShieldAlert className="w-5 h-5 text-rs-red" />}
                    {flag.id === "flag-edu" && <GraduationCap className="w-5 h-5 text-[#004D8C]" />}
                    {flag.id === "flag-sau" && <HeartPulse className="w-5 h-5 text-rs-red" />}
                    {flag.id === "flag-val" && <Shield className="w-5 h-5 text-rs-yellow" />}
                  </div>
                  <h4 className="font-display font-extrabold text-slate-850 text-base">{flag.title}</h4>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{flag.text}</p>
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-medium">
                  <span>Defesa Intransigente</span>
                  <a href="#captura" className="text-podemos-blue font-bold flex items-center gap-0.5 hover:underline uppercase">
                    Apoiar
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}

            {/* Custom Interactive Campaign Front Highlight */}
            <div className="bg-gradient-to-br from-[#0A1C33] to-[#1E3A8A] p-6 rounded-2xl border border-slate-800 shadow-lg text-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#FFE57F] font-bold block mb-2">
                  Atuação Ativa
                </span>
                <h4 className="font-display font-black text-white text-lg">
                  Mais de 10 Frentes Parlamentares criadas
                </h4>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-normal">
                  Defesa firme dos caminhoneiros gaúchos, melhorias nas rodovias estaduais, apoio incansável às escolas profissionalizantes, expansão das escolas cívico-militares e incentivos tributários à cadeia leiteira gaúcha.
                </p>
              </div>
              <a 
                href="#frentes-detalhe"
                className="mt-6 py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold text-center border border-slate-705 shadow-md smooth-transition flex justify-center items-center gap-1.5"
                id="btn-trigger-fronts"
              >
                Conhecer Frentes Parlamentares
              </a>
            </div>

          </div>

          {/* Collapsible Parliamentary Fronts Area */}
          <div id="frentes-detalhe" className="mt-12 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
            <h4 className="font-display font-bold text-slate-850 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
              <Vote className="w-5 h-5 text-podemos-blue" />
              Sua Atuação Concreta nas Frentes Parlamentares do Rio Grande do Sul
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PARLIAMENTARY_FRONTS.map((front) => (
                <div key={front.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                  <div className="pt-0.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rs-yellow block shadow-xs ring-2 ring-rs-red"></span>
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-slate-850 text-xs">{front.title}</h5>
                    <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">{front.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 7. PROJETOS DE LEI DENTRO DO PARLAMENTO */}
      <section id="projetos" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xs font-bold tracking-widest text-[#DA291C] uppercase mb-1">
              Atuação Legislativa
            </h2>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-podemos-dark">
              Projetos de Lei em Destaque
            </h3>
            <div className="w-16 h-1 bg-rs-red mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-600 mt-4 text-sm sm:text-base leading-relaxed">
              O mandato de Capitão Macedo consolidou um trabalho pragmático, produzindo <strong className="text-slate-800">38 projetos de lei concretos</strong>. Clique em cada um para entender o impacto para a sociedade.
            </p>
          </div>

          {/* Interactive filter list segment */}
          <div className="flex justify-center gap-2 flex-wrap mb-8">
            <button
              onClick={() => setActiveSegment("todos")}
              className={`px-4 py-2 text-xs rounded-full font-bold smooth-transition ${activeSegment === "todos" ? 'bg-podemos-dark text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              id="segment-all"
            >
              Todos os Temas
            </button>
            <button
              onClick={() => setActiveSegment("agro")}
              className={`px-4 py-2 text-xs rounded-full font-bold smooth-transition ${activeSegment === "agro" ? 'bg-rs-green text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              id="segment-agro"
            >
              Fomento Agrário & Turismo
            </button>
            <button
              onClick={() => setActiveSegment("seguranca")}
              className={`px-4 py-2 text-xs rounded-full font-bold smooth-transition ${activeSegment === "seguranca" ? 'bg-rs-red text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              id="segment-seguranca"
            >
              Segurança, Vida & Valores
            </button>
            <button
              onClick={() => setActiveSegment("saude")}
              className={`px-4 py-2 text-xs rounded-full font-bold smooth-transition ${activeSegment === "saude" ? 'bg-rs-yellow text-podemos-dark' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              id="segment-saude"
            >
              Saúde Mental e Social
            </button>
          </div>

          {/* Expandable Project List element */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:items-start">
            
            {/* Project expansion selectors */}
            <div className="lg:col-span-6 space-y-3">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setExpandedProject(project.id === expandedProject ? null : project.id)}
                  className={`w-full text-left p-4 rounded-xl border smooth-transition focus:outline-none flex justify-between items-center gap-4 ${project.id === expandedProject ? 'bg-slate-800 text-white border-slate-700 shadow-md' : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'}`}
                  id={`btn-project-trigger-${project.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 ${project.id === expandedProject ? 'bg-rs-yellow text-slate-900' : 'bg-slate-200 text-slate-700'}`}>
                      PL
                    </span>
                    <div>
                      <h4 className="font-display font-extrabold text-sm">{project.title}</h4>
                      <p className={`text-xs ${project.id === expandedProject ? 'text-slate-300' : 'text-slate-500'}`}>
                        {project.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 smooth-transition ${project.id === expandedProject ? 'transform rotate-180 text-rs-yellow' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>

            {/* Project expansion visualizer */}
            <div className="lg:col-span-6">
              {expandedProject ? (
                (() => {
                  const project = LEGISLATIVE_PROJECTS.find(p => p.id === expandedProject);
                  if (!project) return null;
                  return (
                    <div className="bg-slate-800 text-slate-100 border border-slate-700 p-6 md:p-8 rounded-2xl shadow-xl space-y-4 animate-fade-in relative overflow-hidden">
                      {/* RS diagonal colored badge background decor */}
                      <div className="absolute top-0 right-0 w-12 h-12 flex">
                        <div className="w-4 bg-rs-green opacity-45"></div>
                        <div className="w-4 bg-rs-red opacity-45"></div>
                        <div className="w-4 bg-rs-yellow opacity-45"></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-rs-yellow text-slate-900 px-3 py-1 font-mono text-xs font-black rounded uppercase tracking-wider">
                          Destaque do Mandato
                        </span>
                        <span className="text-[11px] text-slate-400">Atuação Legislativa</span>
                      </div>

                      <h3 className="font-display font-black text-2xl text-white mt-1">
                        {project.title} — {project.subtitle}
                      </h3>

                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-rs-yellow">Ementa do Projeto</h4>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1 font-normal">
                          {project.description}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-700">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFCD00] flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-rs-green" />
                          Detalhes do Impacto Gaúcho
                        </h4>
                        <p className="text-xs text-slate-350 leading-relaxed mt-1.5 font-normal">
                          {project.details}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-700 flex justify-between items-center text-[10px] text-slate-500">
                        <span>Assembleia Legislativa RS</span>
                        <span>Capitão Macedo</span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 flex flex-col justify-center items-center h-full min-h-[300px]">
                  <Vote className="w-12 h-12 text-slate-300 mb-2 block" />
                  <p className="font-semibold text-slate-600">Selecione um projeto de lei ao lado</p>
                  <p className="text-xs text-slate-400 mt-1">Clique para inspecionar os detalhes e objetivos da lei.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 8. MUNICIPALITIES DELIVERIES (EMENDAS CONCRETAS) */}
      <section id="municipios" className="py-12 md:py-20 bg-slate-105">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-bold tracking-widest text-[#009639] uppercase mb-1">
              Atuação Territorial
            </h2>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-podemos-dark">
              Entrega Concreta nos Municípios
            </h3>
            <div className="w-16 h-1 bg-rs-green mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-600 mt-4 text-sm sm:text-base leading-relaxed">
              Diferente de quem apenas faz discursos, o mandato destina <strong className="text-slate-800">recursos e emendas da saúde</strong> aos hospitais e bacias de fomento do interior. Busque a sua cidade abaixo e confira o trabalho.
            </p>
          </div>

          {/* Interactive Towns finder controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-250 shadow-xs flex flex-col sm:flex-row gap-3 items-center mb-8">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Busque pela sua cidade ou recurso..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full bg-slate-50 pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-podemos-blue"
                id="input-city-search"
              />
            </div>
            
            <div className="relative w-full sm:w-auto min-w-[180px]">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-slate-50 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white"
                id="select-region-filter"
              >
                <option value="Todas">Todas as Regiões</option>
                {regionsList.filter(r => r !== "Todas").map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Towns list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[460px] overflow-y-auto pr-2 pb-2" id="municipalities-scrollbar">
            {filteredMunicipalities.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Nenhuma cidade localizada com esses filtros</p>
                <p className="text-xs text-slate-400 mt-1">Contate-nos pelo formulário abaixo e nos informe as necessidades de sua região!</p>
              </div>
            ) : (
              filteredMunicipalities.map((city) => (
                <div 
                  key={city.name} 
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-350 shadow-xs hover:shadow-md smooth-transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rs-red block shrink-0" />
                        {city.name}
                      </h4>
                      <span className="text-[9px] bg-slate-100 font-bold border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded tracking-wide uppercase">
                        {city.region}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-normal leading-relaxed">
                      {city.resources}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-[#009639] font-bold mt-2 flex items-center gap-0.5 border-t border-slate-100">
                    <span className="w-1.5 h-1.5 bg-rs-green rounded-full block"></span>
                    Emenda Aplicada
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 9. LEAD CAPTURE & INTERACTIVE SURVEY */}
      <section id="captura" className="py-12 md:py-20 bg-gradient-to-b from-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Form Left info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-xs font-bold tracking-widest text-[#E11D48] uppercase mb-1">
                  Faça Parte do Grupo
                </h2>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-podemos-dark">
                  Ajude a Construir Nossa Caminhada
                </h3>
                <div className="w-16 h-1 bg-rs-red mt-3 rounded-full"></div>
              </div>

              <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                Nosso trabalho na Assembleia se faz através do diálogo olho no olho com as bases gaúchas. Cadastre suas informações de contato e responda nossa pesquisa.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-emerald-100 text-[#009639] rounded-lg flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-slate-800 text-sm">Informação e Verdade</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Receba em primeira mão informes de emendas da saúde enviadas ao seu município.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-blue-100 text-[#004D8C] rounded-lg flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-slate-800 text-sm">Canais Seguros</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Canal de WhatsApp direto com nossa central de coordenação partidária.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-[#FFF5CC] text-[#EAB308] rounded-lg flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-slate-800 text-sm">Legislação Limpa</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Sem SPAM. Armazenamento e sigilo estrito em conformidade com a LGPD eleitoral.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-xl text-center space-y-3">
                <p className="text-xs text-slate-600 font-semibold flex flex-wrap items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span>Dúvidas? Coordenação (Sra. Josi):</span> 
                  <a href="https://wa.me/555193687702?text=Olá%20sra.%20Josi,%20gostaria%20de%20apoiar%20a%20campanha%20do%20Capitão%20Macedo!" target="_blank" rel="noopener noreferrer" className="text-emerald-750 hover:text-emerald-600 underline font-bold inline-flex items-center gap-1">
                    <span>+55 51 9368-7702</span>
                  </a>
                </p>
                <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 font-normal">
                  Total de eleitores engajados nesta semana: <strong className="text-slate-700">+{MUNICIPALITIES_SERVED.length + 31} gaúchos</strong>
                </div>
              </div>
            </div>

            {/* Lead Captura Interactive Form Card */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-lg relative">
              
              {/* Slogan details overlay top */}
              <div className="absolute top-0 right-0 h-1 bg-gradient-to-r from-rs-green via-rs-red to-rs-yellow inset-x-0 rounded-t-2xl"></div>

              <h4 className="font-display font-bold text-slate-850 text-lg flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-podemos-blue" />
                Pesquisa e Amparo de Opinião do Eleitor
              </h4>

              {submitSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 p-6 md:p-8 rounded-xl border border-emerald-200 text-center space-y-4 animate-fade-in" id="div-submit-success">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-3" />
                  </div>
                  <h4 className="font-display font-black text-xl text-emerald-950">Cadastro Concluído!</h4>
                  <p className="text-xs leading-relaxed max-w-sm mx-auto">
                    Obrigado por apoiar a caminhada do <strong>Capitão Macedo</strong>. Seus dados e opinião sobre sua cidade foram computados no nosso sistema CRM de campanha. Em breve nossa equipe entrará em contato!
                  </p>
                  
                  <div className="pt-4">
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold smooth-transition"
                    >
                      Realizar Novo Cadastro
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitLead} className="space-y-4">
                  
                  {submitError && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-xs font-semibold" id="form-error-msg">
                      {submitError}
                    </div>
                  )}

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Ronaldo Silveira"
                      className="w-full bg-slate-50 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-podemos-blue text-slate-800"
                      required
                      id="input-voter-name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* WhatsApp field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Celular / WhatsApp <span className="text-[10px] text-slate-400 font-normal">(Com DDD)</span>
                      </label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={handlePhoneChange}
                        placeholder="Ex: (51) 99123-4567"
                        className="w-full bg-slate-50 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-podemos-blue text-slate-800"
                        id="input-voter-phone"
                      />
                    </div>

                    {/* Email field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        Seu melhor E-mail
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="Ex: ronaldo@gmail.com"
                        className="w-full bg-slate-50 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-podemos-blue text-slate-800"
                        id="input-voter-email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* State city options (Selection of the 20 featured towns) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Sua Cidade de Votação
                      </label>
                      <select
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full bg-slate-50 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white"
                        id="select-voter-city"
                      >
                        {MUNICIPALITIES_SERVED.map((m) => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                        <option value="Outra Cidade do RS">Outra Cidade / Rio Grande do Sul</option>
                      </select>
                    </div>

                    {/* State primary interest option */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        Bandeira Principal que você Apoia
                      </label>
                      <select
                        value={formBanner}
                        onChange={(e) => setFormBanner(e.target.value)}
                        className="w-full bg-slate-50 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white"
                        id="select-voter-banner"
                      >
                        <option value="Agricultura e Produção de Leite">Agricultura e Cadeia de Leite</option>
                        <option value="Segurança Pública e Escolas Militares">Segurança e Escolas Cívico-Militares</option>
                        <option value="Saúde Pública e Hospitalar">Saúde Pública do Interior</option>
                        <option value="Educação e Escolas Técnicas">Ensino e Escolas Técnicas</option>
                        <option value="Desenvolvimento de Cidades e Rodovias">Infraestrutura e Rodovias</option>
                        <option value="Defesa da Vida e Valores Familiares">Valores da Família e Pró-Vida</option>
                      </select>
                    </div>
                  </div>

                  {/* Opinion questionnaire */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      Qual é o principal desafio ou necessidade de sua região hoje? <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
                    </label>
                    <textarea
                      value={formOpinion}
                      onChange={(e) => setFormOpinion(e.target.value)}
                      placeholder="Ex: Melhoria nas pastagens, asfalto da ERS-168, apoio ao hospital, etc..."
                      className="w-full bg-slate-50 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-podemos-blue text-slate-800"
                      rows={3}
                      id="input-voter-notes"
                    />
                  </div>

                  {/* Form submit btn */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-rs-red text-white font-display font-black text-sm uppercase tracking-wider rounded-xl hover:bg-slate-800 smooth-transition flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
                    id="btn-voter-submit"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Salvando dados de apoio...
                      </>
                    ) : (
                      <>
                        Enviar e Apoiar Pré-Campanha
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-400">
                    O Podemos RS respeita sua privacidade. Seus dados cadastrais serão utilizados estritamente pela coordenação de Capitão Macedo para envio de relatórios regionais de prestação de contas.
                  </p>

                </form>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* 10. REAL FOOTER WITH LOCAL CREDENTIALS & RESTRICTED ACCESS TOOL */}
      <footer className="bg-podemos-dark text-slate-300 pt-10 pb-6 shrink-0 mt-auto border-t border-slate-800 text-xs relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <PodemosRsLogo className="w-10 h-10" />
              <div>
                <span className="font-display font-black text-white text-base leading-none block">CAPITÃO MACEDO 20</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 block">Deputado Estadual — Podemos RS 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <a href="#apresentacao" className="text-slate-400 hover:text-white smooth-transition">Biografia</a>
              <span className="text-slate-700">|</span>
              <a href="#frentes" className="text-slate-400 hover:text-white smooth-transition">Frentes</a>
              <span className="text-slate-700">|</span>
              <a href="#projetos" className="text-slate-400 hover:text-white smooth-transition">Leis</a>
              <span className="text-slate-700">|</span>
              <a href="#municipios" className="text-slate-400 hover:text-white smooth-transition">Cidades Atendidas</a>
            </div>

            <button
              onClick={() => setIsCrmOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:text-rs-yellow border border-slate-700 rounded-xl font-semibold flex items-center gap-2 smooth-transition shadow-inner"
              id="btn-footer-crm-trigger"
            >
              <Shield className="w-4 h-4 text-rs-yellow" />
              Acesso Equipe - CRM
            </button>
          </div>

          <div className="border-t border-slate-800 pt-6 text-center text-[10.5px] text-slate-500 space-y-1.5 leading-relaxed font-normal">
            <p>
              CNPJ da Campanha: Em conformidade com o regimento partidário do Tribunal Superior Eleitoral (TSE).
            </p>
            <p>
              © {new Date().getFullYear()} Capitão Macedo - Todos os direitos reservados. Landing Page desenvolvida respeitando a LGPD e termos de governabilidade regional.
            </p>
          </div>

        </div>
      </footer>

      {/* 11. CRM MODAL ON TOP IF OPENED */}
      {isCrmOpen && (
        <CrmDashboard onClose={() => setIsCrmOpen(false)} />
      )}

      {/* 12. FLOATING CAMPAIGN WIDGET (STUNNING MOBILE EXPERIENCE) */}
      <div className="fixed bottom-4 right-4 z-45 flex flex-col items-end gap-2.5 max-w-xs font-sans">
        
        {/* Floating WhatsApp Card - Pulsing & Collapsible */}
        <a
          href="https://wa.me/555193687702?text=Olá%20sra.%20Josi,%20gostaria%20de%20apoiar%20a%20campanha%20do%20Capitão%20Macedo!"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-3 rounded-full shadow-2xl hover:scale-105 smooth-transition border border-emerald-500/25 ring-4 ring-emerald-500/15 group"
          title="Falar com a Sra. Josi via WhatsApp"
          id="floating-whatsapp-josi"
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <span className="text-xs tracking-tight">Falar com Josi</span>
          <MessageCircle className="w-4 bg-transparent text-white" />
        </a>

        {/* Floating Donate Button */}
        <a
          href="https://queroapoiar.com.br/capitaomacedoprofessor?fbclid=IwdGRzaASMf5ljbGNrBIx_hWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHl4MY0buUyGOpL2aN-k7ISvslZlWA_0AIDR8bGofEkJD-rKrLoqt_PjdTsLS_aem_5EjP02OShasPiH3tRzfWtA&sfnsn=wiwspwa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#FFC72C] hover:bg-slate-900 hover:text-white text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl hover:scale-105 smooth-transition border border-amber-400 group ring-4 ring-amber-400/15"
          title="Apoie a Vaquinha"
          id="floating-vaquinha-online"
        >
          <DollarSign className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="text-[11px] uppercase tracking-wider">Apoie a Vaquinha</span>
        </a>

      </div>

    </div>
  );
}
