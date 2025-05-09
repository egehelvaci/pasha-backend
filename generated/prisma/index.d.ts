
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
 * Model UserType
 * 
 */
export type UserType = $Result.DefaultSelection<Prisma.$UserTypePayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Collection
 * 
 */
export type Collection = $Result.DefaultSelection<Prisma.$CollectionPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model PriceList
 * 
 */
export type PriceList = $Result.DefaultSelection<Prisma.$PriceListPayload>
/**
 * Model PriceListDetail
 * 
 */
export type PriceListDetail = $Result.DefaultSelection<Prisma.$PriceListDetailPayload>
/**
 * Model UserPriceList
 * 
 */
export type UserPriceList = $Result.DefaultSelection<Prisma.$UserPriceListPayload>

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
   * `prisma.userType`: Exposes CRUD operations for the **UserType** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTypes
    * const userTypes = await prisma.userType.findMany()
    * ```
    */
  get userType(): Prisma.UserTypeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.collection`: Exposes CRUD operations for the **Collection** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Collections
    * const collections = await prisma.collection.findMany()
    * ```
    */
  get collection(): Prisma.CollectionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.priceList`: Exposes CRUD operations for the **PriceList** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PriceLists
    * const priceLists = await prisma.priceList.findMany()
    * ```
    */
  get priceList(): Prisma.PriceListDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.priceListDetail`: Exposes CRUD operations for the **PriceListDetail** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PriceListDetails
    * const priceListDetails = await prisma.priceListDetail.findMany()
    * ```
    */
  get priceListDetail(): Prisma.PriceListDetailDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userPriceList`: Exposes CRUD operations for the **UserPriceList** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserPriceLists
    * const userPriceLists = await prisma.userPriceList.findMany()
    * ```
    */
  get userPriceList(): Prisma.UserPriceListDelegate<ExtArgs, ClientOptions>;
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
    UserType: 'UserType',
    User: 'User',
    Collection: 'Collection',
    Product: 'Product',
    PriceList: 'PriceList',
    PriceListDetail: 'PriceListDetail',
    UserPriceList: 'UserPriceList'
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
      UserType: {
        payload: Prisma.$UserTypePayload<ExtArgs>
        fields: Prisma.UserTypeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserTypeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserTypeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>
          }
          findFirst: {
            args: Prisma.UserTypeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserTypeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>
          }
          findMany: {
            args: Prisma.UserTypeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>[]
          }
          create: {
            args: Prisma.UserTypeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>
          }
          createMany: {
            args: Prisma.UserTypeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserTypeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>[]
          }
          delete: {
            args: Prisma.UserTypeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>
          }
          update: {
            args: Prisma.UserTypeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>
          }
          deleteMany: {
            args: Prisma.UserTypeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserTypeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserTypeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>[]
          }
          upsert: {
            args: Prisma.UserTypeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTypePayload>
          }
          aggregate: {
            args: Prisma.UserTypeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserType>
          }
          groupBy: {
            args: Prisma.UserTypeGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserTypeGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserTypeCountArgs<ExtArgs>
            result: $Utils.Optional<UserTypeCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Collection: {
        payload: Prisma.$CollectionPayload<ExtArgs>
        fields: Prisma.CollectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CollectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CollectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          findFirst: {
            args: Prisma.CollectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CollectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          findMany: {
            args: Prisma.CollectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>[]
          }
          create: {
            args: Prisma.CollectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          createMany: {
            args: Prisma.CollectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CollectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>[]
          }
          delete: {
            args: Prisma.CollectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          update: {
            args: Prisma.CollectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          deleteMany: {
            args: Prisma.CollectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CollectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CollectionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>[]
          }
          upsert: {
            args: Prisma.CollectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          aggregate: {
            args: Prisma.CollectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCollection>
          }
          groupBy: {
            args: Prisma.CollectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CollectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CollectionCountArgs<ExtArgs>
            result: $Utils.Optional<CollectionCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      PriceList: {
        payload: Prisma.$PriceListPayload<ExtArgs>
        fields: Prisma.PriceListFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PriceListFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PriceListFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>
          }
          findFirst: {
            args: Prisma.PriceListFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PriceListFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>
          }
          findMany: {
            args: Prisma.PriceListFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>[]
          }
          create: {
            args: Prisma.PriceListCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>
          }
          createMany: {
            args: Prisma.PriceListCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PriceListCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>[]
          }
          delete: {
            args: Prisma.PriceListDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>
          }
          update: {
            args: Prisma.PriceListUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>
          }
          deleteMany: {
            args: Prisma.PriceListDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PriceListUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PriceListUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>[]
          }
          upsert: {
            args: Prisma.PriceListUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListPayload>
          }
          aggregate: {
            args: Prisma.PriceListAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePriceList>
          }
          groupBy: {
            args: Prisma.PriceListGroupByArgs<ExtArgs>
            result: $Utils.Optional<PriceListGroupByOutputType>[]
          }
          count: {
            args: Prisma.PriceListCountArgs<ExtArgs>
            result: $Utils.Optional<PriceListCountAggregateOutputType> | number
          }
        }
      }
      PriceListDetail: {
        payload: Prisma.$PriceListDetailPayload<ExtArgs>
        fields: Prisma.PriceListDetailFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PriceListDetailFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PriceListDetailFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>
          }
          findFirst: {
            args: Prisma.PriceListDetailFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PriceListDetailFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>
          }
          findMany: {
            args: Prisma.PriceListDetailFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>[]
          }
          create: {
            args: Prisma.PriceListDetailCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>
          }
          createMany: {
            args: Prisma.PriceListDetailCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PriceListDetailCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>[]
          }
          delete: {
            args: Prisma.PriceListDetailDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>
          }
          update: {
            args: Prisma.PriceListDetailUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>
          }
          deleteMany: {
            args: Prisma.PriceListDetailDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PriceListDetailUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PriceListDetailUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>[]
          }
          upsert: {
            args: Prisma.PriceListDetailUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceListDetailPayload>
          }
          aggregate: {
            args: Prisma.PriceListDetailAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePriceListDetail>
          }
          groupBy: {
            args: Prisma.PriceListDetailGroupByArgs<ExtArgs>
            result: $Utils.Optional<PriceListDetailGroupByOutputType>[]
          }
          count: {
            args: Prisma.PriceListDetailCountArgs<ExtArgs>
            result: $Utils.Optional<PriceListDetailCountAggregateOutputType> | number
          }
        }
      }
      UserPriceList: {
        payload: Prisma.$UserPriceListPayload<ExtArgs>
        fields: Prisma.UserPriceListFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserPriceListFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserPriceListFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>
          }
          findFirst: {
            args: Prisma.UserPriceListFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserPriceListFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>
          }
          findMany: {
            args: Prisma.UserPriceListFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>[]
          }
          create: {
            args: Prisma.UserPriceListCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>
          }
          createMany: {
            args: Prisma.UserPriceListCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserPriceListCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>[]
          }
          delete: {
            args: Prisma.UserPriceListDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>
          }
          update: {
            args: Prisma.UserPriceListUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>
          }
          deleteMany: {
            args: Prisma.UserPriceListDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserPriceListUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserPriceListUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>[]
          }
          upsert: {
            args: Prisma.UserPriceListUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPriceListPayload>
          }
          aggregate: {
            args: Prisma.UserPriceListAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserPriceList>
          }
          groupBy: {
            args: Prisma.UserPriceListGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserPriceListGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserPriceListCountArgs<ExtArgs>
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
    userType?: UserTypeOmit
    user?: UserOmit
    collection?: CollectionOmit
    product?: ProductOmit
    priceList?: PriceListOmit
    priceListDetail?: PriceListDetailOmit
    userPriceList?: UserPriceListOmit
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
    where?: UserWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    UserPriceList: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserPriceList?: boolean | UserCountOutputTypeCountUserPriceListArgs
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
    where?: UserPriceListWhereInput
  }


  /**
   * Count Type CollectionCountOutputType
   */

  export type CollectionCountOutputType = {
    PriceListDetail: number
    products: number
  }

  export type CollectionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    PriceListDetail?: boolean | CollectionCountOutputTypeCountPriceListDetailArgs
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
    where?: PriceListDetailWhereInput
  }

  /**
   * CollectionCountOutputType without action
   */
  export type CollectionCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }


  /**
   * Count Type PriceListCountOutputType
   */

  export type PriceListCountOutputType = {
    PriceListDetail: number
    UserPriceList: number
  }

  export type PriceListCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    PriceListDetail?: boolean | PriceListCountOutputTypeCountPriceListDetailArgs
    UserPriceList?: boolean | PriceListCountOutputTypeCountUserPriceListArgs
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
    where?: PriceListDetailWhereInput
  }

  /**
   * PriceListCountOutputType without action
   */
  export type PriceListCountOutputTypeCountUserPriceListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPriceListWhereInput
  }


  /**
   * Models
   */

  /**
   * Model UserType
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
     * Filter which UserType to aggregate.
     */
    where?: UserTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTypes to fetch.
     */
    orderBy?: UserTypeOrderByWithRelationInput | UserTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserTypes
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




  export type UserTypeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTypeWhereInput
    orderBy?: UserTypeOrderByWithAggregationInput | UserTypeOrderByWithAggregationInput[]
    by: UserTypeScalarFieldEnum[] | UserTypeScalarFieldEnum
    having?: UserTypeScalarWhereWithAggregatesInput
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

  type GetUserTypeGroupByPayload<T extends UserTypeGroupByArgs> = Prisma.PrismaPromise<
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


  export type UserTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    users?: boolean | UserType$usersArgs<ExtArgs>
    _count?: boolean | UserTypeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userType"]>

  export type UserTypeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["userType"]>

  export type UserTypeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["userType"]>

  export type UserTypeSelectScalar = {
    id?: boolean
    name?: boolean
  }

  export type UserTypeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name", ExtArgs["result"]["userType"]>
  export type UserTypeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | UserType$usersArgs<ExtArgs>
    _count?: boolean | UserTypeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserTypeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserTypeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserTypePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserType"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
    }, ExtArgs["result"]["userType"]>
    composites: {}
  }

  type UserTypeGetPayload<S extends boolean | null | undefined | UserTypeDefaultArgs> = $Result.GetResult<Prisma.$UserTypePayload, S>

  type UserTypeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserTypeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserTypeCountAggregateInputType | true
    }

  export interface UserTypeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserType'], meta: { name: 'UserType' } }
    /**
     * Find zero or one UserType that matches the filter.
     * @param {UserTypeFindUniqueArgs} args - Arguments to find a UserType
     * @example
     * // Get one UserType
     * const userType = await prisma.userType.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserTypeFindUniqueArgs>(args: SelectSubset<T, UserTypeFindUniqueArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserType that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserTypeFindUniqueOrThrowArgs} args - Arguments to find a UserType
     * @example
     * // Get one UserType
     * const userType = await prisma.userType.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserTypeFindUniqueOrThrowArgs>(args: SelectSubset<T, UserTypeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserType that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTypeFindFirstArgs} args - Arguments to find a UserType
     * @example
     * // Get one UserType
     * const userType = await prisma.userType.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserTypeFindFirstArgs>(args?: SelectSubset<T, UserTypeFindFirstArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserType that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTypeFindFirstOrThrowArgs} args - Arguments to find a UserType
     * @example
     * // Get one UserType
     * const userType = await prisma.userType.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserTypeFindFirstOrThrowArgs>(args?: SelectSubset<T, UserTypeFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserTypes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTypeFindManyArgs} args - Arguments to filter and select certain fields only.
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
    findMany<T extends UserTypeFindManyArgs>(args?: SelectSubset<T, UserTypeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserType.
     * @param {UserTypeCreateArgs} args - Arguments to create a UserType.
     * @example
     * // Create one UserType
     * const UserType = await prisma.userType.create({
     *   data: {
     *     // ... data to create a UserType
     *   }
     * })
     * 
     */
    create<T extends UserTypeCreateArgs>(args: SelectSubset<T, UserTypeCreateArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserTypes.
     * @param {UserTypeCreateManyArgs} args - Arguments to create many UserTypes.
     * @example
     * // Create many UserTypes
     * const userType = await prisma.userType.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserTypeCreateManyArgs>(args?: SelectSubset<T, UserTypeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserTypes and returns the data saved in the database.
     * @param {UserTypeCreateManyAndReturnArgs} args - Arguments to create many UserTypes.
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
    createManyAndReturn<T extends UserTypeCreateManyAndReturnArgs>(args?: SelectSubset<T, UserTypeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserType.
     * @param {UserTypeDeleteArgs} args - Arguments to delete one UserType.
     * @example
     * // Delete one UserType
     * const UserType = await prisma.userType.delete({
     *   where: {
     *     // ... filter to delete one UserType
     *   }
     * })
     * 
     */
    delete<T extends UserTypeDeleteArgs>(args: SelectSubset<T, UserTypeDeleteArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserType.
     * @param {UserTypeUpdateArgs} args - Arguments to update one UserType.
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
    update<T extends UserTypeUpdateArgs>(args: SelectSubset<T, UserTypeUpdateArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserTypes.
     * @param {UserTypeDeleteManyArgs} args - Arguments to filter UserTypes to delete.
     * @example
     * // Delete a few UserTypes
     * const { count } = await prisma.userType.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserTypeDeleteManyArgs>(args?: SelectSubset<T, UserTypeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTypeUpdateManyArgs} args - Arguments to update one or more rows.
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
    updateMany<T extends UserTypeUpdateManyArgs>(args: SelectSubset<T, UserTypeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTypes and returns the data updated in the database.
     * @param {UserTypeUpdateManyAndReturnArgs} args - Arguments to update many UserTypes.
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
    updateManyAndReturn<T extends UserTypeUpdateManyAndReturnArgs>(args: SelectSubset<T, UserTypeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserType.
     * @param {UserTypeUpsertArgs} args - Arguments to update or create a UserType.
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
    upsert<T extends UserTypeUpsertArgs>(args: SelectSubset<T, UserTypeUpsertArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTypeCountArgs} args - Arguments to filter UserTypes to count.
     * @example
     * // Count the number of UserTypes
     * const count = await prisma.userType.count({
     *   where: {
     *     // ... the filter for the UserTypes we want to count
     *   }
     * })
    **/
    count<T extends UserTypeCountArgs>(
      args?: Subset<T, UserTypeCountArgs>,
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
     * @param {UserTypeGroupByArgs} args - Group by arguments.
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
      T extends UserTypeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserTypeGroupByArgs['orderBy'] }
        : { orderBy?: UserTypeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserTypeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserTypeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserType model
   */
  readonly fields: UserTypeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserType.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserTypeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends UserType$usersArgs<ExtArgs> = {}>(args?: Subset<T, UserType$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the UserType model
   */
  interface UserTypeFieldRefs {
    readonly id: FieldRef<"UserType", 'Int'>
    readonly name: FieldRef<"UserType", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserType findUnique
   */
  export type UserTypeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * Filter, which UserType to fetch.
     */
    where: UserTypeWhereUniqueInput
  }

  /**
   * UserType findUniqueOrThrow
   */
  export type UserTypeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * Filter, which UserType to fetch.
     */
    where: UserTypeWhereUniqueInput
  }

  /**
   * UserType findFirst
   */
  export type UserTypeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * Filter, which UserType to fetch.
     */
    where?: UserTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTypes to fetch.
     */
    orderBy?: UserTypeOrderByWithRelationInput | UserTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTypes.
     */
    cursor?: UserTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTypes.
     */
    distinct?: UserTypeScalarFieldEnum | UserTypeScalarFieldEnum[]
  }

  /**
   * UserType findFirstOrThrow
   */
  export type UserTypeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * Filter, which UserType to fetch.
     */
    where?: UserTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTypes to fetch.
     */
    orderBy?: UserTypeOrderByWithRelationInput | UserTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTypes.
     */
    cursor?: UserTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTypes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTypes.
     */
    distinct?: UserTypeScalarFieldEnum | UserTypeScalarFieldEnum[]
  }

  /**
   * UserType findMany
   */
  export type UserTypeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * Filter, which UserTypes to fetch.
     */
    where?: UserTypeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTypes to fetch.
     */
    orderBy?: UserTypeOrderByWithRelationInput | UserTypeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserTypes.
     */
    cursor?: UserTypeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTypes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTypes.
     */
    skip?: number
    distinct?: UserTypeScalarFieldEnum | UserTypeScalarFieldEnum[]
  }

  /**
   * UserType create
   */
  export type UserTypeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * The data needed to create a UserType.
     */
    data: XOR<UserTypeCreateInput, UserTypeUncheckedCreateInput>
  }

  /**
   * UserType createMany
   */
  export type UserTypeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserTypes.
     */
    data: UserTypeCreateManyInput | UserTypeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserType createManyAndReturn
   */
  export type UserTypeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * The data used to create many UserTypes.
     */
    data: UserTypeCreateManyInput | UserTypeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserType update
   */
  export type UserTypeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * The data needed to update a UserType.
     */
    data: XOR<UserTypeUpdateInput, UserTypeUncheckedUpdateInput>
    /**
     * Choose, which UserType to update.
     */
    where: UserTypeWhereUniqueInput
  }

  /**
   * UserType updateMany
   */
  export type UserTypeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserTypes.
     */
    data: XOR<UserTypeUpdateManyMutationInput, UserTypeUncheckedUpdateManyInput>
    /**
     * Filter which UserTypes to update
     */
    where?: UserTypeWhereInput
    /**
     * Limit how many UserTypes to update.
     */
    limit?: number
  }

  /**
   * UserType updateManyAndReturn
   */
  export type UserTypeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * The data used to update UserTypes.
     */
    data: XOR<UserTypeUpdateManyMutationInput, UserTypeUncheckedUpdateManyInput>
    /**
     * Filter which UserTypes to update
     */
    where?: UserTypeWhereInput
    /**
     * Limit how many UserTypes to update.
     */
    limit?: number
  }

  /**
   * UserType upsert
   */
  export type UserTypeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * The filter to search for the UserType to update in case it exists.
     */
    where: UserTypeWhereUniqueInput
    /**
     * In case the UserType found by the `where` argument doesn't exist, create a new UserType with this data.
     */
    create: XOR<UserTypeCreateInput, UserTypeUncheckedCreateInput>
    /**
     * In case the UserType was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserTypeUpdateInput, UserTypeUncheckedUpdateInput>
  }

  /**
   * UserType delete
   */
  export type UserTypeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
    /**
     * Filter which UserType to delete.
     */
    where: UserTypeWhereUniqueInput
  }

  /**
   * UserType deleteMany
   */
  export type UserTypeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTypes to delete
     */
    where?: UserTypeWhereInput
    /**
     * Limit how many UserTypes to delete.
     */
    limit?: number
  }

  /**
   * UserType.users
   */
  export type UserType$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * UserType without action
   */
  export type UserTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserType
     */
    select?: UserTypeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserType
     */
    omit?: UserTypeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTypeInclude<ExtArgs> | null
  }


  /**
   * Model User
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
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
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




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
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

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
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


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    userType?: boolean | UserTypeDefaultArgs<ExtArgs>
    UserPriceList?: boolean | User$UserPriceListArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    userType?: boolean | UserTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    userType?: boolean | UserTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
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

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"email" | "name" | "createdAt" | "credit" | "debit" | "isActive" | "password" | "phoneNumber" | "surname" | "userId" | "username" | "userTypeId", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userType?: boolean | UserTypeDefaultArgs<ExtArgs>
    UserPriceList?: boolean | User$UserPriceListArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userType?: boolean | UserTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userType?: boolean | UserTypeDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      userType: Prisma.$UserTypePayload<ExtArgs>
      UserPriceList: Prisma.$UserPriceListPayload<ExtArgs>[]
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

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
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
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
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
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
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
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
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
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
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
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
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
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
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
     * @param {UserGroupByArgs} args - Group by arguments.
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
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    userType<T extends UserTypeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserTypeDefaultArgs<ExtArgs>>): Prisma__UserTypeClient<$Result.GetResult<Prisma.$UserTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    UserPriceList<T extends User$UserPriceListArgs<ExtArgs> = {}>(args?: Subset<T, User$UserPriceListArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly credit: FieldRef<"User", 'Decimal'>
    readonly debit: FieldRef<"User", 'Decimal'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly password: FieldRef<"User", 'String'>
    readonly phoneNumber: FieldRef<"User", 'String'>
    readonly surname: FieldRef<"User", 'String'>
    readonly userId: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly userTypeId: FieldRef<"User", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.UserPriceList
   */
  export type User$UserPriceListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    where?: UserPriceListWhereInput
    orderBy?: UserPriceListOrderByWithRelationInput | UserPriceListOrderByWithRelationInput[]
    cursor?: UserPriceListWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Collection
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
     * Filter which Collection to aggregate.
     */
    where?: CollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Collections to fetch.
     */
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Collections
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




  export type CollectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CollectionWhereInput
    orderBy?: CollectionOrderByWithAggregationInput | CollectionOrderByWithAggregationInput[]
    by: CollectionScalarFieldEnum[] | CollectionScalarFieldEnum
    having?: CollectionScalarWhereWithAggregatesInput
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

  type GetCollectionGroupByPayload<T extends CollectionGroupByArgs> = Prisma.PrismaPromise<
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


  export type CollectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    collectionId?: boolean
    name?: boolean
    description?: boolean
    code?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    PriceListDetail?: boolean | Collection$PriceListDetailArgs<ExtArgs>
    products?: boolean | Collection$productsArgs<ExtArgs>
    _count?: boolean | CollectionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["collection"]>

  export type CollectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    collectionId?: boolean
    name?: boolean
    description?: boolean
    code?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["collection"]>

  export type CollectionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    collectionId?: boolean
    name?: boolean
    description?: boolean
    code?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["collection"]>

  export type CollectionSelectScalar = {
    collectionId?: boolean
    name?: boolean
    description?: boolean
    code?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CollectionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"collectionId" | "name" | "description" | "code" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["collection"]>
  export type CollectionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    PriceListDetail?: boolean | Collection$PriceListDetailArgs<ExtArgs>
    products?: boolean | Collection$productsArgs<ExtArgs>
    _count?: boolean | CollectionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CollectionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CollectionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CollectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Collection"
    objects: {
      PriceListDetail: Prisma.$PriceListDetailPayload<ExtArgs>[]
      products: Prisma.$ProductPayload<ExtArgs>[]
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

  type CollectionGetPayload<S extends boolean | null | undefined | CollectionDefaultArgs> = $Result.GetResult<Prisma.$CollectionPayload, S>

  type CollectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CollectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CollectionCountAggregateInputType | true
    }

  export interface CollectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Collection'], meta: { name: 'Collection' } }
    /**
     * Find zero or one Collection that matches the filter.
     * @param {CollectionFindUniqueArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CollectionFindUniqueArgs>(args: SelectSubset<T, CollectionFindUniqueArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Collection that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CollectionFindUniqueOrThrowArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CollectionFindUniqueOrThrowArgs>(args: SelectSubset<T, CollectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Collection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionFindFirstArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CollectionFindFirstArgs>(args?: SelectSubset<T, CollectionFindFirstArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Collection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionFindFirstOrThrowArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CollectionFindFirstOrThrowArgs>(args?: SelectSubset<T, CollectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Collections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionFindManyArgs} args - Arguments to filter and select certain fields only.
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
    findMany<T extends CollectionFindManyArgs>(args?: SelectSubset<T, CollectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Collection.
     * @param {CollectionCreateArgs} args - Arguments to create a Collection.
     * @example
     * // Create one Collection
     * const Collection = await prisma.collection.create({
     *   data: {
     *     // ... data to create a Collection
     *   }
     * })
     * 
     */
    create<T extends CollectionCreateArgs>(args: SelectSubset<T, CollectionCreateArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Collections.
     * @param {CollectionCreateManyArgs} args - Arguments to create many Collections.
     * @example
     * // Create many Collections
     * const collection = await prisma.collection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CollectionCreateManyArgs>(args?: SelectSubset<T, CollectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Collections and returns the data saved in the database.
     * @param {CollectionCreateManyAndReturnArgs} args - Arguments to create many Collections.
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
    createManyAndReturn<T extends CollectionCreateManyAndReturnArgs>(args?: SelectSubset<T, CollectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Collection.
     * @param {CollectionDeleteArgs} args - Arguments to delete one Collection.
     * @example
     * // Delete one Collection
     * const Collection = await prisma.collection.delete({
     *   where: {
     *     // ... filter to delete one Collection
     *   }
     * })
     * 
     */
    delete<T extends CollectionDeleteArgs>(args: SelectSubset<T, CollectionDeleteArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Collection.
     * @param {CollectionUpdateArgs} args - Arguments to update one Collection.
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
    update<T extends CollectionUpdateArgs>(args: SelectSubset<T, CollectionUpdateArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Collections.
     * @param {CollectionDeleteManyArgs} args - Arguments to filter Collections to delete.
     * @example
     * // Delete a few Collections
     * const { count } = await prisma.collection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CollectionDeleteManyArgs>(args?: SelectSubset<T, CollectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Collections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionUpdateManyArgs} args - Arguments to update one or more rows.
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
    updateMany<T extends CollectionUpdateManyArgs>(args: SelectSubset<T, CollectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Collections and returns the data updated in the database.
     * @param {CollectionUpdateManyAndReturnArgs} args - Arguments to update many Collections.
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
    updateManyAndReturn<T extends CollectionUpdateManyAndReturnArgs>(args: SelectSubset<T, CollectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Collection.
     * @param {CollectionUpsertArgs} args - Arguments to update or create a Collection.
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
    upsert<T extends CollectionUpsertArgs>(args: SelectSubset<T, CollectionUpsertArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Collections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionCountArgs} args - Arguments to filter Collections to count.
     * @example
     * // Count the number of Collections
     * const count = await prisma.collection.count({
     *   where: {
     *     // ... the filter for the Collections we want to count
     *   }
     * })
    **/
    count<T extends CollectionCountArgs>(
      args?: Subset<T, CollectionCountArgs>,
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
     * @param {CollectionGroupByArgs} args - Group by arguments.
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
      T extends CollectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CollectionGroupByArgs['orderBy'] }
        : { orderBy?: CollectionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CollectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCollectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Collection model
   */
  readonly fields: CollectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Collection.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CollectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    PriceListDetail<T extends Collection$PriceListDetailArgs<ExtArgs> = {}>(args?: Subset<T, Collection$PriceListDetailArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    products<T extends Collection$productsArgs<ExtArgs> = {}>(args?: Subset<T, Collection$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Collection model
   */
  interface CollectionFieldRefs {
    readonly collectionId: FieldRef<"Collection", 'String'>
    readonly name: FieldRef<"Collection", 'String'>
    readonly description: FieldRef<"Collection", 'String'>
    readonly code: FieldRef<"Collection", 'String'>
    readonly isActive: FieldRef<"Collection", 'Boolean'>
    readonly createdAt: FieldRef<"Collection", 'DateTime'>
    readonly updatedAt: FieldRef<"Collection", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Collection findUnique
   */
  export type CollectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collection to fetch.
     */
    where: CollectionWhereUniqueInput
  }

  /**
   * Collection findUniqueOrThrow
   */
  export type CollectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collection to fetch.
     */
    where: CollectionWhereUniqueInput
  }

  /**
   * Collection findFirst
   */
  export type CollectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collection to fetch.
     */
    where?: CollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Collections to fetch.
     */
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Collections.
     */
    cursor?: CollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Collections.
     */
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * Collection findFirstOrThrow
   */
  export type CollectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collection to fetch.
     */
    where?: CollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Collections to fetch.
     */
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Collections.
     */
    cursor?: CollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Collections.
     */
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * Collection findMany
   */
  export type CollectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collections to fetch.
     */
    where?: CollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Collections to fetch.
     */
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Collections.
     */
    cursor?: CollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Collections.
     */
    skip?: number
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * Collection create
   */
  export type CollectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * The data needed to create a Collection.
     */
    data: XOR<CollectionCreateInput, CollectionUncheckedCreateInput>
  }

  /**
   * Collection createMany
   */
  export type CollectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Collections.
     */
    data: CollectionCreateManyInput | CollectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Collection createManyAndReturn
   */
  export type CollectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * The data used to create many Collections.
     */
    data: CollectionCreateManyInput | CollectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Collection update
   */
  export type CollectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * The data needed to update a Collection.
     */
    data: XOR<CollectionUpdateInput, CollectionUncheckedUpdateInput>
    /**
     * Choose, which Collection to update.
     */
    where: CollectionWhereUniqueInput
  }

  /**
   * Collection updateMany
   */
  export type CollectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Collections.
     */
    data: XOR<CollectionUpdateManyMutationInput, CollectionUncheckedUpdateManyInput>
    /**
     * Filter which Collections to update
     */
    where?: CollectionWhereInput
    /**
     * Limit how many Collections to update.
     */
    limit?: number
  }

  /**
   * Collection updateManyAndReturn
   */
  export type CollectionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * The data used to update Collections.
     */
    data: XOR<CollectionUpdateManyMutationInput, CollectionUncheckedUpdateManyInput>
    /**
     * Filter which Collections to update
     */
    where?: CollectionWhereInput
    /**
     * Limit how many Collections to update.
     */
    limit?: number
  }

  /**
   * Collection upsert
   */
  export type CollectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * The filter to search for the Collection to update in case it exists.
     */
    where: CollectionWhereUniqueInput
    /**
     * In case the Collection found by the `where` argument doesn't exist, create a new Collection with this data.
     */
    create: XOR<CollectionCreateInput, CollectionUncheckedCreateInput>
    /**
     * In case the Collection was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CollectionUpdateInput, CollectionUncheckedUpdateInput>
  }

  /**
   * Collection delete
   */
  export type CollectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter which Collection to delete.
     */
    where: CollectionWhereUniqueInput
  }

  /**
   * Collection deleteMany
   */
  export type CollectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Collections to delete
     */
    where?: CollectionWhereInput
    /**
     * Limit how many Collections to delete.
     */
    limit?: number
  }

  /**
   * Collection.PriceListDetail
   */
  export type Collection$PriceListDetailArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    where?: PriceListDetailWhereInput
    orderBy?: PriceListDetailOrderByWithRelationInput | PriceListDetailOrderByWithRelationInput[]
    cursor?: PriceListDetailWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * Collection.products
   */
  export type Collection$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Collection without action
   */
  export type CollectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
  }


  /**
   * Model Product
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
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
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




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
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

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
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


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
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

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"productId" | "name" | "description" | "stock" | "width" | "height" | "cut" | "productImage" | "collectionId" | "createdAt" | "updatedAt" | "collection_name", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }
  export type ProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      collection: Prisma.$CollectionPayload<ExtArgs>
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

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
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
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
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
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
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
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
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
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
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
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
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
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
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
     * @param {ProductGroupByArgs} args - Group by arguments.
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
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    collection<T extends CollectionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CollectionDefaultArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly productId: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly description: FieldRef<"Product", 'String'>
    readonly stock: FieldRef<"Product", 'Int'>
    readonly width: FieldRef<"Product", 'Float'>
    readonly height: FieldRef<"Product", 'Float'>
    readonly cut: FieldRef<"Product", 'Boolean'>
    readonly productImage: FieldRef<"Product", 'String'>
    readonly collectionId: FieldRef<"Product", 'String'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
    readonly collection_name: FieldRef<"Product", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model PriceList
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
     * Filter which PriceList to aggregate.
     */
    where?: PriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceLists to fetch.
     */
    orderBy?: PriceListOrderByWithRelationInput | PriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PriceLists
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




  export type PriceListGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PriceListWhereInput
    orderBy?: PriceListOrderByWithAggregationInput | PriceListOrderByWithAggregationInput[]
    by: PriceListScalarFieldEnum[] | PriceListScalarFieldEnum
    having?: PriceListScalarWhereWithAggregatesInput
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

  type GetPriceListGroupByPayload<T extends PriceListGroupByArgs> = Prisma.PrismaPromise<
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


  export type PriceListSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    PriceListDetail?: boolean | PriceList$PriceListDetailArgs<ExtArgs>
    UserPriceList?: boolean | PriceList$UserPriceListArgs<ExtArgs>
    _count?: boolean | PriceListCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceList"]>

  export type PriceListSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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

  export type PriceListSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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

  export type PriceListSelectScalar = {
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

  export type PriceListOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"price_list_id" | "name" | "description" | "is_default" | "valid_from" | "valid_to" | "limit_amount" | "currency" | "is_active" | "created_at" | "updated_at", ExtArgs["result"]["priceList"]>
  export type PriceListInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    PriceListDetail?: boolean | PriceList$PriceListDetailArgs<ExtArgs>
    UserPriceList?: boolean | PriceList$UserPriceListArgs<ExtArgs>
    _count?: boolean | PriceListCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PriceListIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PriceListIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PriceListPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PriceList"
    objects: {
      PriceListDetail: Prisma.$PriceListDetailPayload<ExtArgs>[]
      UserPriceList: Prisma.$UserPriceListPayload<ExtArgs>[]
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

  type PriceListGetPayload<S extends boolean | null | undefined | PriceListDefaultArgs> = $Result.GetResult<Prisma.$PriceListPayload, S>

  type PriceListCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PriceListFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PriceListCountAggregateInputType | true
    }

  export interface PriceListDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PriceList'], meta: { name: 'PriceList' } }
    /**
     * Find zero or one PriceList that matches the filter.
     * @param {PriceListFindUniqueArgs} args - Arguments to find a PriceList
     * @example
     * // Get one PriceList
     * const priceList = await prisma.priceList.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PriceListFindUniqueArgs>(args: SelectSubset<T, PriceListFindUniqueArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PriceList that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PriceListFindUniqueOrThrowArgs} args - Arguments to find a PriceList
     * @example
     * // Get one PriceList
     * const priceList = await prisma.priceList.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PriceListFindUniqueOrThrowArgs>(args: SelectSubset<T, PriceListFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceList that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListFindFirstArgs} args - Arguments to find a PriceList
     * @example
     * // Get one PriceList
     * const priceList = await prisma.priceList.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PriceListFindFirstArgs>(args?: SelectSubset<T, PriceListFindFirstArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceList that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListFindFirstOrThrowArgs} args - Arguments to find a PriceList
     * @example
     * // Get one PriceList
     * const priceList = await prisma.priceList.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PriceListFindFirstOrThrowArgs>(args?: SelectSubset<T, PriceListFindFirstOrThrowArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PriceLists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListFindManyArgs} args - Arguments to filter and select certain fields only.
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
    findMany<T extends PriceListFindManyArgs>(args?: SelectSubset<T, PriceListFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PriceList.
     * @param {PriceListCreateArgs} args - Arguments to create a PriceList.
     * @example
     * // Create one PriceList
     * const PriceList = await prisma.priceList.create({
     *   data: {
     *     // ... data to create a PriceList
     *   }
     * })
     * 
     */
    create<T extends PriceListCreateArgs>(args: SelectSubset<T, PriceListCreateArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PriceLists.
     * @param {PriceListCreateManyArgs} args - Arguments to create many PriceLists.
     * @example
     * // Create many PriceLists
     * const priceList = await prisma.priceList.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PriceListCreateManyArgs>(args?: SelectSubset<T, PriceListCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PriceLists and returns the data saved in the database.
     * @param {PriceListCreateManyAndReturnArgs} args - Arguments to create many PriceLists.
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
    createManyAndReturn<T extends PriceListCreateManyAndReturnArgs>(args?: SelectSubset<T, PriceListCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PriceList.
     * @param {PriceListDeleteArgs} args - Arguments to delete one PriceList.
     * @example
     * // Delete one PriceList
     * const PriceList = await prisma.priceList.delete({
     *   where: {
     *     // ... filter to delete one PriceList
     *   }
     * })
     * 
     */
    delete<T extends PriceListDeleteArgs>(args: SelectSubset<T, PriceListDeleteArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PriceList.
     * @param {PriceListUpdateArgs} args - Arguments to update one PriceList.
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
    update<T extends PriceListUpdateArgs>(args: SelectSubset<T, PriceListUpdateArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PriceLists.
     * @param {PriceListDeleteManyArgs} args - Arguments to filter PriceLists to delete.
     * @example
     * // Delete a few PriceLists
     * const { count } = await prisma.priceList.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PriceListDeleteManyArgs>(args?: SelectSubset<T, PriceListDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListUpdateManyArgs} args - Arguments to update one or more rows.
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
    updateMany<T extends PriceListUpdateManyArgs>(args: SelectSubset<T, PriceListUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceLists and returns the data updated in the database.
     * @param {PriceListUpdateManyAndReturnArgs} args - Arguments to update many PriceLists.
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
    updateManyAndReturn<T extends PriceListUpdateManyAndReturnArgs>(args: SelectSubset<T, PriceListUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PriceList.
     * @param {PriceListUpsertArgs} args - Arguments to update or create a PriceList.
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
    upsert<T extends PriceListUpsertArgs>(args: SelectSubset<T, PriceListUpsertArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PriceLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListCountArgs} args - Arguments to filter PriceLists to count.
     * @example
     * // Count the number of PriceLists
     * const count = await prisma.priceList.count({
     *   where: {
     *     // ... the filter for the PriceLists we want to count
     *   }
     * })
    **/
    count<T extends PriceListCountArgs>(
      args?: Subset<T, PriceListCountArgs>,
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
     * @param {PriceListGroupByArgs} args - Group by arguments.
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
      T extends PriceListGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PriceListGroupByArgs['orderBy'] }
        : { orderBy?: PriceListGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PriceListGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPriceListGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PriceList model
   */
  readonly fields: PriceListFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PriceList.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PriceListClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    PriceListDetail<T extends PriceList$PriceListDetailArgs<ExtArgs> = {}>(args?: Subset<T, PriceList$PriceListDetailArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    UserPriceList<T extends PriceList$UserPriceListArgs<ExtArgs> = {}>(args?: Subset<T, PriceList$UserPriceListArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the PriceList model
   */
  interface PriceListFieldRefs {
    readonly price_list_id: FieldRef<"PriceList", 'String'>
    readonly name: FieldRef<"PriceList", 'String'>
    readonly description: FieldRef<"PriceList", 'String'>
    readonly is_default: FieldRef<"PriceList", 'Boolean'>
    readonly valid_from: FieldRef<"PriceList", 'DateTime'>
    readonly valid_to: FieldRef<"PriceList", 'DateTime'>
    readonly limit_amount: FieldRef<"PriceList", 'Decimal'>
    readonly currency: FieldRef<"PriceList", 'String'>
    readonly is_active: FieldRef<"PriceList", 'Boolean'>
    readonly created_at: FieldRef<"PriceList", 'DateTime'>
    readonly updated_at: FieldRef<"PriceList", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PriceList findUnique
   */
  export type PriceListFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * Filter, which PriceList to fetch.
     */
    where: PriceListWhereUniqueInput
  }

  /**
   * PriceList findUniqueOrThrow
   */
  export type PriceListFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * Filter, which PriceList to fetch.
     */
    where: PriceListWhereUniqueInput
  }

  /**
   * PriceList findFirst
   */
  export type PriceListFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * Filter, which PriceList to fetch.
     */
    where?: PriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceLists to fetch.
     */
    orderBy?: PriceListOrderByWithRelationInput | PriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PriceLists.
     */
    cursor?: PriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PriceLists.
     */
    distinct?: PriceListScalarFieldEnum | PriceListScalarFieldEnum[]
  }

  /**
   * PriceList findFirstOrThrow
   */
  export type PriceListFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * Filter, which PriceList to fetch.
     */
    where?: PriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceLists to fetch.
     */
    orderBy?: PriceListOrderByWithRelationInput | PriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PriceLists.
     */
    cursor?: PriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PriceLists.
     */
    distinct?: PriceListScalarFieldEnum | PriceListScalarFieldEnum[]
  }

  /**
   * PriceList findMany
   */
  export type PriceListFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * Filter, which PriceLists to fetch.
     */
    where?: PriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceLists to fetch.
     */
    orderBy?: PriceListOrderByWithRelationInput | PriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PriceLists.
     */
    cursor?: PriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceLists.
     */
    skip?: number
    distinct?: PriceListScalarFieldEnum | PriceListScalarFieldEnum[]
  }

  /**
   * PriceList create
   */
  export type PriceListCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * The data needed to create a PriceList.
     */
    data: XOR<PriceListCreateInput, PriceListUncheckedCreateInput>
  }

  /**
   * PriceList createMany
   */
  export type PriceListCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PriceLists.
     */
    data: PriceListCreateManyInput | PriceListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PriceList createManyAndReturn
   */
  export type PriceListCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * The data used to create many PriceLists.
     */
    data: PriceListCreateManyInput | PriceListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PriceList update
   */
  export type PriceListUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * The data needed to update a PriceList.
     */
    data: XOR<PriceListUpdateInput, PriceListUncheckedUpdateInput>
    /**
     * Choose, which PriceList to update.
     */
    where: PriceListWhereUniqueInput
  }

  /**
   * PriceList updateMany
   */
  export type PriceListUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PriceLists.
     */
    data: XOR<PriceListUpdateManyMutationInput, PriceListUncheckedUpdateManyInput>
    /**
     * Filter which PriceLists to update
     */
    where?: PriceListWhereInput
    /**
     * Limit how many PriceLists to update.
     */
    limit?: number
  }

  /**
   * PriceList updateManyAndReturn
   */
  export type PriceListUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * The data used to update PriceLists.
     */
    data: XOR<PriceListUpdateManyMutationInput, PriceListUncheckedUpdateManyInput>
    /**
     * Filter which PriceLists to update
     */
    where?: PriceListWhereInput
    /**
     * Limit how many PriceLists to update.
     */
    limit?: number
  }

  /**
   * PriceList upsert
   */
  export type PriceListUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * The filter to search for the PriceList to update in case it exists.
     */
    where: PriceListWhereUniqueInput
    /**
     * In case the PriceList found by the `where` argument doesn't exist, create a new PriceList with this data.
     */
    create: XOR<PriceListCreateInput, PriceListUncheckedCreateInput>
    /**
     * In case the PriceList was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PriceListUpdateInput, PriceListUncheckedUpdateInput>
  }

  /**
   * PriceList delete
   */
  export type PriceListDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
    /**
     * Filter which PriceList to delete.
     */
    where: PriceListWhereUniqueInput
  }

  /**
   * PriceList deleteMany
   */
  export type PriceListDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PriceLists to delete
     */
    where?: PriceListWhereInput
    /**
     * Limit how many PriceLists to delete.
     */
    limit?: number
  }

  /**
   * PriceList.PriceListDetail
   */
  export type PriceList$PriceListDetailArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    where?: PriceListDetailWhereInput
    orderBy?: PriceListDetailOrderByWithRelationInput | PriceListDetailOrderByWithRelationInput[]
    cursor?: PriceListDetailWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * PriceList.UserPriceList
   */
  export type PriceList$UserPriceListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    where?: UserPriceListWhereInput
    orderBy?: UserPriceListOrderByWithRelationInput | UserPriceListOrderByWithRelationInput[]
    cursor?: UserPriceListWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * PriceList without action
   */
  export type PriceListDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceList
     */
    select?: PriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceList
     */
    omit?: PriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListInclude<ExtArgs> | null
  }


  /**
   * Model PriceListDetail
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
     * Filter which PriceListDetail to aggregate.
     */
    where?: PriceListDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceListDetails to fetch.
     */
    orderBy?: PriceListDetailOrderByWithRelationInput | PriceListDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PriceListDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceListDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceListDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PriceListDetails
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




  export type PriceListDetailGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PriceListDetailWhereInput
    orderBy?: PriceListDetailOrderByWithAggregationInput | PriceListDetailOrderByWithAggregationInput[]
    by: PriceListDetailScalarFieldEnum[] | PriceListDetailScalarFieldEnum
    having?: PriceListDetailScalarWhereWithAggregatesInput
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

  type GetPriceListDetailGroupByPayload<T extends PriceListDetailGroupByArgs> = Prisma.PrismaPromise<
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


  export type PriceListDetailSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_detail_id?: boolean
    price_list_id?: boolean
    collection_id?: boolean
    price_per_square_meter?: boolean
    created_at?: boolean
    updated_at?: boolean
    Collection?: boolean | CollectionDefaultArgs<ExtArgs>
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceListDetail"]>

  export type PriceListDetailSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_detail_id?: boolean
    price_list_id?: boolean
    collection_id?: boolean
    price_per_square_meter?: boolean
    created_at?: boolean
    updated_at?: boolean
    Collection?: boolean | CollectionDefaultArgs<ExtArgs>
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceListDetail"]>

  export type PriceListDetailSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    price_list_detail_id?: boolean
    price_list_id?: boolean
    collection_id?: boolean
    price_per_square_meter?: boolean
    created_at?: boolean
    updated_at?: boolean
    Collection?: boolean | CollectionDefaultArgs<ExtArgs>
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceListDetail"]>

  export type PriceListDetailSelectScalar = {
    price_list_detail_id?: boolean
    price_list_id?: boolean
    collection_id?: boolean
    price_per_square_meter?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type PriceListDetailOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"price_list_detail_id" | "price_list_id" | "collection_id" | "price_per_square_meter" | "created_at" | "updated_at", ExtArgs["result"]["priceListDetail"]>
  export type PriceListDetailInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Collection?: boolean | CollectionDefaultArgs<ExtArgs>
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
  }
  export type PriceListDetailIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Collection?: boolean | CollectionDefaultArgs<ExtArgs>
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
  }
  export type PriceListDetailIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Collection?: boolean | CollectionDefaultArgs<ExtArgs>
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
  }

  export type $PriceListDetailPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PriceListDetail"
    objects: {
      Collection: Prisma.$CollectionPayload<ExtArgs>
      PriceList: Prisma.$PriceListPayload<ExtArgs>
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

  type PriceListDetailGetPayload<S extends boolean | null | undefined | PriceListDetailDefaultArgs> = $Result.GetResult<Prisma.$PriceListDetailPayload, S>

  type PriceListDetailCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PriceListDetailFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PriceListDetailCountAggregateInputType | true
    }

  export interface PriceListDetailDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PriceListDetail'], meta: { name: 'PriceListDetail' } }
    /**
     * Find zero or one PriceListDetail that matches the filter.
     * @param {PriceListDetailFindUniqueArgs} args - Arguments to find a PriceListDetail
     * @example
     * // Get one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PriceListDetailFindUniqueArgs>(args: SelectSubset<T, PriceListDetailFindUniqueArgs<ExtArgs>>): Prisma__PriceListDetailClient<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PriceListDetail that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PriceListDetailFindUniqueOrThrowArgs} args - Arguments to find a PriceListDetail
     * @example
     * // Get one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PriceListDetailFindUniqueOrThrowArgs>(args: SelectSubset<T, PriceListDetailFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PriceListDetailClient<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceListDetail that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListDetailFindFirstArgs} args - Arguments to find a PriceListDetail
     * @example
     * // Get one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PriceListDetailFindFirstArgs>(args?: SelectSubset<T, PriceListDetailFindFirstArgs<ExtArgs>>): Prisma__PriceListDetailClient<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceListDetail that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListDetailFindFirstOrThrowArgs} args - Arguments to find a PriceListDetail
     * @example
     * // Get one PriceListDetail
     * const priceListDetail = await prisma.priceListDetail.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PriceListDetailFindFirstOrThrowArgs>(args?: SelectSubset<T, PriceListDetailFindFirstOrThrowArgs<ExtArgs>>): Prisma__PriceListDetailClient<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PriceListDetails that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListDetailFindManyArgs} args - Arguments to filter and select certain fields only.
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
    findMany<T extends PriceListDetailFindManyArgs>(args?: SelectSubset<T, PriceListDetailFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PriceListDetail.
     * @param {PriceListDetailCreateArgs} args - Arguments to create a PriceListDetail.
     * @example
     * // Create one PriceListDetail
     * const PriceListDetail = await prisma.priceListDetail.create({
     *   data: {
     *     // ... data to create a PriceListDetail
     *   }
     * })
     * 
     */
    create<T extends PriceListDetailCreateArgs>(args: SelectSubset<T, PriceListDetailCreateArgs<ExtArgs>>): Prisma__PriceListDetailClient<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PriceListDetails.
     * @param {PriceListDetailCreateManyArgs} args - Arguments to create many PriceListDetails.
     * @example
     * // Create many PriceListDetails
     * const priceListDetail = await prisma.priceListDetail.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PriceListDetailCreateManyArgs>(args?: SelectSubset<T, PriceListDetailCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PriceListDetails and returns the data saved in the database.
     * @param {PriceListDetailCreateManyAndReturnArgs} args - Arguments to create many PriceListDetails.
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
    createManyAndReturn<T extends PriceListDetailCreateManyAndReturnArgs>(args?: SelectSubset<T, PriceListDetailCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PriceListDetail.
     * @param {PriceListDetailDeleteArgs} args - Arguments to delete one PriceListDetail.
     * @example
     * // Delete one PriceListDetail
     * const PriceListDetail = await prisma.priceListDetail.delete({
     *   where: {
     *     // ... filter to delete one PriceListDetail
     *   }
     * })
     * 
     */
    delete<T extends PriceListDetailDeleteArgs>(args: SelectSubset<T, PriceListDetailDeleteArgs<ExtArgs>>): Prisma__PriceListDetailClient<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PriceListDetail.
     * @param {PriceListDetailUpdateArgs} args - Arguments to update one PriceListDetail.
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
    update<T extends PriceListDetailUpdateArgs>(args: SelectSubset<T, PriceListDetailUpdateArgs<ExtArgs>>): Prisma__PriceListDetailClient<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PriceListDetails.
     * @param {PriceListDetailDeleteManyArgs} args - Arguments to filter PriceListDetails to delete.
     * @example
     * // Delete a few PriceListDetails
     * const { count } = await prisma.priceListDetail.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PriceListDetailDeleteManyArgs>(args?: SelectSubset<T, PriceListDetailDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceListDetails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListDetailUpdateManyArgs} args - Arguments to update one or more rows.
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
    updateMany<T extends PriceListDetailUpdateManyArgs>(args: SelectSubset<T, PriceListDetailUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceListDetails and returns the data updated in the database.
     * @param {PriceListDetailUpdateManyAndReturnArgs} args - Arguments to update many PriceListDetails.
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
    updateManyAndReturn<T extends PriceListDetailUpdateManyAndReturnArgs>(args: SelectSubset<T, PriceListDetailUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PriceListDetail.
     * @param {PriceListDetailUpsertArgs} args - Arguments to update or create a PriceListDetail.
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
    upsert<T extends PriceListDetailUpsertArgs>(args: SelectSubset<T, PriceListDetailUpsertArgs<ExtArgs>>): Prisma__PriceListDetailClient<$Result.GetResult<Prisma.$PriceListDetailPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PriceListDetails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceListDetailCountArgs} args - Arguments to filter PriceListDetails to count.
     * @example
     * // Count the number of PriceListDetails
     * const count = await prisma.priceListDetail.count({
     *   where: {
     *     // ... the filter for the PriceListDetails we want to count
     *   }
     * })
    **/
    count<T extends PriceListDetailCountArgs>(
      args?: Subset<T, PriceListDetailCountArgs>,
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
     * @param {PriceListDetailGroupByArgs} args - Group by arguments.
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
      T extends PriceListDetailGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PriceListDetailGroupByArgs['orderBy'] }
        : { orderBy?: PriceListDetailGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PriceListDetailGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPriceListDetailGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PriceListDetail model
   */
  readonly fields: PriceListDetailFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PriceListDetail.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PriceListDetailClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Collection<T extends CollectionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CollectionDefaultArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    PriceList<T extends PriceListDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PriceListDefaultArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the PriceListDetail model
   */
  interface PriceListDetailFieldRefs {
    readonly price_list_detail_id: FieldRef<"PriceListDetail", 'String'>
    readonly price_list_id: FieldRef<"PriceListDetail", 'String'>
    readonly collection_id: FieldRef<"PriceListDetail", 'String'>
    readonly price_per_square_meter: FieldRef<"PriceListDetail", 'Decimal'>
    readonly created_at: FieldRef<"PriceListDetail", 'DateTime'>
    readonly updated_at: FieldRef<"PriceListDetail", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PriceListDetail findUnique
   */
  export type PriceListDetailFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which PriceListDetail to fetch.
     */
    where: PriceListDetailWhereUniqueInput
  }

  /**
   * PriceListDetail findUniqueOrThrow
   */
  export type PriceListDetailFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which PriceListDetail to fetch.
     */
    where: PriceListDetailWhereUniqueInput
  }

  /**
   * PriceListDetail findFirst
   */
  export type PriceListDetailFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which PriceListDetail to fetch.
     */
    where?: PriceListDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceListDetails to fetch.
     */
    orderBy?: PriceListDetailOrderByWithRelationInput | PriceListDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PriceListDetails.
     */
    cursor?: PriceListDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceListDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceListDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PriceListDetails.
     */
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * PriceListDetail findFirstOrThrow
   */
  export type PriceListDetailFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which PriceListDetail to fetch.
     */
    where?: PriceListDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceListDetails to fetch.
     */
    orderBy?: PriceListDetailOrderByWithRelationInput | PriceListDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PriceListDetails.
     */
    cursor?: PriceListDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceListDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceListDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PriceListDetails.
     */
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * PriceListDetail findMany
   */
  export type PriceListDetailFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * Filter, which PriceListDetails to fetch.
     */
    where?: PriceListDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceListDetails to fetch.
     */
    orderBy?: PriceListDetailOrderByWithRelationInput | PriceListDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PriceListDetails.
     */
    cursor?: PriceListDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceListDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceListDetails.
     */
    skip?: number
    distinct?: PriceListDetailScalarFieldEnum | PriceListDetailScalarFieldEnum[]
  }

  /**
   * PriceListDetail create
   */
  export type PriceListDetailCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * The data needed to create a PriceListDetail.
     */
    data: XOR<PriceListDetailCreateInput, PriceListDetailUncheckedCreateInput>
  }

  /**
   * PriceListDetail createMany
   */
  export type PriceListDetailCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PriceListDetails.
     */
    data: PriceListDetailCreateManyInput | PriceListDetailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PriceListDetail createManyAndReturn
   */
  export type PriceListDetailCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * The data used to create many PriceListDetails.
     */
    data: PriceListDetailCreateManyInput | PriceListDetailCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PriceListDetail update
   */
  export type PriceListDetailUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * The data needed to update a PriceListDetail.
     */
    data: XOR<PriceListDetailUpdateInput, PriceListDetailUncheckedUpdateInput>
    /**
     * Choose, which PriceListDetail to update.
     */
    where: PriceListDetailWhereUniqueInput
  }

  /**
   * PriceListDetail updateMany
   */
  export type PriceListDetailUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PriceListDetails.
     */
    data: XOR<PriceListDetailUpdateManyMutationInput, PriceListDetailUncheckedUpdateManyInput>
    /**
     * Filter which PriceListDetails to update
     */
    where?: PriceListDetailWhereInput
    /**
     * Limit how many PriceListDetails to update.
     */
    limit?: number
  }

  /**
   * PriceListDetail updateManyAndReturn
   */
  export type PriceListDetailUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * The data used to update PriceListDetails.
     */
    data: XOR<PriceListDetailUpdateManyMutationInput, PriceListDetailUncheckedUpdateManyInput>
    /**
     * Filter which PriceListDetails to update
     */
    where?: PriceListDetailWhereInput
    /**
     * Limit how many PriceListDetails to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PriceListDetail upsert
   */
  export type PriceListDetailUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * The filter to search for the PriceListDetail to update in case it exists.
     */
    where: PriceListDetailWhereUniqueInput
    /**
     * In case the PriceListDetail found by the `where` argument doesn't exist, create a new PriceListDetail with this data.
     */
    create: XOR<PriceListDetailCreateInput, PriceListDetailUncheckedCreateInput>
    /**
     * In case the PriceListDetail was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PriceListDetailUpdateInput, PriceListDetailUncheckedUpdateInput>
  }

  /**
   * PriceListDetail delete
   */
  export type PriceListDetailDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
    /**
     * Filter which PriceListDetail to delete.
     */
    where: PriceListDetailWhereUniqueInput
  }

  /**
   * PriceListDetail deleteMany
   */
  export type PriceListDetailDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PriceListDetails to delete
     */
    where?: PriceListDetailWhereInput
    /**
     * Limit how many PriceListDetails to delete.
     */
    limit?: number
  }

  /**
   * PriceListDetail without action
   */
  export type PriceListDetailDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceListDetail
     */
    select?: PriceListDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceListDetail
     */
    omit?: PriceListDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceListDetailInclude<ExtArgs> | null
  }


  /**
   * Model UserPriceList
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
     * Filter which UserPriceList to aggregate.
     */
    where?: UserPriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPriceLists to fetch.
     */
    orderBy?: UserPriceListOrderByWithRelationInput | UserPriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserPriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserPriceLists
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




  export type UserPriceListGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPriceListWhereInput
    orderBy?: UserPriceListOrderByWithAggregationInput | UserPriceListOrderByWithAggregationInput[]
    by: UserPriceListScalarFieldEnum[] | UserPriceListScalarFieldEnum
    having?: UserPriceListScalarWhereWithAggregatesInput
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

  type GetUserPriceListGroupByPayload<T extends UserPriceListGroupByArgs> = Prisma.PrismaPromise<
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


  export type UserPriceListSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_price_list_id?: boolean
    user_id?: boolean
    price_list_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPriceList"]>

  export type UserPriceListSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_price_list_id?: boolean
    user_id?: boolean
    price_list_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPriceList"]>

  export type UserPriceListSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_price_list_id?: boolean
    user_id?: boolean
    price_list_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPriceList"]>

  export type UserPriceListSelectScalar = {
    user_price_list_id?: boolean
    user_id?: boolean
    price_list_id?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UserPriceListOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"user_price_list_id" | "user_id" | "price_list_id" | "created_at" | "updated_at", ExtArgs["result"]["userPriceList"]>
  export type UserPriceListInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
    User?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserPriceListIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
    User?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserPriceListIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    PriceList?: boolean | PriceListDefaultArgs<ExtArgs>
    User?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserPriceListPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserPriceList"
    objects: {
      PriceList: Prisma.$PriceListPayload<ExtArgs>
      User: Prisma.$UserPayload<ExtArgs>
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

  type UserPriceListGetPayload<S extends boolean | null | undefined | UserPriceListDefaultArgs> = $Result.GetResult<Prisma.$UserPriceListPayload, S>

  type UserPriceListCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserPriceListFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserPriceListCountAggregateInputType | true
    }

  export interface UserPriceListDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserPriceList'], meta: { name: 'UserPriceList' } }
    /**
     * Find zero or one UserPriceList that matches the filter.
     * @param {UserPriceListFindUniqueArgs} args - Arguments to find a UserPriceList
     * @example
     * // Get one UserPriceList
     * const userPriceList = await prisma.userPriceList.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserPriceListFindUniqueArgs>(args: SelectSubset<T, UserPriceListFindUniqueArgs<ExtArgs>>): Prisma__UserPriceListClient<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserPriceList that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserPriceListFindUniqueOrThrowArgs} args - Arguments to find a UserPriceList
     * @example
     * // Get one UserPriceList
     * const userPriceList = await prisma.userPriceList.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserPriceListFindUniqueOrThrowArgs>(args: SelectSubset<T, UserPriceListFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserPriceListClient<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPriceList that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPriceListFindFirstArgs} args - Arguments to find a UserPriceList
     * @example
     * // Get one UserPriceList
     * const userPriceList = await prisma.userPriceList.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserPriceListFindFirstArgs>(args?: SelectSubset<T, UserPriceListFindFirstArgs<ExtArgs>>): Prisma__UserPriceListClient<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPriceList that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPriceListFindFirstOrThrowArgs} args - Arguments to find a UserPriceList
     * @example
     * // Get one UserPriceList
     * const userPriceList = await prisma.userPriceList.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserPriceListFindFirstOrThrowArgs>(args?: SelectSubset<T, UserPriceListFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserPriceListClient<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserPriceLists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPriceListFindManyArgs} args - Arguments to filter and select certain fields only.
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
    findMany<T extends UserPriceListFindManyArgs>(args?: SelectSubset<T, UserPriceListFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserPriceList.
     * @param {UserPriceListCreateArgs} args - Arguments to create a UserPriceList.
     * @example
     * // Create one UserPriceList
     * const UserPriceList = await prisma.userPriceList.create({
     *   data: {
     *     // ... data to create a UserPriceList
     *   }
     * })
     * 
     */
    create<T extends UserPriceListCreateArgs>(args: SelectSubset<T, UserPriceListCreateArgs<ExtArgs>>): Prisma__UserPriceListClient<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserPriceLists.
     * @param {UserPriceListCreateManyArgs} args - Arguments to create many UserPriceLists.
     * @example
     * // Create many UserPriceLists
     * const userPriceList = await prisma.userPriceList.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserPriceListCreateManyArgs>(args?: SelectSubset<T, UserPriceListCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserPriceLists and returns the data saved in the database.
     * @param {UserPriceListCreateManyAndReturnArgs} args - Arguments to create many UserPriceLists.
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
    createManyAndReturn<T extends UserPriceListCreateManyAndReturnArgs>(args?: SelectSubset<T, UserPriceListCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserPriceList.
     * @param {UserPriceListDeleteArgs} args - Arguments to delete one UserPriceList.
     * @example
     * // Delete one UserPriceList
     * const UserPriceList = await prisma.userPriceList.delete({
     *   where: {
     *     // ... filter to delete one UserPriceList
     *   }
     * })
     * 
     */
    delete<T extends UserPriceListDeleteArgs>(args: SelectSubset<T, UserPriceListDeleteArgs<ExtArgs>>): Prisma__UserPriceListClient<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserPriceList.
     * @param {UserPriceListUpdateArgs} args - Arguments to update one UserPriceList.
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
    update<T extends UserPriceListUpdateArgs>(args: SelectSubset<T, UserPriceListUpdateArgs<ExtArgs>>): Prisma__UserPriceListClient<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserPriceLists.
     * @param {UserPriceListDeleteManyArgs} args - Arguments to filter UserPriceLists to delete.
     * @example
     * // Delete a few UserPriceLists
     * const { count } = await prisma.userPriceList.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserPriceListDeleteManyArgs>(args?: SelectSubset<T, UserPriceListDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPriceLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPriceListUpdateManyArgs} args - Arguments to update one or more rows.
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
    updateMany<T extends UserPriceListUpdateManyArgs>(args: SelectSubset<T, UserPriceListUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPriceLists and returns the data updated in the database.
     * @param {UserPriceListUpdateManyAndReturnArgs} args - Arguments to update many UserPriceLists.
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
    updateManyAndReturn<T extends UserPriceListUpdateManyAndReturnArgs>(args: SelectSubset<T, UserPriceListUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserPriceList.
     * @param {UserPriceListUpsertArgs} args - Arguments to update or create a UserPriceList.
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
    upsert<T extends UserPriceListUpsertArgs>(args: SelectSubset<T, UserPriceListUpsertArgs<ExtArgs>>): Prisma__UserPriceListClient<$Result.GetResult<Prisma.$UserPriceListPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserPriceLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPriceListCountArgs} args - Arguments to filter UserPriceLists to count.
     * @example
     * // Count the number of UserPriceLists
     * const count = await prisma.userPriceList.count({
     *   where: {
     *     // ... the filter for the UserPriceLists we want to count
     *   }
     * })
    **/
    count<T extends UserPriceListCountArgs>(
      args?: Subset<T, UserPriceListCountArgs>,
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
     * @param {UserPriceListGroupByArgs} args - Group by arguments.
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
      T extends UserPriceListGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserPriceListGroupByArgs['orderBy'] }
        : { orderBy?: UserPriceListGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserPriceListGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserPriceListGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserPriceList model
   */
  readonly fields: UserPriceListFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserPriceList.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserPriceListClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    PriceList<T extends PriceListDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PriceListDefaultArgs<ExtArgs>>): Prisma__PriceListClient<$Result.GetResult<Prisma.$PriceListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    User<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the UserPriceList model
   */
  interface UserPriceListFieldRefs {
    readonly user_price_list_id: FieldRef<"UserPriceList", 'String'>
    readonly user_id: FieldRef<"UserPriceList", 'String'>
    readonly price_list_id: FieldRef<"UserPriceList", 'String'>
    readonly created_at: FieldRef<"UserPriceList", 'DateTime'>
    readonly updated_at: FieldRef<"UserPriceList", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserPriceList findUnique
   */
  export type UserPriceListFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * Filter, which UserPriceList to fetch.
     */
    where: UserPriceListWhereUniqueInput
  }

  /**
   * UserPriceList findUniqueOrThrow
   */
  export type UserPriceListFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * Filter, which UserPriceList to fetch.
     */
    where: UserPriceListWhereUniqueInput
  }

  /**
   * UserPriceList findFirst
   */
  export type UserPriceListFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * Filter, which UserPriceList to fetch.
     */
    where?: UserPriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPriceLists to fetch.
     */
    orderBy?: UserPriceListOrderByWithRelationInput | UserPriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPriceLists.
     */
    cursor?: UserPriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPriceLists.
     */
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * UserPriceList findFirstOrThrow
   */
  export type UserPriceListFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * Filter, which UserPriceList to fetch.
     */
    where?: UserPriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPriceLists to fetch.
     */
    orderBy?: UserPriceListOrderByWithRelationInput | UserPriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPriceLists.
     */
    cursor?: UserPriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPriceLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPriceLists.
     */
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * UserPriceList findMany
   */
  export type UserPriceListFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * Filter, which UserPriceLists to fetch.
     */
    where?: UserPriceListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPriceLists to fetch.
     */
    orderBy?: UserPriceListOrderByWithRelationInput | UserPriceListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserPriceLists.
     */
    cursor?: UserPriceListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPriceLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPriceLists.
     */
    skip?: number
    distinct?: UserPriceListScalarFieldEnum | UserPriceListScalarFieldEnum[]
  }

  /**
   * UserPriceList create
   */
  export type UserPriceListCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * The data needed to create a UserPriceList.
     */
    data: XOR<UserPriceListCreateInput, UserPriceListUncheckedCreateInput>
  }

  /**
   * UserPriceList createMany
   */
  export type UserPriceListCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserPriceLists.
     */
    data: UserPriceListCreateManyInput | UserPriceListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserPriceList createManyAndReturn
   */
  export type UserPriceListCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * The data used to create many UserPriceLists.
     */
    data: UserPriceListCreateManyInput | UserPriceListCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserPriceList update
   */
  export type UserPriceListUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * The data needed to update a UserPriceList.
     */
    data: XOR<UserPriceListUpdateInput, UserPriceListUncheckedUpdateInput>
    /**
     * Choose, which UserPriceList to update.
     */
    where: UserPriceListWhereUniqueInput
  }

  /**
   * UserPriceList updateMany
   */
  export type UserPriceListUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserPriceLists.
     */
    data: XOR<UserPriceListUpdateManyMutationInput, UserPriceListUncheckedUpdateManyInput>
    /**
     * Filter which UserPriceLists to update
     */
    where?: UserPriceListWhereInput
    /**
     * Limit how many UserPriceLists to update.
     */
    limit?: number
  }

  /**
   * UserPriceList updateManyAndReturn
   */
  export type UserPriceListUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * The data used to update UserPriceLists.
     */
    data: XOR<UserPriceListUpdateManyMutationInput, UserPriceListUncheckedUpdateManyInput>
    /**
     * Filter which UserPriceLists to update
     */
    where?: UserPriceListWhereInput
    /**
     * Limit how many UserPriceLists to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserPriceList upsert
   */
  export type UserPriceListUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * The filter to search for the UserPriceList to update in case it exists.
     */
    where: UserPriceListWhereUniqueInput
    /**
     * In case the UserPriceList found by the `where` argument doesn't exist, create a new UserPriceList with this data.
     */
    create: XOR<UserPriceListCreateInput, UserPriceListUncheckedCreateInput>
    /**
     * In case the UserPriceList was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserPriceListUpdateInput, UserPriceListUncheckedUpdateInput>
  }

  /**
   * UserPriceList delete
   */
  export type UserPriceListDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
    /**
     * Filter which UserPriceList to delete.
     */
    where: UserPriceListWhereUniqueInput
  }

  /**
   * UserPriceList deleteMany
   */
  export type UserPriceListDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPriceLists to delete
     */
    where?: UserPriceListWhereInput
    /**
     * Limit how many UserPriceLists to delete.
     */
    limit?: number
  }

  /**
   * UserPriceList without action
   */
  export type UserPriceListDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPriceList
     */
    select?: UserPriceListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPriceList
     */
    omit?: UserPriceListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPriceListInclude<ExtArgs> | null
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


  export type UserTypeWhereInput = {
    AND?: UserTypeWhereInput | UserTypeWhereInput[]
    OR?: UserTypeWhereInput[]
    NOT?: UserTypeWhereInput | UserTypeWhereInput[]
    id?: IntFilter<"UserType"> | number
    name?: StringFilter<"UserType"> | string
    users?: UserListRelationFilter
  }

  export type UserTypeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    users?: UserOrderByRelationAggregateInput
  }

  export type UserTypeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: UserTypeWhereInput | UserTypeWhereInput[]
    OR?: UserTypeWhereInput[]
    NOT?: UserTypeWhereInput | UserTypeWhereInput[]
    users?: UserListRelationFilter
  }, "id" | "name">

  export type UserTypeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    _count?: UserTypeCountOrderByAggregateInput
    _avg?: UserTypeAvgOrderByAggregateInput
    _max?: UserTypeMaxOrderByAggregateInput
    _min?: UserTypeMinOrderByAggregateInput
    _sum?: UserTypeSumOrderByAggregateInput
  }

  export type UserTypeScalarWhereWithAggregatesInput = {
    AND?: UserTypeScalarWhereWithAggregatesInput | UserTypeScalarWhereWithAggregatesInput[]
    OR?: UserTypeScalarWhereWithAggregatesInput[]
    NOT?: UserTypeScalarWhereWithAggregatesInput | UserTypeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserType"> | number
    name?: StringWithAggregatesFilter<"UserType"> | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    credit?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    debit?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolFilter<"User"> | boolean
    password?: StringFilter<"User"> | string
    phoneNumber?: StringNullableFilter<"User"> | string | null
    surname?: StringFilter<"User"> | string
    userId?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    userTypeId?: IntFilter<"User"> | number
    userType?: XOR<UserTypeScalarRelationFilter, UserTypeWhereInput>
    UserPriceList?: UserPriceListListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
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
    userType?: UserTypeOrderByWithRelationInput
    UserPriceList?: UserPriceListOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    email?: string
    userId?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    credit?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    debit?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolFilter<"User"> | boolean
    password?: StringFilter<"User"> | string
    phoneNumber?: StringNullableFilter<"User"> | string | null
    surname?: StringFilter<"User"> | string
    userTypeId?: IntFilter<"User"> | number
    userType?: XOR<UserTypeScalarRelationFilter, UserTypeWhereInput>
    UserPriceList?: UserPriceListListRelationFilter
  }, "userId" | "email" | "username">

  export type UserOrderByWithAggregationInput = {
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
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    credit?: DecimalWithAggregatesFilter<"User"> | Decimal | DecimalJsLike | number | string
    debit?: DecimalWithAggregatesFilter<"User"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    password?: StringWithAggregatesFilter<"User"> | string
    phoneNumber?: StringNullableWithAggregatesFilter<"User"> | string | null
    surname?: StringWithAggregatesFilter<"User"> | string
    userId?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    userTypeId?: IntWithAggregatesFilter<"User"> | number
  }

  export type CollectionWhereInput = {
    AND?: CollectionWhereInput | CollectionWhereInput[]
    OR?: CollectionWhereInput[]
    NOT?: CollectionWhereInput | CollectionWhereInput[]
    collectionId?: StringFilter<"Collection"> | string
    name?: StringFilter<"Collection"> | string
    description?: StringNullableFilter<"Collection"> | string | null
    code?: StringFilter<"Collection"> | string
    isActive?: BoolFilter<"Collection"> | boolean
    createdAt?: DateTimeFilter<"Collection"> | Date | string
    updatedAt?: DateTimeFilter<"Collection"> | Date | string
    PriceListDetail?: PriceListDetailListRelationFilter
    products?: ProductListRelationFilter
  }

  export type CollectionOrderByWithRelationInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    PriceListDetail?: PriceListDetailOrderByRelationAggregateInput
    products?: ProductOrderByRelationAggregateInput
  }

  export type CollectionWhereUniqueInput = Prisma.AtLeast<{
    collectionId?: string
    code?: string
    AND?: CollectionWhereInput | CollectionWhereInput[]
    OR?: CollectionWhereInput[]
    NOT?: CollectionWhereInput | CollectionWhereInput[]
    name?: StringFilter<"Collection"> | string
    description?: StringNullableFilter<"Collection"> | string | null
    isActive?: BoolFilter<"Collection"> | boolean
    createdAt?: DateTimeFilter<"Collection"> | Date | string
    updatedAt?: DateTimeFilter<"Collection"> | Date | string
    PriceListDetail?: PriceListDetailListRelationFilter
    products?: ProductListRelationFilter
  }, "collectionId" | "code">

  export type CollectionOrderByWithAggregationInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CollectionCountOrderByAggregateInput
    _max?: CollectionMaxOrderByAggregateInput
    _min?: CollectionMinOrderByAggregateInput
  }

  export type CollectionScalarWhereWithAggregatesInput = {
    AND?: CollectionScalarWhereWithAggregatesInput | CollectionScalarWhereWithAggregatesInput[]
    OR?: CollectionScalarWhereWithAggregatesInput[]
    NOT?: CollectionScalarWhereWithAggregatesInput | CollectionScalarWhereWithAggregatesInput[]
    collectionId?: StringWithAggregatesFilter<"Collection"> | string
    name?: StringWithAggregatesFilter<"Collection"> | string
    description?: StringNullableWithAggregatesFilter<"Collection"> | string | null
    code?: StringWithAggregatesFilter<"Collection"> | string
    isActive?: BoolWithAggregatesFilter<"Collection"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Collection"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Collection"> | Date | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    productId?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    stock?: IntFilter<"Product"> | number
    width?: FloatFilter<"Product"> | number
    height?: FloatFilter<"Product"> | number
    cut?: BoolFilter<"Product"> | boolean
    productImage?: StringNullableFilter<"Product"> | string | null
    collectionId?: StringFilter<"Product"> | string
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    collection_name?: StringNullableFilter<"Product"> | string | null
    collection?: XOR<CollectionScalarRelationFilter, CollectionWhereInput>
  }

  export type ProductOrderByWithRelationInput = {
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
    collection?: CollectionOrderByWithRelationInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    productId?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    stock?: IntFilter<"Product"> | number
    width?: FloatFilter<"Product"> | number
    height?: FloatFilter<"Product"> | number
    cut?: BoolFilter<"Product"> | boolean
    productImage?: StringNullableFilter<"Product"> | string | null
    collectionId?: StringFilter<"Product"> | string
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    collection_name?: StringNullableFilter<"Product"> | string | null
    collection?: XOR<CollectionScalarRelationFilter, CollectionWhereInput>
  }, "productId">

  export type ProductOrderByWithAggregationInput = {
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
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    productId?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    description?: StringWithAggregatesFilter<"Product"> | string
    stock?: IntWithAggregatesFilter<"Product"> | number
    width?: FloatWithAggregatesFilter<"Product"> | number
    height?: FloatWithAggregatesFilter<"Product"> | number
    cut?: BoolWithAggregatesFilter<"Product"> | boolean
    productImage?: StringNullableWithAggregatesFilter<"Product"> | string | null
    collectionId?: StringWithAggregatesFilter<"Product"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    collection_name?: StringNullableWithAggregatesFilter<"Product"> | string | null
  }

  export type PriceListWhereInput = {
    AND?: PriceListWhereInput | PriceListWhereInput[]
    OR?: PriceListWhereInput[]
    NOT?: PriceListWhereInput | PriceListWhereInput[]
    price_list_id?: StringFilter<"PriceList"> | string
    name?: StringFilter<"PriceList"> | string
    description?: StringNullableFilter<"PriceList"> | string | null
    is_default?: BoolFilter<"PriceList"> | boolean
    valid_from?: DateTimeNullableFilter<"PriceList"> | Date | string | null
    valid_to?: DateTimeNullableFilter<"PriceList"> | Date | string | null
    limit_amount?: DecimalNullableFilter<"PriceList"> | Decimal | DecimalJsLike | number | string | null
    currency?: StringFilter<"PriceList"> | string
    is_active?: BoolFilter<"PriceList"> | boolean
    created_at?: DateTimeFilter<"PriceList"> | Date | string
    updated_at?: DateTimeFilter<"PriceList"> | Date | string
    PriceListDetail?: PriceListDetailListRelationFilter
    UserPriceList?: UserPriceListListRelationFilter
  }

  export type PriceListOrderByWithRelationInput = {
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
    PriceListDetail?: PriceListDetailOrderByRelationAggregateInput
    UserPriceList?: UserPriceListOrderByRelationAggregateInput
  }

  export type PriceListWhereUniqueInput = Prisma.AtLeast<{
    price_list_id?: string
    AND?: PriceListWhereInput | PriceListWhereInput[]
    OR?: PriceListWhereInput[]
    NOT?: PriceListWhereInput | PriceListWhereInput[]
    name?: StringFilter<"PriceList"> | string
    description?: StringNullableFilter<"PriceList"> | string | null
    is_default?: BoolFilter<"PriceList"> | boolean
    valid_from?: DateTimeNullableFilter<"PriceList"> | Date | string | null
    valid_to?: DateTimeNullableFilter<"PriceList"> | Date | string | null
    limit_amount?: DecimalNullableFilter<"PriceList"> | Decimal | DecimalJsLike | number | string | null
    currency?: StringFilter<"PriceList"> | string
    is_active?: BoolFilter<"PriceList"> | boolean
    created_at?: DateTimeFilter<"PriceList"> | Date | string
    updated_at?: DateTimeFilter<"PriceList"> | Date | string
    PriceListDetail?: PriceListDetailListRelationFilter
    UserPriceList?: UserPriceListListRelationFilter
  }, "price_list_id">

  export type PriceListOrderByWithAggregationInput = {
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
    _count?: PriceListCountOrderByAggregateInput
    _avg?: PriceListAvgOrderByAggregateInput
    _max?: PriceListMaxOrderByAggregateInput
    _min?: PriceListMinOrderByAggregateInput
    _sum?: PriceListSumOrderByAggregateInput
  }

  export type PriceListScalarWhereWithAggregatesInput = {
    AND?: PriceListScalarWhereWithAggregatesInput | PriceListScalarWhereWithAggregatesInput[]
    OR?: PriceListScalarWhereWithAggregatesInput[]
    NOT?: PriceListScalarWhereWithAggregatesInput | PriceListScalarWhereWithAggregatesInput[]
    price_list_id?: StringWithAggregatesFilter<"PriceList"> | string
    name?: StringWithAggregatesFilter<"PriceList"> | string
    description?: StringNullableWithAggregatesFilter<"PriceList"> | string | null
    is_default?: BoolWithAggregatesFilter<"PriceList"> | boolean
    valid_from?: DateTimeNullableWithAggregatesFilter<"PriceList"> | Date | string | null
    valid_to?: DateTimeNullableWithAggregatesFilter<"PriceList"> | Date | string | null
    limit_amount?: DecimalNullableWithAggregatesFilter<"PriceList"> | Decimal | DecimalJsLike | number | string | null
    currency?: StringWithAggregatesFilter<"PriceList"> | string
    is_active?: BoolWithAggregatesFilter<"PriceList"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"PriceList"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PriceList"> | Date | string
  }

  export type PriceListDetailWhereInput = {
    AND?: PriceListDetailWhereInput | PriceListDetailWhereInput[]
    OR?: PriceListDetailWhereInput[]
    NOT?: PriceListDetailWhereInput | PriceListDetailWhereInput[]
    price_list_detail_id?: StringFilter<"PriceListDetail"> | string
    price_list_id?: StringFilter<"PriceListDetail"> | string
    collection_id?: StringFilter<"PriceListDetail"> | string
    price_per_square_meter?: DecimalFilter<"PriceListDetail"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"PriceListDetail"> | Date | string
    updated_at?: DateTimeFilter<"PriceListDetail"> | Date | string
    Collection?: XOR<CollectionScalarRelationFilter, CollectionWhereInput>
    PriceList?: XOR<PriceListScalarRelationFilter, PriceListWhereInput>
  }

  export type PriceListDetailOrderByWithRelationInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    Collection?: CollectionOrderByWithRelationInput
    PriceList?: PriceListOrderByWithRelationInput
  }

  export type PriceListDetailWhereUniqueInput = Prisma.AtLeast<{
    price_list_detail_id?: string
    AND?: PriceListDetailWhereInput | PriceListDetailWhereInput[]
    OR?: PriceListDetailWhereInput[]
    NOT?: PriceListDetailWhereInput | PriceListDetailWhereInput[]
    price_list_id?: StringFilter<"PriceListDetail"> | string
    collection_id?: StringFilter<"PriceListDetail"> | string
    price_per_square_meter?: DecimalFilter<"PriceListDetail"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"PriceListDetail"> | Date | string
    updated_at?: DateTimeFilter<"PriceListDetail"> | Date | string
    Collection?: XOR<CollectionScalarRelationFilter, CollectionWhereInput>
    PriceList?: XOR<PriceListScalarRelationFilter, PriceListWhereInput>
  }, "price_list_detail_id">

  export type PriceListDetailOrderByWithAggregationInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: PriceListDetailCountOrderByAggregateInput
    _avg?: PriceListDetailAvgOrderByAggregateInput
    _max?: PriceListDetailMaxOrderByAggregateInput
    _min?: PriceListDetailMinOrderByAggregateInput
    _sum?: PriceListDetailSumOrderByAggregateInput
  }

  export type PriceListDetailScalarWhereWithAggregatesInput = {
    AND?: PriceListDetailScalarWhereWithAggregatesInput | PriceListDetailScalarWhereWithAggregatesInput[]
    OR?: PriceListDetailScalarWhereWithAggregatesInput[]
    NOT?: PriceListDetailScalarWhereWithAggregatesInput | PriceListDetailScalarWhereWithAggregatesInput[]
    price_list_detail_id?: StringWithAggregatesFilter<"PriceListDetail"> | string
    price_list_id?: StringWithAggregatesFilter<"PriceListDetail"> | string
    collection_id?: StringWithAggregatesFilter<"PriceListDetail"> | string
    price_per_square_meter?: DecimalWithAggregatesFilter<"PriceListDetail"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"PriceListDetail"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PriceListDetail"> | Date | string
  }

  export type UserPriceListWhereInput = {
    AND?: UserPriceListWhereInput | UserPriceListWhereInput[]
    OR?: UserPriceListWhereInput[]
    NOT?: UserPriceListWhereInput | UserPriceListWhereInput[]
    user_price_list_id?: StringFilter<"UserPriceList"> | string
    user_id?: StringFilter<"UserPriceList"> | string
    price_list_id?: StringFilter<"UserPriceList"> | string
    created_at?: DateTimeFilter<"UserPriceList"> | Date | string
    updated_at?: DateTimeFilter<"UserPriceList"> | Date | string
    PriceList?: XOR<PriceListScalarRelationFilter, PriceListWhereInput>
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserPriceListOrderByWithRelationInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    PriceList?: PriceListOrderByWithRelationInput
    User?: UserOrderByWithRelationInput
  }

  export type UserPriceListWhereUniqueInput = Prisma.AtLeast<{
    user_price_list_id?: string
    AND?: UserPriceListWhereInput | UserPriceListWhereInput[]
    OR?: UserPriceListWhereInput[]
    NOT?: UserPriceListWhereInput | UserPriceListWhereInput[]
    user_id?: StringFilter<"UserPriceList"> | string
    price_list_id?: StringFilter<"UserPriceList"> | string
    created_at?: DateTimeFilter<"UserPriceList"> | Date | string
    updated_at?: DateTimeFilter<"UserPriceList"> | Date | string
    PriceList?: XOR<PriceListScalarRelationFilter, PriceListWhereInput>
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "user_price_list_id">

  export type UserPriceListOrderByWithAggregationInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserPriceListCountOrderByAggregateInput
    _max?: UserPriceListMaxOrderByAggregateInput
    _min?: UserPriceListMinOrderByAggregateInput
  }

  export type UserPriceListScalarWhereWithAggregatesInput = {
    AND?: UserPriceListScalarWhereWithAggregatesInput | UserPriceListScalarWhereWithAggregatesInput[]
    OR?: UserPriceListScalarWhereWithAggregatesInput[]
    NOT?: UserPriceListScalarWhereWithAggregatesInput | UserPriceListScalarWhereWithAggregatesInput[]
    user_price_list_id?: StringWithAggregatesFilter<"UserPriceList"> | string
    user_id?: StringWithAggregatesFilter<"UserPriceList"> | string
    price_list_id?: StringWithAggregatesFilter<"UserPriceList"> | string
    created_at?: DateTimeWithAggregatesFilter<"UserPriceList"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"UserPriceList"> | Date | string
  }

  export type UserTypeCreateInput = {
    name: string
    users?: UserCreateNestedManyWithoutUserTypeInput
  }

  export type UserTypeUncheckedCreateInput = {
    id?: number
    name: string
    users?: UserUncheckedCreateNestedManyWithoutUserTypeInput
  }

  export type UserTypeUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    users?: UserUpdateManyWithoutUserTypeNestedInput
  }

  export type UserTypeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    users?: UserUncheckedUpdateManyWithoutUserTypeNestedInput
  }

  export type UserTypeCreateManyInput = {
    id?: number
    name: string
  }

  export type UserTypeUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type UserTypeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type UserCreateInput = {
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
    userType: UserTypeCreateNestedOneWithoutUsersInput
    UserPriceList?: UserPriceListCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
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
    UserPriceList?: UserPriceListUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
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
    userType?: UserTypeUpdateOneRequiredWithoutUsersNestedInput
    UserPriceList?: UserPriceListUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
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
    UserPriceList?: UserPriceListUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
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

  export type UserUpdateManyMutationInput = {
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

  export type UserUncheckedUpdateManyInput = {
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

  export type CollectionCreateInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    PriceListDetail?: PriceListDetailCreateNestedManyWithoutCollectionInput
    products?: ProductCreateNestedManyWithoutCollectionInput
  }

  export type CollectionUncheckedCreateInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    PriceListDetail?: PriceListDetailUncheckedCreateNestedManyWithoutCollectionInput
    products?: ProductUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type CollectionUpdateInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    PriceListDetail?: PriceListDetailUpdateManyWithoutCollectionNestedInput
    products?: ProductUpdateManyWithoutCollectionNestedInput
  }

  export type CollectionUncheckedUpdateInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    PriceListDetail?: PriceListDetailUncheckedUpdateManyWithoutCollectionNestedInput
    products?: ProductUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type CollectionCreateManyInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CollectionUpdateManyMutationInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CollectionUncheckedUpdateManyInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateInput = {
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
    collection: CollectionCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateInput = {
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

  export type ProductUpdateInput = {
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
    collection?: CollectionUpdateOneRequiredWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateInput = {
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

  export type ProductCreateManyInput = {
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

  export type ProductUpdateManyMutationInput = {
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

  export type ProductUncheckedUpdateManyInput = {
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

  export type PriceListCreateInput = {
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
    PriceListDetail?: PriceListDetailCreateNestedManyWithoutPriceListInput
    UserPriceList?: UserPriceListCreateNestedManyWithoutPriceListInput
  }

  export type PriceListUncheckedCreateInput = {
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
    PriceListDetail?: PriceListDetailUncheckedCreateNestedManyWithoutPriceListInput
    UserPriceList?: UserPriceListUncheckedCreateNestedManyWithoutPriceListInput
  }

  export type PriceListUpdateInput = {
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
    PriceListDetail?: PriceListDetailUpdateManyWithoutPriceListNestedInput
    UserPriceList?: UserPriceListUpdateManyWithoutPriceListNestedInput
  }

  export type PriceListUncheckedUpdateInput = {
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
    PriceListDetail?: PriceListDetailUncheckedUpdateManyWithoutPriceListNestedInput
    UserPriceList?: UserPriceListUncheckedUpdateManyWithoutPriceListNestedInput
  }

  export type PriceListCreateManyInput = {
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

  export type PriceListUpdateManyMutationInput = {
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

  export type PriceListUncheckedUpdateManyInput = {
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

  export type PriceListDetailCreateInput = {
    price_list_detail_id?: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    Collection: CollectionCreateNestedOneWithoutPriceListDetailInput
    PriceList: PriceListCreateNestedOneWithoutPriceListDetailInput
  }

  export type PriceListDetailUncheckedCreateInput = {
    price_list_detail_id?: string
    price_list_id: string
    collection_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PriceListDetailUpdateInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    Collection?: CollectionUpdateOneRequiredWithoutPriceListDetailNestedInput
    PriceList?: PriceListUpdateOneRequiredWithoutPriceListDetailNestedInput
  }

  export type PriceListDetailUncheckedUpdateInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    collection_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceListDetailCreateManyInput = {
    price_list_detail_id?: string
    price_list_id: string
    collection_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PriceListDetailUpdateManyMutationInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceListDetailUncheckedUpdateManyInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    collection_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPriceListCreateInput = {
    user_price_list_id?: string
    created_at?: Date | string
    updated_at?: Date | string
    PriceList: PriceListCreateNestedOneWithoutUserPriceListInput
    User: UserCreateNestedOneWithoutUserPriceListInput
  }

  export type UserPriceListUncheckedCreateInput = {
    user_price_list_id?: string
    user_id: string
    price_list_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPriceListUpdateInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    PriceList?: PriceListUpdateOneRequiredWithoutUserPriceListNestedInput
    User?: UserUpdateOneRequiredWithoutUserPriceListNestedInput
  }

  export type UserPriceListUncheckedUpdateInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPriceListCreateManyInput = {
    user_price_list_id?: string
    user_id: string
    price_list_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPriceListUpdateManyMutationInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPriceListUncheckedUpdateManyInput = {
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
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTypeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type UserTypeAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserTypeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type UserTypeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type UserTypeSumOrderByAggregateInput = {
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
    is?: UserTypeWhereInput
    isNot?: UserTypeWhereInput
  }

  export type UserPriceListListRelationFilter = {
    every?: UserPriceListWhereInput
    some?: UserPriceListWhereInput
    none?: UserPriceListWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserPriceListOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
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

  export type UserAvgOrderByAggregateInput = {
    credit?: SortOrder
    debit?: SortOrder
    userTypeId?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
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

  export type UserMinOrderByAggregateInput = {
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

  export type UserSumOrderByAggregateInput = {
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
    every?: PriceListDetailWhereInput
    some?: PriceListDetailWhereInput
    none?: PriceListDetailWhereInput
  }

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type PriceListDetailOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CollectionCountOrderByAggregateInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CollectionMaxOrderByAggregateInput = {
    collectionId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CollectionMinOrderByAggregateInput = {
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
    is?: CollectionWhereInput
    isNot?: CollectionWhereInput
  }

  export type ProductCountOrderByAggregateInput = {
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

  export type ProductAvgOrderByAggregateInput = {
    stock?: SortOrder
    width?: SortOrder
    height?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
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

  export type ProductMinOrderByAggregateInput = {
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

  export type ProductSumOrderByAggregateInput = {
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

  export type PriceListCountOrderByAggregateInput = {
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

  export type PriceListAvgOrderByAggregateInput = {
    limit_amount?: SortOrder
  }

  export type PriceListMaxOrderByAggregateInput = {
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

  export type PriceListMinOrderByAggregateInput = {
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

  export type PriceListSumOrderByAggregateInput = {
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
    is?: PriceListWhereInput
    isNot?: PriceListWhereInput
  }

  export type PriceListDetailCountOrderByAggregateInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PriceListDetailAvgOrderByAggregateInput = {
    price_per_square_meter?: SortOrder
  }

  export type PriceListDetailMaxOrderByAggregateInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PriceListDetailMinOrderByAggregateInput = {
    price_list_detail_id?: SortOrder
    price_list_id?: SortOrder
    collection_id?: SortOrder
    price_per_square_meter?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PriceListDetailSumOrderByAggregateInput = {
    price_per_square_meter?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserPriceListCountOrderByAggregateInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserPriceListMaxOrderByAggregateInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserPriceListMinOrderByAggregateInput = {
    user_price_list_id?: SortOrder
    user_id?: SortOrder
    price_list_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserCreateNestedManyWithoutUserTypeInput = {
    create?: XOR<UserCreateWithoutUserTypeInput, UserUncheckedCreateWithoutUserTypeInput> | UserCreateWithoutUserTypeInput[] | UserUncheckedCreateWithoutUserTypeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUserTypeInput | UserCreateOrConnectWithoutUserTypeInput[]
    createMany?: UserCreateManyUserTypeInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutUserTypeInput = {
    create?: XOR<UserCreateWithoutUserTypeInput, UserUncheckedCreateWithoutUserTypeInput> | UserCreateWithoutUserTypeInput[] | UserUncheckedCreateWithoutUserTypeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUserTypeInput | UserCreateOrConnectWithoutUserTypeInput[]
    createMany?: UserCreateManyUserTypeInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type UserUpdateManyWithoutUserTypeNestedInput = {
    create?: XOR<UserCreateWithoutUserTypeInput, UserUncheckedCreateWithoutUserTypeInput> | UserCreateWithoutUserTypeInput[] | UserUncheckedCreateWithoutUserTypeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUserTypeInput | UserCreateOrConnectWithoutUserTypeInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutUserTypeInput | UserUpsertWithWhereUniqueWithoutUserTypeInput[]
    createMany?: UserCreateManyUserTypeInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutUserTypeInput | UserUpdateWithWhereUniqueWithoutUserTypeInput[]
    updateMany?: UserUpdateManyWithWhereWithoutUserTypeInput | UserUpdateManyWithWhereWithoutUserTypeInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUncheckedUpdateManyWithoutUserTypeNestedInput = {
    create?: XOR<UserCreateWithoutUserTypeInput, UserUncheckedCreateWithoutUserTypeInput> | UserCreateWithoutUserTypeInput[] | UserUncheckedCreateWithoutUserTypeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUserTypeInput | UserCreateOrConnectWithoutUserTypeInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutUserTypeInput | UserUpsertWithWhereUniqueWithoutUserTypeInput[]
    createMany?: UserCreateManyUserTypeInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutUserTypeInput | UserUpdateWithWhereUniqueWithoutUserTypeInput[]
    updateMany?: UserUpdateManyWithWhereWithoutUserTypeInput | UserUpdateManyWithWhereWithoutUserTypeInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserTypeCreateNestedOneWithoutUsersInput = {
    create?: XOR<UserTypeCreateWithoutUsersInput, UserTypeUncheckedCreateWithoutUsersInput>
    connectOrCreate?: UserTypeCreateOrConnectWithoutUsersInput
    connect?: UserTypeWhereUniqueInput
  }

  export type UserPriceListCreateNestedManyWithoutUserInput = {
    create?: XOR<UserPriceListCreateWithoutUserInput, UserPriceListUncheckedCreateWithoutUserInput> | UserPriceListCreateWithoutUserInput[] | UserPriceListUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPriceListCreateOrConnectWithoutUserInput | UserPriceListCreateOrConnectWithoutUserInput[]
    createMany?: UserPriceListCreateManyUserInputEnvelope
    connect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
  }

  export type UserPriceListUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserPriceListCreateWithoutUserInput, UserPriceListUncheckedCreateWithoutUserInput> | UserPriceListCreateWithoutUserInput[] | UserPriceListUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPriceListCreateOrConnectWithoutUserInput | UserPriceListCreateOrConnectWithoutUserInput[]
    createMany?: UserPriceListCreateManyUserInputEnvelope
    connect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
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

  export type UserTypeUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<UserTypeCreateWithoutUsersInput, UserTypeUncheckedCreateWithoutUsersInput>
    connectOrCreate?: UserTypeCreateOrConnectWithoutUsersInput
    upsert?: UserTypeUpsertWithoutUsersInput
    connect?: UserTypeWhereUniqueInput
    update?: XOR<XOR<UserTypeUpdateToOneWithWhereWithoutUsersInput, UserTypeUpdateWithoutUsersInput>, UserTypeUncheckedUpdateWithoutUsersInput>
  }

  export type UserPriceListUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserPriceListCreateWithoutUserInput, UserPriceListUncheckedCreateWithoutUserInput> | UserPriceListCreateWithoutUserInput[] | UserPriceListUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPriceListCreateOrConnectWithoutUserInput | UserPriceListCreateOrConnectWithoutUserInput[]
    upsert?: UserPriceListUpsertWithWhereUniqueWithoutUserInput | UserPriceListUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserPriceListCreateManyUserInputEnvelope
    set?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    disconnect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    delete?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    connect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    update?: UserPriceListUpdateWithWhereUniqueWithoutUserInput | UserPriceListUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserPriceListUpdateManyWithWhereWithoutUserInput | UserPriceListUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserPriceListScalarWhereInput | UserPriceListScalarWhereInput[]
  }

  export type UserPriceListUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserPriceListCreateWithoutUserInput, UserPriceListUncheckedCreateWithoutUserInput> | UserPriceListCreateWithoutUserInput[] | UserPriceListUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPriceListCreateOrConnectWithoutUserInput | UserPriceListCreateOrConnectWithoutUserInput[]
    upsert?: UserPriceListUpsertWithWhereUniqueWithoutUserInput | UserPriceListUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserPriceListCreateManyUserInputEnvelope
    set?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    disconnect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    delete?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    connect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    update?: UserPriceListUpdateWithWhereUniqueWithoutUserInput | UserPriceListUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserPriceListUpdateManyWithWhereWithoutUserInput | UserPriceListUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserPriceListScalarWhereInput | UserPriceListScalarWhereInput[]
  }

  export type PriceListDetailCreateNestedManyWithoutCollectionInput = {
    create?: XOR<PriceListDetailCreateWithoutCollectionInput, PriceListDetailUncheckedCreateWithoutCollectionInput> | PriceListDetailCreateWithoutCollectionInput[] | PriceListDetailUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: PriceListDetailCreateOrConnectWithoutCollectionInput | PriceListDetailCreateOrConnectWithoutCollectionInput[]
    createMany?: PriceListDetailCreateManyCollectionInputEnvelope
    connect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
  }

  export type ProductCreateNestedManyWithoutCollectionInput = {
    create?: XOR<ProductCreateWithoutCollectionInput, ProductUncheckedCreateWithoutCollectionInput> | ProductCreateWithoutCollectionInput[] | ProductUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCollectionInput | ProductCreateOrConnectWithoutCollectionInput[]
    createMany?: ProductCreateManyCollectionInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type PriceListDetailUncheckedCreateNestedManyWithoutCollectionInput = {
    create?: XOR<PriceListDetailCreateWithoutCollectionInput, PriceListDetailUncheckedCreateWithoutCollectionInput> | PriceListDetailCreateWithoutCollectionInput[] | PriceListDetailUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: PriceListDetailCreateOrConnectWithoutCollectionInput | PriceListDetailCreateOrConnectWithoutCollectionInput[]
    createMany?: PriceListDetailCreateManyCollectionInputEnvelope
    connect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutCollectionInput = {
    create?: XOR<ProductCreateWithoutCollectionInput, ProductUncheckedCreateWithoutCollectionInput> | ProductCreateWithoutCollectionInput[] | ProductUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCollectionInput | ProductCreateOrConnectWithoutCollectionInput[]
    createMany?: ProductCreateManyCollectionInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type PriceListDetailUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<PriceListDetailCreateWithoutCollectionInput, PriceListDetailUncheckedCreateWithoutCollectionInput> | PriceListDetailCreateWithoutCollectionInput[] | PriceListDetailUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: PriceListDetailCreateOrConnectWithoutCollectionInput | PriceListDetailCreateOrConnectWithoutCollectionInput[]
    upsert?: PriceListDetailUpsertWithWhereUniqueWithoutCollectionInput | PriceListDetailUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: PriceListDetailCreateManyCollectionInputEnvelope
    set?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    disconnect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    delete?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    connect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    update?: PriceListDetailUpdateWithWhereUniqueWithoutCollectionInput | PriceListDetailUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: PriceListDetailUpdateManyWithWhereWithoutCollectionInput | PriceListDetailUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: PriceListDetailScalarWhereInput | PriceListDetailScalarWhereInput[]
  }

  export type ProductUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<ProductCreateWithoutCollectionInput, ProductUncheckedCreateWithoutCollectionInput> | ProductCreateWithoutCollectionInput[] | ProductUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCollectionInput | ProductCreateOrConnectWithoutCollectionInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCollectionInput | ProductUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: ProductCreateManyCollectionInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCollectionInput | ProductUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCollectionInput | ProductUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type PriceListDetailUncheckedUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<PriceListDetailCreateWithoutCollectionInput, PriceListDetailUncheckedCreateWithoutCollectionInput> | PriceListDetailCreateWithoutCollectionInput[] | PriceListDetailUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: PriceListDetailCreateOrConnectWithoutCollectionInput | PriceListDetailCreateOrConnectWithoutCollectionInput[]
    upsert?: PriceListDetailUpsertWithWhereUniqueWithoutCollectionInput | PriceListDetailUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: PriceListDetailCreateManyCollectionInputEnvelope
    set?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    disconnect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    delete?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    connect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    update?: PriceListDetailUpdateWithWhereUniqueWithoutCollectionInput | PriceListDetailUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: PriceListDetailUpdateManyWithWhereWithoutCollectionInput | PriceListDetailUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: PriceListDetailScalarWhereInput | PriceListDetailScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<ProductCreateWithoutCollectionInput, ProductUncheckedCreateWithoutCollectionInput> | ProductCreateWithoutCollectionInput[] | ProductUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCollectionInput | ProductCreateOrConnectWithoutCollectionInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCollectionInput | ProductUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: ProductCreateManyCollectionInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCollectionInput | ProductUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCollectionInput | ProductUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type CollectionCreateNestedOneWithoutProductsInput = {
    create?: XOR<CollectionCreateWithoutProductsInput, CollectionUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CollectionCreateOrConnectWithoutProductsInput
    connect?: CollectionWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CollectionUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<CollectionCreateWithoutProductsInput, CollectionUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CollectionCreateOrConnectWithoutProductsInput
    upsert?: CollectionUpsertWithoutProductsInput
    connect?: CollectionWhereUniqueInput
    update?: XOR<XOR<CollectionUpdateToOneWithWhereWithoutProductsInput, CollectionUpdateWithoutProductsInput>, CollectionUncheckedUpdateWithoutProductsInput>
  }

  export type PriceListDetailCreateNestedManyWithoutPriceListInput = {
    create?: XOR<PriceListDetailCreateWithoutPriceListInput, PriceListDetailUncheckedCreateWithoutPriceListInput> | PriceListDetailCreateWithoutPriceListInput[] | PriceListDetailUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: PriceListDetailCreateOrConnectWithoutPriceListInput | PriceListDetailCreateOrConnectWithoutPriceListInput[]
    createMany?: PriceListDetailCreateManyPriceListInputEnvelope
    connect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
  }

  export type UserPriceListCreateNestedManyWithoutPriceListInput = {
    create?: XOR<UserPriceListCreateWithoutPriceListInput, UserPriceListUncheckedCreateWithoutPriceListInput> | UserPriceListCreateWithoutPriceListInput[] | UserPriceListUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: UserPriceListCreateOrConnectWithoutPriceListInput | UserPriceListCreateOrConnectWithoutPriceListInput[]
    createMany?: UserPriceListCreateManyPriceListInputEnvelope
    connect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
  }

  export type PriceListDetailUncheckedCreateNestedManyWithoutPriceListInput = {
    create?: XOR<PriceListDetailCreateWithoutPriceListInput, PriceListDetailUncheckedCreateWithoutPriceListInput> | PriceListDetailCreateWithoutPriceListInput[] | PriceListDetailUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: PriceListDetailCreateOrConnectWithoutPriceListInput | PriceListDetailCreateOrConnectWithoutPriceListInput[]
    createMany?: PriceListDetailCreateManyPriceListInputEnvelope
    connect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
  }

  export type UserPriceListUncheckedCreateNestedManyWithoutPriceListInput = {
    create?: XOR<UserPriceListCreateWithoutPriceListInput, UserPriceListUncheckedCreateWithoutPriceListInput> | UserPriceListCreateWithoutPriceListInput[] | UserPriceListUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: UserPriceListCreateOrConnectWithoutPriceListInput | UserPriceListCreateOrConnectWithoutPriceListInput[]
    createMany?: UserPriceListCreateManyPriceListInputEnvelope
    connect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
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

  export type PriceListDetailUpdateManyWithoutPriceListNestedInput = {
    create?: XOR<PriceListDetailCreateWithoutPriceListInput, PriceListDetailUncheckedCreateWithoutPriceListInput> | PriceListDetailCreateWithoutPriceListInput[] | PriceListDetailUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: PriceListDetailCreateOrConnectWithoutPriceListInput | PriceListDetailCreateOrConnectWithoutPriceListInput[]
    upsert?: PriceListDetailUpsertWithWhereUniqueWithoutPriceListInput | PriceListDetailUpsertWithWhereUniqueWithoutPriceListInput[]
    createMany?: PriceListDetailCreateManyPriceListInputEnvelope
    set?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    disconnect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    delete?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    connect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    update?: PriceListDetailUpdateWithWhereUniqueWithoutPriceListInput | PriceListDetailUpdateWithWhereUniqueWithoutPriceListInput[]
    updateMany?: PriceListDetailUpdateManyWithWhereWithoutPriceListInput | PriceListDetailUpdateManyWithWhereWithoutPriceListInput[]
    deleteMany?: PriceListDetailScalarWhereInput | PriceListDetailScalarWhereInput[]
  }

  export type UserPriceListUpdateManyWithoutPriceListNestedInput = {
    create?: XOR<UserPriceListCreateWithoutPriceListInput, UserPriceListUncheckedCreateWithoutPriceListInput> | UserPriceListCreateWithoutPriceListInput[] | UserPriceListUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: UserPriceListCreateOrConnectWithoutPriceListInput | UserPriceListCreateOrConnectWithoutPriceListInput[]
    upsert?: UserPriceListUpsertWithWhereUniqueWithoutPriceListInput | UserPriceListUpsertWithWhereUniqueWithoutPriceListInput[]
    createMany?: UserPriceListCreateManyPriceListInputEnvelope
    set?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    disconnect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    delete?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    connect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    update?: UserPriceListUpdateWithWhereUniqueWithoutPriceListInput | UserPriceListUpdateWithWhereUniqueWithoutPriceListInput[]
    updateMany?: UserPriceListUpdateManyWithWhereWithoutPriceListInput | UserPriceListUpdateManyWithWhereWithoutPriceListInput[]
    deleteMany?: UserPriceListScalarWhereInput | UserPriceListScalarWhereInput[]
  }

  export type PriceListDetailUncheckedUpdateManyWithoutPriceListNestedInput = {
    create?: XOR<PriceListDetailCreateWithoutPriceListInput, PriceListDetailUncheckedCreateWithoutPriceListInput> | PriceListDetailCreateWithoutPriceListInput[] | PriceListDetailUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: PriceListDetailCreateOrConnectWithoutPriceListInput | PriceListDetailCreateOrConnectWithoutPriceListInput[]
    upsert?: PriceListDetailUpsertWithWhereUniqueWithoutPriceListInput | PriceListDetailUpsertWithWhereUniqueWithoutPriceListInput[]
    createMany?: PriceListDetailCreateManyPriceListInputEnvelope
    set?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    disconnect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    delete?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    connect?: PriceListDetailWhereUniqueInput | PriceListDetailWhereUniqueInput[]
    update?: PriceListDetailUpdateWithWhereUniqueWithoutPriceListInput | PriceListDetailUpdateWithWhereUniqueWithoutPriceListInput[]
    updateMany?: PriceListDetailUpdateManyWithWhereWithoutPriceListInput | PriceListDetailUpdateManyWithWhereWithoutPriceListInput[]
    deleteMany?: PriceListDetailScalarWhereInput | PriceListDetailScalarWhereInput[]
  }

  export type UserPriceListUncheckedUpdateManyWithoutPriceListNestedInput = {
    create?: XOR<UserPriceListCreateWithoutPriceListInput, UserPriceListUncheckedCreateWithoutPriceListInput> | UserPriceListCreateWithoutPriceListInput[] | UserPriceListUncheckedCreateWithoutPriceListInput[]
    connectOrCreate?: UserPriceListCreateOrConnectWithoutPriceListInput | UserPriceListCreateOrConnectWithoutPriceListInput[]
    upsert?: UserPriceListUpsertWithWhereUniqueWithoutPriceListInput | UserPriceListUpsertWithWhereUniqueWithoutPriceListInput[]
    createMany?: UserPriceListCreateManyPriceListInputEnvelope
    set?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    disconnect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    delete?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    connect?: UserPriceListWhereUniqueInput | UserPriceListWhereUniqueInput[]
    update?: UserPriceListUpdateWithWhereUniqueWithoutPriceListInput | UserPriceListUpdateWithWhereUniqueWithoutPriceListInput[]
    updateMany?: UserPriceListUpdateManyWithWhereWithoutPriceListInput | UserPriceListUpdateManyWithWhereWithoutPriceListInput[]
    deleteMany?: UserPriceListScalarWhereInput | UserPriceListScalarWhereInput[]
  }

  export type CollectionCreateNestedOneWithoutPriceListDetailInput = {
    create?: XOR<CollectionCreateWithoutPriceListDetailInput, CollectionUncheckedCreateWithoutPriceListDetailInput>
    connectOrCreate?: CollectionCreateOrConnectWithoutPriceListDetailInput
    connect?: CollectionWhereUniqueInput
  }

  export type PriceListCreateNestedOneWithoutPriceListDetailInput = {
    create?: XOR<PriceListCreateWithoutPriceListDetailInput, PriceListUncheckedCreateWithoutPriceListDetailInput>
    connectOrCreate?: PriceListCreateOrConnectWithoutPriceListDetailInput
    connect?: PriceListWhereUniqueInput
  }

  export type CollectionUpdateOneRequiredWithoutPriceListDetailNestedInput = {
    create?: XOR<CollectionCreateWithoutPriceListDetailInput, CollectionUncheckedCreateWithoutPriceListDetailInput>
    connectOrCreate?: CollectionCreateOrConnectWithoutPriceListDetailInput
    upsert?: CollectionUpsertWithoutPriceListDetailInput
    connect?: CollectionWhereUniqueInput
    update?: XOR<XOR<CollectionUpdateToOneWithWhereWithoutPriceListDetailInput, CollectionUpdateWithoutPriceListDetailInput>, CollectionUncheckedUpdateWithoutPriceListDetailInput>
  }

  export type PriceListUpdateOneRequiredWithoutPriceListDetailNestedInput = {
    create?: XOR<PriceListCreateWithoutPriceListDetailInput, PriceListUncheckedCreateWithoutPriceListDetailInput>
    connectOrCreate?: PriceListCreateOrConnectWithoutPriceListDetailInput
    upsert?: PriceListUpsertWithoutPriceListDetailInput
    connect?: PriceListWhereUniqueInput
    update?: XOR<XOR<PriceListUpdateToOneWithWhereWithoutPriceListDetailInput, PriceListUpdateWithoutPriceListDetailInput>, PriceListUncheckedUpdateWithoutPriceListDetailInput>
  }

  export type PriceListCreateNestedOneWithoutUserPriceListInput = {
    create?: XOR<PriceListCreateWithoutUserPriceListInput, PriceListUncheckedCreateWithoutUserPriceListInput>
    connectOrCreate?: PriceListCreateOrConnectWithoutUserPriceListInput
    connect?: PriceListWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutUserPriceListInput = {
    create?: XOR<UserCreateWithoutUserPriceListInput, UserUncheckedCreateWithoutUserPriceListInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserPriceListInput
    connect?: UserWhereUniqueInput
  }

  export type PriceListUpdateOneRequiredWithoutUserPriceListNestedInput = {
    create?: XOR<PriceListCreateWithoutUserPriceListInput, PriceListUncheckedCreateWithoutUserPriceListInput>
    connectOrCreate?: PriceListCreateOrConnectWithoutUserPriceListInput
    upsert?: PriceListUpsertWithoutUserPriceListInput
    connect?: PriceListWhereUniqueInput
    update?: XOR<XOR<PriceListUpdateToOneWithWhereWithoutUserPriceListInput, PriceListUpdateWithoutUserPriceListInput>, PriceListUncheckedUpdateWithoutUserPriceListInput>
  }

  export type UserUpdateOneRequiredWithoutUserPriceListNestedInput = {
    create?: XOR<UserCreateWithoutUserPriceListInput, UserUncheckedCreateWithoutUserPriceListInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserPriceListInput
    upsert?: UserUpsertWithoutUserPriceListInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserPriceListInput, UserUpdateWithoutUserPriceListInput>, UserUncheckedUpdateWithoutUserPriceListInput>
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

  export type UserCreateWithoutUserTypeInput = {
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
    UserPriceList?: UserPriceListCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUserTypeInput = {
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
    UserPriceList?: UserPriceListUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUserTypeInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserTypeInput, UserUncheckedCreateWithoutUserTypeInput>
  }

  export type UserCreateManyUserTypeInputEnvelope = {
    data: UserCreateManyUserTypeInput | UserCreateManyUserTypeInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutUserTypeInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutUserTypeInput, UserUncheckedUpdateWithoutUserTypeInput>
    create: XOR<UserCreateWithoutUserTypeInput, UserUncheckedCreateWithoutUserTypeInput>
  }

  export type UserUpdateWithWhereUniqueWithoutUserTypeInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutUserTypeInput, UserUncheckedUpdateWithoutUserTypeInput>
  }

  export type UserUpdateManyWithWhereWithoutUserTypeInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutUserTypeInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    credit?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    debit?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolFilter<"User"> | boolean
    password?: StringFilter<"User"> | string
    phoneNumber?: StringNullableFilter<"User"> | string | null
    surname?: StringFilter<"User"> | string
    userId?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    userTypeId?: IntFilter<"User"> | number
  }

  export type UserTypeCreateWithoutUsersInput = {
    name: string
  }

  export type UserTypeUncheckedCreateWithoutUsersInput = {
    id?: number
    name: string
  }

  export type UserTypeCreateOrConnectWithoutUsersInput = {
    where: UserTypeWhereUniqueInput
    create: XOR<UserTypeCreateWithoutUsersInput, UserTypeUncheckedCreateWithoutUsersInput>
  }

  export type UserPriceListCreateWithoutUserInput = {
    user_price_list_id?: string
    created_at?: Date | string
    updated_at?: Date | string
    PriceList: PriceListCreateNestedOneWithoutUserPriceListInput
  }

  export type UserPriceListUncheckedCreateWithoutUserInput = {
    user_price_list_id?: string
    price_list_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPriceListCreateOrConnectWithoutUserInput = {
    where: UserPriceListWhereUniqueInput
    create: XOR<UserPriceListCreateWithoutUserInput, UserPriceListUncheckedCreateWithoutUserInput>
  }

  export type UserPriceListCreateManyUserInputEnvelope = {
    data: UserPriceListCreateManyUserInput | UserPriceListCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserTypeUpsertWithoutUsersInput = {
    update: XOR<UserTypeUpdateWithoutUsersInput, UserTypeUncheckedUpdateWithoutUsersInput>
    create: XOR<UserTypeCreateWithoutUsersInput, UserTypeUncheckedCreateWithoutUsersInput>
    where?: UserTypeWhereInput
  }

  export type UserTypeUpdateToOneWithWhereWithoutUsersInput = {
    where?: UserTypeWhereInput
    data: XOR<UserTypeUpdateWithoutUsersInput, UserTypeUncheckedUpdateWithoutUsersInput>
  }

  export type UserTypeUpdateWithoutUsersInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type UserTypeUncheckedUpdateWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type UserPriceListUpsertWithWhereUniqueWithoutUserInput = {
    where: UserPriceListWhereUniqueInput
    update: XOR<UserPriceListUpdateWithoutUserInput, UserPriceListUncheckedUpdateWithoutUserInput>
    create: XOR<UserPriceListCreateWithoutUserInput, UserPriceListUncheckedCreateWithoutUserInput>
  }

  export type UserPriceListUpdateWithWhereUniqueWithoutUserInput = {
    where: UserPriceListWhereUniqueInput
    data: XOR<UserPriceListUpdateWithoutUserInput, UserPriceListUncheckedUpdateWithoutUserInput>
  }

  export type UserPriceListUpdateManyWithWhereWithoutUserInput = {
    where: UserPriceListScalarWhereInput
    data: XOR<UserPriceListUpdateManyMutationInput, UserPriceListUncheckedUpdateManyWithoutUserInput>
  }

  export type UserPriceListScalarWhereInput = {
    AND?: UserPriceListScalarWhereInput | UserPriceListScalarWhereInput[]
    OR?: UserPriceListScalarWhereInput[]
    NOT?: UserPriceListScalarWhereInput | UserPriceListScalarWhereInput[]
    user_price_list_id?: StringFilter<"UserPriceList"> | string
    user_id?: StringFilter<"UserPriceList"> | string
    price_list_id?: StringFilter<"UserPriceList"> | string
    created_at?: DateTimeFilter<"UserPriceList"> | Date | string
    updated_at?: DateTimeFilter<"UserPriceList"> | Date | string
  }

  export type PriceListDetailCreateWithoutCollectionInput = {
    price_list_detail_id?: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    PriceList: PriceListCreateNestedOneWithoutPriceListDetailInput
  }

  export type PriceListDetailUncheckedCreateWithoutCollectionInput = {
    price_list_detail_id?: string
    price_list_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PriceListDetailCreateOrConnectWithoutCollectionInput = {
    where: PriceListDetailWhereUniqueInput
    create: XOR<PriceListDetailCreateWithoutCollectionInput, PriceListDetailUncheckedCreateWithoutCollectionInput>
  }

  export type PriceListDetailCreateManyCollectionInputEnvelope = {
    data: PriceListDetailCreateManyCollectionInput | PriceListDetailCreateManyCollectionInput[]
    skipDuplicates?: boolean
  }

  export type ProductCreateWithoutCollectionInput = {
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

  export type ProductUncheckedCreateWithoutCollectionInput = {
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

  export type ProductCreateOrConnectWithoutCollectionInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutCollectionInput, ProductUncheckedCreateWithoutCollectionInput>
  }

  export type ProductCreateManyCollectionInputEnvelope = {
    data: ProductCreateManyCollectionInput | ProductCreateManyCollectionInput[]
    skipDuplicates?: boolean
  }

  export type PriceListDetailUpsertWithWhereUniqueWithoutCollectionInput = {
    where: PriceListDetailWhereUniqueInput
    update: XOR<PriceListDetailUpdateWithoutCollectionInput, PriceListDetailUncheckedUpdateWithoutCollectionInput>
    create: XOR<PriceListDetailCreateWithoutCollectionInput, PriceListDetailUncheckedCreateWithoutCollectionInput>
  }

  export type PriceListDetailUpdateWithWhereUniqueWithoutCollectionInput = {
    where: PriceListDetailWhereUniqueInput
    data: XOR<PriceListDetailUpdateWithoutCollectionInput, PriceListDetailUncheckedUpdateWithoutCollectionInput>
  }

  export type PriceListDetailUpdateManyWithWhereWithoutCollectionInput = {
    where: PriceListDetailScalarWhereInput
    data: XOR<PriceListDetailUpdateManyMutationInput, PriceListDetailUncheckedUpdateManyWithoutCollectionInput>
  }

  export type PriceListDetailScalarWhereInput = {
    AND?: PriceListDetailScalarWhereInput | PriceListDetailScalarWhereInput[]
    OR?: PriceListDetailScalarWhereInput[]
    NOT?: PriceListDetailScalarWhereInput | PriceListDetailScalarWhereInput[]
    price_list_detail_id?: StringFilter<"PriceListDetail"> | string
    price_list_id?: StringFilter<"PriceListDetail"> | string
    collection_id?: StringFilter<"PriceListDetail"> | string
    price_per_square_meter?: DecimalFilter<"PriceListDetail"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"PriceListDetail"> | Date | string
    updated_at?: DateTimeFilter<"PriceListDetail"> | Date | string
  }

  export type ProductUpsertWithWhereUniqueWithoutCollectionInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutCollectionInput, ProductUncheckedUpdateWithoutCollectionInput>
    create: XOR<ProductCreateWithoutCollectionInput, ProductUncheckedCreateWithoutCollectionInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutCollectionInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutCollectionInput, ProductUncheckedUpdateWithoutCollectionInput>
  }

  export type ProductUpdateManyWithWhereWithoutCollectionInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutCollectionInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    productId?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    stock?: IntFilter<"Product"> | number
    width?: FloatFilter<"Product"> | number
    height?: FloatFilter<"Product"> | number
    cut?: BoolFilter<"Product"> | boolean
    productImage?: StringNullableFilter<"Product"> | string | null
    collectionId?: StringFilter<"Product"> | string
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    collection_name?: StringNullableFilter<"Product"> | string | null
  }

  export type CollectionCreateWithoutProductsInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    PriceListDetail?: PriceListDetailCreateNestedManyWithoutCollectionInput
  }

  export type CollectionUncheckedCreateWithoutProductsInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    PriceListDetail?: PriceListDetailUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type CollectionCreateOrConnectWithoutProductsInput = {
    where: CollectionWhereUniqueInput
    create: XOR<CollectionCreateWithoutProductsInput, CollectionUncheckedCreateWithoutProductsInput>
  }

  export type CollectionUpsertWithoutProductsInput = {
    update: XOR<CollectionUpdateWithoutProductsInput, CollectionUncheckedUpdateWithoutProductsInput>
    create: XOR<CollectionCreateWithoutProductsInput, CollectionUncheckedCreateWithoutProductsInput>
    where?: CollectionWhereInput
  }

  export type CollectionUpdateToOneWithWhereWithoutProductsInput = {
    where?: CollectionWhereInput
    data: XOR<CollectionUpdateWithoutProductsInput, CollectionUncheckedUpdateWithoutProductsInput>
  }

  export type CollectionUpdateWithoutProductsInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    PriceListDetail?: PriceListDetailUpdateManyWithoutCollectionNestedInput
  }

  export type CollectionUncheckedUpdateWithoutProductsInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    PriceListDetail?: PriceListDetailUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type PriceListDetailCreateWithoutPriceListInput = {
    price_list_detail_id?: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    Collection: CollectionCreateNestedOneWithoutPriceListDetailInput
  }

  export type PriceListDetailUncheckedCreateWithoutPriceListInput = {
    price_list_detail_id?: string
    collection_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PriceListDetailCreateOrConnectWithoutPriceListInput = {
    where: PriceListDetailWhereUniqueInput
    create: XOR<PriceListDetailCreateWithoutPriceListInput, PriceListDetailUncheckedCreateWithoutPriceListInput>
  }

  export type PriceListDetailCreateManyPriceListInputEnvelope = {
    data: PriceListDetailCreateManyPriceListInput | PriceListDetailCreateManyPriceListInput[]
    skipDuplicates?: boolean
  }

  export type UserPriceListCreateWithoutPriceListInput = {
    user_price_list_id?: string
    created_at?: Date | string
    updated_at?: Date | string
    User: UserCreateNestedOneWithoutUserPriceListInput
  }

  export type UserPriceListUncheckedCreateWithoutPriceListInput = {
    user_price_list_id?: string
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPriceListCreateOrConnectWithoutPriceListInput = {
    where: UserPriceListWhereUniqueInput
    create: XOR<UserPriceListCreateWithoutPriceListInput, UserPriceListUncheckedCreateWithoutPriceListInput>
  }

  export type UserPriceListCreateManyPriceListInputEnvelope = {
    data: UserPriceListCreateManyPriceListInput | UserPriceListCreateManyPriceListInput[]
    skipDuplicates?: boolean
  }

  export type PriceListDetailUpsertWithWhereUniqueWithoutPriceListInput = {
    where: PriceListDetailWhereUniqueInput
    update: XOR<PriceListDetailUpdateWithoutPriceListInput, PriceListDetailUncheckedUpdateWithoutPriceListInput>
    create: XOR<PriceListDetailCreateWithoutPriceListInput, PriceListDetailUncheckedCreateWithoutPriceListInput>
  }

  export type PriceListDetailUpdateWithWhereUniqueWithoutPriceListInput = {
    where: PriceListDetailWhereUniqueInput
    data: XOR<PriceListDetailUpdateWithoutPriceListInput, PriceListDetailUncheckedUpdateWithoutPriceListInput>
  }

  export type PriceListDetailUpdateManyWithWhereWithoutPriceListInput = {
    where: PriceListDetailScalarWhereInput
    data: XOR<PriceListDetailUpdateManyMutationInput, PriceListDetailUncheckedUpdateManyWithoutPriceListInput>
  }

  export type UserPriceListUpsertWithWhereUniqueWithoutPriceListInput = {
    where: UserPriceListWhereUniqueInput
    update: XOR<UserPriceListUpdateWithoutPriceListInput, UserPriceListUncheckedUpdateWithoutPriceListInput>
    create: XOR<UserPriceListCreateWithoutPriceListInput, UserPriceListUncheckedCreateWithoutPriceListInput>
  }

  export type UserPriceListUpdateWithWhereUniqueWithoutPriceListInput = {
    where: UserPriceListWhereUniqueInput
    data: XOR<UserPriceListUpdateWithoutPriceListInput, UserPriceListUncheckedUpdateWithoutPriceListInput>
  }

  export type UserPriceListUpdateManyWithWhereWithoutPriceListInput = {
    where: UserPriceListScalarWhereInput
    data: XOR<UserPriceListUpdateManyMutationInput, UserPriceListUncheckedUpdateManyWithoutPriceListInput>
  }

  export type CollectionCreateWithoutPriceListDetailInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutCollectionInput
  }

  export type CollectionUncheckedCreateWithoutPriceListDetailInput = {
    collectionId?: string
    name: string
    description?: string | null
    code: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type CollectionCreateOrConnectWithoutPriceListDetailInput = {
    where: CollectionWhereUniqueInput
    create: XOR<CollectionCreateWithoutPriceListDetailInput, CollectionUncheckedCreateWithoutPriceListDetailInput>
  }

  export type PriceListCreateWithoutPriceListDetailInput = {
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
    UserPriceList?: UserPriceListCreateNestedManyWithoutPriceListInput
  }

  export type PriceListUncheckedCreateWithoutPriceListDetailInput = {
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
    UserPriceList?: UserPriceListUncheckedCreateNestedManyWithoutPriceListInput
  }

  export type PriceListCreateOrConnectWithoutPriceListDetailInput = {
    where: PriceListWhereUniqueInput
    create: XOR<PriceListCreateWithoutPriceListDetailInput, PriceListUncheckedCreateWithoutPriceListDetailInput>
  }

  export type CollectionUpsertWithoutPriceListDetailInput = {
    update: XOR<CollectionUpdateWithoutPriceListDetailInput, CollectionUncheckedUpdateWithoutPriceListDetailInput>
    create: XOR<CollectionCreateWithoutPriceListDetailInput, CollectionUncheckedCreateWithoutPriceListDetailInput>
    where?: CollectionWhereInput
  }

  export type CollectionUpdateToOneWithWhereWithoutPriceListDetailInput = {
    where?: CollectionWhereInput
    data: XOR<CollectionUpdateWithoutPriceListDetailInput, CollectionUncheckedUpdateWithoutPriceListDetailInput>
  }

  export type CollectionUpdateWithoutPriceListDetailInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutCollectionNestedInput
  }

  export type CollectionUncheckedUpdateWithoutPriceListDetailInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    code?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type PriceListUpsertWithoutPriceListDetailInput = {
    update: XOR<PriceListUpdateWithoutPriceListDetailInput, PriceListUncheckedUpdateWithoutPriceListDetailInput>
    create: XOR<PriceListCreateWithoutPriceListDetailInput, PriceListUncheckedCreateWithoutPriceListDetailInput>
    where?: PriceListWhereInput
  }

  export type PriceListUpdateToOneWithWhereWithoutPriceListDetailInput = {
    where?: PriceListWhereInput
    data: XOR<PriceListUpdateWithoutPriceListDetailInput, PriceListUncheckedUpdateWithoutPriceListDetailInput>
  }

  export type PriceListUpdateWithoutPriceListDetailInput = {
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
    UserPriceList?: UserPriceListUpdateManyWithoutPriceListNestedInput
  }

  export type PriceListUncheckedUpdateWithoutPriceListDetailInput = {
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
    UserPriceList?: UserPriceListUncheckedUpdateManyWithoutPriceListNestedInput
  }

  export type PriceListCreateWithoutUserPriceListInput = {
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
    PriceListDetail?: PriceListDetailCreateNestedManyWithoutPriceListInput
  }

  export type PriceListUncheckedCreateWithoutUserPriceListInput = {
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
    PriceListDetail?: PriceListDetailUncheckedCreateNestedManyWithoutPriceListInput
  }

  export type PriceListCreateOrConnectWithoutUserPriceListInput = {
    where: PriceListWhereUniqueInput
    create: XOR<PriceListCreateWithoutUserPriceListInput, PriceListUncheckedCreateWithoutUserPriceListInput>
  }

  export type UserCreateWithoutUserPriceListInput = {
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
    userType: UserTypeCreateNestedOneWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutUserPriceListInput = {
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

  export type UserCreateOrConnectWithoutUserPriceListInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserPriceListInput, UserUncheckedCreateWithoutUserPriceListInput>
  }

  export type PriceListUpsertWithoutUserPriceListInput = {
    update: XOR<PriceListUpdateWithoutUserPriceListInput, PriceListUncheckedUpdateWithoutUserPriceListInput>
    create: XOR<PriceListCreateWithoutUserPriceListInput, PriceListUncheckedCreateWithoutUserPriceListInput>
    where?: PriceListWhereInput
  }

  export type PriceListUpdateToOneWithWhereWithoutUserPriceListInput = {
    where?: PriceListWhereInput
    data: XOR<PriceListUpdateWithoutUserPriceListInput, PriceListUncheckedUpdateWithoutUserPriceListInput>
  }

  export type PriceListUpdateWithoutUserPriceListInput = {
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
    PriceListDetail?: PriceListDetailUpdateManyWithoutPriceListNestedInput
  }

  export type PriceListUncheckedUpdateWithoutUserPriceListInput = {
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
    PriceListDetail?: PriceListDetailUncheckedUpdateManyWithoutPriceListNestedInput
  }

  export type UserUpsertWithoutUserPriceListInput = {
    update: XOR<UserUpdateWithoutUserPriceListInput, UserUncheckedUpdateWithoutUserPriceListInput>
    create: XOR<UserCreateWithoutUserPriceListInput, UserUncheckedCreateWithoutUserPriceListInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserPriceListInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserPriceListInput, UserUncheckedUpdateWithoutUserPriceListInput>
  }

  export type UserUpdateWithoutUserPriceListInput = {
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
    userType?: UserTypeUpdateOneRequiredWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutUserPriceListInput = {
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

  export type UserCreateManyUserTypeInput = {
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

  export type UserUpdateWithoutUserTypeInput = {
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
    UserPriceList?: UserPriceListUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUserTypeInput = {
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
    UserPriceList?: UserPriceListUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutUserTypeInput = {
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

  export type UserPriceListCreateManyUserInput = {
    user_price_list_id?: string
    price_list_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPriceListUpdateWithoutUserInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    PriceList?: PriceListUpdateOneRequiredWithoutUserPriceListNestedInput
  }

  export type UserPriceListUncheckedUpdateWithoutUserInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPriceListUncheckedUpdateManyWithoutUserInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceListDetailCreateManyCollectionInput = {
    price_list_detail_id?: string
    price_list_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductCreateManyCollectionInput = {
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

  export type PriceListDetailUpdateWithoutCollectionInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    PriceList?: PriceListUpdateOneRequiredWithoutPriceListDetailNestedInput
  }

  export type PriceListDetailUncheckedUpdateWithoutCollectionInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceListDetailUncheckedUpdateManyWithoutCollectionInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_list_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpdateWithoutCollectionInput = {
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

  export type ProductUncheckedUpdateWithoutCollectionInput = {
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

  export type ProductUncheckedUpdateManyWithoutCollectionInput = {
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

  export type PriceListDetailCreateManyPriceListInput = {
    price_list_detail_id?: string
    collection_id: string
    price_per_square_meter: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPriceListCreateManyPriceListInput = {
    user_price_list_id?: string
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PriceListDetailUpdateWithoutPriceListInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    Collection?: CollectionUpdateOneRequiredWithoutPriceListDetailNestedInput
  }

  export type PriceListDetailUncheckedUpdateWithoutPriceListInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    collection_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceListDetailUncheckedUpdateManyWithoutPriceListInput = {
    price_list_detail_id?: StringFieldUpdateOperationsInput | string
    collection_id?: StringFieldUpdateOperationsInput | string
    price_per_square_meter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPriceListUpdateWithoutPriceListInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    User?: UserUpdateOneRequiredWithoutUserPriceListNestedInput
  }

  export type UserPriceListUncheckedUpdateWithoutPriceListInput = {
    user_price_list_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPriceListUncheckedUpdateManyWithoutPriceListInput = {
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