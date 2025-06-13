import supabaseClient from "./conexao.js";

let festaEditandoId = null;

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

    async function carregarItensEstoque(selectElement = null) {
      const { data, error } = await supabaseClient.from("estoque").select("id, nome");

      if (error) {
        console.error("Erro ao carregar itens:", error);
        return;
      }

      const todosSelects = document.querySelectorAll(".itemSelect");
      const idsSelecionados = new Set();

      todosSelects.forEach((select) => {
        if (select !== selectElement) {
          idsSelecionados.add(select.value);
        }
      });

      const targets = selectElement ? [selectElement] : todosSelects;

      targets.forEach((select) => {
        select.innerHTML = "";
        const optionVazia = document.createElement("option");
        optionVazia.disabled = true;
        optionVazia.selected = true;
        optionVazia.textContent = "Selecione um item...";
        select.appendChild(optionVazia);

        data.forEach((item) => {
          if (!idsSelecionados.has(String(item.id)) || select.value == item.id) {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = item.nome;
            select.appendChild(option);
          }
        });
      });
    }


    document.getElementById("addItemBtn").addEventListener("click", async () => {
      const container = document.getElementById("itensContainer");

      const { data: estoque } = await supabaseClient.from("estoque").select("id, nome");
      const todosSelects = document.querySelectorAll(".itemSelect");
      const idsSelecionados = new Set();

      todosSelects.forEach((select) => {
        idsSelecionados.add(select.value);
      });

      const itensRestantes = estoque.filter(item => !idsSelecionados.has(String(item.id)));

      if (itensRestantes.length === 0) {
        console.log("Todos os itens do estoque já foram adicionados.")
        return;
      }

      const div = document.createElement("div");
      div.className = "item-group";
      div.innerHTML = `
        <label>Item a Utilizar</label>
        <select class="itemSelect" required></select>
        <label>Quantidade</label>
        <input type="number" class="quantidade" min="1" required>
        <button type="button" class="removerItemBtn" style="margin-top: 10px; background-color: #c82333; border: none; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">Remover</button>
      `;

      div.querySelector(".removerItemBtn").addEventListener("click", () => {
        div.remove();
        atualizarTodosSelects(); 
      });

      container.appendChild(div);

      const novoSelect = div.querySelector(".itemSelect");
      await carregarItensEstoque(novoSelect);
    });


  document.getElementById("formFesta").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeFesta").value.trim();
    const descricao = document.getElementById("descricaoFesta").value.trim();
    const localizacao = document.getElementById("localizacaoFesta").value.trim();

    if (!nome || !descricao || !localizacao) {
      console.log("Preencha todos os campos da festa.")
      return;
    }

    const itemGroups = document.querySelectorAll(".item-group");
    if (itemGroups.length === 0) {
      console.log("Adicione pelo menos um item.")
      return;
    }

    const itensSelecionados = [];

    for (const grupo of itemGroups) {
      const select = grupo.querySelector(".itemSelect");
      const inputQtd = grupo.querySelector(".quantidade");

      const item_id = select.value;
      const quantidade = parseInt(inputQtd.value, 10);

      if (!item_id || !quantidade || quantidade <= 0) {
       console.log("Preencha os itens corretamente.")
        return;
      }

      const { data, error } = await supabaseClient
        .from("estoque")
        .select("nome, quantidade")
        .eq("id", item_id)
        .single();

      if (quantidade > data.quantidade) {
        const alerta = document.getElementById("mensagemAlerta");
        alerta.textContent = `Estoque insuficiente para o item ${data.nome}. Disponível: ${data.quantidade}`;
        alerta.style.display = "block";
        setTimeout(() => alerta.style.display = "none", 3000);
        return;
      }

      itensSelecionados.push({ item_id, quantidade });
    }

    let festaId;

    if (festaEditandoId) {
      const { error: erroUpdate } = await supabaseClient
        .from("festa")
        .update({ nome, descricao, localizacao })
        .eq("id", festaEditandoId);

      if (erroUpdate) {
        console.log("erro")
        return;
      }

      const { data: itensAntigos } = await supabaseClient
        .from("itens_festa")
        .select("item_id, quantidade")
        .eq("festa_id", festaEditandoId);

      for (const item of itensAntigos || []) {
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

      await supabaseClient.from("itens_festa").delete().eq("festa_id", festaEditandoId);

      festaId = festaEditandoId;
      festaEditandoId = null;
    } else {
      const { data: festaData, error: festaErro } = await supabaseClient
        .from("festa")
        .insert([{ nome, descricao, localizacao }])
        .select()
        .single();

      if (festaErro) {
        return;
      }

      festaId = festaData.id;
    }

    for (const item of itensSelecionados) {
      await supabaseClient
        .from("itens_festa")
        .insert([{ festa_id: festaId, item_id: item.item_id, quantidade: item.quantidade }]);

      const { data: estoqueAtual } = await supabaseClient
        .from("estoque")
        .select("quantidade")
        .eq("id", item.item_id)
        .single();

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


  document.querySelectorAll(".editarBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const festaId = btn.getAttribute("data-id");
      festaEditandoId = festaId;

      const { data: festa } = await supabaseClient
        .from("festa")
        .select("*")
        .eq("id", festaId)
        .single();

      const { data: itensUsados } = await supabaseClient
        .from("itens_festa")
        .select("item_id, quantidade")
        .eq("festa_id", festaId);

      document.getElementById("nomeFesta").value = festa.nome;
      document.getElementById("descricaoFesta").value = festa.descricao;
      document.getElementById("localizacaoFesta").value = festa.localizacao;

      const container = document.getElementById("itensContainer");
      container.innerHTML = "";

      for (const item of itensUsados) {
        const div = document.createElement("div");
        div.className = "item-group";
        div.innerHTML = `
          <label>Item a Utilizar</label>
          <select class="itemSelect" required></select>
          <label>Quantidade</label>
          <input type="number" class="quantidade" min="1" required value="${item.quantidade}">
          <button type="button" class="removerItemBtn" style="margin-top: 10px; background-color: #c82333; border: none; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">Remover</button>
        `;

        div.querySelector(".removerItemBtn").addEventListener("click", () => {
          div.remove();
        });

        container.appendChild(div);
      }

      modal.style.display = "flex";
      await carregarItensEstoque();

      const selects = container.querySelectorAll(".itemSelect");
      itensUsados.forEach((item, index) => {
        selects[index].value = item.item_id;
      });
    });
  });

  
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


