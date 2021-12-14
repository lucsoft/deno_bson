import { Buffer } from "buffer";
import {} from "../src/bson.ts";
const Int32 = Int32;
const Double = Double;
const BinaryParser = require("../binary_parser").BinaryParser;

Deno.test("promote values", () => {
  /**
   * @ignore
   */
  Deno.test(
    "Should Correctly Deserialize object with all wrapper types",
    () =>
      // prettier-ignore
      var bytes = [
        26,
        1,
        0,
        0,
        7,
        95,
        105,
        100,
        0,
        161,
        190,
        98,
        75,
        118,
        169,
        3,
        0,
        0,
        3,
        0,
        0,
        4,
        97,
        114,
        114,
        97,
        121,
        0,
        26,
        0,
        0,
        0,
        16,
        48,
        0,
        1,
        0,
        0,
        0,
        16,
        49,
        0,
        2,
        0,
        0,
        0,
        16,
        50,
        0,
        3,
        0,
        0,
        0,
        0,
        2,
        115,
        116,
        114,
        105,
        110,
        103,
        0,
        6,
        0,
        0,
        0,
        104,
        101,
        108,
        108,
        111,
        0,
        3,
        104,
        97,
        115,
        104,
        0,
        19,
        0,
        0,
        0,
        16,
        97,
        0,
        1,
        0,
        0,
        0,
        16,
        98,
        0,
        2,
        0,
        0,
        0,
        0,
        9,
        100,
        97,
        116,
        101,
        0,
        161,
        190,
        98,
        75,
        0,
        0,
        0,
        0,
        7,
        111,
        105,
        100,
        0,
        161,
        190,
        98,
        75,
        90,
        217,
        18,
        0,
        0,
        1,
        0,
        0,
        5,
        98,
        105,
        110,
        97,
        114,
        121,
        0,
        7,
        0,
        0,
        0,
        2,
        3,
        0,
        0,
        0,
        49,
        50,
        51,
        16,
        105,
        110,
        116,
        0,
        42,
        0,
        0,
        0,
        1,
        102,
        108,
        111,
        97,
        116,
        0,
        223,
        224,
        11,
        147,
        169,
        170,
        64,
        64,
        11,
        114,
        101,
        103,
        101,
        120,
        112,
        0,
        102,
        111,
        111,
        98,
        97,
        114,
        0,
        105,
        0,
        8,
        98,
        111,
        111,
        108,
        101,
        97,
        110,
        0,
        1,
        15,
        119,
        104,
        101,
        114,
        101,
        0,
        25,
        0,
        0,
        0,
        12,
        0,
        0,
        0,
        116,
        104,
        105,
        115,
        46,
        120,
        32,
        61,
        61,
        32,
        51,
        0,
        5,
        0,
        0,
        0,
        0,
        3,
        100,
        98,
        114,
        101,
        102,
        0,
        37,
        0,
        0,
        0,
        2,
        36,
        114,
        101,
        102,
        0,
        5,
        0,
        0,
        0,
        116,
        101,
        115,
        116,
        0,
        7,
        36,
        105,
        100,
        0,
        161,
        190,
        98,
        75,
        2,
        180,
        1,
        0,
        0,
        2,
        0,
        0,
        0,
        10,
        110,
        117,
        108,
        108,
        0,
        0,
      ];
      var serialized_data = "";

      // Convert to chars
      for (var i = 0; i < bytes.length; i++) {
        serialized_data = serialized_data + BinaryParser.fromByte(bytes[i]);
      }

      var object = deserialize(Buffer.from(serialized_data, "binary"), {
        promoteValues: false,
      });

      // Perform tests
      assert("hello").to.equal(object.string);
      assert([new Int32(1), new Int32(2), new Int32(3)]).to.deep.equal(
        object.array,
      );
      assert(new Int32(1)).to.deep.equal(object.hash.a);
      assert(new Int32(2)).to.deep.equal(object.hash.b);
      assert(object.date != null).to.be.ok;
      assert(object.oid != null).to.be.ok;
      assert(object.binary != null).to.be.ok;
      assert(new Int32(42)).to.deep.equal(object.int);
      assert(new Double(33.3333)).to.deep.equal(object.float);
      assert(object.regexp != null).to.be.ok;
      assert(true).to.equal(object.boolean);
      assert(object.where != null).to.be.ok;
      assert(object.dbref != null).to.be.ok;
      assert(object[null] == null).to.be.ok;
    },
  );
});