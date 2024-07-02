jtd.onReady(function () {
    'use strict';

    var navmenu = document.querySelector('#site-nav');
    var section = document.querySelectorAll("h2,h3,h4,h5,h6");
    var sections = {};
    var i = 0;

    Array.prototype.forEach.call(section, function (e) {
        sections[e.id] = e.offsetTop;
    });

    window.onscroll = function () {
        var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;

        for (i in sections) {
            if (sections[i] <= scrollPosition) {
                var activeMenuItem = navmenu.querySelector('.active');
                if(activeMenuItem) {
                    activeMenuItem.setAttribute('class', activeMenuItem.getAttribute('class').replace('active', ''));
                }

                activeMenuItem = navmenu.querySelector('a[href*=' + i + ']');
                activeMenuItem.setAttribute('class', activeMenuItem.getAttribute('class')+' active');

                navmenu.scrollTo({
                    top: sections[i],
                    behavior: 'smooth',
                });
            }
        }
    };
});