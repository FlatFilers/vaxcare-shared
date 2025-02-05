import { collect } from "collect.js";

collect().macro("forSheet", function (slugOrId: string) {
  return this.filter((item) => item.data.__n === slugOrId || item.data.__s === slugOrId);
});

collect().macro("changes", function () {
  return this.filter((item) => item.isDirty());
});

collect().macro("onlyPresent", function () {
  return this.filter((item) => !item.isDeleted());
});

collect().macro("deletions", function () {
  return this.filter((item) => item.isDeleted());
});
