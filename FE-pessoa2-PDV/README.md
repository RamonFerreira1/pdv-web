# 🛒 Front-end — Pessoa 2: PDV (Ponto de Venda)

## Sua Responsabilidade

Você é responsável pelo **módulo de PDV** — o coração do sistema. Inclui a tela de vendas, busca de clientes, leitura de código de barras, modal de pagamento e impressão de recibo.

## Arquivos sob sua responsabilidade

```
src/
├── pages/
│   └── PDV.jsx                          → Tela principal do ponto de venda
├── context/
│   └── PDVContext.jsx                   → Gerenciamento de estado do carrinho/venda
└── components/
    └── PDV/
        ├── BuscaCliente.jsx             → Componente de busca de clientes
        ├── LeitorCodigoBarras.jsx       → Leitor/entrada de código de barras
        ├── ModalPagamento.jsx           → Modal para processar pagamentos
        └── Recibo.jsx                   → Componente de impressão de recibo
```

## Como fazer seu commit no repositório do grupo

1. Clone o repositório do grupo:
   ```bash
   git clone https://github.com/[usuario]/[repositorio].git
   cd [repositorio]
   ```

2. Crie uma branch com seu nome:
   ```bash
   git checkout -b fe/pdv
   ```

3. Copie **apenas os seus arquivos** para as pastas corretas do repositório (respeitando a estrutura acima).

4. Faça o commit:
   ```bash
   git add .
   git commit -m "feat: adiciona módulo PDV com carrinho, pagamento e recibo"
   git push origin fe/pdv
   ```

5. Abra um **Pull Request** no GitHub para a branch `main`.

## ⚠️ Importante
- **NÃO** commite arquivos de `node_modules/`
- **NÃO** commite o arquivo `.env`
- Respeite a estrutura de pastas do repositório original
