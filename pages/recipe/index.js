/**
 * Quando o documento estiver pronto, executa a função para rodá-lo.
 */
$(document).ready(myRecipe)

/**
 * Executa a função que inclui as chamadas de todas as funções de inicialização e monitoramento.
 */
function myRecipe() {

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
            if (!data.rid) loadpage('e404')
            $('#rcpImage').html('<img class="recipe-image" src=' + data.rimg + "></img>")
            $('#rcpTitle').html(data.rname)
            $('#rcpIngredients').html(data.ringredients)
            $('#rcpContent').html(data.rcontent)
            changeTitle(data.rname)
            updateViews(data)
            getAuthor(data)
            getAuthorRecipes(data, 5)
            getUserCommentForm(data)
            getRecipeComments(data)
        })

        // Caso não encontre o artigo, executa uma mensagem de erro e executa a pagina e404.
        .fail((error) => {
            popUp({ type: 'error', text: 'Receita não encontrada!' })
            loadpage('e404')
        })

}

function getAuthor(data) {
    $.get(app.apiBaseURL + 'usuario/' + data.rauthor.uid)
        .done((userData) => {
            $('#rcpMetaData').html(`Por ${userData.uname}. Publicado ${myDate.sysToBr(data.rdate)}.`)
            $('#rcpAuthor').html(`
                <h2>${userData.uname}</h2>
                <center><div class="authorPhoto"><img src="${userData.uphoto}" alt="${userData.uname}"></div>
                <div class="authorAge">${getAge(userData.ubirth)} anos</div></center>
                <div class="authorBio"><p>${userData.ubio}</p></div>
            `)
        })
}


function getAuthorRecipes(data, limit) {
    $.get(app.apiBaseURL + `receita/author?uid=${data.rauthor.uid}&rcp=${data.rid}&lim=${limit}`)
        .done((rcpData) => {
            if (rcpData.length > 0) {
                var output = '<h2><i class="fa-solid fa-plus fa-fw"></i> Receitas</h2><ul>'
                rcpData.forEach((rcpItem) => {
                    output += `<li class="recipe" data-id="${rcpItem.rid}">${rcpItem.rname}</li>`
                });
                output += '</ul>'
                $('#authorRecipes').html(output)
            }
        })
} 


function updateViews(data) {
    $.ajax({
        type: 'PATCH',
        url: app.apiBaseURL + 'receita/' + data.rid
    });
}

function getRecipeComments(data) {
    $.get(app.apiBaseURL + `comentario/${data.rid}`)
        .done((cmtData) => {
            var commentList = ''
            if (cmtData.length > 0) {
                cmtData.forEach((cmt) => {
                    var content = cmt.comment.split("\n").join("<br>")
                    commentList += `
                        <div class="cmtBox">
                            <div class="cmtMetadata">
                                <img src="${cmt.authorphoto}" alt="${cmt.authorname}" referrerpolicy="no-referrer">
                                <div class="cmtMetatexts">
                                    <span>Por ${cmt.authorname}</span><span>em ${myDate.sysToBr(cmt.date)}.</span>
                                </div>
                            </div>
                            <div class="cmtContent">${content}</div>
                        </div>
                    `
                })
            } else {
                commentList = '<div class="noComment">Nenhum comentário publicado nesta receita.<br>Faça login com sua conta do Google para ser o primeiro a comentar.</div>'
            }
            $('#commentList').html(commentList)
        })
}

function getUserCommentForm(data) {
    var cmtForm = ''
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            cmtForm = `
                <div class="cmtUser">Comentando como: ${user.displayName}</div>
                <div class="txtContainer"><form method="post" id="formComment" name="formComment">
                    <textarea class="txtContent" name="txtContent" id="txtContent" required minlength="10" placeholder="Digite aqui o seu comentário com no mínimo de 10 caracteres."></textarea><br>
                    <button class="txtButton" type="submit">Enviar</button>
                </form>
                </div>
            `
            $('#commentForm').html(cmtForm)
            $('#formComment').submit((event) => {
                sendComment(event, data, user)
            })
        } else {
            cmtForm = `<p class="center"><a href="login">Logue-se</a> para comentar.</p>`
            $('#commentForm').html(cmtForm)
        }
    })

}

function sendComment(event, recipe, userData) {
    event.preventDefault()
    var content = stripHTML($('#txtContent').val().trim())
    $('#txtContent').val(content)
    if (content == '') return false
    const today = new Date()
    sysdate = today.toISOString().replace('T', ' ').split('.')[0]
    request = app.apiBaseURL + `comentario/find?uid=${userData.uid}&art=${recipe.rid}&txt=${content}`;

    $.get(request)
        .done((data) => {
            if (data.length > 0) {
                popUp({ type: 'error', text: 'Ooops! Este comentário já foi enviado antes...' })
                return false
            } else {
                const formData = {
                    authorname: userData.displayName,
                    authorphoto: userData.photoURL,
                    authoremail: userData.email,
                    uid: userData.uid,
                    recipe: recipe.rid,
                    comment: content,
                    date: sysdate,
                    status: 'on'
                }
                $.ajax({
                    type: "POST",
                    url: app.apiBaseURL + 'comentario',
                    data: JSON.stringify(formData),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.id > 0) {
                            popUp({ type: 'success', text: 'Seu comentário foi enviado com sucesso!' })
                            loadpage('recipe')
                        }
                    },
                    error: function (err) {
                        console.log(err);
                        popUp({ type: 'error', text: 'Ocorreram falhas ao enviar. Tente mais tarde.' })
                        loadpage('recipe')
                    }
                });
            }
        })
}