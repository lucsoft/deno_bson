/** @public */
export interface MinKeyExtended {
  $minKey: 1;
}

/**
 * A class representation of the BSON MinKey type.
 * @public
 */
export class MinKey {
  _bsontype = "MinKey";
  constructor() {
    if (!(this instanceof MinKey)) return new MinKey();
  }

  /** @internal */
  toExtendedJSON(): MinKeyExtended {
    return { $minKey: 1 };
  }

  /** @internal */
  static fromExtendedJSON(): MinKey {
    return new MinKey();
  }

  /** @internal */
  [Symbol.for("Deno.customInspect")](): string {
    return this.inspect();
  }

  inspect(): string {
    return "new MinKey()";
  }
}
