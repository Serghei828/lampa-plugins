(function () {
    // Простая тестовая заглушка для Lampa — возвращает одну рабочую карточку с mp4
    try {
        var parser = {
            component: 'lampa_test_plugin',
            about: function () {
                return {
                    title: 'Тестовый плагин Lampa',
                    desc: 'Выдаёт одну тестовую карточку с mp4',
                    type: 'test'
                };
            },
            main: function (page, callback) {
                var items = [{
                    title: 'Big Buck Bunny (test)',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    poster: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217',
                    quality: '720p',
                    info: 'Public test video',
                    timeline: false
                }];
                callback(items);
            },
            search: function (query, callback) {
                callback([]);
            }
        };

        Lampa.Parser.extend(parser);
    } catch (e) {
        // если что-то идет не так — попытаемся сообщить в консоль (если доступно)
        try { console.error('Lampa test plugin error:', e); } catch (e2) {}
    }
})();
