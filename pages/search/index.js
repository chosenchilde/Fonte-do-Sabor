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
    const articleId = parseInt(sessionStorage.article)

    // Se o ID do artigo não é um número, executa a página error404.
    if (isNaN(articleId)) loadpage('e404')

    // Solicita os dados armazenados dentro de API
    $.get(app.apiBaseURL + 'articles', { id: articleId, status: 'on' })

        /** 
         * Quando obtém uma resposta, os dados obtidos serão carregados na memória
         * do aplicativo e estarão disponíveis para uso. A função obtém os dados
         * e armazena em (data) que pode ser utilizada em outro momento. 
         **/
        .done((data) => {
            // Obtém o tamanho de uma array, caso o for diferente de 1, carrega a página de error 404. 
            if (data.length != 1) loadpage('e404')
            // Armazena em artData o primeiro elemento da array.
            artData = data[0]
            // Adiciona o títlo do artigo.
            $('#artTitle').html(artData.title)
            // Adiciona o conteúdo do artigo.
            $('#artContent').html(artData.content)
            // Atualiza a contagem de visualizações do artigo.
            updateViews(artData)
            // Muda o título da página de acordo com o artigo aberto.
            changeTitle(artData.title)
            // Obtém os dados a respeito do autor.
            getAuthorData(artData)
            // Pega a quantidade de artigos do autor, podendo mudar a quantidade de artigos exibidos.
            getAuthorArticles(artData, 5)
            // Obtém e mostra o formulário de envio de novos comentários.
            getUserCommentForm(artData)
            // Obtém os comentários feitos no artigo e exibe-os, tendo um limite de 999 comentários.
            getArticleComments(artData, 999)
        })

        // Caso não encontre o artigo, executa uma mensagem de erro e executa a pagina e404.
        .fail((error) => {
            popUp({ type: 'error', text: 'Artigo não encontrado!' })
            loadpage('e404')
        })

}

// Cria a função para buscar os dados do autor do artigo.
function getAuthorData(artData) {

    // Busco na API os usuários que possuem o estado de autor. 
    $.get(app.apiBaseURL + 'users/' + artData.author)

        /** 
         * Quando obtém uma resposta, os dados obtidos serão carregados na memória
         * do aplicativo e estarão disponíveis para uso. A função obtém os dados
         * e armazena em (userData) que pode ser utilizada em outro momento. 
         **/
        .done((userData) => {

            // Cria uma variável vazia chamada socialList
            var socialList = ''

            // Caso o usuário tenha uma ou mais redes sociais cadastradas.
            if (Object.keys(userData.social).length > 0) {
                // Adiciona na varíavel vazia o início da lista.
                socialList = '<ul class="social-list">'
                /** 
                * Cria um loop que concatena a lista de redes sociais cadastradas do usuário
                * As redes sociais são abertas em abas separadas com uso do 'target="_blank"'.
                **/
                for (const social in userData.social) {
                    socialList += `<li><a href="${userData.social[social]}" target="_blank">${social}</a></li>`
                }
                // Concatena o fechamento do HTMl da lista.
                socialList += '</ul>'
            }

            // Substitui o conteúdo da id artMetadata pelo HTML e exibe na página.
            $('#artMetadata').html(`<span>Por ${userData.name}</span><span>em ${myDate.sysToBr(artData.date)}.</span>`)
            /** Substitui o conteúdo da id artAuthor pelo HTML e exibe na págna,
            * Exibindo a foto, o nome, a idade, a biografia e a lista de redes sociais do usuário.
            **/
            $('#artAuthor').html(`
                <img src="${userData.photo}" alt="${userData.name}">
                <h3>${userData.name}</h3>
                <h5>${getAge(userData.birth)} anos</h5>
                <p>${userData.bio}</p>
                ${socialList}
            `)
        })

        // Caso encontre erro.
        .fail((error) => {
            // Executa uma mensagem de erro no console.
            console.error(error)
            // Carrega a página de Error 404. 
            loadpage('e404')
        })
}

