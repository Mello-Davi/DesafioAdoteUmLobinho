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

function excluirLobo() {
    const botaoExcluir = document.getElementById('btn_excluir');

    if (!botaoExcluir) {
        console.error('Botão EXCLUIR não encontrado no DOM.');
        return;
    }

    console.log('Botão EXCLUIR encontrado. Adicionando evento...');

    botaoExcluir.addEventListener('click', () => {
        console.log('Clique detectado no botão EXCLUIR');

        const lobinhoSelecionado = JSON.parse(localStorage.getItem('lobinhoSelecionado'));
        lobos = JSON.parse(localStorage.getItem('lobos')) || [];

        const index = lobos.findIndex(lobo => parseInt(lobo.id) === parseInt(lobinhoSelecionado.id));

        if (index !== -1) {
            if (confirm(`Tem certeza que deseja excluir o lobinho "${lobos[index].nome}"?`)) {
                lobos.splice(index, 1);
                localStorage.setItem('lobos', JSON.stringify(lobos));
                localStorage.removeItem('lobinhoSelecionado');
                window.location.href = 'listaDeLobinhos.html';
                return;
            }
        } else {
            console.warn("Lobinho não encontrado para exclusão.");
        }
    });
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
    // ========== adotarLobinho.html ==========
    else if (path.endsWith('adotarLobinho.html')) {
        const lobinho = JSON.parse(localStorage.getItem('lobinhoSelecionado'));
        if (!lobinho) {
            alert("Nenhum lobinho selecionado.");
            window.location.href = "listaDeLobinhos.html";
            return;
        }

        const h1 = document.querySelector('.textoApresentacao h1');
        const pId = document.querySelector('.textoApresentacao p');
        if (h1 && pId) {
            h1.textContent = `Adote o(a) ${lobinho.nome}`;
            pId.textContent = `ID: ${lobinho.id}`;
        }

        const form = document.getElementById('adotar-lobo');
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const nomeDono = document.getElementById('nomeDono').value.trim();
            const idadeDono = parseInt(document.getElementById('idadeDono').value);
            const emailDono = document.getElementById('emailDono').value.trim();

            const lobosAdot = JSON.parse(localStorage.getItem('lobos')) || [];
            const index = lobosAdot.findIndex(l => parseInt(l.id) === parseInt(lobinho.id));

            if (index === -1) {
                alert("Erro: Lobinho não encontrado.");
                return;
            }

            lobosAdot[index].adotado = true;
            lobosAdot[index].nomeDono = nomeDono;
            lobosAdot[index].idadeDono = idadeDono;
            lobosAdot[index].emailDono = emailDono;

            localStorage.setItem('lobos', JSON.stringify(lobosAdot));
            localStorage.removeItem('lobinhoSelecionado');

            window.location.href = 'listaDeLobinhos.html';
        });
    }
    else if (path.endsWith('showLobinho.html')) {
        const lobinho = JSON.parse(localStorage.getItem('lobinhoSelecionado'));
        if (!lobinho) {
            alert("Nenhum lobinho selecionado.");
            window.location.href = "listaDeLobinhos.html";
            return;
        }

        const h1 = document.querySelector('.nomeDoLobo');
        if (h1) h1.textContent = lobinho.nome;

        const img = document.querySelector('.imagemLoboEBotoes img');
        if (img) img.src = lobinho.imagem;
        excluirLobo();
    }
       // ========== adicionar novo lobinho ==========
    const formNovoLobo = document.getElementById('novo-lobo');
    if (formNovoLobo) {
        formNovoLobo.addEventListener('submit', function (e) {
            e.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const idade = parseInt(document.getElementById('anos').value);
            const imagem = document.getElementById('foto').value.trim();
            const descricao = document.getElementById('descricao').value.trim();

            if (!nome || isNaN(idade) || !imagem || !descricao) {
                alert('Por favor, preencha todos os campos corretamente.');
                return;
            }

            const lobosAtuais = JSON.parse(localStorage.getItem('lobos')) || [];
            const maiorId = lobosAtuais.reduce((max, lobo) => Math.max(max, lobo.id || 0), 0);
            const novoId = maiorId + 1;

            const novoLobo = {
                id: novoId,
                nome: nome,
                idade: idade,
                imagem: imagem,
                descricao: descricao,
                adotado: false,
                nomeDono: null,
                idadeDono: null,
                email: null
            };

            lobosAtuais.push(novoLobo);
            localStorage.setItem('lobos', JSON.stringify(lobosAtuais));

            e.target.reset();
            window.location.href = "listaDeLobinhos.html";
        });
    }

});

