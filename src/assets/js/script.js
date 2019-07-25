import { throttle } from 'throttle-debounce';
import scriptjs from 'scriptjs';
import rafl from 'rafl'; 

import parseSRConfig from '../../gutenberg/extend/scroll-reveal/parseSRConfig.jsx';

const $ = window.jQuery;
const $wnd = $( window );
const $doc = $( document );
const {
    yscVariables,
    YSC,
} = window;

/**
 * Throttle scroll
 */
const throttleScrollList = [];
let lastST = 0;

const hasScrolled = () => {
    const body = document.body;
    const html = document.documentElement;
    const ST = window.pageYOffset || html.scrollTop;

    let type = ''; // [up, down, end, start]

    if ( ST > lastST ) {
        type = 'down';
    } else if ( ST < lastST ) {
        type = 'up';
    } else {
        type = 'none';
    }

    const docH = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
    const wndH = window.innerHeight || html.clientHeight || body.clientHeight;

    if ( ST === 0 ) {
        type = 'start';
    } else if ( ST >= docH - wndH ) {
        type = 'end';
    }

    throttleScrollList.forEach( ( value ) => {
        if ( typeof value === 'function' ) {
            value( type, ST, lastST );
        }
    } );

    lastST = ST;
};

const hasScrolledThrottle = throttle( 200, () => {
    if ( throttleScrollList.length ) {
        rafl( hasScrolled );
    }
} );

$wnd.on( 'scroll load resize orientationchange throttlescroll.ysc', hasScrolledThrottle );
$doc.on( 'ready', hasScrolledThrottle );

function throttleScroll( callback ) {
    throttleScrollList.push( callback );
}

class YSCClass {
    constructor() {
        const self = this;

        self.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test( window.navigator.userAgent || window.navigator.vendor || window.opera );

        // prepare media vars.
        self.screenSizes = [];
        Object.keys( yscVariables.media_sizes ).forEach( ( k ) => {
            self.screenSizes.push( yscVariables.media_sizes[ k ] );
        } );

        self.customStyles = '';

        // Methods bind class.
        self.initBlocks = self.initBlocks.bind( self );
        self.getWnd = self.getWnd.bind( self );
        self.isElementInViewport = self.isElementInViewport.bind( self );
        self.prepareCounters = self.prepareCounters.bind( self );
        self.prepareCustomStyles = self.prepareCustomStyles.bind( self );
        self.prepareTabs = self.prepareTabs.bind( self );
        self.prepareAccordions = self.prepareAccordions.bind( self );
        self.prepareCarousels = self.prepareCarousels.bind( self );
        self.setFullscreenVideoSize = self.setFullscreenVideoSize.bind( self );
        self.prepareVideo = self.prepareVideo.bind( self );
        self.prepareGist = self.prepareGist.bind( self );
        self.prepareChangelog = self.prepareChangelog.bind( self );
        self.prepareGoogleMaps = self.prepareGoogleMaps.bind( self );
        self.prepareSR = self.prepareSR.bind( self );

       YSC.triggerEvent( 'beforeInit', self );

        // Enable object-fit.
        if ( typeof window.objectFitImages !== 'undefined' ) {
            const ofiImages = '.ysc-video-poster img, .ysc-grid > .nk-awb img, .ysc-col > .nk-awb img';

            window.objectFitImages( ofiImages );
            $doc.on( 'ready', () => {
                window.objectFitImages( ofiImages );
            } );
        }

        // Additional easing.
        $.extend( $.easing, {
            easeOutCubic( x, t, b, c, d ) {
                return ( c * ( ( ( t = ( t / d ) - 1 ) * t * t ) + 1 ) ) + b;
            },
        } );

        // Alerts dismiss button.
        $( document ).on( 'click', '.ysc-alert-hide-button', function( e ) {
            e.preventDefault();
            $( this ).parent()
                .animate( { opacity: 0 }, 150, function() {
                    $( this ).slideUp( 200 );

                    hasScrolled();
                } );
        } );

        // Set FS video size.
        const throttledSetFullscreenVideoSize = throttle( 200, () => {
            rafl( () => {
                self.setFullscreenVideoSize();
            } );
        } );
        $( window ).on( 'DOMContentLoaded load resize orientationchange', () => {
            throttledSetFullscreenVideoSize();
        } );

        // Init blocks.
        const throttledInitBlocks = throttle( 200, () => {
            rafl( () => {
                self.initBlocks();
            } );
        } );
        if ( window.MutationObserver ) {
            new window.MutationObserver( throttledInitBlocks )
                .observe( document.documentElement, {
                    childList: true, subtree: true,
                } );
        } else {
            $( document ).on( 'DOMContentLoaded DOMNodeInserted load', () => {
                throttledInitBlocks();
            } );
        }

        YSC.triggerEvent( 'afterInit', self );
    }

