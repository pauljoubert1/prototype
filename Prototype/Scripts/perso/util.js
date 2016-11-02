/* datatables Language Options */
//// Mise en forme CSS des SelectPicker
//$('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });
//$('.multi-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%', selectedTextFormat: 'count>3', liveSearch: true });
;
/* date range picker icone clickable */
$('.date-picker-icon').on('click', function () {
    var data = $(this).data('input-name');
    $('input[name="' + data + '"]').focus();
})

// Activation des tooltips
$('[data-toggle="tooltip"]').tooltip({ 'container': 'body', delay: { "show": 500, "hide": 100 } });

var languageOptions = {
    "decimal": ",",
    "emptyTable": "Aucune donn&eacute;e disponible",
    "info": "Affichage de l'&eacute;l&eacute;ment _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
    "infoEmpty": "Affichage de l'&eacute;l&eacute;ment 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
    "infoFiltered": "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
    "infoPostFix": "",
    "thousands": ",",
    "lengthMenu": "Afficher _MENU_ &eacute;l&eacute;ments",
    "loadingRecords": "Chargement...",
    "processing": "Récupération des Données en cours....",
    "search": "Rechercher&nbsp;:",
    "zeroRecords": "Aucun &eacute;l&eacute;ment &agrave; afficher",
    "paginate": {
        "first": "Premier",
        "last": "Dernier",
        "next": "Suivant",
        "previous": "Pr&eacute;c&eacute;dent"
    },
    "aria": {
        "sortAscending": ": activer pour trier la colonne par ordre croissant",
        "sortDescending": ": activer pour trier la colonne par ordre d&eacute;croissant"
    }
};

// localization DateSelectPicker
var localType = {
    format: 'DD/MM/YYYY', applyLabel: "Valider", cancelLabel: "Annuler", fromLabel: "Du", toLabel: "Au",
    daysOfWeek: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
    monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    firstDay: 1
    //firstDay: moment.localeData().firstDayOfWeek()
};
var localTypeWithHeure = {
    format: 'DD/MM/YYYY HH:mm', applyLabel: "Valider", cancelLabel: "Annuler", fromLabel: "De", toLabel: "Au",
    daysOfWeek: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
    monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    firstDay: moment.localeData().firstDayOfWeek()
};

var domOptions = 'lrf<t>ip';

