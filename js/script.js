const supabaseUrl = 'https://cajdkqbzeedpsimbodax.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhamRrcWJ6ZWVkcHNpbWJvZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTA3MzUsImV4cCI6MjA2MzMyNjczNX0.9Dgz4NN2jEkdvdSyV4DK9uaXldo-cjfCt7NlYQkxuTE';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

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



