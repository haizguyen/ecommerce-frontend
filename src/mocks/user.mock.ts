import type { UserProfile } from './types';

/** Signed-in user profile fixture (typical case). */
export const USER_PROFILE: UserProfile = {
  id: 'user-777',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?img=12',
  memberSince: '2023-02-18T00:00:00.000Z',
  address: {
    line1: '42 Wallaby Way',
    line2: 'Suite 3',
    city: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia'
  }
};
