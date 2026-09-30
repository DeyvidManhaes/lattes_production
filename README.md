# LattesProduction

Projeto da disciplina **Desenvolvimento de Software I** (Sistemas de Informação, FeMASS).

O sistema importa currículos da Plataforma Lattes (arquivos XML), guarda os pesquisadores e as produções bibliográficas deles (artigos, livros e capítulos) e mostra tudo em uma aplicação web: cadastros, listagem de produções com filtros, gráficos e um **grafo de colaboração**, em que cada aresta indica quantos trabalhos dois pesquisadores (ou dois institutos) têm em comum.

Comecei com dois repositórios separados, o back-end e o front-end. Neste repositório junto os dois e deixo o projeto pronto para rodar do zero.

## Tecnologias

### Back-end (`backend/`)

| Tecnologia | Versão | Para que uso |
|---|---|---|
| Java | 21 | linguagem do servidor |
| Spring Boot | 3.2.5 | base da aplicação e servidor web embutido (Tomcat) |
| Spring Web | 3.2.5 | API REST (controllers, CORS, tratamento de erros) |
| Spring Data JPA / Hibernate | 3.2.5 / 6.4 | mapeamento das entidades e acesso ao banco |
| PostgreSQL | 16 | banco de dados relacional |
| Spring Boot Actuator | 3.2.5 | endpoint de monitoramento da aplicação |
| Spring Boot DevTools | 3.2.5 | reinício automático durante o desenvolvimento |
| DOM (`javax.xml`, já vem no Java) | - | leitura dos currículos Lattes em XML |
| JUnit 5 e Mockito | via Spring Boot | testes unitários |
| Maven | 3.9+ | build e gerenciamento de dependências |

### Front-end (`frontend/`)

| Tecnologia | Versão | Para que uso |
|---|---|---|
| React | 18 | interface da aplicação |
| Create React App (`react-scripts`) | 5.0.1 | build e servidor de desenvolvimento |
| React Router | 6 | navegação entre as telas |
| Material UI | 5 | tabelas, formulários, diálogos e campos de seleção |
| Bootstrap e Bootstrap Icons | 5.3 / 1.11 | layout, menu e ícones (via CDN) |
| Chart.js, react-chartjs-2 e chartjs-plugin-datalabels | 4.4 / 5.2 / 2.2 | gráficos da tela Home |
| Cytoscape.js e react-cytoscapejs | 3.29 / 2.0 | grafo de colaboração |

### Infraestrutura e ferramentas

| Tecnologia | Para que uso |
|---|---|
| Docker e Docker Compose | subir o PostgreSQL com um comando |
| API REST com JSON | comunicação entre o front-end e o back-end |
| Plataforma Lattes (XML) | fonte dos dados de pesquisadores e produções |
| Git e GitHub | controle de versão |

## Estrutura

```
lattes-production/
├── backend/               API REST (Spring Boot)
│   ├── curriculos_xml/    29 currículos Lattes usados para importar pesquisadores
│   ├── http/              requisições de exemplo (extensão REST Client do VS Code)
│   └── src/
├── frontend/              aplicação React
├── docker-compose.yml     PostgreSQL pronto para uso
└── README.md
```

## Como rodar

### Pré-requisitos

- Java 21 e Maven 3.9+
- Node.js 18+ e npm
- PostgreSQL 14+ (ou Docker, para usar o `docker-compose.yml`)

### 1. Banco de dados

Com Docker:

```bash
docker compose up -d
```

Sem Docker, crie o banco manualmente:

```sql
CREATE DATABASE bd_lattesproduction;
```

As tabelas são criadas sozinhas pelo Hibernate na primeira execução, e os tipos de produção (**Artigo Publicado** e **Livro Publicado**) são cadastrados automaticamente.

### 2. Back-end

```bash
cd backend
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`. Os valores padrão esperam o PostgreSQL em `localhost:5432`, banco `bd_lattesproduction`, usuário e senha `postgres`. Para mudar qualquer configuração, use variáveis de ambiente (nada de senha dentro do código):

| Variável | Padrão | Para que serve |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/bd_lattesproduction` | URL do banco |
| `DB_USER` | `postgres` | usuário do banco |
| `DB_PASSWORD` | `postgres` | senha do banco |
| `LATTES_CURRICULOS_DIR` | `./curriculos_xml` | pasta com os XMLs do Lattes |
| `CORS_ORIGINS` | `http://localhost:3000` | origens que podem chamar a API |
| `PORT` | `8080` | porta da API |

Exemplo:

```bash
DB_PASSWORD=minhasenha mvn spring-boot:run
```

### 3. Front-end

Em outro terminal:

```bash
cd frontend
cp .env.example .env    # opcional: só é preciso se a API não estiver em localhost:8080
npm install
npm start
```

Abra `http://localhost:3000`.

### 4. Testes do back-end

```bash
cd backend
mvn test
```

## Como usar

Siga esta ordem na primeira vez, porque cada etapa depende da anterior.

