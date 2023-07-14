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

    $.get(app.apiBaseURL + 'receita/search/?q=' + searchRst)
        .done((data) => {
            console.log
            data.forEach((item) => {
                

                searchResult += `
                <div class="recipe" data-id="${item.id}">
                    <div class="recipe-image"><img src="${item.img}" alt="${item.name}"></div>
                    <div class="recipe-title">${item.name}</div>
                    <div class="recipe-author">Publicado por ${item.author}</div>
                </div>
                    
                    `
            })

            $("#recipe-container").html(recipeList);

        })
        .fail((error) => {
            $('#recipe-container').html('<p class="center">Oooops! Não encontramos nenhuma receita com este nome. Você pode comentar em alguma receita ou entrar em contato para adicionarmos a receita que deseja.</p>')
        });


}
