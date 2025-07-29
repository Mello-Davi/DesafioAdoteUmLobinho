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
function atualizarNumerosPagina(totalPaginas) {
    const container = document.getElementById('numeros-pagina');
    if (!container) return;

    container.innerHTML = '';

    const maxNumerosVisiveis = 5;
    let inicio = Math.max(1, paginaAtual - Math.floor(maxNumerosVisiveis / 2));
    let fim = inicio + maxNumerosVisiveis - 1;

    if (fim > totalPaginas) {
        fim = totalPaginas;
        inicio = Math.max(1, fim - maxNumerosVisiveis + 1);
    }

    for (let i = inicio; i <= fim; i++) {
        const botao = document.createElement('button');
        botao.textContent = i;
        if (i === paginaAtual) {
            botao.classList.add('ativo');
        }
        botao.addEventListener('click', () => {
            paginaAtual = i;
            mostrarPagina(paginaAtual);
        });
        container.appendChild(botao);
    }
}
function renderizarLobinhos(lobinhosPagina){
    const container = document.querySelector('.lobinhos-container');
    container.innerHTML = '';

    lobinhosPagina.forEach((lobo, index) => {
        const div = document.createElement('div');
        const globalIndex = (paginaAtual - 1) * LobosPorPagina + index;
        const direcao = index % 2 === 0 ? 'lobinho-esquerda' : 'lobinho-direita';
        div.classList.add(direcao);

        const adotado = lobo.adotado;
        div.innerHTML = `
            <img src="${lobo.imagem}" alt="${lobo.nome}">
            <div class="apresentacao">
                <div class="adocao">
                    <div class="nomeIdade">
                        <h2>${lobo.nome}</h2>
                        <p>Idade: ${lobo.idade} anos</p>
                    </div>
                    <button class="ver-lobo" ${lobo.adotado ? 'disabled' : ''}>${lobo.adotado ? 'Adotado' : 'Adotar'}</button>
                    </a>

                </div>
                <p>${lobo.descricao}</p>
            </div>
        `;
        const botao = div.querySelector('.ver-lobo');

        if (!lobo.adotado) {
            botao.addEventListener('click', () => {
                localStorage.setItem('lobinhoSelecionado', JSON.stringify(lobo));
                window.location.href = 'showLobinho.html';
            });
}
        container.appendChild(div);
    });
}
function salvarLobos(){
    localStorage.setItem('lobos', JSON.stringify(lobos));
}
function filtrarLobos() {
    const pesquisa = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
    const mostrarAdotados = document.getElementById('meuCheckbox')?.checked;

    lobosFiltrados = lobos.filter(lobo => {
        const nomeIgual = lobo.nome.toLowerCase().includes(pesquisa);
        const adotadoCondiz = mostrarAdotados ? lobo.adotado === true : true;
        return nomeIgual && adotadoCondiz;
    });

    filtrado = true;
    paginaAtual = 1;
    mostrarPagina(paginaAtual);
}
document.addEventListener('DOMContentLoaded', () =>{
    const path = window.location.pathname;

    // ========== listaDeLobinhos.html ==========
    if (path.endsWith('listaDeLobinhos.html')) {

        if(!localStorage.getItem('lobos')){
            inicializarLocalStorage().then(() => carregarLobinhos());
        } else {
            carregarLobinhos();
        }
        document.getElementById('anterior')?.addEventListener('click', () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                mostrarPagina(paginaAtual);
            }
        });
        document.getElementById('proximo')?.addEventListener('click', () => {
            const lista = filtrado ? lobosFiltrados : lobos;
            const totalPaginas = Math.ceil(lista.length / LobosPorPagina);
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                mostrarPagina(paginaAtual);
            }
        });
    document.getElementById('searchButton')?.addEventListener('click', filtrarLobos);
    document.getElementById('meuCheckbox')?.addEventListener('change', filtrarLobos); 
}

carregarLobinhos();