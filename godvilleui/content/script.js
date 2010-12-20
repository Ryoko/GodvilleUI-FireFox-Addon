var $j = jQuery.noConflict();

var ui_data = {
    developers : ['Neniu', 'Ryoko', 'Опытный Кролик'],
//    god_name : "",
//    char_name : "",
//    isArena : false,
    init : function(){
        this.isArena = ($j('#arena_block').length > 0);
        if(this.isArena){
            this.god_name = $j.trim($j('div#hero1_info fieldset div div a[href*="/gods/"]').text());
            this.char_name = $j.trim($j('div#hero1_info fieldset div:eq(0) div').text());
        }else{
            var $user = $j('div#hi_box div a[href^="/gods/"]');
            this.god_name = decodeURI($user.attr('href').replace('/gods/', ''));
            this.char_name = $j.trim($user.text());
        }
    }
};

// ------------------------
//      HELPERS
// ------------------------
// Dump
var ui_utils = {
    is_developer : function () {
        return ui_data.developers.indexOf(ui_data.god_name) >= 0;
    },
// Базовый алгоритм произнесения фразы
    sayToHero: function(phrase) {
	    $j('#aog_hint_label').hide();
	    $j('#god_phrase').val(phrase);
    },
// Checks if $elem already improved
    isAlreadyImproved: function($elem) {
	    if ($elem.hasClass('improved')) return true;
	    $elem.addClass('improved');
	    return false
    },

    findLabel:function($base_elem, label_name) {
	    return $j('.l_capt', $base_elem).filter(function(index){
			return $j(this).text() == label_name;
		});
    },
// Search for label with given name and appends after it
// given elem
    addAfterLabel: function($base_elem, label_name, $elem) {
	    ui_utils.findLabel($base_elem, label_name).after($elem.addClass('label-appended'));
    },
// Generic say button
    getGenSayButton: function(title, section) {
	    return $j('<a href="#">' + title + '</a>').click(function() {
			    ui_utils.sayToHero(ui_words.longPhrase(section));
			    return false;
		    });
    },
// Хелпер объединяет addAfterLabel и getGenSayButton
// + берет фразы из words['phrases']
    addSayPhraseAfterLabel: function($base_elem, label_name, btn_name, section) {
	    ui_utils.addAfterLabel($base_elem, label_name, ui_utils.getGenSayButton(btn_name, section));
    },

// Случайный индекс в массиве
    getRandomIndex: function(arr) {
	    return Math.floor ( Math.random() * arr.length );
    },
// Случайный элемент массива
    getRandomItem: function(arr) {
	    return arr[ui_utils.getRandomIndex(arr)];
    },
// Вытаскивает случайный элемент из массива
    popRandomItem: function(arr) {
	    var ind = ui_utils.getRandomIndex(arr);
	    var res = arr[ind];
	    arr.splice(ind, 1);
	    return res;
    }
};

