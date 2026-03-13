export const mockUser = {
  id: "user-1",
  nome: "Ricardo",
  email: "ricardo@imobiai.com",
  cidade: "São Paulo",
  foco: ["Residencial", "Lançamentos"],
  meta_mensal: 3000000,
  comissao_media: 1.5,
  ticket_medio: 800000,
};

export const mockLeads = [
  {
    id: "lead-1",
    nome: "João Silva",
    telefone: "(11) 99999-1234",
    email: "joao@email.com",
    orcamento: 800000,
    bairros: ["Pinheiros"],
    quartos_min: 3,
    temperatura: 90,
    tipo_imovel_preferido: "Apartamento",
    perfil: "Família com filhos",
    urgencia: "Curto prazo — 1 a 3 meses",
    observacoes: "Gostou muito do ap do Itaim mas achou caro. Tem cachorro grande. Precisa de vaga dupla. Esposa prefere andar alto.",
    ultima_interacao: new Date(Date.now() - 86400000).toISOString(),
    status: "ativo",
  },
  {
    id: "lead-2",
    nome: "Maria Costa",
    telefone: "(11) 99888-5678",
    email: "maria@email.com",
    orcamento: 500000,
    bairros: ["Moema"],
    quartos_min: 2,
    temperatura: 60,
    tipo_imovel_preferido: "Apartamento",
    perfil: "Casal sem filhos",
    urgencia: "Médio prazo — 3 a 6 meses",
    observacoes: "Investidora, quer imóvel para renda. Prefere já alugado.",
    ultima_interacao: new Date(Date.now() - 172800000).toISOString(),
    status: "ativo",
  },
  {
    id: "lead-3",
    nome: "Carlos Mendes",
    telefone: "(11) 97777-9012",
    email: "carlos@email.com",
    orcamento: 1200000,
    bairros: ["Itaim Bibi"],
    quartos_min: 4,
    temperatura: 30,
    tipo_imovel_preferido: "Apartamento",
    perfil: "Comprador final",
    urgencia: "Sem pressa",
    observacoes: "Executivo, viaja muito. Quer condomínio com segurança reforçada e academia.",
    ultima_interacao: new Date(Date.now() - 604800000).toISOString(),
    status: "ativo",
  },
  {
    id: "lead-4",
    nome: "Ana Rodrigues",
    telefone: "(11) 96666-3456",
    email: "ana@email.com",
    orcamento: 350000,
    bairros: ["Vila Madalena"],
    quartos_min: 1,
    temperatura: 50,
    tipo_imovel_preferido: "Apartamento",
    perfil: "Investidor",
    urgencia: "Médio prazo — 3 a 6 meses",
    observacoes: "Primeira compra. Assustada com financiamento. Precisa de muita explicação.",
    ultima_interacao: new Date(Date.now() - 259200000).toISOString(),
    status: "novo",
  },
];

export const mockImoveis = [
  {
    id: "imovel-1",
    titulo: "Apartamento 3 quartos Itaim Bibi",
    tipo: "Apartamento",
    bairro: "Itaim Bibi",
    cidade: "São Paulo",
    preco: 950000,
    area_m2: 95,
    quartos: 3,
    vagas: 2,
    diferenciais: ["Varanda", "Portaria 24h", "Vaga dupla"],
    status: "disponivel",
    fotos_urls: [],
  },
  {
    id: "imovel-2",
    titulo: "Casa 4 quartos Morumbi",
    tipo: "Casa",
    bairro: "Morumbi",
    cidade: "São Paulo",
    preco: 1800000,
    area_m2: 280,
    quartos: 4,
    vagas: 3,
    diferenciais: ["Piscina", "Quintal", "Churrasqueira"],
    status: "disponivel",
    fotos_urls: [],
  },
  {
    id: "imovel-3",
    titulo: "Apartamento 2 quartos Pinheiros",
    tipo: "Apartamento",
    bairro: "Pinheiros",
    cidade: "São Paulo",
    preco: 650000,
    area_m2: 68,
    quartos: 2,
    vagas: 1,
    diferenciais: ["Andar alto", "Academia", "Rooftop"],
    status: "negociando",
    fotos_urls: [],
  },
];

export const mockEventos = [
  {
    id: "ev-1",
    titulo: "Visita — João Silva",
    data_inicio: new Date().setHours(10, 0, 0, 0),
    data_fim: new Date().setHours(11, 0, 0, 0),
    tipo: "visita",
    lead_id: "lead-1",
  },
  {
    id: "ev-2",
    titulo: "Reunião proposta — Maria Costa",
    data_inicio: new Date().setHours(14, 0, 0, 0),
    data_fim: new Date().setHours(15, 0, 0, 0),
    tipo: "reuniao",
    lead_id: "lead-2",
  },
];

export function getTemperaturaLabel(temp: number) {
  if (temp >= 70) return { label: "Quente", color: "bg-red-500", emoji: "🔴" };
  if (temp >= 40) return { label: "Morno", color: "bg-yellow-500", emoji: "🟡" };
  return { label: "Frio", color: "bg-gray-300", emoji: "⚪" };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `Há ${days} dias`;
}
