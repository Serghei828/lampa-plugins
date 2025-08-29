(function(){
    try{
        Lampa.Parser.extend({
            component:'lampa_test',
            about:function(){return {title:'Тестовый плагин',desc:'Проверка Lampa',type:'test'};},
            main:function(page,callback){callback([{title:'Тестовое видео',url:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',poster:'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',quality:'720p',info:'Test',timeline:false}]);},
            search:function(q,c){c([]);}
        });
    }catch(e){}
})();
