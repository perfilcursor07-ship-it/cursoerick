require('dotenv').config();

/**
 * Grade do curso "Paginas que Pagam em Dolar".
 *
 * Este seed e idempotente: ele cria o curso e as aulas se ainda nao existirem e
 * NAO sobrescreve o que voce ja editou pelo painel. Para recriar do zero, apague
 * o curso em /admin/cursos e rode `npm run seed` de novo.
 */

const COURSE = {
  slug: 'paginas-que-pagam-em-dolar',
  title: 'Paginas que Pagam em Dolar',
  subtitle: 'O passo a passo da monetizacao no Facebook',
  description:
    'Do zero ate o primeiro saque: como criar paginas, produzir posts que performam, ativar a monetizacao do Facebook e receber em dolar. Cada aula e liberada no seu ritmo para voce aplicar antes de avancar.',
};

const MODULES = [
  {
    title: 'Modulo 1 - A base do jogo',
    description: 'Entenda o modelo e deixe sua estrutura pronta.',
    lessons: [
      {
        title: 'Boas-vindas: como funciona ganhar em dolar',
        thumbnail_url: '/images/aula-01-boas-vindas.webp',
        description:
          'A visao geral do metodo: o que e uma pagina monetizada, de onde vem o dinheiro e o que voce vai construir nas proximas aulas.',
        release_mode: 'free',
        is_released: true,
      },
      {
        title: 'Como o Facebook paga pelo seu conteudo',
        description:
          'Os programas de monetizacao, como o calculo do pagamento funciona e por que ele e feito em dolar.',
      },
      {
        title: 'Criando sua primeira pagina do zero',
        description:
          'Nome, nicho, foto, capa e as configuracoes que a maioria esquece de ajustar no comeco.',
      },
      {
        title: 'Regras e politicas: o que nunca fazer',
        description:
          'Os erros que derrubam uma pagina: conteudo reciclado, direitos autorais e praticas que tiram sua monetizacao.',
      },
    ],
  },
  {
    title: 'Modulo 2 - Conteudo que performa',
    description: 'O que postar, como produzir e quando publicar.',
    lessons: [
      {
        title: 'Escolhendo o nicho certo',
        description:
          'Como avaliar demanda, concorrencia e potencial de alcance antes de investir tempo em um tema.',
      },
      {
        title: 'A anatomia de um post que viraliza',
        description:
          'Gancho, ritmo, formato e chamada. A estrutura que faz o conteudo prender a atencao nos primeiros segundos.',
      },
      {
        title: 'Produzindo em escala com IA e ferramentas',
        description:
          'Seu fluxo de producao: roteiro, edicao e publicacao sem gastar o dia inteiro em cada post.',
      },
      {
        title: 'Frequencia e horarios de publicacao',
        description:
          'Quantos posts por dia, em que horarios e como montar um calendario que da para manter.',
      },
    ],
  },
  {
    title: 'Modulo 3 - Monetizar e escalar',
    description: 'Ative o pagamento e transforme em rotina.',
    lessons: [
      {
        title: 'Ativando a monetizacao passo a passo',
        description:
          'Os requisitos, onde clicar e o que fazer enquanto a pagina ainda nao foi aprovada.',
      },
      {
        title: 'Lendo suas metricas sem complicacao',
        description:
          'Alcance, retencao e RPM: quais numeros realmente importam e o que fazer com cada um deles.',
      },
      {
        title: 'Escalando para varias paginas',
        description:
          'Quando faz sentido abrir a segunda pagina, como organizar a rotina e o que da para reaproveitar.',
      },
      {
        title: 'Recebendo em dolar: conta, cambio e saque',
        description:
          'Como configurar o recebimento, o que observar no cambio e o caminho do dinheiro ate a sua conta.',
      },
    ],
  },
];

function slugify(text, n) {
  const base = String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
  return `aula-${String(n).padStart(2, '0')}-${base}`;
}

exports.seed = async function seed(knex) {
  const existing = await knex('courses').where({ slug: COURSE.slug }).first();
  if (existing) {
    console.log('[seed] curso de dolar ja existe, nada a fazer');
    return;
  }

  const maxPos = await knex('courses').max('position as m').first();

  const [courseId] = await knex('courses').insert({
    ...COURSE,
    is_published: true,
    sequential: false,
    auto_enroll: true,
    position: (maxPos?.m || 0) + 1,
  });

  let n = 0;
  for (let mi = 0; mi < MODULES.length; mi += 1) {
    const mod = MODULES[mi];
    const [moduleId] = await knex('modules').insert({
      course_id: courseId,
      title: mod.title,
      description: mod.description,
      position: mi + 1,
    });

    for (let li = 0; li < mod.lessons.length; li += 1) {
      const lesson = mod.lessons[li];
      n += 1;
      await knex('lessons').insert({
        module_id: moduleId,
        title: lesson.title,
        slug: slugify(lesson.title, n),
        description: lesson.description,
        thumbnail_url: lesson.thumbnail_url || null,
        video_type: 'external',
        video_url: '',
        release_mode: lesson.release_mode || 'manual',
        is_released: Boolean(lesson.is_released),
        is_published: true,
        position: li + 1,
      });
    }
  }

  // matricula quem ja esta cadastrado
  const students = await knex('users').where({ role: 'student' }).select('id');
  for (const student of students) {
    await knex('enrollments').insert({ user_id: student.id, course_id: courseId });
  }

  console.log(`[seed] curso "${COURSE.title}" criado com ${n} aulas (1 liberada)`);
};
