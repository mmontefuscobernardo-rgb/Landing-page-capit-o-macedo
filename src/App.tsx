import React, { useState, useEffect } from "react";
import { 
  Users, Search, Filter, MapPin, 
  Lock, Shield, Calendar, RefreshCw, X, MessageSquare, Tag, FileText,
  User, Mail, Phone, Sprout, ShieldAlert, GraduationCap, ChevronRight, ChevronDown, Check,
  ArrowRight, HeartPulse, Menu, Quote, Globe, Vote, CheckCircle, DollarSign, Heart, MessageCircle,
  Instagram, Facebook
} from "lucide-react";
import { Lead, LegislativeProject, ParliamentaryFront } from "./types";
import { CANDIDATE_INFO, LEGISLATIVE_PROJECTS, PARLIAMENTARY_FRONTS, MUNICIPALITIES_SERVED, CAMPAIGN_FLAGS } from "./data";
import CrmDashboard from "./components/CrmDashboard";
import { leadsService } from "./services/leadsService";

// Import/define candidate campaign portrait from public directory for reliable static hosting (Vercel)
const candidateImage = "/capitao_macedo_correto.png";

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

  // Suggestion Improvements State: Interactive Dairy (Milk) Chain Simulator
  const [milkSimulatorMode, setMilkSimulatorMode] = useState<"gaucho" | "estrangeiro">("gaucho");

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

  // Submit Lead via leadsService (handles local storage fallback on static environments)
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
      await leadsService.addLead({
        name: formName,
        email: formEmail,
        whatsapp: formPhone,
        city: formCity,
        bannertype: formBanner,
        notes: formOpinion || "Cadastro voluntário via Landing Page."
      });

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
          Apoie nossa caminhada participando de nossa Vaquinha Online! Coordenação de Campanha: <a href={`https://wa.me/555193687702?text=${encodeURIComponent("Olá! Gostaria de apoiar a campanha do Capitão Macedo.")}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-800 font-extrabold">+55 51 9368-7702</a>
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

          {/* Action buttons (CRM, Socials & Apoio) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3 mr-1">
              <a 
                href="https://www.instagram.com/stories/capitao_macedo/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-1.5 text-slate-400 hover:text-[#E1306C] transition-colors"
                title="Instagram"
                id="header-social-instagram"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
              <a 
                href="https://www.facebook.com/deputadocapitaomacedo/?locale=pt_BR" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-1.5 text-slate-400 hover:text-[#1877F2] transition-colors"
                title="Facebook"
                id="header-social-facebook"
              >
                <Facebook className="w-4.5 h-4.5" />
              </a>
            </div>
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
        <div className="fixed inset-0 bg-slate-950/95 z-50 md:hidden animate-fade-in" id="mobile-drawer">
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
                  href={`https://wa.me/555193687702?text=${encodeURIComponent("Olá! Gostaria de apoiar a campanha do Capitão Macedo.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 group smooth-transition font-bold flex items-center justify-between"
                >
                  <span>Coordenação de Campanha</span>
                  <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:text-slate-950 smooth-transition animate-bounce" />
                </a>
              </nav>
            </div>

             <div className="space-y-4">
               {/* Redes Sociais - Mobile Drawer Section */}
               <div className="border-t border-slate-800/80 pt-3.5">
                 <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                   Nossas Redes Sociais
                 </p>
                 <div className="grid grid-cols-2 gap-2">
                   <a 
                     href="https://www.instagram.com/stories/capitao_macedo/" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     onClick={() => setMobileMenuOpen(false)}
                     className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 hover:border-pink-500/40 text-white font-semibold text-xs rounded-xl transition-all"
                     id="drawer-social-instagram"
                   >
                     <Instagram className="w-4 h-4 text-pink-400" />
                     <span>Instagram</span>
                   </a>
                   <a 
                     href="https://www.facebook.com/deputadocapitaomacedo/?locale=pt_BR" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     onClick={() => setMobileMenuOpen(false)}
                     className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-blue-950/20 border border-blue-500/20 hover:border-blue-500/40 text-white font-semibold text-xs rounded-xl transition-all"
                     id="drawer-social-facebook"
                   >
                     <Facebook className="w-4 h-4 text-blue-400" />
                     <span>Facebook</span>
                   </a>
                 </div>
               </div>

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
      <section id="inicio" className="bg-gradient-to-br from-podemos-dark via-slate-900 to-podemos-dark text-white relative py-10 md:py-16 lg:py-20">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* HERO LEFT - CANDIDATE TITLES & KEY CAPTURE */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
              
              {/* Campaign tag */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                <div className="inline-flex items-center gap-1.5 bg-slate-800/85 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-slate-200 uppercase shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-rs-red block"></span>
                  <span>Pré-Candidato a Deputado Estadual</span>
                  <span className="w-1 h-3 bg-rs-yellow block rounded-full"></span>
                  <span className="text-rs-yellow font-black">PODEMOS RS</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-blue-950/70 border border-blue-800/80 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-blue-200 uppercase shadow-inner">
                  <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Capitão Macedo</span>
                </div>
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
                {CANDIDATE_INFO.slogan} Uma trajetória que une a seriedade da <strong className="text-white">carreira militar</strong> (Capitão do Exército brasileiro), a força da <strong className="text-white">educação acadêmica</strong> como Professor e o profundo respeito a quem trabalha no <strong className="text-white">agronegócio e interior</strong>.
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
                  className="px-7 py-4 bg-rs-yellow md:hover:bg-white text-podemos-dark font-display font-black text-sm uppercase tracking-wider rounded-xl shadow-lg md:hover:translate-y-[-2px] transition-all duration-200 text-center"
                  id="btn-hero-lead"
                >
                  Apoiar Pré-Campanha
                </a>
                <a
                  href="#projetos"
                  className="px-7 py-4 border border-slate-600 hover:border-slate-300 text-white font-medium text-sm rounded-xl hover:bg-slate-800 text-center transition-colors duration-200"
                  id="btn-hero-projects"
                >
                  Ver Projetos de Lei
                </a>
              </div>

            </div>

            {/* HERO RIGHT - CANDIDATE PHOTO WITH RS FLAG & PARTY BADGE DECOR */}
            <div className="lg:col-span-5 mt-8 lg:mt-0 flex justify-center w-full">
              
              {/* Sizing wrapper with exact boundary limits */}
              <div className="relative max-w-sm w-full mx-auto">
                {/* Solid Frame with Rio Grande do Sul design colors around portrait - perfectly aligned via container borders */}
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-rs-green/35 via-rs-red/35 to-rs-yellow/35 rounded-2xl pointer-events-none"></div>
                
                {/* Outer frame containing candidate photo */}
                <div className="relative bg-gradient-to-b from-slate-800 to-podemos-dark/60 p-2.5 rounded-2xl border border-slate-700 shadow-2xl w-full z-10 overflow-hidden">
                  
                  {/* Floating Big badge of "PODEMOS 20" */}
                  <div className="absolute top-4 left-4 bg-podemos-dark/98 text-white p-2 rounded-xl flex items-center gap-2 border border-slate-700 shadow-md z-20">
                    <PodemosRsLogo className="w-10 h-10" />
                    <div className="text-left font-display">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Partido</span>
                      <span className="text-sm font-black text-rs-yellow leading-none uppercase">PODEMOS</span>
                    </div>
                  </div>

                  {/* Floating Military emphasis badge */}
                  <div className="absolute top-4 right-4 bg-emerald-900/95 text-white py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-emerald-500/35 shadow-md z-20">
                    <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-100">Exército Brasileiro</span>
                  </div>

                  {/* Candidate main photograph */}
                  <div className="rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-755 relative select-none">
                    <img 
                      src={candidateImage} 
                      alt="Capitão Macedo - Capitão do Exército brasileiro e Professor"
                      className="w-full h-full object-cover transition-transform duration-300 md:hover:scale-105"
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <h3 className="font-display font-extrabold text-[#FFE57F] text-lg leading-tight flex items-center justify-center sm:justify-start gap-1">
                          <span className="text-white">CAPITÃO MACEDO</span>
                        </h3>
                        <p className="text-xs text-slate-200 font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                          <Shield className="w-3.5 h-3.5 text-blue-300 block shrink-0" />
                          <span>Capitão do Exército brasileiro</span>
                        </p>
                      </div>
                      <div className="bg-rs-yellow/10 text-rs-yellow border border-rs-yellow/20 px-2.5 py-1.5 rounded text-xs font-black self-center sm:self-auto uppercase tracking-wider">
                        PODEMOS 20
                      </div>
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
                    Atendimento Oficial ao Apoiador
                  </p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Quer solicitar adesivos, materiais de campanha, tirar dúvidas sobre as propostas e frentes parlamentares de Capitão Macedo, ou convidar o pré-candidato para visitar o seu município ou bacia leiteira? Fale diretamente com a Coordenação de Campanha.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <div className="text-[11px] text-emerald-800 leading-snug font-normal">
                    <strong className="block font-bold">Coordenação de Campanha</strong>
                    WhatsApp direto de atendimento ao apoiador gaúcho: +55 51 9368-7702
                  </div>
                </div>
                <a
                  href={`https://wa.me/555193687702?text=${encodeURIComponent("Olá! Gostaria de apoiar a campanha do Capitão Macedo.")}`}
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
                  "Há trajetórias que se explicam pelos cargos que ocuparam. Outras, porém, se explicam pelos valores que as formaram. A de Aparecido Macedo (Capitão Macedo) pertence a esta segunda categoria. Sua história traz as marcas d’água do interior, do trabalho duro e de uma formação construída com muito esforço, disciplina e constância."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-rs-red text-white font-bold rounded-full flex items-center justify-center font-display text-xs">
                    CM
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-slate-850 text-xs">Aparecido Macedo</h5>
                    <p className="text-[10px] text-slate-500">Capitão do Exército brasileiro</p>
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

              {/* Redes Sociais - Canal Direto */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h4 className="font-display font-extrabold text-[#0A1C33] text-sm">
                    Acompanhe o Capitão Macedo
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Assista aos pronunciamentos, agendas regionais de pré-campanha e posicionamentos diários nas redes oficiais:
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                   <a 
                     href="https://www.instagram.com/stories/capitao_macedo/" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white font-extrabold text-xs rounded-xl shadow-xs hover:opacity-90 active:scale-[0.98] transition-all text-center"
                     id="bio-social-instagram"
                   >
                     <Instagram className="w-4 h-4 shrink-0" />
                     <span>Siga no Instagram</span>
                   </a>
                   <a 
                     href="https://www.facebook.com/deputadocapitaomacedo/?locale=pt_BR" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all text-center"
                     id="bio-social-facebook"
                   >
                     <Facebook className="w-4 h-4 shrink-0" />
                     <span>Página no Facebook</span>
                   </a>
                </div>
              </div>

              {/* ID-RS-CULTURAL: RS pride and local traditionalism protection */}
              <div id="rs-cultural-pride-card" className="bg-gradient-to-br from-white to-amber-50/5 border-l-4 border-rs-green border-y border-r border-slate-100 p-6 rounded-r-2xl rounded-l-none shadow-sm space-y-3.5 smooth-transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 bg-[#009639]/10 text-[#009639] text-[9.5px] uppercase px-2 py-0.5 rounded-full font-black tracking-widest">
                    Cultura & Tradição
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-rs-red rounded-full animate-pulse"></span> Símbolos do RS
                  </span>
                </div>
                
                <h4 className="font-display font-extrabold text-podemos-dark text-sm flex items-center gap-2">
                  <span className="text-lg">🧉</span> Valorização do Tradicionalismo Gaúcho
                </h4>
                
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Respeito e fomento permanente aos <strong>CTGs (Centros de Tradições Gaúchas)</strong>, piquetes rurais e ao <strong>MTG</strong> como centros de formação moral de nossa juventude. Defesa intransigente de nosso hino, bandeira, história missioneira e do estilo de vida tradicional do campo.
                </p>
                
                <div className="bg-amber-500/5 hover:bg-amber-500/10 rounded-xl p-3 border border-amber-500/10 flex items-center gap-2.5">
                  <Vote className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-[10.5px] text-amber-900 leading-snug font-medium italic">
                    "O cultivo às nossas tradições gaúchas é o melhor escudo moral para aproximar as famílias e guiar novas gerações." <span className="font-bold shrink-0 block not-italic mt-0.5 text-slate-500 text-[9.5px]">— Capitão Macedo</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Core Interactive Pillars list */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-slate-50 border border-slate-100 hover:border-slate-350 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 smooth-transition hover:bg-white">
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

              <div className="bg-slate-50 border border-slate-100 hover:border-slate-350 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 smooth-transition hover:bg-white">
                <div className="w-12 h-12 bg-red-105 text-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-[#DA291C]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-850 text-base">
                    Capitão de Carreira do Exército brasileiro
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Anos de serviço dedicados à soberania nacional, proteção e manutenção da ordem. Forjado no respeito, disciplina operacional e autoridade legítima, traz a firmeza de princípios morais e cívicos essenciais para o desenvolvimento público do estado.
                  </p>
                </div>
              </div>

              {/* EDUCATION & PROFESSOR CAREER EMPHASIS CARD */}
              <div className="bg-gradient-to-br from-[#004D8C]/5 to-white border border-[#004D8C]/20 hover:border-[#004D8C]/40 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-5 smooth-transition hover:shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#004D8C]/5 rounded-bl-full group-hover:scale-110 smooth-transition"></div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-7 h-7 text-[#004D8C]" />
                </div>
                <div className="space-y-1.5 relative z-10 font-normal">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display font-black text-slate-900 text-lg">
                      Magistério e Alta Qualificação Acadêmica
                    </h4>
                    <span className="bg-[#004D8C] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-extrabold">
                      Mais de 10 anos de Docência
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Formado em duas faculdades cruciais — <strong>Direito</strong> e <strong>Contabilidade</strong> —, o Professor Aparecido Macedo alia profundo conhecimento técnico e fiscal à experiência prática de vida para legislar com responsabilidade e coerência financeira.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-[#004D8C]/5 border-l-2 border-[#004D8C] p-2.5 rounded-r bg-opacity-40">
                    Como professor universitário de nível superior, dedicou mais de uma década instruindo novas gerações. Defende firmemente que o parlamento precisa de cabeças técnicas preparadas, não de meros discursos vazios. Foca no fomento de <strong>Escolas Técnicas Profissionalizantes</strong> de nível secundário e superior para fixar nossa juventude no interior de forma qualificada.
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

          {/* INTERACTIVE MILK DEFENDER RADAR (SUGGESTION OF IMPROVEMENT) */}
          <div className="mt-10 bg-gradient-to-br from-[#009639]/5 via-amber-500/5 to-white rounded-2xl border border-rs-green/20 p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rs-green/5 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-100">
              <div className="space-y-1.5 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 bg-rs-green text-white text-[9.5px] uppercase px-2.5 py-0.5 rounded font-black tracking-widest">
                  Defesa Agrícola Ativa
                </span>
                <h4 className="font-display font-black text-podemos-dark text-xl sm:text-2xl">
                  Painel de Defesa: O Futuro da Bacia Leiteira do RS
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Como eleitor gaúcho, explore interativamente as duas realidades de mercado do nosso estado e veja o impacto real dos Projetos de Lei do Capitão Macedo na agricultura familiar.
                </p>
              </div>

              {/* Selector Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl self-start lg:self-center shrink-0 border border-slate-205">
                <button
                  onClick={() => setMilkSimulatorMode("gaucho")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                    milkSimulatorMode === "gaucho"
                      ? "bg-[#009639] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  id="btn-sim-gaucho"
                >
                  <CheckCircle className="w-4 h-4" />
                  Modelo Capitão Macedo
                </button>
                <button
                  onClick={() => setMilkSimulatorMode("estrangeiro")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                    milkSimulatorMode === "estrangeiro"
                      ? "bg-[#DA291C] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-[#DA291C]"
                  }`}
                  id="btn-sim-unregulated"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Cenário Sem Regulação
                </button>
              </div>
            </div>

            {/* Simulated Content cards Grid */}
            {milkSimulatorMode === "gaucho" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in" id="panel-sim-active-gaucho">
                
                <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-3 relative hover:border-emerald-300 transition-all">
                  <div className="w-9 h-9 bg-emerald-50 text-[#009639] rounded-lg flex items-center justify-center">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#009639] font-black">LEI DE ORIGEM</span>
                    <h5 className="font-display font-extrabold text-slate-850 text-sm mt-0.5">Rótulo Exclusivo (PL 287/2020)</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Obrigatoriedade de selo claro apontando o leite reconstituído importado pelas indústrias. O consumidor compra sabendo que incentiva o produtor gaúcho de perto.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-3 relative hover:border-emerald-300 transition-all">
                  <div className="w-9 h-9 bg-emerald-50 text-[#009639] rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#009639] font-black">SISTEMAS DE IRRIGAÇÃO</span>
                    <h5 className="font-display font-extrabold text-slate-850 text-sm mt-0.5">Defesa Contra Secas (PL 279/2020)</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Incentivos públicos e destinação do Fundoleite direto para equipar poços artesianos e irrigar pastagens. Fartura garantida para o gado mesmo em estiagens.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-3 relative hover:border-emerald-300 transition-all">
                  <div className="w-9 h-9 bg-emerald-50 text-[#009639] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#009639] font-black">DIGNIDADE DAS FAMÍLIAS</span>
                    <h5 className="font-display font-extrabold text-slate-850 text-sm mt-0.5">Combate ao Êxodo Rural</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Proteção de mais de 62.000 propriedades familiares do RS, segurando renda no campo, estimulando as cooperativas agrícolas locais e girando riqueza no interior.
                  </p>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in" id="panel-sim-active-estrangeiro">
                
                <div className="bg-white p-5 rounded-xl border border-red-105 shadow-xs space-y-3 relative hover:border-red-200 transition-all">
                  <div className="w-9 h-9 bg-red-50 text-[#DA291C] rounded-lg flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-red-500 font-black">CONCORRÊNCIA DESLEAL</span>
                    <h5 className="font-display font-extrabold text-slate-850 text-sm mt-0.5">Leite Sem Selo e Sem Rastreio</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Ingresso desordenado de excedentes subsidiados do Uruguai/Argentina. Grandes laticínios usam leite em pó reconstruído sem que o consumidor gaúcho saiba.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-red-105 shadow-xs space-y-3 relative hover:border-red-200 transition-all">
                  <div className="w-9 h-9 bg-red-50 text-[#DA291C] rounded-lg flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-red-500 font-black">DEPENDÊNCIA DO CLIMA</span>
                    <h5 className="font-display font-extrabold text-slate-850 text-sm mt-0.5">Estiagens Sem Socorro Direto</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Secas severas causam estresse térmico no gado, diminuem a produção de alimento e destroem o fluxo financeiro do produtor por falta de crédito para poços e aspersores.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-red-105 shadow-xs space-y-3 relative hover:border-red-200 transition-all">
                  <div className="w-9 h-9 bg-red-50 text-[#DA291C] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-red-500 font-black">FALÊNCIA DO PEQUENO</span>
                    <h5 className="font-display font-extrabold text-slate-850 text-sm mt-0.5">Desativação das Bacias Familiares</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Inviabilidade econômica derruba as pequenas propriedades. Jovens migram em massa do interior para as grandes metrópoles gaúchas em busca de emprego informal.
                  </p>
                </div>

              </div>
            )}

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3.5 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <span className="text-xl">🙌</span>
                <p className="text-[11.5px] text-slate-600 leading-normal font-normal">
                  Quer apoiar essa luta nacional e regional em defesa da agricultura familiar gaucha? Junte-se a nós participando do apoiaço online e fazendo valer as marcas do nosso interior gaúcho.
                </p>
              </div>
              <a 
                href="#captura"
                className="px-5 py-2.5 bg-slate-900 hover:bg-[#009639] text-white font-extrabold text-xs tracking-wide uppercase rounded-xl transition-all shadow-sm shrink-0"
              >
                Assinar Abaixo-Assinado de Apoio
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

          {/* CHIMARRAO LOCAL INVITATION: Suggested Gaucho Elector Engagement improvement */}
          <div className="mt-8 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-50/10 p-5 rounded-2xl border border-amber-200/50 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 select-none">
                🧉
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-[#78350F] text-sm md:text-base flex items-center justify-center md:justify-start gap-1.5">
                  Convidar o Capitão para sua Região / Roda de Chimarrão
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-normal max-w-2xl font-normal">
                  Nossa caravana passa por todo o Rio Grande do Sul conversando olho-no-olho com o produtor e cidadão. Quer agendar uma visita do Capitão Macedo na cooperativa, sindicato rural, CTG, igreja ou feira municipal de sua cidade? Envie uma convocatória oficial para nosso atendimento.
                </p>
              </div>
            </div>
            
            <a
              href={`https://wa.me/555193687702?text=${encodeURIComponent("Olá! Gostaria de convidar o Capitão Macedo para uma visita institucional ou roda de chimarrão na minha região!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md smooth-transition flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
              id="btn-invitation-chimarrao"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              Agendar Visita
            </a>
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
                  <span>Dúvidas? Coordenação de Campanha:</span> 
                  <a href={`https://wa.me/555193687702?text=${encodeURIComponent("Olá! Gostaria de apoiar a campanha do Capitão Macedo.")}`} target="_blank" rel="noopener noreferrer" className="text-emerald-750 hover:text-emerald-600 underline font-bold inline-flex items-center gap-1">
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

             <div className="flex flex-col items-center gap-2">
               <div className="flex items-center gap-4 flex-wrap justify-center">
                 <a href="#apresentacao" className="text-slate-400 hover:text-white smooth-transition">Biografia</a>
                 <span className="text-slate-700">|</span>
                 <a href="#frentes" className="text-slate-400 hover:text-white smooth-transition">Frentes</a>
                 <span className="text-slate-700">|</span>
                 <a href="#projetos" className="text-slate-400 hover:text-white smooth-transition">Leis</a>
                 <span className="text-slate-700">|</span>
                 <a href="#municipios" className="text-slate-400 hover:text-white smooth-transition">Cidades Atendidas</a>
               </div>
               
               {/* Redes Sociais Footer Row */}
               <div className="flex items-center gap-2.5 mt-2">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Acompanhe:</span>
                 <a 
                   href="https://www.instagram.com/stories/capitao_macedo/" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-[#E1306C] text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm"
                   title="Instagram do Capitão Macedo"
                   id="footer-social-instagram"
                 >
                   <Instagram className="w-4 h-4" />
                 </a>
                 <a 
                   href="https://www.facebook.com/deputadocapitaomacedo/?locale=pt_BR" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-[#1877F2] text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm"
                   title="Facebook do Capitão Macedo"
                   id="footer-social-facebook"
                 >
                   <Facebook className="w-4 h-4" />
                 </a>
               </div>
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
          href={`https://wa.me/555193687702?text=${encodeURIComponent("Olá! Gostaria de apoiar a campanha do Capitão Macedo.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-600 md:hover:bg-emerald-500 text-white font-extrabold px-4 py-3 rounded-full shadow-2xl md:hover:scale-105 transition-all duration-200 border border-emerald-500/25 ring-4 ring-emerald-500/15 group"
          title="Coordenação de Campanha via WhatsApp"
          id="floating-whatsapp-coordenacao"
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <span className="text-xs tracking-tight">Coordenação de Campanha</span>
          <MessageCircle className="w-4 bg-transparent text-white" />
        </a>

        {/* Floating Donate Button */}
        <a
          href="https://queroapoiar.com.br/capitaomacedoprofessor?fbclid=IwdGRzaASMf5ljbGNrBIx_hWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHl4MY0buUyGOpL2aN-k7ISvslZlWA_0AIDR8bGofEkJD-rKrLoqt_PjdTsLS_aem_5EjP02OShasPiH3tRzfWtA&sfnsn=wiwspwa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#FFC72C] md:hover:bg-slate-900 md:hover:text-white text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl md:hover:scale-105 transition-all duration-200 border border-amber-400 group ring-4 ring-amber-400/15"
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
