import type { Component, Tree } from "@prisma/client";

export interface TreeWithComponents extends Tree {
  components: Component[];
}
