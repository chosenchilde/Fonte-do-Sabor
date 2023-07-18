$(document).ready(mySearch)

/**
 * Função principal da página "search".
 **/
function mySearch() {

    /* Cria uma constante para o ID do artigo que armazena um valor 
    inteiro que é obtido do armazanamento de sessão */
    const searchRst = sessionStorage.searchValue
    console.log(searchRst)

    var searchResult = '';

    $.get(app.apiBaseURL + 'receita/search?q=' + searchRst)
        .done((data) => {

            data.forEach((item) => {
                

                searchResult += `
                <div class="recipe" data-id="${item.rid}">
                    <div class="recipe-image"><img src="${item.rimg}" alt="${item.rname}"></div>
                    <div class="recipe-title">${item.rname}</div>
                    <div class="recipe-author">Publicado por <span class="authorName">${item.rauthor.uname}</span></div>
                </div>
                    
                    `
            })

            $("#recipe-container").html(searchResult);

        })
        .fail((error) => {
            $('#recipe-container').html('<p class="center">Oooops! Não encontramos nenhuma receita com este nome. Você pode comentar em alguma receita ou entrar em contato para adicionarmos a receita que deseja.</p>')
        });


}
