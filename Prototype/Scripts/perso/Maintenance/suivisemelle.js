$(function () {
    var STFs            = [];
    var tbRames         = [];
    var tbLastCtrlRame  = [];
    var tbLastCtrlRame2 = [];
    var _jsonString     = "";
    var userName        = "";
    var RameSelected    = { ID: 0, EAB: "0", NumEF: "0", IdRexM: 0, IdSerie: 0, IdSousSerie: 0, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };
    var StfSelected     = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD" };
    var _dataToXls      = [];
    var _LastDate       = { rameId: 0, SerieId: 0, LastDateZIB2: "", LastDateZIB2: "", LastDateZPB2: "", LastDateZPB2: "", LastIdZIB2: "", LastIdZIB2: "", LastIdZPB2: "", LastIdZPB2: "" };
    var _rameid = 0;
    var tbLastDate      = [];


    $.when(InitAsp()).then(function (_init) {
        STFs = _init.AllStfs;
        var iStfPref = parseInt(_init.STFpref);
        $.each(STFs, function (i, item) {
            if (item.ID == 1)   $('#stfsList').append('<option value ="' + item.ID + '">' + item.STF + '</option>');
            else                $('#stfsList').append('<option disabled value ="' + item.ID + '">' + item.STF + '</option>');
        }); $('#stfsList').selectpicker('refresh');

        if (iStfPref == 0) { $('#stfsList').selectpicker('val', "1"); }
        else {
            GetFilterTable(STFs, 'ID', iStfPref).then(function (stfFilter) {
                StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
                $('#stfsList').selectpicker('val', stfFilter[0].ID);
            })
        }
        $('#stfsList').selectpicker('refresh');
        getRames();
        TraceUser("V3. Suivi Semelle", _init.UserInfo.username, moment().format('YYYY-MM-DD HH:mm:ss'));
    })
    function getRames() {
        $.when(util_GetRames(0, StfSelected.ID, 0, 0, '', '')).then(function (_rames) {
            tbRames = _rames.data; FindLastCtrl();
        });
    }

    function FindLastCtrl() {
        $('#SuiviSemelleProcessing').css('display','block');
        $.getJSON("GetRestSuiviSemelle", { idStf: StfSelected.ID, first: true })
        .done(function (json) {
            var cpt = 0; tbLastCtrlRame = []; tbLastCtrlRame2 = []; _LastDate = [];

            
            $.when(GetUniqOfTable(json.data, 'rame')).then(function (rames) {
                $.each(rames, function (i, _rame) {
                    $.when(GetFilterTable(tbRames, 'EAB', _rame)).then(function (__rame) {                     // Sur S71P12DMBQX >> dateref:moment().format('DD-MM-YYYY HH:mm:ss') Sinon le SQL retourne Out of mémory...
                        $.getJSON("http://localhost:3000/getLastDateCtrlByEab", { rameId: __rame[0].ID, dateRef: moment().format('DD-MM-YYYY HH:mm:ss') })//.format('YYYY-MM-DD HH:mm:ss') })
                            .done(function (_lastctrl) {
                                _LastDate = {
                                    rameId: __rame[0].ID,
                                    SerieId: __rame[0].IdSerie,
                                    LastDateZIB1: _lastctrl.data.LastDateZIB1 == null ? null : _lastctrl.data.LastDateZIB1.split('-')[0],
                                    LastDateZIB2: _lastctrl.data.LastDateZIB2 == null ? null : _lastctrl.data.LastDateZIB2.split('-')[0],
                                    LastDateZPB1: _lastctrl.data.LastDateZPB1 == null ? null : _lastctrl.data.LastDateZPB1.split('-')[0],
                                    LastDateZPB2: _lastctrl.data.LastDateZPB2 == null ? null : _lastctrl.data.LastDateZPB2.split('-')[0],
                                    LastIdZIB1: _lastctrl.data.LastDateZIB1 == null ? 0 : _lastctrl.data.LastDateZIB1.split('-')[1],
                                    LastIdZIB2: _lastctrl.data.LastDateZIB2 == null ? 0 : _lastctrl.data.LastDateZIB2.split('-')[1],
                                    LastIdZPB1: _lastctrl.data.LastDateZPB1 == null ? 0 : _lastctrl.data.LastDateZPB1.split('-')[1],
                                    LastIdZPB2: _lastctrl.data.LastDateZPB2 == null ? 0 : _lastctrl.data.LastDateZPB2.split('-')[1],
                                };
                                tbLastDate.push(_LastDate);

                                var dates = [];
                                if (_lastctrl.data.LastDateZIB1 != null) dates.push(new Date(moment(_lastctrl.data.LastDateZIB1.split('-')[0], "DD/MM/YYYY").subtract((new Date().getTimezoneOffset() / 60), 'hour')));
                                if (_lastctrl.data.LastDateZIB2 != null) dates.push(new Date(moment(_lastctrl.data.LastDateZIB2.split('-')[0], "DD/MM/YYYY").subtract((new Date().getTimezoneOffset() / 60), 'hour')));
                                if (_lastctrl.data.LastDateZPB1 != null) dates.push(new Date(moment(_lastctrl.data.LastDateZPB1.split('-')[0], "DD/MM/YYYY").subtract((new Date().getTimezoneOffset() / 60), 'hour')));
                                if (_lastctrl.data.LastDateZPB2 != null) dates.push(new Date(moment(_lastctrl.data.LastDateZPB2.split('-')[0], "DD/MM/YYYY").subtract((new Date().getTimezoneOffset() / 60), 'hour')));
                                var maxDate = new Date(Math.max.apply(null, dates));
                                tbLastCtrlRame.push({ rame: __rame[0].EAB, lastctrl: maxDate });
                                tbLastCtrlRame2.push({ rame: __rame[0].EAB, lastctrl: moment(maxDate).format("DD/MM/YYYY") });
                                cpt++;
                                if (cpt == rames.length) {
                                    $.ajax({
                                        contentType: 'application/json; charset=utf-8', dataType: 'json', type: 'POST', url: 'SaveRameLastCtrl', data: JSON.stringify({ 'data': tbLastCtrlRame2 }),
                                        success: function (retour) { GetSuiviSemelle(); },
                                        failure: function (err) { $('#SuiviSemelleProcessing').css('display', 'none'); alert("Error Send LastCtrl: " + err); }
                                    });
                                }
                            })
                            .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Récupération LastCtrl " + err); });
                    });
                });
            });

        })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Ereur Recup Rame In SuiviSemelle: " + err); });
    }

    $('#suivSemToXls').on('click', function () {
        $('#SuiviSemelleProcessing').css('display', 'block');

        $.each(suiviSem.data(), function (i, item) {
            _dataToXls.push({
                rame: item.rame,
                motrice: item.motrice,
                cause: item.cause,
                snbJourR: item.snbJourR,
                dernCtrl: moment(tbLastCtrlRame.filter(function (_item) { return _item.rame == item.rame })[0].lastctrl).format('DD/MM/YYYY'),
                site: item.site,
                echeance: item.snbJourR == ' > 10' ? moment().add(-10, 'day').format('DD/MM/YYYY') : moment(tbLastCtrlRame.filter(function (_item) { return _item.rame == item.rame })[0].lastctrl).add((7 + parseInt(item.snbJourR)), 'days').format('DD/MM/YYYY')
            });
        })

        $.ajax({
            type: 'POST',
            url: 'SaveDataForXls',
            data: JSON.stringify({ suivis: _dataToXls }),
            contentType: 'application/json',
            async: false,
            success: function () {
                window.location = "SuiviToXls";
                $('#SuiviSemelleProcessing').css('display', 'none');
            },
            error: function (xhr, ajaxOptions, thrownError) { $('#SuiviSemelleProcessing').css('display', 'none'); alert("Echec du XLS...") }
        });
    });

    /* onChange stf */
    $('#stfsList').change(function () {
        GetFilterTable(STFs, 'ID', parseInt($('#stfsList').val())).then(function (stfFilter) {
            StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
            getRames();
        })
    });

    $('#suivisemelleTable').on('processing.dt', function (e, settings, processing) { $('#SuiviSemelleProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsSuiviSem = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[6, "asc"]],
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": -1,
        "language": languageOptions,
        "ajax": {
            url: "GetRestSuiviSemelle",
            "data": function (d) {
                d.idStf = StfSelected.ID;
                d.first = false;
            }
        },
        "columns": [ 
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            { "data": "rame", "searchable": true, "className": "clsWrap" },
            { "data": "motrice", "searchable": true, "className": "clsWrap" },
            { "data": "cause", "searchable": true },
            { "data": function (row, type, set) { return moment(tbLastCtrlRame.filter(function (item) { return item.rame == row.rame })[0].lastctrl).format('DD/MM/YYYY'); }, "type": 'date-euro' },
            { "data": "snbJourR", "searchable": true, "className": "clsWrap" },
            {
                "className": "clsWrap", "data": function (row, type, set) {
                    if (row.snbJourR == ' > 10') return moment().add(-10, 'day').format('DD/MM/YYYY');
                    else {
                        var t = tbLastCtrlRame.filter(function (item) { return item.rame == row.rame })[0].lastctrl;
                        return moment(t).add((7 + parseInt(row.snbJourR)), 'days').format('DD/MM/YYYY');
                    }
                }, "type": 'date-euro'
            },
            { "data": "site", "searchable": true, "className": "clsWrap" }
        ],
        "drawCallback": function (settings) { },
        "createdRow": function (row, data, index) {
            if (row.children[6].innerHTML == '...') $('td', row).css('color', '#000000');
            else {
                var ech = moment(row.children[6].innerHTML, 'DD/MM/YYYY');

                if (ech == moment()) $('td', row).css('color', '#FF0000');
                if (ech < moment()) $('td', row).css('color', '#000000');
                if (ech > moment()) $('td', row).css('color', '#FF4500');
                if (ech > moment().add(3, 'day')) $('td', row).css('color', '#008000');
            }
        }
    };

    var GetSuiviSemelle = function () {
        if (typeof suiviSem != 'undefined') { suiviSem.destroy(); } // destroy table if exist
        suiviSem = $('#suivisemelleTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { })
            .DataTable(optionsSuiviSem);

        $('#suivisemelleTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = suiviSem.row(tr);
            var rowData = row.data();
            _rameid = tbRames.filter(function (item) { return (item.EAB == rowData.rame); })[0].ID;

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $('#SuiviSemelleProcessing').css('display', 'block');
                $.getJSON("http://localhost:3000/getLastCtrlSemellesOfRame", { Idrame: _rameid })
                .done(function (ctrl) {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        url: 'DetailSuivi',
                        data: JSON.stringify({ 'data': ctrl[0] }),
                        success: function (detail) {
                            $('#SuiviSemelleProcessing').css('display', 'none');
                            row.child(detail).show();
                            tr.addClass('shown'); // Modifie l'icone de l'oeil
                        },
                        error: function (e) {
                            alert("Erreur Ouverture Détail" + "\r\n" + e.error);
                            $('#SuiviSemelleProcessing').css('display', 'none');
                        }
                    });
                })
                .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Récupération LastCtrl " + err); });
            }
        });
    }
});