import { Buffer } from 'buffer';
import { Binary } from './binary';
import { Code } from './code';
import { DBRef } from './db_ref';
import { Decimal128 } from './decimal128';
import { Double } from './double';
import { ensureBuffer } from './ensure_buffer';
import {
  deserialize as EJSON_deserialize,
  parse as EJSON_parse,
  serialize as EJSON_serialize,
  stringify as EJSON_stringify
} from './extended_json';
import { Int32 } from './int_32';
import { Long } from './long';
import { Map } from './map';
import { MaxKey } from './max_key';
import { MinKey } from './min_key';
import { ObjectId } from './objectid';
import { calculateObjectSize as internalCalculateObjectSize } from './parser/calculate_size';
// Parts of the parser
import { DeserializationOptions, deserialize as internalDeserialize } from './parser/deserializer';
import { SerializationOptions, serializeInto as internalSerialize } from './parser/serializer';
import { BSONRegExp } from './regexp';
import { BSONSymbol } from './symbol';
import { Timestamp } from './timestamp';
export {
  BSON_BINARY_SUBTYPE_BYTE_ARRAY,
  BSON_BINARY_SUBTYPE_DEFAULT,
  BSON_BINARY_SUBTYPE_FUNCTION,
  BSON_BINARY_SUBTYPE_MD5,
  BSON_BINARY_SUBTYPE_USER_DEFINED,
  BSON_BINARY_SUBTYPE_UUID,
  BSON_BINARY_SUBTYPE_UUID_NEW,
  BSON_DATA_ARRAY,
  BSON_DATA_BINARY,
  BSON_DATA_BOOLEAN,
  BSON_DATA_CODE,
  BSON_DATA_CODE_W_SCOPE,
  BSON_DATA_DATE,
  BSON_DATA_DBPOINTER,
  BSON_DATA_DECIMAL128,
  BSON_DATA_INT,
  BSON_DATA_LONG,
  BSON_DATA_MAX_KEY,
  BSON_DATA_MIN_KEY,
  BSON_DATA_NULL,
  BSON_DATA_NUMBER,
  BSON_DATA_OBJECT,
  BSON_DATA_OID,
  BSON_DATA_REGEXP,
  BSON_DATA_STRING,
  BSON_DATA_SYMBOL,
  BSON_DATA_TIMESTAMP,
  BSON_DATA_UNDEFINED,
  BSON_INT32_MAX,
  BSON_INT32_MIN,
  BSON_INT64_MAX,
  BSON_INT64_MIN,
  JS_INT_MAX,
  JS_INT_MIN
} from './constants';
export {
  Code,
  Map,
  BSONSymbol,
  DBRef,
  Binary,
  ObjectId,
  Long,
  Timestamp,
  Double,
  Int32,
  MinKey,
  MaxKey,
  BSONRegExp,
  Decimal128,
  // In 4.0.0 and 4.0.1, this property name was changed to ObjectId to match the class name.
  // This caused interoperability problems with previous versions of the library, so in
  // later builds we changed it back to ObjectID (capital D) to match legacy implementations.
  ObjectId as ObjectID
};

export const EJSON = {
  parse: EJSON_parse,
  stringify: EJSON_stringify,
  serialize: EJSON_serialize,
  deserialize: EJSON_deserialize
};

export interface Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** @internal */
// Default Max Size
const MAXSIZE = 1024 * 1024 * 17;

// Current Internal Temporary Serialization Buffer
let buffer = Buffer.alloc(MAXSIZE);

/**
 * Sets the size of the internal serialization buffer.
 *
 * @param size - The desired size for the internal serialization buffer
 */
export function setInternalBufferSize(size: number): void {
  // Resize the internal serialization buffer if needed
  if (buffer.length < size) {
    buffer = Buffer.alloc(size);
  }
}

/**
 * Serialize a Javascript object.
 *
 * @param object - the Javascript object to serialize.
 * @returns Buffer object containing the serialized object.
 */
