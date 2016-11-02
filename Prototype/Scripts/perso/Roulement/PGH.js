$(function () {
    var sites; var donnees;
    var filterDatePgh = new Array();
    var tableDetailPgh = document.getElementById("CalandarTable");

    $.when(InitAsp()).then(function (_init) {
        var iStfPref = parseInt(_init.STFpref);
        $.each(_init.AllStfs, function (i, item) { $('#stfsList').append('<option value ="' + item.ID + '">' + item.STF + '</option>'); }); $('#stfsList').selectpicker('refresh');

        if (iStfPref == 0)  $('#stfsList').selectpicker('val', "1"); 
        else                $('#stfsList').selectpicker('val', _init.STFpref); 
        $('#stfsList').selectpicker('refresh');
        TraceUser("V3. PGH", _init.UserInfo.username, moment().format('YYYY-MM-DD HH:mm:ss'));
        GetPgh();
    })

    // Activation des tooltips
    $('[data-toggle="tooltip"]').tooltip({ 'container': 'body' });

    /* onChange stf */
    $('#stfsList').change(function () { GetPgh(); });

    moment.locale("fr");
    for (var i = 0; i < 9; i++) { $('#j' + (i + 1)).val(moment(new Date(moment()._d)).add(i, 'd').format('ddd DD/MM')); $('#j' + (i + 1)).addClass('valid-input'); }

    // Check - Uncheck FilterDate
    $('#chkJ1,#chkJ2,#chkJ3,#chkJ4,#chkJ5,#chkJ6,#chkJ7,#chkJ8,#chkJ9').change(function () {
        filterDatePgh = new Array();
        for (var i = 0; i < 9; i++) {
            if ($('#chkJ' + (i + 1))[0].checked) {
                $('.csrow' + i).show();
                filterDatePgh.push(moment(new Date(moment()._d)).add(i, 'd').format('DD/MM/YYYY'));
                $('#j' + (i + 1)).removeClass('error-input'); $('#j' + (i + 1)).addClass('valid-input');
            }
            else {
                $('.csrow' + i).hide();
                $('#j' + (i + 1)).removeClass('valid-input'); $('#j' + (i + 1)).addClass('error-input');
            }
        }
        
        if (filterDatePgh) {
            var arrTostr = filterDatePgh.join("|");    // convert array to str(regEx) for searching
            _pghTable.columns(1).search(arrTostr, true, false).draw();
        }
        else { _pghTable.columns(1).search('').draw(); }
    });

    $('#pghToXls').on('click', function () {
        var url = "PghToXls";
        var data = { dates: filterDatePgh ? filterDatePgh.join("|") : null };
        url += '?' + decodeURIComponent($.param(data));
        window.location = url;
    });


    $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });

    $('#pghTable').on('processing.dt', function (e, settings, processing) { $('#PghProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsPgh = {
        "dom":              'lrf<t>ip',
        "processing":       true,
        "deferRender":      true,
        "jQueryUI":         true,
        "order":            [[1, "asc"]],
        "lengthMenu":       [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength":   -1,
        "language":         languageOptions,
        "ajax": {
            "url": "GetPghDate",
            "data": function (d) {
                d.IdStf     = $('#stfsList').val(),
                d.datePgh   = moment().format('DD/MM/YYYY'),
                d.Rame      = "0"
            }
        },
        "columns": [
            { "data": "EAB", "searchable": true },
            { "data": "DatePgh", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { "data": "Etat" },
            { "data": "NomEts", "searchable": true },
            { "data": "Immo", "searchable": true },
            { "data": "DateFin", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { "data": "DateButee", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { "data": "Prioritaire", "render": function (data, type, full, meta) { return data ? '<i class="fa fa-bell" style="color: #7AB800;"></i>' : ""; } },
            { "data": "Rentree1", "render": function (data, type, full, meta) { return data ? '<i class="fa fa-bell" style="color: #7AB800;"></i>' : ""; } },
            { "data": "Rentree1_2", "render": function (data, type, full, meta) { return data ? '<i class="fa fa-bell" style="color: #7AB800;"></i>' : ""; } },
        ]
    };
    var GetPgh = function () {

        if (typeof _pghTable != 'undefined') { _pghTable.destroy(); } // destroy table if exist
        _pghTable = $('#pghTable')
            .on('xhr.dt', function (e, settings, json, xhr) {
            sites = json.sitePGH; donnees = json.data;
            while (tableDetailPgh.rows.length > 1) { tableDetailPgh.deleteRow(1); }
            if (sites.length > 0) {
                var row; var cellDate; var cellSite; var cellNbJ; var cellNbN; var cellJournee; var cellNuit;

                for (var i = 0; i < 9; i++) {
                    var dataFilterVac0 = donnees.filter(function (item) { return item.NomEts == sites[0].SitePgh && item.vac == 0 && item.NumPgh == i });
                    var dataFilterVac1 = donnees.filter(function (item) { return item.NomEts == sites[0].SitePgh && item.vac == 1 && item.NumPgh == i });
                    var immoVac0 = new Array(); var immoVac1 = new Array();
                    for (var j = 0; j < dataFilterVac0.length; j++) { immoVac0.push(dataFilterVac0[j].EAB + " : " + dataFilterVac0[j].Immo + '<br/>'); }
                    for (var j = 0; j < dataFilterVac1.length; j++) { immoVac1.push(dataFilterVac1[j].EAB + " : " + dataFilterVac1[j].Immo + '<br/>'); }
                    row = tableDetailPgh.insertRow();
                    row.className = "csrow" + i;
                    cellDate = row.insertCell();
                    cellDate.rowSpan = sites.length;
                    cellDate.align = "center";
                    cellDate.style = "background-color:#009AA6; color:white;";
                    cellDate.innerHTML = '<b>' + moment(new Date(moment()._d)).add(i, 'd').format('ddd DD/MM') + '</b>';
                    cellSite = row.insertCell();
                    cellSite.align = "center";
                    cellSite.innerHTML = sites[0].SitePgh;
                    cellNbJ = row.insertCell();
                    cellNbJ.align = "center";
                    cellNbJ.innerHTML = dataFilterVac0.length;
                    cellJournee = row.insertCell();
                    cellJournee.innerHTML = immoVac0.join("");
                    cellNbN = row.insertCell();
                    cellNbN.align = "center";
                    cellNbN.innerHTML = dataFilterVac1.length;
                    cellNuit = row.insertCell();
                    cellNuit.innerHTML = immoVac1.join("");
                    for (var site = 1; site < sites.length; site++) {
                        var immoVac0 = new Array(); var immoVac1 = new Array();
                        dataFilterVac0 = donnees.filter(function (item) { return item.NomEts == sites[site].SitePgh && item.vac == 0 && item.NumPgh == i });
                        dataFilterVac1 = donnees.filter(function (item) { return item.NomEts == sites[site].SitePgh && item.vac == 1 && item.NumPgh == i });
                        for (var j = 0; j < dataFilterVac0.length; j++) { immoVac0.push(dataFilterVac0[j].EAB + " : " + dataFilterVac0[j].Immo + '<br/>'); }
                        for (var j = 0; j < dataFilterVac1.length; j++) { immoVac1.push(dataFilterVac1[j].EAB + " : " + dataFilterVac1[j].Immo + '<br/>'); }
                        row = tableDetailPgh.insertRow();
                        row.className = "csrow" + i;
                        cellSite = row.insertCell();
                        cellSite.align = "center";
                        cellSite.innerHTML = sites[site].SitePgh;
                        cellNbJ = row.insertCell();
                        cellNbJ.align = "center";
                        cellNbJ.innerHTML = dataFilterVac0.length;
                        cellJournee = row.insertCell();
                        cellJournee.innerHTML = immoVac0.join("");
                        cellNbN = row.insertCell();
                        cellNbN.align = "center";
                        cellNbN.innerHTML = dataFilterVac1.length;
                        cellNuit = row.insertCell();
                        cellNuit.innerHTML = immoVac1.join("");
                    }
                }
            }

            })
            .DataTable(optionsPgh);
    }
    //GetNavigator("V3. PGH");
});