function GetNavigator(module) {
    var ua = navigator.userAgent,
    index,
    navigateur,
    version;
    if ((index = ua.indexOf('Firefox')) >= 0) {
        navigateur = 'Firefox';
        version = ua.match(/Firefox\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('MSIE')) >= 0) {
        navigateur = 'Internet Explorer';
        version = ua.match(/MSIE ([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('Chrome')) >= 0) {
        navigateur = 'Google Chrome';
        version = ua.match(/Chrome\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('Opera')) >= 0) {
        navigateur = 'Opera';
        version = ua.match(/Version\/([0-9]+(?:\.[0-9]+)*)/)[1] || ua.match(/Opera\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('Safari')) >= 0) {
        navigateur = 'Safari';
        version = ua.match(/Version\/([0-9]+(?:\.[0-9]+)*)/)[1] || ua.match(/Safari\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('Trident/7.0')) >= 0) { // Ajout pour IE11.... 21/06/16
        navigateur = 'Internet Explorer';
        version = ua.substring(ua.match('rv')).split(':')[1].split(')')[0];
    }
    var Nav = navigateur + ' ' + version;

    $.ajax({
        url:  '/Home/InfoCnxUser',
        data: { sModule: module, Navigateur: Nav },
        success: function (data) { },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Echec du Traçage...")
        }
    });
}

function TraceUser(module, user, trdate) {
    var ua = navigator.userAgent, index, navigateur, version;
    if ((index = ua.indexOf('Firefox')) >= 0) {
        navigateur = 'Firefox';
        version = ua.match(/Firefox\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('MSIE')) >= 0) {
        navigateur = 'Internet Explorer';
        version = ua.match(/MSIE ([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('Chrome')) >= 0) {
        navigateur = 'Google Chrome';
        version = ua.match(/Chrome\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('Opera')) >= 0) {
        navigateur = 'Opera';
        version = ua.match(/Version\/([0-9]+(?:\.[0-9]+)*)/)[1] || ua.match(/Opera\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('Safari')) >= 0) {
        navigateur = 'Safari';
        version = ua.match(/Version\/([0-9]+(?:\.[0-9]+)*)/)[1] || ua.match(/Safari\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if ((index = ua.indexOf('Trident/7.0')) >= 0) { // Ajout pour IE11.... 21/06/16
        navigateur = 'Internet Explorer';
        version = ua.substring(ua.match('rv')).split(':')[1].split(')')[0];
    }
    var Nav = navigateur + ' ' + version;
    $.getJSON('http://localhost:3000/TraceUser', { date: trdate, user: user, module: module, navig: Nav }).done(function (retour) { });
}

function addClass(element, addName) {
    var classNames = element.className.split(' ');
    if (classNames.indexOf(addName) !== -1) {
        return;
    }

    element.className += ' ' + addName;
}
function removeClass(element, removeName) {
    var newClasses = [];
    var classNames = element.className.split(' ');
    for (var i = 0; i < classNames.length; ++i) {
        if (classNames[i] !== removeName) {
            newClasses.push(classNames[i]);
        }
    }

    element.className = newClasses.join(' ');
}

function GetUniqOfTable(table, field) {
    var dfd = $.Deferred();
    dfd.resolve(_.uniq(_.map(table, field)));
    return dfd.promise();
};
function GetSortTable(table) {
    var dfd = $.Deferred();
    dfd.resolve(
        table = table.sort(function (a, b) {
            if (a > b) return 1;
            if (a < b) return -1;
            // a doit être égale à b
            return 0;
        })
    );
    return dfd.promise();
};
function GetSortUniqTable(table) {
    var dfd = $.Deferred();
    dfd.resolve(_.sortedUniq(table));
    return dfd.promise();
};
function GetFilterTable(table, field, value) {
    var dfd = $.Deferred();
    dfd.resolve(_.filter(table, [field, value]));
    return dfd.promise();
};
function GetFindIndexTable(table, field, value) {
    var dfd = $.Deferred();
    dfd.resolve(_.findIndex(table, [field, value]));
    return dfd.promise();
};
function compare(propName) {
    return function (a, b) {
        if (a[propName] < b[propName])
            return -1;
        if (a[propName] > b[propName])
            return 1;
        return 0;
    };
}

function Init() {
    return $.getJSON("/Home/GetStfPreference")
            .done(function (json) { })
            .fail(function (jqxhr, textStatus, error) { var err = textStatus + "," + error;  });
}

function InitAsp() {
    return $.getJSON("http://localhost:3000/GetAspUserByCpt", { User: $('#_userwin').val() }).done(function (json) { })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + "," + error; alert("Erreur Récup Data User : " + err);  });
}

function util_GetSeriesByStf(idstf) {
    return $.getJSON("http://localhost:3000/getSeries", { ID: 0, IdStf: idstf })
    .done(function (json) { })
    .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Recup Séries : " + err); });
}
function util_GetSousSeriesByStf(idstf,idserie) {
    return $.getJSON("http://localhost:3000/getSousSeries", { IdStf: idstf, IdSerie: idserie })
    .done(function (json) { })
    .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Recup SousSéries : " + err); });
}
function util_GetRames(id, idstf, idserie, idsousserie, rame, numef) {
    return $.getJSON("http://localhost:3000/getRames", { id: id, stfid: idstf, serieid: idserie, sousserieid: idsousserie, num_rame: rame.trim(), num_ef: numef.trim() })
    .done(function (json) { })
    .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Recup Rames : " + err); });
}

