var languages = [{
    "en-us": {
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        msgEmptyContent: "No information to display."
    },
    "pt-br": {
        monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        dayNames: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
        msgEmptyContent: "Sem informações a serem exibidas.",
    },
    "es-es": {
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        msgEmptyContent: "No hay información para mostrar."
    }
}];

jQuery.fn.albeTimeline = function (json, options) {

    $(this).empty();
    var _this = this;

    //Mescla opções do usuário com o padrão
    var settings = $.extend({
        effect: "fadeInUp",
        showMenu: true,
        language: "en-us",
        sortDesc: true,
        format: "dd MMMM"
    }, options);

    var idioma = languages[0][settings.language];

    //Se for passado 'string', convert para 'object'.
    if (typeof (json) == 'string') {
        json = jQuery.parseJSON(json);
    }

    //Exibe mensagem padão
    if ($.isEmptyObject(json)) {
        console.warn(idioma.msgEmptyContent);
    }
    else {
        //Ordena pela data
        json = $(json).sort(function (a, b) {
            return (settings.sortDesc) ? (b['time'] > a['time']) : (a['time'] > b['time']);
        });

        var eMenu = $("<ul>").attr("id", "timeline-menu");
        var eTimeline = $("<section>").attr("id", "timeline");

        $.each(json, function (index, element) {

            var ano = new Date(element.time).getFullYear();
            var separador = $(eTimeline).find("div.group" + ano);

            //Se o separador não existe, cria.
            if (separador.length === 0) {
                separador = $("<div>").attr("id", ("year" + ano)).addClass("group" + ano).text(ano);
                $(eTimeline).append(separador);

                var anchor = $('<a>').attr("href", ("#year" + ano)).text(ano);
                eMenu.append($("<li>").append(anchor));
            }

            /****************************************SLOT****************************************/
            var badge = $('<div>').addClass("badge");
            badge.text(fnDateFormat(element.time, settings.format, idioma));

            var ePanel = $("<div>").addClass("panel").append(badge);

            if (element.header) {
                var ePanelHead = $("<div>").addClass("panel-heading");
                var ePaneltitle = $("<h4>").addClass("panel-title").text(element.header);

                ePanelHead.append(ePaneltitle);
                ePanel.append(ePanelHead);
            }

            var ePanelBody = $("<div>").addClass("panel-body")
            $.each(element.body, function (index2, value2) {

                //Elemento HTML
                var e = $('<' + value2.tag + '>');

                //Atributos do elemento
                $(value2.attr).each(function () {
                    $.each(this, function (index3, value3) {
                        //Atributo especial, defido o 'class' ser palavra reservada no javascript.
                        (index3.toLowerCase() === 'cssclass') ? e.addClass(value3) : e.attr(index3, value3);
                    });
                });

                //Conteúdo do elemento
                if (value2.content)
                    e.html(value2.content); //se cambia para que pueda contener contenido html

                ePanelBody.append(e);
            });

            ePanel.append(ePanelBody);

            if (element.footer) {
                var ePanelFooter = $("<div>").addClass("panel-footer").text(element.footer);
                ePanel.append(ePanelFooter);
            }

            var slot = $("<article>").append(ePanel);
            //Adiciona o item logo após ao respectivo separador.
            slot.insertAfter(separador);

            /****************************************FIM - SLOT****************************************/
        });

        //Marcador inicial da Timeline
        var badge = $('<div>').addClass("badge").html("&nbsp;");
        var ePanel = $("<div>").addClass("panel").append(badge);
        eTimeline.append($("<article>").append(ePanel));
        eTimeline.append($("<div>").addClass("clearfix").css({ "float": "none" }));

        $.each(eTimeline.find("article"), function (index, value) {
            //Adiciona classe de animação.
            $(this).addClass("animated " + settings.effect);
            //Adiciona classe css responsável por inverter o lado do item.
            $(this).addClass((index % 2 == 0) ? "" : "inverted");
        });

        //Exibe o menu
        if (settings.showMenu) {
            eMenu.appendTo(_this);
        }

        eTimeline.appendTo(_this);
    }

    //return this;
};

//format
//1.:"dd MMMM"
//2.:"dd/MM/aaaaa"
//3.:"dd de MMMM de aaaaa"
//4.:"DD, dd de MMMM de aaaaa"
//default.: "YYYY-MM-DD" (ISO 8601)
//LeganRocksvern modifica
//formato nuevo
//"dd MMMM"
//"dd/MM/aaaaa"
//"dd de MMMM de aaaaa"
//"DD, dd de MMMM de aaaaa"
//"dd-mm-yyyy"
//default.: "YYYY-MM-DD" (ISO 8601)
function fnDateFormat(value, format, language) {

    var parts = value.split('-');
    var newDate = new Date(parts[0], (parts[1] - 1), parts[2]);

    var d = ((newDate.getDate() < 10 ? "0" : "") + newDate.getDate());
    var m = ((newDate.getMonth() < 10 ? "0" : "") + newDate.getMonth());

    switch (format) {
        case 'dd MMMM':
            return d + " " + language.monthNames[newDate.getMonth()].substring(0, 3);
        case 'dd/MM/yyyy':
            return d + "/" + m + "/" + newDate.getFullYear();
        case 'ddMMMMyyyy':
            return d + " de " + language.monthNames[newDate.getMonth()] + " de " + newDate.getFullYear();
        case 'DD, ddMMMMyyyy':
            return language.dayNames[newDate.getDay()] + ", " + d + " de " + language.monthNames[newDate.getMonth()] + " de " + newDate.getFullYear();
        case 'dd-mm-yyyy':
            return d + "-" + m + "-" + newDate.getFullYear();
        default:
            return newDate.getFullYear() + "-" + m + "-" + d;
    }
};
