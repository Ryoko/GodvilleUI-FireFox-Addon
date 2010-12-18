function getOptionsPage(){
return '\
<p><a href="#" onclick="Element.show(\'spinner_prof\'); new Ajax.Request(\'/user/update_data?type=settings\', {asynchronous:true, evalScripts:true, onComplete:function(request){Element.hide(\'spinner_prof\')}}); return false;">Настройки</a> | <a href="#" onclick="Element.show(\'spinner_prof\'); new Ajax.Request(\'/user/update_data?type=informers\', {asynchronous:true, evalScripts:true, onComplete:function(request){Element.hide(\'spinner_prof\')}}); return false;">Информеры</a> | <a href="#" onclick="Element.show(\'spinner_prof\'); new Ajax.Request(\'/user/update_data?type=gadgets\', {asynchronous:true, evalScripts:true, onComplete:function(request){Element.hide(\'spinner_prof\')}}); return false;">Гаджеты и плагины</a> | <a href="#" onclick="Element.show(\'spinner_prof\'); new Ajax.Request(\'/user/update_data?type=invites\', {asynchronous:true, evalScripts:true, onComplete:function(request){Element.hide(\'spinner_prof\')}}); return false;">Приглашения</a> | <a href="/user/profile/plogs">Подзарядки</a> | Настройки UI</p>\
    <div id="pant_spn">\
  <img align="middle" alt="Spinner" border="0" id="spinner_prof" src="/images/spinner.gif?1277083719" style="vertical-align: bottom; display: none; ">\
</div>\
    <div>\
        <div id="central_block_my_page" style="width: 36%;">\
        <div id="profile_forms">\
            <div id="godvilleUI_options" style="padding-top: 4em;">\
                <form id="add_options">\
                    <fieldset>\
                        <legend>GodvilleUI настройки</legend>\
                        <div id="add_general">\
                            <div class="new_line">\
                                <span class="l_capt">Добавлять в глас имя героя</span>\
                                <div class="field_content">\
                                    <input id="use_hero_name" name="use_hero_name" type="checkbox">\
                                </div>\
                            </div>\
                            <div class="new_line">\
                                <span class="l_capt">Добавлять в глас восклицания</span>\
                                <div class="field_content">\
                                    <input id="use_heil" name="use_heil" type="checkbox">\
                                </div>\
                            </div>\
                            <div class="new_line">\
                                <span class="l_capt">Короткие фразы для гласов</span>\
                                <div class="field_content">\
                                    <input id="use_short" name="use_short" type="checkbox">\
                                </div>\
                            </div>\
                            <div class="new_line"><span class="l_capt">Широкое окно</span>\
                                <div class="field_content">\
                                    <input id="use_wide" name="use_wide" type="checkbox">\
                                </div>\
                            </div>\
                            <div class="new_line"><span class="l_capt">Включить фон</span>\
                                <div class="field_content">\
                                    <input id="use_background" name="use_background" type="checkbox">\
                                </div>\
                            </div>\
                            <div class="new_line"><span class="l_capt">Переместить "Отправить на арену"</span>\
                                <div class="field_content">\
                                    <input id="use_replace_arena" name="use_replace_arena" type="checkbox">\
                                </div>\
                            </div>\
                            <div class="new_line">\
                                <div id="options_GodvilleUI_general"><input class="input_btn" type="submit"\
                                                                            id="GodvilleUI_general"\
                                                                            name="GodvilleUI_general" value="Применить">\
                                </div>\
                            </div>\
                            <img align="middle" alt="Spinner" border="0" id="gui_options_progress"\
                                 src="/images/spinner.gif" style="vertical-align:bottom; display: none;"></div>\
                    </fieldset>\
                </form>\
            </div>\
            <div id="godvilleUI_words" style="padding-top: 4em;">\
                <form id="words">\
                    <fieldset>\
                        <legend>Гласы</legend>\
                        <a id="l_heal" href="#">Лечись</a> <a id="l_pray" href="#">Молись</a> <a id="l_sacrifice"\
                                                                                                 href="#">Жертвуй</a> <a\
                            id="l_exp" href="#">Опыт</a> <a id="l_gold" href="#">Клад</a> <a id="l_hit" href="#">Бей</a>\
                        <a id="l_do_task" href="#">Задание</a> <a id="l_cancel_task" href="#">Отменить задание</a> <a\
                            id="l_die" href="#">Умри</a> <a id="l_town" href="#">В город</a> <a id="l_heil" href="#">Восклицание</a>\
                        <div id="opt_change_words">\
                            <div class="new_line"><label id="ta_name" class="l_capt"></label> <textarea id="ta_edit"\
                                                                                                        name="heal"\
                                                                                                        class="rounded_field"\
                                                                                                        rows="4"\
                                                                                                        wrap="virtual;"\
                                                                                                        style="width: 100%;"></textarea>\
                            </div>\
                        </div>\
                        <div class="new_line">\
                            <div id="heal_words"><input id="submit2" class="input_btn" name="commit" type="submit"\
                                                        value="Сохранить" disabled=""> <input id="cancel2"\
                                                                                              class="input_btn"\
                                                                                              name="cancel"\
                                                                                              type="button"\
                                                                                              value="Восстановить по умолчанию">\
                                <img align="middle" alt="Spinner" border="0" id="gui_word_progress"\
                                     src="/images/spinner.gif" style="vertical-align:bottom; display: none;"></div>\
                        </div>\
                    </fieldset>\
                </form>\
            </div>\
        </div>\
    </div>\
    </div>';
}