// ------------------------
// Timeout bar
// -----------------------
// timeout_bar.create -- создать объект
// ui_timeout_bar.start([seconds]) -- пустить полоску
var ui_timeout_bar = {
	create: function() {
		this.elem = $j('<div id="timeout_bar"/>');
		$j('#menu_bar').after(this.elem);
	},

	start: function(timeout) {
		timeout = timeout || 30;
		this.elem.stop();
		this.elem.css('width', '100%');
		this.elem.animate({width: 0}, timeout * 1000, 'linear');
	}
};
// ------------------------
// UI Menu
// ------------------------
var ui_menu_bar = {
	reformalLink: $j('<a id="reformal" href="http://godville-ui.reformal.ru/" target="about:blank">есть идеи?</a>'),

	create: function() {
		$j('#menu_bar').after(this.constructMenuBar());
		$j('#menu_bar ul').append( $j('<li> | </li>').append(this.getToggleButton()));
	},
	append: function($obj) {
		this.items.append( $j('<li></li>').append($obj));
	},
	toggle: function() {
		this.bar.toggle();
		ui_storage.set('ui_menu_visible', this.bar.is(':visible'));
	},
	show: function() {
		this.bar.show();
	},
	constructMenuBar: function() {
		this.items = $j('<ul></ul>');
		this.bar = $j('<div id="ui_menu_bar"></div>').append(this.items);
		this.bar.toggle(ui_storage.get('ui_menu_visible') == 'true' || false);
		//append basic elems
        ///TODO: auto change version number
		this.append($j('<strong>Godville UI (v.0.2.11):</strong>'));
		this.append(this.reformalLink);
		if (ui_utils.is_developer()) {
			this.append(this.getDumpButton());
		}
		return this.bar;
	},

	getToggleButton: function() {
		return $j('<a href="#"><strong>ui</strong></a>')
			.click(function() {
					   ui_menu_bar.toggle();
					   return false;
				   });
	},
	getDumpButton: function() {
		return $j('<a href="#" class="devel_link">dump</a>')
			.click(function() {
					   ui_storage.dump();
				   });
	}
};

// -----------------------
// Storage wrapper
// -----------------------
// storage.set -- store value
// storage.get -- read value
// storage.set_with_diff -- store value and get diff with old
var ui_storage = {
	_get_key: function(key) {
		return "GM_" + ui_data.god_name + ':' + key;
	},
	set: function(id, value) {
		localStorage.setItem(this._get_key(id), value);
		return value;
	},
	get: function(id) {
        var val = localStorage.getItem(this._get_key(id));
        if (val) val = val.replace(/^[NSB]\]/, '');
        return val;
	},
	diff: function(id, value) {
		var diff = null;
		var old = this.get(id);
		if (old != null) {
			diff = value - old;
		}
		return diff;
	},
	set_with_diff: function(id, value) {
		var diff = this.diff(id, value);
		this.set(id, value);
		return diff;
	},
	dump: function() {
		var lines = new Array;
        var r = new RegExp('^GM_'+ui_data.god_name+':|GM_options');
        for(var i = 0; i < localStorage.length(); i++){
            if (!localStorage.key(i).match(r)) continue;
			lines.push(localStorage.key(i) + " = " + localStorage[localStorage.key(i)]);
		}
		GM_log("Storage:\n" + lines.join("\n"));
	},
    clearStorage: function(){
        this.set('isStorage', 1);
        if (this.get('clean161210') != 'true'){
            try{
                var idx_lst = [];
                var r = new RegExp('(^GM_:)|(^GM_.{5,40}'+ui_data.god_name+'[!?\\.]?:)');
                for(var i = 0; i < localStorage.length(); i++){
                    var key = localStorage.key(i);
                    if (key.match(r)) idx_lst.push(key);
                 }
                for(key in idx_lst){
                    localStorage.removeItem(idx_lst[key]);
                }
                this.set('clean161210', true);
            }
            catch(err){
                GM_log(err);
            }
        }
    }
};

