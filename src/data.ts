import { LegislativeProject, ParliamentaryFront } from "./types";

export const CANDIDATE_INFO = {
  name: "Capitão Macedo",
  fullTitle: "Capitão Macedo - Professor, Militar e Produtor",
  partyName: "PODEMOS",
  partyNumber: "20",
  state: "Rio Grande do Sul",
  office: "Deputado Estadual",
  tagline: "Seriedade para Ouvir, Coragem para Agir",
  slogan: "Uma vida de serviço, trabalho e compromisso com valores que se transformam em presença pública e ação concreta.",
  biographyIntro: `A história de Aparecido Macedo, conhecido publicamente como Capitão Macedo, traz as marcas do interior, do trabalho e de uma formação construída com esforço, disciplina e constância. Filho de agricultores, cresceu na lavoura e uniu sua origem simples com carreiras marcantes: militar, professor universitário, profissional formado em Direito e Contabilidade, e homem público com trabalho comprovado no Rio Grande do Sul.`,
  pillars: [
    {
      title: "Origem no Campo",
      subtitle: "Filho de Agricultores",
      description: "Trabalhou durante anos na lavoura. Foi na terra onde aprendeu que o trabalho antecede o discurso e que a responsabilidade se forja na prática cotidiana. Traz no sangue o respeito a quem produz.",
      icon: "Sprout"
    },
    {
      title: "Carreira Militar",
      subtitle: "Força e Comando",
      description: "Forjado na disciplina, lealdade e ordem da Brigada Militar como Capitão. Levou para a esfera pública a sobriedade, clareza de princípios e convicção de defesa da segurança dos cidadãos gaúchos.",
      icon: "ShieldAlert"
    },
    {
      title: "Academia e Educação",
      subtitle: "Direito, Contabilidade e Docência",
      description: "Formado em Direito e Contabilidade, somou a técnica à prática de vida. Como professor, transmite o valor da preparação, do conhecimento e da disciplina como vetores de verdadeira transformação.",
      icon: "GraduationCap"
    }
  ]
};

export const LEGISLATIVE_PROJECTS: LegislativeProject[] = [
  {
    id: "PL-517-2019",
    title: "PL 517/2019",
    subtitle: "Pró-Missões",
    description: "Valorização histórica, cultural e turística da região missioneira gaúcha.",
    details: "Promove rotas de preservação histórica, captação de emendas para centros culturais e incentivo ao turismo religioso e tradicionalista das Missões."
  },
  {
    id: "PL-287-2020",
    title: "PL 287/2020",
    subtitle: "Origem Estrangeira do Leite",
    description: "Obrigatoriedade de informar a origem do leite importado por indústrias de laticínios.",
    details: "Protege o produtor de leite gaúcho da concorrência desleal, exigindo clareza na rotulagem para que o consumidor saiba quando está comprando leite produzido no RS ou importado."
  },
  {
    id: "PL-279-2020",
    title: "PL 279/2020",
    subtitle: "Fundoleite / RS",
    description: "Apoio direto à irrigação de pastagens de bovinos leiteiros gaúchos.",
    details: "Incentivos fiscais e fomento a sistemas de irrigação para pequenos e médios produtores, garantindo fartura alimentar para o gado mesmo em períodos de estiagem."
  },
  {
    id: "PL-43-2021",
    title: "PL 43/2021",
    subtitle: "Saúde Mental na Segurança",
    description: "Política estadual voltada à saúde mental de agentes de segurança pública gaúchos.",
    details: "Estabelece redes de acolhimento psicológico preventivo e suporte especializado para policiais militares, civis, bombeiros e peritos, enfrentando os riscos cotidianos da profissão."
  },
  {
    id: "PL-163-2020",
    title: "PL 163/2020",
    subtitle: "Parcerias de Interesse Social",
    description: "Parcerias entre poder público e instituições religiosas para ações sociais.",
    details: "Regulamenta e facilita a cooperação em prol do acolhimento a dependentes químicos, distribuição de donativos e oficinas profissionalizantes executadas por igrejas e entidades filantrópicas."
  },
  {
    id: "PL-200-2020",
    title: "PL 200/2020",
    subtitle: "Pró-Vida RS",
    description: "Apoio a instituições filantrópicas que atuam em defesa e proteção da vida.",
    details: "Canaliza recursos e cria frentes de amparo a gestantes e famílias vulneráveis em situação de risco, baseando-se em firmes valores humanitários e conservadores."
  },
  {
    id: "PL-529-2019",
    title: "PL 529/2019",
    subtitle: "Oktoberfest Missões",
    description: "Inclusão da tradicional festividade no calendário oficial de eventos do estado.",
    details: "Valoriza a colonização germânica na região missioneira e potencializa a atração de faturamento turístico e hoteleiro para os municípios parceiros."
  },
  {
    id: "PL-530-2019",
    title: "PL 530/2019",
    subtitle: "Guarani das Missões",
    description: "Consagração oficial como a 'Capital Polonesa dos Gaúchos'.",
    details: "Reconhecimento histórico e cultural da Assembleia Legislativa sobre a forte contribuição polaca para as fundações agrícolas e folclóricas do RS."
  }
];

