// Javascript using JQuery and 
// A recipe-search site.
// By Chosen Child.
const app = {
    siteName: 'Fonte do Sabor',
    siteSlogan: 'Experimente as melhores receitas na palma de sua mão.',
    siteLicense: '<a href="#" title="Lucas Belchior">&copy; 2023 Lucas Belchior, João Cantel, Thainá Almeida</a>',
    siteCopy: 'Fonte do Sabor &copy; 2023',
    apiBaseURL: 'http://localhost:8080/'
}

// Altera os dados das informações modificáveis do site.
$('#siteInfos').html(app.siteName + '<br>' + '<small>' + app.siteSlogan + '</small>')
$('#siteCopy').html(app.siteCopy)
$('#siteLicense').html('Desenvolvido por ' + app.siteLicense)

/**
 * jQuery → Quando o documento estiver pronto, executa a função principal,
 * 'runApp()'.
 * 
 * Referências:
 *  • https://www.w3schools.com/jquery/jquery_syntax.asp
 **/
$(document).ready(myApp)

/**
 * Este é o aplicativo principal, executado logo após a carga dos documentos
 * estátivos (HTML e CSS) no navegador.
 * Aqui incluimos  as chamadas de todas as funções de inicialização e o 
 * monitoramento dos eventos do aplicativo.
 *
 * NOTA! 
 * Um aplicativo é uma função, um bloco de código que fica armazenado na 
 * memória do dispositivo e será executado quando for "chamado" (invocado)
 * pelo nome.
 * 
 * Referências:
 *  • https://www.w3schools.com/js/js_functions.asp
 **/
function myApp() {

    onstorage = popUpOpen

    // Aceite de cookies.
    if (cookie.get('acceptCookies') == 'on')
        $('#aboutCookies').hide()
    else $('#aboutCookies').show()

    // Monitor de usuário logado.
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            $('#navUser').html(`Perfil`)
            $('#navUser').attr('href', 'profile')
        } else {
            $('#navUser').html(`Login`)
            $('#navUser').attr('href', 'login')
        }
    });

    /**
     * IMPORTANTE!
     * Para que o roteamento funcione corretamente no "live server", é 
     * necessário que erros 404 abram a página "404.html".
     **/

    // Verifica se o 'localStorage' contém uma rota.
    if (sessionStorage.path == undefined) {

        // Se não contém, aponta a rota 'home'.
        sessionStorage.path = 'home'
    }

    // Armazena a rota obtida em 'path'.        
    path = sessionStorage.path

    // Apaga o 'localStorage', liberando o recurso.
    delete sessionStorage.path

    // Carrega a página solicitada pela rota.
    loadpage(path)

    /**
     * jQuery → Monitora cliques em elementos '<a>' que, se ocorre, chama a função 
     * routerLink().
     **/
    $(document).on('click', 'a', routerLink)

    /**
     * Quando clicar em um artigo.
     **/
    $(document).on('click', '.recipe', loadRecipe)

    /**
     * Aviso de cookies → Políticas de privacidade.
     **/
    $('#policies').click(() => {
        loadpage('policies')
    })

    /**
     * Aviso de cookies → Aceito.
     **/
    $('#accept').click(() => {
        cookie.set('acceptCookies', 'on', 365)
        $('#aboutCookies').hide()
    })

}

// Login do Firebase Authenticator.
function fbLogin() {
    firebase.auth().signInWithPopup(provider)
        .then((user) => {
            popUp({ type: 'success', text: `Olá ${user.user.displayName}!` })
            loadpage(location.pathname.split('/')[1])
        })
        .catch((error) => {
            try {
                popUp({ type: 'error', text: 'Ooops! Popups estão bloqueados!<br>Por favor, libere-os!' })
            } catch (e) {
                alert('Ooops! Popups estão bloqueados!\nPor favor, libere-os!')
            }
        })
}

// Processa rotas.
function routerLink() {

    // Obtém e sanitiza a rota do elemento clicado.
    var href = $(this).attr('href').trim().toLowerCase()

    // Âncora para o topo da página.
    if (href == '#top') {
        window.scrollTo(0, 0)
        return false
    }

    // Links externos.
    if (
        href.substring(0, 7) == 'http://' ||
        href.substring(0, 8) == 'https://' ||
        href.substring(0, 4) == 'tel:' ||
        href.substring(0, 7) == 'mailto:'
    )
        return true

    // Links de login.

    if (href == 'login') {
        fbLogin()
        return false

    }

    // Carrega a rota na SPA.
    loadpage(href)
    return false
}