// Função que obtem os artigos do autor e adiciona um limite de artigos que serão exibidos.
function getAuthorArticles(artData, limit) {

    /**
    * Monta o objeto de requisição para a API, solicitando os artigos do autor
    * Solicitando o autor, com artigos no status 'on' e solicita o ID do artigo.
    * O limite de quantos artigos serão definidos podem ser modificados quando a função for solicitada.
    **/
    $.get(app.apiBaseURL + 'articles', {
        author: artData.author,
        status: 'on',
        id_ne: artData.id,
        _limit: limit
    })
        /** 
         * Quando obtém uma resposta, os dados obtidos serão carregados na memória
         * do aplicativo e estarão disponíveis para uso. A função obtém os dados
         * e armazena em (artsData) que pode ser utilizada em outro momento. 
         **/
        .done((artsData) => {
            /* Se o autor tiver mais de um artigo, 
            exibe os artigos de acordo com o limite imposto 
            na função na barra lateral*/
            if (artsData.length > 0) {
                // Cria a váriavel output com o HTML da lista de artigos do usuário.
                var output = '<h3><i class="fa-solid fa-plus fa-fw"></i> Artigos</h3><ul>'

                // Aleatoriza a ordem de artigos exibidos na barra de mais artigos.
                var rndData = artsData.sort(() => Math.random() - 0.5)

                /**Cria um forEach para tratar cada item randômico da variável rndData 
                * E concatena na variável output.
                **/
                rndData.forEach((artItem) => {
                    output += `<li class="art-item" data-id="${artItem.id}">${artItem.title}</li>`
                });
                // Concatena o fechamento da lista de artigos na varíavel output.
                output += '</ul>'
                // Exibe o conteúdo de output na ID authorArtcicles.
                $('#authorArtcicles').html(output)
            }
        })

        // Caso encontre um erro.
        .fail((error) => {
            // Executa uma mensagem de erro no console.
            console.error(error)
            // Executa a página de Error 404. 
            loadpage('e404')
        })

}

