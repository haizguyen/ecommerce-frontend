import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * Route transition: fade + slide-up 150ms.
 *
 * New content fades in and slides up slightly. Reduced-motion users are
 * handled by Angular's `@.disabled` binding (see AppComponent) — when
 * `prefers-reduced-motion: reduce` is active the entire trigger is
 * short-circuited so no animation runs.
 *
 * Usage: bind `[@routeAnimations]="getRouteAnimation(outlet)"` on the
 *        `<router-outlet>` wrapper in the root template.
 */
export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Keep old view in place while new view enters
    query(':enter, :leave', [
      style({ position: 'relative' }),
    ], { optional: true }),

    // Hide old view instantly
    query(':leave', [
      style({ opacity: 1 }),
    ], { optional: true }),

    // Prepare new view (shifted down + invisible)
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(12px)',
      }),
    ], { optional: true }),

    // Animate both simultaneously: leave fades out, enter fades+slides in
    group([
      query(':leave', [
        animate('120ms ease-out', style({ opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        animate('150ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)',
        })),
      ], { optional: true }),
    ]),
  ]),
]);
