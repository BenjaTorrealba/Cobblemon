/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
declare global {
  namespace App {
    interface Locals {
      admin: { id: number; username: string } | null;
      user: { id: number; username: string } | null;
    }
    // interface Error {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