var ui_words = {
    currentPhrase: "",
	init: function() {
        this.base = getWords();
        var sects = ['heal', 'pray', 'sacrifice', 'exp', 'gold', 'hit', 'do_task', 'cancel_task', 'die', 'town', 'heil'];
        for (var i = 0; i < sects.length; i++){
            var t = sects[i];
            var text = ui_storage.get('phrases_' + t);
//            var text_list = ui_data.god_name (this.response) ? this.response['phrases'][t] : [];
            if (text && text != ""){
                this.base['phrases'][t] = text.split("||");
            }
         }
	},
	// Phrase gen
    randomPhrase: function(sect) {
        return ui_utils.getRandomItem(this.base['phrases'][sect]);
    },

    longPhrase: function(sect, len) {
        var prefix = this._addHeroName(this._addHeil(''));
        var phrases;
        if (ui_storage.get('useShortPhrases') == "true") {
            phrases = [ui_utils.getRandomItem(this.base['phrases'][sect])];
        }else{
            phrases = this._longPhrase_recursion(this.base['phrases'][sect].slice(), (len || 78) - prefix.length);
        }
        this.currentPhrase = prefix ? prefix + this._changeFirstLetter(phrases.join(' ')) : phrases.join(' ');
        return this.currentPhrase;
    },

    inspectPhrase: function(item_name) {
        this.currentPhrase = this.getPhrasePrefixed(this.randomPhrase('inspect_prefix') + ' "' + item_name + '"!');
		return this.currentPhrase;
	},

	// Checkers
	isCategoryItem: function(cat, item_name) {
		return this.base['items'][cat].indexOf(item_name) >= 0;
	},

	canBeActivated: function($obj) {
		return $obj.text().match(/\(@\)/);
	},

    _changeFirstLetter: function(text){
        return text.charAt(0).toLowerCase() + text.slice(1);
    },

    getPhrasePrefixed: function(text){
        if (text == "") return "";
        return this._addHeroName(this._addHeil(text));
    },

    _addHeroName: function(text){
        if ((ui_storage.get('useHeroName') != 'true')) return text;
        return ui_data.char_name + ', ' + this._changeFirstLetter(text);
    },

    _addHeil: function(text){
        if ((ui_storage.get('useHeil') != 'true')) return text;
        return ui_utils.getRandomItem(this.base['phrases']['heil']) + ', ' + this._changeFirstLetter(text);
    },

	// Private (или типа того)
	_longPhrase_recursion: function(source, len) {
		while (source.length) {
			var next = ui_utils.popRandomItem(source);
			var remainder = len - next.length - 2; // 2 for ', '
			if ( remainder > 0) {
                return [next].concat(this._longPhrase_recursion(source, remainder));
			}
		}
		return [];
	},
    checkCurrentPhrase: function(){
        if ($j('#god_phrase').val() == "" && this.currentPhrase != ""){
            $j('#aog_hint_label').hide();
	        $j('#god_phrase').val(this.currentPhrase);
        }
    }
};

// ------------------------
// Stats storage
// ------------------------
var ui_stats = {
	get: function(key) {
		return ui_storage.get('stats_' + key);
	},
	set: function(key, value) {
		return ui_storage.set('stats_' + key, value);
	},
	setFromProgressBar: function(id, $elem) {
		var value = $elem.attr('title').replace(/%/, '');
		// Workaround for bug with decreasing 'exp'
		var old_value = this.get(id);
		if (old_value) {
			var diff = value - old_value;
			if (diff < 0 && diff > -1)
				return old_value;
		}
		return this.set(id, value);
	},
	setFromLabelCounter: function(id, $container, label, parser) {
		parser = parser || parseInt;
		var $label = ui_utils.findLabel($container, label);
		var $field = $label.siblings('.field_content');
		var value = parser($field.text());

		return this.set(id, value);
	},
	setFromEquipCounter: function(id, $container, label) {
		var $label = ui_utils.findLabel($container, label);
		var $field = $label.next('.equip_content');
		var value = $field.text().replace(/.*([+-][0-9]+)/, "$1");

		return this.set(id, parseInt(value));
	}
};

