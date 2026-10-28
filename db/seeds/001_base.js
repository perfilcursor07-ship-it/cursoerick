require('dotenv').config();
const bcrypt = require('bcryptjs');

/**
 * Seed inicial: cria o administrador, um curso de exemplo com modulos/aulas
 * (a primeira liberada e as demais travadas) e o conteudo da pagina inicial.
 */
exports.seed = async function seed(knex) {
  // ---------- administrador ----------
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@cursoerick.com').toLowerCase();
  const existingAdmin = await knex('users').where({ email: adminEmail }).first();

  if (!existingAdmin) {
    await knex('users').insert({
      name: process.env.ADMIN_NAME || 'Erick Administrador',
      email: adminEmail,
      phone: process.env.ADMIN_PHONE || '(11) 90000-0000',
      password_hash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
      role: 'admin',
      status: 'active',
    });
    console.log(`[seed] admin criado: ${adminEmail}`);
  }

  // ---------- conteudo da home ----------
  const settings = [
    { key: 'site.name', value: process.env.NEXT_PUBLIC_SITE_NAME || 'NomadeFace' },
    { key: 'home.badge', value: 'Turma aberta - comece hoje mesmo' },
    { key: 'home.title', value: 'Ganhe em dolar com paginas do Facebook' },
    {
      key: 'home.subtitle',
      value:
        'O passo a passo para criar paginas monetizadas, postar o conteudo certo e receber do Facebook em dolar. Sem aparecer e direto do celular.',
    },
    { key: 'home.cta', value: 'Quero minha primeira pagina' },
    { key: 'home.whatsapp', value: '' },
    { key: 'home.video_url', value: '' },

    // planos da home (troque os valores em /admin/site)
    { key: 'plan.full.price', value: 'R$ 197' },
    { key: 'plan.full.note', value: 'pagamento unico' },
    { key: 'plan.full.url', value: '' },
    { key: 'plan.pro.price', value: 'R$ 497' },
    { key: 'plan.pro.note', value: 'pagamento unico' },
    { key: 'plan.pro.url', value: '' },
    { key: 'plan.viralize.url', value: 'https://www.viralizeai.online/' },
  ];

  for (const row of settings) {
    const found = await knex('settings').where({ key: row.key }).first();
    if (!found) await knex('settings').insert(row);
  }

};
