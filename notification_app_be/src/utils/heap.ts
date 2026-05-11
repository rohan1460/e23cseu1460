/**
 * A bounded min-heap used to compute top-N elements in O(m log n).
 *
 * Implemented from scratch because the brief requires no external
 * libraries for algorithms. The heap retains the N *largest* elements
 * (by a caller-supplied score function) by treating the smallest
 * currently-held element as the root, evicting it whenever a larger
 * candidate arrives.
 */

export class TopNHeap<T> {
  private readonly capacity: number;
  private readonly score: (item: T) => number;
  private data: T[] = [];

  constructor(capacity: number, score: (item: T) => number) {
    if (capacity <= 0) {
      throw new Error("TopNHeap capacity must be positive");
    }
    this.capacity = capacity;
    this.score = score;
  }

  /** Considers an item for inclusion in the top-N. */
  add(item: T): void {
    if (this.data.length < this.capacity) {
      this.data.push(item);
      this.siftUp(this.data.length - 1);
      return;
    }

    // Heap is full: only replace the smallest if the new item is larger.
    if (this.score(item) > this.score(this.data[0])) {
      this.data[0] = item;
      this.siftDown(0);
    }
  }

  /** Returns the contents sorted from highest to lowest score. */
  toSortedArray(): T[] {
    return [...this.data].sort((a, b) => this.score(b) - this.score(a));
  }

  private siftUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.score(this.data[idx]) < this.score(this.data[parent])) {
        [this.data[idx], this.data[parent]] = [
          this.data[parent],
          this.data[idx],
        ];
        idx = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(idx: number): void {
    const n = this.data.length;
    while (true) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      let smallest = idx;

      if (
        left < n &&
        this.score(this.data[left]) < this.score(this.data[smallest])
      ) {
        smallest = left;
      }
      if (
        right < n &&
        this.score(this.data[right]) < this.score(this.data[smallest])
      ) {
        smallest = right;
      }

      if (smallest !== idx) {
        [this.data[idx], this.data[smallest]] = [
          this.data[smallest],
          this.data[idx],
        ];
        idx = smallest;
      } else {
        break;
      }
    }
  }
}