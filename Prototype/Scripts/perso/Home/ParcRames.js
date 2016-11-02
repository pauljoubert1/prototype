
$(function () {
    // Config STF par défaut, Roles de l'user, Stfs de l'user
    function RootSet() {
        $.getJSON("/Home/GetStfPreference")
            .done(function (json) {
                var STFs = json.Stfs;

                // Alimentation du SelectPicker stfsList...
                $('#stfsList').get(0).options.length = 0;
                $('#stfsList').append('<option value ="0">STF...</option>');
                $.each(STFs, function (i, item) { $('#stfsList').append('<option value ="' + item.ID + '">' + item.STF + '</option>'); });
                $('#stfsList').selectpicker('refresh');
                $('#stfsList').selectpicker('val', 0);

                GetSeriesByStf();

                RolesUser = json.RolesUser;
                StfsUser = json.StfsIdUser;
                STfPrefUser = json.iStfSelect;
                userName = json.UserName;
            })
            .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Ereur Recup Stf Default: " + err); });
    }
    function GetSeriesByStf() {
        $.getJSON("/Home/GetSeriesByStf", { IDstf: $('#stfsList').val() })
        .done(function (json) {
            $('#seriesList').get(0).options.length = 0;
            $('#seriesList').append('<option value ="0">Série...</option>');
            $.each(json.series, function (i, item) { $('#seriesList').append('<option value ="' + item.ID + '">' + item.Serie + '</option>'); });
            $('#seriesList').selectpicker('refresh');
            GetSousseriesByStf();
        })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Ereur Recup Séries : " + err); });
    }
    function GetSousseriesByStf() {
        $.getJSON("/Home/GetSousSeriesBySerie", { IDstf: $('#stfsList').val(), IDserie: $('#seriesList').val() })//IDserie: $('#seriesList').val()
        .done(function (json) {
            $('#sousseriesList').get(0).options.length = 0;
            $('#sousseriesList').append('<option value ="0">Sous-Série...</option>');
            $.each(json, function (i, item) { $('#sousseriesList').append('<option value ="' + item.ID + '">' + item.SousSerie + '</option>'); });
            $('#sousseriesList').selectpicker('refresh');

            if (typeof parcTable1 == 'undefined') GetParcRames();
            else parcTable1.ajax.reload();
        })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Ereur Recup SousSéries : " + err); });
    }

    $("#stfsList").on('change', function () { GetSeriesByStf(); });
    $("#seriesList").on('change', function () { GetSousseriesByStf(); });

    RootSet();

    /* DataTable     ------------------------------------------------------------------------------- */
    $("#stfsList,#seriesList,#sousseriesList").on('change', function () { parcTable1.ajax.reload(); });


    $('#parcTable').on('processing.dt', function (e, settings, processing) { $('#parcProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsParc = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[1, "asc"]],
        "lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Toutes"]],
        "iDisplayLength": 50,
        "language": languageOptions,
        "ajax": {
            "url": "http://localhost:3000/getParcRame",
            "data": function (d) {
                d.IdStf         = $('#stfsList').val();
                d.IdSerie       = $('#seriesList').val();
                d.IdSousSerie   = $('#sousseriesList').val();
            }
        },
        "columns": [
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            { "data": "STF", "className": "clsWrap", "searchable": true },
            { "data": "Serie", "className": "clsWrap", "searchable": true },
            { "data": "SousSerie", "className": "clsWrap", "searchable": true },
            { "data": "EAB", "className": "clsWrap", "searchable": true },
            { "data": "CS", "className": "clsWrap", "searchable": true },
            { "data": "OsmStf", "className": "clsWrap", "searchable": true },
            { "data": "OsmEF", "className": "clsWrap", "searchable": true },
            { "data": "OsmSerieId", "className": "clsWrap", "searchable": true },
            { "data": "IdRexmat", "className": "clsWrap", "searchable": true },
            { "data": "StfIdRM", "className": "clsWrap", "searchable": true },
            { "data": "IdSerieRm", "className": "clsWrap", "searchable": true }
        ],
        "drawCallback": function (settings) { },
        "createdRow": function (row, data, index) { }
    };

    var GetParcRames = function () {
        if (typeof parcTable1 != 'undefined') { parcTable1.destroy(); } // destroy table if exist
        parcTable1 = $('#parcTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            //.on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsParc);
    }
    /* Fin Region DataTable ------------------------------------------------------------------------------- */

});
