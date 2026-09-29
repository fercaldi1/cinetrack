# CineTrack

Gerenciador pessoal de filmes desenvolvido para a disciplina **Programação de Sistemas Web**.

Nesta **Parte 1 (Frontend Interativo)** é possível listar, buscar, filtrar, adicionar, editar e remover filmes. Os dados ficam salvos no próprio navegador com `localStorage`.

- **Nome:** Fernando Caldi
- **RA:** ra115688

## Tecnologias

- HTML5
- CSS3 (Grid, Flexbox, variáveis CSS, media queries, dark mode com `prefers-color-scheme`)
- JavaScript ES6+ (DOM API)
- localStorage

Não foram usados frameworks, bibliotecas externas nem backend.

## Estrutura

```
cinetrack/
├── README.md
├── .gitignore
└── parte1/
    ├── index.html
    ├── style.css
    └── app.js
```

## Como executar

1. Clone ou baixe o repositório.
2. Abra o arquivo `parte1/index.html` no navegador (duplo clique já funciona).

Opcionalmente, é possível usar uma extensão como o *Live Server* do VS Code.

## Funcionalidades

- Lista de filmes em cards gerados dinamicamente com JavaScript
- Busca por título (sem diferenciar maiúsculas/minúsculas) enquanto o usuário digita
- Filtros por status: Todos, Assistido, Assistindo e Quero assistir
- Busca e filtro funcionando juntos
- Cadastro e edição no mesmo formulário (modal), com validação em HTML e em JavaScript
- Remoção com confirmação
- Persistência com `localStorage`
- Layout responsivo (de 320px até telas grandes)

## Observações

- A aplicação é somente frontend: não há servidor nem banco de dados.
- Na primeira execução são carregados 6 filmes de exemplo. Depois disso, a lista salva no navegador é usada.
- Para voltar aos dados iniciais, apague a chave `cinetrack-filmes` do `localStorage` pelas ferramentas de desenvolvedor do navegador.
