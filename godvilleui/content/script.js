var $j = jQuery.noConflict();

var god_name = isArena() ?
        $j.trim($j('div#hero1_info fieldset div div a[href*="/gods/"]').text()):
        $j.trim($j('div#hi_box div a[href*="/gods/"]').attr('href').replace('/gods/', ''));
var developers = ['Neniu', 'Ryoko'];
var char_name = isArena() ?
        $j.trim($j('div#hero1_info fieldset div:first div').text()):
        $j('div#hi_box div a[href^="/gods/"]').text();
// Style

// ------------------------
//      HELPERS
// ------------------------
// Dump
function is_developer() {
	return developers.indexOf(god_name) >= 0;
}
// Базовый алгоритм произнесения фразы
function sayToHero(phrase) {
	$j('#aog_hint_label').hide();
	$j('#god_phrase').val(phrase);
}
// Checks if $elem already improved
function isAlreadyImproved($elem) {
	if ($elem.hasClass('improved')) return true;
	$elem.addClass('improved');
	return false
}

function findLabel($base_elem, label_name) {
	return $j('.l_capt', $base_elem).filter(function(index){
			return $j(this).text() == label_name;
		});
}
// Search for label with given name and appends after it
// given elem
function addAfterLabel($base_elem, label_name, $elem) {
	findLabel($base_elem, label_name).after($elem.addClass('label-appended'));
}
// Generic say button
function getGenSayButton(title, section) {
	return $j('<a href="#">' + title + '</a>')
		.click(function() {
			sayToHero(words.longPhrase(section));
			return false;
		});
}
// Хелпер объединяет addAfterLabel и getGenSayButton
// + берет фразы из words['phrases']
function addSayPhraseAfterLabel($base_elem, label_name, btn_name, section) {
	addAfterLabel($base_elem, label_name, getGenSayButton(btn_name, section));
}

// Случайный индекс в массиве
function getRandomIndex(arr) {
	return Math.floor ( Math.random() * arr.length );
}
// Случайный элемент массива
function getRandomItem(arr) {
	return arr[getRandomIndex(arr)];
}
// Вытаскивает случайный элемент из массива
function popRandomItem(arr) {
	var ind = getRandomIndex(arr);
	var res = arr[ind];
	arr.splice(ind, 1);
	return res;
}

// ------------------------
// Timeout bar
// -----------------------
// timeout_bar.create -- создать объект
// timeout_bar.start([seconds]) -- пустить полоску
var timeout_bar = {
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
var menu_bar = {
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
		storage.set('ui_menu_visible', this.bar.is(':visible'));
	},
	show: function() {
		this.bar.show();
	},
	constructMenuBar: function() {
		this.items = $j('<ul></ul>');
		this.bar = $j('<div id="ui_menu_bar"></div>').append(this.items);
		this.bar.toggle(storage.get('ui_menu_visible') == 'true' || false);
		//append basic elems
        ///TODO: auto change version number
		this.append($j('<strong>Godville UI (v.0.2.5):</strong>'));
		this.append(this.reformalLink);
		if (is_developer()) {
			this.append(this.getDumpButton());
		}
		return this.bar;
	},

	getToggleButton: function() {
		return $j('<a href="#"><strong>ui</strong></a>')
			.click(function() {
					   menu_bar.toggle();
					   return false;
				   });
	},
	getDumpButton: function() {
		return $j('<a href="#" class="devel_link">dump</a>')
			.click(function() {
					   storage.dump();
				   });
	}
};

// -----------------------
// Storage wrapper
// -----------------------
// storage.set -- store value
// storage.get -- read value
// storage.set_with_diff -- store value and get diff with old
var storage = {
	_get_key: function(key) {
		return "GM_" + god_name + ':' + key;
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
        for(var i = 0; i < localStorage.length; i++){
			lines.push(localStorage.key(i) + " = " + localStorage[localStorage.key(i)]);
		}
		GM_log("Storage:\n" + lines.join("\n"));
	},
    clearStorage: function(){
        if (this.get('clean161210') != 'true'){
            var idx_lst = [];
            var r = new RegExp('(^GM_:)|(^GM_.{5,40}'+god_name+'[!?\\.]?:)');
            for(var i = 0; i < localStorage.length; i++){
                var key = localStorage.key(i);
                if (key.match(r)) idx_lst.push(key);
             }
            for(key in idx_lst){
                localStorage.removeItem(idx_lst[key]);
            }
            this.set('clean161210', true);
        }
	}
};