    // Init blocks.
    initBlocks() {
        const self = this;

        YSC.triggerEvent( 'beforeInitBlocks', self );

        self.prepareCustomStyles();
        self.prepareTabs();
        self.prepareAccordions();
        self.prepareCarousels();
        self.prepareVideo();
        self.prepareGist();
        self.prepareChangelog();
        self.prepareGoogleMaps();
        self.prepareCounters();
        self.prepareSR();

        YSC.triggerEvent( 'afterInitBlocks', self );
    }

    // Get window size.
    getWnd() {
        return {
            w: window.innerWidth,
            h: window.innerHeight,
        };
    }

    /**
     * Is element in viewport.
     * https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
     *
     * @param {DOM} el - element.
     * @param {Number} allowPercent - visible percent of the element.
     *
     * @returns {Boolean} - visible.
     */
    isElementInViewport( el, allowPercent = 1 ) {
        const rect = el.getBoundingClientRect();
        const rectW = rect.width || 1;
        const rectH = rect.height || 1;
        const self = this;
        let visibleHeight = 0;
        let visibleWidth = 0;

        // on top of viewport
        if ( rect.top < 0 && rectH + rect.top > 0 ) {
            visibleHeight = rectH + rect.top;

        // on bot of viewport.
        } else if ( rect.top > 0 && rect.top < self.getWnd().h ) {
            visibleHeight = self.getWnd().h - rect.top;
        }

        // on left of viewport
        if ( rect.left < 0 && rectW + rect.left > 0 ) {
            visibleWidth = rectW + rect.left;

        // on bot of viewport.
        } else if ( self.getWnd().w - rect.left > 0 ) {
            visibleWidth = self.getWnd().w - rect.left;
        }

        visibleHeight = Math.min( visibleHeight, rectH );
        visibleWidth = Math.min( visibleWidth, rectW );

        const visiblePercent = visibleWidth * visibleHeight / ( rectW * rectH );

        return visiblePercent >= allowPercent;
    }

