var sects = ['heal', 'pray', 'sacrifice', 'exp', 'gold', 'hit', 'do_task', 'cancel_task', 'die', 'town', 'heil'];
var phrases = {heal : "Лечись", pray: "Молись", sacrifice : "Жертвуй", exp : "Опыт", gold : "Клад, золото", hit : "Бей",
                do_task : "Задание", cancel_task : "Отмени задание", die : "Умри", town : "Домой", heil : "Восклицания"};
var def;
var curr_sect;
var ImproveInProcess = false;
var god_name = $('div#opt_change_profile div:first div:first').text();
if (god_name != "") localStorage["GM_options:user"] = god_name;
else god_name = localStorage["GM_options:user"];
        
function updateMenu(){
    if (god_name == "") return;
    ImproveInProcess = true;
    if ($('a#ui_options').length == 0){
        $('div#profile_main p:first').append(' | <a id=ui_options href="#">Настройки UI</a>');
        $('a#ui_options').click(function(){
            loadOptions();
            return false;
        });
    }
    ImproveInProcess = false;
}

function loadOptions(){
    ImproveInProcess = true;
    $('div#profile_main').html(getOptionsPage());
    setForm();
    restore_options();
    ImproveInProcess = false;
}

function setForm(){
    for (var i = 0; i < sects.length; i++){
        var t = sects[i];
        var $el = $('a#l_'+t).attr('href', '#');
        addOnClick($el, t);
    }
    var $bt1 = $('form#words').submit(function(){ save_options(1); return false;});
    $('form#words input[type="submit"]').attr('disabled', 'disabled');
    var $bt2 = $('form#add_options').submit(function(){ save_options(2); return false;});
    var $bt3 = $('form#words input[type="button"]').click(function(){ reset_options(1); return false;});
}

function addOnClick($el, text){
    $el.click(function(e){
        setText(text);
        return false;
    });
}
function reset_options(form) {
    ImproveInProcess = true;
    var $elem = $('textarea#ta_edit');
    var text = def['phrases'][curr_sect];
    $elem.attr('rows', text.length);
    $elem.text(text.join("\n"));
    ImproveInProcess = false;
}

function save_options(form) {
    ImproveInProcess = true;
    if (form == 1){
        $('img#gui_word_progress').show();
        var text = $('textarea#ta_edit').val();
        if (text == "") return;
        var t_list = text.split("\n"); var t_out = [];
        for (var i = 0; i < t_list.length; i++){
            if (t_list[i] != '') t_out.push(t_list[i]);
        }
        localStorage["GM_" + god_name + ":phrases_" + curr_sect] = t_out.join("||");
        $('img#gui_word_progress').fadeOut("slow");
        setText(curr_sect);
    }else{
        $('img#gui_options_progress').show();
        localStorage["GM_" + god_name + ":useHeroName"] = $('input#use_hero_name').attr('checked');
        localStorage["GM_" + god_name + ":useHeil"] = $('input#use_heil').attr('checked');
        localStorage["GM_" + god_name + ":useShortPhrases"] = $('input#use_short').attr('checked');
        localStorage["GM_" + god_name + ":useWideScreen"] = $('input#use_wide').attr('checked');
        localStorage["GM_" + god_name + ":useBackground"] = $('input#use_background').attr('checked');
        $('img#gui_options_progress').fadeOut('slow');
    }
    ImproveInProcess = false;
}

function setText(element_name){
    ImproveInProcess = true;
    curr_sect = element_name;
    $('form#words input[type="submit"]').removeAttr('disabled');
    var $e = $('form#words fieldset a');
    $e.css({'text-decoration' : 'underline', 'color' : '#199BDC'});
    $e = $('form#words fieldset a#l_'+element_name);
    $e.css({'text-decoration' : 'none', 'color' : '#DA251D'});
    var $elem = $('textarea#ta_edit');
    var text_list = localStorage["GM_" + god_name + ":phrases_" + element_name];
    var text = (text_list && text_list != "") ? text_list.split("||") : def['phrases'][element_name];
    $elem.attr('rows', text.length);
    $elem.text(text.join("\n"));
//    $('label#ta_name').text(element_name);
    ImproveInProcess = false;
}

function getText(element_name){
    var $elem = $('textarea#' + element_name);
    return $elem.val();
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    def = getWords();
    if (localStorage["GM_" + god_name + ":useHeroName"] == 'true'){
        $('input#use_hero_name').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useHeil"] == 'true'){
       $('input#use_heil').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useShortPhrases"] == 'true'){
       $('input#use_short').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useWideScreen"] == 'true'){
       $('input#use_wide').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useBackground"] == 'true'){
       $('input#use_background').attr('checked', 'checked');
    }
}

updateMenu();
$(document).bind("DOMNodeInserted", function () {
                     if(!ImproveInProcess)
                         setTimeout(updateMenu, 1);
                 });