// ------------------------
// Oneline logger
// ------------------------
// ui_logger.create -- создать объект
// ui_logger.appendStr -- добавить строчку в конец лога
// ui_logger.needSepratorHere -- перед первой же следующей записью вставится разделитель
// ui_logger.watchProgressBar -- следить за полоской
// ui_logger.watchLabelCounter -- следить за значением лабела
var ui_logger = {
	create: function() {
		this.elem = $j('<ul id="stats_log"/>');
		$j('#menu_bar').after(this.elem);
	},

	appendStr: function(id, klass, str, descr) {
		// append separator if needed
		if (this.need_separator) {
			this.need_separator = false;
			if (this.elem.children().length > 0) {
				this.elem.append('<li class="separator">|</li>');
			}
		}
		// apend string
		this.elem.append('<li class="' + klass + '" title="' + descr + '">' + str + '</li>');
		this.elem.scrollLeft(10000000); //Dirty fix
	},

	watchStatsValue: function(id, name, descr, klass) {
		klass = klass || id;
		var diff = ui_storage.set_with_diff('logger_param_' + id, ui_stats.get(id));
		if(diff) {
			// Округление и добавление плюсика
			diff = Math.round(diff * 1000) / 1000;
			var s = (diff < 0)? diff : '+' + diff;

			this.appendStr(id, klass, name  + s, descr);
		}
	},

	update: function() {
		this.need_separator = true;
        if (ui_improver.isArena){
            this.watchStatsValue('heal1', 'hero:hp', 'Здоровье героя', 'heal');
            this.watchStatsValue('heal2', 'enemy:hp', 'Здоровье соперника', 'death');
        }
		this.watchStatsValue('prana', 'pr', 'Прана (проценты)');
		this.watchStatsValue('exp', 'exp', 'Опыт (проценты)');
		this.watchStatsValue('task', 'tsk', 'Задание (проценты)');
		this.watchStatsValue('level', 'lvl', 'Уровень');
		this.watchStatsValue('inv', 'inv', 'Инвентарь');
		this.watchStatsValue('heal', 'hp', 'Здоровье');
		this.watchStatsValue('gold', 'gld', 'Золото');
		this.watchStatsValue('monster', 'mns', 'Монстры');
 		this.watchStatsValue('death', 'death', 'Смерти');
 		this.watchStatsValue('brick', 'br', 'Кирпичи');
		this.watchStatsValue('equip1', 'eq1', 'Оружие', 'equip');
		this.watchStatsValue('equip2', 'eq2', 'Щит', 'equip');
		this.watchStatsValue('equip3', 'eq3', 'Голова', 'equip');
		this.watchStatsValue('equip4', 'eq4', 'Тело', 'equip');
		this.watchStatsValue('equip5', 'eq5', 'Руки', 'equip');
		this.watchStatsValue('equip6', 'eq6', 'Ноги', 'equip');
		this.watchStatsValue('equip7', 'eq7', 'Талисман', 'equip');
	}
};

// ------------------------------------
// Информаер для важной информации
// * мигает заголовком
// * показывает попапы
// ------------------------------------
var ui_informer = {
	flags: {},
	init: function() {
		// container
		this.container = $j('<div id="informer_bar"></div>');
		$j('#page_wrapper').prepend(this.container);

		// load and draw labels
		this.load();
		for (var flag in this.flags) {
			if (this.flags[flag])
				this.create_label(flag);
		}

		// run flicker
		this.tick();
	},
	// устанавливает или удаляет флаг
	update: function(flag, value) {
		if (value) {
			if (!(flag in this.flags)) {
				this.flags[flag] = true;
				this.create_label(flag);
				this.save();
			}
		} else {
			if (flag in this.flags) {
				delete this.flags[flag];
				this.delete_label(flag);
				this.save();
			}
		}
		if (!this.tref)
			this.tick();
	},
	// убирает оповещение о событии
	hide: function(flag) {
		this.flags[flag] = false;
		this.delete_label(flag);
		this.save();
	},
	// PRIVATE
	load: function() {
        var fl = ui_storage.get('informer_flags');
        if (!fl || fl == "") fl = '{}';
		this.flags = JSON.parse(fl);
	},
	save: function() {
		ui_storage.set('informer_flags', JSON.stringify(this.flags));
	},
	create_label: function(flag) {
		var $label = $j('<div>' + flag + '</div>')
			.click(function() {
					   ui_informer.hide(flag);
					   return false;
				   });
		this.container.append($label);
	},
	delete_label: function(flag) {
		$j('div', this.container)
			.each(function() {
					  var $this = $j(this);
					  if($this.text() == flag) {
						  $this.remove();
					  }
				  });
	},
	tick: function() {
		// пройти по всем флагам и выбрать те, которые надо показывать
		var to_show = [];
		for (var flag in this.flags) {
			if (this.flags[flag])
				to_show.push(flag);
		}
		to_show.sort();

		// если есть чё, показать или вернуть стандартный заголовок
		if (to_show.length > 0) {
			this.update_title(to_show);
			this.tref = setTimeout( function(){ui_informer.tick.call(ui_informer);}, 700);
		} else {
			this.clear_title();
			this.tref = undefined;
		}
	},

	clear_title: function() {
		document.title = 'gv: ' + ui_data.god_name;
	},
	update_title: function(arr) {
		this.odd_tick = ! this.odd_tick;

		var sep = (this.odd_tick? '...' : '!!!');
		var msg = sep + ' ' + arr.join('! ') + ' ' + sep;
		document.title = msg;
	}
};