/**
 * Carrega uma página no SPA.
 * O caminho da página é passado como string parâmetro da função e corresponde
 * a uma das subpastas de "/pages".
 * 
 * Para criar uma nova página no aplicativo:
 *  1. Acesse a pasta "/pages";
 *  2. Crie uma subpasta com o nome canônico (rota) desta nova página;
 *     O nome da pasta deve ser curto e usar somente letras e números, nunca
 *     iniciando com um número e, preferencialmente usando somente letras 
 *     minúsculas. Por exemplo: /pages/mypage
 *  3. Crie os 3 componentes da página na subpasta e seu conteúdo:
 *     • index.html → (Model) documento HTML com o "corpo" da página a ser 
 *                    carregada no SPA;
 *     • index.css → (View) documento CSS que estiliza a página.
 *     • index.js → (Control) JavaScript de controle da página.
 *  4. Crie os links para a nova página, apontando-os para a rota desta, por 
 *     exemplo: <a href="mypage">Minha página</a>
 *  5. Já para carregar esta página no SPA pelo JavaScript, comandamos 
 *     "loadpage('mypage')", por exemplo.
 **/
function loadpage(page, updateURL = true) {

    /*
     * Monta os caminhos (path) para os componentes da página solicitada, 
     * à partir do valor da variável "page".
     * Lembre-se que cada página é formada por 3 componentes:
     *  • index.html → (Model) documento HTML com o "corpo" da página a ser
     *                    carregada no SPA;
     *  • index.css → (View) documento CSS que estiliza a página.
     *  • index.js → (Control) JavaScript de controle da página.
     * 
     * IMPORTANTE!
     * Mesmo que não seja necessário um CSS ou JavaScript para a página, os 
     * arquivos "index.css" e "index.js" devem existir na pasta desta página
     * para evitar "erro 404". Neste caso, insira alguns comentários nos 
     * documentos.
     * 
     * Referências:
     *  • https://www.w3schools.com/js/js_objects.asp   
     *  • https://www.w3schools.com/js/js_string_templates.asp
     */
    const path = {
        html: `pages/${page}/index.html`,
        css: `pages/${page}/index.css`,
        js: `pages/${page}/index.js`
    }

    /**
     * jQuery → Faz a requisição (request) do componente HTML da página, a ser 
     * inserido no SPA.
     * 
     * OBS: carregamos o HTML na memória primeiro, para ter certeza que ele 
     * existe e não vai dar erro 404.
     * 
     * Referências:
     *  • https://www.w3schools.com/jquery/ajax_get.asp
     **/
    $.get(path.html)

        /**
         * Quando ocorrer um "response", os dados obtidos serão carregados na 
         * memória do aplicativo e estarão disponíveis para uso deste.
         * Neste caso, criamos uma função "sem nome" ()=>{} que obtém os dados
         * e armazena em "data" para uso posterior.
         * 
         * Referências:
         *  • https://www.w3schools.com/js/js_arrow_function.asp
         **/
        .done((data) => {

            // Se o documento carregado NÃO é uma página de conteúdo...
            if (data.trim().substring(0, 9) != '<article>')

                // Carrega a página de erro 404 sem atualizar a rota.
                loadpage('e404', false)

            // Se o documento é uma página de conteúdo...
            else {

                // jQuery - Instala o CSS da página na 'index.html'.
                $('#pageCSS').attr('href', path.css)

                // jQuery - Carrega o HTML no elemento <main></main>.
                $('main').html(data)

                // jQuery - Carrega e executa o JavaScript.
                $.getScript(path.js)
            }

        })

        // Se ocorreu falha em carregar o documento...
        .catch(() => {

            // Carrega a página de erro 404 sem atualizar a rota.
            loadpage('e404', false)
        })

    /**
    * Rola a tela para o início, útil para links no final da página.
    * Referências:
    *  • https://www.w3schools.com/jsref/met_win_scrollto.asp
    **/
    window.scrollTo(0, 0);

    /**
     * Atualiza URL da página com o endereço da rota:
     * Referências:
     *  • https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
     **/
    if (updateURL) window.history.pushState({}, '', page);

}

