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
                <div class="authorPhoto"><img src="${userData.uphoto}" alt="${userData.uname}"></div>
                <h5>${getAge(userData.ubirth)} anos</h5>
                <p>${userData.ubio}</p>
            `)
        })
}


function updateViews(data) {
    $.ajax({
        type: 'PATCH',
        url: app.apiBaseURL + 'receita/' + data.rid
    });
}

function getArticleComments(data) {
    $.get(app.apiBaseURL + `comentario/${data.id}`)
        .done((cmtData) => {
            var commentList = ''
            if (cmtData.length > 0) {
                cmtData.forEach((cmt) => {
                    var content = cmt.comment.split("\n").join("<br>")
                    commentList += `
                        <div class="cmtBox">
                            <div class="cmtMetadata">
                                <img src="${cmt.photo}" alt="${cmt.name}" referrerpolicy="no-referrer">
                                <div class="cmtMetatexts">
                                    <span>Por ${cmt.name}</span><span>em ${myDate.sysToBr(cmt.date)}.</span>
                                </div>
                            </div>
                            <div class="cmtContent">${content}</div>
                        </div>
                    `
                })
            } else {
                commentList = '<p class="center">Nenhum comentário!<br>Seja o primeiro a comentar...</p>'
            }
            $('#commentList').html(commentList)
        })
}

function getUserCommentForm(artData) {
    var cmtForm = ''
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            cmtForm = `
                <div class="cmtUser">Comentando como <em>${user.displayName}</em>:</div>
                <form method="post" id="formComment" name="formComment">
                    <textarea name="txtContent" id="txtContent"></textarea>
                    <button type="submit">Enviar</button>
                </form>
            `
            $('#commentForm').html(cmtForm)
            $('#formComment').submit((event) => {
                sendComment(event, artData, user)
            })
        } else {
            cmtForm = `<p class="center"><a href="login">Logue-se</a> para comentar.</p>`
            $('#commentForm').html(cmtForm)
        }
    })

}

function sendComment(event, artData, userData) {
    event.preventDefault()
    var content = stripHTML($('#txtContent').val().trim())
    $('#txtContent').val(content)
    if (content == '') return false
    const today = new Date()
    sysdate = today.toISOString().replace('T', ' ').split('.')[0]
    request = app.apiBaseURL + `comments/find?uid=${userData.uid}&art=${artData.id}&txt=${content}`;

    $.get(request)
        .done((data) => {
            if (data.length > 0) {
                popUp({ type: 'error', text: 'Ooops! Este comentário já foi enviado antes...' })
                return false
            } else {
                const formData = {
                    name: userData.displayName,
                    photo: userData.photoURL,
                    email: userData.email,
                    uid: userData.uid,
                    receita: data.rid,
                    comentario: content,
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
                            loadpage('view')
                        }
                    },
                    error: function (err) {
                        console.log(err);
                        popUp({ type: 'error', text: 'Ocorreram falhas ao enviar. Tente mais tarde.' })
                        loadpage('view')
                    }
                });
            }
        })
}