    /**
     * Prepare Counters (Number Box, Progress Bar)
     */
    prepareCounters() {
        const self = this;

        YSC.triggerEvent( 'beforePrepareCounters', self );

        $( '.ysc-count-up:not(.ysc-count-up-ready)' ).each( function() {
            const $this = $( this );
            const isProgress = $this.hasClass( 'ysc-progress-bar' );
            const from = parseFloat( $this.attr( 'data-count-from' ) ) || 0;
            const to = parseFloat( isProgress ? $this.attr( 'aria-valuenow' ) : $this.text() ) || 0;
            let $progressCountBadgeWrap;
            let $progressCountBadge;

            // prepare mask.
            let mask = '';
            if ( ! isProgress ) {
                mask = $this.text().replace( to, '${val}' );
            }
            if ( ! /\${val}/.test( mask ) ) {
                mask = '${val}';
            }

            $this.addClass( 'ysc-count-up-ready' );

            if ( isProgress ) {
                $progressCountBadgeWrap = $this.closest( '.ysc-progress' ).find( '.ysc-progress-bar-count' );
                $progressCountBadge = $progressCountBadgeWrap.find( '> div > span:eq(1)' );

                $progressCountBadgeWrap.css( 'width', '0%' );
                $progressCountBadge.text( '0' );
                $this.css( 'width', '0%' );
            } else {
                $this.text( mask.replace( '${val}', from ) );
            }

            const item = {
                el: this,
                from: from,
                to: to,
                cb( num ) {
                    if ( isProgress ) {
                        $this.css( 'width', `${ Math.ceil( num * 100 ) / 100 }%` );
                        $progressCountBadgeWrap.css( 'width', `${ Math.ceil( num * 100 ) / 100 }%` );

                        $progressCountBadge.text( Math.ceil( num ) );
                    } else {
                        $this.text( mask.replace( '${val}', Math.ceil( num ) ) );
                    }
                },
            };
            let showed = false;

            // Run counter.
            throttleScroll( () => {
                if ( ! showed && item && self.isElementInViewport( item.el ) ) {
                    showed = true;
                    $( { Counter: item.from } ).animate( { Counter: item.to }, {
                        duration: 1000,
                        easing: 'easeOutCubic',
                        step() {
                            item.cb( this.Counter, false );
                        },
                        complete() {
                            item.cb( item.to, true );
                        },
                    } );
                }
            } );
        } );

        YSC.triggerEvent( 'afterPrepareCounters', self );
    }

    /**
     * Prepare custom styles.
     */
    prepareCustomStyles() {
        const self = this;
        let reloadStyles = false;               

        YSC.triggerEvent( 'beforePrepareCustomStyles', self );

        $( '[data-ysc-styles]' ).each( function() {
            const $this = $( this );
            self.customStyles += YSC.replaceVars( $this.attr( 'data-ysc-styles' ) );
            $this.removeAttr( 'data-ysc-styles' );
            reloadStyles = true;
        } );

        if ( reloadStyles ) {
            let $style = $( '#ysc-blocks-custom-css-inline-css' );
            if ( ! $style.length ) {
                $style = $( '<style id="ysc-blocks-custom-css-inline-css">' ).appendTo( 'head' );
            }
            $style.html( self.customStyles );
        }

        YSC.triggerEvent( 'afterPrepareCustomStyles', self );
    }

    activateTab( $tabs, tabName ) {
        const isLegacy = ! /^#/g.test( tabName );
        let $activeBtn = false;
        const $activeTab = $tabs.children( '.ysc-tabs-content' ).children( `[data-tab="${ tabName.replace( /^#/, '' ) }"]` );

        if ( isLegacy ) {
            $activeBtn = $tabs.find( '.ysc-tabs-buttons' ).find( `[href="#tab-${ tabName }"]` );
        } else {
            $activeBtn = $tabs.find( '.ysc-tabs-buttons' ).find( `[href="${ tabName }"]` );
        }

        if ( ! $activeBtn || ! $activeBtn.length || ! $activeTab.length ) {
            return false;
        }

        $activeBtn.addClass( 'ysc-tabs-buttons-item-active' )
            .siblings().removeClass( 'ysc-tabs-buttons-item-active' );

        $activeTab.addClass( 'ysc-tab-active' )
            .siblings().removeClass( 'ysc-tab-active' );

        hasScrolled();

        return true;
    }

    /**
     * Prepare Tabs
     */
    prepareTabs() {
        const self = this;
        const pageHash = window.location.hash;

        YSC.triggerEvent( 'beforePrepareTabs', self );

        $( '.ysc-tabs:not(.ysc-tabs-ready)' ).each( function() {
            const $this = $( this );
            const tabsActive = $this.attr( 'data-tab-active' );

            // pageHash

            $this.addClass( 'ysc-tabs-ready' );

            // click action
            $this.on( 'click', '.ysc-tabs-buttons-item', function( e ) {
                e.preventDefault();

                const $thisBtn = $( this );
                const tabName = $thisBtn.attr( 'data-tab' ) || this.hash;

                self.activateTab( $this, tabName );
            } );

            // activate by page hash
            let tabActivated = false;
            if ( pageHash ) {
                tabActivated = self.activateTab( $this, pageHash );
            }

            if ( ! tabActivated && tabsActive ) {
                tabActivated = self.activateTab( $this, `#${ tabsActive }` );
            }

            // legacy
            if ( ! tabActivated && tabsActive ) {
                tabActivated = self.activateTab( $this, tabsActive );
            }
        } );

        YSC.triggerEvent( 'afterPrepareTabs', self );
    }

