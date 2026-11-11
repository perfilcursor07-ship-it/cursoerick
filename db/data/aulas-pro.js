/**
 * Modulo PRO do curso "Paginas que Pagam em Dolar".
 *
 * Estas aulas nao abrem para todo mundo: so o aluno que o admin marcar
 * como assinante em /admin/alunos consegue assistir.
 */

const PRO_MODULE = {
  title: 'Modulo 4 - Aulas PRO',
  description: 'Conteudo avancado so para assinantes: pagina, monetizacao e escala no detalhe.',
  lessons: [
    {
      title: 'Pagina de alta conversao: o setup que ninguem ajusta',
      description:
        'Alem de criar a pagina: bio que vende, CTA, categoria certa, destaques, prova social e as configuracoes que aumentam alcance e confianca desde o primeiro visitante.',
      task: [
        'Reescreva a bio da pagina com uma oferta clara e uma chamada para seguir.',
        'Ajuste categoria, destaques e botoes de acao com o que foi mostrado na aula.',
        'Coloque prova social visivel no perfil (resultado, depoimento ou numero).',
        'Compare sua pagina com 2 paginas grandes do nicho e anote 3 ajustes.',
      ],
    },
    {
      title: 'Do visitante ao fa: funil de conteudo que prende',
      description:
        'Como estruturar a sequencia de posts para transformar um clique em seguidor que assiste tudo: gancho avancado, retencao, loops de watch time e o papel de cada formato.',
      task: [
        'Monte o funil da sua pagina: post de captura, post de retencao e post de conversao.',
        'Reescreva 3 ganchos usando a formula avancada da aula.',
        'Publique um post pensado para watch time, nao so para alcance.',
        'Anote o tempo medio de visualizacao antes e depois desse ajuste.',
      ],
    },
    {
      title: 'Monetizacao avancada: como subir o RPM de verdade',
      description:
        'O que o Facebook realmente paga melhor, como misturar programas, evitar penalidades silenciosas e ajustar o conteudo para aumentar o valor de cada mil visualizacoes.',
      task: [
        'Liste os programas ativos na sua pagina e o RPM de cada um na ultima semana.',
        'Identifique 5 posts com RPM baixo e reescreva o formato de 2 deles.',
        'Defina o mix semanal: quantos posts de cada tipo para subir o RPM.',
        'Revise e tire qualquer conteudo que possa estar derrubando a monetizacao.',
      ],
    },
    {
      title: 'Operacao profissional: varias paginas sem se perder',
      description:
        'Como tratar as paginas como um negocio: Business Manager, protecao contra ban, checklist diario, ferramentas, equipe e o que reaproveitar sem cair em spam.',
      task: [
        'Organize as paginas no Meta Business Manager com funcoes e acessos definidos.',
        'Escreva o checklist diario e o semanal da sua operacao.',
        'Documente o que pode ser reaproveitado e o que precisa ser original em cada pagina.',
        'Defina o plano B se uma pagina cair: backup de criativos e de acessos.',
      ],
    },
    {
      title: 'Do conteudo ao negocio: ofertas, trafego e o segundo faturamento',
      description:
        'Como ir alem do RPM: produto digital, lista, parceria, trafego pago complementar e o caminho para o faturamento nao depender so da monetizacao nativa.',
      task: [
        'Escolha 1 oferta simples (guia, pack ou indicacao) alinhada ao nicho da pagina.',
        'Defina onde essa oferta entra no funil de posts sem quebrar a monetizacao.',
        'Calcule quanto voce precisaria de RPM vs oferta para bater a meta mensal.',
        'Monte o esboco da primeira oferta e o post que vai divulgar ela.',
      ],
    },
  ],
};

function slugifyPro(text, n) {
  const base = String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
  return `aula-${String(n).padStart(2, '0')}-${base}`;
}

module.exports = { PRO_MODULE, slugifyPro };
