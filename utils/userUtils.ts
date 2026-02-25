
/**
 * Helper function to get a user's display name with fallbacks.
 * Fallback logic:
 * 1. If name exists -> show name
 * 2. Else if username exists -> show username
 * 3. Else show email prefix (before @)
 * 4. Else show "Anonymous Editor"
 */
export const getDisplayName = (user: { 
  name?: string; 
  full_name?: string; 
  username?: string; 
  email?: string; 
} | null | undefined, fallback: string = 'Editor'): string => {
  if (!user) return fallback;
  
  const name = user.full_name || user.name;
  if (name && name.trim() !== '') return name;
  
  if (user.username && user.username.trim() !== '') return user.username;
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return fallback;
};