    /**
     * Prepare Accordions
     */
    prepareAccordions() {
        const self = this;

        YSC.triggerEvent( 'beforePrepareAccordions', self );

        $( '.ysc-accordion:not(.ysc-accordion-ready)' ).each( function() {
            $( this ).addClass( 'ysc-accordion-ready' )
                .on( 'click', '.ysc-accordion-item .ysc-accordion-item-heading', function( e ) {
                    e.preventDefault();

                    const $heading = $( this );
                    const $accordion = $heading.closest( '.ysc-accordion' );
                    const $item = $heading.closest( '.ysc-accordion-item' );
                    const $content = $item.find( '.ysc-accordion-item-content' );
                    const isActive = $item.hasClass( 'ysc-accordion-item-active' );
                    const collapseOne = $accordion.hasClass( 'ysc-accordion-collapse-one' );

                    if ( isActive ) {
                        $content.css( 'display', 'block' ).slideUp( 150 );
                        $item.removeClass( 'ysc-accordion-item-active' );
                    } else {
                        $content.css( 'display', 'none' ).slideDown( 150 );
                        $item.addClass( 'ysc-accordion-item-active' );
                    }

                    if ( collapseOne ) {
                        const $collapseItems = $accordion.find( '.ysc-accordion-item-active' ).not( $item );
                        if ( $collapseItems.length ) {
                            $collapseItems.find( '.ysc-accordion-item-content' ).css( 'display', 'block' ).slideUp( 150 );
                            $collapseItems.removeClass( 'ysc-accordion-item-active' );
                        }
                    }

                    hasScrolled();
                } );
        } );

        YSC.triggerEvent( 'afterPrepareAccordions', self );
    }

