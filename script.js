const PRESETS = {
  top_clientes: {
    question: "Liste os 5 clientes que mais gastaram em pedidos entregues.",
    sql: `SELECT \n  c.id,\n  c.nome,\n  c.cidade,\n  COUNT(p.id) AS total_pedidos,\n  SUM(p.valor_total) AS receita_total\nFROM clientes c\nINNER JOIN pedidos p ON c.id = p.cliente_id\nWHERE p.status_entrega = 'ENTREGUE'\nGROUP BY c.id, c.nome, c.cidade\nORDER BY receita_total DESC\nLIMIT 5;`,
    json: {
      intent: "ranking_clientes_receita",
      confidence: 0.98,
      read_only: true,
      tables_used: ["clientes", "pedidos"],
      sample_preview: [
        { nome: "Mariana Silva", cidade: "Aracaju", total_pedidos: 14, receita_total: 4890.50 },
        { nome: "Carlos Eduardo", cidade: "São Paulo", total_pedidos: 11, receita_total: 4120.00 }
      ]
    }
  },
  inativos: {
    question: "Quais clientes ativos não realizaram nenhum pedido nos últimos 30 dias?",
    sql: `SELECT \n  c.id,\n  c.nome,\n  c.cidade,\n  MAX(p.data_pedido) AS ultimo_pedido\nFROM clientes c\nLEFT JOIN pedidos p ON c.id = p.cliente_id\nWHERE c.status = 'ATIVO'\nGROUP BY c.id, c.nome, c.cidade\nHAVING MAX(p.data_pedido) < DATE('now', '-30 days')\n   OR MAX(p.data_pedido) IS NULL\nORDER BY ultimo_pedido ASC;`,
    json: {
      intent: "churn_prevention_inactive_customers",
      confidence: 0.96,
      read_only: true,
      tables_used: ["clientes", "pedidos"],
      filter_window_days: 30
    }
  },
  estoque: {
    question: "Mostre os produtos com estoque crítico abaixo de 10 unidades ordenados pelo menor saldo.",
    sql: `SELECT \n  id,\n  nome_produto,\n  categoria,\n  estoque,\n  preco_unitario\nFROM produtos\nWHERE estoque < 10\nORDER BY estoque ASC, nome_produto ASC;`,
    json: {
      intent: "inventory_low_stock_alert",
      confidence: 0.99,
      read_only: true,
      tables_used: ["produtos"],
      threshold: 10
    }
  }
};

const questionInput = document.getElementById("userQuestion");
const apiKeyInput = document.getElementById("apiKey");
const generateBtn = document.getElementById("generateBtn");
const outputSection = document.getElementById("outputSection");
const sqlOutput = document.getElementById("sqlOutput");
const jsonOutput = document.getElementById("jsonOutput");
const promptOutput = document.getElementById("promptOutput");

let activePresetKey = "top_clientes";

function buildSystemPrompt(question) {
  return `ROLE: Especialista em Engenharia de Dados e SQL Relacional.
SCHEMA:
- clientes(id, nome, cidade, data_cadastro, status)
- pedidos(id, cliente_id, valor_total, data_pedido, status_entrega)
- produtos(id, nome_produto, categoria, preco_unitario, estoque)

REGRAS:
1. Gere apenas consultas SELECT (read-only). Nunca gere DROP, DELETE ou UPDATE.
2. Utilize aliases claros e JOINs explícitos.
3. Retorne o SQL formatado e os metadados estruturados em JSON.

PERGUNTA DO USUÁRIO: "${question}"`;
}

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    activePresetKey = btn.dataset.preset;
    questionInput.value = PRESETS[activePresetKey].question;
    renderDemo(PRESETS[activePresetKey]);
  });
});

function renderDemo(data) {
  sqlOutput.textContent = data.sql;
  jsonOutput.textContent = JSON.stringify(data.json, null, 2);
  promptOutput.textContent = buildSystemPrompt(data.question);
  outputSection.classList.remove("hidden");
}

generateBtn.addEventListener("click", async () => {
  const text = questionInput.value.trim();
  if (!text) {
    questionInput.value = PRESETS[activePresetKey].question;
    renderDemo(PRESETS[activePresetKey]);
    return;
  }

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    // Modo Demonstração Inteligente sem API Key
    const matched = Object.values(PRESETS).find(p => p.question.toLowerCase() === text.toLowerCase());
    if (matched) {
      renderDemo(matched);
    } else {
      renderDemo({
        question: text,
        sql: `-- Consulta gerada em Modo Demonstração para:\n-- "${text}"\nSELECT \n  c.nome,\n  p.id AS pedido_id,\n  p.valor_total,\n  p.data_pedido\nFROM clientes c\nJOIN pedidos p ON c.id = p.cliente_id\nORDER BY p.data_pedido DESC\nLIMIT 10;`,
        json: {
          mode: "demo_fallback",
          question_analyzed: text,
          read_only_validated: true,
          tip: "Insira uma chave gratuita do Google Gemini no campo acima para geração dinâmica via LLM."
        }
      });
    }
    return;
  }

  // Modo Real com Google Gemini API
  generateBtn.textContent = "⏳ Processando com Gemini LLM...";
  generateBtn.disabled = true;

  try {
    const prompt = buildSystemPrompt(text) + `\n\nResponda ESTRITAMENTE neste formato JSON válido sem markdown:\n{"sql": "...", "json_meta": {"intent": "...", "tables_used": [], "read_only": true}}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(rawText);

    sqlOutput.textContent = parsed.sql;
    jsonOutput.textContent = JSON.stringify(parsed.json_meta, null, 2);
    promptOutput.textContent = buildSystemPrompt(text);
    outputSection.classList.remove("hidden");
  } catch (err) {
    alert("Não foi possível conectar à API com essa chave. Verifique a chave ou deixe o campo vazio para usar o Modo Demo.");
  } finally {
    generateBtn.textContent = "⚡ Gerar Consulta SQL e JSON Estruturado";
    generateBtn.disabled = false;
  }
});

function setupCopy(btnId, sourceId) {
  document.getElementById(btnId).addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById(sourceId).textContent);
    const btn = document.getElementById(btnId);
    const original = btn.textContent;
    btn.textContent = "Copiado!";
    setTimeout(() => (btn.textContent = original), 1500);
  });
}

setupCopy("copySqlBtn", "sqlOutput");
setupCopy("copyJsonBtn", "jsonOutput");

// Carrega o primeiro exemplo automaticamente ao abrir a página
questionInput.value = PRESETS.top_clientes.question;
renderDemo(PRESETS.top_clientes);
