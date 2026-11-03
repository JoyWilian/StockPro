const formulario = document.getElementById("form-produto");
const listaProdutos = document.getElementById("lista-produtos");
const popupconfirmacao = document.getElementById("popup-confirmacao");
const botaocancelar = document.getElementById("btn-cancelar");
const botaoConfirmarExclusao = document.getElementById("btn-confirmar-exclusao");
const pesquisaProduto = document.getElementById("pesquisa-produto");
const filtroEstoque = document.getElementById("filtro-estoque");
const ordenarProdutos = document.getElementById("ordenar-produtos");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const totalProdutos = document.getElementById("total-produtos");

    function atualizarIndicadores() {
        totalProdutos.textContent = produtos.length;

        const estoqueBaixo = document.getElementById("estoque-baixo");

        const quantidadeEstoqueBaixo = produtos.filter(function(produto) {
            return Number(produto.quantidade) <= 5;
        }).length;

        estoqueBaixo.textContent = quantidadeEstoqueBaixo;

        const valorTotalEstoque = document.getElementById("valor-total-estoque");

        const total = produtos.reduce(function(soma, produto) {
            return soma + (Number(produto.quantidade) * Number(produto.preco));
        }, 0);

        valorTotalEstoque.textContent = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"

        });
    
    }

let produtosEditando = null;
let produtoParaExcluir = null;

function atualizarAvisoEstoque(card, quantidade) {
    const avisoEstoque = card.querySelector(".aviso-estoque");

    if (Number(quantidade) <= 5) {
        card.classList.add("estoque-baixo");
        avisoEstoque.textContent = "⚠️ Estoque baixo";
    } else{
        card.classList.remove("estoque-baixo");
        avisoEstoque.textContent = "";
    }
}

function criarCardProduto(nome, quantidade, preco) {
    const produto = document.createElement("div")
    produto.classList.add("produto-card");
    produto.dataset.quantidade = quantidade;
    produto.dataset.preco = preco;
    produto.dataset.ordem = listaProdutos.children.length;
    
    produto.innerHTML = `
        <h3>${nome}</h3>
        <p>Quantidade: ${Number(quantidade).toLocaleString("pt-BR")}</p>
        <p class="preco-produto">Preço: ${Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <button class="btn-editar">Editar</button>
        <button class="btn-excluir">Excluir</button>
    `;
    
    listaProdutos.appendChild(produto);

const avisoEstoque = document.createElement("p");
avisoEstoque.classList.add("aviso-estoque");

if (Number(quantidade) <=5) {
    produto.classList.add("estoque-baixo");
    avisoEstoque.textContent = "⚠️ Estoque baixo";
} else {
    avisoEstoque.textContent = "";
}

produto.appendChild(avisoEstoque);

const botaoExcluir = produto.querySelector(".btn-excluir");

botaoExcluir.addEventListener("click", function() {
    produtoParaExcluir = produto;
    popupconfirmacao.style.display = "flex";
});

const botaoEditar = produto.querySelector(".btn-editar");

botaoEditar.addEventListener("click", function() {
    document.getElementById("produto").value = 
        produto.querySelector("h3").textContent;

    document.getElementById("quantidade").value = 
        produto.querySelector("p").textContent.replace("Quantidade: ", "").replace(/\./g, "");

    const indice = produtos.findIndex(function(item) {
        return item.nome === produto.querySelector("h3").textContent;
    });

    document.getElementById("preco").value = produtos[indice].preco;

    produtosEditando = produto;
    formulario.querySelector("button").textContent = "Atualizar";
});

    return produto;
}


produtos.forEach(function(item) {
    criarCardProduto(item.nome, item.quantidade, item.preco);
});

    atualizarIndicadores();

    
function filtrarProdutos() {
    const pesquisa = pesquisaProduto.value.toLowerCase().trim();
    const filtro = filtroEstoque.value;
    const ordenacao = ordenarProdutos.value; 

    const cards = Array.from(
        listaProdutos.querySelectorAll(".produto-card")
    );

    cards.sort(function(a, b) {

        if (ordenacao === "padrao"){
            return Number(a.dataset.ordem) - Number(b.dataset.ordem);
        }

        if (ordenacao === "nome"){
            const nomeA = a.querySelector("h3").textContent.toLowerCase();
            const nomeB = b.querySelector("h3").textContent.toLowerCase();
            return nomeA.localeCompare(nomeB, "pt-BR");
        }

        if (ordenacao === "quantidade") {
            return Number(a.dataset.quantidade) -
                   Number(b.dataset.quantidade);
        }

        if (ordenacao === "preco") {
            return Number(a.dataset.preco) - Number(b.dataset.preco);
        }

        return 0;
    });

    

    cards.forEach(function(card) {
        listaProdutos.appendChild(card);

        const nome = card.querySelector("h3").textContent.toLowerCase();
        const quantidade = Number(card.dataset.quantidade);

        const correspondeNome = nome.includes(pesquisa);
        const correspondeEstoque =
            filtro === "todos" || quantidade <= 5;

        if (correspondeNome && correspondeEstoque) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

    pesquisaProduto.addEventListener("input", filtrarProdutos);
    filtroEstoque.addEventListener("change", filtrarProdutos);
    ordenarProdutos.addEventListener("change", filtrarProdutos);

formulario.addEventListener("submit", function(event) {
   
    event.preventDefault();

    const nome = document.getElementById("produto").value.trim();
    const quantidade = document.getElementById("quantidade").value;
    const preco = document.getElementById("preco").value;

    if (nome === "" || quantidade === "" || preco === "") {
        alert("Preencha todos os campos.");
        return;
    }

    if (Number(quantidade) < 0) {
        alert("A quantidade não pode ser negativa.");
        return;
    }

    if (!Number.isInteger(Number(quantidade))) {
        alert("A quantidade deve ser um número inteiro.");
        return;
    }

    if (Number(preco) < 0) {
        alert("O preço não pode ser negativo.");
        return;
    }

   if (produtosEditando) {
            produtosEditando.dataset.quantidade = quantidade;
            produtosEditando.querySelector("h3").textContent = nome;
            produtosEditando.querySelector("p").textContent = 
            `Quantidade: ${Number(quantidade).toLocaleString("pt-BR")}`;
            produtosEditando.querySelector(".preco-produto").textContent = 
            `Preço: ${Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
            
            atualizarAvisoEstoque(produtosEditando, quantidade);
            
            const indice = Array.from(listaProdutos.children).indexOf(produtosEditando);
            produtos[indice] = { nome: nome, quantidade: quantidade, preco: preco };
            localStorage.setItem("produtos", JSON.stringify(produtos));

            atualizarIndicadores();
            filtrarProdutos();

            produtosEditando = null;
            formulario.reset();
            formulario.querySelector("button").textContent = "Cadastrar";

            return;
        }

    const produto = criarCardProduto(nome, quantidade, preco);
    
    produtos.push({ nome: nome, quantidade: quantidade, preco: preco });

    localStorage.setItem("produtos", JSON.stringify(produtos));

    atualizarIndicadores();
    filtrarProdutos();

    formulario.reset();

});
    botaocancelar.addEventListener("click", function() {
        popupconfirmacao.style.display = "none";
    });

    botaoConfirmarExclusao.addEventListener("click", function() {

        const indice = Array.from(listaProdutos.children).indexOf(produtoParaExcluir);
        
        produtoParaExcluir.remove();

        produtos.splice(indice, 1);

        localStorage.setItem("produtos", JSON.stringify(produtos));

        atualizarIndicadores();
        filtrarProdutos();
        
        popupconfirmacao.style.display = "none";

        produtoParaExcluir = null;
    });

