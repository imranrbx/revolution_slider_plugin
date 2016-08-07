$(function() {

    //Wait for Pinegrow to wake-up
    $('body').one('pinegrow-ready', function(e, pinegrow) {

        //Create new Pinegrow framework object
        var f = new PgFramework('js.revolution', 'Revolution Slider');

        //This will prevent activating multiple versions of 960 grid framework, provided that other versions set the same type
        f.type = "js.revolution";
        f.allow_single_type = true;

        //Tell Pinegrow about the framework and loads necessary plugins
        pinegrow.addFramework(f);  
       
              //Slider
        //==================
        var slider = new PgComponentType('revolution-slider', 'Revolution Slider');

        //How can we identify DOM elements that are sliders?
        slider.selector = ".rev_slider";

        //Html code for slider, that will be inserted into the page
        slider.code = function() {
            var id = pinegrow.getUniqueId('slider');
            var img1 = pinegrow.getPlaceholderImage();
            var img2 = pinegrow.getPlaceholderImage();
            var img3 = pinegrow.getPlaceholderImage();

            return '<div id="' + id + '" class="rev_slider">\
                <ul>\
                    <li data-transition="slideleft" data-slotamount="1" >\
                        <img src="' + img1 + '">\
                    </li>\
                    <li data-transition="slideleft" data-slotamount="1" >\
                        <img src="' + img2 + '">\
                    </li>\
                    <li data-transition="slideleft" data-slotamount="1" >\
                        <img src="' + img3 + '">\
                    </li>\
                </ul>\
            </div>';
        };

        slider.on_inserted = function($el, page) {
            var $body = $(page.getBody());
            var id = $el.attr('id');
            if(id) {
                var ini_str = 'jQuery(function($){\n $("#' + id + '").revolution();\n });';
                pinegrow.addScriptToPage(page, ini_str);
                pinegrow.showNotice('<p>Revolution slider initialization Javascript was appended to the end of the page:</p><pre>' + escapeHtmlCode(ini_str) + '</pre><p>If you change the #id of the slider element you\'ll need to update the selector in this code. You also need to <b>include Revolution slider Javascript</b> to the page.</p>', 'Revolution Slider inserted', 'revolution-on-inserted');
            }
        }

        var callSlider = function($el, func, msg) {
            var id = $el.attr('data-pg-id');
            var code = '$(\'[data-pg-id="' + id + '"]\').' + func + ';';
            var page = pinegrow.getPageForElement($el);
            pinegrow.setIgnoreClicks(true);
            pinegrow.executeScriptInPage(page, code);
            pinegrow.setIgnoreClicks(false);
            if(msg) {
                pinegrow.showQuickMessage(msg);
            }
        }

        slider.action_menu = {
            actions : [
                {label: "Pause Slider", action: function($el) {
                    callSlider($el, "revpause()", "Slider paused.");
                }},
                {label: "Resume Slider", action: function($el) {
                    callSlider($el, "revresume()", "Slider resumed.");
                }},
                {label: "Next Slide", action: function($el) {
                    callSlider($el, "revnext()");
                }},
                {label: "Previous Slide", action: function($el) {
                    callSlider($el, "revprev()");
                }}
            ],
            add : ['revolution-slide'],
            on_add : function($el, $new, newdef, prepend) {
                var $ul = $el.find('>ul');
                var pgul = new pgQuery($ul);
                var pgel = new pgQuery($el);
                var pgnew = new pgQuery($new);
                if($ul.length == 0) {
                    pgul = new pgQuery().create('<ul></ul>');
                    pgel.append(pgul);
                }
                if(prepend) {
                    pgul.prepend(pgnew);
                } else {
                    pgul.append(pgnew);
                }
            }
        }

        //Set empty_placeholder to true so that empty container gets min-height set. Otherwise empty container would be invisible. This lets us see it and use it as drop target. Placeholder style gets removed as soon as we add something to this element.
        slider.empty_placeholder = false;

        //Highlight element in the tree to show it is important and has special features
        slider.tags = 'major';

        //Add it to our framework
        f.addComponentType(slider);


        //Slider
        //==================
        var slide = new PgComponentType('revolution-slide', 'Slide');

        //How can we identify DOM elements that are sliders?
        slide.selector = function($el) {
            return $el.is('li') && $el.parent().parent().is('.rev_slider');
        };

        slide.priority = 100;

        //Html code for slider, that will be inserted into the page
        slide.code = function() {
            var img1 = pinegrow.getPlaceholderImage();

            return '<li data-transition="slideleft" data-slotamount="1" data-thumb="' + pinegrow.getThumbnailForPlaceholderImage(img1) + '">\
                        <img src="' + img1 + '">\
                    </li>';
        };

        var gotoSlide = function($el) {
            var $slider = $el.closest('.rev_slider');
            callSlider($slider, "revpause()");
            var num = $el.index();
            callSlider($slider, "revshowslide(" + (num + 1) + ")", "Going to slide " + (num + 1) + "...");
        }

        slide.on_inserted = function($el) {
            var $slider = $el.closest('.rev_slider');
            pinegrow.showNotice("<p><b>Refresh</b> the page to activate the added slide.</p><p>Tip: Click on any SLIDE in the Tree to select &amp; show that slide.</p>", "Slide was inserted", "revolution-slide-inserted", function(shown) {
                if(!shown) {
                    pinegrow.showQuickMessage("<b>Refresh</b> the page to activate the added slide.", 4000);
                }
            })
        }

        slide.on_selected = function($el) {
            gotoSlide($el);
        }

        //Highlight element in the tree to show it is important and has special features
        slide.tags = 'major';

        //Add it to our framework
        f.addComponentType(slide);


        //Now, lets define sections and elements shown in LIB tab
        var section = new PgFrameworkLibSection('revolution-elements', 'Revolution Slider');
        //Pass components in array
        section.setComponentTypes([slider, slide]);
        f.addLibSection(section);

        f.on_page_loaded = function(crsaPage) {
            setTimeout(function() {
                $(function() {
                    var $html = crsaPage.get$Html();
                    $html.find('.rev_slider').each(function(i,c) {
                        var $c = $(c);
                        callSlider($c, "revpause()", "Revolution Slider paused.");
                    });
                });
            }, 3000);
        }
        //That's it!!! Simple, right? A lot of magic stuff could be done here, check Bootstrap framework for inspiration.
        //Add resources that will be copied to components/<plugin> folder and included in the page with Pinegrow Resource manager when the plugin is first activated on a page or when Resources command is used in "Manage libraries and plugins".
        var r = new PgComponentTypeResource(f.getResourceFile('./src/css/settings.css')); //relative to plugin js file
        r.relative_url = 'css/settings.css'; //what should the relative url be when resource is used on the page
        r.source = crsaMakeFileFromUrl(r.url);
        r.footer = false; //Recommended for JS files.
        f.resources.add(r);

        var r = new PgComponentTypeResource(f.getResourceFile('./src/js/jquery.themepunch.plugins.min.js')); //relative to plugin js file
        r.relative_url = 'js/jquery.themepunch.plugins.min.js'; //what should the relative url be when resource is used on the page
        r.source = crsaMakeFileFromUrl(r.url);
        r.footer = true; //Recommended for JS files.
        f.resources.add(r);

        r = new PgComponentTypeResource(f.getResourceFile('./src/js/jquery.themepunch.revolution.min.js'));
        r.relative_url = 'js/jquery.themepunch.revolution.min.js';
        r.source = crsaMakeFileFromUrl(r.url);
        r.footer = true;
        f.resources.add(r);
    });
});