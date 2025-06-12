import supabaseClient from "./conexao.js";

const modal = document.getElementById("modalFesta");
const bnt = document.getElementById("cadastrarFesta");
const spn = document.getElementById("closeModal");

bnt.addEventListener("click", () => {
  modal.style.display = "flex";
  carregarItensEstoque();
});

spn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

async function carregarItensEstoque() {
  const { data, error } = await supabaseClient.from("estoque").select("id, nome");

  if (error) {
    console.error("Erro ao carregar itens:", error);
    return;
  }

  document.querySelectorAll(".itemSelect").forEach((select) => {
    select.innerHTML = "";
    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.nome;
      select.appendChild(option);
    });
  });
}

document.getElementById("addItemBtn").addEventListener("click", () => {
  const container = document.getElementById("itensContainer");

  const div = document.createElement("div");
  div.className = "item-group";
  div.innerHTML = `
        <label>Item a Utilizar</label>
        <select class="itemSelect" required></select>
        <label>Quantidade</label>
        <input type="number" class="quantidade" min="1" required>
        <button type="button" class="removerItemBtn" style="
            margin-top: 10px;
            background-color: #c82333;
            border: none;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
        ">Remover</button>
    `;
  div.querySelector(".removerItemBtn").addEventListener("click", () => {
    div.remove();
  });

  container.appendChild(div);
  carregarItensEstoque();
});

document.getElementById("formFesta").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeFesta").value.trim();
  const descricao = document.getElementById("descricaoFesta").value.trim();
  const localizacao = document.getElementById("localizacaoFesta").value.trim();

  if (!nome || !descricao || !localizacao) {
    alert("Preencha todos os campos da festa.");
    return;
  }

  const itemGroups = document.querySelectorAll(".item-group");
  if (itemGroups.length === 0) {
    alert("Adicione pelo menos um item.");
    return;
  }

  const itensSelecionados = [];

  for (const grupo of itemGroups) {
    const select = grupo.querySelector(".itemSelect");
    const inputQtd = grupo.querySelector(".quantidade");

    const item_id = select.value;
    const quantidade = parseInt(inputQtd.value, 10);

    if (!item_id) {
      alert("Selecione um item.");
      return;
    }
    if (!quantidade || quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    // Verificar estoque
    const { data, error } = await supabaseClient
      .from("estoque")
      .select("nome, quantidade")
      .eq("id", item_id)
      .single();

      function mostrarAlerta(mensagem) {
        const alerta = document.getElementById("mensagemAlerta");
        alerta.textContent = mensagem;
        alerta.style.display = "block";

        // Esconde depois de 3 segundos
        setTimeout(() => {
          alerta.style.display = "none";
        }, 3000);
      }
      
      if (quantidade > data.quantidade) {
        mostrarAlerta(`Estoque insuficiente para o item ${data.nome}. Disponível: ${data.quantidade}`);
        return;
      }


    itensSelecionados.push({ item_id, quantidade });
  }

  const { data: festaData, error: festaErro } = await supabaseClient
    .from("festa")
    .insert([{ nome, descricao, localizacao }])
    .select()
    .single();

  if (festaErro) {
    alert("Erro ao cadastrar festa.");
    return;
  }

  const festaId = festaData.id;

  for (const item of itensSelecionados) {
    const { error: erroInsercao } = await supabaseClient
    .from("itens_festa")
    .insert([{ festa_id: festaId, item_id: item.item_id, quantidade: item.quantidade }]);

    if (erroInsercao) {
    console.error("Erro ao inserir em itens_festa:", erroInsercao);
    alert("Erro ao salvar itens da festa. Verifique se todos os campos estão corretos.");
    return;
    }

    const { data: estoqueAtual, error: errEstoque } = await supabaseClient
      .from("estoque")
      .select("quantidade")
      .eq("id", item.item_id)
      .single();

    if (errEstoque || !estoqueAtual) {
      alert("Erro ao atualizar estoque do item " + item.item_id);
      return;
    }

    const novaQtd = estoqueAtual.quantidade - item.quantidade;

    await supabaseClient
      .from("estoque")
      .update({ quantidade: novaQtd })
      .eq("id", item.item_id);
  }
  
  window.location.reload();
});


async function carregarFestas() {
  const { data: festas } = await supabaseClient.from("festa").select("*");
  const container = document.getElementById("listaFestas");
  container.innerHTML = "";

  for (const festa of festas) {

    const { data: itensUsados, error } = await supabaseClient
    .from("itens_festa")
    .select("quantidade, estoque(nome)")
    .eq("festa_id", festa.id);

    let listaItens = "";
    if (itensUsados && itensUsados.length > 0) {
      itensUsados.forEach((item) => {
        listaItens += `<li>${item.estoque.nome} - ${item.quantidade}</li>`;
      });
    }

    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${festa.nome}</h3>
      <p>${festa.descricao}</p>
      <p><strong>Local:</strong> ${festa.localizacao}</p>
      <p><strong>Itens utilizados:</strong></p>
      <ul>${listaItens}</ul>
      <button class="excluirBtn" data-id="${festa.id}">Excluir Festa</button>
      <button class="editarBtn" data-id="${festa.id}">Editar Festa</button>
      <hr>
    `;
    container.appendChild(div);
  }
  
  document.querySelectorAll(".excluirBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const festaId = btn.getAttribute("data-id");

      const { data: itensUsados } = await supabaseClient
        .from("itens_festa")
        .select("item_id, quantidade")
        .eq("festa_id", festaId);

      for (const item of itensUsados || []) {
        const { data: estoqueAtual } = await supabaseClient
          .from("estoque")
          .select("quantidade")
          .eq("id", item.item_id)
          .single();

        const novaQtd = estoqueAtual.quantidade + item.quantidade;

        await supabaseClient
          .from("estoque")
          .update({ quantidade: novaQtd })
          .eq("id", item.item_id);
      }

      await supabaseClient.from("itens_festa").delete().eq("festa_id", festaId);
      await supabaseClient.from("festa").delete().eq("id", festaId);

      
      carregarFestas();
    });
  });
}

carregarFestas();


