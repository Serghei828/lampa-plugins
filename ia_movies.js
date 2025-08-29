(function () {
    // ===== Internet Archive (Public Domain) parser for Lampa =====
    // Ищет общественное достояние и отдает прямые mp4 с archive.org

    var network = new Lampa.Reguest();

    function apiSearch(query, onOk, onErr) {
        // AdvancedSearch API: ищем фильмы в коллекции feature_films / mediatype: movies
        var q = 'collection:(feature_films) AND mediatype:(movies) AND title:(' + encodeURIComponent(query) + ')';
        var url = 'https://archive.org/advancedsearch.php?q=' + q + '&output=json&rows=25&fl[]=identifier&fl[]=title&fl[]=publicdate';

        network.native(url, function (raw) {
            try {
                var data = JSON.parse(raw);
                onOk(data && data.response && data.response.docs ? data.response.docs : []);
            } catch (e) {
                onErr(e);
            }
        }, onErr, { dataType: 'text' });
    }

    function fetchFileList(identifier, onOk, onErr) {
        var url = 'https://archive.org/metadata/' + encodeURIComponent(identifier);

        network.native(url, function (raw) {
            try {
                var data = JSON.parse(raw);
                var files = (data && data.files) || [];
                onOk(files);
            } catch (e) {
                onErr(e);
            }
        }, onErr, { dataType: 'text' });
    }

    function buildCard(doc, callback) {
        var id = doc.identifier;
        var title = doc.title || id;

        // постер (попробуем стандартный путь превью)
        var poster = 'https://archive.org/services/img/' + encodeURIComponent(id);

        // достанем mp4 / mpeg4 файлы
        fetchFileList(id, function (files) {
            var mp4 = files.filter(function (f) {
                var name = (f.name || '').toLowerCase();
                return name.endsWith('.mp4') || name.endsWith('.mpeg4');
            });

            // выберем «лучший» — просто самый крупный по размеру
            mp4.sort(function (a, b) {
                return (parseInt(b.size || 0) || 0) - (parseInt(a.size || 0) || 0);
            });

            var stream = mp4.length ? ('https://archive.org/download/' + encodeURIComponent(id) + '/' + encodeURIComponent(mp4[0].name)) : null;

            callback({
                title: title,
                url: stream,            // прямая ссылка на видео
                poster: poster,
                quality: mp4.length ? 'MP4' : 'N/A',
                info: 'Internet Archive',
                timeline: false
            });
        }, function () {
            callback({
                title: title,
                url: null,
                poster: poster,
                quality: 'N/A',
                info: 'Internet Archive',
                timeline: false
            });
        });
    }

    var parser = {
        // Название источника в Lampa
        component: 'internet_archive_movies',

        // что показывать в списке источников
        about: function () {
            return {
                title: 'Internet Archive (Public Domain)',
                desc: 'Открытые фильмы общественного достояния с archive.org',
                type: 'public'
            };
        },

        // Поиск по запросу пользователя
        search: function (query, callback) {
            apiSearch(query, function (docs) {
                var pending = docs.length;
                var results = [];

                if (!pending) return callback(results);

                docs.forEach(function (doc) {
                    buildCard(doc, function (card) {
                        if (card.url) results.push(card);
                        if (--pending === 0) callback(results);
                    });
                });
            }, function () {
                callback([]);
            });
        },

        // Опционально: «тренды/популярное» – просто выдадим несколько известных тайтлов
        main: function (page, callback) {
            var picks = ['nosferatu', 'charlie chaplin', 'metropolis', 'sherlock holmes'];
            var pending = picks.length;
            var all = [];

            picks.forEach(function (q) {
                apiSearch(q, function (docs) {
                    var take = docs.slice(0, 3);
                    var innerPending = take.length;
                    if (!innerPending) {
                        if (--pending === 0) callback(all);
                        return;
                    }
                    take.forEach(function (doc) {
                        buildCard(doc, function (card) {
                            if (card.url) all.push(card);
                            if (--innerPending === 0 && --pending === 0) callback(all);
                        });
                    });
                }, function () {
                    if (--pending === 0) callback(all);
                });
            });
        }
    };

    Lampa.Parser.extend(parser);
})();
