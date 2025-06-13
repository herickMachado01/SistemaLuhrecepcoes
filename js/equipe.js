
import supabaseClient from "./conexao.js"

const btnAbrirModal = document.getElementById('cadastrarEquipe')
const modalEquipe = document.getElementById('modalEquipe')
const closeModal = document.getElementById('closeModalEquipe')
const formEquipe = document.getElementById('formEquipe')
const funcionariosContainer = document.getElementById('funcionariosContainer')
const listaEquipes = document.getElementById('listaEquipes')
const festaSelect = document.getElementById('festaSelect')
const btnAdicionarFuncionario = document.getElementById('adicionarFuncionario')

btnAbrirModal.onclick = () => modalEquipe.style.display = 'flex'
closeModal.onclick = () => modalEquipe.style.display = 'none'
window.onclick = e => { if (e.target === modalEquipe) modalEquipe.style.display = 'none' }

function adicionarFuncionario(nome = '', funcao = '', contato = '') {
  const div = document.createElement('div')
  div.classList.add('item-group')
  div.innerHTML = `
    <label>Nome do Funcionário</label>
    <input type="text" class="nomeFuncionario" value="${nome}" required>
    <label>Função</label>
    <input type="text" class="funcaoFuncionario" value="${funcao}" required>
    <label>Contato</label>
    <input type="text" class="contatoFuncionario" value="${contato}" required>
    <button type="button"  style="margin-top: 10px; background-color: #c82333; border: none; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;" class="removerFuncionarioBtn">Remover</button>
  `
  div.querySelector('.removerFuncionarioBtn').onclick = () => div.remove()
  funcionariosContainer.appendChild(div)
}

btnAdicionarFuncionario.onclick = () => adicionarFuncionario()

async function carregarFestas() {
  const { data, error } = await supabaseClient.from('festa').select('id, nome')
  if (error) {
    console.error('Erro ao carregar festas:', error)
    return
  }

  festaSelect.innerHTML = '<option value="">Selecione uma festa</option>'
  data.forEach(festa => {
    const opt = document.createElement('option')
    opt.value = festa.id
    opt.textContent = festa.nome
    festaSelect.appendChild(opt)
  })
}

formEquipe.addEventListener('submit', async (e) => {
  e.preventDefault()

  const festaId = festaSelect.value
  if (!festaId) return alert('Selecione uma festa!')

  const nomes = [...document.getElementsByClassName('nomeFuncionario')].map(el => el.value.trim())
  const funcoes = [...document.getElementsByClassName('funcaoFuncionario')].map(el => el.value.trim())
  const contatos = [...document.getElementsByClassName('contatoFuncionario')].map(el => el.value.trim())
  const nomeEquipe = document.getElementById('nomeEquipe').value.trim()

  const membros = nomes.map((nome, i) => ({ nome, funcao: funcoes[i], contato: contatos[i] }))
  if (membros.some(m => !m.nome || !m.funcao || !m.contato)) {
    return alert('Preencha todos os campos!')
  }

  const editId = formEquipe.getAttribute('data-edit-id')

  let equipeId

  if (editId) {
    
    const { error: erroEquipe } = await supabaseClient
      .from('equipe')
      .update({ nome: nomeEquipe, festa_id: festaId })
      .eq('id', editId)

    if (erroEquipe) {
      console.error('Erro ao atualizar equipe:', erroEquipe)
      return
    }

    equipeId = editId

    await supabaseClient.from('funcionarios_equipe').delete().eq('equipe_id', equipeId)

  } else {
    
    const { data: equipe, error: erroEquipe } = await supabaseClient
      .from('equipe')
      .insert([{ nome: nomeEquipe, festa_id: festaId }])
      .select()
      .single()

    if (erroEquipe) {
      console.error('Erro ao salvar equipe:', erroEquipe)
      return
    }

    equipeId = equipe.id
  }

  
  const funcionarios = membros.map(m => ({
    equipe_id: equipeId,
    nome: m.nome,
    funcao: m.funcao,
    contato: m.contato
  }))

  const { error: erroMembros } = await supabaseClient.from('funcionarios_equipe').insert(funcionarios)
  if (erroMembros) {
    console.error('Erro ao salvar membros:', erroMembros)
    return
  }

 

  formEquipe.reset()
  funcionariosContainer.innerHTML = ''
  adicionarFuncionario()
  modalEquipe.style.display = 'none'
  carregarEquipes()

  if (editId) formEquipe.removeAttribute('data-edit-id')
})


async function carregarEquipes() {
  listaEquipes.innerHTML = 'Carregando...'

  const { data: equipes, error } = await supabaseClient
    .from('equipe')
    .select('id, nome, festa_id, festa (nome)')
    .order('id', { ascending: false })

  if (error) {
    listaEquipes.innerHTML = 'Erro ao carregar equipes'
    console.error(error)
    return
  }

  listaEquipes.innerHTML = ''

  for (const equipe of equipes) {
    const { data: membros, error: erroMembros } = await supabaseClient
      .from('funcionarios_equipe')
      .select('nome, funcao, contato')
      .eq('equipe_id', equipe.id)

    const div = document.createElement('div')
    div.classList.add('festa-item')
    div.innerHTML = `
      <h3>Festa: ${equipe.festa?.nome || 'Desconhecida'}</h3>
      <p><strong>Equipe:</strong> ${equipe.nome}</p>
      <ul>
        ${membros?.map(m => `<li>${m.nome} - ${m.funcao} (${m.contato})</li>`).join('') || '<li>Nenhum membro</li>'}
      </ul>
      <button class="editarBtn" data-id="${equipe.id}">Editar</button>
      <button class="excluirBtn" data-id="${equipe.id}">Excluir</button>
    `
    listaEquipes.appendChild(div)
  }

  
 document.querySelectorAll('.excluirBtn').forEach(btn => {
  btn.onclick = async () => {
    const id = btn.getAttribute('data-id')

    await supabaseClient.from('funcionarios_equipe').delete().eq('equipe_id', id)
    const { error } = await supabaseClient.from('equipe').delete().eq('id', id)

    if (error) {
      console.error(error)
    } else {
      carregarEquipes()
    }
  }
})


  document.querySelectorAll('.editarBtn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id')
      async function carregarEquipeParaEditar(id) {
 
    const { data: equipe, error: erroEquipe } = await supabaseClient
        .from('equipe')
        .select('id, nome, festa_id')
        .eq('id', id)
        .single()

    if (erroEquipe) {
        alert('Erro ao carregar equipe para edição.')
        console.error(erroEquipe)
        return
    }

    const { data: membros, error: erroMembros } = await supabaseClient
        .from('funcionarios_equipe')
        .select('id, nome, funcao, contato')
        .eq('equipe_id', id)

    if (erroMembros) {
        alert('Erro ao carregar membros da equipe.')
        console.error(erroMembros)
        return
    }

    festaSelect.value = equipe.festa_id
    document.getElementById('nomeEquipe').value = equipe.nome
    funcionariosContainer.innerHTML = ''
    membros.forEach(m => {
        adicionarFuncionario(m.nome, m.funcao, m.contato)
    })

    modalEquipe.style.display = 'flex'

    formEquipe.setAttribute('data-edit-id', id)
    }

      await carregarEquipeParaEditar(id)
    }
  })
}



carregarFestas()
carregarEquipes()
adicionarFuncionario()