    /**
     * Prepare Carousels
     */
    prepareCarousels() {
        const self = this;

        if ( typeof window.Swiper === 'undefined' ) {
            return;
        }

        YSC.triggerEvent( 'beforePrepareCarousels', self );

        $( '.ysc-carousel:not(.ysc-carousel-ready)' ).each( function() {
            const $carousel = $( this );
            const $items = $carousel.children( '.ysc-carousel-items' );
            const options = {
                speed: ( parseFloat( $carousel.attr( 'data-speed' ) ) || 0 ) * 1000,
                effect: $carousel.attr( 'data-effect' ) || 'slide',
                fadeEffect: {
                    // fixed fade out for previous slider.
                    crossFade: true,
                },
                spaceBetween: parseFloat( $carousel.attr( 'data-gap' ) ) || 0,
                centeredSlides: $carousel.attr( 'data-centered-slides' ) === 'true',
                freeMode: $carousel.attr( 'data-free-scroll' ) === 'true',
                loop: $carousel.attr( 'data-loop' ) === 'true',
                autoplay: parseFloat( $carousel.attr( 'data-autoplay' ) ) > 0 && {
                    delay: parseFloat( $carousel.attr( 'data-autoplay' ) ) * 1000,
                    disableOnInteraction: false,
                },
                navigation: $carousel.attr( 'data-show-arrows' ) === 'true' && {
                    nextEl: '.ysc-carousel-arrow-next',
                    prevEl: '.ysc-carousel-arrow-prev',
                },
                pagination: $carousel.attr( 'data-show-bullets' ) === 'true' && {
                    el: '.ysc-carousel-bullets',
                    clickable: true,
                    dynamicBullets: $carousel.attr( 'data-dynamic-bullets' ) === 'true',
                },
                slidesPerView: parseInt( $carousel.attr( 'data-slides-per-view' ), 10 ),
                keyboard: true,
                grabCursor: true,
            };

            $carousel.addClass( 'ysc-carousel-ready swiper-container' );
            $items.addClass( 'swiper-wrapper' );
            $items.children().addClass( 'swiper-slide' );

            // add arrows
            if ( options.navigation ) {
                let $prevArrowIcon = $carousel.find( '.ysc-carousel-arrow-prev-icon' );
                let $nextArrowIcon = $carousel.find( '.ysc-carousel-arrow-next-icon' );

                if ( $prevArrowIcon.length ) {
                    $prevArrowIcon = $prevArrowIcon.html();
                } else if ( $carousel.attr( 'data-arrow-prev-icon' ) ) {
                    $prevArrowIcon = `<span class="${ $carousel.attr( 'data-arrow-prev-icon' ) }"></span>`;
                } else {
                    $prevArrowIcon = '';
                }

                if ( $nextArrowIcon.length ) {
                    $nextArrowIcon = $nextArrowIcon.html();
                } else if ( $carousel.attr( 'data-arrow-next-icon' ) ) {
                    $nextArrowIcon = `<span class="${ $carousel.attr( 'data-arrow-next-icon' ) }"></span>`;
                } else {
                    $nextArrowIcon = '';
                }

                $carousel.append( `
                    <div class="ysc-carousel-arrow ysc-carousel-arrow-prev">${ $prevArrowIcon }</div>
                    <div class="ysc-carousel-arrow ysc-carousel-arrow-next">${ $nextArrowIcon }</div>
                ` );
            }

            // add bullets
            if ( options.pagination ) {
                $carousel.append( '<div class="ysc-carousel-bullets"></div>' );
            }

            // calculate responsive.
            const breakPoints = {};
            if ( ! isNaN( options.slidesPerView ) ) {
                let count = options.slidesPerView - 1;
                let currentPoint = Math.min( self.screenSizes.length - 1, count );

                for ( ; currentPoint >= 0; currentPoint-- ) {
                    if ( count > 0 && typeof self.screenSizes[ currentPoint ] !== 'undefined' ) {
                        breakPoints[ self.screenSizes[ currentPoint ] ] = {
                            slidesPerView: count,
                        };
                    }
                    count -= 1;
                }
            }
            options.breakpoints = breakPoints;

            // init swiper
            new window.Swiper( $carousel[ 0 ], options );
        } );

        YSC.triggerEvent( 'afterPrepareCarousels', self );
    }

    // set video size
    setFullscreenVideoSize() {
        const self = this;
        const wnd = self.getWnd();
        $( '.ysc-video-fullscreen:visible .ysc-video-fullscreen-frame' ).each( function() {
            const $this = $( this );
            const aspectRatio = $this.data( 'ysc-video-aspect-ratio' ) || 16 / 9;
            let resultW;
            let resultH;

            if ( aspectRatio > wnd.w / wnd.h ) {
                resultW = wnd.w * 0.9;
                resultH = resultW / aspectRatio;
            } else {
                resultH = wnd.h * 0.9;
                resultW = resultH * aspectRatio;
            }

            $this.css( {
                width: resultW,
                height: resultH,
                top: ( wnd.h - resultH ) / 2,
                left: ( wnd.w - resultW ) / 2,
            } );
        } );
    }