// Obtém todos os comentários feitos em um artigo.
function getArticleComments(artData, limit) {

    // Cria uma váriavel vazia para a lista de comentários.
    var commentList = ''

    /**
    * Faz uma requisição para a API, solicitando os comentários do artigo
    * que possuem a ID do artigo, com status 'on', sorteados pela data
    * em ordem decrescente.
    * O limite de comentários pode ser definido quando a função é solicitada.
    **/
    $.get(app.apiBaseURL + 'comments', {
        article: artData.id,
        status: 'on',
        _sort: 'date',
        _order: 'desc',
        _limit: limit
    })

        /** 
         * Quando obtém uma resposta, os dados obtidos serão carregados na memória
         * do aplicativo e estarão disponíveis para uso. A função obtém os dados
         * e armazena em (cmtData) que pode ser utilizada em outro momento. 
         **/
        .done((cmtData) => {
            // Se o artigo possui comentários.
            if (cmtData.length > 0) {
                cmtData.forEach((cmt) => {
                    // Substitui quebras de linha (\n) pela tag <br> no contéudo.
                    var content = cmt.content.split("\n").join("<br>")

                    // Concatena o contéudo abaixo na varíavel vazia criada na linha 128.
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
            }
            // Caso não há comentários no artigo. 
            else {
                commentList = '<p class="center">Nenhum comentário!<br>Seja o primeiro a comentar...</p>'
            }

            // Adiciona o conteúdo da variável commentList dentro da ID '#commentList' no HTML.
            $('#commentList').html(commentList)
        })

        // Caso há um erro, exibe uma mensagem de erro no console e executa a página de Error 404. 
        .fail((error) => {
            console.error(error)
            loadpage('e404')
        })

}

// Cria uma função para obter o formulário para enviar comentários.
function getUserCommentForm(artData) {

    // Cria uma variável vazia chamda cmtForm.
    var cmtForm = ''

    // Método de autenticação do Firebase para verificar se há um usuário logado.
    firebase.auth().onAuthStateChanged((user) => {
        // Caso o usuário esteja conectado, exibe:
        if (user) {
            cmtForm = `
                <div class="cmtUser">Comentando como <em>${user.displayName}</em>:</div>
                <form method="post" id="formComment" name="formComment">
                    <textarea name="txtContent" id="txtContent">Comentário fake para testes</textarea>
                    <button type="submit">Enviar</button>
                </form>
            `
            // Adiciona o conteúdo da varíavel cmtForm dentro da ID #commentForm
            $('#commentForm').html(cmtForm)
            // Executa o evento de enviar o comentário ao apertar no botão com a ID #formComment 
            $('#formComment').submit((event) => {
                // Ao clicado, ativa a função de enviar comentários.
                sendComment(event, artData, user)
            })
        }
        // Caso o usuário não esteja logado, exibe uma solicitação de Login e exibe dentro da id.
        else {
            cmtForm = `<p class="center"><a href="login">Logue-se</a> para comentar.</p>`
            $('#commentForm').html(cmtForm)
        }
    })

}

// Cria uma função para envio de comentários.
function sendComment(event, artData, userData) {

    // Evita a ação nomral do HTML, não enviando o formulário.
    event.preventDefault()
    // Obtém e sanitiza o contéudo do formulário.
    var content = stripHtml($('#txtContent').val().trim())
    /* Escreve o conteúdo sanitizado armazenado na varíavel
    E exibe na id #txtContent */
    $('#txtContent').val(content)
    // Se o contéudo é vazio, não ocorre nada. 
    if (content == '') return false

    // Obtém a data atual do sistema.
    const today = new Date()

    // Formata a data para 'system date' no formato de (aaaa-mm-dd hh:ii:ss)
    sysdate = today.toISOString().replace('T', ' ').split('.')[0]

    /** Faz a requisição para a API para adquirir os comentários
    * pegando os campos de UID do usuário, o conteúdo do comentário 
    * e o ID do artigo comentado.
    **/
    $.get(app.apiBaseURL + 'comments', {
        uid: userData.uid,
        content: content,
        article: artData.id
    })

        /** 
         * Quando obtém uma resposta, os dados obtidos serão carregados na memória
         * do aplicativo e estarão disponíveis para uso. A função obtém os dados
         * e armazena em (data) que pode ser utilizada em outro momento. 
         **/
        .done((data) => {
            // 
            if (data.length > 0) {
                // Mostra um popUp de erro caso o comentário já tenha sido enviado.
                popUp({ type: 'error', text: 'Ooops! Este comentário já foi enviado antes...' })
                return false
            } else {

                // Monta o objeto de requisição para API solicitando os daos necessários.
                const formData = {
                    name: userData.displayName,
                    photo: userData.photoURL,
                    email: userData.email,
                    uid: userData.uid,
                    article: artData.id,
                    content: content,
                    date: sysdate,
                    status: 'on'
                }

                /**
                * Utiliza a JQuery para fazer um POST na api para enviar novos comentários.
                * Quando o comentário é enviado com sucesso, é exibido um popUp de sucesso com uma mensagem.
                **/

                $.post(app.apiBaseURL + 'comments', formData)
                    /** 
                     * Quando obtém uma resposta, os dados obtidos serão carregados na memória
                     * do aplicativo e estarão disponíveis para uso. A função obtém os dados
                     * e armazena em (data) que pode ser utilizada em outro momento. 
                     **/
                    .done((data) => {
                        // Se o ID do comentário for maior que 0.
                        if (data.id > 0) {
                            // Exibe um pop up de sucesso do envio.
                            popUp({ type: 'success', text: 'Seu comentário foi enviado com sucesso!' })
                            // Carrega a página 'view'. 
                            loadpage('view')
                        }
                    })

                    // Caso execute um erro, exibe uma mensagem de erro no console.
                    .fail((err) => {
                        console.error(err)
                    })

            }
        })

}

/**  Função para atualizar as visualizações dos artigos
* Pegando os dados do artigo 
* Executa um ajax utilizando o JQuery, utilizando uma
* Função do tipo patch, passando o ID do artigo que quer atualizar
* Solicitando a quantidade atual de visualizações no artigo somando com mais +1. 
**/

function updateViews(artData) {
    $.ajax({
        // O tipo de solicitação que vai ser feita.
        type: 'PATCH',
        // Busca na API os artigos e filtra pelo ID do artigo selecionado.
        url: app.apiBaseURL + 'articles/' + artData.id,
        // Obtém o conteúdo de views, convertendo o conteúdo da string para número inteiro e adiciona '1'.
        data: { views: parseInt(artData.views) + 1 }
    });
}