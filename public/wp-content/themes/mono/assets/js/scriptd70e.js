/*
* ----------------------------------------------------------------------------------------
Author       : Hridoy
Template Name: Bentos - Personal Portfolio HTML Template
Version      : 1.0                                          
* ----------------------------------------------------------------------------------------
*/

(function($) {
    "use strict";

    var windowOn = $(window);




    /*
     * ----------------------------------------------------------------------------------------
     *  SMOTH SCROOL JS
     * ----------------------------------------------------------------------------------------
     */

    $('#mobile-menu a').on("click", function(e) {
        var anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $(anchor.attr('href')).offset().top - 50
        }, 1000);
        e.preventDefault();
    });

    /*
     * ----------------------------------------------------------------------------------------
     *  SCROOL TO UP JS
     * ----------------------------------------------------------------------------------------
     */
    windowOn.on("scroll", function() {
        if ($(this).scrollTop() > 250) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }
    });
    $('.scrollup').on("click", function() {
        $("html, body").animate({
            scrollTop: 0
        }, 800);
        return false;
    });


    /*
     * ----------------------------------------------------------------------------------------
     *  DATA BACKGROUND OPTION
     * ----------------------------------------------------------------------------------------
     */

    $("[data-background").each(function() {
        $(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
    });

    $("[data-width]").each(function() {
        $(this).css("width", $(this).attr("data-width"));
    });

    $("[data-bg-color]").each(function() {
        $(this).css("background-color", $(this).attr("data-bg-color"));
    });

    /*
     * ----------------------------------------------------------------------------------------
     *  PRELOADER JS
     * ----------------------------------------------------------------------------------------
     */

    var prealoaderOption = $(window);
    prealoaderOption.on("load", function() {
        var preloader = jQuery('.preloader');
        var preloaderArea = jQuery('.preloader-area');
        preloader.fadeOut();
        preloaderArea.delay(350).fadeOut('slow');
    });




    /*
     * ----------------------------------------------------------------------------------------
     *  EXTRA JS
     * ----------------------------------------------------------------------------------------
     */

    // menu last item
    $('.main-menu nav > ul > li').slice(-4).addClass('menu-last');

    $('.nav-link-click').click(function() {
        $('.navbar-collapse').collapse('hide');
    });


    $('#mobile-menu').meanmenu({
        meanMenuContainer: '.mobile-menu',
        meanScreenWidth: "991",
        meanExpand: ['<i class="fal fa-plus"></i>'],
    });

    $(".sidebar__close-btn ,.mobile-menu .main-menu li a  > *:not(button)").on("click", function() {
        $(".sidebar__area").removeClass("sidebar-opened");
        $(".body-overlay").removeClass("opened");
    });

    $(".sidebar-toggle-btn").on("click", function() {
        $(".sidebar__area").addClass("sidebar-opened");
        $(".body-overlay").addClass("opened");
    });
    $(".sidebar__close-btn").on("click", function() {
        $(".sidebar__area").removeClass("sidebar-opened");
        $(".body-overlay").removeClass("opened");
    });

    $(".body-overlay").on("click", function() {
        $(".sidebar__area").removeClass("sidebar-opened");
        $(".body-overlay").removeClass("opened");
    });
    /*
     * ----------------------------------------------------------------------------------------
     *  PRELOADER JS & DOCUMENT LOAD JS
     * ----------------------------------------------------------------------------------------
     */

    $(window).on('load', function() {

        $('.loadersss').fadeOut();
        $('#preloader-areasss').delay(350).fadeOut('slow');


        // ## Project Filtering
        if ($('.project-masonry-active').length) {
            $(this).imagesLoaded(function() {
                $('.project-masonry-active').isotope({
                    // options
                    itemSelector: '.item',
                });
            });
        }


        // ## Blog Standard
        if ($('.blog-standard-wrap').length) {
            $(this).imagesLoaded(function() {
                $('.blog-standard-wrap').isotope({
                    // options
                    itemSelector: '.item',
                });
            });
        }





    });

    /*
     * ----------------------------------------------------------------------------------------
     *  HEADER STYLE JS
     * ----------------------------------------------------------------------------------------
     */
    function headerStyle() {
        if ($('.main-header').length) {
            var windowpos = $(window).scrollTop();
            var siteHeader = $('.main-header');
            var scrollLink = $('.scroll-top');
            if (windowpos >= 250) {
                siteHeader.addClass('fixed-header');
                scrollLink.fadeIn(300);
            } else {
                siteHeader.removeClass('fixed-header');
                scrollLink.fadeOut(300);
            }
        }
    }
    headerStyle();


    /*
     * ----------------------------------------------------------------------------------------
     *  MAGNIFIC POPUP JS
     * ----------------------------------------------------------------------------------------
     */


    /* magnificPopup img view */
    $('.work-popup').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });

    /* magnificPopup video view */
    $(".popup-youtube, .popup-vimeo, .popup-gmaps, .popup-video").magnificPopup({
        type: "iframe",
    });





    ////////////////////////////////////////////////////
    // 00. tp-blog__slider activation Js
    if (jQuery(".tp-blog__slider").length > 0) {
        let services__slide = new Swiper('.tp-blog__slider', {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            autoplay: {
                delay: 3000,
            },
            // Navigation arrows
            navigation: {
                nextEl: ".tp-blog-button-next",
                prevEl: ".tp-blog-button-prev",
            },
            breakpoints: {
                0: {
                    slidesPerView: 1,
                },
                550: {
                    slidesPerView: 1,
                },
                768: {
                    slidesPerView: 1,
                },
                1200: {
                    slidesPerView: 1,
                },
                1400: {
                    slidesPerView: 1,
                }
            }
        });

    }


    // ## Testimonials Active
    if ($('.testimonials-wrap').length) {
        $('.testimonials-wrap').slick({
            dots: false,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: true,
            speed: 1000,
            focusOnSelect: false,
            prevArrow: '.testimonial-prev',
            nextArrow: '.testimonial-next',
            slidesToShow: 2,
            slidesToScroll: 1,
            responsive: [{
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });
    }



    // ## Project Filter
    $(".project-filter li").on('click', function() {
        $(".project-filter li").removeClass("current");
        $(this).addClass("current");

        var selector = $(this).attr('data-filter');
        $('.project-masonry-active').imagesLoaded(function() {
            $(".project-masonry-active").isotope({
                itemSelector: '.item',
                filter: selector,
                masonry: {
                    columnWidth: '.item'
                }
            });
        });

    });



    /* ## Fact Counter + Text Count - Our Success */
    if ($('.counter-text-wrap').length) {
        $('.counter-text-wrap').appear(function() {

            var $t = $(this),
                n = $t.find(".count-text").attr("data-stop"),
                r = parseInt($t.find(".count-text").attr("data-speed"), 10);

            if (!$t.hasClass("counted")) {
                $t.addClass("counted");
                $({
                    countNum: $t.find(".count-text").text()
                }).animate({
                    countNum: n
                }, {
                    duration: r,
                    easing: "linear",
                    step: function() {
                        $t.find(".count-text").text(Math.floor(this.countNum));
                    },
                    complete: function() {
                        $t.find(".count-text").text(this.countNum);
                    }
                });
            }

        }, {
            accY: 0
        });
    }



    // ## Nice Select
    $('select').niceSelect();


    // ## WOW Animation
    if ($('.wow').length) {
        var wow = new WOW({
            boxClass: 'wow', // animated element css class (default is wow)
            animateClass: 'animated', // animation css class (default is animated)
            offset: 0, // distance to the element when triggering the animation (default is 0)
            mobile: false, // trigger animations on mobile devices (default is true)
            live: true // act on asynchronously loaded content (default is true)
        });
        wow.init();
    }


    /* ==========================================================================
           SCROLLER ANIMATION
    ========================================================================== */

    const scrollers = document.querySelectorAll(".scroller");

    // If a user hasn't opted in for recuded motion, then we add the animation
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        addAnimation();
    }

    function addAnimation() {
        scrollers.forEach((scroller) => {
            // add data-animated="true" to every `.scroller` on the page
            scroller.setAttribute("data-animated", true);

            // Make an array from the elements within `.scroller-inner`
            const scrollerInner = scroller.querySelector(".scroller__inner");
            const scrollerContent = Array.from(scrollerInner.children);

            // For each item in the array, clone it
            // add aria-hidden to it
            // add it into the `.scroller-inner`
            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute("aria-hidden", true);
                scrollerInner.appendChild(duplicatedItem);
            });
        });
    }



    /* ==========================================================================
       When document is resize, do
       ========================================================================== */

    windowOn.on('resize', function() {
        var mobileWidth = 992;
        var navcollapse = $('.navigation li.dropdown');
        navcollapse.children('ul').hide();
        navcollapse.children('.megamenu').hide();

    });


    /* ==========================================================================
       When document is scroll, do
       ========================================================================== */

    windowOn.on('scroll', function() {

        // ## Header Style and Scroll to Top
        function headerStyle() {
            if ($('.main-header').length) {
                var windowpos = $(window).scrollTop();
                var siteHeader = $('.main-header');
                var scrollLink = $('.scroll-top');
                if (windowpos >= 100) {
                    siteHeader.addClass('fixed-header');
                    scrollLink.fadeIn(300);
                } else {
                    siteHeader.removeClass('fixed-header');
                    scrollLink.fadeOut(300);
                }
            }
        }

        headerStyle();

    });




})(jQuery); // End jQuery