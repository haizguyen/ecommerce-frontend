import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Homepage hero — full-width billboard.
 *
 * Pure presentational; no data fetching, no inputs, no outputs.
 * Extracted from the inline hero in `HomeComponent` (S7 refactor).
 */
@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="container hero-in">
        <div class="hero-copy">
          <span class="eyebrow">New season · 2026</span>
          <h1>Considered gear for the modern desk.</h1>
          <p class="lede muted">
            Audio, peripherals and displays chosen for how they feel every day — not just how
            they spec. Free shipping over $99.
          </p>
          <div class="hero-cta">
            <a class="btn btn-lg" routerLink="/products">Shop the catalogue</a>
            <a class="btn btn-lg btn-outline" routerLink="/products" [queryParams]="{ category: 'audio' }"
              >Explore audio</a
            >
          </div>
          <div class="trust">
            <span>★ 4.6 average rating</span>
            <span class="dot">·</span>
            <span>30-day returns</span>
            <span class="dot">·</span>
            <span>2-year warranty</span>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="blob b1"></div>
          <div class="blob b2"></div>
          <div class="glass">◆</div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        background: radial-gradient(120% 120% at 85% 10%, #eef0ff 0%, transparent 55%),
          var(--surface);
        border-bottom: 1px solid var(--line);
      }
      .hero-in {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 40px;
        align-items: center;
        padding-block: 72px;
      }
      .hero-copy h1 {
        font-size: clamp(34px, 5vw, 58px);
        line-height: 1.03;
        margin: 14px 0 18px;
      }
      .lede {
        font-size: 17px;
        max-width: 460px;
      }
      .hero-cta {
        display: flex;
        gap: 12px;
        margin: 28px 0 22px;
        flex-wrap: wrap;
      }
      .trust {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13.5px;
        color: var(--ink-2);
      }
      .trust .dot {
        color: var(--ink-3);
      }
      .hero-art {
        position: relative;
        height: 340px;
      }
      .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(6px);
        opacity: 0.9;
      }
      .b1 {
        width: 260px;
        height: 260px;
        right: 20px;
        top: 10px;
        background: radial-gradient(circle at 30% 30%, #c7ccff, #8b93f5);
      }
      .b2 {
        width: 170px;
        height: 170px;
        left: 30px;
        bottom: 0;
        background: radial-gradient(circle at 30% 30%, #ffe0c2, #ffb27a);
      }
      .glass {
        position: absolute;
        inset: 0;
        margin: auto;
        width: 150px;
        height: 150px;
        display: grid;
        place-items: center;
        font-size: 60px;
        color: var(--accent);
        background: rgba(255, 255, 255, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: var(--r-xl);
        box-shadow: var(--shadow-lg);
        backdrop-filter: blur(8px);
      }

      @media (prefers-color-scheme: dark) {
        .hero {
          background: radial-gradient(120% 120% at 85% 10%, rgba(129,140,248,0.15) 0%, transparent 55%),
            var(--surface);
        }
        .b1 { background: radial-gradient(circle at 30% 30%, #6366f1, #4338ca); opacity: 0.3; }
        .b2 { background: radial-gradient(circle at 30% 30%, #f59e0b, #d97706); opacity: 0.2; }
        .glass { background: color-mix(in srgb, var(--surface) 75%, transparent); border-color: var(--line); }
      }
      :root.dark .hero {
        background: radial-gradient(120% 120% at 85% 10%, rgba(129,140,248,0.15) 0%, transparent 55%),
          var(--surface);
      }
      :root.dark .b1 { background: radial-gradient(circle at 30% 30%, #6366f1, #4338ca); opacity: 0.3; }
      :root.dark .b2 { background: radial-gradient(circle at 30% 30%, #f59e0b, #d97706); opacity: 0.2; }
      :root.dark .glass { background: color-mix(in srgb, var(--surface) 75%, transparent); border-color: var(--line); }

      @media (max-width: 980px) {
        .hero-in {
          grid-template-columns: 1fr;
        }
        .hero-art {
          display: none;
        }
      }
    `
  ]
})
export class HeroSectionComponent {}