export const PARLIAMENTARY_FRONTS: ParliamentaryFront[] = [
  {
    id: "front-leite",
    title: "Produção de Leite da Agricultura Familiar",
    category: "Economia",
    description: "Defesa e fomento da cadeia leiteira local, assegurando apoio financeiro, subsídios técnicos e proteção de mercado para o pequeno produtor do interior gaúcho."
  },
  {
    id: "front-uergs",
    title: "Fortalecimento da UERGS",
    category: "Educação",
    description: "Luta pela descentralização e melhorias nas unidades regionais da Universidade Estadual do Rio Grande do Sul, aproximando o ensino superior das demandas reais da base produtiva."
  },
  {
    id: "front-caminhoneiros",
    title: "Apoio aos Caminhoneiros e Transportes",
    category: "Economia",
    description: "Defesa de melhorias em infraestruturas asfálticas, pontos de descanso seguros e revisão de taxas abusivas cobradas aos profissionais das estradas que carregam o progresso gaúcho."
  },
  {
    id: "front-escolas-tecnicas",
    title: "Escolas Técnicas e Profissionalizantes",
    category: "Educação",
    description: "Emendas e projetos voltados ao reaparelhamento e incentivo técnico de jovens do interior gaúcho, qualificando mão de obra para atuar diretamente no desenvolvimento regional."
  },
  {
    id: "front-saude-comunitarios",
    title: "Agentes Comunitários de Saúde e Endemias",
    category: "Saúde",
    description: "Luta pela dignidade salarial, condições adequadas de trabalho e cursos permanentes de qualificação para os guerreiros que combatem as doenças de porta em porta nos lares gaúchos."
  },
  {
    id: "front-conclusao-obras",
    title: "Conclusão de Obras Públicas",
    category: "Infraestrutura",
    description: "Articulação contínua pela retomada e finalização de obras atrasadas, asfalto inacabado (como na ERS-168) e construções públicas de saúde deixadas de lado."
  },
  {
    id: "front-escolas-militares",
    title: "Expansão das Escolas Cívico-Militares",
    category: "Segurança",
    description: "Apoio e consolidação do modelo de ensino focado em valores, civismo, respeito à autoridade, rotina ordeira e alto desempenho pedagógico para crianças e jovens gaúchos."
  }
];