var words = {
    currentPhrase: "",
	init: function() {
        this.base = getWords();
        var sects = ['heal', 'pray', 'sacrifice', 'exp', 'gold', 'hit', 'do_task', 'cancel_task', 'die', 'town', 'heil'];
        for (var i = 0; i < sects.length; i++){
            var t = sects[i];
            var text = storage.get('phrases_' + t);
//            var text_list = god_name (this.response) ? this.response['phrases'][t] : [];
            if (text && text != ""){
                this.base['phrases'][t] = text.split("||");
            }
         }
	},
	// Phrase gen
    randomPhrase: function(sect) {
        return getRandomItem(this.base['phrases'][sect]);
    },

    longPhrase: function(sect, len) {
        var prefix = this._addHeroName(this._addHeil(''));
        var phrases;
        if (storage.get('useShortPhrases') == "true") {
            phrases = [getRandomItem(this.base['phrases'][sect])];
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
		return $obj.text().match(/\(\@\)/);
	},

    _changeFirstLetter: function(text){
        return text.charAt(0).toLowerCase() + text.slice(1);
    },

    getPhrasePrefixed: function(text){
        if (text == "") return "";
        return this._addHeroName(this._addHeil(text));
    },

    _addHeroName: function(text){
        if ((storage.get('useHeroName') != 'true')) return text;
        return char_name + ', ' + this._changeFirstLetter(text);
    },

    _addHeil: function(text){
        if ((storage.get('useHeil') != 'true')) return text;
        return getRandomItem(this.base['phrases']['heil']) + ', ' + this._changeFirstLetter(text);
    },

	// Private (или типа того)
	_longPhrase_recursion: function(source, len) {
		while (source.length) {
			var next = popRandomItem(source);
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
var stats = {
	get: function(key) {
		return storage.get('stats_' + key);
	},
	set: function(key, value) {
		return storage.set('stats_' + key, value);
	},
	setFromProgressBar: function(id, $elem) {
		var value = 100 - $elem.css('width').replace(/%/, '');
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
		var $label = findLabel($container, label);
		var $field = $label.siblings('.field_content');
		var value = parser($field.text());

		return this.set(id, value);
	},
	setFromEquipCounter: function(id, $container, label) {
		var $label = findLabel($container, label);
		var $field = $label.next('.equip_content');
		var value = $field.text().replace(/.*([+-][0-9]+)/, "$1");

		return this.set(id, parseInt(value));
	}
};

// ------------------------
// Oneline logger
// ------------------------
// logger.create -- создать объект
// logger.appendStr -- добавить строчку в конец лога
// logger.needSepratorHere -- перед первой же следующей записью вставится разделитель
// logger.watchProgressBar -- следить за полоской
// logger.watchLabelCounter -- следить за значением лабела
var logger = {
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
		var diff = storage.set_with_diff('logger_param_' + id, stats.get(id));
		if(diff) {
			// Округление и добавление плюсика
			diff = Math.round(diff * 1000) / 1000;
			var s = (diff < 0)? diff : '+' + diff;

			this.appendStr(id, klass, name  + s, descr);
		}
	},

	update: function() {
		this.need_separator = true;
        if (isArena()){
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
var informer = {
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
        var fl = storage.get('informer_flags');
        if (!fl || fl == "") fl = '{}';
		this.flags = JSON.parse(fl);
	},
	save: function() {
		storage.set('informer_flags', JSON.stringify(this.flags));
	},
	create_label: function(flag) {
		var $label = $j('<div>' + flag + '</div>')
			.click(function() {
					   informer.hide(flag);
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
			this.tref = setTimeout( function(){informer.tick.call(informer);}, 700);
		} else {
			this.clear_title();
			this.tref = undefined;
		}
	},

	clear_title: function() {
		document.title = 'gv: ' + god_name;
	},
	update_title: function(arr) {
		this.odd_tick = ! this.odd_tick;

		var sep = (this.odd_tick? '...' : '!!!');
		var msg = sep + ' ' + arr.join('! ') + ' ' + sep;
		document.title = msg;
	}
};



// ------------------------------------
//  Improvements !!
// ------------------------------------

// -------- Hero Loot -----------------

// Main button creater
function improveLoot() {
	if (isArena()) return;
	if (isAlreadyImproved($j('#inv_box'))) return;

	function createInspectButton(item_name) {
		return $j('<a href="#">?</a>')
			.click(function(){
				sayToHero(words.inspectPhrase(item_name));
				return false;
			});
	}

	var good_box = false;
	var black_box = false;
	var transformer = false;
	var bold_item = false;

	// Parse items
	$j('#hero_loot ul li').each(function(ind, obj) {
		var $obj = $j(obj);
		var item_name = $j('span', $obj).text()
									   .replace(/\(\@\)/, '')
								       .replace(/\(\d+ шт\)/, '')
									   .replace(/^\s+|\s+$/g, '');
		// color items, and add buttons
		if (words.isCategoryItem('heal', item_name)) {
			$obj.css('color', 'green');
		} else if (words.isCategoryItem('black box', item_name)) {
			black_box = true;
		} else if (words.isCategoryItem('good box', item_name)) {
			good_box = true;
		} else if (words.isCategoryItem('transformer', item_name)) {
			transformer = true;
		} else if (words.canBeActivated($obj)) {
			// Ничего не делать -- остальные активируемые вещи
		} else {
			$obj.append(createInspectButton(item_name));

			if($j('b', $obj).length > 0) {
				bold_item = true;
			}
		}
	});

	informer.update('black box', black_box);
	informer.update('good box', good_box);
	if (bold_item) {
		informer.update('transform!', transformer);
		informer.update('transformer', false);
	} else {
		informer.update('transformer', transformer);
	}
}


// -------------- Phrases ---------------------------

function isArena() {
	return $j('#arena_block').length > 0;
}

function appendCheckbox($div, id, label) {
	$div.append('<input type="checkbox" id="' + id +  '" >');
	$div.append('<label for="' + id + '">' + label + '</label>');
}

function generateArenaPhrase() {
	var parts = [];
	var keys = ['hit', 'heal', 'pray'];
	for (var i in keys) {
		var key = keys[i];
		if ($j('#say_' + key).is(':checked')) {
			parts.push(words.randomPhrase(key));
		}
	}
	// TODO: shuffle parts
	// TODO: smart join: .... , .... и ....
    parts = shuffleArray(parts);
	var msg = words.getPhrasePrefixed(smartJoin(parts));
	if(msg.length < 80) {
		return msg;
	} else {
		return generateArenaPhrase();
	}
}

function shuffleArray(phrases){
    var out = [];
    while (phrases.length > 0){
        out.push(popRandomItem(phrases));
    }
    return out;
}

function smartJoin(parts){
    var out = "";
    var trim_last = /[\.!]$/;
    for (var i = 0; i < parts.length; i++){
        out += (i == 0)? "" : (i != parts.length - 1) ? ", " : " и ";
        var p = (i != 0) ? words._changeFirstLetter(parts[i]) : parts[i];
        out += (i != parts.length - 1) ? p.replace(trim_last, "") : p;
    }
    return out;
}

function getArenaSayBox() {
	// TODO: стиль для бокса, чтобы он был по центру
	var $div = $j('<div id="arena_say_box"></div>');

	appendCheckbox($div, 'say_hit', 'бей');
	appendCheckbox($div, 'say_heal', 'лечись');
	appendCheckbox($div, 'say_pray', 'молись');

	$div.click(function() { sayToHero(generateArenaPhrase());});
	return $div;
}

function improveSayDialog() {
	if (isAlreadyImproved( $j('#aog_box') )) return;

	// Hide hint
	$j('#aog_hint_label').hide();

	// Add links
	var $box = $j('#hero_actsofgod');

	if (isArena()) {
		$j('#god_phrase_form').before(getArenaSayBox());
	} else {
		addSayPhraseAfterLabel($box, 'Прана', 'жертва', 'sacrifice');
		addSayPhraseAfterLabel($box, 'Прана', 'ещё', 'pray');

		// Show timeout bar after saying
		$j('#god_phrase_btn').click(function () {timeout_bar.start(); words.currentPhrase=""; return true;});
	}

	// Save stats
	var prana = stats.setFromLabelCounter('prana', $box, 'Прана');

	informer.update('pr = 100', prana == 100);
}

// ----------- Вести с полей ----------------
function improveFieldBox() {
	if (isArena()) return;
	if (isAlreadyImproved( $j('#hero_details fieldset') )) return;

	// Add links
	var $box = $j('#hero_details');

	addSayPhraseAfterLabel($box, 'Противник', 'бей', 'hit');
}

// ---------- Stats --------------

function improveStats() {
	if (isArena()) {
        stats.setFromLabelCounter('heal1', $j('#hero1_stats'), 'Здоровье');
        stats.setFromLabelCounter('heal2', $j('#hero2_stats'), 'Здоровье');
        return;
    }
	if (isAlreadyImproved( $j('#hs_box') )) return;

	// Add links
	var $box = $j('#hero_stats');

	addSayPhraseAfterLabel($box, 'Уровень', 'ещё', 'exp');
	addSayPhraseAfterLabel($box, 'Здоровье', 'ещё', 'heal');
	addSayPhraseAfterLabel($box, 'Золота', 'клад', 'gold');
	//addSayPhraseAfterLabel($box, 'Задание', 'отмена', 'cancel_task');
	addSayPhraseAfterLabel($box, 'Задание', 'ещё', 'do_task');
	//addSayPhraseAfterLabel($box, 'Смертей', 'ещё', 'die');
	addSayPhraseAfterLabel($box, 'Столбов от столицы', 'дом', 'town');

	// Save stats
	// Парсер строки с золотом
	var gold_parser = function(val) {
		return parseInt(val.replace(/[^0-9]/g, '')) || 0;
	};

	stats.setFromProgressBar('exp', $j('#pr3'));
	stats.setFromProgressBar('task', $j('#pr4'));
	stats.setFromLabelCounter('level', $box, 'Уровень');
	stats.setFromLabelCounter('inv', $box, 'Инвентарь');
	var heal  = stats.setFromLabelCounter('heal', $box, 'Здоровье');
	var gld   = stats.setFromLabelCounter('gold', $box, 'Золота', gold_parser);
	stats.setFromLabelCounter('monster', $box, 'Убито монстров');
 	stats.setFromLabelCounter('death', $box, 'Смертей');
 	stats.setFromLabelCounter('brick', $box, 'Кирпичей для храма', parseFloat);

	informer.update('gld > 3k', gld >= 3000);
	informer.update('dead', heal == 0);
}

// ---------- Equipment --------------

function improveEquip() {
	if (isArena()) return;
	if (isAlreadyImproved( $j('#equipment_box') )) return;

	// Save stats
	var $box = $j('#equipment_box');

	stats.setFromEquipCounter('equip1', $box, 'Оружие');
	stats.setFromEquipCounter('equip2', $box, 'Щит');
	stats.setFromEquipCounter('equip3', $box, 'Голова');
	stats.setFromEquipCounter('equip4', $box, 'Тело');
	stats.setFromEquipCounter('equip5', $box, 'Руки');
	stats.setFromEquipCounter('equip6', $box, 'Ноги');
	stats.setFromEquipCounter('equip7', $box, 'Талисман');
}

// -------------- Переписка ---------------------------

function improveMailbox() {
	if (isArena()) return;
	if (isAlreadyImproved( $j('#recent_friends') )) return;

	// Ссылки на информацию о боге по средней кнопке мыши
	$j('#recent_friends .new_line a')
		.each(function(ind, obj) {
				  if (obj.innerHTML == 'показать всех знакомых'
					  || obj.innerHTML.substring(0, 20) == 'скрыть всех знакомых') {
					  return;
				  }
				  obj.href = "http://godville.net/gods/"+obj.innerHTML;
			  });

}

function improveInterface(){
    var $pw = $j('div#page_wrapper');
    var $c = $j('div#acc_box div:first');
    if (storage.get('useWideScreen') == 'true' && $j('body').width() > 1244) {
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
    if (storage.get('useBackground') == 'true') {
        if ($j('div#hero_background').length == 0) {
//            var imgURL = GM_getResourceImageAsURL("background_default.jpg");
            imgURL = 'http://img194.imageshack.us/img194/9410/backgrounddefault.jpg';
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
}

function add_css(){
    if ($j('#ui_css').length == 0){
        GM_addStyle( GM_getResourceText('godville-ui.css'), 'ui_css');
    }
}

// -------- do all improvements ----------
var ImproveInProcess = false;
function improve() {
	ImproveInProcess = true;
	try {
		improveLoot();
		improveSayDialog();
		improveStats();
		improveFieldBox();
		improveEquip();
		improveMailbox();
        improveInterface();
		informer.update('pvp', isArena());
        words.checkCurrentPhrase();
	} catch (x) {
		GM_log(x);
	} finally {
		ImproveInProcess = false;
	}
}

// Main code
add_css();
storage.clearStorage();
words.init();
logger.create();
timeout_bar.create();
menu_bar.create();
informer.init();

improve();

// event listeners
$j(document).bind("DOMNodeInserted", function () {
                   if(!ImproveInProcess)
                       setTimeout(improve, 1);
               });
$j('body').hover( function() { logger.update(); } );