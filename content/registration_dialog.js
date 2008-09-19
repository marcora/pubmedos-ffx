function on_load(){
    $('#username_input').val(window.arguments[0].inn.username);
}

function validate_required(field_id, alert_text) {
    var $field = $('#'+field_id);
    var condition = $field.val();
    if (condition) {
        return true;
    } else {
        alert_text = alert_text || $field.attr('id') + ' is a required field'
        alert(alert_text);
        $field.focus();
        return false;
    }
}

function validate_checked(field_id, alert_text) {
    var $field = $('#'+field_id); // document.getElementById(field_id); //
    var condition = ($field.attr('checked') == true.toString());
    if (condition) {
        return true;
    } else {
        alert_text = alert_text || $field.attr('id') + ' field needs to be checked'
        alert(alert_text);
        $field.focus();
        return false;
    }
}

function validate_format_email(field_id, alert_text) {
    var $field = $('#'+field_id);
    var apos = $field.val().indexOf("@");
    var dotpos = $field.val().lastIndexOf(".");
    var condition = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($field.val());
    if (condition) {
        return true;
    } else {
        alert_text = alert_text || $field.attr('id') + ' is not a valid email address'
        alert(alert_text);
        $field.focus();
        return false;
    }
}

function validate_match(field1_id, field2_id, alert_text) {
    var $field1 = $('#'+field1_id);
    var $field2 = $('#'+field2_id);
    var condition = ($field1.val() == $field2.val());
    if (condition) {
        return true;
    } else {
        alert_text = alert_text || $field1.attr('id') + ' and ' + $field1.attr('id') + ' fields do not match'
        alert(alert_text);
        $field1.focus();
        return false;
    }
}

function form_is_valid(){
    var is_valid = false;
    if ( validate_required('password_input') &&
         validate_required('password_confirm_input') &&
         validate_required('email_input') &&
         validate_required('email_confirm_input') &&
         validate_required('last_name_input') &&
         validate_required('first_name_input') &&
         validate_format_email('email_input') &&
         validate_format_email('email_confirm_input')
       )
    { is_valid = true }
    return is_valid;
}

function on_dialog_accept(){
    if (form_is_valid()) {
        window.arguments[0].out = {
            'password': $('#password_input').val(),
            'email': $('#email_input').val(),
//            'salutation': $('#salutation').val(),
            'last_name': $('#last_name_input').val(),
            'first_name': $('#first_name_input').val(),
            'middle_name': $('#middle_name_input').val(),
//            'suffix': $('#suffix').val(),
            'affiliation': $('#affiliation_input').val(),
        };
        return true;
    } else { return false; }
}
