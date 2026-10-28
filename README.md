# NomadeFace - Plataforma de video aulas

Plataforma de video aulas com **liberacao progressiva de conteudo**: a aula de
apresentacao fica aberta e as demais aparecem com cadeado ate o administrador
liberar (para todos ou para um aluno especifico).

## Stack

| Camada    | Tecnologia                                    |
| --------- | --------------------------------------------- |
| Front/Back| Next.js 14 (App Router) - JavaScript, sem TS  |
| Estilo    | Tailwind CSS (tema dark proprio)              |
| Banco     | MySQL (WAMP) via Knex                         |
| Migrations| Knex migrations + seeds                       |
| Sessao    | JWT em cookie httpOnly (jose) + bcryptjs      |
| Icones    | lucide-react                                  |

---

## Como rodar

### 1. Pre-requisitos

- Node.js 18+ (testado no 22)
- MySQL rodando (no WAMP, inicie o servico `wampmysqld64`)

### 2. Configurar o `.env`

O arquivo `.env` ja foi criado a partir de `.env.example`. Ajuste se precisar:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=curso_erick

JWT_SECRET=troque-este-segredo-por-algo-bem-longo-e-aleatorio

ADMIN_EMAIL=admin@cursoerick.com
ADMIN_PASSWORD=admin123
```

### Segredo das sessoes

```bash
npm run jwt:secret
```

O `JWT_SECRET` e a chave que assina os cookies de login. Com um valor conhecido,
qualquer pessoa consegue forjar um cookie de administrador. O comando gera 86
caracteres aleatorios e grava no `.env`.

Trocar o segredo **derruba todas as sessoes abertas** - todo mundo precisa entrar
de novo. Reinicie o servidor depois de rodar.

Em producao a aplicacao **se recusa a iniciar** se o `JWT_SECRET` estiver vazio
ou tiver menos de 32 caracteres.

### Senha do administrador

```bash
npm run senha:admin
```

Gera uma senha forte de 20 caracteres, grava o hash no banco e escreve a senha
em `ADMIN_PASSWORD` no seu `.env` (a anterior fica em `.env.bak`). A senha nao
aparece no terminal: leia o valor direto no `.env`.

Para trocar a de outra conta:

```bash
npm run senha:admin -- outro@email.com
```

### 3. Instalar e preparar o banco

```bash
npm install
```

```bash
npm run db:setup
```

Esse comando cria o banco, roda as 8 migrations e popula o seed (administrador +
curso de exemplo com 8 aulas, sendo 1 liberada).

### 4. Subir o servidor

```bash
npm run dev
```

Acesse <http://localhost:3000>.

Para producao:

```bash
npm run build
```

```bash
npm start
```

---

## Scripts disponiveis

| Comando                    | O que faz                                     |
| -------------------------- | --------------------------------------------- |
| `npm run dev`              | servidor de desenvolvimento                   |
| `npm run build` / `start`  | build e execucao em producao                  |
| `npm run db:setup`         | cria o banco + migrations + seed              |
| `npm run migrate`          | aplica as migrations pendentes                |
| `npm run migrate:rollback` | desfaz o ultimo lote de migrations            |
| `npm run migrate:make X`   | cria um arquivo novo de migration             |
| `npm run seed`             | roda os seeds                                 |
| `npm run capas`            | gera as capas das aulas e o banner do curso   |
| `npm run senha:admin`      | gera uma senha forte para o administrador     |
| `npm run jwt:secret`       | gera o segredo que assina os cookies de login |

---

## Telas

| Rota                   | Quem acessa | Descricao                                             |
| ---------------------- | ----------- | ----------------------------------------------------- |
| `/`                    | publico     | Landing dark com grade do curso e cadeados            |
| `/cadastro`            | publico     | Nome completo, e-mail, telefone e senha               |
| `/login`               | publico     | Entrada na plataforma                                 |
| `/painel`              | aluno       | Progresso + modulos com aulas liberadas/bloqueadas    |
| `/painel/aula/[slug]`  | aluno       | Player, descricao e navegacao entre aulas             |
| `/admin`               | admin       | Numeros gerais e ultimos cadastros                    |
| `/admin/cursos`        | admin       | Criar/publicar cursos                                 |
| `/admin/cursos/[id]`   | admin       | Modulos, aulas, upload de video e botao **Liberar**   |
| `/admin/alunos`        | admin       | Bloquear alunos e liberar aulas individualmente       |
| `/admin/site`          | admin       | Editar os textos da pagina inicial                    |

---

## Como funciona a liberacao das aulas

Cada aula tem um **modo de liberacao** (`lessons.release_mode`):

- **`free`** - aberta para todos. Use na aula de apresentacao.
- **`manual`** - fica com cadeado ate voce clicar em **Liberar** no painel admin
  (`lessons.is_released`).
- **`scheduled`** - abre sozinha na data e hora definidas em `lessons.release_at`.

Alem disso:

- **Liberacao individual** (`lesson_access`): em `/admin/alunos` voce abre uma
  aula apenas para um aluno, antes da liberacao geral.
- **Modo sequencial** (`courses.sequential`): quando ligado, o aluno so abre a
  proxima aula depois de concluir a anterior.

A regra final esta centralizada em `src/lib/access.js`.

---

## Videos: upload ou link

No formulario da aula voce escolhe entre:

- **Enviar arquivo** - o video sobe em streaming para `storage/videos/`, que fica
  **fora da pasta publica**. Ele so e entregue pela rota protegida
  `/api/video/[slug]`, que confere o login e a liberacao antes de responder, e
  suporta `Range` (adiantar/voltar o video).
- **Link externo** - cole a URL do YouTube ou Vimeo; a plataforma converte para
  o formato de incorporacao automaticamente.

Formatos aceitos no upload: `.mp4`, `.webm`, `.ogg`, `.mov`, `.m4v`.

### Capas e banner

O painel do aluno usa cartazes verticais (estilo Netflix), entao cada aula tem
uma **capa**:

- **Capa da aula** (`lessons.thumbnail_url`) - imagem vertical **2:3**
  (ex: 600x900). Enviada no formulario da aula.
- **Banner do curso** (`courses.cover_url`) - imagem larga **16:6**
  (ex: 1920x720), usada na faixa de destaque no topo do painel. Fica em
  **Aparencia**, dentro da pagina do curso.

As imagens sao salvas em `public/uploads/capas/` e aceitam `.jpg`, `.png`,
`.webp` e `.avif`. Tambem da para colar o link de uma imagem hospedada fora.

Aula sem capa ganha automaticamente um cartaz degrade com o numero da aula, entao
a plataforma ja fica apresentavel antes de voce subir as artes.

### Gerando as capas automaticamente

```bash
npm run capas
```

O script le os titulos cadastrados no banco e desenha um cartaz 2:3 para cada
aula (cor por modulo, numero grande e o titulo aplicado na arte), alem do banner
do curso. Por padrao ele so cria o que ainda nao tem capa:

```bash
npm run capas -- --force
```

Com `--force` ele refaz todas. Os arquivos sao SVG, ficam em
`public/uploads/capas/` e podem ser trocados pela sua arte a qualquer momento
pelo painel.

Quando a aula tem capa propria, o titulo escrito na arte e que aparece no
cartaz; o texto da plataforma so surge quando o mouse passa por cima.

> O streaming protegido impede o acesso direto ao arquivo, mas nao impede
> gravacao de tela. Para DRM de verdade seria preciso um servico pago
> (Vimeo OTT, Panda Video, Mux).

---

## Estrutura do projeto

```
db/
  migrations/      8 migrations (users, courses, modules, lessons, ...)
  seeds/           admin + curso de exemplo
