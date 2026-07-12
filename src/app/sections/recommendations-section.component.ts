import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Homepage recommendations placeholder — 4 skeleton cards with an overlay
 * pill announcing future ML-powered personalization.
 *
 * Always-inherent placeholder: no data fetching, no inputs, no outputs.
 */
@Component({
  selector: 'app-recommendations-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section" aria-labelledby="rec-title">
      <div class="section-head">
        <div>
          <span class="eyebrow">For you</span>
          <h2 id="rec-title">Picked for you</h2>
        </div>
      </div>
      <div class="rec-wrap">
        <div class="grid-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton sk-card"></div>
          }
        </div>
        <div class="rec-overlay">
          <div class="rec-pill">Personalized recommendations coming soon</div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .rec-wrap {
      position: relative;
    }
    .rec-overlay {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      z-index: 5;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      border-radius: var(--r-lg);
    }
    .rec-pill {
      background: var(--surface);
      padding: 12px 24px;
      border-radius: var(--r-pill);
      box-shadow: var(--shadow-sm);
      font-size: 14px;
      font-weight: 550;
      color: var(--ink-2);
      pointer-events: none;
      user-select: none;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .sk-card {
      aspect-ratio: 3 / 4;
    }
    @media (max-width: 980px) {
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      .grid-4 { grid-template-columns: 1fr; }
    }
  `]
})
export class RecommendationsSectionComponent {}