export function serialize(object: Document, options: SerializationOptions = {}): Buffer {
  // Unpack the options
  const checkKeys = typeof options.checkKeys === 'boolean' ? options.checkKeys : false;
  const serializeFunctions =
    typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
  const ignoreUndefined =
    typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;
  const minInternalBufferSize =
    typeof options.minInternalBufferSize === 'number' ? options.minInternalBufferSize : MAXSIZE;

  // Resize the internal serialization buffer if needed
  if (buffer.length < minInternalBufferSize) {
    buffer = Buffer.alloc(minInternalBufferSize);
  }

  // Attempt to serialize
  const serializationIndex = internalSerialize(
    buffer,
    object,
    checkKeys,
    0,
    0,
    serializeFunctions,
    ignoreUndefined,
    []
  );

  // Create the final buffer
  const finishedBuffer = Buffer.alloc(serializationIndex);

  // Copy into the finished buffer
  buffer.copy(finishedBuffer, 0, 0, finishedBuffer.length);

  // Return the buffer
  return finishedBuffer;
}

/**
 * Serialize a Javascript object using a predefined Buffer and index into the buffer,
 * useful when pre-allocating the space for serialization.
 *
 * @param object - the Javascript object to serialize.
 * @param finalBuffer - the Buffer you pre-allocated to store the serialized BSON object.
 * @returns the index pointing to the last written byte in the buffer.
 */
export function serializeWithBufferAndIndex(
  object: Document,
  finalBuffer: Buffer,
  options: SerializationOptions = {}
): number {
  // Unpack the options
  const checkKeys = typeof options.checkKeys === 'boolean' ? options.checkKeys : false;
  const serializeFunctions =
    typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
  const ignoreUndefined =
    typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;
  const startIndex = typeof options.index === 'number' ? options.index : 0;

  // Attempt to serialize
  const serializationIndex = internalSerialize(
    buffer,
    object,
    checkKeys,
    0,
    0,
    serializeFunctions,
    ignoreUndefined
  );
  buffer.copy(finalBuffer, startIndex, 0, serializationIndex);

  // Return the index
  return startIndex + serializationIndex - 1;
}

/**
 * Deserialize data as BSON.
 *
 * @param buffer - the buffer containing the serialized set of BSON documents.
 * @returns returns the deserialized Javascript Object.
 */
export function deserialize(buffer: Buffer, options: DeserializationOptions = {}): Document {
  buffer = ensureBuffer(buffer);
  return internalDeserialize(buffer, options);
}

export type CalculateObjectSizeOptions = Pick<
  SerializationOptions,
  'serializeFunctions' | 'ignoreUndefined'
>;

/**
 * Calculate the bson size for a passed in Javascript object.
 *
 * @param object - the Javascript object to calculate the BSON byte size for
 * @returns size of BSON object in bytes
 */
export function calculateObjectSize(
  object: Document,
  options: CalculateObjectSizeOptions = {}
): number {
  options = options || {};

  const serializeFunctions =
    typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
  const ignoreUndefined =
    typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;

  return internalCalculateObjectSize(object, serializeFunctions, ignoreUndefined);
}

/**
 * Deserialize stream data as BSON documents.
 *
 * @param data - the buffer containing the serialized set of BSON documents.
 * @param startIndex - the start index in the data Buffer where the deserialization is to start.
 * @param numberOfDocuments - number of documents to deserialize.
 * @param documents - an array where to store the deserialized documents.
 * @param docStartIndex - the index in the documents array from where to start inserting documents.
 * @param options - additional options used for the deserialization.
 * @returns next index in the buffer after deserialization **x** numbers of documents.
 */
export function deserializeStream(
  data: Buffer,
  startIndex: number,
  numberOfDocuments: number,
  documents: Document[],
  docStartIndex: number,
  options: DeserializationOptions
): number {
  const internalOptions = Object.assign(
    { allowObjectSmallerThanBufferSize: true, index: 0 },
    options
  );
  data = ensureBuffer(data);

  let index = startIndex;
  // Loop over all documents
  for (let i = 0; i < numberOfDocuments; i++) {
    // Find size of the document
    const size =
      data[index] | (data[index + 1] << 8) | (data[index + 2] << 16) | (data[index + 3] << 24);
    // Update options with index
    internalOptions.index = index;
    // Parse the document at this point
    documents[docStartIndex + i] = internalDeserialize(data, internalOptions);
    // Adjust index by the document size
    index = index + size;
  }

  // Return object containing end index of parsing and list of documents
  return index;
}