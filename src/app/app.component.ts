import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Minimal jQuery surface used for Mono/Qi re-init (loaded from index.html). */
interface JQueryLike {
  length: number;
  find(selector: string): JQueryLike;
  first(): JQueryLike;
}

/** Swiper instance subset we interact with. */
interface SwiperInstance {
  destroy: (deleteInstance?: boolean, cleanStyle?: boolean) => void;
}

/** A single "Latest Creative Works" card backed by a `proj-N/manifest.json`. */
interface WorkProject {
  /** Public path prefix, e.g. `wp-content/uploads/2024/Projects/proj-1/`. */
  base: string;
  title: string;
  description: string;
  githubUrl: string;
  /** Unique id for the swiper element, e.g. `portfolio-proj1-swiper`. */
  swiperId: string;
  /** Pagination element class, e.g. `portfolio-proj1-pagination`. */
  paginationClass: string;
  /** Magnific gallery group key, e.g. `proj1`. */
  galleryId: string;
  /** Fallback image shown when the manifest is empty/missing. */
  fallback: string;
  /** Resolved, sanitized image URLs from the manifest. */
  images: string[];
  swiper: SwiperInstance | null;
}

/** Globals from index.html (jQuery, Qi Addons, WOW). */
declare global {
  interface Window {
    jQuery?: ((selector: string) => JQueryLike) & ((element: Element) => JQueryLike);
    qodefAddonsCore?: {
      qodefAppear?: { init: () => void };
      shortcodes?: Record<
        string,
        {
          qodefAnimatedText?: { init: () => void };
          qodefTimeline?: { init: () => void };
          qodefCounter?: { init: () => void };
        }
      >;
    };
    WOW?: new (options?: Record<string, unknown>) => { init: () => void };
    Swiper?: new (
      el: string | Element,
      options?: Record<string, unknown>
    ) => { destroy: (deleteInstance?: boolean, cleanStyle?: boolean) => void };
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'newv';
  isScrollUpVisible = false;
  contactSubmitting = false;
  contactSuccess = false;
  contactError = '';
  
  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /** Latest Creative Works — each card is an independent `proj-N` folder. */
  readonly works: WorkProject[] = [
    {
      base: 'wp-content/uploads/2024/Projects/proj-1/',
      title: 'Academic Excellence',
      description:
        'A comprehensive school management platform connecting teachers, students, and parents in one place. Features role-based access with tailored permissions for every user, plus a powerful dashboard for tracking academic progress and daily operations.',
      githubUrl: 'https://github.com/Farouk-Ahmed/Academic-Excellence',
      swiperId: 'portfolio-proj1-swiper',
      paginationClass: 'portfolio-proj1-pagination',
      galleryId: 'proj1',
      fallback: 'wp-content/uploads/2024/11/work1-1.jpg',
      images: [],
      swiper: null
    },
    {
      base: 'wp-content/uploads/2024/Projects/proj-2/',
      title: 'FAO Blog',
      description:
        'A modern technology blog for discovering and sharing the latest in tech. Backed by an intuitive admin dashboard that makes publishing articles and managing content and users effortless.',
      githubUrl: 'https://github.com/Farouk-Ahmed/FAO-Blog',
      swiperId: 'portfolio-proj2-swiper',
      paginationClass: 'portfolio-proj2-pagination',
      galleryId: 'proj2',
      fallback: 'wp-content/uploads/2024/11/work2-1.jpg',
      images: [],
      swiper: null
    },
    {
      base: 'wp-content/uploads/2024/Projects/proj-3/',
      title: 'FAO E-commerce',
      description:
        'An e-commerce storefront for computers, tech gadgets, and accessories. Features a scroll-driven product showcase, category filters, and interactive flip cards with light and dark theming for a premium shopping experience.',
      githubUrl: 'https://github.com/Farouk-Ahmed/-E-commerce',
      swiperId: 'portfolio-proj3-swiper',
      paginationClass: 'portfolio-proj3-pagination',
      galleryId: 'proj3',
      fallback: 'wp-content/uploads/2024/11/work3-1.jpg',
      images: [],
      swiper: null
    },
    {
      base: 'wp-content/uploads/2024/Projects/proj-4/',
      title: 'FAO Books Store',
      description:
        'An online store for technology and programming books, featuring a dark neumorphic UI, full Arabic/English support with RTL switching, a live shopping cart, and a Web3 wallet connection at checkout.',
      githubUrl: 'https://github.com/Farouk-Ahmed/FAO-Books-Store',
      swiperId: 'portfolio-proj4-swiper',
      paginationClass: 'portfolio-proj4-pagination',
      galleryId: 'proj4',
      fallback: 'wp-content/uploads/2024/11/work4-1.jpg',
      images: [],
      swiper: null
    }
  ];

  private readonly formSubmitAjaxUrl = 'https://formsubmit.co/ajax/faroukola99@gmail.com';
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private wowInitialized = false;
  private qiCounterInited = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrollUpVisible = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Sends contact form to faroukola99@gmail.com via FormSubmit (no backend).
   * First submission: check inbox for FormSubmit activation link before messages arrive.
   */
  onContactSubmit(event: Event): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const nameEl = form.elements.namedItem('name') as HTMLInputElement;
    const emailEl = form.elements.namedItem('email') as HTMLInputElement;
    const messageEl = form.elements.namedItem('message') as HTMLTextAreaElement;
    const honeyEl = form.elements.namedItem('_honey') as HTMLInputElement | null;
    const honeypot = honeyEl?.value?.trim() ?? '';

    let params = new HttpParams()
      .set('name', nameEl.value.trim())
      .set('email', emailEl.value.trim())
      .set('message', messageEl.value.trim())
      .set('_subject', 'New message — FAO portfolio contact')
      .set('_captcha', 'false')
      .set('_template', 'table');
    if (honeypot) {
      params = params.set('_honey', honeypot);
    }

    this.contactSubmitting = true;
    this.contactSuccess = false;
    this.contactError = '';

    this.http
      .post<{ success?: boolean }>(this.formSubmitAjaxUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        }
      })
      .subscribe({
        next: (res) => {
          this.contactSubmitting = false;
          if (res && res.success === false) {
            this.contactError = 'Could not send. Please try again or email faroukola99@gmail.com directly.';
            return;
          }
          this.contactSuccess = true;
          form.reset();
        },
        error: () => {
          this.contactSubmitting = false;
          this.contactError =
            'Could not send right now. Please try again or email faroukola99@gmail.com directly.';
        }
      });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const toUrls = (files: string[] | null | undefined, base: string): string[] =>
      (files ?? [])
        .filter(
          (f) => typeof f === 'string' && f.length > 0 && !f.includes('..') && !f.includes('/')
        )
        .map((f) => base + f);

    const requests = this.works.map((work) =>
      this.http.get<string[]>(`${work.base}manifest.json`).pipe(
        catchError(() => of([] as string[])),
        map((files) => toUrls(files, work.base))
      )
    );

    forkJoin(requests).subscribe((results) => {
      results.forEach((images, i) => {
        this.works[i].images = images.length > 0 ? images : [this.works[i].fallback];
      });
      setTimeout(() => this.reinitMonoAndQiScripts(), 0);
    });
  }

  ngOnDestroy(): void {
    this.works.forEach((work) => {
      work.swiper?.destroy(true, true);
      work.swiper = null;
    });
  }

  ngAfterViewInit(): void {
    // Theme + Qi scripts run on document.ready before Angular paints app-root — re-run after view exists.
    const run = () => this.reinitMonoAndQiScripts();
    setTimeout(run, 0);
    setTimeout(run, 200);
    if (typeof window !== 'undefined') {
      window.addEventListener('load', run, { once: true });
    }
  }

  private reinitMonoAndQiScripts(): void {
    const w = window;
    const $ = w.jQuery;
    if (!$ || !w.qodefAddonsCore) {
      return;
    }

    try {
      const core = w.qodefAddonsCore;

      const animated = core.shortcodes?.['qi_addons_for_elementor_animated_text']?.qodefAnimatedText;
      if (animated?.init) {
        const $el = $('.qodef-qi-animated-text.qodef--animated-by-letter').first();
        if ($el.length && !$el.find('.qodef-e-character').length) {
          animated.init();
        }
      }

      core.qodefAppear?.init();

      core.shortcodes?.['qi_addons_for_elementor_timeline']?.qodefTimeline?.init();

      if (!this.qiCounterInited && $('.qodef-qi-counter').length) {
        const counterMod = core.shortcodes?.['qi_addons_for_elementor_counter']?.qodefCounter;
        if (counterMod?.init) {
          this.qiCounterInited = true;
          counterMod.init();
        }
      }

      if (!this.wowInitialized && w.WOW && $('.wow').length) {
        this.wowInitialized = true;
        new w.WOW({
          boxClass: 'wow',
          animateClass: 'animated',
          offset: 0,
          mobile: false,
          live: true
        }).init();
      }

      // Initialize Magnific Popup separately per gallery group
      const galleries = document.querySelectorAll('[data-gallery]');
      galleries.forEach(function (galleryEl) {
        const $gallery = $(galleryEl as HTMLElement) as any;
        const items = $gallery.find('.work-card__gallery-item');
        if (items.length && typeof $gallery.magnificPopup === 'function') {
          $gallery.magnificPopup({
            delegate: '.work-card__gallery-item',
            type: 'image',
            gallery: {
              enabled: true,
              navigateByImgClick: true,
              preload: [0, 1]
            },
            mainClass: 'mfp-fade-scale mfp-custom-rounded',
            removalDelay: 300,
            fixedContentPos: false,
            closeOnBgClick: true,
            closeBtnInside: true,
            image: {
              titleSrc: function (item: any) {
                return item.el.attr('aria-label') || '';
              }
            }
          });
        }
      });

      const SwiperCtor = w.Swiper;
      if (SwiperCtor) {
        this.works.forEach((work) => {
          const swiperEl = document.getElementById(work.swiperId);
          if (!swiperEl || work.images.length === 0) {
            return;
          }
          work.swiper?.destroy(true, true);
          work.swiper = null;
          const paginationEl = swiperEl.querySelector(`.${work.paginationClass}`);
          const opt: Record<string, unknown> = {
            loop: work.images.length > 1,
            speed: 500
          };
          if (paginationEl && work.images.length > 1) {
            opt['pagination'] = { el: paginationEl, clickable: true };
          }
          work.swiper = new SwiperCtor(swiperEl, opt);
        });
      }
    } catch (e) {
      console.warn('reinitMonoAndQiScripts:', e);
    }
  }
}
