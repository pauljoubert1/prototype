$(function () {
    var RameSelected    = { ID: 0, EAB: "0", NumEF: "0", IdRexM: 0, IdSerie: 0, IdSousSerie: 0, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };
    var StfSelected     = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD" };
    var datasetUsusre   = new Array();
    var datasetSemelle  = new Array();

    // Config STF par défaut, Roles de l'user, Stfs de l'user
    function RootSet() {
        $.getJSON("/Home/GetStfPreference")
            .done(function (json) {
                RolesUser = json.RolesUser;
                StfsUser = json.iStfSelect;
                STfPrefUser = json.StfSelect;
                if (json.iStfSelect == "0") StfSelected = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD" };
                else {
                    var tabFilter = json.Stfs.filter(function (item) { return item.ID == json.iStfSelect });
                    StfSelected = { ID: tabFilter[0].ID, STF: tabFilter[0].STF, IdStfRm: tabFilter[0].IdStfRm, OsmStf: tabFilter[0].OsmStf };
                }
                $('#stfsList').selectpicker('val', StfSelected.ID);
                GetSeriesByStf();
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Ereur Recup Stf Default: " + err);
            });
    }

    function GetSeriesByStf() {
        $.getJSON("/Home/GetSeriesByStf", { IDstf: StfSelected.ID })
        .done(function (json) {
            $('#seriesList').get(0).options.length = 0;
            $('#seriesList').append('<option value ="0">Série...</option>');
            $.each(json.series, function (i, item) { $('#seriesList').append('<option value ="' + item.ID + '">' + item.Serie + '</option>'); });
            $('#seriesList').selectpicker('refresh');
            GetSousseriesByStf();
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Ereur Recup Séries : " + err);
        });
    }
    function GetSousseriesByStf() {
        $.getJSON("/Home/GetSousSeriesBySerie", { IDstf: StfSelected.ID, IDserie: $('#seriesList').val() })
        .done(function (json) {
            $('#sousseriesList').get(0).options.length = 0;
            $('#sousseriesList').append('<option value ="0">Sous-Série...</option>');
            $.each(json, function (i, item) { $('#sousseriesList').append('<option value ="' + item.ID + '">' + item.SousSerie + '</option>'); });
            $('#sousseriesList').selectpicker('refresh');
            getUsureSemelle();
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Ereur Recup Séries : " + err);
        });
    }


    /* onChange stf */
    $('#stfsList').change(function () { GetSeriesByStf(); });
    $('#seriesList').change(function () { GetSousseriesByStf(); });
    $('#sousseriesList').change(function () { getUsureSemelle(); });

    RootSet();

    // Région Usure Semelles
    $('#UsureProcessing').css('display', 'none');
    $('input[name="dtSemelle"]').daterangepicker({ locale: localType, startDate: moment().subtract(5, 'day'), endDate: moment(), "showDropdowns": true, "showWeekNumbers": true });
    $('#dtSemelle').on('apply.daterangepicker', function (ev, picker) { getUsureSemelle(); });
    function getUsureSemelle() {
        datasetSemelle = [];
        datasetUsusre = [];
        $.getJSON("http://localhost:3000/getCtrlSemelle", { IDstf: StfSelected.ID, IDserie: 1, rame: 0, IDsousserie: 1, dperiode: $('input[name="dtSemelle"]').val() })
            //IDstf: StfSelected.ID, IDserie: $('#seriesList').val(),rame: 0, IDsousserie: $('#sousseriesList').val(), dperiode: $('input[name="dtSemelle"]').val()
            .done(function (_ctrl) {
                var tabIdCtrl = new Array();
                var tabCtrl = new Array();
                var tabBogie = new Array();
                var tabData = new Array();
                $.each(_ctrl.data, function (key, ctrl) {
                    tabIdCtrl.push(ctrl.ID);
                    tabCtrl.push({
                        ID: ctrl.ID,
                        DateCtrl: ctrl.DateCtrl,
                        IdRame: ctrl.IdRame,
                        //IdIntervention: ctrl.IdIntervention,
                        //IdSite: ctrl.IdSite,
                        //ControlerName: ctrl.ControlerName,
                        SerieId: ctrl.SerieId,
                        StfId: ctrl.StfId,
                        //Site: ctrl.Site,
                        //Intervention: ctrl.Intervention,
                        EAB: ctrl.EAB.trim()
                    });
                });

                if (tabCtrl.length > 0) {

                    $.getJSON("http://localhost:3000/getBogie", { IdCtrl: tabIdCtrl.join(',') })
                        .done(function (_bogie) {
                            var tabIdBogie = new Array();
                            $.each(_bogie.data, function (key, bogie) {
                                tabIdBogie.push(bogie.ID);
                                tabBogie.push({
                                    ID: bogie.ID, ControleId: bogie.ControleId, CompoId: bogie.CompoId, BogieId: bogie.BogieId, BogieIsole: bogie.BogieIsole, BMisole: bogie.BMisole, NumVehicule: bogie.NumVehicule, Parite:
                                        bogie.NumVehicule % 2 == 0 ? "p" : "i"
                                });
                            });

                            $.getJSON("http://localhost:3000/getMesures", { IdBogie: tabIdBogie.join(',') })
                                .done(function (_data) {
                                    $.each(_data.data, function (key, mesure) {
                                        tabData.push({ ID: mesure.ID, NumRoue: mesure.NumRoue, BogieId: mesure.BogieId, Conformite: mesure.Conformite, Remplacement: mesure.Remplacement, CtrlVisuel: mesure.CtrlVisuel, Mesure: mesure.Mesure, ValiditeMesure: mesure.ValiditeMesure });
                                    });

                                    for (var i = 0; i < tabCtrl.length; i++) {
                                        var zib1 = false; var zib2 = false; var zpb1 = false; var zpb2 = false;
                                        var zib1Mes = null; var zib2Mes = null; var zpb1Mes = null; var zpb2Mes = null;
                                        var zib1Rpl = false; var zib2Rpl = false; var zpb1Rpl = false; var zpb2Rpl = false;
                                        var zib1Cv = false; var zib2Cv = false; var zpb1Cv = false; var zpb2Cv = false;
                                        var zib1Iso = false; var zib2Iso = false; var zpb1Iso = false; var zpb2Iso = false;

                                        var tabBogieFilter = tabBogie.filter(function (item) { return item.ControleId == tabCtrl[i].ID });

                                        for (var j = 0; j < tabBogieFilter.length; j++) {
                                            var tabDataFilter = tabData.filter(function (item) { return item.BogieId == tabBogieFilter[j].ID });

                                            if (tabBogieFilter[j].Parite == "i")
                                                if (tabBogieFilter[j].BogieId == 1) {
                                                    zib1 = true;
                                                    zib1Mes = { R1: tabDataFilter[0].Mesure, R2: tabDataFilter[1].Mesure, R3: tabDataFilter[2].Mesure, R4: tabDataFilter[3].Mesure };
                                                    zib1Rpl = { R1: tabDataFilter[0].Remplacement, R2: tabDataFilter[1].Remplacement, R3: tabDataFilter[2].Remplacement, R4: tabDataFilter[3].Remplacement };
                                                    zib1Cv = { R1: tabDataFilter[0].CtrlVisuel, R2: tabDataFilter[1].CtrlVisuel, R3: tabDataFilter[2].CtrlVisuel, R4: tabDataFilter[3].CtrlVisuel };
                                                    zib1Iso = tabBogieFilter[j].BMisole;
                                                }
                                            if (tabBogieFilter[j].Parite == "i")
                                                if (tabBogieFilter[j].BogieId == 2) {
                                                    zib2 = true;
                                                    zib2Mes = { R1: tabDataFilter[0].Mesure, R2: tabDataFilter[1].Mesure, R3: tabDataFilter[2].Mesure, R4: tabDataFilter[3].Mesure };
                                                    zib2Rpl = { R1: tabDataFilter[0].Remplacement, R2: tabDataFilter[1].Remplacement, R3: tabDataFilter[2].Remplacement, R4: tabDataFilter[3].Remplacement };
                                                    zib2Cv = { R1: tabDataFilter[0].CtrlVisuel, R2: tabDataFilter[1].CtrlVisuel, R3: tabDataFilter[2].CtrlVisuel, R4: tabDataFilter[3].CtrlVisuel };
                                                    zib2Iso = tabBogieFilter[j].BMisole;
                                                }
                                            if (tabBogieFilter[j].Parite == "p")
                                                if (tabBogieFilter[j].BogieId == 1) {
                                                    zpb1 = true;
                                                    zpb1Mes = { R1: tabDataFilter[0].Mesure, R2: tabDataFilter[1].Mesure, R3: tabDataFilter[2].Mesure, R4: tabDataFilter[3].Mesure };
                                                    zpb1Rpl = { R1: tabDataFilter[0].Remplacement, R2: tabDataFilter[1].Remplacement, R3: tabDataFilter[2].Remplacement, R4: tabDataFilter[3].Remplacement };
                                                    zpb1Cv = { R1: tabDataFilter[0].CtrlVisuel, R2: tabDataFilter[1].CtrlVisuel, R3: tabDataFilter[2].CtrlVisuel, R4: tabDataFilter[3].CtrlVisuel };
                                                    zpb1Iso = tabBogieFilter[j].BMisole;
                                                }
                                            if (tabBogieFilter[j].Parite == "p")
                                                if (tabBogieFilter[j].BogieId == 2) {
                                                    zpb2 = true;
                                                    zpb2Mes = { R1: tabDataFilter[0].Mesure, R2: tabDataFilter[1].Mesure, R3: tabDataFilter[2].Mesure, R4: tabDataFilter[3].Mesure };
                                                    zpb2Rpl = { R1: tabDataFilter[0].Remplacement, R2: tabDataFilter[1].Remplacement, R3: tabDataFilter[2].Remplacement, R4: tabDataFilter[3].Remplacement };
                                                    zpb2Cv = { R1: tabDataFilter[0].CtrlVisuel, R2: tabDataFilter[1].CtrlVisuel, R3: tabDataFilter[2].CtrlVisuel, R4: tabDataFilter[3].CtrlVisuel };
                                                    zpb2Iso = tabBogieFilter[j].BMisole;
                                                }
                                        }

                                        datasetSemelle.push({
                                            ID: tabCtrl[i].ID,
                                            DateCtrl: new Date(tabCtrl[i].DateCtrl),
                                            //Site: tabCtrl[i].Site,
                                            //Intervention: tabCtrl[i].Intervention,
                                            Rame: tabCtrl[i].EAB,
                                            //ControlerName: tabCtrl[i].ControlerName,

                                            ZiB1iso: zib1Iso,
                                            ZiB2iso: zib2Iso,
                                            ZpB1iso: zpb1Iso,
                                            ZpB2iso: zpb2Iso,

                                            ZiB1R1: zib1 ? zib1Mes.R1 : null,
                                            ZiB1R2: zib1 ? zib1Mes.R2 : null,
                                            ZiB1R3: zib1 ? zib1Mes.R3 : null,
                                            ZiB1R4: zib1 ? zib1Mes.R4 : null,

                                            ZiB2R1: zib2 ? zib2Mes.R1 : null,
                                            ZiB2R2: zib2 ? zib2Mes.R2 : null,
                                            ZiB2R3: zib2 ? zib2Mes.R3 : null,
                                            ZiB2R4: zib2 ? zib2Mes.R4 : null,

                                            ZpB1R1: zpb1 ? zpb1Mes.R1 : null,
                                            ZpB1R2: zpb1 ? zpb1Mes.R2 : null,
                                            ZpB1R3: zpb1 ? zpb1Mes.R3 : null,
                                            ZpB1R4: zpb1 ? zpb1Mes.R4 : null,

                                            ZpB2R1: zpb2 ? zpb2Mes.R1 : null,
                                            ZpB2R2: zpb2 ? zpb2Mes.R2 : null,
                                            ZpB2R3: zpb2 ? zpb2Mes.R3 : null,
                                            ZpB2R4: zpb2 ? zpb2Mes.R4 : null,

                                            ZiB1R1Rpl: zib1 ? zib1Rpl.R1 : null,
                                            ZiB1R2Rpl: zib1 ? zib1Rpl.R2 : null,
                                            ZiB1R3Rpl: zib1 ? zib1Rpl.R3 : null,
                                            ZiB1R4Rpl: zib1 ? zib1Rpl.R4 : null,

                                            ZiB2R1Rpl: zib2 ? zib2Rpl.R1 : null,
                                            ZiB2R2Rpl: zib2 ? zib2Rpl.R2 : null,
                                            ZiB2R3Rpl: zib2 ? zib2Rpl.R3 : null,
                                            ZiB2R4Rpl: zib2 ? zib2Rpl.R4 : null,

                                            ZpB1R1Rpl: zpb1 ? zpb1Rpl.R1 : null,
                                            ZpB1R2Rpl: zpb1 ? zpb1Rpl.R2 : null,
                                            ZpB1R3Rpl: zpb1 ? zpb1Rpl.R3 : null,
                                            ZpB1R4Rpl: zpb1 ? zpb1Rpl.R4 : null,

                                            ZpB2R1Rpl: zpb2 ? zpb2Rpl.R1 : null,
                                            ZpB2R2Rpl: zpb2 ? zpb2Rpl.R2 : null,
                                            ZpB2R3Rpl: zpb2 ? zpb2Rpl.R3 : null,
                                            ZpB2R4Rpl: zpb2 ? zpb2Rpl.R4 : null,

                                            ZiB1R1Cv: zib1 ? zib1Cv.R1 : null,
                                            ZiB1R2Cv: zib1 ? zib1Cv.R2 : null,
                                            ZiB1R3Cv: zib1 ? zib1Cv.R3 : null,
                                            ZiB1R4Cv: zib1 ? zib1Cv.R4 : null,

                                            ZiB2R1Cv: zib2 ? zib2Cv.R1 : null,
                                            ZiB2R2Cv: zib2 ? zib2Cv.R2 : null,
                                            ZiB2R3Cv: zib2 ? zib2Cv.R3 : null,
                                            ZiB2R4Cv: zib2 ? zib2Cv.R4 : null,

                                            ZpB1R1Cv: zpb1 ? zpb1Cv.R1 : null,
                                            ZpB1R2Cv: zpb1 ? zpb1Cv.R2 : null,
                                            ZpB1R3Cv: zpb1 ? zpb1Cv.R3 : null,
                                            ZpB1R4Cv: zpb1 ? zpb1Cv.R4 : null,

                                            ZpB2R1Cv: zpb2 ? zpb2Cv.R1 : null,
                                            ZpB2R2Cv: zpb2 ? zpb2Cv.R2 : null,
                                            ZpB2R3Cv: zpb2 ? zpb2Cv.R3 : null,
                                            ZpB2R4Cv: zpb2 ? zpb2Cv.R4 : null
                                        });
                                    }

                                    /* Calcul des Usures */

                                    // Extracation de la liste des rames concernées dans le tableau datasetSemelle
                                    var tabRames = [];
                                    tabRames = _.chain(datasetSemelle).pluck('Rame').unique().value();

                                    // POur chacune de ces rames
                                    $.each(tabRames, function (key, __rame) {
                                        // Création d'un tableau de datasemelle pour la rame en question, trié sur la date
                                        var tabDataSemelleFilter = datasetSemelle.filter(function (item) { return item.Rame == __rame });
                                        //    .sort(function (a, b) {
                                        //    if (a.DateCtrl > b.DateCtrl)
                                        //        return 1;
                                        //    if (a.DateCtrl < b.DateCtrl)
                                        //        return -1;
                                        //    // a doit être égale à b
                                        //    return 0;
                                        //});
                                    });
                                    //    datasetUsusre.push({
                                    //        rame:1
                                    //    });
                                    //});

                                    /* Fin Calcul Usure */

                                    // Affichage du DataTable
                                    usureTable = $('#usureTable')
                                        .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
                                        .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
                                        .on('processing.dt', function (e, settings, processing) { $('#SemelleProcessing').css('display', processing ? 'block' : 'none'); })
                                        .DataTable({
                                            "dom": domOptions,
                                            "processing": true,
                                            "deferRender": true,
                                            "jQueryUI": true,
                                            "order": [[1, "desc"]],
                                            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
                                            "iDisplayLength": 50,
                                            "language": languageOptions,
                                            "data": datasetUsusre,
                                            "columns": [
                                                { "data": "Serie", "orderable": false, "defaultContent": 'série...' },
                                                { "data": "Rame", "searchable": false },
                                                { "data": "Site", "searchable": false, "defaultContent": 'motrice...' },
                                                { "data": "Site", "searchable": false, "defaultContent": 'bogie...' },
                                                {
                                                    "data": "DateCtrl_J1", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) {
                                                        var dtDate = new Date(data);
                                                        return moment(dtDate).format('DD/MM/YYYY');
                                                    }
                                                },
                                                
                                                { "data": "ZiB1R1", "render": function (data, type, full, meta) { return full.ZiB1R1Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZiB1R2", "render": function (data, type, full, meta) { return full.ZiB1R2Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZiB1R3", "render": function (data, type, full, meta) { return full.ZiB1R3Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZiB1R4", "render": function (data, type, full, meta) { return full.ZiB1R4Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZiB2R1", "render": function (data, type, full, meta) { return full.ZiB2R1Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZiB2R2", "render": function (data, type, full, meta) { return full.ZiB2R2Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZiB2R3", "render": function (data, type, full, meta) { return full.ZiB2R3Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZiB2R4", "render": function (data, type, full, meta) { return full.ZiB2R4Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZpB1R1", "render": function (data, type, full, meta) { return full.ZpB1R1Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZpB1R2", "render": function (data, type, full, meta) { return full.ZpB1R2Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZpB1R3", "render": function (data, type, full, meta) { return full.ZpB1R3Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZpB1R4", "render": function (data, type, full, meta) { return full.ZpB1R4Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZpB2R1", "render": function (data, type, full, meta) { return full.ZpB2R1Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZpB2R2", "render": function (data, type, full, meta) { return full.ZpB2R2Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZpB2R3", "render": function (data, type, full, meta) { return full.ZpB2R3Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } },
                                                { "data": "ZpB2R4", "render": function (data, type, full, meta) { return full.ZpB2R4Cv ? '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>' : data; } }

                                            ],
                                            "drawCallback": function (settings) { },
                                            "createdRow": function (row, data, index) {
                                                if (data.ZiB1R1Rpl) row.cells[4].style.border = "3px solid blue";
                                                if (data.ZiB1R2Rpl) row.cells[5].style.border = "3px solid blue";
                                                if (data.ZiB1R3Rpl) row.cells[6].style.border = "3px solid blue";
                                                if (data.ZiB1R4Rpl) row.cells[7].style.border = "3px solid blue";
                                                if (data.ZiB2R1Rpl) row.cells[8].style.border = "3px solid blue";
                                                if (data.ZiB2R2Rpl) row.cells[9].style.border = "3px solid blue";
                                                if (data.ZiB2R3Rpl) row.cells[10].style.border = "3px solid blue";
                                                if (data.ZiB2R4Rpl) row.cells[11].style.border = "3px solid blue";
                                                if (data.ZpB1R1Rpl) row.cells[12].style.border = "3px solid blue";
                                                if (data.ZpB1R2Rpl) row.cells[13].style.border = "3px solid blue";
                                                if (data.ZpB1R3Rpl) row.cells[14].style.border = "3px solid blue";
                                                if (data.ZpB1R4Rpl) row.cells[15].style.border = "3px solid blue";
                                                if (data.ZpB2R1Rpl) row.cells[16].style.border = "3px solid blue";
                                                if (data.ZpB2R2Rpl) row.cells[17].style.border = "3px solid blue";
                                                if (data.ZpB2R3Rpl) row.cells[18].style.border = "3px solid blue";
                                                if (data.ZpB2R4Rpl) row.cells[19].style.border = "3px solid blue";

                                                if (data.ZiB1iso) { for (var i = 4; i <= 7; i++) { row.cells[i].style.background = "LightCoral"; } }
                                                if (data.ZiB2iso) { for (var i = 8; i <= 11; i++) { row.cells[i].style.background = "LightCoral"; } }
                                                if (data.ZpB1iso) { for (var i = 12; i <= 15; i++) { row.cells[i].style.background = "LightCoral"; } }
                                                if (data.ZpB2iso) { for (var i = 16; i <= 19; i++) { row.cells[i].style.background = "LightCoral"; } }
                                            }
                                        });

                                })
                                .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Récupération Mesures Semelles : " + err); });
                        })
                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur de récupération des Bogies : " + err); });
                }
                else { }
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Erreur de récupération des Ctrl Semelles : " + err);
            });
    }

    getUsureSemelle();
});