$(function () {
    window.g_iStfPref   = 0;;
    window.g_stfS       = [];
    window.g_username   = "";

    $('#ChoiceStf').on('click', function (e) { $('#stfModal').modal({ keyboard: true, show: true }); });
    $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });
    $('#stfPrf-layout-empty').on('click', function (e) { $('#stfLayout').selectpicker('deselectAll'); window.g_iStfPref = 0; });
    $('#_LoadRecRest').css('display', 'none');
    $('#_LoadStfPref').css('display', 'none');
    $('#indexProcessing').css('display', 'block');

    if (document.title == "WebMAT | Accueil") {
        $.when(InitAsp()).then(function (_init) {
            window.g_iStfPref   = parseInt(_init.STFpref);
            window.g_stfS       = _init.AllStfs;
            window.g_username   = _init.UserInfo.username;
            getRecidives();
            TraceUser("V3. RexGriffe", window.g_username, moment().format('YYYY-MM-DD HH:mm:ss'));
        })
    }
    

    function getRecidives() {
        // Lance animation
        $('#_LoadRecRest').css('display', 'block');
        $('#_LoadRecRest').addClass("fa-spin");
        $.getJSON("http://localhost:3000/getFctRevidive", { IdStf: window.g_iStfPref })
        .done(function (_fonctions) {
            $.ajax({
                type: "POST", contentType: "application/json; charset=utf-8", url: "/Home/getRecidivesRest", dataType: 'json',
                data: JSON.stringify({ STfId: window.g_iStfPref, value: _fonctions.data }),
                success: function (_rests) {
                    tabRecRest = _rests.retour;
                    $('#titleRecid').text(tabRecRest.length + ' Récidives Restrictions');
                    recrestTable = $('#recrestTable')
                        .on('error.dt', function (e, settings, techNote, message) { })
                        .on('xhr.dt', function (e, settings, json, xhr) { })
                        .DataTable({
                            dom:            'r<t>',
                            scrollY:        "60vh",
                            scrollCollapse: true,
                            processing:     true,
                            deferRender:    true,
                            jQueryUI:       true,
                            order:          [[3, "desc"]],
                            paging:         false,
                            language:       languageOptions,
                            data:           tabRecRest,
                            columns: [{ data: "Cas", searchable: false, sWidth: 'auto' }, { data: "Rame", searchable: false, sWidth: 'auto' }, { data: "Lib", searchable: false, sWidth: 'auto' }, { data: "Nb", searchable: false, sWidth: 'auto' }]
                        });
                    // Stoppe animation
                    $('#_LoadRecRest').removeClass("fa-spin");
                    $('#_LoadRecRest').css('display', 'none');
                    $('#indexProcessing').css('display', 'none');

                },
                error: function (e) { $('#indexProcessing').css('display', 'none'); alert("Erreur Send Contrôleur" + "\r\n" + e.error); }
            });
        })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + "," + error; $('#indexProcessing').css('display', 'none'); alert("Erreur Récup Récidive : " + err); })
    }
    // Mise à jour User
    $('#btn-save-stf').on('click', function (e) {
        $.ajax({
            url: "/Home/SaveStfPrefer",
            data: { stfPrf: $('#stfLayout').val() == null || $('#stfLayout').val() == "" ? "0" : $('#stfLayout').val() },
            success: function (json) {
                if ($('#stfLayout').val() != '') window.g_iStfPref = parseInt($('#stfLayout').val());
                else window.g_iStfPref = 0;
                $('#stfModal').modal('hide');
                if (window.g_iStfPref > 0) { GetFilterTable(window.g_stfS, 'ID', window.g_iStfPref).then(function (stfFilter) { $('#txtStf').text('Préf. STF : [' + stfFilter[0].STF + ']'); }) }
                else $('#txtStf').text('Préf. STF : [Aucune]');
                if (typeof recrestTable != 'undefined') { recrestTable.destroy(); }  // destroy table if exist
                $('#indexProcessing').css('display', 'block');
                if (document.title == "WebMAT | Accueil") { getRecidives(); }
            },
            error: function (e) { $('#indexProcessing').css('display', 'none'); alert("Erreur Update User " + "\r\n" + e.error); }
        });
    });
    // Stf Pref
    $('#stfModal').on('shown.bs.modal', function (e) {
        if (window.g_stfS.length == 0) {
            $('#_LoadStfPref').css('display', 'block');
            $('#_LoadStfPref').addClass("fa-spin");
            $.when(InitAsp()).then(function (_init) {
                window.g_stfS = _init.AllStfs;
                $('#stfLayout').get(0).options.length = 0;
                $.each(_init.AllStfs, function (i, item) { $('#stfLayout').append('<option value ="' + item.ID + '">' + item.STF + '</option>'); });
                $('#stfLayout').selectpicker('refresh');
                if (parseInt(_init.STFpref) > 0) $('#stfLayout').selectpicker('val', parseInt(_init.STFpref));
                $('#_LoadStfPref').removeClass("fa-spin");
                $('#_LoadStfPref').css('display', 'none');
            })
        }
        else {
            $('#stfLayout').get(0).options.length = 0;
            $.each(window.g_stfS, function (i, item) { $('#stfLayout').append('<option value ="' + item.ID + '">' + item.STF + '</option>'); });
            $('#stfLayout').selectpicker('refresh');
            if (window.g_iStfPref > 0) $('#stfLayout').selectpicker('val', window.g_iStfPref);
        }
    })
    // A propos .............................
    $('#id_apropos').on('click', function (e) {
        $('.dl-horizontal').remove();
        var div_script = document.getElementById("script-tab");

        var _dl_jquery = document.createElement("dl")
        var _dt_jquery = document.createElement("dt")
        var _dd_jquery = document.createElement("dd")
        _dl_jquery.className = "dl-horizontal";
        _dl_jquery.appendChild(_dt_jquery);
        _dl_jquery.appendChild(_dd_jquery);
        div_script.appendChild(_dl_jquery)
        $(_dt_jquery).text("JQuery :");
        $(_dd_jquery).text($.fn.jquery);

        var _dl_SelectPick = document.createElement("dl")
        var _dt_SelectPick = document.createElement("dt")
        var _dd_SelectPick = document.createElement("dd")
        _dl_SelectPick.className = "dl-horizontal";
        _dl_SelectPick.appendChild(_dt_SelectPick);
        _dl_SelectPick.appendChild(_dd_SelectPick);
        div_script.appendChild(_dl_SelectPick)
        $(_dt_SelectPick).text("BootStrap-Select :");
        $(_dd_SelectPick).text($.fn.selectpicker.Constructor.VERSION);

        var _dl_datatable = document.createElement("dl")
        var _dt_datatable = document.createElement("dt")
        var _dd_datatable = document.createElement("dd")
        _dl_datatable.className = "dl-horizontal";
        _dl_datatable.appendChild(_dt_datatable);
        _dl_datatable.appendChild(_dd_datatable);
        div_script.appendChild(_dl_datatable)
        $(_dt_datatable).text("DataTables :");
        $(_dd_datatable).text($.fn.dataTable.version);

        var _dl_lodash = document.createElement("dl")
        var _dt_lodash = document.createElement("dt")
        var _dd_lodash = document.createElement("dd")
        _dl_lodash.className = "dl-horizontal";
        _dl_lodash.appendChild(_dt_lodash);
        _dl_lodash.appendChild(_dd_lodash);
        div_script.appendChild(_dl_lodash)
        $(_dt_lodash).text("Lodash :");
        $(_dd_lodash).text(_.VERSION);

        var _dl_typeahead = document.createElement("dl")
        var _dt_typeahead = document.createElement("dt")
        var _dd_typeahead = document.createElement("dd")
        _dl_typeahead.className = "dl-horizontal";
        _dl_typeahead.appendChild(_dt_typeahead);
        _dl_typeahead.appendChild(_dd_typeahead);
        div_script.appendChild(_dl_typeahead)
        $(_dt_typeahead).text("TypeaHead :");
        $(_dd_typeahead).text(Typeahead.version);

        $('[aria-labelledby="webmat-tab"]').css('height', '300px');
        $('[aria-labelledby="webmat-tab"]').css('overflow-y', 'scroll');
        $('[aria-labelledby="webmat-tab"]').css('width', '100%');

        return $.getJSON("http://localhost:3000/getVersionsWebMat", { })
            .done(function (versions) {
                var div = document.getElementById("webmat-tab");
                for (var i = 0; i < versions.data.length; i++) {
                    var _dl = document.createElement("dl")
                    _dl.className = "dl-horizontal";
                    var _dt = document.createElement("dt")
                    var _dd = document.createElement("dd")
                    _dl.appendChild(_dt);
                    _dl.appendChild(_dd);
                    div.appendChild(_dl)
                    $(_dt).text(versions.data[i].Version + " [" + moment(versions.data[i].DateVersion).format('DD/MM/YY HH:mm') + "]");
                    $(_dd).text(versions.data[i].Modification);
                }
                $('#aproposModal').modal({ keyboard: true, show: true });
            })
            .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Recup Versionning... : " + err); });
    });

});