export const MUNICIPALITIES_SERVED = [
  { name: "São Luiz Gonzaga", resources: "Emendas destinadas ao Hospital de Caridade, verbas para atenção básica à saúde rural e fomento escolar técnico.", region: "Missões" },
  { name: "Santo Ângelo", resources: "Recursos substanciais para expansão do Hospital Regional, suporte no combate e enfretamento da Covid-19 e apoio comunitário.", region: "Missões" },
  { name: "Giruá", resources: "Recursos diretos para postos municipais de atendimento, ambulâncias e pavimentação de rotas agrícolas.", region: "Missões" },
  { name: "São Borja", resources: "Suporte especializado à saúde pública municipal, reestruturação de farmácia comunitária e emendas hospitalares.", region: "Fronteira Oeste" },
  { name: "Cruz Alta", resources: "Equipamentos hospitalares para maternidade local e fomento de melhorias à infraestrutura operacional.", region: "Noroeste" },
  { name: "Campina das Missões", resources: "Destinação de recursos para atenção básica, estradas vicinais e manutenção de veículos de transporte de pacientes.", region: "Missões" },
  { name: "Morrinhos do Sul", resources: "Apoio a projetos locais de agricultura familiar e incremento no piso de custeio municipal de saúde.", region: "Litoral Norte" },
  { name: "Caxias do Sul", resources: "Apoio para tratamento especializado oncológico e articulação com frentes hospitalares regionais.", region: "Serra" },
  { name: "Roca Sales", resources: "Envio de verbas emergenciais para reconstruções, frentes de reestruturação de diques e saúde da família.", region: "Vale do Taquari" },
  { name: "Gramado", resources: "Fomento ao turismo responsável integrado com as Missões, destinação orçamentária hospitalar específica.", region: "Serra" },
  { name: "Dezesseis de Novembro", resources: "Apoio forte à irrigação de bacias leiteiras locais e ambulâncias para transporte médico emergencial.", region: "Missões" },
  { name: "Boa Vista do Cadeado", resources: "Fomento direto a projetos agrícolas e verbas de infraestrutura urbana primária.", region: "Noroeste" },
  { name: "Santa Rosa", resources: "Recursos expressivos para oncologia e cardiologia regional, fortalecendo a rede de atendimento do Noroeste gaúcho.", region: "Noroeste" },
  { name: "Tucunduva", resources: "Emendas destinadas à aquisição de insumos agrícolas e ampliação estrutural de posto de saúde central.", region: "Noroeste" },
  { name: "Ajuricaba", resources: "Incentivo a bacias produtoras leiteiras locais e de transporte agropecuário do interior.", region: "Noroeste" },
  { name: "Seberi", resources: "Articulação de investimentos hospitalares locais e segurança pública em cruzamentos viários federais.", region: "Norte" },
  { name: "Caibaté", resources: "Apoio estrutural no turismo histórico do monumento de São Miguel e emendas de custeio sanitário geral.", region: "Missões" },
  { name: "Horizontina", resources: "Verbas de qualificação profissional de jovens metalúrgicos e suporte na infraestrutura urbana gaúcha.", region: "Noroeste" },
  { name: "Cerro Largo", resources: "Recursos escolares para campus técnico e emendas voltadas à estruturação hospitalar comunitária.", region: "Missões" },
  { name: "Rolador", resources: "Investimentos em escavação de poços artesianos no campo e fomento de verbas preventivas de saúde.", region: "Missões" }
];

export const CAMPAIGN_FLAGS = [
  { id: "flag-agro", title: "Defesa do Interior e Agronegócio", text: "Trabalho forte de representação para quem produz. Defesa do produtor de leite contra as importações desordenadas (PL 287/2020) e irrigação garantida (PL 279/2020)." },
  { id: "flag-seg", title: "Segurança Pública de Verdade", text: "Trabalho pela valorização, expansão de escolas militares e cuidado humano com a saúde mental dos nossos policiais defensores (PL 43/2021)." },
  { id: "flag-edu", title: "Educação com Valores e Prática", text: "Apoio a escolas profissionalizantes e à descentralização de polos de ensino técnico para empregar a juventude no próprio interior gaúcho." },
  { id: "flag-sau", title: "Saúde Próxima das Pessoas", text: "Trabalho contínuo de direcionamento de recursos municipais. Menos discurso e mais emendas para que os medicamentos e exames cheguem aos hospitais." },
  { id: "flag-val", title: "Defesa dos Valores e Família", text: "Mandato firme baseado em valores tradicionais, oposição ao assistencialismo demagógico e apoio a instituições que defendem a vida desde a concepção." }
];
