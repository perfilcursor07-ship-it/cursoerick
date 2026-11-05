/**
 * Tarefa pratica de cada aula.
 *
 * Cada aula ganha um campo `task` com o que o aluno precisa FAZER depois de
 * assistir, sempre alinhado ao objetivo do modulo. Uma tarefa por linha.
 */

const TASKS = {
  // Modulo 1 - A base do jogo: entenda o modelo e deixe sua estrutura pronta
  'aula-01-boas-vindas-como-funciona-ganhar-em-dolar': [
    'Escreva em uma frase qual e a sua meta em dolar para os proximos 90 dias.',
    'Separe na agenda os horarios da semana que voce vai dedicar ao projeto.',
    'Entre na conta do Facebook que voce vai usar para criar a sua pagina.',
  ],
  'aula-02-como-o-facebook-paga-pelo-seu-conteudo': [
    'Abra o Meta Business Suite e localize a area de monetizacao.',
    'Anote quais programas de monetizacao estao disponiveis para o seu pais.',
    'Calcule quantas visualizacoes voce precisa por mes para bater a sua meta.',
  ],
  'aula-03-criando-sua-primeira-pagina-do-zero': [
    'Crie a sua pagina com o nome e o @ definidos na aula.',
    'Suba a foto de perfil e a capa no tamanho correto.',
    'Preencha categoria, descricao e informacoes de contato da pagina.',
    'Confira se a pagina esta publicada e visivel para quem nao segue.',
  ],
  'aula-04-regras-e-politicas-o-que-nunca-fazer': [
    'Leia as politicas de monetizacao e salve o link nos favoritos.',
    'Revise a sua pagina e remova qualquer conteudo de terceiros sem permissao.',
    'Monte a sua lista do que voce nunca vai postar.',
  ],

  // Modulo 2 - Conteudo que performa: o que postar, como produzir e quando publicar
  'aula-05-escolhendo-o-nicho-certo': [
    'Liste 3 nichos possiveis e pesquise paginas grandes de cada um.',
    'Compare alcance, formato e frequencia de posts desses concorrentes.',
    'Escolha um nicho e escreva em duas linhas por que ele foi o escolhido.',
  ],
  'aula-06-a-anatomia-de-um-post-que-viraliza': [
    'Separe 5 posts virais do seu nicho e identifique o gancho de cada um.',
    'Reescreva 2 deles com as suas palavras, mantendo a estrutura da aula.',
    'Publique um post seu usando gancho, ritmo e chamada.',
  ],
  'aula-07-produzindo-em-escala-com-ia-e-ferramentas': [
    'Monte o seu fluxo de producao: roteiro, edicao e publicacao.',
    'Produza 5 posts de uma vez usando as ferramentas apresentadas.',
    'Marque quanto tempo levou cada post para saber o seu ritmo real.',
  ],
  'aula-08-frequencia-e-horarios-de-publicacao': [
    'Defina quantos posts por dia voce consegue manter sem travar.',
    'Monte o calendario da proxima semana com dia e horario de cada post.',
    'Agende os posts que voce ja produziu.',
  ],

  // Modulo 3 - Monetizar e escalar: ative o pagamento e transforme em rotina
  'aula-09-ativando-a-monetizacao-passo-a-passo': [
    'Confira na sua pagina quais requisitos de monetizacao ainda faltam.',
    'Faca a inscricao nos programas que ja estao disponiveis para voce.',
    'Defina o que vai ser postado enquanto a aprovacao nao sai.',
  ],
  'aula-10-lendo-suas-metricas-sem-complicacao': [
    'Abra o painel de metricas e anote alcance, retencao e RPM da semana.',
    'Identifique o seu post de melhor e o de pior desempenho.',
    'Ajuste os proximos posts com base nessa comparacao.',
  ],
  'aula-11-escalando-para-varias-paginas': [
    'Avalie se a sua primeira pagina ja bateu os numeros para abrir a segunda.',
    'Documente o seu processo em um checklist que da para reaproveitar.',
    'Defina a rotina semanal para cuidar de mais de uma pagina.',
  ],
  'aula-12-recebendo-em-dolar-conta-cambio-e-saque': [
    'Cadastre a conta de recebimento nas configuracoes de pagamento.',
    'Confira se os seus dados fiscais estao corretos.',
    'Simule a conversao do primeiro pagamento e anote o valor liquido.',
  ],
};

exports.up = async function up(knex) {
  if (!(await knex.schema.hasColumn('lessons', 'task'))) {
    await knex.schema.alterTable('lessons', (t) => {
      t.text('task').nullable();
    });
  }

  // preenche as tarefas do curso de dolar sem sobrescrever o que o admin editou
  for (const [slug, items] of Object.entries(TASKS)) {
    await knex('lessons')
      .where({ slug })
      .where((qb) => qb.whereNull('task').orWhere('task', ''))
      .update({ task: items.join('\n') });
  }
};

exports.down = async function down(knex) {
  if (await knex.schema.hasColumn('lessons', 'task')) {
    await knex.schema.alterTable('lessons', (t) => {
      t.dropColumn('task');
    });
  }
};