scripts/
  create-database.js
src/
  app/
    page.jsx              landing page
    login/ cadastro/      autenticacao
    painel/               area do aluno
    admin/                area do administrador
    api/                  rotas de API (auth, progresso, video, admin)
  components/             componentes de interface
  lib/
    access.js             regra de liberacao das aulas
    auth.js / jwt.js      sessao e senhas
    db.js                 conexao Knex
    validators.js         validacao com zod
storage/videos/           videos enviados (nao versionado)
```

## Banco de dados

| Tabela            | Para que serve                                          |
| ----------------- | -------------------------------------------------------- |
| `users`           | alunos e administradores (nome, e-mail, telefone, papel) |
| `courses`         | cursos, com flags de publicacao e modo sequencial        |
| `modules`         | modulos de cada curso                                    |
| `lessons`         | aulas, video e regras de liberacao                       |
| `enrollments`     | matricula do aluno no curso                              |
| `lesson_access`   | liberacao individual de uma aula para um aluno           |
| `lesson_progress` | progresso e conclusao de cada aula                       |
| `settings`        | textos editaveis da pagina inicial                       |

---

## Planos na pagina inicial

A home tem tres cards de plano:

| Plano                      | O que oferece                                              |
| -------------------------- | ---------------------------------------------------------- |
| **Gratuito**               | aula de apresentacao e acesso a plataforma                 |
| **Curso completo**         | todas as aulas dos 3 modulos liberadas                     |
| **Mentoria + ViralizeAI**  | curso, mentoria e acesso ao sistema de postagem            |

Preco, observacao e link de checkout de cada plano ficam em **/admin/site**, nos
blocos "Plano Curso completo" e "Plano Mentoria + ViralizeAI". Os beneficios
listados em cada card ficam em `src/components/PricingSection.jsx`.

Se o link de checkout estiver em branco, o botao leva para o cadastro.

> **Atencao:** os cards sao a vitrine comercial. A plataforma ainda nao cobra
> nem controla plano por aluno: depois do pagamento, voce libera as aulas
> manualmente no painel (ou libera tudo de uma vez em **Cursos e aulas**).

---

## Proximos passos sugeridos

- Recuperacao de senha por e-mail
- Aviso por e-mail/WhatsApp quando uma aula for liberada
- Materiais de apoio (PDF) por aula
- Certificado de conclusao
- Integracao com gateway de pagamento
