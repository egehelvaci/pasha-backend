
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model userType
 * 
 */
export type userType = $Result.DefaultSelection<Prisma.$userTypePayload>
/**
 * Model user
 * 
 */
export type user = $Result.DefaultSelection<Prisma.$userPayload>
/**
 * Model collection
 * 
 */
export type collection = $Result.DefaultSelection<Prisma.$collectionPayload>
/**
 * Model product
 * 
 */
export type product = $Result.DefaultSelection<Prisma.$productPayload>
/**
 * Model priceList
 * 
 */
export type priceList = $Result.DefaultSelection<Prisma.$priceListPayload>
/**
 * Model priceListDetail
 * 
 */
export type priceListDetail = $Result.DefaultSelection<Prisma.$priceListDetailPayload>
/**
 * Model userPriceList
 * 
 */
export type userPriceList = $Result.DefaultSelection<Prisma.$userPriceListPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Currency: {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR'
};

export type Currency = (typeof Currency)[keyof typeof Currency]

}

export type Currency = $Enums.Currency

export const Currency: typeof $Enums.Currency

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more UserTypes
 * const userTypes = await prisma.userType.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more UserTypes
   * const userTypes = await prisma.userType.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.userType`: Exposes CRUD operations for the **userType** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTypes
    * const userTypes = await prisma.userType.findMany()
    * ```
    */
  get userType(): Prisma.userTypeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **user** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.userDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.collection`: Exposes CRUD operations for the **collection** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Collections
    * const collections = await prisma.collection.findMany()
    * ```
    */
  get collection(): Prisma.collectionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.productDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.priceList`: Exposes CRUD operations for the **priceList** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PriceLists
    * const priceLists = await prisma.priceList.findMany()
    * ```
    */
  get priceList(): Prisma.priceListDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.priceListDetail`: Exposes CRUD operations for the **priceListDetail** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PriceListDetails
    * const priceListDetails = await prisma.priceListDetail.findMany()
    * ```
    */
  get priceListDetail(): Prisma.priceListDetailDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userPriceList`: Exposes CRUD operations for the **userPriceList** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserPriceLists
    * const userPriceLists = await prisma.userPriceList.findMany()
    * ```
    */
  get userPriceList(): Prisma.userPriceListDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    userType: 'userType',
    user: 'user',
    collection: 'collection',
    product: 'product',
    priceList: 'priceList',
    priceListDetail: 'priceListDetail',
    userPriceList: 'userPriceList'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "userType" | "user" | "collection" | "product" | "priceList" | "priceListDetail" | "userPriceList"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      userType: {
        payload: Prisma.$userTypePayload<ExtArgs>
        fields: Prisma.userTypeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.userTypeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.userTypeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>
          }
          findFirst: {
            args: Prisma.userTypeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.userTypeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>
          }
          findMany: {
            args: Prisma.userTypeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>[]
          }
          create: {
            args: Prisma.userTypeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>
          }
          createMany: {
            args: Prisma.userTypeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.userTypeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>[]
          }
          delete: {
            args: Prisma.userTypeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>
          }
          update: {
            args: Prisma.userTypeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>
          }
          deleteMany: {
            args: Prisma.userTypeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.userTypeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.userTypeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>[]
          }
          upsert: {
            args: Prisma.userTypeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userTypePayload>
          }
          aggregate: {
            args: Prisma.UserTypeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserType>
          }
          groupBy: {
            args: Prisma.userTypeGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserTypeGroupByOutputType>[]
          }
          count: {
            args: Prisma.userTypeCountArgs<ExtArgs>
            result: $Utils.Optional<UserTypeCountAggregateOutputType> | number
          }
        }
      }
      user: {
        payload: Prisma.$userPayload<ExtArgs>
        fields: Prisma.userFieldRefs
        operations: {
          findUnique: {
            args: Prisma.userFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.userFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          findFirst: {
            args: Prisma.userFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.userFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          findMany: {
            args: Prisma.userFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>[]
          }
          create: {
            args: Prisma.userCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          createMany: {
            args: Prisma.userCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.userCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>[]
          }
          delete: {
            args: Prisma.userDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          update: {
            args: Prisma.userUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          deleteMany: {
            args: Prisma.userDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.userUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.userUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>[]
          }
          upsert: {
            args: Prisma.userUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.userGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.userCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      collection: {
        payload: Prisma.$collectionPayload<ExtArgs>
        fields: Prisma.collectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.collectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.collectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>
          }
          findFirst: {
            args: Prisma.collectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.collectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>
          }
          findMany: {
            args: Prisma.collectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>[]
          }
          create: {
            args: Prisma.collectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>
          }
          createMany: {
            args: Prisma.collectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.collectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>[]
          }
          delete: {
            args: Prisma.collectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>
          }
          update: {
            args: Prisma.collectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>
          }
          deleteMany: {
            args: Prisma.collectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.collectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.collectionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>[]
          }
          upsert: {
            args: Prisma.collectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$collectionPayload>
          }
          aggregate: {
            args: Prisma.CollectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCollection>
          }
          groupBy: {
            args: Prisma.collectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CollectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.collectionCountArgs<ExtArgs>
            result: $Utils.Optional<CollectionCountAggregateOutputType> | number
          }
        }
      }
      product: {
        payload: Prisma.$productPayload<ExtArgs>
        fields: Prisma.productFieldRefs
        operations: {
          findUnique: {
            args: Prisma.productFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.productFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          findFirst: {
            args: Prisma.productFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.productFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          findMany: {
            args: Prisma.productFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>[]
          }
          create: {
            args: Prisma.productCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          createMany: {
            args: Prisma.productCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.productCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>[]
          }
          delete: {
            args: Prisma.productDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          update: {
            args: Prisma.productUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          deleteMany: {
            args: Prisma.productDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.productUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.productUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>[]
          }
          upsert: {
            args: Prisma.productUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.productGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.productCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      priceList: {
        payload: Prisma.$priceListPayload<ExtArgs>
        fields: Prisma.priceListFieldRefs
        operations: {
          findUnique: {
            args: Prisma.priceListFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.priceListFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>
          }
          findFirst: {
            args: Prisma.priceListFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.priceListFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>
          }
          findMany: {
            args: Prisma.priceListFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>[]
          }
          create: {
            args: Prisma.priceListCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>
          }
          createMany: {
            args: Prisma.priceListCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.priceListCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>[]
          }
          delete: {
            args: Prisma.priceListDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>
          }
          update: {
            args: Prisma.priceListUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>
          }
          deleteMany: {
            args: Prisma.priceListDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.priceListUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.priceListUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>[]
          }
          upsert: {
            args: Prisma.priceListUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListPayload>
          }
          aggregate: {
            args: Prisma.PriceListAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePriceList>
          }
          groupBy: {
            args: Prisma.priceListGroupByArgs<ExtArgs>
            result: $Utils.Optional<PriceListGroupByOutputType>[]
          }
          count: {
            args: Prisma.priceListCountArgs<ExtArgs>
            result: $Utils.Optional<PriceListCountAggregateOutputType> | number
          }
        }
      }
      priceListDetail: {
        payload: Prisma.$priceListDetailPayload<ExtArgs>
        fields: Prisma.priceListDetailFieldRefs
        operations: {
          findUnique: {
            args: Prisma.priceListDetailFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.priceListDetailFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>
          }
          findFirst: {
            args: Prisma.priceListDetailFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.priceListDetailFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>
          }
          findMany: {
            args: Prisma.priceListDetailFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>[]
          }
          create: {
            args: Prisma.priceListDetailCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>
          }
          createMany: {
            args: Prisma.priceListDetailCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.priceListDetailCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>[]
          }
          delete: {
            args: Prisma.priceListDetailDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>
          }
          update: {
            args: Prisma.priceListDetailUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>
          }
          deleteMany: {
            args: Prisma.priceListDetailDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.priceListDetailUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.priceListDetailUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>[]
          }
          upsert: {
            args: Prisma.priceListDetailUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$priceListDetailPayload>
          }
          aggregate: {
            args: Prisma.PriceListDetailAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePriceListDetail>
          }
          groupBy: {
            args: Prisma.priceListDetailGroupByArgs<ExtArgs>
            result: $Utils.Optional<PriceListDetailGroupByOutputType>[]
          }
          count: {
            args: Prisma.priceListDetailCountArgs<ExtArgs>
            result: $Utils.Optional<PriceListDetailCountAggregateOutputType> | number
          }
        }
      }
      userPriceList: {
        payload: Prisma.$userPriceListPayload<ExtArgs>
        fields: Prisma.userPriceListFieldRefs
        operations: {
          findUnique: {
            args: Prisma.userPriceListFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.userPriceListFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>
          }
          findFirst: {
            args: Prisma.userPriceListFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.userPriceListFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>
          }
          findMany: {
            args: Prisma.userPriceListFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>[]
          }
          create: {
            args: Prisma.userPriceListCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>
          }
          createMany: {
            args: Prisma.userPriceListCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.userPriceListCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>[]
          }
          delete: {
            args: Prisma.userPriceListDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>
          }
          update: {
            args: Prisma.userPriceListUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>
          }
          deleteMany: {
            args: Prisma.userPriceListDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.userPriceListUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.userPriceListUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>[]
          }
          upsert: {
            args: Prisma.userPriceListUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPriceListPayload>
          }
          aggregate: {
            args: Prisma.UserPriceListAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserPriceList>
          }
          groupBy: {
            args: Prisma.userPriceListGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserPriceListGroupByOutputType>[]
          }
          count: {
            args: Prisma.userPriceListCountArgs<ExtArgs>
            result: $Utils.Optional<UserPriceListCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    userType?: userTypeOmit
    user?: userOmit
    collection?: collectionOmit
    product?: productOmit
    priceList?: priceListOmit
    priceListDetail?: priceListDetailOmit
    userPriceList?: userPriceListOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserTypeCountOutputType
   */

  export type UserTypeCountOutputType = {
    users: number
  }

  export type UserTypeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | UserTypeCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * UserTypeCountOutputType without action
   */
  export type UserTypeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTypeCountOutputType
     */
    select?: UserTypeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserTypeCountOutputType without action
   */
  export type UserTypeCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: userWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    userPriceList: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userPriceList?: boolean | UserCountOutputTypeCountUserPriceListArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserPriceListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: userPriceListWhereInput
  }


  /**
   * Count Type CollectionCountOutputType
   */

  export type CollectionCountOutputType = {
    priceListDetail: number
    products: number
  }

  export type CollectionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    priceListDetail?: boolean | CollectionCountOutputTypeCountPriceListDetailArgs
    products?: boolean | CollectionCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * CollectionCountOutputType without action
   */
  export type CollectionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CollectionCountOutputType
     */
    select?: CollectionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CollectionCountOutputType without action
   */
  export type CollectionCountOutputTypeCountPriceListDetailArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: priceListDetailWhereInput
  }

  /**
   * CollectionCountOutputType without action
   */
  export type CollectionCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productWhereInput
  }


  /**
   * Count Type PriceListCountOutputType
   */

  export type PriceListCountOutputType = {
    priceListDetail: number
    userPriceList: number
  }

  export type PriceListCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    priceListDetail?: boolean | PriceListCountOutputTypeCountPriceListDetailArgs
    userPriceList?: boolean | PriceListCountOutputTypeCountUserPriceListArgs
  }

  // Custom InputTypes
  /**
   * PriceListCountOutputType without action
   */
  export type PriceListCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListCountOutputType
     */
    select?: PriceListCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PriceListCountOutputType without action
   */
  export type PriceListCountOutputTypeCountPriceListDetailArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: priceListDetailWhereInput
  }

  /**
   * PriceListCountOutputType without action
   */
  export type PriceListCountOutputTypeCountUserPriceListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: userPriceListWhereInput
  }


  /**
   * Models
   */

  /**
   * Model userType
   */

  export type AggregateUserType = {
    _count: UserTypeCountAggregateOutputType | null
    _avg: UserTypeAvgAggregateOutputType | null
    _sum: UserTypeSumAggregateOutputType | null
    _min: UserTypeMinAggregateOutputType | null
    _max: UserTypeMaxAggregateOutputType | null
  }

  export type UserTypeAvgAggregateOutputType = {
    id: number | null
  }

  export type UserTypeSumAggregateOutputType = {
    id: number | null
  }

  export type UserTypeMinAggregateOutputType = {
    id: number | null
    name: string | null
  }

  export type UserTypeMaxAggregateOutputType = {
    id: number | null
    name: string | null
  }

  export type UserTypeCountAggregateOutputType = {
    id: number
    name: number
    _all: number
  }


  export type UserTypeAvgAggregateInputType = {
    id?: true
  }

  export type UserTypeSumAggregateInputType = {
    id?: true
  }

  export type UserTypeMinAggregateInputType = {
    id?: true
    name?: true
  }

  export type UserTypeMaxAggregateInputType = {
    id?: true
    name?: true
  }

  export type UserTypeCountAggregateInputType = {
    id?: true
    name?: true
    _all?: true
  }

  export type UserTypeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which userType to aggregate.
     */
    where?: userTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of userTypes to fetch.
     */
    orderBy?: userTypeOrderByWithRelationInput | userTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: userTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` userTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` userTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned userTypes
    **/
    _count?: true | UserTypeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserTypeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserTypeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserTypeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserTypeMaxAggregateInputType
  }

  export type GetUserTypeAggregateType<T extends UserTypeAggregateArgs> = {
        [P in keyof T & keyof AggregateUserType]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserType[P]>
      : GetScalarType<T[P], AggregateUserType[P]>
  }




  export type userTypeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: userTypeWhereInput
    orderBy?: userTypeOrderByWithAggregationInput | userTypeOrderByWithAggregationInput[]
    by: UserTypeScalarFieldEnum[] | UserTypeScalarFieldEnum
    having?: userTypeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserTypeCountAggregateInputType | true
    _avg?: UserTypeAvgAggregateInputType
    _sum?: UserTypeSumAggregateInputType
    _min?: UserTypeMinAggregateInputType
    _max?: UserTypeMaxAggregateInputType
  }

  export type UserTypeGroupByOutputType = {
    id: number
    name: string
    _count: UserTypeCountAggregateOutputType | null
    _avg: UserTypeAvgAggregateOutputType | null
    _sum: UserTypeSumAggregateOutputType | null
    _min: UserTypeMinAggregateOutputType | null
    _max: UserTypeMaxAggregateOutputType | null
  }

  type GetUserTypeGroupByPayload<T extends userTypeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserTypeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserTypeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserTypeGroupByOutputType[P]>
            : GetScalarType<T[P], UserTypeGroupByOutputType[P]>
        }
      >
    >


  export type userTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    users?: boolean | userType$usersArgs<ExtArgs>
    _count?: boolean | UserTypeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userType"]>

  export type userTypeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["userType"]>

  export type userTypeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["userType"]>

  export type userTypeSelectScalar = {
    id?: boolean
    name?: boolean
  }

  export type userTypeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name", ExtArgs["result"]["userType"]>
  export type userTypeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | userType$usersArgs<ExtArgs>
    _count?: boolean | UserTypeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type userTypeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type userTypeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $userTypePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "userType"
    objects: {
      users: Prisma.$userPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
    }, ExtArgs["result"]["userType"]>
    composites: {}
  }

  type userTypeGetPayload<S extends boolean | null | undefined | userTypeDefaultArgs> = $Result.GetResult<Prisma.$userTypePayload, S>

  type userTypeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<userTypeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserTypeCountAggregateInputType | true
    }

  export interface userTypeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['userType'], meta: { name: 'userType' } }
    /**
     * Find zero or one UserType that matches the filter.
     * @param {userTypeFindUniqueArgs} args - Arguments to find a UserType
     * @example
     * // Get one UserType
     * const userType = await prisma.userType.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends userTypeFindUniqueArgs>(args: SelectSubset<T, userTypeFindUniqueArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserType that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {userTypeFindUniqueOrThrowArgs} args - Arguments to find a UserType
     * @example
     * // Get one UserType
     * const userType = await prisma.userType.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends userTypeFindUniqueOrThrowArgs>(args: SelectSubset<T, userTypeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserType that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userTypeFindFirstArgs} args - Arguments to find a UserType
     * @example
     * // Get one UserType
     * const userType = await prisma.userType.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends userTypeFindFirstArgs>(args?: SelectSubset<T, userTypeFindFirstArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserType that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userTypeFindFirstOrThrowArgs} args - Arguments to find a UserType
     * @example
     * // Get one UserType
     * const userType = await prisma.userType.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends userTypeFindFirstOrThrowArgs>(args?: SelectSubset<T, userTypeFindFirstOrThrowArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserTypes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userTypeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserTypes
     * const userTypes = await prisma.userType.findMany()
     * 
     * // Get first 10 UserTypes
     * const userTypes = await prisma.userType.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userTypeWithIdOnly = await prisma.userType.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends userTypeFindManyArgs>(args?: SelectSubset<T, userTypeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserType.
     * @param {userTypeCreateArgs} args - Arguments to create a UserType.
     * @example
     * // Create one UserType
     * const UserType = await prisma.userType.create({
     *   data: {
     *     // ... data to create a UserType
     *   }
     * })
     * 
     */
    create<T extends userTypeCreateArgs>(args: SelectSubset<T, userTypeCreateArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserTypes.
     * @param {userTypeCreateManyArgs} args - Arguments to create many UserTypes.
     * @example
     * // Create many UserTypes
     * const userType = await prisma.userType.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends userTypeCreateManyArgs>(args?: SelectSubset<T, userTypeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserTypes and returns the data saved in the database.
     * @param {userTypeCreateManyAndReturnArgs} args - Arguments to create many UserTypes.
     * @example
     * // Create many UserTypes
     * const userType = await prisma.userType.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserTypes and only return the `id`
     * const userTypeWithIdOnly = await prisma.userType.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends userTypeCreateManyAndReturnArgs>(args?: SelectSubset<T, userTypeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserType.
     * @param {userTypeDeleteArgs} args - Arguments to delete one UserType.
     * @example
     * // Delete one UserType
     * const UserType = await prisma.userType.delete({
     *   where: {
     *     // ... filter to delete one UserType
     *   }
     * })
     * 
     */
    delete<T extends userTypeDeleteArgs>(args: SelectSubset<T, userTypeDeleteArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserType.
     * @param {userTypeUpdateArgs} args - Arguments to update one UserType.
     * @example
     * // Update one UserType
     * const userType = await prisma.userType.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends userTypeUpdateArgs>(args: SelectSubset<T, userTypeUpdateArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserTypes.
     * @param {userTypeDeleteManyArgs} args - Arguments to filter UserTypes to delete.
     * @example
     * // Delete a few UserTypes
     * const { count } = await prisma.userType.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends userTypeDeleteManyArgs>(args?: SelectSubset<T, userTypeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userTypeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserTypes
     * const userType = await prisma.userType.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends userTypeUpdateManyArgs>(args: SelectSubset<T, userTypeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTypes and returns the data updated in the database.
     * @param {userTypeUpdateManyAndReturnArgs} args - Arguments to update many UserTypes.
     * @example
     * // Update many UserTypes
     * const userType = await prisma.userType.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserTypes and only return the `id`
     * const userTypeWithIdOnly = await prisma.userType.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends userTypeUpdateManyAndReturnArgs>(args: SelectSubset<T, userTypeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserType.
     * @param {userTypeUpsertArgs} args - Arguments to update or create a UserType.
     * @example
     * // Update or create a UserType
     * const userType = await prisma.userType.upsert({
     *   create: {
     *     // ... data to create a UserType
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserType we want to update
     *   }
     * })
     */
    upsert<T extends userTypeUpsertArgs>(args: SelectSubset<T, userTypeUpsertArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userTypeCountArgs} args - Arguments to filter UserTypes to count.
     * @example
     * // Count the number of UserTypes
     * const count = await prisma.userType.count({
     *   where: {
     *     // ... the filter for the UserTypes we want to count
     *   }
     * })
    **/
    count<T extends userTypeCountArgs>(
      args?: Subset<T, userTypeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserTypeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserType.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTypeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserTypeAggregateArgs>(args: Subset<T, UserTypeAggregateArgs>): Prisma.PrismaPromise<GetUserTypeAggregateType<T>>

    /**
     * Group by UserType.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userTypeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends userTypeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: userTypeGroupByArgs['orderBy'] }
        : { orderBy?: userTypeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, userTypeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserTypeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the userType model
   */
  readonly fields: userTypeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for userType.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__userTypeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends userType$usersArgs<ExtArgs> = {}>(args?: Subset<T, userType$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the userType model
   */
  interface userTypeFieldRefs {
    readonly id: FieldRef<"userType", 'Int'>
    readonly name: FieldRef<"userType", 'String'>
  }
    

  // Custom InputTypes
  /**
   * userType findUnique
   */
  export type userTypeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * Filter, which userType to fetch.
     */
    where: userTypeWhereUniqueInput
  }

  /**
   * userType findUniqueOrThrow
   */
  export type userTypeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * Filter, which userType to fetch.
     */
    where: userTypeWhereUniqueInput
  }

  /**
   * userType findFirst
   */
  export type userTypeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * Filter, which userType to fetch.
     */
    where?: userTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of userTypes to fetch.
     */
    orderBy?: userTypeOrderByWithRelationInput | userTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for userTypes.
     */
    cursor?: userTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` userTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` userTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of userTypes.
     */
    distinct?: UserTypeScalarFieldEnum | UserTypeScalarFieldEnum[]
  }

  /**
   * userType findFirstOrThrow
   */
  export type userTypeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * Filter, which userType to fetch.
     */
    where?: userTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of userTypes to fetch.
     */
    orderBy?: userTypeOrderByWithRelationInput | userTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for userTypes.
     */
    cursor?: userTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` userTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` userTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of userTypes.
     */
    distinct?: UserTypeScalarFieldEnum | UserTypeScalarFieldEnum[]
  }

  /**
   * userType findMany
   */
  export type userTypeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * Filter, which userTypes to fetch.
     */
    where?: userTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of userTypes to fetch.
     */
    orderBy?: userTypeOrderByWithRelationInput | userTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing userTypes.
     */
    cursor?: userTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` userTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` userTypes.
     */
    skip?: number
    distinct?: UserTypeScalarFieldEnum | UserTypeScalarFieldEnum[]
  }

  /**
   * userType create
   */
  export type userTypeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * The data needed to create a userType.
     */
    data: XOR<userTypeCreateInput, userTypeUncheckedCreateInput>
  }

  /**
   * userType createMany
   */
  export type userTypeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many userTypes.
     */
    data: userTypeCreateManyInput | userTypeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * userType createManyAndReturn
   */
  export type userTypeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * The data used to create many userTypes.
     */
    data: userTypeCreateManyInput | userTypeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * userType update
   */
  export type userTypeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * The data needed to update a userType.
     */
    data: XOR<userTypeUpdateInput, userTypeUncheckedUpdateInput>
    /**
     * Choose, which userType to update.
     */
    where: userTypeWhereUniqueInput
  }

  /**
   * userType updateMany
   */
  export type userTypeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update userTypes.
     */
    data: XOR<userTypeUpdateManyMutationInput, userTypeUncheckedUpdateManyInput>
    /**
     * Filter which userTypes to update
     */
    where?: userTypeWhereInput
    /**
     * Limit how many userTypes to update.
     */
    limit?: number
  }

  /**
   * userType updateManyAndReturn
   */
  export type userTypeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * The data used to update userTypes.
     */
    data: XOR<userTypeUpdateManyMutationInput, userTypeUncheckedUpdateManyInput>
    /**
     * Filter which userTypes to update
     */
    where?: userTypeWhereInput
    /**
     * Limit how many userTypes to update.
     */
    limit?: number
  }

  /**
   * userType upsert
   */
  export type userTypeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * The filter to search for the userType to update in case it exists.
     */
    where: userTypeWhereUniqueInput
    /**
     * In case the userType found by the `where` argument doesn't exist, create a new userType with this data.
     */
    create: XOR<userTypeCreateInput, userTypeUncheckedCreateInput>
    /**
     * In case the userType was found with the provided `where` argument, update it with this data.
     */
    update: XOR<userTypeUpdateInput, userTypeUncheckedUpdateInput>
  }

  /**
   * userType delete
   */
  export type userTypeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
    /**
     * Filter which userType to delete.
     */
    where: userTypeWhereUniqueInput
  }

  /**
   * userType deleteMany
   */
  export type userTypeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which userTypes to delete
     */
    where?: userTypeWhereInput
    /**
     * Limit how many userTypes to delete.
     */
    limit?: number
  }

  /**
   * userType.users
   */
  export type userType$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    where?: userWhereInput
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    cursor?: userWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * userType without action
   */
  export type userTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userType
     */
    select?: userTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userType
     */
    omit?: userTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userTypeInclude<ExtArgs> | null
  }


  /**
   * Model user
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    credit: Decimal | null
    debit: Decimal | null
    userTypeId: number | null
  }

  export type UserSumAggregateOutputType = {
    credit: Decimal | null
    debit: Decimal | null
    userTypeId: number | null
  }

  export type UserMinAggregateOutputType = {
    email: string | null
    name: string | null
    createdAt: Date | null
    credit: Decimal | null
    debit: Decimal | null
    isActive: boolean | null
    password: string | null
    phoneNumber: string | null
    surname: string | null
    userId: string | null
    username: string | null
    userTypeId: number | null
  }

  export type UserMaxAggregateOutputType = {
    email: string | null
    name: string | null
    createdAt: Date | null
    credit: Decimal | null
    debit: Decimal | null
    isActive: boolean | null
    password: string | null
    phoneNumber: string | null
    surname: string | null
    userId: string | null
    username: string | null
    userTypeId: number | null
  }

  export type UserCountAggregateOutputType = {
    email: number
    name: number
    createdAt: number
    credit: number
    debit: number
    isActive: number
    password: number
    phoneNumber: number
    surname: number
    userId: number
    username: number
    userTypeId: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    credit?: true
    debit?: true
    userTypeId?: true
  }

  export type UserSumAggregateInputType = {
    credit?: true
    debit?: true
    userTypeId?: true
  }

  export type UserMinAggregateInputType = {
    email?: true
    name?: true
    createdAt?: true
    credit?: true
    debit?: true
    isActive?: true
    password?: true
    phoneNumber?: true
    surname?: true
    userId?: true
    username?: true
    userTypeId?: true
  }

  export type UserMaxAggregateInputType = {
    email?: true
    name?: true
    createdAt?: true
    credit?: true
    debit?: true
    isActive?: true
    password?: true
    phoneNumber?: true
    surname?: true
    userId?: true
    username?: true
    userTypeId?: true
  }

  export type UserCountAggregateInputType = {
    email?: true
    name?: true
    createdAt?: true
    credit?: true
    debit?: true
    isActive?: true
    password?: true
    phoneNumber?: true
    surname?: true
    userId?: true
    username?: true
    userTypeId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user to aggregate.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type userGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: userWhereInput
    orderBy?: userOrderByWithAggregationInput | userOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: userScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    email: string
    name: string
    createdAt: Date
    credit: Decimal
    debit: Decimal
    isActive: boolean
    password: string
    phoneNumber: string | null
    surname: string
    userId: string
    username: string
    userTypeId: number
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends userGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type userSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    email?: boolean
    name?: boolean
    createdAt?: boolean
    credit?: boolean
    debit?: boolean
    isActive?: boolean
    password?: boolean
    phoneNumber?: boolean
    surname?: boolean
    userId?: boolean
    username?: boolean
    userTypeId?: boolean
    userType?: boolean | userTypeDefaultArgs<ExtArgs>
    userPriceList?: boolean | user$userPriceListArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type userSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    email?: boolean
    name?: boolean
    createdAt?: boolean
    credit?: boolean
    debit?: boolean
    isActive?: boolean
    password?: boolean
    phoneNumber?: boolean
    surname?: boolean
    userId?: boolean
    username?: boolean
    userTypeId?: boolean
    userType?: boolean | userTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type userSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    email?: boolean
    name?: boolean
    createdAt?: boolean
    credit?: boolean
    debit?: boolean
    isActive?: boolean
    password?: boolean
    phoneNumber?: boolean
    surname?: boolean
    userId?: boolean
    username?: boolean
    userTypeId?: boolean
    userType?: boolean | userTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type userSelectScalar = {
    email?: boolean
    name?: boolean
    createdAt?: boolean
    credit?: boolean
    debit?: boolean
    isActive?: boolean
    password?: boolean
    phoneNumber?: boolean
    surname?: boolean
    userId?: boolean
    username?: boolean
    userTypeId?: boolean
  }

  export type userOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"email" | "name" | "createdAt" | "credit" | "debit" | "isActive" | "password" | "phoneNumber" | "surname" | "userId" | "username" | "userTypeId", ExtArgs["result"]["user"]>
  export type userInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userType?: boolean | userTypeDefaultArgs<ExtArgs>
    userPriceList?: boolean | user$userPriceListArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type userIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userType?: boolean | userTypeDefaultArgs<ExtArgs>
  }
  export type userIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userType?: boolean | userTypeDefaultArgs<ExtArgs>
  }

  export type $userPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "user"
    objects: {
      userType: Prisma.$userTypePayload<ExtArgs>
      userPriceList: Prisma.$userPriceListPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      email: string
      name: string
      createdAt: Date
      credit: Prisma.Decimal
      debit: Prisma.Decimal
      isActive: boolean
      password: string
      phoneNumber: string | null
      surname: string
      userId: string
      username: string
      userTypeId: number
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type userGetPayload<S extends boolean | null | undefined | userDefaultArgs> = $Result.GetResult<Prisma.$userPayload, S>

  type userCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<userFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface userDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['user'], meta: { name: 'user' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {userFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends userFindUniqueArgs>(args: SelectSubset<T, userFindUniqueArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {userFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends userFindUniqueOrThrowArgs>(args: SelectSubset<T, userFindUniqueOrThrowArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends userFindFirstArgs>(args?: SelectSubset<T, userFindFirstArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends userFindFirstOrThrowArgs>(args?: SelectSubset<T, userFindFirstOrThrowArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `email`
     * const userWithEmailOnly = await prisma.user.findMany({ select: { email: true } })
     * 
     */
    findMany<T extends userFindManyArgs>(args?: SelectSubset<T, userFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {userCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends userCreateArgs>(args: SelectSubset<T, userCreateArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {userCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends userCreateManyArgs>(args?: SelectSubset<T, userCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {userCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `email`
     * const userWithEmailOnly = await prisma.user.createManyAndReturn({
     *   select: { email: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends userCreateManyAndReturnArgs>(args?: SelectSubset<T, userCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {userDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends userDeleteArgs>(args: SelectSubset<T, userDeleteArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {userUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends userUpdateArgs>(args: SelectSubset<T, userUpdateArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {userDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends userDeleteManyArgs>(args?: SelectSubset<T, userDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends userUpdateManyArgs>(args: SelectSubset<T, userUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {userUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `email`
     * const userWithEmailOnly = await prisma.user.updateManyAndReturn({
     *   select: { email: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends userUpdateManyAndReturnArgs>(args: SelectSubset<T, userUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {userUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends userUpsertArgs>(args: SelectSubset<T, userUpsertArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends userCountArgs>(
      args?: Subset<T, userCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends userGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: userGroupByArgs['orderBy'] }
        : { orderBy?: userGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, userGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the user model
   */
  readonly fields: userFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for user.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__userClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    userType<T extends userTypeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, userTypeDefaultArgs<ExtArgs>>): Prisma__userTypeClient<$Result.GetResult<Prisma.$userTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    userPriceList<T extends user$userPriceListArgs<ExtArgs> = {}>(args?: Subset<T, user$userPriceListArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the user model
   */
  interface userFieldRefs {
    readonly email: FieldRef<"user", 'String'>
    readonly name: FieldRef<"user", 'String'>
    readonly createdAt: FieldRef<"user", 'DateTime'>
    readonly credit: FieldRef<"user", 'Decimal'>
    readonly debit: FieldRef<"user", 'Decimal'>
    readonly isActive: FieldRef<"user", 'Boolean'>
    readonly password: FieldRef<"user", 'String'>
    readonly phoneNumber: FieldRef<"user", 'String'>
    readonly surname: FieldRef<"user", 'String'>
    readonly userId: FieldRef<"user", 'String'>
    readonly username: FieldRef<"user", 'String'>
    readonly userTypeId: FieldRef<"user", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * user findUnique
   */
  export type userFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where: userWhereUniqueInput
  }

  /**
   * user findUniqueOrThrow
   */
  export type userFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where: userWhereUniqueInput
  }

  /**
   * user findFirst
   */
  export type userFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user findFirstOrThrow
   */
  export type userFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user findMany
   */
  export type userFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user create
   */
  export type userCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The data needed to create a user.
     */
    data: XOR<userCreateInput, userUncheckedCreateInput>
  }

  /**
   * user createMany
   */
  export type userCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many users.
     */
    data: userCreateManyInput | userCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user createManyAndReturn
   */
  export type userCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * The data used to create many users.
     */
    data: userCreateManyInput | userCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * user update
   */
  export type userUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The data needed to update a user.
     */
    data: XOR<userUpdateInput, userUncheckedUpdateInput>
    /**
     * Choose, which user to update.
     */
    where: userWhereUniqueInput
  }

  /**
   * user updateMany
   */
  export type userUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update users.
     */
    data: XOR<userUpdateManyMutationInput, userUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: userWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * user updateManyAndReturn
   */
  export type userUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * The data used to update users.
     */
    data: XOR<userUpdateManyMutationInput, userUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: userWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * user upsert
   */
  export type userUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The filter to search for the user to update in case it exists.
     */
    where: userWhereUniqueInput
    /**
     * In case the user found by the `where` argument doesn't exist, create a new user with this data.
     */
    create: XOR<userCreateInput, userUncheckedCreateInput>
    /**
     * In case the user was found with the provided `where` argument, update it with this data.
     */
    update: XOR<userUpdateInput, userUncheckedUpdateInput>
  }

  /**
   * user delete
   */
  export type userDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter which user to delete.
     */
    where: userWhereUniqueInput
  }

  /**
   * user deleteMany
   */
  export type userDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to delete
     */
    where?: userWhereInput
    /**
     * Limit how many users to delete.
     */
    limit?: number
  }

  /**
   * user.userPriceList
   */
  export type user$userPriceListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    where?: userPriceListWhereInput
    orderBy?: userPriceListOrderByWithRelationInput | userPriceListOrderByWithRelationInput[]
    cursor?: userPriceListWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * user without action
   */
  export type userDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
  }


  /**
   * Model collection
   */

  export type AggregateCollection = {
    _count: CollectionCountAggregateOutputType | null
    _min: CollectionMinAggregateOutputType | null
    _max: CollectionMaxAggregateOutputType | null
  }

  export type CollectionMinAggregateOutputType = {
    collectionId: string | null
    name: string | null
    description: string | null
    code: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CollectionMaxAggregateOutputType = {
    collectionId: string | null
    name: string | null
    description: string | null
    code: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CollectionCountAggregateOutputType = {
    collectionId: number
    name: number
    description: number
    code: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CollectionMinAggregateInputType = {
    collectionId?: true
    name?: true
    description?: true
    code?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CollectionMaxAggregateInputType = {
    collectionId?: true
    name?: true
    description?: true
    code?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CollectionCountAggregateInputType = {
    collectionId?: true
    name?: true
    description?: true
    code?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CollectionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which collection to aggregate.
     */
    where?: collectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of collections to fetch.
     */
    orderBy?: collectionOrderByWithRelationInput | collectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: collectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned collections
    **/
    _count?: true | CollectionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CollectionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CollectionMaxAggregateInputType
  }

  export type GetCollectionAggregateType<T extends CollectionAggregateArgs> = {
        [P in keyof T & keyof AggregateCollection]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCollection[P]>
      : GetScalarType<T[P], AggregateCollection[P]>
  }




  export type collectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: collectionWhereInput
    orderBy?: collectionOrderByWithAggregationInput | collectionOrderByWithAggregationInput[]
    by: CollectionScalarFieldEnum[] | CollectionScalarFieldEnum
    having?: collectionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CollectionCountAggregateInputType | true
    _min?: CollectionMinAggregateInputType
    _max?: CollectionMaxAggregateInputType
  }

  export type CollectionGroupByOutputType = {
    collectionId: string
    name: string
    description: string | null
    code: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: CollectionCountAggregateOutputType | null
    _min: CollectionMinAggregateOutputType | null
    _max: CollectionMaxAggregateOutputType | null
  }

  type GetCollectionGroupByPayload<T extends collectionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CollectionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CollectionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CollectionGroupByOutputType[P]>
            : GetScalarType<T[P], CollectionGroupByOutputType[P]>
        }
      >
    >


  export type collectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    collectionId?: boolean
    name?: boolean
    description?: boolean
    code?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    priceListDetail?: boolean | collection$priceListDetailArgs<ExtArgs>
    products?: boolean | collection$productsArgs<ExtArgs>
    _count?: boolean | CollectionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["collection"]>

  export type collectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    collectionId?: boolean
    name?: boolean
    description?: boolean
    code?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["collection"]>

  export type collectionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    collectionId?: boolean
    name?: boolean
    description?: boolean
    code?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["collection"]>

  export type collectionSelectScalar = {
    collectionId?: boolean
    name?: boolean
    description?: boolean
    code?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type collectionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"collectionId" | "name" | "description" | "code" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["collection"]>
  export type collectionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    priceListDetail?: boolean | collection$priceListDetailArgs<ExtArgs>
    products?: boolean | collection$productsArgs<ExtArgs>
    _count?: boolean | CollectionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type collectionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type collectionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $collectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "collection"
    objects: {
      priceListDetail: Prisma.$priceListDetailPayload<ExtArgs>[]
      products: Prisma.$productPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      collectionId: string
      name: string
      description: string | null
      code: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["collection"]>
    composites: {}
  }

  type collectionGetPayload<S extends boolean | null | undefined | collectionDefaultArgs> = $Result.GetResult<Prisma.$collectionPayload, S>

  type collectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<collectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CollectionCountAggregateInputType | true
    }

  export interface collectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['collection'], meta: { name: 'collection' } }
    /**
     * Find zero or one Collection that matches the filter.
     * @param {collectionFindUniqueArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends collectionFindUniqueArgs>(args: SelectSubset<T, collectionFindUniqueArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Collection that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {collectionFindUniqueOrThrowArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends collectionFindUniqueOrThrowArgs>(args: SelectSubset<T, collectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Collection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {collectionFindFirstArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends collectionFindFirstArgs>(args?: SelectSubset<T, collectionFindFirstArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Collection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {collectionFindFirstOrThrowArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends collectionFindFirstOrThrowArgs>(args?: SelectSubset<T, collectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Collections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {collectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Collections
     * const collections = await prisma.collection.findMany()
     * 
     * // Get first 10 Collections
     * const collections = await prisma.collection.findMany({ take: 10 })
     * 
     * // Only select the `collectionId`
     * const collectionWithCollectionIdOnly = await prisma.collection.findMany({ select: { collectionId: true } })
     * 
     */
    findMany<T extends collectionFindManyArgs>(args?: SelectSubset<T, collectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Collection.
     * @param {collectionCreateArgs} args - Arguments to create a Collection.
     * @example
     * // Create one Collection
     * const Collection = await prisma.collection.create({
     *   data: {
     *     // ... data to create a Collection
     *   }
     * })
     * 
     */
    create<T extends collectionCreateArgs>(args: SelectSubset<T, collectionCreateArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Collections.
     * @param {collectionCreateManyArgs} args - Arguments to create many Collections.
     * @example
     * // Create many Collections
     * const collection = await prisma.collection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends collectionCreateManyArgs>(args?: SelectSubset<T, collectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Collections and returns the data saved in the database.
     * @param {collectionCreateManyAndReturnArgs} args - Arguments to create many Collections.
     * @example
     * // Create many Collections
     * const collection = await prisma.collection.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Collections and only return the `collectionId`
     * const collectionWithCollectionIdOnly = await prisma.collection.createManyAndReturn({
     *   select: { collectionId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends collectionCreateManyAndReturnArgs>(args?: SelectSubset<T, collectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Collection.
     * @param {collectionDeleteArgs} args - Arguments to delete one Collection.
     * @example
     * // Delete one Collection
     * const Collection = await prisma.collection.delete({
     *   where: {
     *     // ... filter to delete one Collection
     *   }
     * })
     * 
     */
    delete<T extends collectionDeleteArgs>(args: SelectSubset<T, collectionDeleteArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Collection.
     * @param {collectionUpdateArgs} args - Arguments to update one Collection.
     * @example
     * // Update one Collection
     * const collection = await prisma.collection.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends collectionUpdateArgs>(args: SelectSubset<T, collectionUpdateArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Collections.
     * @param {collectionDeleteManyArgs} args - Arguments to filter Collections to delete.
     * @example
     * // Delete a few Collections
     * const { count } = await prisma.collection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends collectionDeleteManyArgs>(args?: SelectSubset<T, collectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Collections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {collectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Collections
     * const collection = await prisma.collection.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends collectionUpdateManyArgs>(args: SelectSubset<T, collectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Collections and returns the data updated in the database.
     * @param {collectionUpdateManyAndReturnArgs} args - Arguments to update many Collections.
     * @example
     * // Update many Collections
     * const collection = await prisma.collection.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Collections and only return the `collectionId`
     * const collectionWithCollectionIdOnly = await prisma.collection.updateManyAndReturn({
     *   select: { collectionId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends collectionUpdateManyAndReturnArgs>(args: SelectSubset<T, collectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Collection.
     * @param {collectionUpsertArgs} args - Arguments to update or create a Collection.
     * @example
     * // Update or create a Collection
     * const collection = await prisma.collection.upsert({
     *   create: {
     *     // ... data to create a Collection
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Collection we want to update
     *   }
     * })
     */
    upsert<T extends collectionUpsertArgs>(args: SelectSubset<T, collectionUpsertArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Collections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {collectionCountArgs} args - Arguments to filter Collections to count.
     * @example
     * // Count the number of Collections
     * const count = await prisma.collection.count({
     *   where: {
     *     // ... the filter for the Collections we want to count
     *   }
     * })
    **/
    count<T extends collectionCountArgs>(
      args?: Subset<T, collectionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CollectionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Collection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CollectionAggregateArgs>(args: Subset<T, CollectionAggregateArgs>): Prisma.PrismaPromise<GetCollectionAggregateType<T>>

    /**
     * Group by Collection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {collectionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends collectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: collectionGroupByArgs['orderBy'] }
        : { orderBy?: collectionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, collectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCollectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the collection model
   */
  readonly fields: collectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for collection.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__collectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    priceListDetail<T extends collection$priceListDetailArgs<ExtArgs> = {}>(args?: Subset<T, collection$priceListDetailArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    products<T extends collection$productsArgs<ExtArgs> = {}>(args?: Subset<T, collection$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the collection model
   */
  interface collectionFieldRefs {
    readonly collectionId: FieldRef<"collection", 'String'>
    readonly name: FieldRef<"collection", 'String'>
    readonly description: FieldRef<"collection", 'String'>
    readonly code: FieldRef<"collection", 'String'>
    readonly isActive: FieldRef<"collection", 'Boolean'>
    readonly createdAt: FieldRef<"collection", 'DateTime'>
    readonly updatedAt: FieldRef<"collection", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * collection findUnique
   */
  export type collectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * Filter, which collection to fetch.
     */
    where: collectionWhereUniqueInput
  }

  /**
   * collection findUniqueOrThrow
   */
  export type collectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * Filter, which collection to fetch.
     */
    where: collectionWhereUniqueInput
  }

  /**
   * collection findFirst
   */
  export type collectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * Filter, which collection to fetch.
     */
    where?: collectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of collections to fetch.
     */
    orderBy?: collectionOrderByWithRelationInput | collectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for collections.
     */
    cursor?: collectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of collections.
     */
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * collection findFirstOrThrow
   */
  export type collectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * Filter, which collection to fetch.
     */
    where?: collectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of collections to fetch.
     */
    orderBy?: collectionOrderByWithRelationInput | collectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for collections.
     */
    cursor?: collectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of collections.
     */
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * collection findMany
   */
  export type collectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * Filter, which collections to fetch.
     */
    where?: collectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of collections to fetch.
     */
    orderBy?: collectionOrderByWithRelationInput | collectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing collections.
     */
    cursor?: collectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` collections.
     */
    skip?: number
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * collection create
   */
  export type collectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * The data needed to create a collection.
     */
    data: XOR<collectionCreateInput, collectionUncheckedCreateInput>
  }

  /**
   * collection createMany
   */
  export type collectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many collections.
     */
    data: collectionCreateManyInput | collectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * collection createManyAndReturn
   */
  export type collectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * The data used to create many collections.
     */
    data: collectionCreateManyInput | collectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * collection update
   */
  export type collectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * The data needed to update a collection.
     */
    data: XOR<collectionUpdateInput, collectionUncheckedUpdateInput>
    /**
     * Choose, which collection to update.
     */
    where: collectionWhereUniqueInput
  }

  /**
   * collection updateMany
   */
  export type collectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update collections.
     */
    data: XOR<collectionUpdateManyMutationInput, collectionUncheckedUpdateManyInput>
    /**
     * Filter which collections to update
     */
    where?: collectionWhereInput
    /**
     * Limit how many collections to update.
     */
    limit?: number
  }

  /**
   * collection updateManyAndReturn
   */
  export type collectionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * The data used to update collections.
     */
    data: XOR<collectionUpdateManyMutationInput, collectionUncheckedUpdateManyInput>
    /**
     * Filter which collections to update
     */
    where?: collectionWhereInput
    /**
     * Limit how many collections to update.
     */
    limit?: number
  }

  /**
   * collection upsert
   */
  export type collectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * The filter to search for the collection to update in case it exists.
     */
    where: collectionWhereUniqueInput
    /**
     * In case the collection found by the `where` argument doesn't exist, create a new collection with this data.
     */
    create: XOR<collectionCreateInput, collectionUncheckedCreateInput>
    /**
     * In case the collection was found with the provided `where` argument, update it with this data.
     */
    update: XOR<collectionUpdateInput, collectionUncheckedUpdateInput>
  }

  /**
   * collection delete
   */
  export type collectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
    /**
     * Filter which collection to delete.
     */
    where: collectionWhereUniqueInput
  }

  /**
   * collection deleteMany
   */
  export type collectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which collections to delete
     */
    where?: collectionWhereInput
    /**
     * Limit how many collections to delete.
     */
    limit?: number
  }

  /**
   * collection.priceListDetail
   */
  export type collection$priceListDetailArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    where?: priceListDetailWhereInput
    orderBy?: priceListDetailOrderByWithRelationInput | priceListDetailOrderByWithRelationInput[]
    cursor?: priceListDetailWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * collection.products
   */
  export type collection$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    where?: productWhereInput
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    cursor?: productWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * collection without action
   */
  export type collectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the collection
     */
    select?: collectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the collection
     */
    omit?: collectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: collectionInclude<ExtArgs> | null
  }


  /**
   * Model product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    stock: number | null
    width: number | null
    height: number | null
  }

  export type ProductSumAggregateOutputType = {
    stock: number | null
    width: number | null
    height: number | null
  }

  export type ProductMinAggregateOutputType = {
    productId: string | null
    name: string | null
    description: string | null
    stock: number | null
    width: number | null
    height: number | null
    cut: boolean | null
    productImage: string | null
    collectionId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    collection_name: string | null
  }

  export type ProductMaxAggregateOutputType = {
    productId: string | null
    name: string | null
    description: string | null
    stock: number | null
    width: number | null
    height: number | null
    cut: boolean | null
    productImage: string | null
    collectionId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    collection_name: string | null
  }

  export type ProductCountAggregateOutputType = {
    productId: number
    name: number
    description: number
    stock: number
    width: number
    height: number
    cut: number
    productImage: number
    collectionId: number
    createdAt: number
    updatedAt: number
    collection_name: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    stock?: true
    width?: true
    height?: true
  }

  export type ProductSumAggregateInputType = {
    stock?: true
    width?: true
    height?: true
  }

  export type ProductMinAggregateInputType = {
    productId?: true
    name?: true
    description?: true
    stock?: true
    width?: true
    height?: true
    cut?: true
    productImage?: true
    collectionId?: true
    createdAt?: true
    updatedAt?: true
    collection_name?: true
  }

  export type ProductMaxAggregateInputType = {
    productId?: true
    name?: true
    description?: true
    stock?: true
    width?: true
    height?: true
    cut?: true
    productImage?: true
    collectionId?: true
    createdAt?: true
    updatedAt?: true
    collection_name?: true
  }

  export type ProductCountAggregateInputType = {
    productId?: true
    name?: true
    description?: true
    stock?: true
    width?: true
    height?: true
    cut?: true
    productImage?: true
    collectionId?: true
    createdAt?: true
    updatedAt?: true
    collection_name?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which product to aggregate.
     */
    where?: productWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: productWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type productGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productWhereInput
    orderBy?: productOrderByWithAggregationInput | productOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: productScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    productId: string
    name: string
    description: string
    stock: number
    width: number
    height: number
    cut: boolean
    productImage: string | null
    collectionId: string
    createdAt: Date
    updatedAt: Date
    collection_name: string | null
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends productGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type productSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    productId?: boolean
    name?: boolean
    description?: boolean
    stock?: boolean
    width?: boolean
    height?: boolean
    cut?: boolean
    productImage?: boolean
    collectionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    collection_name?: boolean
    collection?: boolean | collectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type productSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    productId?: boolean
    name?: boolean
    description?: boolean
    stock?: boolean
    width?: boolean
    height?: boolean
    cut?: boolean
    productImage?: boolean
    collectionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    collection_name?: boolean
    collection?: boolean | collectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type productSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    productId?: boolean
    name?: boolean
    description?: boolean
    stock?: boolean
    width?: boolean
    height?: boolean
    cut?: boolean
    productImage?: boolean
    collectionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    collection_name?: boolean
    collection?: boolean | collectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type productSelectScalar = {
    productId?: boolean
    name?: boolean
    description?: boolean
    stock?: boolean
    width?: boolean
    height?: boolean
    cut?: boolean
    productImage?: boolean
    collectionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    collection_name?: boolean
  }

  export type productOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"productId" | "name" | "description" | "stock" | "width" | "height" | "cut" | "productImage" | "collectionId" | "createdAt" | "updatedAt" | "collection_name", ExtArgs["result"]["product"]>
  export type productInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | collectionDefaultArgs<ExtArgs>
  }
  export type productIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | collectionDefaultArgs<ExtArgs>
  }
  export type productIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | collectionDefaultArgs<ExtArgs>
  }

  export type $productPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "product"
    objects: {
      collection: Prisma.$collectionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      productId: string
      name: string
      description: string
      stock: number
      width: number
      height: number
      cut: boolean
      productImage: string | null
      collectionId: string
      createdAt: Date
      updatedAt: Date
      collection_name: string | null
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type productGetPayload<S extends boolean | null | undefined | productDefaultArgs> = $Result.GetResult<Prisma.$productPayload, S>

  type productCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<productFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface productDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['product'], meta: { name: 'product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {productFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends productFindUniqueArgs>(args: SelectSubset<T, productFindUniqueArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {productFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends productFindUniqueOrThrowArgs>(args: SelectSubset<T, productFindUniqueOrThrowArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends productFindFirstArgs>(args?: SelectSubset<T, productFindFirstArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends productFindFirstOrThrowArgs>(args?: SelectSubset<T, productFindFirstOrThrowArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `productId`
     * const productWithProductIdOnly = await prisma.product.findMany({ select: { productId: true } })
     * 
     */
    findMany<T extends productFindManyArgs>(args?: SelectSubset<T, productFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {productCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends productCreateArgs>(args: SelectSubset<T, productCreateArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {productCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends productCreateManyArgs>(args?: SelectSubset<T, productCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {productCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `productId`
     * const productWithProductIdOnly = await prisma.product.createManyAndReturn({
     *   select: { productId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends productCreateManyAndReturnArgs>(args?: SelectSubset<T, productCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {productDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends productDeleteArgs>(args: SelectSubset<T, productDeleteArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {productUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends productUpdateArgs>(args: SelectSubset<T, productUpdateArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {productDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends productDeleteManyArgs>(args?: SelectSubset<T, productDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends productUpdateManyArgs>(args: SelectSubset<T, productUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {productUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `productId`
     * const productWithProductIdOnly = await prisma.product.updateManyAndReturn({
     *   select: { productId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends productUpdateManyAndReturnArgs>(args: SelectSubset<T, productUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {productUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends productUpsertArgs>(args: SelectSubset<T, productUpsertArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends productCountArgs>(
      args?: Subset<T, productCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends productGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: productGroupByArgs['orderBy'] }
        : { orderBy?: productGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, productGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the product model
   */
  readonly fields: productFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__productClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    collection<T extends collectionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, collectionDefaultArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the product model
   */
  interface productFieldRefs {
    readonly productId: FieldRef<"product", 'String'>
    readonly name: FieldRef<"product", 'String'>
    readonly description: FieldRef<"product", 'String'>
    readonly stock: FieldRef<"product", 'Int'>
    readonly width: FieldRef<"product", 'Float'>
    readonly height: FieldRef<"product", 'Float'>
    readonly cut: FieldRef<"product", 'Boolean'>
    readonly productImage: FieldRef<"product", 'String'>
    readonly collectionId: FieldRef<"product", 'String'>
    readonly createdAt: FieldRef<"product", 'DateTime'>
    readonly updatedAt: FieldRef<"product", 'DateTime'>
    readonly collection_name: FieldRef<"product", 'String'>
  }
    

  // Custom InputTypes
  /**
   * product findUnique
   */
  export type productFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * Filter, which product to fetch.
     */
    where: productWhereUniqueInput
  }

  /**
   * product findUniqueOrThrow
   */
  export type productFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * Filter, which product to fetch.
     */
    where: productWhereUniqueInput
  }

  /**
   * product findFirst
   */
  export type productFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * Filter, which product to fetch.
     */
    where?: productWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for products.
     */
    cursor?: productWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * product findFirstOrThrow
   */
  export type productFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * Filter, which product to fetch.
     */
    where?: productWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for products.
     */
    cursor?: productWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * product findMany
   */
  export type productFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where?: productWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing products.
     */
    cursor?: productWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * product create
   */
  export type productCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * The data needed to create a product.
     */
    data: XOR<productCreateInput, productUncheckedCreateInput>
  }

  /**
   * product createMany
   */
  export type productCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many products.
     */
    data: productCreateManyInput | productCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * product createManyAndReturn
   */
  export type productCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * The data used to create many products.
     */
    data: productCreateManyInput | productCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * product update
   */
  export type productUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * The data needed to update a product.
     */
    data: XOR<productUpdateInput, productUncheckedUpdateInput>
    /**
     * Choose, which product to update.
     */
    where: productWhereUniqueInput
  }

  /**
   * product updateMany
   */
  export type productUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update products.
     */
    data: XOR<productUpdateManyMutationInput, productUncheckedUpdateManyInput>
    /**
     * Filter which products to update
     */
    where?: productWhereInput
    /**
     * Limit how many products to update.
     */
    limit?: number
  }

  /**
   * product updateManyAndReturn
   */
  export type productUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * The data used to update products.
     */
    data: XOR<productUpdateManyMutationInput, productUncheckedUpdateManyInput>
    /**
     * Filter which products to update
     */
    where?: productWhereInput
    /**
     * Limit how many products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * product upsert
   */
  export type productUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * The filter to search for the product to update in case it exists.
     */
    where: productWhereUniqueInput
    /**
     * In case the product found by the `where` argument doesn't exist, create a new product with this data.
     */
    create: XOR<productCreateInput, productUncheckedCreateInput>
    /**
     * In case the product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<productUpdateInput, productUncheckedUpdateInput>
  }

  /**
   * product delete
   */
  export type productDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
    /**
     * Filter which product to delete.
     */
    where: productWhereUniqueInput
  }

  /**
   * product deleteMany
   */
  export type productDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which products to delete
     */
    where?: productWhereInput
    /**
     * Limit how many products to delete.
     */
    limit?: number
  }

  /**
   * product without action
   */
  export type productDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productInclude<ExtArgs> | null
  }


  /**
   * Model priceList
   */

  export type AggregatePriceList = {
    _count: PriceListCountAggregateOutputType | null
    _avg: PriceListAvgAggregateOutputType | null
    _sum: PriceListSumAggregateOutputType | null
    _min: PriceListMinAggregateOutputType | null
    _max: PriceListMaxAggregateOutputType | null
  }

  export type PriceListAvgAggregateOutputType = {
    limit_amount: Decimal | null
  }

  export type PriceListSumAggregateOutputType = {
    limit_amount: Decimal | null
  }

  export type PriceListMinAggregateOutputType = {
    price_list_id: string | null
    name: string | null
    description: string | null
    is_default: boolean | null
    valid_from: Date | null
    valid_to: Date | null
    limit_amount: Decimal | null
    currency: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PriceListMaxAggregateOutputType = {
    price_list_id: string | null
    name: string | null
    description: string | null
    is_default: boolean | null
    valid_from: Date | null
    valid_to: Date | null
    limit_amount: Decimal | null
    currency: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PriceListCountAggregateOutputType = {
    price_list_id: number
    name: number
    description: number
    is_default: number
    valid_from: number
    valid_to: number
    limit_amount: number
    currency: number
    is_active: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type PriceListAvgAggregateInputType = {
    limit_amount?: true
  }

  export type PriceListSumAggregateInputType = {
    limit_amount?: true
  }

  export type PriceListMinAggregateInputType = {
    price_list_id?: true
    name?: true
    description?: true
    is_default?: true
    valid_from?: true
    valid_to?: true
    limit_amount?: true
    currency?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type PriceListMaxAggregateInputType = {
    price_list_id?: true
    name?: true
    description?: true
    is_default?: true
    valid_from?: true
    valid_to?: true
    limit_amount?: true
    currency?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type PriceListCountAggregateInputType = {
    price_list_id?: true
    name?: true
    description?: true
    is_default?: true
    valid_from?: true
    valid_to?: true
    limit_amount?: true
    currency?: true
    is_active?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type PriceListAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which priceList to aggregate.
     */
    where?: priceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of priceLists to fetch.
     */
    orderBy?: priceListOrderByWithRelationInput | priceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: priceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` priceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` priceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned priceLists
    **/
    _count?: true | PriceListCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PriceListAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PriceListSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PriceListMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PriceListMaxAggregateInputType
  }

  export type GetPriceListAggregateType<T extends PriceListAggregateArgs> = {
        [P in keyof T & keyof AggregatePriceList]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePriceList[P]>
      : GetScalarType<T[P], AggregatePriceList[P]>
  }




  export type priceListGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: priceListWhereInput
    orderBy?: priceListOrderByWithAggregationInput | priceListOrderByWithAggregationInput[]
    by: PriceListScalarFieldEnum[] | PriceListScalarFieldEnum
    having?: priceListScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PriceListCountAggregateInputType | true
    _avg?: PriceListAvgAggregateInputType
    _sum?: PriceListSumAggregateInputType
    _min?: PriceListMinAggregateInputType
    _max?: PriceListMaxAggregateInputType
  }

  export type PriceListGroupByOutputType = {
    price_list_id: string
    name: string
    description: string | null
    is_default: boolean
    valid_from: Date | null
    valid_to: Date | null
    limit_amount: Decimal | null
    currency: string
    is_active: boolean
    created_at: Date
    updated_at: Date
    _count: PriceListCountAggregateOutputType | null
    _avg: PriceListAvgAggregateOutputType | null
    _sum: PriceListSumAggregateOutputType | null
    _min: PriceListMinAggregateOutputType | null
    _max: PriceListMaxAggregateOutputType | null
  }

  type GetPriceListGroupByPayload<T extends priceListGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PriceListGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PriceListGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PriceListGroupByOutputType[P]>
            : GetScalarType<T[P], PriceListGroupByOutputType[P]>
        }
      >
    >


  export type priceListSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_id?: boolean
    name?: boolean
    description?: boolean
    is_default?: boolean
    valid_from?: boolean
    valid_to?: boolean
    limit_amount?: boolean
    currency?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    priceListDetail?: boolean | priceList$priceListDetailArgs<ExtArgs>
    userPriceList?: boolean | priceList$userPriceListArgs<ExtArgs>
    _count?: boolean | PriceListCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceList"]>

  export type priceListSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_id?: boolean
    name?: boolean
    description?: boolean
    is_default?: boolean
    valid_from?: boolean
    valid_to?: boolean
    limit_amount?: boolean
    currency?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["priceList"]>

  export type priceListSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_id?: boolean
    name?: boolean
    description?: boolean
    is_default?: boolean
    valid_from?: boolean
    valid_to?: boolean
    limit_amount?: boolean
    currency?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["priceList"]>

  export type priceListSelectScalar = {
    price_list_id?: boolean
    name?: boolean
    description?: boolean
    is_default?: boolean
    valid_from?: boolean
    valid_to?: boolean
    limit_amount?: boolean
    currency?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type priceListOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"price_list_id" | "name" | "description" | "is_default" | "valid_from" | "valid_to" | "limit_amount" | "currency" | "is_active" | "created_at" | "updated_at", ExtArgs["result"]["priceList"]>
  export type priceListInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    priceListDetail?: boolean | priceList$priceListDetailArgs<ExtArgs>
    userPriceList?: boolean | priceList$userPriceListArgs<ExtArgs>
    _count?: boolean | PriceListCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type priceListIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type priceListIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $priceListPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "priceList"
    objects: {
      priceListDetail: Prisma.$priceListDetailPayload<ExtArgs>[]
      userPriceList: Prisma.$userPriceListPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      price_list_id: string
      name: string
      description: string | null
      is_default: boolean
      valid_from: Date | null
      valid_to: Date | null
      limit_amount: Prisma.Decimal | null
      currency: string
      is_active: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["priceList"]>
    composites: {}
  }

  type priceListGetPayload<S extends boolean | null | undefined | priceListDefaultArgs> = $Result.GetResult<Prisma.$priceListPayload, S>

  type priceListCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<priceListFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PriceListCountAggregateInputType | true
    }

  export interface priceListDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['priceList'], meta: { name: 'priceList' } }
    /**
     * Find zero or one PriceList that matches the filter.
     * @param {priceListFindUniqueArgs} args - Arguments to find a PriceList
     * @example
     * // Get one PriceList
     * const priceList = await prisma.priceList.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends priceListFindUniqueArgs>(args: SelectSubset<T, priceListFindUniqueArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PriceList that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {priceListFindUniqueOrThrowArgs} args - Arguments to find a PriceList
     * @example
     * // Get one PriceList
     * const priceList = await prisma.priceList.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends priceListFindUniqueOrThrowArgs>(args: SelectSubset<T, priceListFindUniqueOrThrowArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceList that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListFindFirstArgs} args - Arguments to find a PriceList
     * @example
     * // Get one PriceList
     * const priceList = await prisma.priceList.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends priceListFindFirstArgs>(args?: SelectSubset<T, priceListFindFirstArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceList that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListFindFirstOrThrowArgs} args - Arguments to find a PriceList
     * @example
     * // Get one PriceList
     * const priceList = await prisma.priceList.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends priceListFindFirstOrThrowArgs>(args?: SelectSubset<T, priceListFindFirstOrThrowArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PriceLists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PriceLists
     * const priceLists = await prisma.priceList.findMany()
     * 
     * // Get first 10 PriceLists
     * const priceLists = await prisma.priceList.findMany({ take: 10 })
     * 
     * // Only select the `price_list_id`
     * const priceListWithPrice_list_idOnly = await prisma.priceList.findMany({ select: { price_list_id: true } })
     * 
     */
    findMany<T extends priceListFindManyArgs>(args?: SelectSubset<T, priceListFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PriceList.
     * @param {priceListCreateArgs} args - Arguments to create a PriceList.
     * @example
     * // Create one PriceList
     * const PriceList = await prisma.priceList.create({
     *   data: {
     *     // ... data to create a PriceList
     *   }
     * })
     * 
     */
    create<T extends priceListCreateArgs>(args: SelectSubset<T, priceListCreateArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PriceLists.
     * @param {priceListCreateManyArgs} args - Arguments to create many PriceLists.
     * @example
     * // Create many PriceLists
     * const priceList = await prisma.priceList.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends priceListCreateManyArgs>(args?: SelectSubset<T, priceListCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PriceLists and returns the data saved in the database.
     * @param {priceListCreateManyAndReturnArgs} args - Arguments to create many PriceLists.
     * @example
     * // Create many PriceLists
     * const priceList = await prisma.priceList.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PriceLists and only return the `price_list_id`
     * const priceListWithPrice_list_idOnly = await prisma.priceList.createManyAndReturn({
     *   select: { price_list_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends priceListCreateManyAndReturnArgs>(args?: SelectSubset<T, priceListCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PriceList.
     * @param {priceListDeleteArgs} args - Arguments to delete one PriceList.
     * @example
     * // Delete one PriceList
     * const PriceList = await prisma.priceList.delete({
     *   where: {
     *     // ... filter to delete one PriceList
     *   }
     * })
     * 
     */
    delete<T extends priceListDeleteArgs>(args: SelectSubset<T, priceListDeleteArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PriceList.
     * @param {priceListUpdateArgs} args - Arguments to update one PriceList.
     * @example
     * // Update one PriceList
     * const priceList = await prisma.priceList.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends priceListUpdateArgs>(args: SelectSubset<T, priceListUpdateArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PriceLists.
     * @param {priceListDeleteManyArgs} args - Arguments to filter PriceLists to delete.
     * @example
     * // Delete a few PriceLists
     * const { count } = await prisma.priceList.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends priceListDeleteManyArgs>(args?: SelectSubset<T, priceListDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PriceLists
     * const priceList = await prisma.priceList.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends priceListUpdateManyArgs>(args: SelectSubset<T, priceListUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceLists and returns the data updated in the database.
     * @param {priceListUpdateManyAndReturnArgs} args - Arguments to update many PriceLists.
     * @example
     * // Update many PriceLists
     * const priceList = await prisma.priceList.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PriceLists and only return the `price_list_id`
     * const priceListWithPrice_list_idOnly = await prisma.priceList.updateManyAndReturn({
     *   select: { price_list_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends priceListUpdateManyAndReturnArgs>(args: SelectSubset<T, priceListUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PriceList.
     * @param {priceListUpsertArgs} args - Arguments to update or create a PriceList.
     * @example
     * // Update or create a PriceList
     * const priceList = await prisma.priceList.upsert({
     *   create: {
     *     // ... data to create a PriceList
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PriceList we want to update
     *   }
     * })
     */
    upsert<T extends priceListUpsertArgs>(args: SelectSubset<T, priceListUpsertArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PriceLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListCountArgs} args - Arguments to filter PriceLists to count.
     * @example
     * // Count the number of PriceLists
     * const count = await prisma.priceList.count({
     *   where: {
     *     // ... the filter for the PriceLists we want to count
     *   }
     * })
    **/
    count<T extends priceListCountArgs>(
      args?: Subset<T, priceListCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PriceListCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PriceList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PriceListAggregateArgs>(args: Subset<T, PriceListAggregateArgs>): Prisma.PrismaPromise<GetPriceListAggregateType<T>>

    /**
     * Group by PriceList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends priceListGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: priceListGroupByArgs['orderBy'] }
        : { orderBy?: priceListGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, priceListGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPriceListGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the priceList model
   */
  readonly fields: priceListFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for priceList.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__priceListClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    priceListDetail<T extends priceList$priceListDetailArgs<ExtArgs> = {}>(args?: Subset<T, priceList$priceListDetailArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    userPriceList<T extends priceList$userPriceListArgs<ExtArgs> = {}>(args?: Subset<T, priceList$userPriceListArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the priceList model
   */
  interface priceListFieldRefs {
    readonly price_list_id: FieldRef<"priceList", 'String'>
    readonly name: FieldRef<"priceList", 'String'>
    readonly description: FieldRef<"priceList", 'String'>
    readonly is_default: FieldRef<"priceList", 'Boolean'>
    readonly valid_from: FieldRef<"priceList", 'DateTime'>
    readonly valid_to: FieldRef<"priceList", 'DateTime'>
    readonly limit_amount: FieldRef<"priceList", 'Decimal'>
    readonly currency: FieldRef<"priceList", 'String'>
    readonly is_active: FieldRef<"priceList", 'Boolean'>
    readonly created_at: FieldRef<"priceList", 'DateTime'>
    readonly updated_at: FieldRef<"priceList", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * priceList findUnique
   */
  export type priceListFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * Filter, which priceList to fetch.
     */
    where: priceListWhereUniqueInput
  }

  /**
   * priceList findUniqueOrThrow
   */
  export type priceListFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * Filter, which priceList to fetch.
     */
    where: priceListWhereUniqueInput
  }

  /**
   * priceList findFirst
   */
  export type priceListFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * Filter, which priceList to fetch.
     */
    where?: priceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of priceLists to fetch.
     */
    orderBy?: priceListOrderByWithRelationInput | priceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for priceLists.
     */
    cursor?: priceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` priceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` priceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of priceLists.
     */
    distinct?: PriceListScalarFieldEnum | PriceListScalarFieldEnum[]
  }

  /**
   * priceList findFirstOrThrow
   */
  export type priceListFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * Filter, which priceList to fetch.
     */
    where?: priceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of priceLists to fetch.
     */
    orderBy?: priceListOrderByWithRelationInput | priceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for priceLists.
     */
    cursor?: priceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` priceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` priceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of priceLists.
     */
    distinct?: PriceListScalarFieldEnum | PriceListScalarFieldEnum[]
  }

  /**
   * priceList findMany
   */
  export type priceListFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * Filter, which priceLists to fetch.
     */
    where?: priceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of priceLists to fetch.
     */
    orderBy?: priceListOrderByWithRelationInput | priceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing priceLists.
     */
    cursor?: priceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` priceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` priceLists.
     */
    skip?: number
    distinct?: PriceListScalarFieldEnum | PriceListScalarFieldEnum[]
  }

  /**
   * priceList create
   */
  export type priceListCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * The data needed to create a priceList.
     */
    data: XOR<priceListCreateInput, priceListUncheckedCreateInput>
  }

  /**
   * priceList createMany
   */
  export type priceListCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many priceLists.
     */
    data: priceListCreateManyInput | priceListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * priceList createManyAndReturn
   */
  export type priceListCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * The data used to create many priceLists.
     */
    data: priceListCreateManyInput | priceListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * priceList update
   */
  export type priceListUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * The data needed to update a priceList.
     */
    data: XOR<priceListUpdateInput, priceListUncheckedUpdateInput>
    /**
     * Choose, which priceList to update.
     */
    where: priceListWhereUniqueInput
  }

  /**
   * priceList updateMany
   */
  export type priceListUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update priceLists.
     */
    data: XOR<priceListUpdateManyMutationInput, priceListUncheckedUpdateManyInput>
    /**
     * Filter which priceLists to update
     */
    where?: priceListWhereInput
    /**
     * Limit how many priceLists to update.
     */
    limit?: number
  }

  /**
   * priceList updateManyAndReturn
   */
  export type priceListUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * The data used to update priceLists.
     */
    data: XOR<priceListUpdateManyMutationInput, priceListUncheckedUpdateManyInput>
    /**
     * Filter which priceLists to update
     */
    where?: priceListWhereInput
    /**
     * Limit how many priceLists to update.
     */
    limit?: number
  }

  /**
   * priceList upsert
   */
  export type priceListUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * The filter to search for the priceList to update in case it exists.
     */
    where: priceListWhereUniqueInput
    /**
     * In case the priceList found by the `where` argument doesn't exist, create a new priceList with this data.
     */
    create: XOR<priceListCreateInput, priceListUncheckedCreateInput>
    /**
     * In case the priceList was found with the provided `where` argument, update it with this data.
     */
    update: XOR<priceListUpdateInput, priceListUncheckedUpdateInput>
  }

  /**
   * priceList delete
   */
  export type priceListDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
    /**
     * Filter which priceList to delete.
     */
    where: priceListWhereUniqueInput
  }

  /**
   * priceList deleteMany
   */
  export type priceListDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which priceLists to delete
     */
    where?: priceListWhereInput
    /**
     * Limit how many priceLists to delete.
     */
    limit?: number
  }

  /**
   * priceList.priceListDetail
   */
  export type priceList$priceListDetailArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    where?: priceListDetailWhereInput
    orderBy?: priceListDetailOrderByWithRelationInput | priceListDetailOrderByWithRelationInput[]
    cursor?: priceListDetailWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * priceList.userPriceList
   */
  export type priceList$userPriceListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    where?: userPriceListWhereInput
    orderBy?: userPriceListOrderByWithRelationInput | userPriceListOrderByWithRelationInput[]
    cursor?: userPriceListWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * priceList without action
   */
  export type priceListDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceList
     */
    select?: priceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceList
     */
    omit?: priceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListInclude<ExtArgs> | null
  }


  /**
   * Model priceListDetail
   */

  export type AggregatePriceListDetail = {
    _count: PriceListDetailCountAggregateOutputType | null
    _avg: PriceListDetailAvgAggregateOutputType | null
    _sum: PriceListDetailSumAggregateOutputType | null
    _min: PriceListDetailMinAggregateOutputType | null
    _max: PriceListDetailMaxAggregateOutputType | null
  }

  export type PriceListDetailAvgAggregateOutputType = {
    price_per_square_meter: Decimal | null
  }

  export type PriceListDetailSumAggregateOutputType = {
    price_per_square_meter: Decimal | null
  }

  export type PriceListDetailMinAggregateOutputType = {
    price_list_detail_id: string | null
    price_list_id: string | null
    collection_id: string | null
    price_per_square_meter: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PriceListDetailMaxAggregateOutputType = {
    price_list_detail_id: string | null
    price_list_id: string | null
    collection_id: string | null
    price_per_square_meter: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PriceListDetailCountAggregateOutputType = {
    price_list_detail_id: number
    price_list_id: number
    collection_id: number
    price_per_square_meter: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type PriceListDetailAvgAggregateInputType = {
    price_per_square_meter?: true
  }

  export type PriceListDetailSumAggregateInputType = {
    price_per_square_meter?: true
  }

  export type PriceListDetailMinAggregateInputType = {
    price_list_detail_id?: true
    price_list_id?: true
    collection_id?: true
    price_per_square_meter?: true
    created_at?: true
    updated_at?: true
  }

  export type PriceListDetailMaxAggregateInputType = {
    price_list_detail_id?: true
    price_list_id?: true
    collection_id?: true
    price_per_square_meter?: true
    created_at?: true
    updated_at?: true
  }

  export type PriceListDetailCountAggregateInputType = {
    price_list_detail_id?: true
    price_list_id?: true
    collection_id?: true
    price_per_square_meter?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type PriceListDetailAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which priceListDetail to aggregate.
     */
    where?: priceListDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of priceListDetails to fetch.
     */
    orderBy?: priceListDetailOrderByWithRelationInput | priceListDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: priceListDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` priceListDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` priceListDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned priceListDetails
    **/
    _count?: true | PriceListDetailCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PriceListDetailAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PriceListDetailSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PriceListDetailMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PriceListDetailMaxAggregateInputType
  }

  export type GetPriceListDetailAggregateType<T extends PriceListDetailAggregateArgs> = {
        [P in keyof T & keyof AggregatePriceListDetail]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePriceListDetail[P]>
      : GetScalarType<T[P], AggregatePriceListDetail[P]>
  }




  export type priceListDetailGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: priceListDetailWhereInput
    orderBy?: priceListDetailOrderByWithAggregationInput | priceListDetailOrderByWithAggregationInput[]
    by: PriceListDetailScalarFieldEnum[] | PriceListDetailScalarFieldEnum
    having?: priceListDetailScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PriceListDetailCountAggregateInputType | true
    _avg?: PriceListDetailAvgAggregateInputType
    _sum?: PriceListDetailSumAggregateInputType
    _min?: PriceListDetailMinAggregateInputType
    _max?: PriceListDetailMaxAggregateInputType
  }

  export type PriceListDetailGroupByOutputType = {
    price_list_detail_id: string
    price_list_id: string
    collection_id: string
    price_per_square_meter: Decimal
    created_at: Date
    updated_at: Date
    _count: PriceListDetailCountAggregateOutputType | null
    _avg: PriceListDetailAvgAggregateOutputType | null
    _sum: PriceListDetailSumAggregateOutputType | null
    _min: PriceListDetailMinAggregateOutputType | null
    _max: PriceListDetailMaxAggregateOutputType | null
  }

  type GetPriceListDetailGroupByPayload<T extends priceListDetailGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PriceListDetailGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PriceListDetailGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PriceListDetailGroupByOutputType[P]>
            : GetScalarType<T[P], PriceListDetailGroupByOutputType[P]>
        }
      >
    >


  export type priceListDetailSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_detail_id?: boolean
    price_list_id?: boolean
    collection_id?: boolean
    price_per_square_meter?: boolean
    created_at?: boolean
    updated_at?: boolean
    collection?: boolean | collectionDefaultArgs<ExtArgs>
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceListDetail"]>

  export type priceListDetailSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_detail_id?: boolean
    price_list_id?: boolean
    collection_id?: boolean
    price_per_square_meter?: boolean
    created_at?: boolean
    updated_at?: boolean
    collection?: boolean | collectionDefaultArgs<ExtArgs>
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceListDetail"]>

  export type priceListDetailSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_detail_id?: boolean
    price_list_id?: boolean
    collection_id?: boolean
    price_per_square_meter?: boolean
    created_at?: boolean
    updated_at?: boolean
    collection?: boolean | collectionDefaultArgs<ExtArgs>
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceListDetail"]>

  export type priceListDetailSelectScalar = {
    price_list_detail_id?: boolean
    price_list_id?: boolean
    collection_id?: boolean
    price_per_square_meter?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type priceListDetailOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"price_list_detail_id" | "price_list_id" | "collection_id" | "price_per_square_meter" | "created_at" | "updated_at", ExtArgs["result"]["priceListDetail"]>
  export type priceListDetailInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | collectionDefaultArgs<ExtArgs>
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
  }
  export type priceListDetailIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | collectionDefaultArgs<ExtArgs>
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
  }
  export type priceListDetailIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | collectionDefaultArgs<ExtArgs>
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
  }

  export type $priceListDetailPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "priceListDetail"
    objects: {
      collection: Prisma.$collectionPayload<ExtArgs>
      priceList: Prisma.$priceListPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      price_list_detail_id: string
      price_list_id: string
      collection_id: string
      price_per_square_meter: Prisma.Decimal
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["priceListDetail"]>
    composites: {}
  }

  type priceListDetailGetPayload<S extends boolean | null | undefined | priceListDetailDefaultArgs> = $Result.GetResult<Prisma.$priceListDetailPayload, S>

  type priceListDetailCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<priceListDetailFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PriceListDetailCountAggregateInputType | true
    }

  export interface priceListDetailDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['priceListDetail'], meta: { name: 'priceListDetail' } }
    /**
     * Find zero or one PriceListDetail that matches the filter.
     * @param {priceListDetailFindUniqueArgs} args - Arguments to find a PriceListDetail
     * @example
     * // Get one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends priceListDetailFindUniqueArgs>(args: SelectSubset<T, priceListDetailFindUniqueArgs<ExtArgs>>): Prisma__priceListDetailClient<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PriceListDetail that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {priceListDetailFindUniqueOrThrowArgs} args - Arguments to find a PriceListDetail
     * @example
     * // Get one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends priceListDetailFindUniqueOrThrowArgs>(args: SelectSubset<T, priceListDetailFindUniqueOrThrowArgs<ExtArgs>>): Prisma__priceListDetailClient<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceListDetail that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListDetailFindFirstArgs} args - Arguments to find a PriceListDetail
     * @example
     * // Get one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends priceListDetailFindFirstArgs>(args?: SelectSubset<T, priceListDetailFindFirstArgs<ExtArgs>>): Prisma__priceListDetailClient<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceListDetail that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListDetailFindFirstOrThrowArgs} args - Arguments to find a PriceListDetail
     * @example
     * // Get one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends priceListDetailFindFirstOrThrowArgs>(args?: SelectSubset<T, priceListDetailFindFirstOrThrowArgs<ExtArgs>>): Prisma__priceListDetailClient<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PriceListDetails that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListDetailFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PriceListDetails
     * const priceListDetails = await prisma.priceListDetail.findMany()
     * 
     * // Get first 10 PriceListDetails
     * const priceListDetails = await prisma.priceListDetail.findMany({ take: 10 })
     * 
     * // Only select the `price_list_detail_id`
     * const priceListDetailWithPrice_list_detail_idOnly = await prisma.priceListDetail.findMany({ select: { price_list_detail_id: true } })
     * 
     */
    findMany<T extends priceListDetailFindManyArgs>(args?: SelectSubset<T, priceListDetailFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PriceListDetail.
     * @param {priceListDetailCreateArgs} args - Arguments to create a PriceListDetail.
     * @example
     * // Create one PriceListDetail
     * const PriceListDetail = await prisma.priceListDetail.create({
     *   data: {
     *     // ... data to create a PriceListDetail
     *   }
     * })
     * 
     */
    create<T extends priceListDetailCreateArgs>(args: SelectSubset<T, priceListDetailCreateArgs<ExtArgs>>): Prisma__priceListDetailClient<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PriceListDetails.
     * @param {priceListDetailCreateManyArgs} args - Arguments to create many PriceListDetails.
     * @example
     * // Create many PriceListDetails
     * const priceListDetail = await prisma.priceListDetail.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends priceListDetailCreateManyArgs>(args?: SelectSubset<T, priceListDetailCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PriceListDetails and returns the data saved in the database.
     * @param {priceListDetailCreateManyAndReturnArgs} args - Arguments to create many PriceListDetails.
     * @example
     * // Create many PriceListDetails
     * const priceListDetail = await prisma.priceListDetail.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PriceListDetails and only return the `price_list_detail_id`
     * const priceListDetailWithPrice_list_detail_idOnly = await prisma.priceListDetail.createManyAndReturn({
     *   select: { price_list_detail_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends priceListDetailCreateManyAndReturnArgs>(args?: SelectSubset<T, priceListDetailCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PriceListDetail.
     * @param {priceListDetailDeleteArgs} args - Arguments to delete one PriceListDetail.
     * @example
     * // Delete one PriceListDetail
     * const PriceListDetail = await prisma.priceListDetail.delete({
     *   where: {
     *     // ... filter to delete one PriceListDetail
     *   }
     * })
     * 
     */
    delete<T extends priceListDetailDeleteArgs>(args: SelectSubset<T, priceListDetailDeleteArgs<ExtArgs>>): Prisma__priceListDetailClient<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PriceListDetail.
     * @param {priceListDetailUpdateArgs} args - Arguments to update one PriceListDetail.
     * @example
     * // Update one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends priceListDetailUpdateArgs>(args: SelectSubset<T, priceListDetailUpdateArgs<ExtArgs>>): Prisma__priceListDetailClient<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PriceListDetails.
     * @param {priceListDetailDeleteManyArgs} args - Arguments to filter PriceListDetails to delete.
     * @example
     * // Delete a few PriceListDetails
     * const { count } = await prisma.priceListDetail.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends priceListDetailDeleteManyArgs>(args?: SelectSubset<T, priceListDetailDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceListDetails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListDetailUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PriceListDetails
     * const priceListDetail = await prisma.priceListDetail.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends priceListDetailUpdateManyArgs>(args: SelectSubset<T, priceListDetailUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceListDetails and returns the data updated in the database.
     * @param {priceListDetailUpdateManyAndReturnArgs} args - Arguments to update many PriceListDetails.
     * @example
     * // Update many PriceListDetails
     * const priceListDetail = await prisma.priceListDetail.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PriceListDetails and only return the `price_list_detail_id`
     * const priceListDetailWithPrice_list_detail_idOnly = await prisma.priceListDetail.updateManyAndReturn({
     *   select: { price_list_detail_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends priceListDetailUpdateManyAndReturnArgs>(args: SelectSubset<T, priceListDetailUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PriceListDetail.
     * @param {priceListDetailUpsertArgs} args - Arguments to update or create a PriceListDetail.
     * @example
     * // Update or create a PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.upsert({
     *   create: {
     *     // ... data to create a PriceListDetail
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PriceListDetail we want to update
     *   }
     * })
     */
    upsert<T extends priceListDetailUpsertArgs>(args: SelectSubset<T, priceListDetailUpsertArgs<ExtArgs>>): Prisma__priceListDetailClient<$Result.GetResult<Prisma.$priceListDetailPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PriceListDetails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListDetailCountArgs} args - Arguments to filter PriceListDetails to count.
     * @example
     * // Count the number of PriceListDetails
     * const count = await prisma.priceListDetail.count({
     *   where: {
     *     // ... the filter for the PriceListDetails we want to count
     *   }
     * })
    **/
    count<T extends priceListDetailCountArgs>(
      args?: Subset<T, priceListDetailCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PriceListDetailCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PriceListDetail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListDetailAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PriceListDetailAggregateArgs>(args: Subset<T, PriceListDetailAggregateArgs>): Prisma.PrismaPromise<GetPriceListDetailAggregateType<T>>

    /**
     * Group by PriceListDetail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {priceListDetailGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends priceListDetailGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: priceListDetailGroupByArgs['orderBy'] }
        : { orderBy?: priceListDetailGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, priceListDetailGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPriceListDetailGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the priceListDetail model
   */
  readonly fields: priceListDetailFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for priceListDetail.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__priceListDetailClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    collection<T extends collectionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, collectionDefaultArgs<ExtArgs>>): Prisma__collectionClient<$Result.GetResult<Prisma.$collectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    priceList<T extends priceListDefaultArgs<ExtArgs> = {}>(args?: Subset<T, priceListDefaultArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the priceListDetail model
   */
  interface priceListDetailFieldRefs {
    readonly price_list_detail_id: FieldRef<"priceListDetail", 'String'>
    readonly price_list_id: FieldRef<"priceListDetail", 'String'>
    readonly collection_id: FieldRef<"priceListDetail", 'String'>
    readonly price_per_square_meter: FieldRef<"priceListDetail", 'Decimal'>
    readonly created_at: FieldRef<"priceListDetail", 'DateTime'>
    readonly updated_at: FieldRef<"priceListDetail", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * priceListDetail findUnique
   */
  export type priceListDetailFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which priceListDetail to fetch.
     */
    where: priceListDetailWhereUniqueInput
  }

  /**
   * priceListDetail findUniqueOrThrow
   */
  export type priceListDetailFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which priceListDetail to fetch.
     */
    where: priceListDetailWhereUniqueInput
  }

  /**
   * priceListDetail findFirst
   */
  export type priceListDetailFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which priceListDetail to fetch.
     */
    where?: priceListDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of priceListDetails to fetch.
     */
    orderBy?: priceListDetailOrderByWithRelationInput | priceListDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for priceListDetails.
     */
    cursor?: priceListDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` priceListDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` priceListDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of priceListDetails.
     */
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * priceListDetail findFirstOrThrow
   */
  export type priceListDetailFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which priceListDetail to fetch.
     */
    where?: priceListDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of priceListDetails to fetch.
     */
    orderBy?: priceListDetailOrderByWithRelationInput | priceListDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for priceListDetails.
     */
    cursor?: priceListDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` priceListDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` priceListDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of priceListDetails.
     */
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * priceListDetail findMany
   */
  export type priceListDetailFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which priceListDetails to fetch.
     */
    where?: priceListDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of priceListDetails to fetch.
     */
    orderBy?: priceListDetailOrderByWithRelationInput | priceListDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing priceListDetails.
     */
    cursor?: priceListDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` priceListDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` priceListDetails.
     */
    skip?: number
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * priceListDetail create
   */
  export type priceListDetailCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * The data needed to create a priceListDetail.
     */
    data: XOR<priceListDetailCreateInput, priceListDetailUncheckedCreateInput>
  }

  /**
   * priceListDetail createMany
   */
  export type priceListDetailCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many priceListDetails.
     */
    data: priceListDetailCreateManyInput | priceListDetailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * priceListDetail createManyAndReturn
   */
  export type priceListDetailCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * The data used to create many priceListDetails.
     */
    data: priceListDetailCreateManyInput | priceListDetailCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * priceListDetail update
   */
  export type priceListDetailUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * The data needed to update a priceListDetail.
     */
    data: XOR<priceListDetailUpdateInput, priceListDetailUncheckedUpdateInput>
    /**
     * Choose, which priceListDetail to update.
     */
    where: priceListDetailWhereUniqueInput
  }

  /**
   * priceListDetail updateMany
   */
  export type priceListDetailUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update priceListDetails.
     */
    data: XOR<priceListDetailUpdateManyMutationInput, priceListDetailUncheckedUpdateManyInput>
    /**
     * Filter which priceListDetails to update
     */
    where?: priceListDetailWhereInput
    /**
     * Limit how many priceListDetails to update.
     */
    limit?: number
  }

  /**
   * priceListDetail updateManyAndReturn
   */
  export type priceListDetailUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * The data used to update priceListDetails.
     */
    data: XOR<priceListDetailUpdateManyMutationInput, priceListDetailUncheckedUpdateManyInput>
    /**
     * Filter which priceListDetails to update
     */
    where?: priceListDetailWhereInput
    /**
     * Limit how many priceListDetails to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * priceListDetail upsert
   */
  export type priceListDetailUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * The filter to search for the priceListDetail to update in case it exists.
     */
    where: priceListDetailWhereUniqueInput
    /**
     * In case the priceListDetail found by the `where` argument doesn't exist, create a new priceListDetail with this data.
     */
    create: XOR<priceListDetailCreateInput, priceListDetailUncheckedCreateInput>
    /**
     * In case the priceListDetail was found with the provided `where` argument, update it with this data.
     */
    update: XOR<priceListDetailUpdateInput, priceListDetailUncheckedUpdateInput>
  }

  /**
   * priceListDetail delete
   */
  export type priceListDetailDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
    /**
     * Filter which priceListDetail to delete.
     */
    where: priceListDetailWhereUniqueInput
  }

  /**
   * priceListDetail deleteMany
   */
  export type priceListDetailDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which priceListDetails to delete
     */
    where?: priceListDetailWhereInput
    /**
     * Limit how many priceListDetails to delete.
     */
    limit?: number
  }

  /**
   * priceListDetail without action
   */
  export type priceListDetailDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the priceListDetail
     */
    select?: priceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the priceListDetail
     */
    omit?: priceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: priceListDetailInclude<ExtArgs> | null
  }


  /**
   * Model userPriceList
   */

  export type AggregateUserPriceList = {
    _count: UserPriceListCountAggregateOutputType | null
    _min: UserPriceListMinAggregateOutputType | null
    _max: UserPriceListMaxAggregateOutputType | null
  }

  export type UserPriceListMinAggregateOutputType = {
    user_price_list_id: string | null
    user_id: string | null
    price_list_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserPriceListMaxAggregateOutputType = {
    user_price_list_id: string | null
    user_id: string | null
    price_list_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserPriceListCountAggregateOutputType = {
    user_price_list_id: number
    user_id: number
    price_list_id: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserPriceListMinAggregateInputType = {
    user_price_list_id?: true
    user_id?: true
    price_list_id?: true
    created_at?: true
    updated_at?: true
  }

  export type UserPriceListMaxAggregateInputType = {
    user_price_list_id?: true
    user_id?: true
    price_list_id?: true
    created_at?: true
    updated_at?: true
  }

  export type UserPriceListCountAggregateInputType = {
    user_price_list_id?: true
    user_id?: true
    price_list_id?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserPriceListAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which userPriceList to aggregate.
     */
    where?: userPriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of userPriceLists to fetch.
     */
    orderBy?: userPriceListOrderByWithRelationInput | userPriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: userPriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` userPriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` userPriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned userPriceLists
    **/
    _count?: true | UserPriceListCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserPriceListMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserPriceListMaxAggregateInputType
  }

  export type GetUserPriceListAggregateType<T extends UserPriceListAggregateArgs> = {
        [P in keyof T & keyof AggregateUserPriceList]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserPriceList[P]>
      : GetScalarType<T[P], AggregateUserPriceList[P]>
  }




  export type userPriceListGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: userPriceListWhereInput
    orderBy?: userPriceListOrderByWithAggregationInput | userPriceListOrderByWithAggregationInput[]
    by: UserPriceListScalarFieldEnum[] | UserPriceListScalarFieldEnum
    having?: userPriceListScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserPriceListCountAggregateInputType | true
    _min?: UserPriceListMinAggregateInputType
    _max?: UserPriceListMaxAggregateInputType
  }

  export type UserPriceListGroupByOutputType = {
    user_price_list_id: string
    user_id: string
    price_list_id: string
    created_at: Date
    updated_at: Date
    _count: UserPriceListCountAggregateOutputType | null
    _min: UserPriceListMinAggregateOutputType | null
    _max: UserPriceListMaxAggregateOutputType | null
  }

  type GetUserPriceListGroupByPayload<T extends userPriceListGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserPriceListGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserPriceListGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserPriceListGroupByOutputType[P]>
            : GetScalarType<T[P], UserPriceListGroupByOutputType[P]>
        }
      >
    >


  export type userPriceListSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_price_list_id?: boolean
    user_id?: boolean
    price_list_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
    user?: boolean | userDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPriceList"]>

  export type userPriceListSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_price_list_id?: boolean
    user_id?: boolean
    price_list_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
    user?: boolean | userDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPriceList"]>

  export type userPriceListSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_price_list_id?: boolean
    user_id?: boolean
    price_list_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
    user?: boolean | userDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPriceList"]>

  export type userPriceListSelectScalar = {
    user_price_list_id?: boolean
    user_id?: boolean
    price_list_id?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type userPriceListOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"user_price_list_id" | "user_id" | "price_list_id" | "created_at" | "updated_at", ExtArgs["result"]["userPriceList"]>
  export type userPriceListInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
    user?: boolean | userDefaultArgs<ExtArgs>
  }
  export type userPriceListIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
    user?: boolean | userDefaultArgs<ExtArgs>
  }
  export type userPriceListIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    priceList?: boolean | priceListDefaultArgs<ExtArgs>
    user?: boolean | userDefaultArgs<ExtArgs>
  }

  export type $userPriceListPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "userPriceList"
    objects: {
      priceList: Prisma.$priceListPayload<ExtArgs>
      user: Prisma.$userPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      user_price_list_id: string
      user_id: string
      price_list_id: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["userPriceList"]>
    composites: {}
  }

  type userPriceListGetPayload<S extends boolean | null | undefined | userPriceListDefaultArgs> = $Result.GetResult<Prisma.$userPriceListPayload, S>

  type userPriceListCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<userPriceListFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserPriceListCountAggregateInputType | true
    }

  export interface userPriceListDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['userPriceList'], meta: { name: 'userPriceList' } }
    /**
     * Find zero or one UserPriceList that matches the filter.
     * @param {userPriceListFindUniqueArgs} args - Arguments to find a UserPriceList
     * @example
     * // Get one UserPriceList
     * const userPriceList = await prisma.userPriceList.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends userPriceListFindUniqueArgs>(args: SelectSubset<T, userPriceListFindUniqueArgs<ExtArgs>>): Prisma__userPriceListClient<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserPriceList that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {userPriceListFindUniqueOrThrowArgs} args - Arguments to find a UserPriceList
     * @example
     * // Get one UserPriceList
     * const userPriceList = await prisma.userPriceList.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends userPriceListFindUniqueOrThrowArgs>(args: SelectSubset<T, userPriceListFindUniqueOrThrowArgs<ExtArgs>>): Prisma__userPriceListClient<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPriceList that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userPriceListFindFirstArgs} args - Arguments to find a UserPriceList
     * @example
     * // Get one UserPriceList
     * const userPriceList = await prisma.userPriceList.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends userPriceListFindFirstArgs>(args?: SelectSubset<T, userPriceListFindFirstArgs<ExtArgs>>): Prisma__userPriceListClient<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPriceList that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userPriceListFindFirstOrThrowArgs} args - Arguments to find a UserPriceList
     * @example
     * // Get one UserPriceList
     * const userPriceList = await prisma.userPriceList.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends userPriceListFindFirstOrThrowArgs>(args?: SelectSubset<T, userPriceListFindFirstOrThrowArgs<ExtArgs>>): Prisma__userPriceListClient<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserPriceLists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userPriceListFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserPriceLists
     * const userPriceLists = await prisma.userPriceList.findMany()
     * 
     * // Get first 10 UserPriceLists
     * const userPriceLists = await prisma.userPriceList.findMany({ take: 10 })
     * 
     * // Only select the `user_price_list_id`
     * const userPriceListWithUser_price_list_idOnly = await prisma.userPriceList.findMany({ select: { user_price_list_id: true } })
     * 
     */
    findMany<T extends userPriceListFindManyArgs>(args?: SelectSubset<T, userPriceListFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserPriceList.
     * @param {userPriceListCreateArgs} args - Arguments to create a UserPriceList.
     * @example
     * // Create one UserPriceList
     * const UserPriceList = await prisma.userPriceList.create({
     *   data: {
     *     // ... data to create a UserPriceList
     *   }
     * })
     * 
     */
    create<T extends userPriceListCreateArgs>(args: SelectSubset<T, userPriceListCreateArgs<ExtArgs>>): Prisma__userPriceListClient<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserPriceLists.
     * @param {userPriceListCreateManyArgs} args - Arguments to create many UserPriceLists.
     * @example
     * // Create many UserPriceLists
     * const userPriceList = await prisma.userPriceList.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends userPriceListCreateManyArgs>(args?: SelectSubset<T, userPriceListCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserPriceLists and returns the data saved in the database.
     * @param {userPriceListCreateManyAndReturnArgs} args - Arguments to create many UserPriceLists.
     * @example
     * // Create many UserPriceLists
     * const userPriceList = await prisma.userPriceList.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserPriceLists and only return the `user_price_list_id`
     * const userPriceListWithUser_price_list_idOnly = await prisma.userPriceList.createManyAndReturn({
     *   select: { user_price_list_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends userPriceListCreateManyAndReturnArgs>(args?: SelectSubset<T, userPriceListCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserPriceList.
     * @param {userPriceListDeleteArgs} args - Arguments to delete one UserPriceList.
     * @example
     * // Delete one UserPriceList
     * const UserPriceList = await prisma.userPriceList.delete({
     *   where: {
     *     // ... filter to delete one UserPriceList
     *   }
     * })
     * 
     */
    delete<T extends userPriceListDeleteArgs>(args: SelectSubset<T, userPriceListDeleteArgs<ExtArgs>>): Prisma__userPriceListClient<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserPriceList.
     * @param {userPriceListUpdateArgs} args - Arguments to update one UserPriceList.
     * @example
     * // Update one UserPriceList
     * const userPriceList = await prisma.userPriceList.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends userPriceListUpdateArgs>(args: SelectSubset<T, userPriceListUpdateArgs<ExtArgs>>): Prisma__userPriceListClient<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserPriceLists.
     * @param {userPriceListDeleteManyArgs} args - Arguments to filter UserPriceLists to delete.
     * @example
     * // Delete a few UserPriceLists
     * const { count } = await prisma.userPriceList.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends userPriceListDeleteManyArgs>(args?: SelectSubset<T, userPriceListDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPriceLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userPriceListUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserPriceLists
     * const userPriceList = await prisma.userPriceList.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends userPriceListUpdateManyArgs>(args: SelectSubset<T, userPriceListUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPriceLists and returns the data updated in the database.
     * @param {userPriceListUpdateManyAndReturnArgs} args - Arguments to update many UserPriceLists.
     * @example
     * // Update many UserPriceLists
     * const userPriceList = await prisma.userPriceList.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserPriceLists and only return the `user_price_list_id`
     * const userPriceListWithUser_price_list_idOnly = await prisma.userPriceList.updateManyAndReturn({
     *   select: { user_price_list_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends userPriceListUpdateManyAndReturnArgs>(args: SelectSubset<T, userPriceListUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserPriceList.
     * @param {userPriceListUpsertArgs} args - Arguments to update or create a UserPriceList.
     * @example
     * // Update or create a UserPriceList
     * const userPriceList = await prisma.userPriceList.upsert({
     *   create: {
     *     // ... data to create a UserPriceList
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserPriceList we want to update
     *   }
     * })
     */
    upsert<T extends userPriceListUpsertArgs>(args: SelectSubset<T, userPriceListUpsertArgs<ExtArgs>>): Prisma__userPriceListClient<$Result.GetResult<Prisma.$userPriceListPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserPriceLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userPriceListCountArgs} args - Arguments to filter UserPriceLists to count.
     * @example
     * // Count the number of UserPriceLists
     * const count = await prisma.userPriceList.count({
     *   where: {
     *     // ... the filter for the UserPriceLists we want to count
     *   }
     * })
    **/
    count<T extends userPriceListCountArgs>(
      args?: Subset<T, userPriceListCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserPriceListCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserPriceList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPriceListAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserPriceListAggregateArgs>(args: Subset<T, UserPriceListAggregateArgs>): Prisma.PrismaPromise<GetUserPriceListAggregateType<T>>

    /**
     * Group by UserPriceList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userPriceListGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends userPriceListGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: userPriceListGroupByArgs['orderBy'] }
        : { orderBy?: userPriceListGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, userPriceListGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserPriceListGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the userPriceList model
   */
  readonly fields: userPriceListFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for userPriceList.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__userPriceListClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    priceList<T extends priceListDefaultArgs<ExtArgs> = {}>(args?: Subset<T, priceListDefaultArgs<ExtArgs>>): Prisma__priceListClient<$Result.GetResult<Prisma.$priceListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends userDefaultArgs<ExtArgs> = {}>(args?: Subset<T, userDefaultArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the userPriceList model
   */
  interface userPriceListFieldRefs {
    readonly user_price_list_id: FieldRef<"userPriceList", 'String'>
    readonly user_id: FieldRef<"userPriceList", 'String'>
    readonly price_list_id: FieldRef<"userPriceList", 'String'>
    readonly created_at: FieldRef<"userPriceList", 'DateTime'>
    readonly updated_at: FieldRef<"userPriceList", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * userPriceList findUnique
   */
  export type userPriceListFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * Filter, which userPriceList to fetch.
     */
    where: userPriceListWhereUniqueInput
  }

  /**
   * userPriceList findUniqueOrThrow
   */
  export type userPriceListFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * Filter, which userPriceList to fetch.
     */
    where: userPriceListWhereUniqueInput
  }

  /**
   * userPriceList findFirst
   */
  export type userPriceListFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * Filter, which userPriceList to fetch.
     */
    where?: userPriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of userPriceLists to fetch.
     */
    orderBy?: userPriceListOrderByWithRelationInput | userPriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for userPriceLists.
     */
    cursor?: userPriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` userPriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` userPriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of userPriceLists.
     */
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * userPriceList findFirstOrThrow
   */
  export type userPriceListFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * Filter, which userPriceList to fetch.
     */
    where?: userPriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of userPriceLists to fetch.
     */
    orderBy?: userPriceListOrderByWithRelationInput | userPriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for userPriceLists.
     */
    cursor?: userPriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` userPriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` userPriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of userPriceLists.
     */
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * userPriceList findMany
   */
  export type userPriceListFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * Filter, which userPriceLists to fetch.
     */
    where?: userPriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of userPriceLists to fetch.
     */
    orderBy?: userPriceListOrderByWithRelationInput | userPriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing userPriceLists.
     */
    cursor?: userPriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` userPriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` userPriceLists.
     */
    skip?: number
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * userPriceList create
   */
  export type userPriceListCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * The data needed to create a userPriceList.
     */
    data: XOR<userPriceListCreateInput, userPriceListUncheckedCreateInput>
  }

  /**
   * userPriceList createMany
   */
  export type userPriceListCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many userPriceLists.
     */
    data: userPriceListCreateManyInput | userPriceListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * userPriceList createManyAndReturn
   */
  export type userPriceListCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * The data used to create many userPriceLists.
     */
    data: userPriceListCreateManyInput | userPriceListCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * userPriceList update
   */
  export type userPriceListUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * The data needed to update a userPriceList.
     */
    data: XOR<userPriceListUpdateInput, userPriceListUncheckedUpdateInput>
    /**
     * Choose, which userPriceList to update.
     */
    where: userPriceListWhereUniqueInput
  }

  /**
   * userPriceList updateMany
   */
  export type userPriceListUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update userPriceLists.
     */
    data: XOR<userPriceListUpdateManyMutationInput, userPriceListUncheckedUpdateManyInput>
    /**
     * Filter which userPriceLists to update
     */
    where?: userPriceListWhereInput
    /**
     * Limit how many userPriceLists to update.
     */
    limit?: number
  }

  /**
   * userPriceList updateManyAndReturn
   */
  export type userPriceListUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * The data used to update userPriceLists.
     */
    data: XOR<userPriceListUpdateManyMutationInput, userPriceListUncheckedUpdateManyInput>
    /**
     * Filter which userPriceLists to update
     */
    where?: userPriceListWhereInput
    /**
     * Limit how many userPriceLists to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * userPriceList upsert
   */
  export type userPriceListUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * The filter to search for the userPriceList to update in case it exists.
     */
    where: userPriceListWhereUniqueInput
    /**
     * In case the userPriceList found by the `where` argument doesn't exist, create a new userPriceList with this data.
     */
    create: XOR<userPriceListCreateInput, userPriceListUncheckedCreateInput>
    /**
     * In case the userPriceList was found with the provided `where` argument, update it with this data.
     */
    update: XOR<userPriceListUpdateInput, userPriceListUncheckedUpdateInput>
  }

  /**
   * userPriceList delete
   */
  export type userPriceListDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
    /**
     * Filter which userPriceList to delete.
     */
    where: userPriceListWhereUniqueInput
  }

  /**
   * userPriceList deleteMany
   */
  export type userPriceListDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which userPriceLists to delete
     */
    where?: userPriceListWhereInput
    /**
     * Limit how many userPriceLists to delete.
     */
    limit?: number
  }

  /**
   * userPriceList without action
   */
  export type userPriceListDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the userPriceList
     */
    select?: userPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the userPriceList
     */
    omit?: userPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userPriceListInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserTypeScalarFieldEnum: {
    id: 'id',
    name: 'name'
  };

  export type UserTypeScalarFieldEnum = (typeof UserTypeScalarFieldEnum)[keyof typeof UserTypeScalarFieldEnum]


  export const UserScalarFieldEnum: {
    email: 'email',
    name: 'name',
    createdAt: 'createdAt',
    credit: 'credit',
    debit: 'debit',
    isActive: 'isActive',
    password: 'password',
    phoneNumber: 'phoneNumber',
    surname: 'surname',
    userId: 'userId',
    username: 'username',
    userTypeId: 'userTypeId'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CollectionScalarFieldEnum: {
    collectionId: 'collectionId',
    name: 'name',
    description: 'description',
    code: 'code',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CollectionScalarFieldEnum = (typeof CollectionScalarFieldEnum)[keyof typeof CollectionScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    productId: 'productId',
    name: 'name',
    description: 'description',
    stock: 'stock',
    width: 'width',
    height: 'height',
    cut: 'cut',
    productImage: 'productImage',
    collectionId: 'collectionId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    collection_name: 'collection_name'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const PriceListScalarFieldEnum: {
    price_list_id: 'price_list_id',
    name: 'name',
    description: 'description',
    is_default: 'is_default',
    valid_from: 'valid_from',
    valid_to: 'valid_to',
    limit_amount: 'limit_amount',
    currency: 'currency',
    is_active: 'is_active',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type PriceListScalarFieldEnum = (typeof PriceListScalarFieldEnum)[keyof typeof PriceListScalarFieldEnum]


  export const PriceListDetailScalarFieldEnum: {
    price_list_detail_id: 'price_list_detail_id',
    price_list_id: 'price_list_id',
    collection_id: 'collection_id',
    price_per_square_meter: 'price_per_square_meter',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type PriceListDetailScalarFieldEnum = (typeof PriceListDetailScalarFieldEnum)[keyof typeof PriceListDetailScalarFieldEnum]


  export const UserPriceListScalarFieldEnum: {
    user_price_list_id: 'user_price_list_id',
    user_id: 'user_id',
    price_list_id: 'price_list_id',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserPriceListScalarFieldEnum = (typeof UserPriceListScalarFieldEnum)[keyof typeof UserPriceListScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type userTypeWhereInput = {
    AND?: userTypeWhereInput | userTypeWhereInput[]
    OR?: userTypeWhereInput[]
    NOT?: userTypeWhereInput | userTypeWhereInput[]
    id?: IntFilter<"userType"> | number
    name?: StringFilter<"userType"> | string
    users?: UserListRelationFilter
  }

  export type userTypeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    users?: userOrderByRelationAggregateInput
  }

  export type userTypeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: userTypeWhereInput | userTypeWhereInput[]
    OR?: userTypeWhereInput[]
    NOT?: userTypeWhereInput | userTypeWhereInput[]
    users?: UserListRelationFilter
  }, "id" | "name">

  export type userTypeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    _count?: userTypeCountOrderByAggregateInput
    _avg?: userTypeAvgOrderByAggregateInput
    _max?: userTypeMaxOrderByAggregateInput
    _min?: userTypeMinOrderByAggregateInput
    _sum?: userTypeSumOrderByAggregateInput
  }

  export type userTypeScalarWhereWithAggregatesInput = {
    AND?: userTypeScalarWhereWithAggregatesInput | userTypeScalarWhereWithAggregatesInput[]
    OR?: userTypeScalarWhereWithAggregatesInput[]
    NOT?: userTypeScalarWhereWithAggregatesInput | userTypeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"userType"> | number
    name?: StringWithAggregatesFilter<"userType"> | string
  }

  export type userWhereInput = {
    AND?: userWhereInput | userWhereInput[]
    OR?: userWhereInput[]
    NOT?: userWhereInput | userWhereInput[]
    email?: StringFilter<"user"> | string
    name?: StringFilter<"user"> | string
    createdAt?: DateTimeFilter<"user"> | Date | string
    credit?: DecimalFilter<"user"> | Decimal | DecimalJsLike | number | string
    debit?: DecimalFilter<"user"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolFilter<"user"> | boolean
    password?: StringFilter<"user"> | string
    phoneNumber?: StringNullableFilter<"user"> | string | null
    surname?: StringFilter<"user"> | string
    userId?: StringFilter<"user"> | string
    username?: StringFilter<"user"> | string
    userTypeId?: IntFilter<"user"> | number
    userType?: XOR<UserTypeScalarRelationFilter, userTypeWhereInput>
    userPriceList?: UserPriceListListRelationFilter
  }

  export type userOrderByWithRelationInput = {
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    credit?: SortOrder
    debit?: SortOrder
    isActive?: SortOrder
    password?: SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    surname?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    userTypeId?: SortOrder
    userType?: userTypeOrderByWithRelationInput
    userPriceList?: userPriceListOrderByRelationAggregateInput
  }

  export type userWhereUniqueInput = Prisma.AtLeast<{
    email?: string
    userId?: string
    username?: string
    AND?: userWhereInput | userWhereInput[]
    OR?: userWhereInput[]
    NOT?: userWhereInput | userWhereInput[]
    name?: StringFilter<"user"> | string
    createdAt?: DateTimeFilter<"user"> | Date | string
    credit?: DecimalFilter<"user"> | Decimal | DecimalJsLike | number | string
    debit?: DecimalFilter<"user"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolFilter<"user"> | boolean
    password?: StringFilter<"user"> | string
    phoneNumber?: StringNullableFilter<"user"> | string | null
    surname?: StringFilter<"user"> | string
    userTypeId?: IntFilter<"user"> | number
    userType?: XOR<UserTypeScalarRelationFilter, userTypeWhereInput>
    userPriceList?: UserPriceListListRelationFilter
  }, "userId" | "email" | "username">

  export type userOrderByWithAggregationInput = {
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    credit?: SortOrder
    debit?: SortOrder
    isActive?: SortOrder
    password?: SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    surname?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    userTypeId?: SortOrder
    _count?: userCountOrderByAggregateInput
    _avg?: userAvgOrderByAggregateInput
    _max?: userMaxOrderByAggregateInput
    _min?: userMinOrderByAggregateInput
    _sum?: userSumOrderByAggregateInput
  }

  export type userScalarWhereWithAggregatesInput = {
    AND?: userScalarWhereWithAggregatesInput | userScalarWhereWithAggregatesInput[]
    OR?: userScalarWhereWithAggregatesInput[]
    NOT?: userScalarWhereWithAggregatesInput | userScalarWhereWithAggregatesInput[]
    email?: StringWithAggregatesFilter<"user"> | string
    name?: StringWithAggregatesFilter<"user"> | string
    createdAt?: DateTimeWithAggregatesFilter<"user"> | Date | string
    credit?: DecimalWithAggregatesFilter<"user"> | Decimal | DecimalJsLike | number | string
    debit?: DecimalWithAggregatesFilter<"user"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolWithAggregatesFilter<"user"> | boolean
    password?: StringWithAggregatesFilter<"user"> | string
    phoneNumber?: StringNullableWithAggregatesFilter<"user"> | string | null
    surname?: StringWithAggregatesFilter<"user"> | string
    userId?: StringWithAggregatesFilter<"user"> | string
    username?: StringWithAggregatesFilter<"user"> | string
    userTypeId?: IntWithAggregatesFilter<"user"> | number
  }

  export type collectionWhereInput = {
    AND?: collectionWhereInput | collectionWhereInput[]
    OR?: collectionWhereInput[]
    NOT?: collectionWhereInput | collectionWhereInput[]
    collectionId?: StringFilter<"collection"> | string
    name?: StringFilter<"collection"> | string
    description?: StringNullableFilter<"collection"> | string | null
    code?: StringFilter<"collection"> | string
    isActive?: BoolFilter<"collection"> | boolean
    createdAt?: DateTimeFilter<"collection"> | Date | string
    updatedAt?: DateTimeFilter<"collection"> | Date | string
    priceListDetail?: PriceListDetailListRelationFilter
    products?: ProductListRelationFilter
  }

  export type collectionOrderByWithRelationInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    priceListDetail?: priceListDetailOrderByRelationAggregateInput
    products?: productOrderByRelationAggregateInput
  }

  export type collectionWhereUniqueInput = Prisma.AtLeast<{
    collectionId?: string
    code?: string
    AND?: collectionWhereInput | collectionWhereInput[]
    OR?: collectionWhereInput[]
    NOT?: collectionWhereInput | collectionWhereInput[]
    name?: StringFilter<"collection"> | string
    description?: StringNullableFilter<"collection"> | string | null
    isActive?: BoolFilter<"collection"> | boolean
    createdAt?: DateTimeFilter<"collection"> | Date | string
    updatedAt?: DateTimeFilter<"collection"> | Date | string
    priceListDetail?: PriceListDetailListRelationFilter
    products?: ProductListRelationFilter
  }, "collectionId" | "code">

  export type collectionOrderByWithAggregationInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: collectionCountOrderByAggregateInput
    _max?: collectionMaxOrderByAggregateInput
    _min?: collectionMinOrderByAggregateInput
  }

  export type collectionScalarWhereWithAggregatesInput = {
    AND?: collectionScalarWhereWithAggregatesInput | collectionScalarWhereWithAggregatesInput[]
    OR?: collectionScalarWhereWithAggregatesInput[]
    NOT?: collectionScalarWhereWithAggregatesInput | collectionScalarWhereWithAggregatesInput[]
    collectionId?: StringWithAggregatesFilter<"collection"> | string
    name?: StringWithAggregatesFilter<"collection"> | string
    description?: StringNullableWithAggregatesFilter<"collection"> | string | null
    code?: StringWithAggregatesFilter<"collection"> | string
    isActive?: BoolWithAggregatesFilter<"collection"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"collection"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"collection"> | Date | string
  }

  export type productWhereInput = {
    AND?: productWhereInput | productWhereInput[]
    OR?: productWhereInput[]
    NOT?: productWhereInput | productWhereInput[]
    productId?: StringFilter<"product"> | string
    name?: StringFilter<"product"> | string
    description?: StringFilter<"product"> | string
    stock?: IntFilter<"product"> | number
    width?: FloatFilter<"product"> | number
    height?: FloatFilter<"product"> | number
    cut?: BoolFilter<"product"> | boolean
    productImage?: StringNullableFilter<"product"> | string | null
    collectionId?: StringFilter<"product"> | string
    createdAt?: DateTimeFilter<"product"> | Date | string
    updatedAt?: DateTimeFilter<"product"> | Date | string
    collection_name?: StringNullableFilter<"product"> | string | null
    collection?: XOR<CollectionScalarRelationFilter, collectionWhereInput>
  }

  export type productOrderByWithRelationInput = {
    productId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    stock?: SortOrder
    width?: SortOrder
    height?: SortOrder
    cut?: SortOrder
    productImage?: SortOrderInput | SortOrder
    collectionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collection_name?: SortOrderInput | SortOrder
    collection?: collectionOrderByWithRelationInput
  }

  export type productWhereUniqueInput = Prisma.AtLeast<{
    productId?: string
    AND?: productWhereInput | productWhereInput[]
    OR?: productWhereInput[]
    NOT?: productWhereInput | productWhereInput[]
    name?: StringFilter<"product"> | string
    description?: StringFilter<"product"> | string
    stock?: IntFilter<"product"> | number
    width?: FloatFilter<"product"> | number
    height?: FloatFilter<"product"> | number
    cut?: BoolFilter<"product"> | boolean
    productImage?: StringNullableFilter<"product"> | string | null
    collectionId?: StringFilter<"product"> | string
    createdAt?: DateTimeFilter<"product"> | Date | string
    updatedAt?: DateTimeFilter<"product"> | Date | string
    collection_name?: StringNullableFilter<"product"> | string | null
    collection?: XOR<CollectionScalarRelationFilter, collectionWhereInput>
  }, "productId">

  export type productOrderByWithAggregationInput = {
    productId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    stock?: SortOrder
    width?: SortOrder
    height?: SortOrder
    cut?: SortOrder
    productImage?: SortOrderInput | SortOrder
    collectionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collection_name?: SortOrderInput | SortOrder
    _count?: productCountOrderByAggregateInput
    _avg?: productAvgOrderByAggregateInput
    _max?: productMaxOrderByAggregateInput
    _min?: productMinOrderByAggregateInput
    _sum?: productSumOrderByAggregateInput
  }

  export type productScalarWhereWithAggregatesInput = {
    AND?: productScalarWhereWithAggregatesInput | productScalarWhereWithAggregatesInput[]
    OR?: productScalarWhereWithAggregatesInput[]
    NOT?: productScalarWhereWithAggregatesInput | productScalarWhereWithAggregatesInput[]
    productId?: StringWithAggregatesFilter<"product"> | string
    name?: StringWithAggregatesFilter<"product"> | string
    description?: StringWithAggregatesFilter<"product"> | string
    stock?: IntWithAggregatesFilter<"product"> | number
    width?: FloatWithAggregatesFilter<"product"> | number
    height?: FloatWithAggregatesFilter<"product"> | number
    cut?: BoolWithAggregatesFilter<"product"> | boolean
    productImage?: StringNullableWithAggregatesFilter<"product"> | string | null
    collectionId?: StringWithAggregatesFilter<"product"> | string
    createdAt?: DateTimeWithAggregatesFilter<"product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"product"> | Date | string
    collection_name?: StringNullableWithAggregatesFilter<"product"> | string | null
  }

  export type priceListWhereInput = {
    AND?: priceListWhereInput | priceListWhereInput[]
    OR?: priceListWhereInput[]
    NOT?: priceListWhereInput | priceListWhereInput[]
    price_list_id?: StringFilter<"priceList"> | string
    name?: StringFilter<"priceList"> | string
    description?: StringNullableFilter<"priceList"> | string | null
    is_default?: BoolFilter<"priceList"> | boolean
    valid_from?: DateTimeNullableFilter<"priceList"> | Date | string | null
    valid_to?: DateTimeNullableFilter<"priceList"> | Date | string | null
    limit_amount?: DecimalNullableFilter<"priceList"> | Decimal | DecimalJsLike | number | string | null
    currency?: StringFilter<"priceList"> | string
    is_active?: BoolFilter<"priceList"> | boolean
    created_at?: DateTimeFilter<"priceList"> | Date | string
    updated_at?: DateTimeFilter<"priceList"> | Date | string
    priceListDetail?: PriceListDetailListRelationFilter
    userPriceList?: UserPriceListListRelationFilter
  }

  export type priceListOrderByWithRelationInput = {
    price_list_id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    is_default?: SortOrder
    valid_from?: SortOrderInput | SortOrder
    valid_to?: SortOrderInput | SortOrder
    limit_amount?: SortOrderInput | SortOrder
    currency?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    priceListDetail?: priceListDetailOrderByRelationAggregateInput
    userPriceList?: userPriceListOrderByRelationAggregateInput
  }

  export type priceListWhereUniqueInput = Prisma.AtLeast<{
    price_list_id?: string
    AND?: priceListWhereInput | priceListWhereInput[]
    OR?: priceListWhereInput[]
    NOT?: priceListWhereInput | priceListWhereInput[]
    name?: StringFilter<"priceList"> | string
    description?: StringNullableFilter<"priceList"> | string | null
    is_default?: BoolFilter<"priceList"> | boolean
    valid_from?: DateTimeNullableFilter<"priceList"> | Date | string | null
    valid_to?: DateTimeNullableFilter<"priceList"> | Date | string | null
    limit_amount?: DecimalNullableFilter<"priceList"> | Decimal | DecimalJsLike | number | string | null
    currency?: StringFilter<"priceList"> | string
    is_active?: BoolFilter<"priceList"> | boolean
    created_at?: DateTimeFilter<"priceList"> | Date | string
    updated_at?: DateTimeFilter<"priceList"> | Date | string
    priceListDetail?: PriceListDetailListRelationFilter
    userPriceList?: UserPriceListListRelationFilter
  }, "price_list_id">

  export type priceListOrderByWithAggregationInput = {
    price_list_id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    is_default?: SortOrder
    valid_from?: SortOrderInput | SortOrder
    valid_to?: SortOrderInput | SortOrder
    limit_amount?: SortOrderInput | SortOrder
    currency?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: priceListCountOrderByAggregateInput
    _avg?: priceListAvgOrderByAggregateInput
    _max?: priceListMaxOrderByAggregateInput
    _min?: priceListMinOrderByAggregateInput
    _sum?: priceListSumOrderByAggregateInput
  }

  export type priceListScalarWhereWithAggregatesInput = {
    AND?: priceListScalarWhereWithAggregatesInput | priceListScalarWhereWithAggregatesInput[]
    OR?: priceListScalarWhereWithAggregatesInput[]
    NOT?: priceListScalarWhereWithAggregatesInput | priceListScalarWhereWithAggregatesInput[]
    price_list_id?: StringWithAggregatesFilter<"priceList"> | string
    name?: StringWithAggregatesFilter<"priceList"> | string
    description?: StringNullableWithAggregatesFilter<"priceList"> | string | null
    is_default?: BoolWithAggregatesFilter<"priceList"> | boolean
    valid_from?: DateTimeNullableWithAggregatesFilter<"priceList"> | Date | string | null
    valid_to?: DateTimeNullableWithAggregatesFilter<"priceList"> | Date | string | null
    limit_amount?: DecimalNullableWithAggregatesFilter<"priceList"> | Decimal | DecimalJsLike | number | string | null
    currency?: StringWithAggregatesFilter<"priceList"> | string
    is_active?: BoolWithAggregatesFilter<"priceList"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"priceList"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"priceList"> | Date | string
  }

  export type priceListDetailWhereInput = {
    AND?: priceListDetailWhereInput | priceListDetailWhereInput[]
    OR?: priceListDetailWhereInput[]
    NOT?: priceListDetailWhereInput | priceListDetailWhereInput[]
    price_list_detail_id?: StringFilter<"priceListDetail"> | string
    price_list_id?: StringFilter<"priceListDetail"> | string
    collection_id?: StringFilter<"priceListDetail"> | string
    price_per_square_meter?: DecimalFilter<"priceListDetail"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"priceListDetail"> | Date | string
    updated_at?: DateTimeFilter<"priceListDetail"> | Date | string
    collection?: XOR<CollectionScalarRelationFilter, collectionWhereInput>
    priceList?: XOR<PriceListScalarRelationFilter, priceListWhereInput>
  }

  export type priceListDetailOrderByWithRelationInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    collection?: collectionOrderByWithRelationInput
    priceList?: priceListOrderByWithRelationInput
  }

  export type priceListDetailWhereUniqueInput = Prisma.AtLeast<{
    price_list_detail_id?: string
    AND?: priceListDetailWhereInput | priceListDetailWhereInput[]
    OR?: priceListDetailWhereInput[]
    NOT?: priceListDetailWhereInput | priceListDetailWhereInput[]
    price_list_id?: StringFilter<"priceListDetail"> | string
    collection_id?: StringFilter<"priceListDetail"> | string
    price_per_square_meter?: DecimalFilter<"priceListDetail"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"priceListDetail"> | Date | string
    updated_at?: DateTimeFilter<"priceListDetail"> | Date | string
    collection?: XOR<CollectionScalarRelationFilter, collectionWhereInput>
    priceList?: XOR<PriceListScalarRelationFilter, priceListWhereInput>
  }, "price_list_detail_id">

  export type priceListDetailOrderByWithAggregationInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: priceListDetailCountOrderByAggregateInput
    _avg?: priceListDetailAvgOrderByAggregateInput
    _max?: priceListDetailMaxOrderByAggregateInput
    _min?: priceListDetailMinOrderByAggregateInput
    _sum?: priceListDetailSumOrderByAggregateInput
  }

  export type priceListDetailScalarWhereWithAggregatesInput = {
    AND?: priceListDetailScalarWhereWithAggregatesInput | priceListDetailScalarWhereWithAggregatesInput[]
    OR?: priceListDetailScalarWhereWithAggregatesInput[]
    NOT?: priceListDetailScalarWhereWithAggregatesInput | priceListDetailScalarWhereWithAggregatesInput[]
    price_list_detail_id?: StringWithAggregatesFilter<"priceListDetail"> | string
    price_list_id?: StringWithAggregatesFilter<"priceListDetail"> | string
    collection_id?: StringWithAggregatesFilter<"priceListDetail"> | string
    price_per_square_meter?: DecimalWithAggregatesFilter<"priceListDetail"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"priceListDetail"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"priceListDetail"> | Date | string
  }

  export type userPriceListWhereInput = {
    AND?: userPriceListWhereInput | userPriceListWhereInput[]
    OR?: userPriceListWhereInput[]
    NOT?: userPriceListWhereInput | userPriceListWhereInput[]
    user_price_list_id?: StringFilter<"userPriceList"> | string
    user_id?: StringFilter<"userPriceList"> | string
    price_list_id?: StringFilter<"userPriceList"> | string
    created_at?: DateTimeFilter<"userPriceList"> | Date | string
    updated_at?: DateTimeFilter<"userPriceList"> | Date | string
    priceList?: XOR<PriceListScalarRelationFilter, priceListWhereInput>
    user?: XOR<UserScalarRelationFilter, userWhereInput>
  }

  export type userPriceListOrderByWithRelationInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    priceList?: priceListOrderByWithRelationInput
    user?: userOrderByWithRelationInput
  }

  export type userPriceListWhereUniqueInput = Prisma.AtLeast<{
    user_price_list_id?: string
    AND?: userPriceListWhereInput | userPriceListWhereInput[]
    OR?: userPriceListWhereInput[]
    NOT?: userPriceListWhereInput | userPriceListWhereInput[]
    user_id?: StringFilter<"userPriceList"> | string
    price_list_id?: StringFilter<"userPriceList"> | string
    created_at?: DateTimeFilter<"userPriceList"> | Date | string
    updated_at?: DateTimeFilter<"userPriceList"> | Date | string
    priceList?: XOR<PriceListScalarRelationFilter, priceListWhereInput>
    user?: XOR<UserScalarRelationFilter, userWhereInput>
  }, "user_price_list_id">

  export type userPriceListOrderByWithAggregationInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: userPriceListCountOrderByAggregateInput
    _max?: userPriceListMaxOrderByAggregateInput
    _min?: userPriceListMinOrderByAggregateInput
  }

  export type userPriceListScalarWhereWithAggregatesInput = {
    AND?: userPriceListScalarWhereWithAggregatesInput | userPriceListScalarWhereWithAggregatesInput[]
    OR?: userPriceListScalarWhereWithAggregatesInput[]
    NOT?: userPriceListScalarWhereWithAggregatesInput | userPriceListScalarWhereWithAggregatesInput[]
    user_price_list_id?: StringWithAggregatesFilter<"userPriceList"> | string
    user_id?: StringWithAggregatesFilter<"userPriceList"> | string
    price_list_id?: StringWithAggregatesFilter<"userPriceList"> | string
    created_at?: DateTimeWithAggregatesFilter<"userPriceList"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"userPriceList"> | Date | string
  }

  export type userTypeCreateInput = {
    name: string
    users?: userCreateNestedManyWithoutUserTypeInput
  }

  export type userTypeUncheckedCreateInput = {
    id?: number
    name: string
    users?: userUncheckedCreateNestedManyWithoutUserTypeInput
  }

  export type userTypeUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    users?: userUpdateManyWithoutUserTypeNestedInput
  }

  export type userTypeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    users?: userUncheckedUpdateManyWithoutUserTypeNestedInput
  }

  export type userTypeCreateManyInput = {
    id?: number
    name: string
  }

  export type userTypeUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type userTypeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type userCreateInput = {
    email: string
    name: string
    createdAt?: Date | string
    credit?: Decimal | DecimalJsLike | number | string
    debit?: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    password: string
    phoneNumber?: string | null
    surname: string
    userId?: string
    username: string
    userType: userTypeCreateNestedOneWithoutUsersInput
    userPriceList?: userPriceListCreateNestedManyWithoutUserInput
  }

  export type userUncheckedCreateInput = {
    email: string
    name: string
    createdAt?: Date | string
    credit?: Decimal | DecimalJsLike | number | string
    debit?: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    password: string
    phoneNumber?: string | null
    surname: string
    userId?: string
    username: string
    userTypeId: number
    userPriceList?: userPriceListUncheckedCreateNestedManyWithoutUserInput
  }

  export type userUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    userType?: userTypeUpdateOneRequiredWithoutUsersNestedInput
    userPriceList?: userPriceListUpdateManyWithoutUserNestedInput
  }

  export type userUncheckedUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    userTypeId?: IntFieldUpdateOperationsInput | number
    userPriceList?: userPriceListUncheckedUpdateManyWithoutUserNestedInput
  }

  export type userCreateManyInput = {
    email: string
    name: string
    createdAt?: Date | string
    credit?: Decimal | DecimalJsLike | number | string
    debit?: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    password: string
    phoneNumber?: string | null
    surname: string
    userId?: string
    username: string
    userTypeId: number
  }

  export type userUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
  }

  export type userUncheckedUpdateManyInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    userTypeId?: IntFieldUpdateOperationsInput | number
  }

  export type collectionCreateInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    priceListDetail?: priceListDetailCreateNestedManyWithoutCollectionInput
    products?: productCreateNestedManyWithoutCollectionInput
  }

  export type collectionUncheckedCreateInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    priceListDetail?: priceListDetailUncheckedCreateNestedManyWithoutCollectionInput
    products?: productUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type collectionUpdateInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    priceListDetail?: priceListDetailUpdateManyWithoutCollectionNestedInput
    products?: productUpdateManyWithoutCollectionNestedInput
  }

  export type collectionUncheckedUpdateInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    priceListDetail?: priceListDetailUncheckedUpdateManyWithoutCollectionNestedInput
    products?: productUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type collectionCreateManyInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type collectionUpdateManyMutationInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type collectionUncheckedUpdateManyInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type productCreateInput = {
    productId?: string
    name: string
    description: string
    stock: number
    width: number
    height: number
    cut: boolean
    productImage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    collection_name?: string | null
    collection: collectionCreateNestedOneWithoutProductsInput
  }

  export type productUncheckedCreateInput = {
    productId?: string
    name: string
    description: string
    stock: number
    width: number
    height: number
    cut: boolean
    productImage?: string | null
    collectionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    collection_name?: string | null
  }

  export type productUpdateInput = {
    productId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    stock?: IntFieldUpdateOperationsInput | number
    width?: FloatFieldUpdateOperationsInput | number
    height?: FloatFieldUpdateOperationsInput | number
    cut?: BoolFieldUpdateOperationsInput | boolean
    productImage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection_name?: NullableStringFieldUpdateOperationsInput | string | null
    collection?: collectionUpdateOneRequiredWithoutProductsNestedInput
  }

  export type productUncheckedUpdateInput = {
    productId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    stock?: IntFieldUpdateOperationsInput | number
    width?: FloatFieldUpdateOperationsInput | number
    height?: FloatFieldUpdateOperationsInput | number
    cut?: BoolFieldUpdateOperationsInput | boolean
    productImage?: NullableStringFieldUpdateOperationsInput | string | null
    collectionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection_name?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type productCreateManyInput = {
    productId?: string
    name: string
    description: string
    stock: number
    width: number
    height: number
    cut: boolean
    productImage?: string | null
    collectionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    collection_name?: string | null
  }

  export type productUpdateManyMutationInput = {
    productId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    stock?: IntFieldUpdateOperationsInput | number
    width?: FloatFieldUpdateOperationsInput | number
    height?: FloatFieldUpdateOperationsInput | number
    cut?: BoolFieldUpdateOperationsInput | boolean
    productImage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection_name?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type productUncheckedUpdateManyInput = {
    productId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    stock?: IntFieldUpdateOperationsInput | number
    width?: FloatFieldUpdateOperationsInput | number
    height?: FloatFieldUpdateOperationsInput | number
    cut?: BoolFieldUpdateOperationsInput | boolean
    productImage?: NullableStringFieldUpdateOperationsInput | string | null
    collectionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection_name?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type priceListCreateInput = {
    price_list_id?: string
    name: string
    description?: string | null
    is_default?: boolean
    valid_from?: Date | string | null
    valid_to?: Date | string | null
    limit_amount?: Decimal | DecimalJsLike | number | string | null
    currency: string
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    priceListDetail?: priceListDetailCreateNestedManyWithoutPriceListInput
    userPriceList?: userPriceListCreateNestedManyWithoutPriceListInput
  }

  export type priceListUncheckedCreateInput = {
    price_list_id?: string
    name: string
    description?: string | null
    is_default?: boolean
    valid_from?: Date | string | null
    valid_to?: Date | string | null
    limit_amount?: Decimal | DecimalJsLike | number | string | null
    currency: string
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    priceListDetail?: priceListDetailUncheckedCreateNestedManyWithoutPriceListInput
    userPriceList?: userPriceListUncheckedCreateNestedManyWithoutPriceListInput
  }

  export type priceListUpdateInput = {
    price_list_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    is_default?: BoolFieldUpdateOperationsInput | boolean
    valid_from?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    valid_to?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    limit_amount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    currency?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    priceListDetail?: priceListDetailUpdateManyWithoutPriceListNestedInput
    userPriceList?: userPriceListUpdateManyWithoutPriceListNestedInput
  }

  export type priceListUncheckedUpdateInput = {
    price_list_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    is_default?: BoolFieldUpdateOperationsInput | boolean
    valid_from?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    valid_to?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    limit_amount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    currency?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    priceListDetail?: priceListDetailUncheckedUpdateManyWithoutPriceListNestedInput
    userPriceList?: userPriceListUncheckedUpdateManyWithoutPriceListNestedInput
  }

  export type priceListCreateManyInput = {
    price_list_id?: string
    name: string
    description?: string | null
    is_default?: boolean
    valid_from?: Date | string | null
    valid_to?: Date | string | null
    limit_amount?: Decimal | DecimalJsLike | number | string | null
    currency: string
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type priceListUpdateManyMutationInput = {
    price_list_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    is_default?: BoolFieldUpdateOperationsInput | boolean
    valid_from?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    valid_to?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    limit_amount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    currency?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type priceListUncheckedUpdateManyInput = {
    price_list_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    is_default?: BoolFieldUpdateOperationsInput | boolean
    valid_from?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    valid_to?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    limit_amount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    currency?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type priceListDetailCreateInput = {
    price_list_detail_id?: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    collection: collectionCreateNestedOneWithoutPriceListDetailInput
    priceList: priceListCreateNestedOneWithoutPriceListDetailInput
  }

  export type priceListDetailUncheckedCreateInput = {
    price_list_detail_id?: string
    price_list_id: string
    collection_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type priceListDetailUpdateInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    collection?: collectionUpdateOneRequiredWithoutPriceListDetailNestedInput
    priceList?: priceListUpdateOneRequiredWithoutPriceListDetailNestedInput
  }

  export type priceListDetailUncheckedUpdateInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    collection_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type priceListDetailCreateManyInput = {
    price_list_detail_id?: string
    price_list_id: string
    collection_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type priceListDetailUpdateManyMutationInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type priceListDetailUncheckedUpdateManyInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    collection_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type userPriceListCreateInput = {
    user_price_list_id?: string
    created_at?: Date | string
    updated_at?: Date | string
    priceList: priceListCreateNestedOneWithoutUserPriceListInput
    user: userCreateNestedOneWithoutUserPriceListInput
  }

  export type userPriceListUncheckedCreateInput = {
    user_price_list_id?: string
    user_id: string
    price_list_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type userPriceListUpdateInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    priceList?: priceListUpdateOneRequiredWithoutUserPriceListNestedInput
    user?: userUpdateOneRequiredWithoutUserPriceListNestedInput
  }

  export type userPriceListUncheckedUpdateInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type userPriceListCreateManyInput = {
    user_price_list_id?: string
    user_id: string
    price_list_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type userPriceListUpdateManyMutationInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type userPriceListUncheckedUpdateManyInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type UserListRelationFilter = {
    every?: userWhereInput
    some?: userWhereInput
    none?: userWhereInput
  }

  export type userOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type userTypeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type userTypeAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type userTypeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type userTypeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type userTypeSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type UserTypeScalarRelationFilter = {
    is?: userTypeWhereInput
    isNot?: userTypeWhereInput
  }

  export type UserPriceListListRelationFilter = {
    every?: userPriceListWhereInput
    some?: userPriceListWhereInput
    none?: userPriceListWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type userPriceListOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type userCountOrderByAggregateInput = {
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    credit?: SortOrder
    debit?: SortOrder
    isActive?: SortOrder
    password?: SortOrder
    phoneNumber?: SortOrder
    surname?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    userTypeId?: SortOrder
  }

  export type userAvgOrderByAggregateInput = {
    credit?: SortOrder
    debit?: SortOrder
    userTypeId?: SortOrder
  }

  export type userMaxOrderByAggregateInput = {
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    credit?: SortOrder
    debit?: SortOrder
    isActive?: SortOrder
    password?: SortOrder
    phoneNumber?: SortOrder
    surname?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    userTypeId?: SortOrder
  }

  export type userMinOrderByAggregateInput = {
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    credit?: SortOrder
    debit?: SortOrder
    isActive?: SortOrder
    password?: SortOrder
    phoneNumber?: SortOrder
    surname?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    userTypeId?: SortOrder
  }

  export type userSumOrderByAggregateInput = {
    credit?: SortOrder
    debit?: SortOrder
    userTypeId?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type PriceListDetailListRelationFilter = {
    every?: priceListDetailWhereInput
    some?: priceListDetailWhereInput
    none?: priceListDetailWhereInput
  }

  export type ProductListRelationFilter = {
    every?: productWhereInput
    some?: productWhereInput
    none?: productWhereInput
  }

  export type priceListDetailOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type productOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type collectionCountOrderByAggregateInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type collectionMaxOrderByAggregateInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type collectionMinOrderByAggregateInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type CollectionScalarRelationFilter = {
    is?: collectionWhereInput
    isNot?: collectionWhereInput
  }

  export type productCountOrderByAggregateInput = {
    productId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    stock?: SortOrder
    width?: SortOrder
    height?: SortOrder
    cut?: SortOrder
    productImage?: SortOrder
    collectionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collection_name?: SortOrder
  }

  export type productAvgOrderByAggregateInput = {
    stock?: SortOrder
    width?: SortOrder
    height?: SortOrder
  }

  export type productMaxOrderByAggregateInput = {
    productId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    stock?: SortOrder
    width?: SortOrder
    height?: SortOrder
    cut?: SortOrder
    productImage?: SortOrder
    collectionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collection_name?: SortOrder
  }

  export type productMinOrderByAggregateInput = {
    productId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    stock?: SortOrder
    width?: SortOrder
    height?: SortOrder
    cut?: SortOrder
    productImage?: SortOrder
    collectionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collection_name?: SortOrder
  }

  export type productSumOrderByAggregateInput = {
    stock?: SortOrder
    width?: SortOrder
    height?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type priceListCountOrderByAggregateInput = {
    price_list_id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    is_default?: SortOrder
    valid_from?: SortOrder
    valid_to?: SortOrder
    limit_amount?: SortOrder
    currency?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type priceListAvgOrderByAggregateInput = {
    limit_amount?: SortOrder
  }

  export type priceListMaxOrderByAggregateInput = {
    price_list_id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    is_default?: SortOrder
    valid_from?: SortOrder
    valid_to?: SortOrder
    limit_amount?: SortOrder
    currency?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type priceListMinOrderByAggregateInput = {
    price_list_id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    is_default?: SortOrder
    valid_from?: SortOrder
    valid_to?: SortOrder
    limit_amount?: SortOrder
    currency?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type priceListSumOrderByAggregateInput = {
    limit_amount?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type PriceListScalarRelationFilter = {
    is?: priceListWhereInput
    isNot?: priceListWhereInput
  }

  export type priceListDetailCountOrderByAggregateInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type priceListDetailAvgOrderByAggregateInput = {
    price_per_square_meter?: SortOrder
  }

  export type priceListDetailMaxOrderByAggregateInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type priceListDetailMinOrderByAggregateInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type priceListDetailSumOrderByAggregateInput = {
    price_per_square_meter?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: userWhereInput
    isNot?: userWhereInput
  }

  export type userPriceListCountOrderByAggregateInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type userPriceListMaxOrderByAggregateInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type userPriceListMinOrderByAggregateInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type userCreateNestedManyWithoutUserTypeInput = {
    create?: XOR<userCreateWithoutUserTypeInput, userUncheckedCreateWithoutUserTypeInput> | userCreateWithoutUserTypeInput[] | userUncheckedCreateWithoutUserTypeInput[]
    connectOrCreate?: userCreateOrConnectWithoutUserTypeInput | userCreateOrConnectWithoutUserTypeInput[]
    createMany?: userCreateManyUserTypeInputEnvelope
    connect?: userWhereUniqueInput | userWhereUniqueInput[]
  }

  export type userUncheckedCreateNestedManyWithoutUserTypeInput = {
    create?: XOR<userCreateWithoutUserTypeInput, userUncheckedCreateWithoutUserTypeInput> | userCreateWithoutUserTypeInput[] | userUncheckedCreateWithoutUserTypeInput[]
    connectOrCreate?: userCreateOrConnectWithoutUserTypeInput | userCreateOrConnectWithoutUserTypeInput[]
    createMany?: userCreateManyUserTypeInputEnvelope
    connect?: userWhereUniqueInput | userWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type userUpdateManyWithoutUserTypeNestedInput = {
    create?: XOR<userCreateWithoutUserTypeInput, userUncheckedCreateWithoutUserTypeInput> | userCreateWithoutUserTypeInput[] | userUncheckedCreateWithoutUserTypeInput[]
    connectOrCreate?: userCreateOrConnectWithoutUserTypeInput | userCreateOrConnectWithoutUserTypeInput[]
    upsert?: userUpsertWithWhereUniqueWithoutUserTypeInput | userUpsertWithWhereUniqueWithoutUserTypeInput[]
    createMany?: userCreateManyUserTypeInputEnvelope
    set?: userWhereUniqueInput | userWhereUniqueInput[]
    disconnect?: userWhereUniqueInput | userWhereUniqueInput[]
    delete?: userWhereUniqueInput | userWhereUniqueInput[]
    connect?: userWhereUniqueInput | userWhereUniqueInput[]
    update?: userUpdateWithWhereUniqueWithoutUserTypeInput | userUpdateWithWhereUniqueWithoutUserTypeInput[]
    updateMany?: userUpdateManyWithWhereWithoutUserTypeInput | userUpdateManyWithWhereWithoutUserTypeInput[]
    deleteMany?: userScalarWhereInput | userScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type userUncheckedUpdateManyWithoutUserTypeNestedInput = {
    create?: XOR<userCreateWithoutUserTypeInput, userUncheckedCreateWithoutUserTypeInput> | userCreateWithoutUserTypeInput[] | userUncheckedCreateWithoutUserTypeInput[]
    connectOrCreate?: userCreateOrConnectWithoutUserTypeInput | userCreateOrConnectWithoutUserTypeInput[]
    upsert?: userUpsertWithWhereUniqueWithoutUserTypeInput | userUpsertWithWhereUniqueWithoutUserTypeInput[]
    createMany?: userCreateManyUserTypeInputEnvelope
    set?: userWhereUniqueInput | userWhereUniqueInput[]
    disconnect?: userWhereUniqueInput | userWhereUniqueInput[]
    delete?: userWhereUniqueInput | userWhereUniqueInput[]
    connect?: userWhereUniqueInput | userWhereUniqueInput[]
    update?: userUpdateWithWhereUniqueWithoutUserTypeInput | userUpdateWithWhereUniqueWithoutUserTypeInput[]
    updateMany?: userUpdateManyWithWhereWithoutUserTypeInput | userUpdateManyWithWhereWithoutUserTypeInput[]
    deleteMany?: userScalarWhereInput | userScalarWhereInput[]
  }

  export type userTypeCreateNestedOneWithoutUsersInput = {
    create?: XOR<userTypeCreateWithoutUsersInput, userTypeUncheckedCreateWithoutUsersInput>
    connectOrCreate?: userTypeCreateOrConnectWithoutUsersInput
    connect?: userTypeWhereUniqueInput
  }

  export type userPriceListCreateNestedManyWithoutUserInput = {
    create?: XOR<userPriceListCreateWithoutUserInput, userPriceListUncheckedCreateWithoutUserInput> | userPriceListCreateWithoutUserInput[] | userPriceListUncheckedCreateWithoutUserInput[]
    connectOrCreate?: userPriceListCreateOrConnectWithoutUserInput | userPriceListCreateOrConnectWithoutUserInput[]
    createMany?: userPriceListCreateManyUserInputEnvelope
    connect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
  }

  export type userPriceListUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<userPriceListCreateWithoutUserInput, userPriceListUncheckedCreateWithoutUserInput> | userPriceListCreateWithoutUserInput[] | userPriceListUncheckedCreateWithoutUserInput[]
    connectOrCreate?: userPriceListCreateOrConnectWithoutUserInput | userPriceListCreateOrConnectWithoutUserInput[]
    createMany?: userPriceListCreateManyUserInputEnvelope
    connect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type userTypeUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<userTypeCreateWithoutUsersInput, userTypeUncheckedCreateWithoutUsersInput>
    connectOrCreate?: userTypeCreateOrConnectWithoutUsersInput
    upsert?: userTypeUpsertWithoutUsersInput
    connect?: userTypeWhereUniqueInput
    update?: XOR<XOR<userTypeUpdateToOneWithWhereWithoutUsersInput, userTypeUpdateWithoutUsersInput>, userTypeUncheckedUpdateWithoutUsersInput>
  }

  export type userPriceListUpdateManyWithoutUserNestedInput = {
    create?: XOR<userPriceListCreateWithoutUserInput, userPriceListUncheckedCreateWithoutUserInput> | userPriceListCreateWithoutUserInput[] | userPriceListUncheckedCreateWithoutUserInput[]
    connectOrCreate?: userPriceListCreateOrConnectWithoutUserInput | userPriceListCreateOrConnectWithoutUserInput[]
    upsert?: userPriceListUpsertWithWhereUniqueWithoutUserInput | userPriceListUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: userPriceListCreateManyUserInputEnvelope
    set?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    disconnect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    delete?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    connect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    update?: userPriceListUpdateWithWhereUniqueWithoutUserInput | userPriceListUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: userPriceListUpdateManyWithWhereWithoutUserInput | userPriceListUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: userPriceListScalarWhereInput | userPriceListScalarWhereInput[]
  }

  export type userPriceListUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<userPriceListCreateWithoutUserInput, userPriceListUncheckedCreateWithoutUserInput> | userPriceListCreateWithoutUserInput[] | userPriceListUncheckedCreateWithoutUserInput[]
    connectOrCreate?: userPriceListCreateOrConnectWithoutUserInput | userPriceListCreateOrConnectWithoutUserInput[]
    upsert?: userPriceListUpsertWithWhereUniqueWithoutUserInput | userPriceListUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: userPriceListCreateManyUserInputEnvelope
    set?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    disconnect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    delete?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    connect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    update?: userPriceListUpdateWithWhereUniqueWithoutUserInput | userPriceListUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: userPriceListUpdateManyWithWhereWithoutUserInput | userPriceListUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: userPriceListScalarWhereInput | userPriceListScalarWhereInput[]
  }

  export type priceListDetailCreateNestedManyWithoutCollectionInput = {
    create?: XOR<priceListDetailCreateWithoutCollectionInput, priceListDetailUncheckedCreateWithoutCollectionInput> | priceListDetailCreateWithoutCollectionInput[] | priceListDetailUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: priceListDetailCreateOrConnectWithoutCollectionInput | priceListDetailCreateOrConnectWithoutCollectionInput[]
    createMany?: priceListDetailCreateManyCollectionInputEnvelope
    connect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
  }

  export type productCreateNestedManyWithoutCollectionInput = {
    create?: XOR<productCreateWithoutCollectionInput, productUncheckedCreateWithoutCollectionInput> | productCreateWithoutCollectionInput[] | productUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: productCreateOrConnectWithoutCollectionInput | productCreateOrConnectWithoutCollectionInput[]
    createMany?: productCreateManyCollectionInputEnvelope
    connect?: productWhereUniqueInput | productWhereUniqueInput[]
  }

  export type priceListDetailUncheckedCreateNestedManyWithoutCollectionInput = {
    create?: XOR<priceListDetailCreateWithoutCollectionInput, priceListDetailUncheckedCreateWithoutCollectionInput> | priceListDetailCreateWithoutCollectionInput[] | priceListDetailUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: priceListDetailCreateOrConnectWithoutCollectionInput | priceListDetailCreateOrConnectWithoutCollectionInput[]
    createMany?: priceListDetailCreateManyCollectionInputEnvelope
    connect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
  }

  export type productUncheckedCreateNestedManyWithoutCollectionInput = {
    create?: XOR<productCreateWithoutCollectionInput, productUncheckedCreateWithoutCollectionInput> | productCreateWithoutCollectionInput[] | productUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: productCreateOrConnectWithoutCollectionInput | productCreateOrConnectWithoutCollectionInput[]
    createMany?: productCreateManyCollectionInputEnvelope
    connect?: productWhereUniqueInput | productWhereUniqueInput[]
  }

  export type priceListDetailUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<priceListDetailCreateWithoutCollectionInput, priceListDetailUncheckedCreateWithoutCollectionInput> | priceListDetailCreateWithoutCollectionInput[] | priceListDetailUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: priceListDetailCreateOrConnectWithoutCollectionInput | priceListDetailCreateOrConnectWithoutCollectionInput[]
    upsert?: priceListDetailUpsertWithWhereUniqueWithoutCollectionInput | priceListDetailUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: priceListDetailCreateManyCollectionInputEnvelope
    set?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    disconnect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    delete?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    connect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    update?: priceListDetailUpdateWithWhereUniqueWithoutCollectionInput | priceListDetailUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: priceListDetailUpdateManyWithWhereWithoutCollectionInput | priceListDetailUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: priceListDetailScalarWhereInput | priceListDetailScalarWhereInput[]
  }

  export type productUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<productCreateWithoutCollectionInput, productUncheckedCreateWithoutCollectionInput> | productCreateWithoutCollectionInput[] | productUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: productCreateOrConnectWithoutCollectionInput | productCreateOrConnectWithoutCollectionInput[]
    upsert?: productUpsertWithWhereUniqueWithoutCollectionInput | productUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: productCreateManyCollectionInputEnvelope
    set?: productWhereUniqueInput | productWhereUniqueInput[]
    disconnect?: productWhereUniqueInput | productWhereUniqueInput[]
    delete?: productWhereUniqueInput | productWhereUniqueInput[]
    connect?: productWhereUniqueInput | productWhereUniqueInput[]
    update?: productUpdateWithWhereUniqueWithoutCollectionInput | productUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: productUpdateManyWithWhereWithoutCollectionInput | productUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: productScalarWhereInput | productScalarWhereInput[]
  }

  export type priceListDetailUncheckedUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<priceListDetailCreateWithoutCollectionInput, priceListDetailUncheckedCreateWithoutCollectionInput> | priceListDetailCreateWithoutCollectionInput[] | priceListDetailUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: priceListDetailCreateOrConnectWithoutCollectionInput | priceListDetailCreateOrConnectWithoutCollectionInput[]
    upsert?: priceListDetailUpsertWithWhereUniqueWithoutCollectionInput | priceListDetailUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: priceListDetailCreateManyCollectionInputEnvelope
    set?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    disconnect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    delete?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    connect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    update?: priceListDetailUpdateWithWhereUniqueWithoutCollectionInput | priceListDetailUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: priceListDetailUpdateManyWithWhereWithoutCollectionInput | priceListDetailUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: priceListDetailScalarWhereInput | priceListDetailScalarWhereInput[]
  }

  export type productUncheckedUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<productCreateWithoutCollectionInput, productUncheckedCreateWithoutCollectionInput> | productCreateWithoutCollectionInput[] | productUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: productCreateOrConnectWithoutCollectionInput | productCreateOrConnectWithoutCollectionInput[]
    upsert?: productUpsertWithWhereUniqueWithoutCollectionInput | productUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: productCreateManyCollectionInputEnvelope
    set?: productWhereUniqueInput | productWhereUniqueInput[]
    disconnect?: productWhereUniqueInput | productWhereUniqueInput[]
    delete?: productWhereUniqueInput | productWhereUniqueInput[]
    connect?: productWhereUniqueInput | productWhereUniqueInput[]
    update?: productUpdateWithWhereUniqueWithoutCollectionInput | productUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: productUpdateManyWithWhereWithoutCollectionInput | productUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: productScalarWhereInput | productScalarWhereInput[]
  }

  export type collectionCreateNestedOneWithoutProductsInput = {
    create?: XOR<collectionCreateWithoutProductsInput, collectionUncheckedCreateWithoutProductsInput>
    connectOrCreate?: collectionCreateOrConnectWithoutProductsInput
    connect?: collectionWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type collectionUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<collectionCreateWithoutProductsInput, collectionUncheckedCreateWithoutProductsInput>
    connectOrCreate?: collectionCreateOrConnectWithoutProductsInput
    upsert?: collectionUpsertWithoutProductsInput
    connect?: collectionWhereUniqueInput
    update?: XOR<XOR<collectionUpdateToOneWithWhereWithoutProductsInput, collectionUpdateWithoutProductsInput>, collectionUncheckedUpdateWithoutProductsInput>
  }

  export type priceListDetailCreateNestedManyWithoutPriceListInput = {
    create?: XOR<priceListDetailCreateWithoutPriceListInput, priceListDetailUncheckedCreateWithoutPriceListInput> | priceListDetailCreateWithoutPriceListInput[] | priceListDetailUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: priceListDetailCreateOrConnectWithoutPriceListInput | priceListDetailCreateOrConnectWithoutPriceListInput[]
    createMany?: priceListDetailCreateManyPriceListInputEnvelope
    connect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
  }

  export type userPriceListCreateNestedManyWithoutPriceListInput = {
    create?: XOR<userPriceListCreateWithoutPriceListInput, userPriceListUncheckedCreateWithoutPriceListInput> | userPriceListCreateWithoutPriceListInput[] | userPriceListUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: userPriceListCreateOrConnectWithoutPriceListInput | userPriceListCreateOrConnectWithoutPriceListInput[]
    createMany?: userPriceListCreateManyPriceListInputEnvelope
    connect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
  }

  export type priceListDetailUncheckedCreateNestedManyWithoutPriceListInput = {
    create?: XOR<priceListDetailCreateWithoutPriceListInput, priceListDetailUncheckedCreateWithoutPriceListInput> | priceListDetailCreateWithoutPriceListInput[] | priceListDetailUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: priceListDetailCreateOrConnectWithoutPriceListInput | priceListDetailCreateOrConnectWithoutPriceListInput[]
    createMany?: priceListDetailCreateManyPriceListInputEnvelope
    connect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
  }

  export type userPriceListUncheckedCreateNestedManyWithoutPriceListInput = {
    create?: XOR<userPriceListCreateWithoutPriceListInput, userPriceListUncheckedCreateWithoutPriceListInput> | userPriceListCreateWithoutPriceListInput[] | userPriceListUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: userPriceListCreateOrConnectWithoutPriceListInput | userPriceListCreateOrConnectWithoutPriceListInput[]
    createMany?: userPriceListCreateManyPriceListInputEnvelope
    connect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type priceListDetailUpdateManyWithoutPriceListNestedInput = {
    create?: XOR<priceListDetailCreateWithoutPriceListInput, priceListDetailUncheckedCreateWithoutPriceListInput> | priceListDetailCreateWithoutPriceListInput[] | priceListDetailUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: priceListDetailCreateOrConnectWithoutPriceListInput | priceListDetailCreateOrConnectWithoutPriceListInput[]
    upsert?: priceListDetailUpsertWithWhereUniqueWithoutPriceListInput | priceListDetailUpsertWithWhereUniqueWithoutPriceListInput[]
    createMany?: priceListDetailCreateManyPriceListInputEnvelope
    set?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    disconnect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    delete?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    connect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    update?: priceListDetailUpdateWithWhereUniqueWithoutPriceListInput | priceListDetailUpdateWithWhereUniqueWithoutPriceListInput[]
    updateMany?: priceListDetailUpdateManyWithWhereWithoutPriceListInput | priceListDetailUpdateManyWithWhereWithoutPriceListInput[]
    deleteMany?: priceListDetailScalarWhereInput | priceListDetailScalarWhereInput[]
  }

  export type userPriceListUpdateManyWithoutPriceListNestedInput = {
    create?: XOR<userPriceListCreateWithoutPriceListInput, userPriceListUncheckedCreateWithoutPriceListInput> | userPriceListCreateWithoutPriceListInput[] | userPriceListUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: userPriceListCreateOrConnectWithoutPriceListInput | userPriceListCreateOrConnectWithoutPriceListInput[]
    upsert?: userPriceListUpsertWithWhereUniqueWithoutPriceListInput | userPriceListUpsertWithWhereUniqueWithoutPriceListInput[]
    createMany?: userPriceListCreateManyPriceListInputEnvelope
    set?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    disconnect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    delete?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    connect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    update?: userPriceListUpdateWithWhereUniqueWithoutPriceListInput | userPriceListUpdateWithWhereUniqueWithoutPriceListInput[]
    updateMany?: userPriceListUpdateManyWithWhereWithoutPriceListInput | userPriceListUpdateManyWithWhereWithoutPriceListInput[]
    deleteMany?: userPriceListScalarWhereInput | userPriceListScalarWhereInput[]
  }

  export type priceListDetailUncheckedUpdateManyWithoutPriceListNestedInput = {
    create?: XOR<priceListDetailCreateWithoutPriceListInput, priceListDetailUncheckedCreateWithoutPriceListInput> | priceListDetailCreateWithoutPriceListInput[] | priceListDetailUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: priceListDetailCreateOrConnectWithoutPriceListInput | priceListDetailCreateOrConnectWithoutPriceListInput[]
    upsert?: priceListDetailUpsertWithWhereUniqueWithoutPriceListInput | priceListDetailUpsertWithWhereUniqueWithoutPriceListInput[]
    createMany?: priceListDetailCreateManyPriceListInputEnvelope
    set?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    disconnect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    delete?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    connect?: priceListDetailWhereUniqueInput | priceListDetailWhereUniqueInput[]
    update?: priceListDetailUpdateWithWhereUniqueWithoutPriceListInput | priceListDetailUpdateWithWhereUniqueWithoutPriceListInput[]
    updateMany?: priceListDetailUpdateManyWithWhereWithoutPriceListInput | priceListDetailUpdateManyWithWhereWithoutPriceListInput[]
    deleteMany?: priceListDetailScalarWhereInput | priceListDetailScalarWhereInput[]
  }

  export type userPriceListUncheckedUpdateManyWithoutPriceListNestedInput = {
    create?: XOR<userPriceListCreateWithoutPriceListInput, userPriceListUncheckedCreateWithoutPriceListInput> | userPriceListCreateWithoutPriceListInput[] | userPriceListUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: userPriceListCreateOrConnectWithoutPriceListInput | userPriceListCreateOrConnectWithoutPriceListInput[]
    upsert?: userPriceListUpsertWithWhereUniqueWithoutPriceListInput | userPriceListUpsertWithWhereUniqueWithoutPriceListInput[]
    createMany?: userPriceListCreateManyPriceListInputEnvelope
    set?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    disconnect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    delete?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    connect?: userPriceListWhereUniqueInput | userPriceListWhereUniqueInput[]
    update?: userPriceListUpdateWithWhereUniqueWithoutPriceListInput | userPriceListUpdateWithWhereUniqueWithoutPriceListInput[]
    updateMany?: userPriceListUpdateManyWithWhereWithoutPriceListInput | userPriceListUpdateManyWithWhereWithoutPriceListInput[]
    deleteMany?: userPriceListScalarWhereInput | userPriceListScalarWhereInput[]
  }

  export type collectionCreateNestedOneWithoutPriceListDetailInput = {
    create?: XOR<collectionCreateWithoutPriceListDetailInput, collectionUncheckedCreateWithoutPriceListDetailInput>
    connectOrCreate?: collectionCreateOrConnectWithoutPriceListDetailInput
    connect?: collectionWhereUniqueInput
  }

  export type priceListCreateNestedOneWithoutPriceListDetailInput = {
    create?: XOR<priceListCreateWithoutPriceListDetailInput, priceListUncheckedCreateWithoutPriceListDetailInput>
    connectOrCreate?: priceListCreateOrConnectWithoutPriceListDetailInput
    connect?: priceListWhereUniqueInput
  }

  export type collectionUpdateOneRequiredWithoutPriceListDetailNestedInput = {
    create?: XOR<collectionCreateWithoutPriceListDetailInput, collectionUncheckedCreateWithoutPriceListDetailInput>
    connectOrCreate?: collectionCreateOrConnectWithoutPriceListDetailInput
    upsert?: collectionUpsertWithoutPriceListDetailInput
    connect?: collectionWhereUniqueInput
    update?: XOR<XOR<collectionUpdateToOneWithWhereWithoutPriceListDetailInput, collectionUpdateWithoutPriceListDetailInput>, collectionUncheckedUpdateWithoutPriceListDetailInput>
  }

  export type priceListUpdateOneRequiredWithoutPriceListDetailNestedInput = {
    create?: XOR<priceListCreateWithoutPriceListDetailInput, priceListUncheckedCreateWithoutPriceListDetailInput>
    connectOrCreate?: priceListCreateOrConnectWithoutPriceListDetailInput
    upsert?: priceListUpsertWithoutPriceListDetailInput
    connect?: priceListWhereUniqueInput
    update?: XOR<XOR<priceListUpdateToOneWithWhereWithoutPriceListDetailInput, priceListUpdateWithoutPriceListDetailInput>, priceListUncheckedUpdateWithoutPriceListDetailInput>
  }

  export type priceListCreateNestedOneWithoutUserPriceListInput = {
    create?: XOR<priceListCreateWithoutUserPriceListInput, priceListUncheckedCreateWithoutUserPriceListInput>
    connectOrCreate?: priceListCreateOrConnectWithoutUserPriceListInput
    connect?: priceListWhereUniqueInput
  }

  export type userCreateNestedOneWithoutUserPriceListInput = {
    create?: XOR<userCreateWithoutUserPriceListInput, userUncheckedCreateWithoutUserPriceListInput>
    connectOrCreate?: userCreateOrConnectWithoutUserPriceListInput
    connect?: userWhereUniqueInput
  }

  export type priceListUpdateOneRequiredWithoutUserPriceListNestedInput = {
    create?: XOR<priceListCreateWithoutUserPriceListInput, priceListUncheckedCreateWithoutUserPriceListInput>
    connectOrCreate?: priceListCreateOrConnectWithoutUserPriceListInput
    upsert?: priceListUpsertWithoutUserPriceListInput
    connect?: priceListWhereUniqueInput
    update?: XOR<XOR<priceListUpdateToOneWithWhereWithoutUserPriceListInput, priceListUpdateWithoutUserPriceListInput>, priceListUncheckedUpdateWithoutUserPriceListInput>
  }

  export type userUpdateOneRequiredWithoutUserPriceListNestedInput = {
    create?: XOR<userCreateWithoutUserPriceListInput, userUncheckedCreateWithoutUserPriceListInput>
    connectOrCreate?: userCreateOrConnectWithoutUserPriceListInput
    upsert?: userUpsertWithoutUserPriceListInput
    connect?: userWhereUniqueInput
    update?: XOR<XOR<userUpdateToOneWithWhereWithoutUserPriceListInput, userUpdateWithoutUserPriceListInput>, userUncheckedUpdateWithoutUserPriceListInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type userCreateWithoutUserTypeInput = {
    email: string
    name: string
    createdAt?: Date | string
    credit?: Decimal | DecimalJsLike | number | string
    debit?: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    password: string
    phoneNumber?: string | null
    surname: string
    userId?: string
    username: string
    userPriceList?: userPriceListCreateNestedManyWithoutUserInput
  }

  export type userUncheckedCreateWithoutUserTypeInput = {
    email: string
    name: string
    createdAt?: Date | string
    credit?: Decimal | DecimalJsLike | number | string
    debit?: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    password: string
    phoneNumber?: string | null
    surname: string
    userId?: string
    username: string
    userPriceList?: userPriceListUncheckedCreateNestedManyWithoutUserInput
  }

  export type userCreateOrConnectWithoutUserTypeInput = {
    where: userWhereUniqueInput
    create: XOR<userCreateWithoutUserTypeInput, userUncheckedCreateWithoutUserTypeInput>
  }

  export type userCreateManyUserTypeInputEnvelope = {
    data: userCreateManyUserTypeInput | userCreateManyUserTypeInput[]
    skipDuplicates?: boolean
  }

  export type userUpsertWithWhereUniqueWithoutUserTypeInput = {
    where: userWhereUniqueInput
    update: XOR<userUpdateWithoutUserTypeInput, userUncheckedUpdateWithoutUserTypeInput>
    create: XOR<userCreateWithoutUserTypeInput, userUncheckedCreateWithoutUserTypeInput>
  }

  export type userUpdateWithWhereUniqueWithoutUserTypeInput = {
    where: userWhereUniqueInput
    data: XOR<userUpdateWithoutUserTypeInput, userUncheckedUpdateWithoutUserTypeInput>
  }

  export type userUpdateManyWithWhereWithoutUserTypeInput = {
    where: userScalarWhereInput
    data: XOR<userUpdateManyMutationInput, userUncheckedUpdateManyWithoutUserTypeInput>
  }

  export type userScalarWhereInput = {
    AND?: userScalarWhereInput | userScalarWhereInput[]
    OR?: userScalarWhereInput[]
    NOT?: userScalarWhereInput | userScalarWhereInput[]
    email?: StringFilter<"user"> | string
    name?: StringFilter<"user"> | string
    createdAt?: DateTimeFilter<"user"> | Date | string
    credit?: DecimalFilter<"user"> | Decimal | DecimalJsLike | number | string
    debit?: DecimalFilter<"user"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolFilter<"user"> | boolean
    password?: StringFilter<"user"> | string
    phoneNumber?: StringNullableFilter<"user"> | string | null
    surname?: StringFilter<"user"> | string
    userId?: StringFilter<"user"> | string
    username?: StringFilter<"user"> | string
    userTypeId?: IntFilter<"user"> | number
  }

  export type userTypeCreateWithoutUsersInput = {
    name: string
  }

  export type userTypeUncheckedCreateWithoutUsersInput = {
    id?: number
    name: string
  }

  export type userTypeCreateOrConnectWithoutUsersInput = {
    where: userTypeWhereUniqueInput
    create: XOR<userTypeCreateWithoutUsersInput, userTypeUncheckedCreateWithoutUsersInput>
  }

  export type userPriceListCreateWithoutUserInput = {
    user_price_list_id?: string
    created_at?: Date | string
    updated_at?: Date | string
    priceList: priceListCreateNestedOneWithoutUserPriceListInput
  }

  export type userPriceListUncheckedCreateWithoutUserInput = {
    user_price_list_id?: string
    price_list_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type userPriceListCreateOrConnectWithoutUserInput = {
    where: userPriceListWhereUniqueInput
    create: XOR<userPriceListCreateWithoutUserInput, userPriceListUncheckedCreateWithoutUserInput>
  }

  export type userPriceListCreateManyUserInputEnvelope = {
    data: userPriceListCreateManyUserInput | userPriceListCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type userTypeUpsertWithoutUsersInput = {
    update: XOR<userTypeUpdateWithoutUsersInput, userTypeUncheckedUpdateWithoutUsersInput>
    create: XOR<userTypeCreateWithoutUsersInput, userTypeUncheckedCreateWithoutUsersInput>
    where?: userTypeWhereInput
  }

  export type userTypeUpdateToOneWithWhereWithoutUsersInput = {
    where?: userTypeWhereInput
    data: XOR<userTypeUpdateWithoutUsersInput, userTypeUncheckedUpdateWithoutUsersInput>
  }

  export type userTypeUpdateWithoutUsersInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type userTypeUncheckedUpdateWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type userPriceListUpsertWithWhereUniqueWithoutUserInput = {
    where: userPriceListWhereUniqueInput
    update: XOR<userPriceListUpdateWithoutUserInput, userPriceListUncheckedUpdateWithoutUserInput>
    create: XOR<userPriceListCreateWithoutUserInput, userPriceListUncheckedCreateWithoutUserInput>
  }

  export type userPriceListUpdateWithWhereUniqueWithoutUserInput = {
    where: userPriceListWhereUniqueInput
    data: XOR<userPriceListUpdateWithoutUserInput, userPriceListUncheckedUpdateWithoutUserInput>
  }

  export type userPriceListUpdateManyWithWhereWithoutUserInput = {
    where: userPriceListScalarWhereInput
    data: XOR<userPriceListUpdateManyMutationInput, userPriceListUncheckedUpdateManyWithoutUserInput>
  }

  export type userPriceListScalarWhereInput = {
    AND?: userPriceListScalarWhereInput | userPriceListScalarWhereInput[]
    OR?: userPriceListScalarWhereInput[]
    NOT?: userPriceListScalarWhereInput | userPriceListScalarWhereInput[]
    user_price_list_id?: StringFilter<"userPriceList"> | string
    user_id?: StringFilter<"userPriceList"> | string
    price_list_id?: StringFilter<"userPriceList"> | string
    created_at?: DateTimeFilter<"userPriceList"> | Date | string
    updated_at?: DateTimeFilter<"userPriceList"> | Date | string
  }

  export type priceListDetailCreateWithoutCollectionInput = {
    price_list_detail_id?: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    priceList: priceListCreateNestedOneWithoutPriceListDetailInput
  }

  export type priceListDetailUncheckedCreateWithoutCollectionInput = {
    price_list_detail_id?: string
    price_list_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type priceListDetailCreateOrConnectWithoutCollectionInput = {
    where: priceListDetailWhereUniqueInput
    create: XOR<priceListDetailCreateWithoutCollectionInput, priceListDetailUncheckedCreateWithoutCollectionInput>
  }

  export type priceListDetailCreateManyCollectionInputEnvelope = {
    data: priceListDetailCreateManyCollectionInput | priceListDetailCreateManyCollectionInput[]
    skipDuplicates?: boolean
  }

  export type productCreateWithoutCollectionInput = {
    productId?: string
    name: string
    description: string
    stock: number
    width: number
    height: number
    cut: boolean
    productImage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    collection_name?: string | null
  }

  export type productUncheckedCreateWithoutCollectionInput = {
    productId?: string
    name: string
    description: string
    stock: number
    width: number
    height: number
    cut: boolean
    productImage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    collection_name?: string | null
  }

  export type productCreateOrConnectWithoutCollectionInput = {
    where: productWhereUniqueInput
    create: XOR<productCreateWithoutCollectionInput, productUncheckedCreateWithoutCollectionInput>
  }

  export type productCreateManyCollectionInputEnvelope = {
    data: productCreateManyCollectionInput | productCreateManyCollectionInput[]
    skipDuplicates?: boolean
  }

  export type priceListDetailUpsertWithWhereUniqueWithoutCollectionInput = {
    where: priceListDetailWhereUniqueInput
    update: XOR<priceListDetailUpdateWithoutCollectionInput, priceListDetailUncheckedUpdateWithoutCollectionInput>
    create: XOR<priceListDetailCreateWithoutCollectionInput, priceListDetailUncheckedCreateWithoutCollectionInput>
  }

  export type priceListDetailUpdateWithWhereUniqueWithoutCollectionInput = {
    where: priceListDetailWhereUniqueInput
    data: XOR<priceListDetailUpdateWithoutCollectionInput, priceListDetailUncheckedUpdateWithoutCollectionInput>
  }

  export type priceListDetailUpdateManyWithWhereWithoutCollectionInput = {
    where: priceListDetailScalarWhereInput
    data: XOR<priceListDetailUpdateManyMutationInput, priceListDetailUncheckedUpdateManyWithoutCollectionInput>
  }

  export type priceListDetailScalarWhereInput = {
    AND?: priceListDetailScalarWhereInput | priceListDetailScalarWhereInput[]
    OR?: priceListDetailScalarWhereInput[]
    NOT?: priceListDetailScalarWhereInput | priceListDetailScalarWhereInput[]
    price_list_detail_id?: StringFilter<"priceListDetail"> | string
    price_list_id?: StringFilter<"priceListDetail"> | string
    collection_id?: StringFilter<"priceListDetail"> | string
    price_per_square_meter?: DecimalFilter<"priceListDetail"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"priceListDetail"> | Date | string
    updated_at?: DateTimeFilter<"priceListDetail"> | Date | string
  }

  export type productUpsertWithWhereUniqueWithoutCollectionInput = {
    where: productWhereUniqueInput
    update: XOR<productUpdateWithoutCollectionInput, productUncheckedUpdateWithoutCollectionInput>
    create: XOR<productCreateWithoutCollectionInput, productUncheckedCreateWithoutCollectionInput>
  }

  export type productUpdateWithWhereUniqueWithoutCollectionInput = {
    where: productWhereUniqueInput
    data: XOR<productUpdateWithoutCollectionInput, productUncheckedUpdateWithoutCollectionInput>
  }

  export type productUpdateManyWithWhereWithoutCollectionInput = {
    where: productScalarWhereInput
    data: XOR<productUpdateManyMutationInput, productUncheckedUpdateManyWithoutCollectionInput>
  }

  export type productScalarWhereInput = {
    AND?: productScalarWhereInput | productScalarWhereInput[]
    OR?: productScalarWhereInput[]
    NOT?: productScalarWhereInput | productScalarWhereInput[]
    productId?: StringFilter<"product"> | string
    name?: StringFilter<"product"> | string
    description?: StringFilter<"product"> | string
    stock?: IntFilter<"product"> | number
    width?: FloatFilter<"product"> | number
    height?: FloatFilter<"product"> | number
    cut?: BoolFilter<"product"> | boolean
    productImage?: StringNullableFilter<"product"> | string | null
    collectionId?: StringFilter<"product"> | string
    createdAt?: DateTimeFilter<"product"> | Date | string
    updatedAt?: DateTimeFilter<"product"> | Date | string
    collection_name?: StringNullableFilter<"product"> | string | null
  }

  export type collectionCreateWithoutProductsInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    priceListDetail?: priceListDetailCreateNestedManyWithoutCollectionInput
  }

  export type collectionUncheckedCreateWithoutProductsInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    priceListDetail?: priceListDetailUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type collectionCreateOrConnectWithoutProductsInput = {
    where: collectionWhereUniqueInput
    create: XOR<collectionCreateWithoutProductsInput, collectionUncheckedCreateWithoutProductsInput>
  }

  export type collectionUpsertWithoutProductsInput = {
    update: XOR<collectionUpdateWithoutProductsInput, collectionUncheckedUpdateWithoutProductsInput>
    create: XOR<collectionCreateWithoutProductsInput, collectionUncheckedCreateWithoutProductsInput>
    where?: collectionWhereInput
  }

  export type collectionUpdateToOneWithWhereWithoutProductsInput = {
    where?: collectionWhereInput
    data: XOR<collectionUpdateWithoutProductsInput, collectionUncheckedUpdateWithoutProductsInput>
  }

  export type collectionUpdateWithoutProductsInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    priceListDetail?: priceListDetailUpdateManyWithoutCollectionNestedInput
  }

  export type collectionUncheckedUpdateWithoutProductsInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    priceListDetail?: priceListDetailUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type priceListDetailCreateWithoutPriceListInput = {
    price_list_detail_id?: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    collection: collectionCreateNestedOneWithoutPriceListDetailInput
  }

  export type priceListDetailUncheckedCreateWithoutPriceListInput = {
    price_list_detail_id?: string
    collection_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type priceListDetailCreateOrConnectWithoutPriceListInput = {
    where: priceListDetailWhereUniqueInput
    create: XOR<priceListDetailCreateWithoutPriceListInput, priceListDetailUncheckedCreateWithoutPriceListInput>
  }

  export type priceListDetailCreateManyPriceListInputEnvelope = {
    data: priceListDetailCreateManyPriceListInput | priceListDetailCreateManyPriceListInput[]
    skipDuplicates?: boolean
  }

  export type userPriceListCreateWithoutPriceListInput = {
    user_price_list_id?: string
    created_at?: Date | string
    updated_at?: Date | string
    user: userCreateNestedOneWithoutUserPriceListInput
  }

  export type userPriceListUncheckedCreateWithoutPriceListInput = {
    user_price_list_id?: string
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type userPriceListCreateOrConnectWithoutPriceListInput = {
    where: userPriceListWhereUniqueInput
    create: XOR<userPriceListCreateWithoutPriceListInput, userPriceListUncheckedCreateWithoutPriceListInput>
  }

  export type userPriceListCreateManyPriceListInputEnvelope = {
    data: userPriceListCreateManyPriceListInput | userPriceListCreateManyPriceListInput[]
    skipDuplicates?: boolean
  }

  export type priceListDetailUpsertWithWhereUniqueWithoutPriceListInput = {
    where: priceListDetailWhereUniqueInput
    update: XOR<priceListDetailUpdateWithoutPriceListInput, priceListDetailUncheckedUpdateWithoutPriceListInput>
    create: XOR<priceListDetailCreateWithoutPriceListInput, priceListDetailUncheckedCreateWithoutPriceListInput>
  }

  export type priceListDetailUpdateWithWhereUniqueWithoutPriceListInput = {
    where: priceListDetailWhereUniqueInput
    data: XOR<priceListDetailUpdateWithoutPriceListInput, priceListDetailUncheckedUpdateWithoutPriceListInput>
  }

  export type priceListDetailUpdateManyWithWhereWithoutPriceListInput = {
    where: priceListDetailScalarWhereInput
    data: XOR<priceListDetailUpdateManyMutationInput, priceListDetailUncheckedUpdateManyWithoutPriceListInput>
  }

  export type userPriceListUpsertWithWhereUniqueWithoutPriceListInput = {
    where: userPriceListWhereUniqueInput
    update: XOR<userPriceListUpdateWithoutPriceListInput, userPriceListUncheckedUpdateWithoutPriceListInput>
    create: XOR<userPriceListCreateWithoutPriceListInput, userPriceListUncheckedCreateWithoutPriceListInput>
  }

  export type userPriceListUpdateWithWhereUniqueWithoutPriceListInput = {
    where: userPriceListWhereUniqueInput
    data: XOR<userPriceListUpdateWithoutPriceListInput, userPriceListUncheckedUpdateWithoutPriceListInput>
  }

  export type userPriceListUpdateManyWithWhereWithoutPriceListInput = {
    where: userPriceListScalarWhereInput
    data: XOR<userPriceListUpdateManyMutationInput, userPriceListUncheckedUpdateManyWithoutPriceListInput>
  }

  export type collectionCreateWithoutPriceListDetailInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productCreateNestedManyWithoutCollectionInput
  }

  export type collectionUncheckedCreateWithoutPriceListDetailInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type collectionCreateOrConnectWithoutPriceListDetailInput = {
    where: collectionWhereUniqueInput
    create: XOR<collectionCreateWithoutPriceListDetailInput, collectionUncheckedCreateWithoutPriceListDetailInput>
  }

  export type priceListCreateWithoutPriceListDetailInput = {
    price_list_id?: string
    name: string
    description?: string | null
    is_default?: boolean
    valid_from?: Date | string | null
    valid_to?: Date | string | null
    limit_amount?: Decimal | DecimalJsLike | number | string | null
    currency: string
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    userPriceList?: userPriceListCreateNestedManyWithoutPriceListInput
  }

  export type priceListUncheckedCreateWithoutPriceListDetailInput = {
    price_list_id?: string
    name: string
    description?: string | null
    is_default?: boolean
    valid_from?: Date | string | null
    valid_to?: Date | string | null
    limit_amount?: Decimal | DecimalJsLike | number | string | null
    currency: string
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    userPriceList?: userPriceListUncheckedCreateNestedManyWithoutPriceListInput
  }

  export type priceListCreateOrConnectWithoutPriceListDetailInput = {
    where: priceListWhereUniqueInput
    create: XOR<priceListCreateWithoutPriceListDetailInput, priceListUncheckedCreateWithoutPriceListDetailInput>
  }

  export type collectionUpsertWithoutPriceListDetailInput = {
    update: XOR<collectionUpdateWithoutPriceListDetailInput, collectionUncheckedUpdateWithoutPriceListDetailInput>
    create: XOR<collectionCreateWithoutPriceListDetailInput, collectionUncheckedCreateWithoutPriceListDetailInput>
    where?: collectionWhereInput
  }

  export type collectionUpdateToOneWithWhereWithoutPriceListDetailInput = {
    where?: collectionWhereInput
    data: XOR<collectionUpdateWithoutPriceListDetailInput, collectionUncheckedUpdateWithoutPriceListDetailInput>
  }

  export type collectionUpdateWithoutPriceListDetailInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productUpdateManyWithoutCollectionNestedInput
  }

  export type collectionUncheckedUpdateWithoutPriceListDetailInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type priceListUpsertWithoutPriceListDetailInput = {
    update: XOR<priceListUpdateWithoutPriceListDetailInput, priceListUncheckedUpdateWithoutPriceListDetailInput>
    create: XOR<priceListCreateWithoutPriceListDetailInput, priceListUncheckedCreateWithoutPriceListDetailInput>
    where?: priceListWhereInput
  }

  export type priceListUpdateToOneWithWhereWithoutPriceListDetailInput = {
    where?: priceListWhereInput
    data: XOR<priceListUpdateWithoutPriceListDetailInput, priceListUncheckedUpdateWithoutPriceListDetailInput>
  }

  export type priceListUpdateWithoutPriceListDetailInput = {
    price_list_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    is_default?: BoolFieldUpdateOperationsInput | boolean
    valid_from?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    valid_to?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    limit_amount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    currency?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    userPriceList?: userPriceListUpdateManyWithoutPriceListNestedInput
  }

  export type priceListUncheckedUpdateWithoutPriceListDetailInput = {
    price_list_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    is_default?: BoolFieldUpdateOperationsInput | boolean
    valid_from?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    valid_to?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    limit_amount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    currency?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    userPriceList?: userPriceListUncheckedUpdateManyWithoutPriceListNestedInput
  }

  export type priceListCreateWithoutUserPriceListInput = {
    price_list_id?: string
    name: string
    description?: string | null
    is_default?: boolean
    valid_from?: Date | string | null
    valid_to?: Date | string | null
    limit_amount?: Decimal | DecimalJsLike | number | string | null
    currency: string
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    priceListDetail?: priceListDetailCreateNestedManyWithoutPriceListInput
  }

  export type priceListUncheckedCreateWithoutUserPriceListInput = {
    price_list_id?: string
    name: string
    description?: string | null
    is_default?: boolean
    valid_from?: Date | string | null
    valid_to?: Date | string | null
    limit_amount?: Decimal | DecimalJsLike | number | string | null
    currency: string
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    priceListDetail?: priceListDetailUncheckedCreateNestedManyWithoutPriceListInput
  }

  export type priceListCreateOrConnectWithoutUserPriceListInput = {
    where: priceListWhereUniqueInput
    create: XOR<priceListCreateWithoutUserPriceListInput, priceListUncheckedCreateWithoutUserPriceListInput>
  }

  export type userCreateWithoutUserPriceListInput = {
    email: string
    name: string
    createdAt?: Date | string
    credit?: Decimal | DecimalJsLike | number | string
    debit?: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    password: string
    phoneNumber?: string | null
    surname: string
    userId?: string
    username: string
    userType: userTypeCreateNestedOneWithoutUsersInput
  }

  export type userUncheckedCreateWithoutUserPriceListInput = {
    email: string
    name: string
    createdAt?: Date | string
    credit?: Decimal | DecimalJsLike | number | string
    debit?: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    password: string
    phoneNumber?: string | null
    surname: string
    userId?: string
    username: string
    userTypeId: number
  }

  export type userCreateOrConnectWithoutUserPriceListInput = {
    where: userWhereUniqueInput
    create: XOR<userCreateWithoutUserPriceListInput, userUncheckedCreateWithoutUserPriceListInput>
  }

  export type priceListUpsertWithoutUserPriceListInput = {
    update: XOR<priceListUpdateWithoutUserPriceListInput, priceListUncheckedUpdateWithoutUserPriceListInput>
    create: XOR<priceListCreateWithoutUserPriceListInput, priceListUncheckedCreateWithoutUserPriceListInput>
    where?: priceListWhereInput
  }

  export type priceListUpdateToOneWithWhereWithoutUserPriceListInput = {
    where?: priceListWhereInput
    data: XOR<priceListUpdateWithoutUserPriceListInput, priceListUncheckedUpdateWithoutUserPriceListInput>
  }

  export type priceListUpdateWithoutUserPriceListInput = {
    price_list_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    is_default?: BoolFieldUpdateOperationsInput | boolean
    valid_from?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    valid_to?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    limit_amount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    currency?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    priceListDetail?: priceListDetailUpdateManyWithoutPriceListNestedInput
  }

  export type priceListUncheckedUpdateWithoutUserPriceListInput = {
    price_list_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    is_default?: BoolFieldUpdateOperationsInput | boolean
    valid_from?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    valid_to?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    limit_amount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    currency?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    priceListDetail?: priceListDetailUncheckedUpdateManyWithoutPriceListNestedInput
  }

  export type userUpsertWithoutUserPriceListInput = {
    update: XOR<userUpdateWithoutUserPriceListInput, userUncheckedUpdateWithoutUserPriceListInput>
    create: XOR<userCreateWithoutUserPriceListInput, userUncheckedCreateWithoutUserPriceListInput>
    where?: userWhereInput
  }

  export type userUpdateToOneWithWhereWithoutUserPriceListInput = {
    where?: userWhereInput
    data: XOR<userUpdateWithoutUserPriceListInput, userUncheckedUpdateWithoutUserPriceListInput>
  }

  export type userUpdateWithoutUserPriceListInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    userType?: userTypeUpdateOneRequiredWithoutUsersNestedInput
  }

  export type userUncheckedUpdateWithoutUserPriceListInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    userTypeId?: IntFieldUpdateOperationsInput | number
  }

  export type userCreateManyUserTypeInput = {
    email: string
    name: string
    createdAt?: Date | string
    credit?: Decimal | DecimalJsLike | number | string
    debit?: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    password: string
    phoneNumber?: string | null
    surname: string
    userId?: string
    username: string
  }

  export type userUpdateWithoutUserTypeInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    userPriceList?: userPriceListUpdateManyWithoutUserNestedInput
  }

  export type userUncheckedUpdateWithoutUserTypeInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    userPriceList?: userPriceListUncheckedUpdateManyWithoutUserNestedInput
  }

  export type userUncheckedUpdateManyWithoutUserTypeInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    credit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    debit?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    password?: StringFieldUpdateOperationsInput | string
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    surname?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
  }

  export type userPriceListCreateManyUserInput = {
    user_price_list_id?: string
    price_list_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type userPriceListUpdateWithoutUserInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    priceList?: priceListUpdateOneRequiredWithoutUserPriceListNestedInput
  }

  export type userPriceListUncheckedUpdateWithoutUserInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type userPriceListUncheckedUpdateManyWithoutUserInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type priceListDetailCreateManyCollectionInput = {
    price_list_detail_id?: string
    price_list_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type productCreateManyCollectionInput = {
    productId?: string
    name: string
    description: string
    stock: number
    width: number
    height: number
    cut: boolean
    productImage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    collection_name?: string | null
  }

  export type priceListDetailUpdateWithoutCollectionInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    priceList?: priceListUpdateOneRequiredWithoutPriceListDetailNestedInput
  }

  export type priceListDetailUncheckedUpdateWithoutCollectionInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type priceListDetailUncheckedUpdateManyWithoutCollectionInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type productUpdateWithoutCollectionInput = {
    productId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    stock?: IntFieldUpdateOperationsInput | number
    width?: FloatFieldUpdateOperationsInput | number
    height?: FloatFieldUpdateOperationsInput | number
    cut?: BoolFieldUpdateOperationsInput | boolean
    productImage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection_name?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type productUncheckedUpdateWithoutCollectionInput = {
    productId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    stock?: IntFieldUpdateOperationsInput | number
    width?: FloatFieldUpdateOperationsInput | number
    height?: FloatFieldUpdateOperationsInput | number
    cut?: BoolFieldUpdateOperationsInput | boolean
    productImage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection_name?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type productUncheckedUpdateManyWithoutCollectionInput = {
    productId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    stock?: IntFieldUpdateOperationsInput | number
    width?: FloatFieldUpdateOperationsInput | number
    height?: FloatFieldUpdateOperationsInput | number
    cut?: BoolFieldUpdateOperationsInput | boolean
    productImage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection_name?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type priceListDetailCreateManyPriceListInput = {
    price_list_detail_id?: string
    collection_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type userPriceListCreateManyPriceListInput = {
    user_price_list_id?: string
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type priceListDetailUpdateWithoutPriceListInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    collection?: collectionUpdateOneRequiredWithoutPriceListDetailNestedInput
  }

  export type priceListDetailUncheckedUpdateWithoutPriceListInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    collection_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type priceListDetailUncheckedUpdateManyWithoutPriceListInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    collection_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type userPriceListUpdateWithoutPriceListInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: userUpdateOneRequiredWithoutUserPriceListNestedInput
  }

  export type userPriceListUncheckedUpdateWithoutPriceListInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type userPriceListUncheckedUpdateManyWithoutPriceListInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}