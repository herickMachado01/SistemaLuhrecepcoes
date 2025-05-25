const supabaseUrl = 'https://cajdkqbzeedpsimbodax.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhamRrcWJ6ZWVkcHNpbWJvZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTA3MzUsImV4cCI6MjA2MzMyNjczNX0.9Dgz4NN2jEkdvdSyV4DK9uaXldo-cjfCt7NlYQkxuTE';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
fetch('header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;

    const botao = document.getElementById('botao');

    
    if (botao) {
      botao.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
          console.log('Erro ao sair:', error.message);
        } else {
          console.log('Saiu com sucesso');
          window.location.href = 'login.html';
        }
      });
    }
  });

  function PopSair(){
    const popup = document.getElementById("popup")
    if(popup){
      popup.style.display = "flex"
    }else{console.error(error)}
  }

  function Simsair(){
    window.location.href = "login.html"
  }

  function Cancelar(){
    popup.style.display = "none"
  }

  