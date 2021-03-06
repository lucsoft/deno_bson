import { assert, assertEquals } from "../test_deps.ts";
import { Long, Timestamp } from "../src/bson.ts";

Deno.test("[Timestamp] should have a MAX_VALUE equal to Long.MAX_UNSIGNED_VALUE", () => {
  assertEquals(Timestamp.MAX_VALUE, Long.MAX_UNSIGNED_VALUE);
});

Deno.test("[Timestamp] should always be an unsigned value", () => {
  [
    new Timestamp(),
    new Timestamp({ t: 0xff, i: 0xffffffff }),
    new Timestamp({ t: 0xffffffff, i: 0xffffffff }),
    new Timestamp({ t: -1, i: -1 }),
    new Timestamp(new Timestamp({ t: 0xffffffff, i: 0xffffffff })),
    new Timestamp(new Long(0xffffffff, 0xfffffffff, false)),
    new Timestamp(new Long(0xffffffff, 0xfffffffff, true)),
  ].forEach((timestamp) => {
    assert(timestamp.unsigned == true);
  });
});

Deno.test("[Timestamp] should print out an unsigned number", () => {
  const timestamp = new Timestamp({ t: 0xffffffff, i: 0xffffffff });
  assertEquals(timestamp.toString(), "18446744073709551615");
  assertEquals(timestamp.toJSON(), {
    $timestamp: "18446744073709551615",
  });
});
