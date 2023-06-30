/**
 * Quando o documento estiver pronto, executa a função para rodá-lo.
 */
$(document).ready(myView)

/**
 * Executa a função que inclui as chamadas de todas as funções de inicialização e monitoramento.
 */
function myView() {

    /* Cria uma constante para o ID do artigo que armazena um valor 
    inteiro que é obtido do armazanamento de sessão */
    const recipeId = parseInt(sessionStorage.recipe)

    // Se o ID do artigo não é um número, executa a página error404.
    if (isNaN(recipeId)) loadpage('e404')


    // Solicita os dados armazenados dentro de API
    $.get(app.apiBaseURL + 'receita/' + recipeId)

        /** 
         * Quando obtém uma resposta, os dados obtidos serão carregados na memória
         * do aplicativo e estarão disponíveis para uso. A função obtém os dados
         * e armazena em (data) que pode ser utilizada em outro momento. 
         **/
        .done((data) => {
            console.log(data.name)
            // Adiciona o títlo da receita.
            $('#rcpTitle').html(data.name)
            // Adiciona a imagem da receita.
            $('#rcpImage').html('<img class="recipe-image" src=' + data.img + "></img>")
            // Adiciona os ingredientes da receita.
            $('#rcpIngredients').html(data.ingredients)
            // Adiciona o conteúdo da receita.
            $('#rcpContent').html(data.content)
            // Muda o título da página de acordo com o artigo aberto.
            changeTitle(data.name)
        })

        // Caso não encontre o artigo, executa uma mensagem de erro e executa a pagina e404.
        .fail((error) => {
            popUp({ type: 'error', text: 'Receita não encontrada!' })
            loadpage('e404')
        })

}