1. **Instituto** (menu superior): clique em **Incluir**, informe nome e acrônimo (por exemplo, *Faculdade Professor Miguel Ângelo da Silva Santos* / *FeMASS*) e confirme. Também dá para alterar e excluir. Não é possível repetir nome ou acrônimo, nem excluir um instituto que ainda tenha pesquisadores.
2. **Pesquisador**: clique em **Incluir**, digite o número do currículo Lattes e escolha o instituto. O número é o nome de um arquivo da pasta `backend/curriculos_xml` sem o `.xml` (por exemplo `0348923590713594`); se você digitar menos de 16 dígitos, o sistema completa com zeros à esquerda. O back-end lê o XML e grava o pesquisador e todos os artigos, livros e capítulos dele. Pesquisadores já cadastrados não são importados de novo. Ao excluir um pesquisador, as produções dele também são removidas.
3. **Produção**: lista as produções sem repetição, no formato de citação, com filtros por instituto, pesquisador, tipo de produção e intervalo de anos.
4. **Home**: gráficos com a quantidade de produções por ano e a divisão entre artigos e livros. Clicar em uma barra abre a lista de produções daquele ano.
5. **Grafo**: escolha os filtros (instituto, tipo de produção, pesquisador), o tipo de vértice (**pesquisador** ou **instituto**) e o layout, depois clique em **Aplicar**.
   - Cada aresta mostra a quantidade de trabalhos em comum entre os dois vértices.
   - A cor da aresta segue as *Regras de Plotagem* da própria tela: vermelha para poucos trabalhos, amarela para uma quantidade intermediária e verde para muitos. Os limites das duas primeiras faixas são editáveis, e a verde não tem limite superior.
   - Os vértices mostram quantas produções cada pesquisador (ou instituto) tem dentro dos filtros aplicados.

Se quiser importar um pesquisador novo, basta colocar o XML do Lattes dele em `backend/curriculos_xml` com o nome `<numero-do-curriculo>.xml`.

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/instituto/exibir` | lista institutos |
| POST | `/instituto/incluir` | cria instituto `{nome, acronimo}` |
| POST | `/instituto/alterar` | altera instituto `{id, nome, acronimo}` |
| DELETE | `/instituto/excluir/{id}` | exclui instituto |
| GET | `/instituto/contarTrabalhosEntreInstitutos` | arestas do grafo de institutos |
| GET | `/pesquisador/exibir` | lista pesquisadores |
| POST | `/pesquisador/incluir` | importa pesquisador `{arquivoId, institutoId}` |
| DELETE | `/pesquisador/excluir/{id}` | exclui pesquisador e produções |
| GET | `/pesquisador/contarTrabalhosEntrePesquisadores` | arestas do grafo de pesquisadores |
| GET | `/trabalho/exibir` | trabalhos sem repetição |
| GET | `/trabalho/exibir/todos` | todos os trabalhos (um por pesquisador) |
| GET | `/trabalho/exibir/trabalhoscomuns` | trabalhos presentes em mais de um pesquisador |
| GET | `/tipo/exibir` | tipos de produção |
| GET | `/nome/exibir` | nomes para citação |

As duas rotas de contagem aceitam o parâmetro opcional `tipoIds` (por exemplo `?tipoIds=1,2`) para considerar só certos tipos de produção. A resposta é uma lista de arestas:

```json
[{ "origemId": 348923590713594, "origemNome": "Márcio José de Medeiros",
   "destinoId": 743793296062293, "destinoNome": "Daniel Cardoso Moraes de Oliveira",
   "quantidade": 2 }]
```

Erros voltam como `{ "mensagem": "..." }` com o status HTTP adequado (400, 404 ou 409). Há exemplos prontos de requisição na pasta `backend/http`.

## O que corrigi ao juntar os projetos

**Back-end**
- O caminho dos XMLs estava fixo no meu computador; agora é configurável (`LATTES_CURRICULOS_DIR`) e os XMLs vêm junto no repositório.
- A senha do banco saiu do código e passou a ser variável de ambiente.
- Os tipos de produção eram procurados pelos ids 10 e 12, que só existiam no meu banco. Agora são criados por nome ao iniciar.
- O leitor de XML guardava dados em atributos compartilhados entre requisições e casava trabalhos e citações pela posição na lista. Foi reescrito sem estado, e cada trabalho já carrega os seus nomes de citação.
- O identificador do currículo agora aceita só dígitos, o que impede acesso a arquivos fora da pasta configurada.
- A importação roda em uma transação e recusa pesquisador repetido, em vez de duplicar as produções.
- A contagem de trabalhos em comum ficou linear (antes era quadrática) e passou a contar corretamente trabalhos compartilhados por mais de dois pesquisadores. Títulos são comparados sem diferença de acento, maiúscula ou pontuação.
- O e-mail agora é lido do atributo certo do XML; quando não existe, é gerado um endereço fictício com o domínio reservado `.invalid`. Itens sem título ou sem ano são ignorados, e não recebem mais o ano 2000 por padrão.
- Exclusão passou a usar `DELETE`, com erros claros (por exemplo, instituto com pesquisadores vinculados devolve 409). O CORS ficou em um único lugar.

**Front-end**
- A URL da API deixou de estar fixa em `index.js` e passou a vir de `REACT_APP_API_URL`.
- Grafo: as arestas eram montadas separando `"NomeA-NomeB"` pelo hífen, o que quebrava com nomes compostos. Agora os vértices e arestas usam ids do banco. O filtro por tipo de produção também não funcionava (comparava um texto com um objeto) e agora vale para as arestas. Campo vazio nas regras de plotagem não gera mais valor inválido.
- Mensagens de erro do servidor aparecem para o usuário, e formulários só fecham quando a operação dá certo.
- Campos que podiam ser nulos (e-mail, instituto) não derrubam mais as telas, e a paginação usa botões em vez de links `javascript:void(0)`.

## Limitações conhecidas

- Só são importadas produções bibliográficas (artigos, livros e capítulos de livros); outros tipos de produção do Lattes não são lidos.
- Dois trabalhos só são considerados o mesmo se tiverem título (normalizado), ano e tipo iguais.
- Não há autenticação: o projeto é acadêmico e a API é aberta.

## Autor

Deyvid Manhães, Sistemas de Informação, FeMASS.
