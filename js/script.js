import supabaseClient from "./conexao.js"

const form = document.getElementById('loginForm')

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  const email = document.getElementById('email').value.trim()
  const senha = document.getElementById('senha').value.trim()

  const { data , error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
  })

  if(error){
    console.log("Senha ou E-mail Incorreto")
    alert("Senha ou E-mail incorreto")
  }else{
    window.location.href = 'estoque.html'
  }


}) 



