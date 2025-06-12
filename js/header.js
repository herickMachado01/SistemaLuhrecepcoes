import supabaseClient from "./conexao.js";

fetch('header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;

    function PopSair() {
    const popup = document.getElementById("popup");
    if (popup) {
      popup.style.display = "flex";
    } else {
      console.error("Elemento #popup não encontrado.");
    }
  }


  async function Simsair() {
    const { error } = await supabaseClient.auth.signOut();
    if(Simsair){
      window.location.href = "login.html"
    }else{
      console.log(error.message)
    }
  }

  function Cancelar() {
    const popup = document.getElementById("popup");
    if (popup) {
      popup.style.display = "none";
    } else {
      console.error("Elemento #popup não encontrado.");
    }
  } 

  window.PopSair = PopSair;
  window.Simsair = Simsair;
  window.Cancelar = Cancelar;



  });
