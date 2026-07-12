import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { CatalogService } from '../data/catalog.service';
import type { Testimonial } from '../data/models';
import { StarRatingComponent } from '../shared/star-rating.component';
import { getInitials } from './testimonials-section.util';

/**
 * Homepage testimonials section — 3-column grid of customer quote cards.
 *
 * Each card displays an avatar (or initials fallback), star rating, quote
 * text clamped to 3 lines, author name, and optional title. Empty response
 * hides the section entirely.
 */
@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [StarRatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section" aria-label="Customer testimonials">
      @if (loading()) {
        <div class="section-head">
          <div>
            <span class="eyebrow">Real reviews</span>
            <h2>What our customers say</h2>
          </div>
        </div>
        <div class="test-grid">
          @for (i of [1,2,3]; track i) {
            <div class="sk-test card">
              <div class="sk-test-row">
                <div class="skeleton sk-test-avatar"></div>
                <div class="skeleton sk-test-line wide" style="height:16px;"></div>
              </div>
              <div class="skeleton sk-test-line wide"></div>
              <div class="skeleton sk-test-line med"></div>
              <div class="skeleton sk-test-line narrow"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="section-head">
          <div>
            <span class="eyebrow">Real reviews</span>
            <h2>What our customers say</h2>
          </div>
        </div>
        <div class="section-error">
          <p>Something went wrong loading this section.</p>
          <button class="btn btn-outline" (click)="retry()">Retry</button>
        </div>
      } @else if (testimonials(); as list) {
        <div class="section-head">
          <div>
            <span class="eyebrow">Real reviews</span>
            <h2>What our customers say</h2>
          </div>
        </div>
        <div class="test-grid">
          @for (t of list; track t.id) {
            <div class="test-card card">
              <div class="test-head">
                @if (t.avatarUrl && !imgFailed().has(t.id)) {
                  <img
                    class="test-avatar"
                    [src]="t.avatarUrl"
                    alt=""
                    loading="lazy"
                    (error)="onImgError(t.id)" />
                } @else {
                  <div class="test-avatar-init" aria-hidden="true">{{ getInitials(t.authorName) }}</div>
                }
                <div>
                  <app-star-rating [rating]="t.rating" [showValue]="false"></app-star-rating>
                </div>
              </div>
              <p class="test-quote">{{ t.quote }}</p>
              <div>
                <div class="test-author">{{ t.authorName }}</div>
                @if (t.authorTitle) {
                  <div class="test-title">{{ t.authorTitle }}</div>
                }
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .test-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .test-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .test-head {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .test-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--r-pill);
      object-fit: cover;
      flex-shrink: 0;
    }
    .test-avatar-init {
      width: 48px;
      height: 48px;
      border-radius: var(--r-pill);
      flex-shrink: 0;
      display: grid;
      place-items: center;
      font-size: 16px;
      font-weight: 700;
      color: var(--ink-3);
      background: linear-gradient(135deg, #efeee9, #e3e2dc);
    }
    .test-quote {
      font-size: 15px;
      font-style: italic;
      color: var(--ink-2);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
    }
    .test-author {
      font-size: 14px;
      font-weight: 600;
    }
    .test-title {
      font-size: 13px;
      color: var(--ink-2);
    }
    .sk-test {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border: 1px solid var(--line);
      border-radius: var(--r-lg);
    }
    .sk-test-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sk-test-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--r-pill);
      flex-shrink: 0;
    }
    .sk-test-line {
      height: 14px;
      border-radius: var(--r-sm);
    }
    .sk-test-line.wide { width: 85%; }
    .sk-test-line.med { width: 60%; }
    .sk-test-line.narrow { width: 40%; }
    .section-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px 20px;
      text-align: center;
    }
    .section-error p {
      margin: 0;
      font-size: 15px;
    }
    @media (max-width: 980px) {
      .test-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TestimonialsSectionComponent {
  private readonly catalog = inject(CatalogService);

  readonly testimonials = signal<Testimonial[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly imgFailed = signal<Set<string>>(new Set());

  constructor() {
    this.load();
  }

  getInitials(name: string): string {
    return getInitials(name);
  }

  onImgError(id: string): void {
    this.imgFailed.update(s => {
      const next = new Set(s);
      next.add(id);
      return next;
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalog.getTestimonials().subscribe({
      next: (list) => {
        this.testimonials.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  retry(): void {
    this.load();
  }
}
