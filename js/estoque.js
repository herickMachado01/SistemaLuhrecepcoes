import supabaseClient from "./conexao.js"


const cadastrar = document.getElementById("cadastrar")
cadastrar.addEventListener('click', async () => {
    const nomeP = document.getElementById("produto").value
    const quant = parseInt(document.getElementById("quantidade").value)
    const descricao = document.getElementById("descricao").value
    const dataInf = document.getElementById("data").value
    
    
    if(!nomeP ||isNaN(quant)|| !descricao ){
        const mensagem = document.getElementById("erro")
        mensagem.textContent = "Prencha todos os campos"
    }

    const {data , error} = await supabaseClient
    .from("estoque")
      .insert({ 
        nome : nomeP,
        quantidade: quant,
        descricao: descricao,
        created: dataInf
       })

       Carregardados()

      function mostrarMensagem(mensagem, cor = "#4CAF50") { 
      const alerta = document.getElementById("CadastroConcluido");
      alerta.textContent = mensagem;
      alerta.style.display = "block";

      setTimeout(() => {
        alerta.style.display = "none";
      }, 3000);
    }

    
    if (error) {
      console.error("Erro ao cadastrar:", error);
      mostrarMensagem("Erro ao cadastrar produto.", "#f44336"); 
    } else {
      mostrarMensagem("Cadastro concluído com sucesso!");
    }
    
})

async function Carregardados(){
    const {data , error} = await supabaseClient
    .from('estoque')
    .select('*')

    if(error){
        console.log("erro ao puxar")
        return
    }

    const container  = document.getElementById('lista-produtos')
    container.innerHTML = ""

          data.forEach(item => {
            const divItem = document.createElement('div');
      divItem.style.borderBottom = '1px solid #ddd';
      divItem.style.padding = '8px 0';
      divItem.style.display = 'flex';
      divItem.style.justifyContent = 'space-between';
      divItem.style.alignItems = 'center';

      divItem.innerHTML = `
        <div>
          <strong>${item.nome}</strong><br>
          Quantidade: ${item.quantidade}<br>
          Descrição: ${item.descricao}<br>
          Data: ${item.created}
        </div>
        <div>
          <button style="
            background: transparent;
            border: 1px solid #555;
            color: #555;
            padding: 6px 10px;
            margin-left: 5px;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s;
          " onclick="editarItem(${item.id}, '${item.nome}', ${item.quantidade}, '${item.descricao}', '${item.created}')">Editar</button>

          <button style="
            background: transparent;
            border: 1px solid #c0392b;
            color: #c0392b;
            padding: 6px 10px;
            margin-left: 5px;
            margin-right: 10px;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s;
          " onclick="excluirItem(${item.id})">Excluir</button>
        </div>
        
      `;

container.appendChild(divItem);
    })
}

let idParaExcluir = null;

window.excluirItem = function(id) {
  idParaExcluir = id;
  document.getElementById('confirmModal').style.display = 'flex';
};

document.getElementById('confirmYes').onclick = async function() {
  const { error } = await supabaseClient
    .from('estoque')
    .delete()
    .eq('id', idParaExcluir);

  if (error) {
    if (error.code === '23503') {
      console.log("Este item está sendo utilizado em alguma festa e não pode ser excluído.");
    } else {
      console.log("Erro ao excluir item.");
    }
    console.error("Erro ao excluir:", error);
  }

  document.getElementById('confirmModal').style.display = 'none';
  idParaExcluir = null;
  Carregardados();
};

document.getElementById('confirmNo').onclick = function() {
  document.getElementById('confirmModal').style.display = 'none';
  idParaExcluir = null;
};




let idParaEditar = null

window.editarItem = function(id , nome , quantidade,descricao,data){
  idParaEditar = id;
  document.getElementById('edit-nome').value = nome;
  document.getElementById('edit-quant').value = quantidade;
  document.getElementById('edit-desc').value = descricao;
  document.getElementById('edit-data').value = data?.substring(0, 10) || ''; 
  document.getElementById('popup-editar').style.display = 'flex';
}


   const close = document.getElementById("closeModal")

   close.addEventListener('click' , () =>{
    document.getElementById('popup-editar').style.display = 'none';
   } )

  document.getElementById('confirmar-edicao').addEventListener('click', async () =>{
    const nome = document.getElementById('edit-nome').value;
    const quant = parseInt(document.getElementById('edit-quant').value);
    const desc = document.getElementById('edit-desc').value;
    const data = document.getElementById('edit-data').value;
   

    if(!nome || isNaN(quant) || !desc || !data){
      const popErro = document.getElementById('erropopup')
      popErro.textContent = "Prencha todos os campos"
      return
    }

    const { error } = await supabaseClient
    .from('estoque')
    .update({ nome: nome, quantidade: quant, descricao: desc, created: data })
    .eq('id', idParaEditar);

    Carregardados(); 
    
    if (error) {
      console.error('Erro ao editar:', error.message);
      console.log("Erro ao salvar.");
    } else {
      const Popupsalvar = document.getElementById('popsalvo')
      Popupsalvar.textContent = 'Salvo'
  }})

 
  Carregardados(); 
 
  

 