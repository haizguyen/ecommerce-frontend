import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Compact five-star rating display. Renders a filled overlay clipped to the
 * rating fraction over an empty track, so half/partial stars read accurately.
 */
@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="stars" [attr.aria-label]="rating + ' out of 5'" role="img">
      <span class="track">★★★★★</span>
      <span class="fill" [style.width.%]="(rating / 5) * 100">★★★★★</span>
    </span>
    <span class="value" *ngIf="showValue">{{ rating.toFixed(1) }}</span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        line-height: 1;
      }
      .stars {
        position: relative;
        display: inline-block;
        font-size: 14px;
        letter-spacing: 1px;
      }
      .track {
        color: #dcdbd4;
      }
      .fill {
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
        white-space: nowrap;
        color: #f5a623;
      }
      .value {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--ink-2);
      }
    `
  ]
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() showValue = true;
}
