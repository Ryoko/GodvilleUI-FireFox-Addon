var $j = jQuery.noConflict();
var sects = ['heal', 'pray', 'sacrifice', 'exp', 'gold', 'hit', 'do_task', 'cancel_task', 'die', 'town', 'heil'];
var phrases = {heal : "Лечись", pray: "Молись", sacrifice : "Жертвуй", exp : "Опыт", gold : "Клад, золото", hit : "Бей",
                do_task : "Задание", cancel_task : "Отмени задание", die : "Умри", town : "Домой", heil : "Восклицания"};
var def;
var curr_sect;
var ImproveInProcess = false;
var god_name = $j('div#opt_change_profile div:first div:first').text();
if (god_name != "") localStorage["GM_options:user"] = god_name;
else god_name = localStorage["GM_options:user"];
        
function updateMenu(){
    if (god_name == "") return;
    ImproveInProcess = true;
    if ($j('a#ui_options').length == 0){
        $j('div#profile_main p:first').append(' | <a id=ui_options href="#">Настройки UI</a>');
        $j('a#ui_options').click(function(){
            loadOptions();
            return false;
        });
    }
    ImproveInProcess = false;
}

function loadOptions(){
    ImproveInProcess = true;
    $j('div#profile_main').html(getOptionsPage());
    setForm();
    restore_options();
    ImproveInProcess = false;
}

function setForm(){
    for (var i = 0; i < sects.length; i++){
        var t = sects[i];
        var $el = $j('a#l_'+t).attr('href', '#');
        addOnClick($el, t);
    }
    var $bt1 = $j('form#words').submit(function(){ save_options(1); return false;});
    $j('form#words input[type="submit"]').attr('disabled', 'disabled');
    var $bt2 = $j('form#add_options').submit(function(){ save_options(2); return false;});
    var $bt3 = $j('form#words input[type="button"]').click(function(){ reset_options(1); return false;});
}

function addOnClick($el, text){
    $el.click(function(e){
        setText(text);
        return false;
    });
}
function reset_options(form) {
    ImproveInProcess = true;
    var $elem = $j('textarea#ta_edit');
    var text = def['phrases'][curr_sect];
    $elem.attr('rows', text.length);
    $elem.text(text.join("\n"));
    ImproveInProcess = false;
}

function save_options(form) {
    ImproveInProcess = true;
    if (form == 1){
        $j('img#gui_word_progress').show();
        var text = $j('textarea#ta_edit').val();
        if (text == "") return;
        var t_list = text.split("\n"); var t_out = [];
        for (var i = 0; i < t_list.length; i++){
            if (t_list[i] != '') t_out.push(t_list[i]);
        }
        localStorage["GM_" + god_name + ":phrases_" + curr_sect] = t_out.join("||");
        $j('img#gui_word_progress').fadeOut("slow");
        setText(curr_sect);
    }else{
        $j('img#gui_options_progress').show();
        localStorage["GM_" + god_name + ":useHeroName"] = $j('input#use_hero_name').attr('checked');
        localStorage["GM_" + god_name + ":useHeil"] = $j('input#use_heil').attr('checked');
        localStorage["GM_" + god_name + ":useShortPhrases"] = $j('input#use_short').attr('checked');
        localStorage["GM_" + god_name + ":useWideScreen"] = $j('input#use_wide').attr('checked');
        localStorage["GM_" + god_name + ":useBackground"] = $j('input#use_background').attr('checked');
        localStorage["GM_" + god_name + ":useRelocateArena"] = $j('input#use_replace_arena').attr('checked');
        $j('img#gui_options_progress').fadeOut('slow');
    }
    ImproveInProcess = false;
}

function setText(element_name){
    ImproveInProcess = true;
    curr_sect = element_name;
    $j('form#words input[type="submit"]').removeAttr('disabled');
    var $e = $j('form#words fieldset a');
    $e.css({'text-decoration' : 'underline', 'color' : '#199BDC'});
    $e = $j('form#words fieldset a#l_'+element_name);
    $e.css({'text-decoration' : 'none', 'color' : '#DA251D'});
    var $elem = $j('textarea#ta_edit');
    var text_list = localStorage["GM_" + god_name + ":phrases_" + element_name];
    var text = (text_list && text_list != "") ? text_list.split("||") : def['phrases'][element_name];
    $elem.attr('rows', text.length);
    $elem.text(text.join("\n"));
//    $j('label#ta_name').text(element_name);
    ImproveInProcess = false;
}

function getText(element_name){
    var $elem = $j('textarea#' + element_name);
    return $elem.val();
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    def = getWords();
    if (localStorage["GM_" + god_name + ":useHeroName"] == 'true'){
        $j('input#use_hero_name').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useHeil"] == 'true'){
       $j('input#use_heil').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useShortPhrases"] == 'true'){
       $j('input#use_short').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useWideScreen"] == 'true'){
       $j('input#use_wide').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useBackground"] == 'true'){
       $j('input#use_background').attr('checked', 'checked');
    }
    if (localStorage["GM_" + god_name + ":useRelocateArena"] == 'true'){
       $j('input#use_replace_arena').attr('checked', 'checked');
    }
}

updateMenu();
$j(document).bind("DOMNodeInserted", function () {
                     if(!ImproveInProcess)
                         setTimeout(updateMenu, 1);
                 });