    /**
     * Prepare Video
     */
    prepareVideo() {
        const self = this;

        if ( typeof window.VideoWorker === 'undefined' ) {
            return;
        }

        YSC.triggerEvent( 'beforePrepareVideo', self );

        $( '.ysc-video:not(.ysc-video-ready)' ).each( function() {
            const $this = $( this ).addClass( 'ysc-video-ready' );
            const url = $this.attr( 'data-video' );
            const clickAction = $this.attr( 'data-click-action' );

            const videoAutoplay = $this.attr( 'data-video-autoplay' ) === 'true';
            const videoAutopause = $this.attr( 'data-video-autopause' ) === 'true';

            let fullscreenCloseIcon = $this.find( '.ysc-video-fullscreen-close-icon' );
            if ( fullscreenCloseIcon.length ) {
                fullscreenCloseIcon = fullscreenCloseIcon.html();
            } else if ( $this.attr( 'data-fullscreen-action-close-icon' ) ) {
                fullscreenCloseIcon = `<span class="${ $this.attr( 'data-fullscreen-action-close-icon' ) }"></span>`;
            } else {
                fullscreenCloseIcon = '';
            }

            const fullscreenBackgroundColor = $this.attr( 'data-fullscreen-background-color' );

            let $poster = $this.find( '.ysc-video-poster' );
            let $fullscreenWrapper = false;
            let $iframe = false;
            let mute = 0;

            let aspectRatio = $this.attr( 'data-video-aspect-ratio' );
            if ( aspectRatio && aspectRatio.split( ':' )[ 0 ] && aspectRatio.split( ':' )[ 1 ] ) {
                aspectRatio = aspectRatio.split( ':' )[ 0 ] / aspectRatio.split( ':' )[ 1 ];
            } else {
                aspectRatio = 16 / 9;
            }

            // mute if volume 0
            if ( ! parseFloat( $this.attr( 'data-video-volume' ) ) ) {
                mute = 1;
            }

            // mute if autoplay
            if ( videoAutoplay ) {
                mute = 1;
            }

            const api = new window.VideoWorker( url, {
                autoplay: 0,
                loop: 0,
                mute: mute,
                volume: parseFloat( $this.attr( 'data-video-volume' ) ) || 0,
                showContols: 1,
            } );

            if ( api && api.isValid() ) {
                let loaded = 0;
                let clicked = 0;
                let isPlaying = false;

                // add play event
                $this.on( 'click', function() {
                    if ( clicked ) {
                        return;
                    }
                    clicked = 1;

                    // fullscreen video
                    if ( 'fullscreen' === clickAction ) {
                        // add loading button
                        if ( ! loaded ) {
                            $this.addClass( 'ysc-video-loading' );

                            api.getIframe( ( iframe ) => {
                                // add iframe
                                $iframe = $( iframe );
                                const $parent = $iframe.parent();

                                $fullscreenWrapper = $( `<div class="ysc-video-fullscreen" style="background-color: ${ fullscreenBackgroundColor };">` )
                                    .appendTo( 'body' )
                                    .append( $( `<div class="ysc-video-fullscreen-close">${ fullscreenCloseIcon }</div>` ) )
                                    .append( $( '<div class="ysc-video-fullscreen-frame">' ).append( $iframe ) );
                                $fullscreenWrapper.data( 'ysc-video-aspect-ratio', aspectRatio );
                                $parent.remove();

                                $fullscreenWrapper.fadeIn( 200 );

                                $fullscreenWrapper.on( 'click', '.ysc-video-fullscreen-close', () => {
                                    api.pause();
                                    $fullscreenWrapper.fadeOut( 200 );
                                } );

                                self.setFullscreenVideoSize();
                                api.play();
                            } );

                            loaded = 1;
                        } else if ( $fullscreenWrapper ) {
                            $fullscreenWrapper.fadeIn( 200 );
                            api.play();
                        }

                    // plain video
                    } else if ( ! loaded ) {
                        $this.addClass( 'ysc-video-loading' );

                        api.getIframe( ( iframe ) => {
                            // add iframe
                            $iframe = $( iframe );
                            const $parent = $iframe.parent();
                            $( '<div class="ysc-video-frame">' ).appendTo( $this ).append( $iframe );
                            $parent.remove();
                            api.play();
                        } );

                        loaded = 1;
                    } else {
                        api.play();
                    }
                } );

                // set thumb
                if ( ! $poster.length ) {
                    api.getImageURL( function( imgSrc ) {
                        $poster = $( `<div class="ysc-video-poster"><img src="${ imgSrc }" alt=""></div>` );
                        $this.append( $poster );
                    } );
                }

                let autoplayOnce = false;

                api.on( 'ready', () => {
                    $this.removeClass( 'ysc-video-loading' );
                    if ( 'fullscreen' !== clickAction ) {
                        $this.addClass( 'ysc-video-playing' );
                    }
                    api.play();
                } );
                api.on( 'play', () => {
                    isPlaying = true;
                } );
                api.on( 'pause', () => {
                    isPlaying = false;
                    autoplayOnce = true;
                    if ( 'fullscreen' === clickAction ) {
                        clicked = 0;
                    }
                } );

                if ( 'fullscreen' !== clickAction && ( videoAutoplay || videoAutopause ) ) {
                    throttleScroll( () => {
                        // autoplay
                        if ( ! autoplayOnce && ! isPlaying && videoAutoplay && self.isElementInViewport( $this[ 0 ], 0.6 ) ) {
                            if ( clicked ) {
                                api.play();
                            } else {
                                $this.click();
                            }
                        }

                        // autopause
                        if ( isPlaying && videoAutopause && ! self.isElementInViewport( $this[ 0 ], 0.6 ) ) {
                            api.pause();
                        }
                    } );
                }
            }
        } );

        YSC.triggerEvent( 'afterPrepareVideo', self );
    }

