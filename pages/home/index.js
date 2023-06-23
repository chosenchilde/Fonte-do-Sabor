$(document).ready(myHome)

/**
 * IMPORTANTE!
 * URL para obter todos os artigos ordenados pela data e com status ativo:
 * http://localhost:3000/articles?_sort=date&_order=desc&status=on
 * \---------+---------/
 *           |
 *           +--> URL da API → variável 'app.apiBaseURL' em '/index.js'
 **/

/**
 * Função principal da página "home".
 **/
function myHome() {

    changeTitle()

    var articleList = '';

    $.get(app.apiBaseURL + 'receita')
        .done((data) => {
            console.log(data)

            data.forEach((item) => {



                articleList += `
        
                <div class="recipe">
                    <div class="recipe-image"><img src="${item.img}" alt="${item.name}"></div>
                    <div class="recipe-title">${item.name}</div>
                    <div class="recipe-author">Publicado por ${item.author}</div>
                </div>
                    
                    `
            })

            $("#recipe-container").html(articleList);

        });




}
