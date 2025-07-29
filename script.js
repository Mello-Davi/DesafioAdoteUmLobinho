async function inicializarLocalStorage() {
    try {
        const response = await fetch('lobinhos.json');
        if (!response.ok) {
            throw new Error(`Erro ao buscar lobinho.json: ${response.statusText}`);
        }
        const lobos = await response.json();
        localStorage.setItem('lobos', JSON.stringify(lobos));
        console.log('Lobos inicializados no localStorage');
    } catch (error) {
        console.error('Erro ao inicializar o localStorage:', error);
    } finally {
        console.log('Tentativa de inicialização do localStorage concluída');
    }
}

if (!localStorage.getItem('lobos')) {
    inicializarLocalStorage().then(() => {
        console.log('Inicialização do localStorage concluída');
    }).catch(error => {
        console.error('Erro durante a inicialização do localStorage:', error);
    });
}

const LobosPorPagina = 4;
let lobos = [];
let paginaAtual = 1;
let lobosFiltrados = [];
let filtrado = false;

function carregarLobinhos(){
    const lobinhos = localStorage.getItem('lobos');
    lobos = JSON.parse(lobinhos);
    mostrarPagina(paginaAtual);
}
function mostrarPagina(pagina){
    const listaAtual = filtrado ? lobosFiltrados : lobos;
    const inicio = (pagina - 1) * LobosPorPagina;
    const fim = inicio + LobosPorPagina;
    const lobinhosPagina = listaAtual.slice(inicio, fim);

    if(typeof renderizarLobinhos === 'function'){
        renderizarLobinhos(lobinhosPagina)
    }
    const totalPaginas = Math.ceil(listaAtual.length / LobosPorPagina);
    atualizarNumerosPagina(totalPaginas); 

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderizarLobinhos(lobinhosPagina){
    const container = document.querySelector('.lobinhos-container');
    container.innerHTML = '';

    lobinhosPagina.forEach((lobo, index) => {
        const div = document.createElement('div');
         const direcao = index % 2 === 0 ? 'lobinho-esquerda' : 'lobinho-direita';
        div.classList.add(direcao);
        const adotado = lobo.adotado;
        div.innerHTML = `<img src="${lobo.imagem}" alt="${lobo.nome}"> 
        <h2>${lobo.nome}</h2> 
        <p>Idade: ${lobo.idade}</p>
        <p>${lobo.descricao}</p>
        <button ${adotado ? 'disabled' : ''}>${adotado ? 'Adotado' : 'Adotar'}</button>`;

        const botao = div.querySelector('button');
        botao.addEventListener('click', () =>{
            lobo.adotado = true;
            salvarLobos();
            mostrarPagina(paginaAtual);
        })
        container.appendChild(div);
    })
}
function salvarLobos(){
    localStorage.setItem('lobos', JSON.stringify(lobos));
}
document.addEventListener('DOMContentLoaded', () =>{
    if(!localStorage.getItem('lobos')){
        inicializarLocalStorage().then(() => {
            carregarLobinhos();
        })
    } else {
        carregarLobinhos();
    }
    document.getElementById('anterior').addEventListener('click', () =>{
        if (paginaAtual > 1){
            paginaAtual--;
            mostrarPagina(paginaAtual);
        }
    })
    document.getElementById('proximo').addEventListener('click', () =>{
        const lista = filtrado ? lobosFiltrados : lobos;
        const totalPaginas = Math.ceil(lobos.length / LobosPorPagina);
        if (paginaAtual < totalPaginas){
            paginaAtual++;
            mostrarPagina(paginaAtual);
        }
    })
    document.getElementById('searchButton').addEventListener('click', filtrarLobos);
        
    document.getElementById('btn-limpar').addEventListener('click', () => {
        filtrado = false;
        lobosFiltrados = [];
        document.getElementById('filtro-nome').value = '';
        document.getElementById('filtro-adotado').checked = false;
        paginaAtual = 1;
        mostrarPagina(paginaAtual);
    })
})
function filtrarLobos(){
    const pesquisa = document.getElementById('searchInput').value.trim().toLowerCase();
    const mostrarAdotados = document.getElementById('meuCheckbox').checked;

    lobosFiltrados = lobos.filter(lobo =>{
        const nomeIgual = lobo.nome.toLowerCase().includes(pesquisa);
        const adotadoCondiz = mostrarAdotados ? lobo.adotado === true : true;
        return nomeIgual && adotadoCondiz;
    })
    filtrado = true;
    paginaAtual = 1;
    mostrarPagina(paginaAtual);
}
carregarLobinhos();