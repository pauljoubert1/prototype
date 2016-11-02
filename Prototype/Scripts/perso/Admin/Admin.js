$(function () {
    /* bootstrap multi-select */
    $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });
    $('.multi-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%', selectedTextFormat: 'count>3', liveSearch: true });

    // change collapse icon on click
    // Role
    $('#di-collapse-role').on('hide.bs.collapse', function () { $('#di-icone-role').toggleClass('fa-angle-down fa-angle-up'); });
    $('#di-collapse-role').on('show.bs.collapse', function () { $('#di-icone-role').toggleClass('fa-angle-down fa-angle-up'); });
    // User
    $('#di-collapse-user').on('hide.bs.collapse', function () { $('#di-icone-user').toggleClass('fa-angle-down fa-angle-up'); });
    $('#di-collapse-user').on('show.bs.collapse', function () { $('#di-icone-user').toggleClass('fa-angle-down fa-angle-up'); });
    // User
    $('#di-collapse-log').on('hide.bs.collapse', function () { $('#di-icone-log').toggleClass('fa-angle-down fa-angle-up'); });
    $('#di-collapse-log').on('show.bs.collapse', function () { $('#di-icone-log').toggleClass('fa-angle-down fa-angle-up'); });

    // change active tab
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        tabActive = e.target.textContent.trim(); // newly activated tab
        ActualiseAdmin();
    });

    /* date range picker icone clickable */
    $('.date-picker-icon').on('click', function () {
        var data = $(this).data('input-name');
        $('input[name="' + data + '"]').focus();
    })

    $('#_refresh').on('click', function () { $('#_i_refresh').addClass("fa-spin"); ActualiseAdmin() });

    function ActualiseAdmin() {
        switch (tabActive) {
            case "Roles":
                if (typeof _roleTable == 'undefined') getRoles();
                else { _roleTable.ajax.reload(); }
                break;
            case "Users":
                if (typeof _userTable == 'undefined') getUsers();
                else { _userTable.ajax.reload(); }
                break;
            case "Logs":
                if (typeof _logTable == 'undefined') getLogs();
                else { _logTable.ajax.reload(); }
                break;
        }
    }

    /* Rôle */
    $('#Btn-Add-Role').on('click', function (e) {
        var roleExist = false;
        $('#txt-add-role').removeClass('error-input');
        if ($('#txt-add-role').val() == '') $('#txt-add-role').addClass('error-input');
        else {
            for (var i = 0; i < _roleTable.data().length; i++)
            {
                if ($('#txt-add-role').val().toUpperCase() == _roleTable.data()[i].RoleName.toUpperCase())
                    roleExist = true;
            }
            if (roleExist) { alert("Un Rôle du même nom existe déjà..."); $('#txt-add-role').val(''); }
            else {
                $.ajax({
                    url: "Admin/CreateRole",
                    data: { role: $('#txt-add-role').val() },
                    success: function (role) { _roleTable.ajax.reload(); alert('Nouveau Rôle créé avec succès...'); $('#txt-add-role').val(''); },
                    error: function (e) { alert("Erreur Création Rôle " + "\r\n" + e.error); }
                });
            }
        }
    });
    
    $('#roleTable').on('processing.dt', function (e, settings, processing) { $('#RoleProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsRoles = {
        "dom":              domOptions,
        "processing":       true,
        "deferRender":      true,
        "jQueryUI":         true,
        "order":            [[1, "asc"]],
        "lengthMenu":       [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength":   -1,
        "language":         languageOptions,
        "ajax": {  "url": "http://localhost:3000/getAspRoles" },
        "columns": [
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            { "data": "RoleName", "searchable": true },
            { "data": "Description", "searchable": true },
            { "data": "NbUsersInRole", "searchable": true },
            {
                "data": null, "searchable": false, "render": function (data, type, full, meta)
                { return data.NbUsersInRole > 0 ? "" : '<input type="button" name="DeleteRole" class="btn btn-warning btn-xs" value="Supprimer" id="' + data.RoleName + '">' }
            }
        ],
        "drawCallback": function (settings) {
            if (settings.aoData.length > 0) {
                $('input[name*="DeleteRole"]').on('click', function (e) {
                    $.ajax({
                        url: "Admin/DeleteRole", data: { role: $('#' + this.id)[0].id },
                        success: function (role) { _roleTable.ajax.reload(); alert('Suppression du Rôle réalisée avec succès...'); },
                        error: function (xhr, ajaxOptions, thrownError) { alert("Echec de la suppression du rôle..." + xhr.status + " : " + thrownError); }
                    });
                });
            }
        }
    };
    var getRoles = function () {
        if (typeof _roleTable != 'undefined') { _roleTable.destroy(); } // destroy table if exist
        _roleTable = $('#roleTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsRoles);

        // Add event listener for opening and closing details
        $('#roleTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = _roleTable.row(tr);
            var rowData = row.data();

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $.ajax({
                    type: "POST", contentType: "application/json", url: "Admin/RoleDetail",
                    data: JSON.stringify({ Role: rowData }),
                    success: function (role) {
                        row.child(role).show();
                        tr.addClass('shown');

                        $('#Btn-Update-Role').on('click', function (e) {
                            var roleExist = false;
                            $('#txt-roleName').removeClass('error-input');
                            if ($('#txt-roleName').val() == '') $('#txt-roleName').addClass('error-input');
                            else {
                                for (var i = 0; i < _roleTable.data().length; i++) {
                                    if ($('#txt-roleName').val().toUpperCase() == _roleTable.data()[i].RoleName.toUpperCase() && $('#Btn-Update-Role')[0].name.toUpperCase() != _roleTable.data()[i].RoleId)
                                        roleExist = true;
                                }
                                if (roleExist) { alert("Un Rôle du même nom existe déjà..."); $('#txt-roleName').val(''); }
                                else {
                                    $.ajax({
                                        url: "Admin/UpdateRole",
                                        data: { RoleId: $('#Btn-Update-Role')[0].name, role: $('#txt-roleName').val(), description: $('#txt-roleDesc').val() },
                                        success: function (role) { _roleTable.ajax.reload(); alert('Mise à jour réalisée avec succès...'); },
                                        error: function (e) { alert("Erreur Update Rôle " + "\r\n" + e.error); }
                                    });
                                }
                            }

                        });

                    },
                    error: function (e) { alert("Erreur Detail Rôle " + "\r\n" + e.error); }
                });
            }
        });

    }

    /* Users */
    $('#userTable').on('processing.dt', function (e, settings, processing) { $('#UserProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsUsers = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[5, "desc"]],
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": 25,
        "language": languageOptions,
        "ajax": { url: "http://localhost:3000/getAspUsers", 
            data: function (d) { d.RoleId =  $('#rolesList').val(); }
        },
        "columns": [
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            { "data": "UserName", "searchable": true },
            { "data": "Comment", "searchable": true },
            { "data": "UserMail", "searchable": true },
            { "data": "DateCreate", "searchable": true, "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "LastActivity", "searchable": true, "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "IsLocked", "render": function (data, type, full, meta) { return data ? '<i class="fa fa-ban" style="color: #FF0000;"></i>' : '<i class="fa fa-check" style="color: #00FF00;"></i>'; } },
            { "data": "IsApproved", "render": function (data, type, full, meta) { return data ? '<i class="fa fa-check" style="color: #00FF00;"></i>' : '<i class="fa fa-ban" style="color: #FF0000;"></i>'; } },
            { "data": "UserId", "visible": false },
            { "data": "IsLocked", "visible": false }
        ]
    };
    var getUsers = function () {
        if (typeof _userTable != 'undefined') { _userTable.destroy(); } // destroy table if exist
        _userTable = $('#userTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsUsers);

        $('#rolesList').change(function () { _userTable.ajax.reload(); });
        $('#role-select-empty').on('click', function () { $('#rolesList').selectpicker('deselectAll');  _userTable.ajax.reload();});

        $('#stateUser').change(function () {
            var etat = $(this).val();
            if (etat == "Lock") { _userTable.columns(9).search('true', true, false).draw(); }
            if (etat == "Unlock") { _userTable.columns(9).search('false', true, false).draw(); }
        });
        $('#state-select-empty').on('click', function () { $('#stateUser').selectpicker('deselectAll'); _userTable.columns(9).search('').draw(); });

        // Add event listener for opening and closing details
        $('#userTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = _userTable.row(tr);
            var rowData = row.data();

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $('#UserProcessing').css('display', 'block');
                $.ajax({
                    url: "Admin/UserDetail", data: { userId: rowData.UserId },
                    success: function (User) {
                        var tmpRoles = []; var tmpStfs = [];
                        row.child(User.vue).show(); tr.addClass('shown');
                        $('.multi-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%', selectedTextFormat: 'count>3', liveSearch: true });
                        $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });

                        $('#_role').selectpicker('val', User._roles); // On coche automatiquelent les roles de l'utilisateur
                        $('#_stf').selectpicker('val', User._stfs);// On coche automatiquelent les stfs de l'utilisateur

                        // Lock - Unlock
                        $('#Btn-state-User').addClass(rowData.IsLocked ? 'fa fa-lock fa-2x text-danger' : 'fa fa-unlock fa-2x text-success');
                        $('#Btn-state-User').on('click', function (e) {
                            $.ajax({
                                url: "Admin/LockUnlockUser",
                                data: { userId: rowData.UserId, },
                                success: function () { _userTable.ajax.reload(); },
                                error: function (e) { alert("Erreur State User " + "\r\n" + e.error); }
                            });
                        });

                        // Stf Pref
                        $('#stfPref').selectpicker('val', User._stfP);
                        $('#stfPrf-select-empty').on('click', function (e) { $('#stfPref').selectpicker('deselectAll'); });

                        // Supp User
                        $('#Btn-Delete-User').on('click', function (e) {
                            if (confirm("OK pour supprimer définitivement cet Utilisateur ?")) {
                                $.ajax({
                                    url: "Admin/DeleteUser",
                                    data: { userId: rowData.UserId, },
                                    success: function () { _userTable.ajax.reload(); },
                                    error: function (e) { alert("Erreur Delete User " + "\r\n" + e.error); }
                                });
                            }
                        });

                        // Mise à jour User
                        $('#Btn-Update-User').on('click', function (e) {
                            $.ajax({
                                url: "Admin/UpdateUser",
                                data: {
                                    rolesUser:  $('#_role').val() == null ? null : $('#_role').val().join('|'),
                                    stfsUser:   $('#_stf').val() == null ? null : $('#_stf').val().join('|'),
                                    userId:     rowData.UserId,
                                    userName:   rowData.UserName,
                                    stfPrf:     $('#stfPref').val() == null ? "0" : $('#stfPref').val()
                                },
                                success: function () { alert('Mise à jour réalisée avec succès...'); row.child.hide(); tr.removeClass('shown'); },
                                error: function (e) { alert("Erreur Update User " + "\r\n" + e.error); }
                            });
                        });
                        $('#UserProcessing').css('display', 'none');
                    },
                    error: function (e) { alert("Erreur Detail User " + "\r\n" + e.error); }
                });
            }
        });
    }

    /* Logs */
    $('input[name="dtLog"]').daterangepicker({ locale: localType, startDate: moment(), endDate: moment(), "showDropdowns": true, "showWeekNumbers": true });
    $('#dtLog').on('apply.daterangepicker', function (ev, picker) { ActualiseAdmin(); });

    $('#logTable').on('processing.dt', function (e, settings, processing) { $('#LogProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsLogs = {
        "dom":              domOptions,
        "processing":       true,
        "deferRender":      true,
        "jQueryUI":         true,
        "order":            [[1, "desc"]],
        "lengthMenu":       [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength":   25,
        "language":         languageOptions,
        "ajax": {
            url: "http://localhost:3000/getLogsUsers",
            data: function (d) { d.dperiode = $('input[name="dtLog"]').val(); }
        },
        "columns": [
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            { "data": "DateLog", "searchable": true, "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "User", "searchable": true, "className": "clsWrap" },
            { "data": "Module", "searchable": true },
            { "data": "Navigateur", "searchable": true }
        ]
    };
    var getLogs = function () {
        if (typeof _logTable != 'undefined') { _logTable.destroy(); } // destroy table if exist
        _logTable = $('#logTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsLogs);

        // Add event listener for opening and closing details
        $('#logTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = _logTable.row(tr);
            var rowData = row.data();

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $('#LogProcessing').css('display', 'block');
                $.ajax({
                    url: "Admin/LogDetail", data: { user: rowData.User },
                    success: function (Cnx) {
                        row.child(Cnx).show(); tr.addClass('shown');
                        $('#LogProcessing').css('display', 'none');
                    },
                    error: function (e) { alert("Erreur Detail Cnx " + "\r\n" + e.error); }
                });
            }
        });
    }


    /* Premier Démarrage */
    getRoles();
});