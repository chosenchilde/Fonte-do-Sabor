$(document).ready(mySearch)

/**
 * Função principal da página "search".
 **/
function mySearch() {

    changeTitle()

    var recipeList = '';

    $.get(app.apiBaseURL + 'receita/home/9')
        .done((data) => {

            data.forEach((item) => {

                recipeList += `
        
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
