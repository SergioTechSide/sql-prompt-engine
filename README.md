# 🧠 SQL Prompt Engine — Tradutor de Linguagem Natural para SQL & JSON

Aplicação web desenvolvida para demonstrar a aplicação prática de **Engenharia de Prompts** e **Modelos de Linguagem (LLMs)** na tradução de perguntas de negócio em português para consultas **SQL** otimizadas e saídas estruturadas em **JSON**.

🔗 **Acesse a aplicação funcionando:** [https://sergiotechside.github.io/sql-prompt-engine/](https://sergiotechside.github.io/sql-prompt-engine/)

---

## 🎯 Problema Resolvido
Equipes de negócios, operações e planejamento frequentemente precisam extrair métricas de bancos de dados relacionais (SQLite, PostgreSQL, MySQL), mas dependem da disponibilidade de analistas técnicos para escrever queries. O **SQL Prompt Engine** atua como uma camada inteligente que converte solicitações em linguagem natural em comandos SQL seguros (`SELECT` read-only) e esquemas JSON prontos para integração via API.

## ⚙️ Funcionalidades
* **Modo Demonstração Instantânea:** Exemplos reais pré-carregados com simulação imediata de SQL, JSON estruturado e preview de tabela de resultados.
* **Engenharia de Prompts Estruturada (Few-Shot + Schema Injection):** Visualização transparente do prompt técnico enviado ao modelo, garantindo precisão nas tabelas e colunas.
* **Integração Real com Google Gemini API (Opcional):** Permite inserir uma chave de API gratuita do Google AI Studio para traduzir qualquer pergunta personalizada em tempo real.

## 🛠️ Tecnologias Utilizadas
* **Frontend:** HTML5, CSS3 (Dark Mode Responsivo), JavaScript (ES6+)
* **IA & Prompts:** Engenharia de Prompts (Schema-Aware SQL Generation), integração REST com Gemini API
* **Hospedagem:** GitHub Pages
