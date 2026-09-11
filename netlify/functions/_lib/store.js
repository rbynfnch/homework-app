import { getStore } from "@netlify/blobs";

// Three separate blob "stores" (think: separate tables), all provided
// automatically by Netlify — no database to create or configure.
export function usersStore() {
  return getStore("users");
}

export function familiesStore() {
  return getStore("families");
}

export function familyDataStore() {
  return getStore("family-data");
}
