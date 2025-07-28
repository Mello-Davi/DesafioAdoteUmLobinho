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
    const spanPagina = document.getElementById('pagina-atual');
    if (spanPagina){
        spanPagina.textContent = `${pagina} / ${Math.ceil(listaAtual.length /LobosPorPagina)}`;
    }
}
carregarLobinhos();