/**
 * Muda o título da página → <title></title>
 * 
 * Instruções:
 * Em cada arquivo "index.js" de cada página, inclua uma chamada para esta 
 * função, passando como parâmetro o título que deve aparecer.
 * 
 * Quando o parâmetro estiver vazio (DEFAULT) o título será:
 *  • app.sitename - app.siteslogan
 * Quando o parâmetro for informado, o título será:
 *  • app.sitename - parâmetro
 * 
 **/
function changeTitle(title = '') {
    let pageTitle = app.siteName + ' - '
    if (title == '') pageTitle += app.siteSlogan
    else pageTitle += title
    $('title').html(pageTitle)
}

/**
 * Carrega o artigo completo.
 **/
function loadRecipe() {
    sessionStorage.recipe = $(this).attr('data-id')
    loadpage('recipe')
}

// Sanitiza um texto, removendo todas as tags HTML.
function stripHTML(html) {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function popUp(params) {
    const x = window.open('', 'popupWindow', 'width=1,height=1,left=10000');
    x.localStorage.setItem('popUp', JSON.stringify(params));
    x.close()
}

function popUpOpen() {

    if (localStorage.popUp) {

        const pData = JSON.parse(localStorage.popUp)
        var pStyle = ''

        switch (pData.type) {
            case 'error': pStyle = 'background-color: #f00; color: #fff'; break
            case 'alert': pStyle = 'background-color: #ff0; color: #000'; break
            case 'success': pStyle = 'background-color: #0f0; color: #000'; break
            default: pStyle = 'background-color: #fff; color: #000'
        }

        $('body').prepend(`
        <div id="popup">
            <div class="popup-body" style="${pStyle}">
                <div class="popup-text">${pData.text}</div>
                <div class="popup-close"><i class="fa-solid fa-xmark fa-fw"></i></div>
            </div>
        </div>
        `)

        $('.popup-close').click(popUpClose)
        setTimeout(popUpClose, parseInt(pData.time) || 3000)

    }
}

function popUpClose() {
    delete localStorage.popUp
    $('#popup').remove()
}

// Tratamento de datas.
const myDate = {
    // System Date para pt-BR Date.
    sysToBr: (systemDate, time = true) => {
        var parts = systemDate.split(' ')[0].split('-')
        var out = `${parts[2]}/${parts[1]}/${parts[0]}`
        if (time) out += ` às ${systemDate.split(' ')[1]}`
        return out
    },
    // JavaScript para pt-BR date.
    jsToBr: (jsDate, time = true) => {
        var theDate = new Date(jsDate)
        var out = theDate.toLocaleDateString('pt-BR')
        if (time) out += ` às ${theDate.toLocaleTimeString('pt-BR')}`
        return out
    },
    // Today JavaScript para syste date.
    todayToSys: () => {
        const today = new Date()
        return today.toISOString().replace('T', ' ').split('.')[0]
    }

}


String.prototype.truncate = String.prototype.truncate ||
    function (n, useWordBoundary) {
        if (this.length <= n) { return this; }
        const subString = this.slice(0, n - 1);
        return (useWordBoundary
            ? subString.slice(0, subString.lastIndexOf(" "))
            : subString) + "&hellip;";
    };

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

const cookie = {
    set: (cname, cvalue, exdays) => {
        const d = new Date()
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
        let expires = 'expires=' + d.toUTCString()
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
    },

    get: (cname) => {
        let name = cname + '='
        let decodedCookie = decodeURIComponent(document.cookie)
        let ca = decodedCookie.split(';')
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) == ' ') c = c.substring(1)
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
        }
        return ''
    }
}

// Função para buscar as receitas na API e extrair seus dados.
$('#searchBox').submit(searchRecipe)

function searchRecipe(event) {
    // event.preventDefault()
    var searchValue = $('#searchField').val().trim();
    if (searchValue == '') {
        return false
    }
    else {
        sessionStorage.searchValue = searchValue
        loadpage('search')
        return false
    }
}

// Calcula a idade com base na data.
function getAge(sysDate) {
    // Obtendo partes da data atual.
    const today = new Date()
    const tYear = today.getFullYear()
    const tMonth = today.getMonth() + 1
    const tDay = today.getDate()

    // Obtendo partes da data original.
    const parts = sysDate.split('-')
    const pYear = parts[0]
    const pMonth = parts[1]
    const pDay = parts[2]

    // Calcula a idade pelo ano.
    var age = tYear - pYear

    // Verificar o mês e o dia.
    if (pMonth > tMonth || pMonth == tMonth && pDay > tDay) age--

    // Retorna a idade.
    return age
}