     /**
     * Prepare Gist
     */
    prepareGist() {
        const self = this;

        if ( typeof jQuery.fn.gistsimple === 'undefined' ) {
            return;
        }

        YSC.triggerEvent( 'beforePrepareGist', self );

        $( '.ysc-gist:not(.ysc-gist-ready)' ).each( function() {
            const $this = $( this );
            $this.addClass( 'ysc-gist-ready' );

            const match = /^https:\/\/gist.github.com?.+\/(.+)/g.exec( $this.attr( 'data-url' ) );

            if ( match && typeof match[ 1 ] !== 'undefined' ) {
                $this.gistsimple( {
                    id: match[ 1 ],
                    file: $this.attr( 'data-file' ),
                    caption: $this.attr( 'data-caption' ),
                    showFooter: $this.attr( 'data-show-footer' ) === 'true',
                    showLineNumbers: $this.attr( 'data-show-line-numbers' ) === 'true',
                } );
            }
        } );

        YSC.triggerEvent( 'afterPrepareGist', self );
    }

    /**
     * Prepare Changelog
     */
    prepareChangelog() {
        const self = this;

        YSC.triggerEvent( 'beforePrepareChangelog', self );

        $( '.ysc-changelog:not(.ysc-changelog-ready)' ).each( function() {
            const $this = $( this );
            $this.addClass( 'ysc-changelog-ready' );

            // add badges.
            $this.children( '.ysc-changelog-more' ).find( '> ul li, > ol li' ).each( function() {
                const $li = $( this );
                const text = $.trim( $li.html() );
                const typeMatches = text.match( /^\[(new|added|fixed|improved|updated|removed|changed)\]\s(.*)/i );

                if ( typeMatches ) {
                    const changeType = typeMatches[ 1 ];
                    const changeDescription = typeMatches[ 2 ];

                    let className = 'ysc-badge';

                    switch ( changeType.toLowerCase() ) {
                    case 'added':
                    case 'new':
                        className += ' ysc-badge-success';
                        break;
                    case 'fixed':
                    case 'improved':
                    case 'updated':
                        className += ' ysc-badge-primary';
                        break;
                    case 'removed':
                        className += ' ysc-badge-danger';
                        break;
                    }

                    $li.html( `<span class="${ className }">${ changeType }</span> ${ changeDescription }` );
                }
            } );
        } );

        YSC.triggerEvent( 'afterPrepareChangelog', self );
    }