// -------------- Phrases ---------------------------

var ui_arena = {
    isArena : function() {
        return $j('#arena_block').length > 0;
    },

    appendCheckbox : function($div, id, label) {
        $div.append('<input type="checkbox" id="' + id +  '" >');
        $div.append('<label for="' + id + '">' + label + '</label>');
    },
    generateArenaPhrase : function() {
        var parts = [];
        var keys = ['hit', 'heal', 'pray'];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if ($j('#say_' + key).is(':checked')) {
                parts.push(ui_words.randomPhrase(key));
            }
        }
        parts = ui_arena.shuffleArray(parts);
        var msg = ui_words.getPhrasePrefixed(ui_arena.smartJoin(parts));
        if(msg.length < 80) {
            return msg;
        } else {
            return ui_arena.generateArenaPhrase();
        }
    },

    shuffleArray : function(phrases){
        var out = [];
        while (phrases.length > 0){
            out.push(ui_utils.popRandomItem(phrases));
        }
        return out;
    },

    smartJoin : function(parts){
        var out = "";
        var trim_last = /[\.!]$/;
        for (var i = 0; i < parts.length; i++){
            out += (i == 0)? "" : (i != parts.length - 1) ? ", " : " и ";
            var p = (i != 0) ? ui_words._changeFirstLetter(parts[i]) : parts[i];
            out += (i != parts.length - 1) ? p.replace(trim_last, "") : p;
        }
        return out;
    },

    getArenaSayBox : function() {
        // TODO: стиль для бокса, чтобы он был по центру
        var $div = $j('<div id="arena_say_box"></div>');

        ui_arena.appendCheckbox($div, 'say_hit', 'бей');
        ui_arena.appendCheckbox($div, 'say_heal', 'лечись');
        ui_arena.appendCheckbox($div, 'say_pray', 'молись');

        $div.click(function() { ui_utils.sayToHero(ui_arena.generateArenaPhrase());});
        return $div;
    }
};

// ------------------------------------
//  Improvements !!
// ------------------------------------

// -------- Hero Loot -----------------

