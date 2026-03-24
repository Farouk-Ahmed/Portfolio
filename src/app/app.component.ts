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

/** Globals from index.html (jQuery, Qi Addons, WOW). */
declare global {
  interface Window {
    jQuery?: (selector: string) => JQueryLike;
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

  /** Latest Creative Works — first card: `public/.../proj-1/manifest.json`. */
  readonly proj1Base = 'wp-content/uploads/2024/Projects/proj-1/';
  proj1Images: string[] = [];

  /** Latest Creative Works — second card: `public/.../proj-2/manifest.json`. */
  readonly proj2Base = 'wp-content/uploads/2024/Projects/proj-2/';
  proj2Images: string[] = [];

  private readonly formSubmitAjaxUrl = 'https://formsubmit.co/ajax/faroukola99@gmail.com';
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private wowInitialized = false;
  private qiCounterInited = false;
  private proj1Swiper: { destroy: (deleteInstance?: boolean, cleanStyle?: boolean) => void } | null =
    null;
  private proj2Swiper: { destroy: (deleteInstance?: boolean, cleanStyle?: boolean) => void } | null =
    null;

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

    forkJoin({
      proj1: this.http.get<string[]>(`${this.proj1Base}manifest.json`).pipe(
        catchError(() => of([] as string[])),
        map((files) => toUrls(files, this.proj1Base))
      ),
      proj2: this.http.get<string[]>(`${this.proj2Base}manifest.json`).pipe(
        catchError(() => of([] as string[])),
        map((files) => toUrls(files, this.proj2Base))
      )
    }).subscribe(({ proj1, proj2 }) => {
      this.proj1Images =
        proj1.length > 0 ? proj1 : ['wp-content/uploads/2024/11/work1-1.jpg'];
      this.proj2Images =
        proj2.length > 0 ? proj2 : ['wp-content/uploads/2024/11/work2-1.jpg'];
      setTimeout(() => this.reinitMonoAndQiScripts(), 0);
    });
  }

  ngOnDestroy(): void {
    this.proj1Swiper?.destroy(true, true);
    this.proj1Swiper = null;
    this.proj2Swiper?.destroy(true, true);
    this.proj2Swiper = null;
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

      // Initialize Magnific Popup for portfolio gallery
      const portfolioIcons = $('.magnific-trigger');
      if (portfolioIcons.length && typeof (portfolioIcons as any).magnificPopup === 'function') {
        (portfolioIcons as any).magnificPopup({
          type: 'image',
          gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1]
          },
          mainClass: 'mfp-fade-scale mfp-custom-rounded',
          removalDelay: 300, // delay for animation
          fixedContentPos: false, // Prevents locking the background scroll
          closeOnBgClick: true,
          closeBtnInside: true,
          image: {
            titleSrc: function (item: any) {
              return item.el.attr('aria-label') || '';
            }
          }
        });
      }

      const SwiperCtor = w.Swiper;
      const swiperEl1 = document.getElementById('portfolio-proj1-swiper');
      if (SwiperCtor && swiperEl1 && this.proj1Images.length > 0) {
        this.proj1Swiper?.destroy(true, true);
        this.proj1Swiper = null;
        const paginationEl = swiperEl1.querySelector('.portfolio-proj1-pagination');
        const opt1: Record<string, unknown> = {
          loop: this.proj1Images.length > 1,
          speed: 500
        };
        if (paginationEl && this.proj1Images.length > 1) {
          opt1['pagination'] = { el: paginationEl, clickable: true };
        }
        this.proj1Swiper = new SwiperCtor(swiperEl1, opt1);
      }

      const swiperEl2 = document.getElementById('portfolio-proj2-swiper');
      if (SwiperCtor && swiperEl2 && this.proj2Images.length > 0) {
        this.proj2Swiper?.destroy(true, true);
        this.proj2Swiper = null;
        const paginationEl2 = swiperEl2.querySelector('.portfolio-proj2-pagination');
        const opt2: Record<string, unknown> = {
          loop: this.proj2Images.length > 1,
          speed: 500
        };
        if (paginationEl2 && this.proj2Images.length > 1) {
          opt2['pagination'] = { el: paginationEl2, clickable: true };
        }
        this.proj2Swiper = new SwiperCtor(swiperEl2, opt2);
      }
    } catch (e) {
      console.warn('reinitMonoAndQiScripts:', e);
    }
  }
}
