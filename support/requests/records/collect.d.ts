import "collect.js";

declare module "collect.js" {
  interface Collection<Item> {
    forSheet(slugOrId: string): Collection<Item>;
    changes(): Collection<Item>;
    onlyPresent(): Collection<Item>;
    deletions(): Collection<Item>;
  }
}
