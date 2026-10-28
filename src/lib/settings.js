import { db } from './db';

const DEFAULTS = {
  'site.name': process.env.NEXT_PUBLIC_SITE_NAME || 'NomadeFace',
  'home.badge': 'Turma aberta - comece hoje mesmo',
  'home.title': 'Ganhe em dolar com paginas do Facebook',
  'home.subtitle':
    'O passo a passo para criar paginas monetizadas, postar o conteudo certo e receber do Facebook em dolar. Sem aparecer e direto do celular.',
  'home.cta': 'Quero minha primeira pagina',
  'home.whatsapp': '',
  'home.video_url': '',

  // ---- planos exibidos na home ----
  // os textos e beneficios ficam no codigo; aqui so o que muda com frequencia
  'plan.full.price': 'R$ 197',
  'plan.full.note': 'pagamento unico',
  'plan.full.url': '',
  'plan.pro.price': 'R$ 497',
  'plan.pro.note': 'pagamento unico',
  'plan.pro.url': '',
  'plan.viralize.url': 'https://www.viralizeai.online/',
};

/** Le as configuracoes do banco mesclando com os valores padrao. */
export async function getSettings() {
  try {
    const rows = await db('settings').select('key', 'value');
    const map = { ...DEFAULTS };
    for (const row of rows) {
      if (row.value !== null && row.value !== '') map[row.key] = row.value;
      else if (!(row.key in map)) map[row.key] = '';
    }
    return map;
  } catch {
    // banco ainda nao migrado: a home continua abrindo com os textos padrao
    return { ...DEFAULTS };
  }
}

export { DEFAULTS as SETTINGS_DEFAULTS };
