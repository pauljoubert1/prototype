$(function () {
    // Config STF par défaut
    function Root() {
        $.getJSON("/Home/GetStfPreference")
            .done(function (json) {
                if (json.iStfSelect == "0") $('#stfsList').selectpicker('val', "1");
                else {
                    var tabFilter = json.Stfs.filter(function (item) { return item.ID == json.iStfSelect });
                    $('#stfsList').selectpicker('val', tabFilter[0].ID);
                }
                GetSites();
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Ereur Recup Stf Default: " + err);
            });
    }
    Root();

    // Mise en forme CSS des SelectPicker
    $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });

    // Activation des tooltips
    $('[data-toggle="tooltip"]').tooltip({ 'container': 'body', delay: { "show": 500, "hide": 100 } });

    /* onChange stf */
    $('#stfsList').change(function () { GetSites(); });
    $('#sitesList').change(function () { GetNavigator("V3. Site-Out"); GetSorties(); });


    function GetSites() {
        $.getJSON("GetSitesByStf", { IdStf: $('#stfsList').val() })
        .done(function (json) {
            $('#sitesList').get(0).options.length = 0;
            $.each(json, function (i,item) {  $('#sitesList').append('<option value ="' + item.CodeGare + '">' + item.StfLibelle + '</option>'); });
            $('#sitesList').selectpicker('refresh');
            if (typeof _outTable != 'undefined') { _outTable.clear().draw(); }
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Récupérations des sites de maintenances impossibles...: " + "\r\n" + err);
        });
    }

    $('#outTable').on('processing.dt', function (e, settings, processing) { $('#OutSiteProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsOutSite = {
        "dom":              'irf<t>',
        "processing":       true,
        "deferRender":      true,
        "jQueryUI":         true,
        "order": [[4, "asc"]],
        "paging": false,
        "language":         languageOptions,
        "ajax": {
            "url": "GetSortieSite",
            "data": function (d) {
                d.IdStf         = $('#stfsList').val();
                d.Site          = $('#sitesList').val();
            }
        },
        "columns": [
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            { "data": "NumRoulement", "searchable": true },
            { "data": "NumLigne", "searchable": true },
            { "data": "NumTrain", "searchable": true },
            { "data": "HeureDepart", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { "data": "Nature", "searchable": true },
            { "data": "NbElements", "searchable": true },
            { "data": "NumRame", "searchable": true },
            { "data": "Position", "searchable": true },
            { "data": "TrainSupp", "render": function (data, type, full, meta) { return data ? '<i class="fa fa-exclamation-triangle" style="color: #FF0000;"></i>' : ""; } },
            { "data": "Couchage", "searchable": true },
            { "data": "immoPgh", "searchable": true }
        ],
        "createdRow": function (row, data, index) {
            if (data.TrainSupp) $('td', row).addClass("red" + "txt");
            if (data.PreBapt) $('td', row).addClass("blue" + "txt");
            if (data.Reboucle) $('td', row).addClass("green" + "txt");
        }
    };

    var GetSorties = function () {
        $('[data-toggle="tooltip"]').tooltip('hide');
        if (typeof _outTable != 'undefined') { _outTable.destroy(); } // destroy table if exist
        _outTable = $('#outTable')
            .on('xhr.dt', function (e, settings, json, xhr) { })
            .DataTable(optionsOutSite);

        // Add event listener for opening and closing details
        $('#outTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = _outTable.row(tr);
            var rowData = row.data();

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $('#OutSiteProcessing').css('display', 'block');
                $.ajax({
                    type: "POST",
                    url: 'DetailOutSite',
                    data: {
                        annee: rowData.Annee, numsem: rowData.NumSemaine, jour: rowData.Jour, numrlt: rowData.NumRoulement, numligne: rowData.NumLigne, heuredepart: moment(rowData.HeureDepart, "x").format('DD/MM/YYYY HH:mm') },
                    success: function (data) {
                        $('#OutSiteProcessing').css('display', 'none');
                        row.child(data).show();
                        tr.addClass('shown'); // Modifie l'icone de l'oeil
                    },
                    error: function (e) {
                        alert("Erreur Ouverture Détail" + "\r\n" + e.error);
                        $('#OutSiteProcessing').css('display', 'none');
                    }
                });
            }

        });
    }
});