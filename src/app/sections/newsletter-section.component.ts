import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { CatalogService } from '../data/catalog.service';

/**
 * Homepage newsletter signup section — full-width accent-soft background.
 *
 * Manages 5 states: idle (form visible), validation (inline error on
 * invalid email), submitting (disabled form), success (thank-you message
 * replaces form), error (inline error with form still interactive).
 */
@Component({
  selector: 'app-newsletter-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="newsletter-section" aria-label="Newsletter signup">
      <div class="newsletter-inner">
        @if (success()) {
          <div class="newsletter-success">
            <svg
              class="newsletter-check"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="24" cy="24" r="24" fill="var(--accent)" />
              <path
                d="M14 24l7 7 13-13"
                stroke="#fff"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <h2 class="newsletter-heading">Thanks for subscribing!</h2>
            <p class="muted">Check your inbox for 10% off.</p>
          </div>
        } @else {
          <h2 class="newsletter-heading">Stay in the loop</h2>
          <p class="muted">Get 10% off your first order.</p>

          <form
            class="newsletter-form"
            (ngSubmit)="onSubmit()"
          >
            <div class="newsletter-field">
              <input
                class="input"
                [class.input-danger]="validationError()"
                type="email"
                [formControl]="emailControl"
                placeholder="Enter your email"
                aria-label="Email address for newsletter"
                maxlength="254"
              />
            </div>
            <button
              class="btn"
              type="submit"
              [class.btn-loading]="submitting()"
              [disabled]="submitting()"
            >
              Subscribe
            </button>
          </form>

          @if (validationError()) {
            <p class="newsletter-error" role="alert">
              Please enter a valid email address.
            </p>
          }

          @if (errorMessage()) {
            <p class="newsletter-error" role="alert">
              {{ errorMessage() }}
            </p>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .newsletter-section {
      background: var(--accent-soft);
      padding-block: var(--space-18);
    }
    .newsletter-inner {
      max-width: 520px;
      margin: 0 auto;
      text-align: center;
      padding-inline: 20px;
    }
    .newsletter-heading {
      font-size: 28px;
      margin: 0 0 8px;
    }
    .newsletter-section .muted {
      margin: 0 0 24px;
      font-size: 15px;
    }
    .newsletter-form {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }
    .newsletter-field {
      max-width: 300px;
      flex: 1 1 auto;
    }
    .newsletter-field .input {
      width: 100%;
    }
    .input-danger {
      border-color: var(--danger) !important;
    }
    .newsletter-error {
      margin: 12px 0 0;
      font-size: 13px;
      color: var(--danger);
      font-weight: 500;
    }
    .newsletter-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .newsletter-check {
      flex-shrink: 0;
    }
    .newsletter-success .muted {
      margin: 0;
      font-size: 15px;
    }
  `]
})
export class NewsletterSectionComponent {
  private readonly catalog = inject(CatalogService);

  readonly emailControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly validationError = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    this.validationError.set(false);
    this.errorMessage.set(null);

    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      this.validationError.set(true);
      return;
    }

    const email = this.emailControl.value ?? '';
    this.submitting.set(true);

    this.catalog.subscribeToNewsletter(email).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.success.set(true);
        } else {
          this.errorMessage.set(
            res.message ?? 'Something went wrong. Please try again.',
          );
        }
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Something went wrong. Please try again.');
      },
    });
  }
}