// Main button creater
var ui_improver = {
    isArena : false,
    improve: function(){
        var t_beg = new Date();
        ui_improver.ImproveInProcess = true;
        try {
            ui_improver.isArena = $j('#arena_block').length > 0;
            ui_informer.update('pvp', ui_improver.isArena);
            if (!ui_storage.get('isStorage')) throw('No users data!');
            ui_improver.improveInterface();
            ui_improver.improveLoot();
            ui_improver.improveSayDialog();
            ui_improver.improveStats();
            ui_improver.improveFieldBox();
            ui_improver.improveEquip();
            ui_improver.improveMailbox();
            ui_improver.improvePanteons();
            ui_words.checkCurrentPhrase();
        } catch (x) {
            GM_log(x);
        } finally {
            ui_improver.ImproveInProcess = false;
            var t_end = new Date();
//            GM_log('Time of page improving = ' + (t_end.getTime() - t_beg.getTime()) + ' msec.');
        }
    },

    _createInspectButton : function(item_name) {
        return $j('<a href="#">?</a>')
            .click(function(){
                ui_utils.sayToHero(ui_words.inspectPhrase(item_name));
                return false;
            });
    },

    improveLoot : function() {
        if (this.isArena) return;
        if (ui_utils.isAlreadyImproved($j('#inv_box'))) return;

        var good_box = false;
        var black_box = false;
        var transformer = false;
        var bold_item = false;

        // Parse items
        $j('#hero_loot ul li').each(function(ind, obj) {
            var $obj = $j(obj);
            var item_name = $j('span', $obj).text()
                                           .replace(/\(@\)/, '')
                                           .replace(/\(\d+ шт\)/, '')
                                           .replace(/^\s+|\s+$/g, '');
            // color items, and add buttons
            if (ui_words.isCategoryItem('heal', item_name)) {
                $obj.css('color', 'green');
            } else if (ui_words.isCategoryItem('black box', item_name)) {
                black_box = true;
            } else if (ui_words.isCategoryItem('good box', item_name)) {
                good_box = true;
            } else if (ui_words.isCategoryItem('transformer', item_name)) {
                transformer = true;
            } else if (ui_words.canBeActivated($obj)) {
                // Ничего не делать -- остальные активируемые вещи
            } else {
                $obj.append(ui_improver._createInspectButton(item_name));

                if($j('b', $obj).length > 0) {
                    bold_item = true;
                }
            }
        });

        ui_informer.update('black box', black_box);
        ui_informer.update('good box', good_box);
        if (bold_item) {
            ui_informer.update('transform!', transformer);
            ui_informer.update('transformer', false);
        } else {
            ui_informer.update('transformer', transformer);
        }
    },

    improveSayDialog : function() {
        if (ui_utils.isAlreadyImproved( $j('#aog_box') )) return;

        // Hide hint
        $j('#aog_hint_label').hide();

        // Add links
        var $box = $j('#hero_actsofgod');

        if (this.isArena) {
            $j('#god_phrase_form').before(ui_arena.getArenaSayBox());
        } else {
            ui_utils.addSayPhraseAfterLabel($box, 'Прана', 'жертва', 'sacrifice');
            ui_utils.addSayPhraseAfterLabel($box, 'Прана', 'ещё', 'pray');

            // Show timeout bar after saying
            $j('#god_phrase_btn').click(function () {ui_timeout_bar.start(); ui_words.currentPhrase=""; return true;});
        }

        // Save stats
        var prana = ui_stats.setFromLabelCounter('prana', $box, 'Прана');

        ui_informer.update('pr = 100', prana == 100);
    },

// ----------- Вести с полей ----------------
    improveFieldBox : function() {
        if (this.isArena) return;
        if (ui_utils.isAlreadyImproved( $j('#hero_details fieldset') )) return;

        // Add links
        var $box = $j('#hero_details');

        ui_utils.addSayPhraseAfterLabel($box, 'Противник', 'бей', 'hit');
    },

// ---------- Stats --------------

    improveStats : function() {
        if (this.isArena) {
            ui_stats.setFromLabelCounter('heal1', $j('#hero1_stats'), 'Здоровье');
            ui_stats.setFromLabelCounter('heal2', $j('#hero2_stats'), 'Здоровье');
            return;
        }
        if (ui_utils.isAlreadyImproved( $j('#hs_box') )) return;

        // Add links
        var $box = $j('#hero_stats');

        ui_utils.addSayPhraseAfterLabel($box, 'Уровень', 'ещё', 'exp');
        ui_utils.addSayPhraseAfterLabel($box, 'Здоровье', 'ещё', 'heal');
        ui_utils.addSayPhraseAfterLabel($box, 'Золота', 'клад', 'gold');
        //ui_utils.addSayPhraseAfterLabel($box, 'Задание', 'отмена', 'cancel_task');
        ui_utils.addSayPhraseAfterLabel($box, 'Задание', 'ещё', 'do_task');
        //ui_utils.addSayPhraseAfterLabel($box, 'Смертей', 'ещё', 'die');
        ui_utils.addSayPhraseAfterLabel($box, 'Столбов от столицы', 'дом', 'town');

        // Save stats
        // Парсер строки с золотом
        var gold_parser = function(val) {
            return parseInt(val.replace(/[^0-9]/g, '')) || 0;
        };

        ui_stats.setFromProgressBar('exp', $j('#bar_pr3'));
        ui_stats.setFromProgressBar('task', $j('#bar_pr4'));
        ui_stats.setFromLabelCounter('level', $box, 'Уровень');
        ui_stats.setFromLabelCounter('inv', $box, 'Инвентарь');
        var heal  = ui_stats.setFromLabelCounter('heal', $box, 'Здоровье');
        var gld   = ui_stats.setFromLabelCounter('gold', $box, 'Золота', gold_parser);
        ui_stats.setFromLabelCounter('monster', $box, 'Убито монстров');
        ui_stats.setFromLabelCounter('death', $box, 'Смертей');
        ui_stats.setFromLabelCounter('brick', $box, 'Кирпичей для храма', parseFloat);

        ui_informer.update('gld > 3k', gld >= 3000);
        ui_informer.update('dead', heal == 0);
    },

// ---------- Equipment --------------

    improveEquip : function() {
        if (this.isArena) return;
        if (ui_utils.isAlreadyImproved( $j('#equipment_box') )) return;

        // Save stats
        var $box = $j('#equipment_box');

        ui_stats.setFromEquipCounter('equip1', $box, 'Оружие');
        ui_stats.setFromEquipCounter('equip2', $box, 'Щит');
        ui_stats.setFromEquipCounter('equip3', $box, 'Голова');
        ui_stats.setFromEquipCounter('equip4', $box, 'Тело');
        ui_stats.setFromEquipCounter('equip5', $box, 'Руки');
        ui_stats.setFromEquipCounter('equip6', $box, 'Ноги');
        ui_stats.setFromEquipCounter('equip7', $box, 'Талисман');
    },

// -------------- Переписка ---------------------------

    improveMailbox : function() {
        if (this.isArena) return;
        if (ui_utils.isAlreadyImproved( $j('#recent_friends') )) return;
        // Ссылки на информацию о боге по средней кнопке мыши
        $j('#recent_friends .new_line a')
            .each(function(ind, obj) {
                      if (obj.innerHTML == 'показать всех знакомых'
                          || obj.innerHTML.substring(0, 20) == 'скрыть всех знакомых') {
                          return;
                      }
                      obj.href = "http://godville.net/gods/"+obj.innerHTML;
                  });

    },

    improvePanteons : function(){
        if (this.isArena) return;
        var $low_to_arena = $j('#aog_box #to_arena_link');
        var $hi_to_arena = $j('#pantheon_box #hi_to_arena_link');
        var $box = $j('#hero_pantheon');
        if (ui_storage.get('useRelocateArena') == 'true'){
            if ($hi_to_arena.length == 0 && $low_to_arena.length > 0){
                $hi_to_arena = $j('<span id="hi_to_arena_link"></span>');
                ui_utils.addAfterLabel($box, ' Гладиаторства', $hi_to_arena);
                $hi_to_arena = $j('#hi_to_arena_link');
            }
            if($low_to_arena.length > 0){
                $hi_to_arena.html($low_to_arena.html());
                if ($j('a', $hi_to_arena).length > 0) $j('a', $hi_to_arena).text('Арена');
                else $hi_to_arena.text('Арена');
                $low_to_arena.hide();
                $hi_to_arena.show();
            }else{
                $hi_to_arena.hide();
            }
        }else{
            if ($low_to_arena.length == 0 && $hi_to_arena.length > 0){
                $j('<div><span id="to_arena_link"></span></div>').insertAfter($j('#punish_link'));
                $low_to_arena = $j('#to_arena_link');
                $low_to_arena.html($hi_to_arena.html());
                if ($j('a', $low_to_arena).length > 0) $j('a', $low_to_arena).text('Отправить на арену');
                else $low_to_arena.text('Отправить на арену');
            }
            $hi_to_arena.hide();
            $low_to_arena.show();
        }

        if ($j('#guild_stat').length > 0 ) return;
        var guild = $j('#hi_box div div i a[href^="http://wiki.godville.net/index.php/"]').text();
        if (guild){
            var $gstat = $j('<span id="guild_stat"><a href="http://thedragons.ru/clans/' + encodeURI(guild) + '" onclick="window.open(this.href);return false;" title="Статистика по гильдии">стат.</a></span>');
            ui_utils.addAfterLabel($box, ' Солидарности', $gstat);
        }
    },

    improveInterface : function(){

        var $pw = $j('div#page_wrapper');
        var $c = $j('div#acc_box div:eq(0)');
        if (ui_storage.get('useWideScreen') == 'true' && $j('body').width() > 1244) {
    //        if ($pw.css('width') == '80%') return;
            $pw.css('width', '80%');
            var wdt = Math.floor(($c.width() - 48) / 6);
            wdt = (wdt - Math.floor(wdt / 2) * 2) == 0 ? wdt - 1 : wdt;
            var wd1 = Math.floor((wdt - 7) / 2);
            var wd2 = Math.floor((wdt - 21) / 4);
            $j('div.field_content:eq(0) span div[class^="acc_"]', $c).width(wdt);
            $j('div.field_content:eq(1) span div[class^="acc_"]', $c).width(wd1);
            $j('div.field_content:eq(2) span div[class^="acc_"]', $c).width(wd2);
        }else{
            if ($pw.css('width') == '80%') {
                $pw.css('width', '995px');
                $j('div.field_content:eq(0) span div[class^="acc_"]', $c).width(57);
                $j('div.field_content:eq(1) span div[class^="acc_"]', $c).width(25);
                $j('div.field_content:eq(2) span div[class^="acc_"]', $c).width(9);
            }
        }
        if (ui_storage.get('useBackground') == 'true') {
            if ($j('div#hero_background').length == 0) {
                var imgURL = GM_getResource("background_default.jpg");
                var $bkg = $j('<div id=hero_background>').css({'background-image' : 'url(' + imgURL + ')', 'background-repeat' : 'repeat',
                    'position' : 'fixed', 'width' : '100%', 'height' : '100%', 'z-index' : '1'});
                $j('body').prepend($bkg);
                $pw.css({'z-index': 2, 'position': 'relative'});
                //    $j('body').css({'background-image' : 'url(' + imgURL + ')', 'background-repeat' : 'repeat'});
                $j('div[id$="_block"]').css('background', 'none repeat scroll 0% 0% transparent');
            }
        }else{
            if ($j('div#hero_background').length > 0) {
                $j('div#hero_background').remove();
                $j('div[id$="_block"]').removeAttr('style');
                var width = $pw.css('width');
                $pw.removeAttr('style');
                $pw.css('width') = width;
             }
        }
    },

    add_css: function (){
        if ($j('#ui_css').length == 0){
            GM_addGlobalStyleURL('godville-ui.css', 'ui_css');
        }
    }
};


// Main code
ui_data.init();
ui_improver.add_css();
ui_storage.clearStorage();
ui_words.init();
ui_logger.create();
ui_timeout_bar.create();
ui_menu_bar.create();
ui_informer.init();

ui_improver.improve();

// event listeners
$j(document).bind("DOMNodeInserted", function () {
                   if(!ui_improver.ImproveInProcess){
                       ui_improver.ImproveInProcess = true;
                       setTimeout(ui_improver.improve, 10);
                   }
               });
$j('body').hover( function() { ui_logger.update(); } );