    /**
     * Prepare Google Maps
     */
    prepareGoogleMaps() {
        const self = this;

        if ( YSC.googleMapsLibrary && YSC.googleMapsAPIKey ) {
            YSC.triggerEvent( 'beforePrepareGoogleMaps', self );

            $( '.ysc-google-maps:not(.ysc-google-maps-ready)' ).each( function() {
                const $this = $( this );
                $this.addClass( 'ysc-google-maps-ready' );

                scriptjs( `${ YSC.googleMapsAPIUrl }&key=${ YSC.googleMapsAPIKey }`, () => {
                    scriptjs( YSC.googleMapsLibrary.url, () => {
                        YSC.triggerEvent( 'beforePrepareGoogleMapsStart', self, $this );

                        let styles = '';
                        let markers = '';

                        try {
                            styles = JSON.parse( $this.attr( 'data-styles' ) );
                        } catch ( e ) { }

                        const $markers = $this.find( '.ysc-google-maps-marker' );
                        if ( $markers.length ) {
                            markers = [];

                            $markers.each( function() {
                                markers.push( $( this ).data() );
                            } );

                        // old way.
                        } else if ( $this.attr( 'data-markers' ) ) {
                            try {
                                markers = JSON.parse( $this.attr( 'data-markers' ) );
                            } catch ( e ) { }
                        }

                        const opts = {
                            div: $this[ 0 ],
                            lat: parseFloat( $this.attr( 'data-lat' ) ),
                            lng: parseFloat( $this.attr( 'data-lng' ) ),
                            zoom: parseInt( $this.attr( 'data-zoom' ), 10 ),
                            zoomControl: 'true' === $this.attr( 'data-show-zoom-buttons' ),
                            zoomControlOpt: {
                                style: 'DEFAULT',
                                position: 'RIGHT_BOTTOM',
                            },
                            mapTypeControl: 'true' === $this.attr( 'data-show-map-type-buttons' ),
                            streetViewControl: 'true' === $this.attr( 'data-show-street-view-button' ),
                            fullscreenControl: 'true' === $this.attr( 'data-show-fullscreen-button' ),
                            scrollwheel: 'true' === $this.attr( 'data-option-scroll-wheel' ),
                            draggable: 'true' === $this.attr( 'data-option-draggable' ),
                            styles: styles,
                        };

                        const mapObject = new window.GMaps( opts );

                        // add gestureHandling
                        const gestureHandling = $this.attr( 'data-gesture-handling' );
                        if ( mapObject && 'cooperative' === gestureHandling ) {
                            mapObject.setOptions( {
                                gestureHandling,
                                scrollwheel: opts.scrollwheel ? null : opts.scrollwheel,
                            } );
                        }

                        if ( markers && markers.length ) {
                            mapObject.addMarkers( markers );
                        }

                        YSC.triggerEvent( 'beforePrepareGoogleMapsEnd', self, $this, mapObject );
                    } );
                } );
            } );

            YSC.triggerEvent( 'afterPrepareGoogleMaps', self );
        }
    }

    /**
     * Prepare ScrollReveal
     */
    prepareSR() {
        const self = this;

        if ( ! window.ScrollReveal ) {
            return;
        }

        const {
            reveal,
        } = window.ScrollReveal();

        YSC.triggerEvent( 'beforePrepareSR', self );

        $( '[data-ysc-sr]:not(.data-ysc-sr-ready)' ).each( function() {
            const $element = $( this );
            console.log($element);
            

            $element.addClass( 'data-ysc-sr-ready' );

            const data = $element.attr( 'data-ysc-sr' );
            const config = parseSRConfig( data );

            config.afterReveal = () => {
                $element.removeAttr( 'data-ysc-sr' );
                $element.removeClass( 'data-ysc-sr-ready' );
            };

            reveal( this, config );
        } );

        YSC.triggerEvent( 'afterPrepareSR', self );
    }
}

YSC.classObject = new YSCClass();
