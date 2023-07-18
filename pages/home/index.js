$(document).ready(myHome)

/**
 * Função principal da página "home".
 **/
function myHome() {

    changeTitle()

    var recipeList = '';

    $.get(app.apiBaseURL + 'receita/home/12')
        .done((data) => {

            data.forEach((item) => {

                recipeList += `
        
                <div class="recipe" data-id="${item.rid}">
                    <div class="recipe-image"><img src="${item.rimg}" alt="${item.rname}"></div>
                    <div class="recipe-title">${item.rname}</div>
                    <div class="recipe-author">Publicado por <span class="authorName">${item.rauthor.uname}</span></div>
                </div>
                    
                    `
            })

            $("#recipe-container").html(recipeList);

        })
        .fail((error) => {
            $('#recipe-container').html('<p class="center">Oooops! Não encontramos nenhuma receita com este nome. Você pode comentar em alguma receita ou entrar em contato para adicionarmos a receita que deseja.</p>')
        });


}
