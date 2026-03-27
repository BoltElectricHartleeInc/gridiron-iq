
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
 * Model DraftSession
 * 
 */
export type DraftSession = $Result.DefaultSelection<Prisma.$DraftSessionPayload>
/**
 * Model DraftPick
 * 
 */
export type DraftPick = $Result.DefaultSelection<Prisma.$DraftPickPayload>
/**
 * Model GameResult
 * 
 */
export type GameResult = $Result.DefaultSelection<Prisma.$GameResultPayload>
/**
 * Model ScoutingReport
 * 
 */
export type ScoutingReport = $Result.DefaultSelection<Prisma.$ScoutingReportPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more DraftSessions
 * const draftSessions = await prisma.draftSession.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
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
   * // Fetch zero or more DraftSessions
   * const draftSessions = await prisma.draftSession.findMany()
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
   * `prisma.draftSession`: Exposes CRUD operations for the **DraftSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DraftSessions
    * const draftSessions = await prisma.draftSession.findMany()
    * ```
    */
  get draftSession(): Prisma.DraftSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.draftPick`: Exposes CRUD operations for the **DraftPick** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DraftPicks
    * const draftPicks = await prisma.draftPick.findMany()
    * ```
    */
  get draftPick(): Prisma.DraftPickDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gameResult`: Exposes CRUD operations for the **GameResult** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GameResults
    * const gameResults = await prisma.gameResult.findMany()
    * ```
    */
  get gameResult(): Prisma.GameResultDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.scoutingReport`: Exposes CRUD operations for the **ScoutingReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ScoutingReports
    * const scoutingReports = await prisma.scoutingReport.findMany()
    * ```
    */
  get scoutingReport(): Prisma.ScoutingReportDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
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
    DraftSession: 'DraftSession',
    DraftPick: 'DraftPick',
    GameResult: 'GameResult',
    ScoutingReport: 'ScoutingReport'
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
      modelProps: "draftSession" | "draftPick" | "gameResult" | "scoutingReport"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      DraftSession: {
        payload: Prisma.$DraftSessionPayload<ExtArgs>
        fields: Prisma.DraftSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DraftSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DraftSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>
          }
          findFirst: {
            args: Prisma.DraftSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DraftSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>
          }
          findMany: {
            args: Prisma.DraftSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>[]
          }
          create: {
            args: Prisma.DraftSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>
          }
          createMany: {
            args: Prisma.DraftSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DraftSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>[]
          }
          delete: {
            args: Prisma.DraftSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>
          }
          update: {
            args: Prisma.DraftSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>
          }
          deleteMany: {
            args: Prisma.DraftSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DraftSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DraftSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>[]
          }
          upsert: {
            args: Prisma.DraftSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftSessionPayload>
          }
          aggregate: {
            args: Prisma.DraftSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDraftSession>
          }
          groupBy: {
            args: Prisma.DraftSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<DraftSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.DraftSessionCountArgs<ExtArgs>
            result: $Utils.Optional<DraftSessionCountAggregateOutputType> | number
          }
        }
      }
      DraftPick: {
        payload: Prisma.$DraftPickPayload<ExtArgs>
        fields: Prisma.DraftPickFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DraftPickFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DraftPickFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>
          }
          findFirst: {
            args: Prisma.DraftPickFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DraftPickFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>
          }
          findMany: {
            args: Prisma.DraftPickFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>[]
          }
          create: {
            args: Prisma.DraftPickCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>
          }
          createMany: {
            args: Prisma.DraftPickCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DraftPickCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>[]
          }
          delete: {
            args: Prisma.DraftPickDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>
          }
          update: {
            args: Prisma.DraftPickUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>
          }
          deleteMany: {
            args: Prisma.DraftPickDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DraftPickUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DraftPickUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>[]
          }
          upsert: {
            args: Prisma.DraftPickUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>
          }
          aggregate: {
            args: Prisma.DraftPickAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDraftPick>
          }
          groupBy: {
            args: Prisma.DraftPickGroupByArgs<ExtArgs>
            result: $Utils.Optional<DraftPickGroupByOutputType>[]
          }
          count: {
            args: Prisma.DraftPickCountArgs<ExtArgs>
            result: $Utils.Optional<DraftPickCountAggregateOutputType> | number
          }
        }
      }
      GameResult: {
        payload: Prisma.$GameResultPayload<ExtArgs>
        fields: Prisma.GameResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          findFirst: {
            args: Prisma.GameResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          findMany: {
            args: Prisma.GameResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>[]
          }
          create: {
            args: Prisma.GameResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          createMany: {
            args: Prisma.GameResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GameResultCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>[]
          }
          delete: {
            args: Prisma.GameResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          update: {
            args: Prisma.GameResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          deleteMany: {
            args: Prisma.GameResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GameResultUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>[]
          }
          upsert: {
            args: Prisma.GameResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          aggregate: {
            args: Prisma.GameResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGameResult>
          }
          groupBy: {
            args: Prisma.GameResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameResultCountArgs<ExtArgs>
            result: $Utils.Optional<GameResultCountAggregateOutputType> | number
          }
        }
      }
      ScoutingReport: {
        payload: Prisma.$ScoutingReportPayload<ExtArgs>
        fields: Prisma.ScoutingReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScoutingReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScoutingReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>
          }
          findFirst: {
            args: Prisma.ScoutingReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScoutingReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>
          }
          findMany: {
            args: Prisma.ScoutingReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>[]
          }
          create: {
            args: Prisma.ScoutingReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>
          }
          createMany: {
            args: Prisma.ScoutingReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScoutingReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>[]
          }
          delete: {
            args: Prisma.ScoutingReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>
          }
          update: {
            args: Prisma.ScoutingReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>
          }
          deleteMany: {
            args: Prisma.ScoutingReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScoutingReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScoutingReportUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>[]
          }
          upsert: {
            args: Prisma.ScoutingReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScoutingReportPayload>
          }
          aggregate: {
            args: Prisma.ScoutingReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScoutingReport>
          }
          groupBy: {
            args: Prisma.ScoutingReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScoutingReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScoutingReportCountArgs<ExtArgs>
            result: $Utils.Optional<ScoutingReportCountAggregateOutputType> | number
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
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
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
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
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
    draftSession?: DraftSessionOmit
    draftPick?: DraftPickOmit
    gameResult?: GameResultOmit
    scoutingReport?: ScoutingReportOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
   * Count Type DraftSessionCountOutputType
   */

  export type DraftSessionCountOutputType = {
    picks: number
  }

  export type DraftSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    picks?: boolean | DraftSessionCountOutputTypeCountPicksArgs
  }

  // Custom InputTypes
  /**
   * DraftSessionCountOutputType without action
   */
  export type DraftSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSessionCountOutputType
     */
    select?: DraftSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DraftSessionCountOutputType without action
   */
  export type DraftSessionCountOutputTypeCountPicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DraftPickWhereInput
  }


  /**
   * Models
   */

  /**
   * Model DraftSession
   */

  export type AggregateDraftSession = {
    _count: DraftSessionCountAggregateOutputType | null
    _avg: DraftSessionAvgAggregateOutputType | null
    _sum: DraftSessionSumAggregateOutputType | null
    _min: DraftSessionMinAggregateOutputType | null
    _max: DraftSessionMaxAggregateOutputType | null
  }

  export type DraftSessionAvgAggregateOutputType = {
    gradeScore: number | null
  }

  export type DraftSessionSumAggregateOutputType = {
    gradeScore: number | null
  }

  export type DraftSessionMinAggregateOutputType = {
    id: string | null
    teamId: string | null
    teamName: string | null
    status: string | null
    startedAt: Date | null
    completedAt: Date | null
    grade: string | null
    gradeScore: number | null
  }

  export type DraftSessionMaxAggregateOutputType = {
    id: string | null
    teamId: string | null
    teamName: string | null
    status: string | null
    startedAt: Date | null
    completedAt: Date | null
    grade: string | null
    gradeScore: number | null
  }

  export type DraftSessionCountAggregateOutputType = {
    id: number
    teamId: number
    teamName: number
    status: number
    startedAt: number
    completedAt: number
    grade: number
    gradeScore: number
    _all: number
  }


  export type DraftSessionAvgAggregateInputType = {
    gradeScore?: true
  }

  export type DraftSessionSumAggregateInputType = {
    gradeScore?: true
  }

  export type DraftSessionMinAggregateInputType = {
    id?: true
    teamId?: true
    teamName?: true
    status?: true
    startedAt?: true
    completedAt?: true
    grade?: true
    gradeScore?: true
  }

  export type DraftSessionMaxAggregateInputType = {
    id?: true
    teamId?: true
    teamName?: true
    status?: true
    startedAt?: true
    completedAt?: true
    grade?: true
    gradeScore?: true
  }

  export type DraftSessionCountAggregateInputType = {
    id?: true
    teamId?: true
    teamName?: true
    status?: true
    startedAt?: true
    completedAt?: true
    grade?: true
    gradeScore?: true
    _all?: true
  }

  export type DraftSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DraftSession to aggregate.
     */
    where?: DraftSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DraftSessions to fetch.
     */
    orderBy?: DraftSessionOrderByWithRelationInput | DraftSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DraftSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DraftSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DraftSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DraftSessions
    **/
    _count?: true | DraftSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DraftSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DraftSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DraftSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DraftSessionMaxAggregateInputType
  }

  export type GetDraftSessionAggregateType<T extends DraftSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateDraftSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDraftSession[P]>
      : GetScalarType<T[P], AggregateDraftSession[P]>
  }




  export type DraftSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DraftSessionWhereInput
    orderBy?: DraftSessionOrderByWithAggregationInput | DraftSessionOrderByWithAggregationInput[]
    by: DraftSessionScalarFieldEnum[] | DraftSessionScalarFieldEnum
    having?: DraftSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DraftSessionCountAggregateInputType | true
    _avg?: DraftSessionAvgAggregateInputType
    _sum?: DraftSessionSumAggregateInputType
    _min?: DraftSessionMinAggregateInputType
    _max?: DraftSessionMaxAggregateInputType
  }

  export type DraftSessionGroupByOutputType = {
    id: string
    teamId: string
    teamName: string
    status: string
    startedAt: Date
    completedAt: Date | null
    grade: string | null
    gradeScore: number | null
    _count: DraftSessionCountAggregateOutputType | null
    _avg: DraftSessionAvgAggregateOutputType | null
    _sum: DraftSessionSumAggregateOutputType | null
    _min: DraftSessionMinAggregateOutputType | null
    _max: DraftSessionMaxAggregateOutputType | null
  }

  type GetDraftSessionGroupByPayload<T extends DraftSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DraftSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DraftSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DraftSessionGroupByOutputType[P]>
            : GetScalarType<T[P], DraftSessionGroupByOutputType[P]>
        }
      >
    >


  export type DraftSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    teamName?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    grade?: boolean
    gradeScore?: boolean
    picks?: boolean | DraftSession$picksArgs<ExtArgs>
    _count?: boolean | DraftSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["draftSession"]>

  export type DraftSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    teamName?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    grade?: boolean
    gradeScore?: boolean
  }, ExtArgs["result"]["draftSession"]>

  export type DraftSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    teamName?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    grade?: boolean
    gradeScore?: boolean
  }, ExtArgs["result"]["draftSession"]>

  export type DraftSessionSelectScalar = {
    id?: boolean
    teamId?: boolean
    teamName?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    grade?: boolean
    gradeScore?: boolean
  }

  export type DraftSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "teamId" | "teamName" | "status" | "startedAt" | "completedAt" | "grade" | "gradeScore", ExtArgs["result"]["draftSession"]>
  export type DraftSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    picks?: boolean | DraftSession$picksArgs<ExtArgs>
    _count?: boolean | DraftSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DraftSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DraftSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DraftSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DraftSession"
    objects: {
      picks: Prisma.$DraftPickPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      teamId: string
      teamName: string
      status: string
      startedAt: Date
      completedAt: Date | null
      grade: string | null
      gradeScore: number | null
    }, ExtArgs["result"]["draftSession"]>
    composites: {}
  }

  type DraftSessionGetPayload<S extends boolean | null | undefined | DraftSessionDefaultArgs> = $Result.GetResult<Prisma.$DraftSessionPayload, S>

  type DraftSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DraftSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DraftSessionCountAggregateInputType | true
    }

  export interface DraftSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DraftSession'], meta: { name: 'DraftSession' } }
    /**
     * Find zero or one DraftSession that matches the filter.
     * @param {DraftSessionFindUniqueArgs} args - Arguments to find a DraftSession
     * @example
     * // Get one DraftSession
     * const draftSession = await prisma.draftSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DraftSessionFindUniqueArgs>(args: SelectSubset<T, DraftSessionFindUniqueArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DraftSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DraftSessionFindUniqueOrThrowArgs} args - Arguments to find a DraftSession
     * @example
     * // Get one DraftSession
     * const draftSession = await prisma.draftSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DraftSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, DraftSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DraftSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftSessionFindFirstArgs} args - Arguments to find a DraftSession
     * @example
     * // Get one DraftSession
     * const draftSession = await prisma.draftSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DraftSessionFindFirstArgs>(args?: SelectSubset<T, DraftSessionFindFirstArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DraftSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftSessionFindFirstOrThrowArgs} args - Arguments to find a DraftSession
     * @example
     * // Get one DraftSession
     * const draftSession = await prisma.draftSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DraftSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, DraftSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DraftSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DraftSessions
     * const draftSessions = await prisma.draftSession.findMany()
     * 
     * // Get first 10 DraftSessions
     * const draftSessions = await prisma.draftSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const draftSessionWithIdOnly = await prisma.draftSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DraftSessionFindManyArgs>(args?: SelectSubset<T, DraftSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DraftSession.
     * @param {DraftSessionCreateArgs} args - Arguments to create a DraftSession.
     * @example
     * // Create one DraftSession
     * const DraftSession = await prisma.draftSession.create({
     *   data: {
     *     // ... data to create a DraftSession
     *   }
     * })
     * 
     */
    create<T extends DraftSessionCreateArgs>(args: SelectSubset<T, DraftSessionCreateArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DraftSessions.
     * @param {DraftSessionCreateManyArgs} args - Arguments to create many DraftSessions.
     * @example
     * // Create many DraftSessions
     * const draftSession = await prisma.draftSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DraftSessionCreateManyArgs>(args?: SelectSubset<T, DraftSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DraftSessions and returns the data saved in the database.
     * @param {DraftSessionCreateManyAndReturnArgs} args - Arguments to create many DraftSessions.
     * @example
     * // Create many DraftSessions
     * const draftSession = await prisma.draftSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DraftSessions and only return the `id`
     * const draftSessionWithIdOnly = await prisma.draftSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DraftSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, DraftSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DraftSession.
     * @param {DraftSessionDeleteArgs} args - Arguments to delete one DraftSession.
     * @example
     * // Delete one DraftSession
     * const DraftSession = await prisma.draftSession.delete({
     *   where: {
     *     // ... filter to delete one DraftSession
     *   }
     * })
     * 
     */
    delete<T extends DraftSessionDeleteArgs>(args: SelectSubset<T, DraftSessionDeleteArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DraftSession.
     * @param {DraftSessionUpdateArgs} args - Arguments to update one DraftSession.
     * @example
     * // Update one DraftSession
     * const draftSession = await prisma.draftSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DraftSessionUpdateArgs>(args: SelectSubset<T, DraftSessionUpdateArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DraftSessions.
     * @param {DraftSessionDeleteManyArgs} args - Arguments to filter DraftSessions to delete.
     * @example
     * // Delete a few DraftSessions
     * const { count } = await prisma.draftSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DraftSessionDeleteManyArgs>(args?: SelectSubset<T, DraftSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DraftSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DraftSessions
     * const draftSession = await prisma.draftSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DraftSessionUpdateManyArgs>(args: SelectSubset<T, DraftSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DraftSessions and returns the data updated in the database.
     * @param {DraftSessionUpdateManyAndReturnArgs} args - Arguments to update many DraftSessions.
     * @example
     * // Update many DraftSessions
     * const draftSession = await prisma.draftSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DraftSessions and only return the `id`
     * const draftSessionWithIdOnly = await prisma.draftSession.updateManyAndReturn({
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
    updateManyAndReturn<T extends DraftSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, DraftSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DraftSession.
     * @param {DraftSessionUpsertArgs} args - Arguments to update or create a DraftSession.
     * @example
     * // Update or create a DraftSession
     * const draftSession = await prisma.draftSession.upsert({
     *   create: {
     *     // ... data to create a DraftSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DraftSession we want to update
     *   }
     * })
     */
    upsert<T extends DraftSessionUpsertArgs>(args: SelectSubset<T, DraftSessionUpsertArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DraftSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftSessionCountArgs} args - Arguments to filter DraftSessions to count.
     * @example
     * // Count the number of DraftSessions
     * const count = await prisma.draftSession.count({
     *   where: {
     *     // ... the filter for the DraftSessions we want to count
     *   }
     * })
    **/
    count<T extends DraftSessionCountArgs>(
      args?: Subset<T, DraftSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DraftSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DraftSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DraftSessionAggregateArgs>(args: Subset<T, DraftSessionAggregateArgs>): Prisma.PrismaPromise<GetDraftSessionAggregateType<T>>

    /**
     * Group by DraftSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftSessionGroupByArgs} args - Group by arguments.
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
      T extends DraftSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DraftSessionGroupByArgs['orderBy'] }
        : { orderBy?: DraftSessionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DraftSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDraftSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DraftSession model
   */
  readonly fields: DraftSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DraftSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DraftSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    picks<T extends DraftSession$picksArgs<ExtArgs> = {}>(args?: Subset<T, DraftSession$picksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the DraftSession model
   */
  interface DraftSessionFieldRefs {
    readonly id: FieldRef<"DraftSession", 'String'>
    readonly teamId: FieldRef<"DraftSession", 'String'>
    readonly teamName: FieldRef<"DraftSession", 'String'>
    readonly status: FieldRef<"DraftSession", 'String'>
    readonly startedAt: FieldRef<"DraftSession", 'DateTime'>
    readonly completedAt: FieldRef<"DraftSession", 'DateTime'>
    readonly grade: FieldRef<"DraftSession", 'String'>
    readonly gradeScore: FieldRef<"DraftSession", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * DraftSession findUnique
   */
  export type DraftSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * Filter, which DraftSession to fetch.
     */
    where: DraftSessionWhereUniqueInput
  }

  /**
   * DraftSession findUniqueOrThrow
   */
  export type DraftSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * Filter, which DraftSession to fetch.
     */
    where: DraftSessionWhereUniqueInput
  }

  /**
   * DraftSession findFirst
   */
  export type DraftSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * Filter, which DraftSession to fetch.
     */
    where?: DraftSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DraftSessions to fetch.
     */
    orderBy?: DraftSessionOrderByWithRelationInput | DraftSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DraftSessions.
     */
    cursor?: DraftSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DraftSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DraftSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DraftSessions.
     */
    distinct?: DraftSessionScalarFieldEnum | DraftSessionScalarFieldEnum[]
  }

  /**
   * DraftSession findFirstOrThrow
   */
  export type DraftSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * Filter, which DraftSession to fetch.
     */
    where?: DraftSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DraftSessions to fetch.
     */
    orderBy?: DraftSessionOrderByWithRelationInput | DraftSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DraftSessions.
     */
    cursor?: DraftSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DraftSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DraftSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DraftSessions.
     */
    distinct?: DraftSessionScalarFieldEnum | DraftSessionScalarFieldEnum[]
  }

  /**
   * DraftSession findMany
   */
  export type DraftSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * Filter, which DraftSessions to fetch.
     */
    where?: DraftSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DraftSessions to fetch.
     */
    orderBy?: DraftSessionOrderByWithRelationInput | DraftSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DraftSessions.
     */
    cursor?: DraftSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DraftSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DraftSessions.
     */
    skip?: number
    distinct?: DraftSessionScalarFieldEnum | DraftSessionScalarFieldEnum[]
  }

  /**
   * DraftSession create
   */
  export type DraftSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a DraftSession.
     */
    data: XOR<DraftSessionCreateInput, DraftSessionUncheckedCreateInput>
  }

  /**
   * DraftSession createMany
   */
  export type DraftSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DraftSessions.
     */
    data: DraftSessionCreateManyInput | DraftSessionCreateManyInput[]
  }

  /**
   * DraftSession createManyAndReturn
   */
  export type DraftSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * The data used to create many DraftSessions.
     */
    data: DraftSessionCreateManyInput | DraftSessionCreateManyInput[]
  }

  /**
   * DraftSession update
   */
  export type DraftSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a DraftSession.
     */
    data: XOR<DraftSessionUpdateInput, DraftSessionUncheckedUpdateInput>
    /**
     * Choose, which DraftSession to update.
     */
    where: DraftSessionWhereUniqueInput
  }

  /**
   * DraftSession updateMany
   */
  export type DraftSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DraftSessions.
     */
    data: XOR<DraftSessionUpdateManyMutationInput, DraftSessionUncheckedUpdateManyInput>
    /**
     * Filter which DraftSessions to update
     */
    where?: DraftSessionWhereInput
    /**
     * Limit how many DraftSessions to update.
     */
    limit?: number
  }

  /**
   * DraftSession updateManyAndReturn
   */
  export type DraftSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * The data used to update DraftSessions.
     */
    data: XOR<DraftSessionUpdateManyMutationInput, DraftSessionUncheckedUpdateManyInput>
    /**
     * Filter which DraftSessions to update
     */
    where?: DraftSessionWhereInput
    /**
     * Limit how many DraftSessions to update.
     */
    limit?: number
  }

  /**
   * DraftSession upsert
   */
  export type DraftSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the DraftSession to update in case it exists.
     */
    where: DraftSessionWhereUniqueInput
    /**
     * In case the DraftSession found by the `where` argument doesn't exist, create a new DraftSession with this data.
     */
    create: XOR<DraftSessionCreateInput, DraftSessionUncheckedCreateInput>
    /**
     * In case the DraftSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DraftSessionUpdateInput, DraftSessionUncheckedUpdateInput>
  }

  /**
   * DraftSession delete
   */
  export type DraftSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
    /**
     * Filter which DraftSession to delete.
     */
    where: DraftSessionWhereUniqueInput
  }

  /**
   * DraftSession deleteMany
   */
  export type DraftSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DraftSessions to delete
     */
    where?: DraftSessionWhereInput
    /**
     * Limit how many DraftSessions to delete.
     */
    limit?: number
  }

  /**
   * DraftSession.picks
   */
  export type DraftSession$picksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    where?: DraftPickWhereInput
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[]
    cursor?: DraftPickWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DraftPickScalarFieldEnum | DraftPickScalarFieldEnum[]
  }

  /**
   * DraftSession without action
   */
  export type DraftSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftSession
     */
    select?: DraftSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftSession
     */
    omit?: DraftSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftSessionInclude<ExtArgs> | null
  }


  /**
   * Model DraftPick
   */

  export type AggregateDraftPick = {
    _count: DraftPickCountAggregateOutputType | null
    _avg: DraftPickAvgAggregateOutputType | null
    _sum: DraftPickSumAggregateOutputType | null
    _min: DraftPickMinAggregateOutputType | null
    _max: DraftPickMaxAggregateOutputType | null
  }

  export type DraftPickAvgAggregateOutputType = {
    overall: number | null
    round: number | null
    pickInRound: number | null
    prospectGrade: number | null
  }

  export type DraftPickSumAggregateOutputType = {
    overall: number | null
    round: number | null
    pickInRound: number | null
    prospectGrade: number | null
  }

  export type DraftPickMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    overall: number | null
    round: number | null
    pickInRound: number | null
    teamId: string | null
    teamName: string | null
    prospectId: string | null
    prospectName: string | null
    prospectPosition: string | null
    prospectGrade: number | null
    isUserPick: boolean | null
    isTrade: boolean | null
    createdAt: Date | null
  }

  export type DraftPickMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    overall: number | null
    round: number | null
    pickInRound: number | null
    teamId: string | null
    teamName: string | null
    prospectId: string | null
    prospectName: string | null
    prospectPosition: string | null
    prospectGrade: number | null
    isUserPick: boolean | null
    isTrade: boolean | null
    createdAt: Date | null
  }

  export type DraftPickCountAggregateOutputType = {
    id: number
    sessionId: number
    overall: number
    round: number
    pickInRound: number
    teamId: number
    teamName: number
    prospectId: number
    prospectName: number
    prospectPosition: number
    prospectGrade: number
    isUserPick: number
    isTrade: number
    createdAt: number
    _all: number
  }


  export type DraftPickAvgAggregateInputType = {
    overall?: true
    round?: true
    pickInRound?: true
    prospectGrade?: true
  }

  export type DraftPickSumAggregateInputType = {
    overall?: true
    round?: true
    pickInRound?: true
    prospectGrade?: true
  }

  export type DraftPickMinAggregateInputType = {
    id?: true
    sessionId?: true
    overall?: true
    round?: true
    pickInRound?: true
    teamId?: true
    teamName?: true
    prospectId?: true
    prospectName?: true
    prospectPosition?: true
    prospectGrade?: true
    isUserPick?: true
    isTrade?: true
    createdAt?: true
  }

  export type DraftPickMaxAggregateInputType = {
    id?: true
    sessionId?: true
    overall?: true
    round?: true
    pickInRound?: true
    teamId?: true
    teamName?: true
    prospectId?: true
    prospectName?: true
    prospectPosition?: true
    prospectGrade?: true
    isUserPick?: true
    isTrade?: true
    createdAt?: true
  }

  export type DraftPickCountAggregateInputType = {
    id?: true
    sessionId?: true
    overall?: true
    round?: true
    pickInRound?: true
    teamId?: true
    teamName?: true
    prospectId?: true
    prospectName?: true
    prospectPosition?: true
    prospectGrade?: true
    isUserPick?: true
    isTrade?: true
    createdAt?: true
    _all?: true
  }

  export type DraftPickAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DraftPick to aggregate.
     */
    where?: DraftPickWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DraftPicks to fetch.
     */
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DraftPickWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DraftPicks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DraftPicks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DraftPicks
    **/
    _count?: true | DraftPickCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DraftPickAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DraftPickSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DraftPickMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DraftPickMaxAggregateInputType
  }

  export type GetDraftPickAggregateType<T extends DraftPickAggregateArgs> = {
        [P in keyof T & keyof AggregateDraftPick]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDraftPick[P]>
      : GetScalarType<T[P], AggregateDraftPick[P]>
  }




  export type DraftPickGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DraftPickWhereInput
    orderBy?: DraftPickOrderByWithAggregationInput | DraftPickOrderByWithAggregationInput[]
    by: DraftPickScalarFieldEnum[] | DraftPickScalarFieldEnum
    having?: DraftPickScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DraftPickCountAggregateInputType | true
    _avg?: DraftPickAvgAggregateInputType
    _sum?: DraftPickSumAggregateInputType
    _min?: DraftPickMinAggregateInputType
    _max?: DraftPickMaxAggregateInputType
  }

  export type DraftPickGroupByOutputType = {
    id: string
    sessionId: string
    overall: number
    round: number
    pickInRound: number
    teamId: string
    teamName: string
    prospectId: string
    prospectName: string
    prospectPosition: string
    prospectGrade: number
    isUserPick: boolean
    isTrade: boolean
    createdAt: Date
    _count: DraftPickCountAggregateOutputType | null
    _avg: DraftPickAvgAggregateOutputType | null
    _sum: DraftPickSumAggregateOutputType | null
    _min: DraftPickMinAggregateOutputType | null
    _max: DraftPickMaxAggregateOutputType | null
  }

  type GetDraftPickGroupByPayload<T extends DraftPickGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DraftPickGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DraftPickGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DraftPickGroupByOutputType[P]>
            : GetScalarType<T[P], DraftPickGroupByOutputType[P]>
        }
      >
    >


  export type DraftPickSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    overall?: boolean
    round?: boolean
    pickInRound?: boolean
    teamId?: boolean
    teamName?: boolean
    prospectId?: boolean
    prospectName?: boolean
    prospectPosition?: boolean
    prospectGrade?: boolean
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: boolean
    session?: boolean | DraftSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["draftPick"]>

  export type DraftPickSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    overall?: boolean
    round?: boolean
    pickInRound?: boolean
    teamId?: boolean
    teamName?: boolean
    prospectId?: boolean
    prospectName?: boolean
    prospectPosition?: boolean
    prospectGrade?: boolean
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: boolean
    session?: boolean | DraftSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["draftPick"]>

  export type DraftPickSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    overall?: boolean
    round?: boolean
    pickInRound?: boolean
    teamId?: boolean
    teamName?: boolean
    prospectId?: boolean
    prospectName?: boolean
    prospectPosition?: boolean
    prospectGrade?: boolean
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: boolean
    session?: boolean | DraftSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["draftPick"]>

  export type DraftPickSelectScalar = {
    id?: boolean
    sessionId?: boolean
    overall?: boolean
    round?: boolean
    pickInRound?: boolean
    teamId?: boolean
    teamName?: boolean
    prospectId?: boolean
    prospectName?: boolean
    prospectPosition?: boolean
    prospectGrade?: boolean
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: boolean
  }

  export type DraftPickOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "overall" | "round" | "pickInRound" | "teamId" | "teamName" | "prospectId" | "prospectName" | "prospectPosition" | "prospectGrade" | "isUserPick" | "isTrade" | "createdAt", ExtArgs["result"]["draftPick"]>
  export type DraftPickInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | DraftSessionDefaultArgs<ExtArgs>
  }
  export type DraftPickIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | DraftSessionDefaultArgs<ExtArgs>
  }
  export type DraftPickIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | DraftSessionDefaultArgs<ExtArgs>
  }

  export type $DraftPickPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DraftPick"
    objects: {
      session: Prisma.$DraftSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      overall: number
      round: number
      pickInRound: number
      teamId: string
      teamName: string
      prospectId: string
      prospectName: string
      prospectPosition: string
      prospectGrade: number
      isUserPick: boolean
      isTrade: boolean
      createdAt: Date
    }, ExtArgs["result"]["draftPick"]>
    composites: {}
  }

  type DraftPickGetPayload<S extends boolean | null | undefined | DraftPickDefaultArgs> = $Result.GetResult<Prisma.$DraftPickPayload, S>

  type DraftPickCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DraftPickFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DraftPickCountAggregateInputType | true
    }

  export interface DraftPickDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DraftPick'], meta: { name: 'DraftPick' } }
    /**
     * Find zero or one DraftPick that matches the filter.
     * @param {DraftPickFindUniqueArgs} args - Arguments to find a DraftPick
     * @example
     * // Get one DraftPick
     * const draftPick = await prisma.draftPick.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DraftPickFindUniqueArgs>(args: SelectSubset<T, DraftPickFindUniqueArgs<ExtArgs>>): Prisma__DraftPickClient<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DraftPick that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DraftPickFindUniqueOrThrowArgs} args - Arguments to find a DraftPick
     * @example
     * // Get one DraftPick
     * const draftPick = await prisma.draftPick.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DraftPickFindUniqueOrThrowArgs>(args: SelectSubset<T, DraftPickFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DraftPickClient<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DraftPick that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickFindFirstArgs} args - Arguments to find a DraftPick
     * @example
     * // Get one DraftPick
     * const draftPick = await prisma.draftPick.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DraftPickFindFirstArgs>(args?: SelectSubset<T, DraftPickFindFirstArgs<ExtArgs>>): Prisma__DraftPickClient<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DraftPick that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickFindFirstOrThrowArgs} args - Arguments to find a DraftPick
     * @example
     * // Get one DraftPick
     * const draftPick = await prisma.draftPick.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DraftPickFindFirstOrThrowArgs>(args?: SelectSubset<T, DraftPickFindFirstOrThrowArgs<ExtArgs>>): Prisma__DraftPickClient<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DraftPicks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DraftPicks
     * const draftPicks = await prisma.draftPick.findMany()
     * 
     * // Get first 10 DraftPicks
     * const draftPicks = await prisma.draftPick.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const draftPickWithIdOnly = await prisma.draftPick.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DraftPickFindManyArgs>(args?: SelectSubset<T, DraftPickFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DraftPick.
     * @param {DraftPickCreateArgs} args - Arguments to create a DraftPick.
     * @example
     * // Create one DraftPick
     * const DraftPick = await prisma.draftPick.create({
     *   data: {
     *     // ... data to create a DraftPick
     *   }
     * })
     * 
     */
    create<T extends DraftPickCreateArgs>(args: SelectSubset<T, DraftPickCreateArgs<ExtArgs>>): Prisma__DraftPickClient<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DraftPicks.
     * @param {DraftPickCreateManyArgs} args - Arguments to create many DraftPicks.
     * @example
     * // Create many DraftPicks
     * const draftPick = await prisma.draftPick.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DraftPickCreateManyArgs>(args?: SelectSubset<T, DraftPickCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DraftPicks and returns the data saved in the database.
     * @param {DraftPickCreateManyAndReturnArgs} args - Arguments to create many DraftPicks.
     * @example
     * // Create many DraftPicks
     * const draftPick = await prisma.draftPick.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DraftPicks and only return the `id`
     * const draftPickWithIdOnly = await prisma.draftPick.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DraftPickCreateManyAndReturnArgs>(args?: SelectSubset<T, DraftPickCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DraftPick.
     * @param {DraftPickDeleteArgs} args - Arguments to delete one DraftPick.
     * @example
     * // Delete one DraftPick
     * const DraftPick = await prisma.draftPick.delete({
     *   where: {
     *     // ... filter to delete one DraftPick
     *   }
     * })
     * 
     */
    delete<T extends DraftPickDeleteArgs>(args: SelectSubset<T, DraftPickDeleteArgs<ExtArgs>>): Prisma__DraftPickClient<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DraftPick.
     * @param {DraftPickUpdateArgs} args - Arguments to update one DraftPick.
     * @example
     * // Update one DraftPick
     * const draftPick = await prisma.draftPick.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DraftPickUpdateArgs>(args: SelectSubset<T, DraftPickUpdateArgs<ExtArgs>>): Prisma__DraftPickClient<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DraftPicks.
     * @param {DraftPickDeleteManyArgs} args - Arguments to filter DraftPicks to delete.
     * @example
     * // Delete a few DraftPicks
     * const { count } = await prisma.draftPick.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DraftPickDeleteManyArgs>(args?: SelectSubset<T, DraftPickDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DraftPicks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DraftPicks
     * const draftPick = await prisma.draftPick.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DraftPickUpdateManyArgs>(args: SelectSubset<T, DraftPickUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DraftPicks and returns the data updated in the database.
     * @param {DraftPickUpdateManyAndReturnArgs} args - Arguments to update many DraftPicks.
     * @example
     * // Update many DraftPicks
     * const draftPick = await prisma.draftPick.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DraftPicks and only return the `id`
     * const draftPickWithIdOnly = await prisma.draftPick.updateManyAndReturn({
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
    updateManyAndReturn<T extends DraftPickUpdateManyAndReturnArgs>(args: SelectSubset<T, DraftPickUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DraftPick.
     * @param {DraftPickUpsertArgs} args - Arguments to update or create a DraftPick.
     * @example
     * // Update or create a DraftPick
     * const draftPick = await prisma.draftPick.upsert({
     *   create: {
     *     // ... data to create a DraftPick
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DraftPick we want to update
     *   }
     * })
     */
    upsert<T extends DraftPickUpsertArgs>(args: SelectSubset<T, DraftPickUpsertArgs<ExtArgs>>): Prisma__DraftPickClient<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DraftPicks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickCountArgs} args - Arguments to filter DraftPicks to count.
     * @example
     * // Count the number of DraftPicks
     * const count = await prisma.draftPick.count({
     *   where: {
     *     // ... the filter for the DraftPicks we want to count
     *   }
     * })
    **/
    count<T extends DraftPickCountArgs>(
      args?: Subset<T, DraftPickCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DraftPickCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DraftPick.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DraftPickAggregateArgs>(args: Subset<T, DraftPickAggregateArgs>): Prisma.PrismaPromise<GetDraftPickAggregateType<T>>

    /**
     * Group by DraftPick.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickGroupByArgs} args - Group by arguments.
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
      T extends DraftPickGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DraftPickGroupByArgs['orderBy'] }
        : { orderBy?: DraftPickGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DraftPickGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDraftPickGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DraftPick model
   */
  readonly fields: DraftPickFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DraftPick.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DraftPickClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends DraftSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DraftSessionDefaultArgs<ExtArgs>>): Prisma__DraftSessionClient<$Result.GetResult<Prisma.$DraftSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the DraftPick model
   */
  interface DraftPickFieldRefs {
    readonly id: FieldRef<"DraftPick", 'String'>
    readonly sessionId: FieldRef<"DraftPick", 'String'>
    readonly overall: FieldRef<"DraftPick", 'Int'>
    readonly round: FieldRef<"DraftPick", 'Int'>
    readonly pickInRound: FieldRef<"DraftPick", 'Int'>
    readonly teamId: FieldRef<"DraftPick", 'String'>
    readonly teamName: FieldRef<"DraftPick", 'String'>
    readonly prospectId: FieldRef<"DraftPick", 'String'>
    readonly prospectName: FieldRef<"DraftPick", 'String'>
    readonly prospectPosition: FieldRef<"DraftPick", 'String'>
    readonly prospectGrade: FieldRef<"DraftPick", 'Int'>
    readonly isUserPick: FieldRef<"DraftPick", 'Boolean'>
    readonly isTrade: FieldRef<"DraftPick", 'Boolean'>
    readonly createdAt: FieldRef<"DraftPick", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DraftPick findUnique
   */
  export type DraftPickFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * Filter, which DraftPick to fetch.
     */
    where: DraftPickWhereUniqueInput
  }

  /**
   * DraftPick findUniqueOrThrow
   */
  export type DraftPickFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * Filter, which DraftPick to fetch.
     */
    where: DraftPickWhereUniqueInput
  }

  /**
   * DraftPick findFirst
   */
  export type DraftPickFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * Filter, which DraftPick to fetch.
     */
    where?: DraftPickWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DraftPicks to fetch.
     */
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DraftPicks.
     */
    cursor?: DraftPickWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DraftPicks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DraftPicks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DraftPicks.
     */
    distinct?: DraftPickScalarFieldEnum | DraftPickScalarFieldEnum[]
  }

  /**
   * DraftPick findFirstOrThrow
   */
  export type DraftPickFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * Filter, which DraftPick to fetch.
     */
    where?: DraftPickWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DraftPicks to fetch.
     */
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DraftPicks.
     */
    cursor?: DraftPickWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DraftPicks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DraftPicks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DraftPicks.
     */
    distinct?: DraftPickScalarFieldEnum | DraftPickScalarFieldEnum[]
  }

  /**
   * DraftPick findMany
   */
  export type DraftPickFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * Filter, which DraftPicks to fetch.
     */
    where?: DraftPickWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DraftPicks to fetch.
     */
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DraftPicks.
     */
    cursor?: DraftPickWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DraftPicks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DraftPicks.
     */
    skip?: number
    distinct?: DraftPickScalarFieldEnum | DraftPickScalarFieldEnum[]
  }

  /**
   * DraftPick create
   */
  export type DraftPickCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * The data needed to create a DraftPick.
     */
    data: XOR<DraftPickCreateInput, DraftPickUncheckedCreateInput>
  }

  /**
   * DraftPick createMany
   */
  export type DraftPickCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DraftPicks.
     */
    data: DraftPickCreateManyInput | DraftPickCreateManyInput[]
  }

  /**
   * DraftPick createManyAndReturn
   */
  export type DraftPickCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * The data used to create many DraftPicks.
     */
    data: DraftPickCreateManyInput | DraftPickCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DraftPick update
   */
  export type DraftPickUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * The data needed to update a DraftPick.
     */
    data: XOR<DraftPickUpdateInput, DraftPickUncheckedUpdateInput>
    /**
     * Choose, which DraftPick to update.
     */
    where: DraftPickWhereUniqueInput
  }

  /**
   * DraftPick updateMany
   */
  export type DraftPickUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DraftPicks.
     */
    data: XOR<DraftPickUpdateManyMutationInput, DraftPickUncheckedUpdateManyInput>
    /**
     * Filter which DraftPicks to update
     */
    where?: DraftPickWhereInput
    /**
     * Limit how many DraftPicks to update.
     */
    limit?: number
  }

  /**
   * DraftPick updateManyAndReturn
   */
  export type DraftPickUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * The data used to update DraftPicks.
     */
    data: XOR<DraftPickUpdateManyMutationInput, DraftPickUncheckedUpdateManyInput>
    /**
     * Filter which DraftPicks to update
     */
    where?: DraftPickWhereInput
    /**
     * Limit how many DraftPicks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DraftPick upsert
   */
  export type DraftPickUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * The filter to search for the DraftPick to update in case it exists.
     */
    where: DraftPickWhereUniqueInput
    /**
     * In case the DraftPick found by the `where` argument doesn't exist, create a new DraftPick with this data.
     */
    create: XOR<DraftPickCreateInput, DraftPickUncheckedCreateInput>
    /**
     * In case the DraftPick was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DraftPickUpdateInput, DraftPickUncheckedUpdateInput>
  }

  /**
   * DraftPick delete
   */
  export type DraftPickDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
    /**
     * Filter which DraftPick to delete.
     */
    where: DraftPickWhereUniqueInput
  }

  /**
   * DraftPick deleteMany
   */
  export type DraftPickDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DraftPicks to delete
     */
    where?: DraftPickWhereInput
    /**
     * Limit how many DraftPicks to delete.
     */
    limit?: number
  }

  /**
   * DraftPick without action
   */
  export type DraftPickDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DraftPick
     */
    omit?: DraftPickOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null
  }


  /**
   * Model GameResult
   */

  export type AggregateGameResult = {
    _count: GameResultCountAggregateOutputType | null
    _avg: GameResultAvgAggregateOutputType | null
    _sum: GameResultSumAggregateOutputType | null
    _min: GameResultMinAggregateOutputType | null
    _max: GameResultMaxAggregateOutputType | null
  }

  export type GameResultAvgAggregateOutputType = {
    homeScore: number | null
    awayScore: number | null
  }

  export type GameResultSumAggregateOutputType = {
    homeScore: number | null
    awayScore: number | null
  }

  export type GameResultMinAggregateOutputType = {
    id: string | null
    homeTeamId: string | null
    homeTeamName: string | null
    homeScore: number | null
    awayTeamId: string | null
    awayTeamName: string | null
    awayScore: number | null
    league: string | null
    playedAt: Date | null
  }

  export type GameResultMaxAggregateOutputType = {
    id: string | null
    homeTeamId: string | null
    homeTeamName: string | null
    homeScore: number | null
    awayTeamId: string | null
    awayTeamName: string | null
    awayScore: number | null
    league: string | null
    playedAt: Date | null
  }

  export type GameResultCountAggregateOutputType = {
    id: number
    homeTeamId: number
    homeTeamName: number
    homeScore: number
    awayTeamId: number
    awayTeamName: number
    awayScore: number
    league: number
    playedAt: number
    _all: number
  }


  export type GameResultAvgAggregateInputType = {
    homeScore?: true
    awayScore?: true
  }

  export type GameResultSumAggregateInputType = {
    homeScore?: true
    awayScore?: true
  }

  export type GameResultMinAggregateInputType = {
    id?: true
    homeTeamId?: true
    homeTeamName?: true
    homeScore?: true
    awayTeamId?: true
    awayTeamName?: true
    awayScore?: true
    league?: true
    playedAt?: true
  }

  export type GameResultMaxAggregateInputType = {
    id?: true
    homeTeamId?: true
    homeTeamName?: true
    homeScore?: true
    awayTeamId?: true
    awayTeamName?: true
    awayScore?: true
    league?: true
    playedAt?: true
  }

  export type GameResultCountAggregateInputType = {
    id?: true
    homeTeamId?: true
    homeTeamName?: true
    homeScore?: true
    awayTeamId?: true
    awayTeamName?: true
    awayScore?: true
    league?: true
    playedAt?: true
    _all?: true
  }

  export type GameResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameResult to aggregate.
     */
    where?: GameResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameResults to fetch.
     */
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GameResults
    **/
    _count?: true | GameResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GameResultAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GameResultSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameResultMaxAggregateInputType
  }

  export type GetGameResultAggregateType<T extends GameResultAggregateArgs> = {
        [P in keyof T & keyof AggregateGameResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGameResult[P]>
      : GetScalarType<T[P], AggregateGameResult[P]>
  }




  export type GameResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameResultWhereInput
    orderBy?: GameResultOrderByWithAggregationInput | GameResultOrderByWithAggregationInput[]
    by: GameResultScalarFieldEnum[] | GameResultScalarFieldEnum
    having?: GameResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameResultCountAggregateInputType | true
    _avg?: GameResultAvgAggregateInputType
    _sum?: GameResultSumAggregateInputType
    _min?: GameResultMinAggregateInputType
    _max?: GameResultMaxAggregateInputType
  }

  export type GameResultGroupByOutputType = {
    id: string
    homeTeamId: string
    homeTeamName: string
    homeScore: number
    awayTeamId: string
    awayTeamName: string
    awayScore: number
    league: string
    playedAt: Date
    _count: GameResultCountAggregateOutputType | null
    _avg: GameResultAvgAggregateOutputType | null
    _sum: GameResultSumAggregateOutputType | null
    _min: GameResultMinAggregateOutputType | null
    _max: GameResultMaxAggregateOutputType | null
  }

  type GetGameResultGroupByPayload<T extends GameResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameResultGroupByOutputType[P]>
            : GetScalarType<T[P], GameResultGroupByOutputType[P]>
        }
      >
    >


  export type GameResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    homeTeamId?: boolean
    homeTeamName?: boolean
    homeScore?: boolean
    awayTeamId?: boolean
    awayTeamName?: boolean
    awayScore?: boolean
    league?: boolean
    playedAt?: boolean
  }, ExtArgs["result"]["gameResult"]>

  export type GameResultSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    homeTeamId?: boolean
    homeTeamName?: boolean
    homeScore?: boolean
    awayTeamId?: boolean
    awayTeamName?: boolean
    awayScore?: boolean
    league?: boolean
    playedAt?: boolean
  }, ExtArgs["result"]["gameResult"]>

  export type GameResultSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    homeTeamId?: boolean
    homeTeamName?: boolean
    homeScore?: boolean
    awayTeamId?: boolean
    awayTeamName?: boolean
    awayScore?: boolean
    league?: boolean
    playedAt?: boolean
  }, ExtArgs["result"]["gameResult"]>

  export type GameResultSelectScalar = {
    id?: boolean
    homeTeamId?: boolean
    homeTeamName?: boolean
    homeScore?: boolean
    awayTeamId?: boolean
    awayTeamName?: boolean
    awayScore?: boolean
    league?: boolean
    playedAt?: boolean
  }

  export type GameResultOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "homeTeamId" | "homeTeamName" | "homeScore" | "awayTeamId" | "awayTeamName" | "awayScore" | "league" | "playedAt", ExtArgs["result"]["gameResult"]>

  export type $GameResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GameResult"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      homeTeamId: string
      homeTeamName: string
      homeScore: number
      awayTeamId: string
      awayTeamName: string
      awayScore: number
      league: string
      playedAt: Date
    }, ExtArgs["result"]["gameResult"]>
    composites: {}
  }

  type GameResultGetPayload<S extends boolean | null | undefined | GameResultDefaultArgs> = $Result.GetResult<Prisma.$GameResultPayload, S>

  type GameResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GameResultFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GameResultCountAggregateInputType | true
    }

  export interface GameResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GameResult'], meta: { name: 'GameResult' } }
    /**
     * Find zero or one GameResult that matches the filter.
     * @param {GameResultFindUniqueArgs} args - Arguments to find a GameResult
     * @example
     * // Get one GameResult
     * const gameResult = await prisma.gameResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameResultFindUniqueArgs>(args: SelectSubset<T, GameResultFindUniqueArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GameResult that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GameResultFindUniqueOrThrowArgs} args - Arguments to find a GameResult
     * @example
     * // Get one GameResult
     * const gameResult = await prisma.gameResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameResultFindUniqueOrThrowArgs>(args: SelectSubset<T, GameResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GameResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultFindFirstArgs} args - Arguments to find a GameResult
     * @example
     * // Get one GameResult
     * const gameResult = await prisma.gameResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameResultFindFirstArgs>(args?: SelectSubset<T, GameResultFindFirstArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GameResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultFindFirstOrThrowArgs} args - Arguments to find a GameResult
     * @example
     * // Get one GameResult
     * const gameResult = await prisma.gameResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameResultFindFirstOrThrowArgs>(args?: SelectSubset<T, GameResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GameResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GameResults
     * const gameResults = await prisma.gameResult.findMany()
     * 
     * // Get first 10 GameResults
     * const gameResults = await prisma.gameResult.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameResultWithIdOnly = await prisma.gameResult.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameResultFindManyArgs>(args?: SelectSubset<T, GameResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GameResult.
     * @param {GameResultCreateArgs} args - Arguments to create a GameResult.
     * @example
     * // Create one GameResult
     * const GameResult = await prisma.gameResult.create({
     *   data: {
     *     // ... data to create a GameResult
     *   }
     * })
     * 
     */
    create<T extends GameResultCreateArgs>(args: SelectSubset<T, GameResultCreateArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GameResults.
     * @param {GameResultCreateManyArgs} args - Arguments to create many GameResults.
     * @example
     * // Create many GameResults
     * const gameResult = await prisma.gameResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameResultCreateManyArgs>(args?: SelectSubset<T, GameResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GameResults and returns the data saved in the database.
     * @param {GameResultCreateManyAndReturnArgs} args - Arguments to create many GameResults.
     * @example
     * // Create many GameResults
     * const gameResult = await prisma.gameResult.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GameResults and only return the `id`
     * const gameResultWithIdOnly = await prisma.gameResult.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GameResultCreateManyAndReturnArgs>(args?: SelectSubset<T, GameResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GameResult.
     * @param {GameResultDeleteArgs} args - Arguments to delete one GameResult.
     * @example
     * // Delete one GameResult
     * const GameResult = await prisma.gameResult.delete({
     *   where: {
     *     // ... filter to delete one GameResult
     *   }
     * })
     * 
     */
    delete<T extends GameResultDeleteArgs>(args: SelectSubset<T, GameResultDeleteArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GameResult.
     * @param {GameResultUpdateArgs} args - Arguments to update one GameResult.
     * @example
     * // Update one GameResult
     * const gameResult = await prisma.gameResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameResultUpdateArgs>(args: SelectSubset<T, GameResultUpdateArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GameResults.
     * @param {GameResultDeleteManyArgs} args - Arguments to filter GameResults to delete.
     * @example
     * // Delete a few GameResults
     * const { count } = await prisma.gameResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameResultDeleteManyArgs>(args?: SelectSubset<T, GameResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GameResults
     * const gameResult = await prisma.gameResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameResultUpdateManyArgs>(args: SelectSubset<T, GameResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameResults and returns the data updated in the database.
     * @param {GameResultUpdateManyAndReturnArgs} args - Arguments to update many GameResults.
     * @example
     * // Update many GameResults
     * const gameResult = await prisma.gameResult.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GameResults and only return the `id`
     * const gameResultWithIdOnly = await prisma.gameResult.updateManyAndReturn({
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
    updateManyAndReturn<T extends GameResultUpdateManyAndReturnArgs>(args: SelectSubset<T, GameResultUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GameResult.
     * @param {GameResultUpsertArgs} args - Arguments to update or create a GameResult.
     * @example
     * // Update or create a GameResult
     * const gameResult = await prisma.gameResult.upsert({
     *   create: {
     *     // ... data to create a GameResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GameResult we want to update
     *   }
     * })
     */
    upsert<T extends GameResultUpsertArgs>(args: SelectSubset<T, GameResultUpsertArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GameResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultCountArgs} args - Arguments to filter GameResults to count.
     * @example
     * // Count the number of GameResults
     * const count = await prisma.gameResult.count({
     *   where: {
     *     // ... the filter for the GameResults we want to count
     *   }
     * })
    **/
    count<T extends GameResultCountArgs>(
      args?: Subset<T, GameResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GameResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GameResultAggregateArgs>(args: Subset<T, GameResultAggregateArgs>): Prisma.PrismaPromise<GetGameResultAggregateType<T>>

    /**
     * Group by GameResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultGroupByArgs} args - Group by arguments.
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
      T extends GameResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameResultGroupByArgs['orderBy'] }
        : { orderBy?: GameResultGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, GameResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GameResult model
   */
  readonly fields: GameResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GameResult.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the GameResult model
   */
  interface GameResultFieldRefs {
    readonly id: FieldRef<"GameResult", 'String'>
    readonly homeTeamId: FieldRef<"GameResult", 'String'>
    readonly homeTeamName: FieldRef<"GameResult", 'String'>
    readonly homeScore: FieldRef<"GameResult", 'Int'>
    readonly awayTeamId: FieldRef<"GameResult", 'String'>
    readonly awayTeamName: FieldRef<"GameResult", 'String'>
    readonly awayScore: FieldRef<"GameResult", 'Int'>
    readonly league: FieldRef<"GameResult", 'String'>
    readonly playedAt: FieldRef<"GameResult", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GameResult findUnique
   */
  export type GameResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * Filter, which GameResult to fetch.
     */
    where: GameResultWhereUniqueInput
  }

  /**
   * GameResult findUniqueOrThrow
   */
  export type GameResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * Filter, which GameResult to fetch.
     */
    where: GameResultWhereUniqueInput
  }

  /**
   * GameResult findFirst
   */
  export type GameResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * Filter, which GameResult to fetch.
     */
    where?: GameResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameResults to fetch.
     */
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameResults.
     */
    cursor?: GameResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameResults.
     */
    distinct?: GameResultScalarFieldEnum | GameResultScalarFieldEnum[]
  }

  /**
   * GameResult findFirstOrThrow
   */
  export type GameResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * Filter, which GameResult to fetch.
     */
    where?: GameResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameResults to fetch.
     */
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameResults.
     */
    cursor?: GameResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameResults.
     */
    distinct?: GameResultScalarFieldEnum | GameResultScalarFieldEnum[]
  }

  /**
   * GameResult findMany
   */
  export type GameResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * Filter, which GameResults to fetch.
     */
    where?: GameResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameResults to fetch.
     */
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GameResults.
     */
    cursor?: GameResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameResults.
     */
    skip?: number
    distinct?: GameResultScalarFieldEnum | GameResultScalarFieldEnum[]
  }

  /**
   * GameResult create
   */
  export type GameResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * The data needed to create a GameResult.
     */
    data: XOR<GameResultCreateInput, GameResultUncheckedCreateInput>
  }

  /**
   * GameResult createMany
   */
  export type GameResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GameResults.
     */
    data: GameResultCreateManyInput | GameResultCreateManyInput[]
  }

  /**
   * GameResult createManyAndReturn
   */
  export type GameResultCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * The data used to create many GameResults.
     */
    data: GameResultCreateManyInput | GameResultCreateManyInput[]
  }

  /**
   * GameResult update
   */
  export type GameResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * The data needed to update a GameResult.
     */
    data: XOR<GameResultUpdateInput, GameResultUncheckedUpdateInput>
    /**
     * Choose, which GameResult to update.
     */
    where: GameResultWhereUniqueInput
  }

  /**
   * GameResult updateMany
   */
  export type GameResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GameResults.
     */
    data: XOR<GameResultUpdateManyMutationInput, GameResultUncheckedUpdateManyInput>
    /**
     * Filter which GameResults to update
     */
    where?: GameResultWhereInput
    /**
     * Limit how many GameResults to update.
     */
    limit?: number
  }

  /**
   * GameResult updateManyAndReturn
   */
  export type GameResultUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * The data used to update GameResults.
     */
    data: XOR<GameResultUpdateManyMutationInput, GameResultUncheckedUpdateManyInput>
    /**
     * Filter which GameResults to update
     */
    where?: GameResultWhereInput
    /**
     * Limit how many GameResults to update.
     */
    limit?: number
  }

  /**
   * GameResult upsert
   */
  export type GameResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * The filter to search for the GameResult to update in case it exists.
     */
    where: GameResultWhereUniqueInput
    /**
     * In case the GameResult found by the `where` argument doesn't exist, create a new GameResult with this data.
     */
    create: XOR<GameResultCreateInput, GameResultUncheckedCreateInput>
    /**
     * In case the GameResult was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameResultUpdateInput, GameResultUncheckedUpdateInput>
  }

  /**
   * GameResult delete
   */
  export type GameResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
    /**
     * Filter which GameResult to delete.
     */
    where: GameResultWhereUniqueInput
  }

  /**
   * GameResult deleteMany
   */
  export type GameResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameResults to delete
     */
    where?: GameResultWhereInput
    /**
     * Limit how many GameResults to delete.
     */
    limit?: number
  }

  /**
   * GameResult without action
   */
  export type GameResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameResult
     */
    omit?: GameResultOmit<ExtArgs> | null
  }


  /**
   * Model ScoutingReport
   */

  export type AggregateScoutingReport = {
    _count: ScoutingReportCountAggregateOutputType | null
    _min: ScoutingReportMinAggregateOutputType | null
    _max: ScoutingReportMaxAggregateOutputType | null
  }

  export type ScoutingReportMinAggregateOutputType = {
    id: string | null
    prospectId: string | null
    prospectName: string | null
    report: string | null
    createdAt: Date | null
  }

  export type ScoutingReportMaxAggregateOutputType = {
    id: string | null
    prospectId: string | null
    prospectName: string | null
    report: string | null
    createdAt: Date | null
  }

  export type ScoutingReportCountAggregateOutputType = {
    id: number
    prospectId: number
    prospectName: number
    report: number
    createdAt: number
    _all: number
  }


  export type ScoutingReportMinAggregateInputType = {
    id?: true
    prospectId?: true
    prospectName?: true
    report?: true
    createdAt?: true
  }

  export type ScoutingReportMaxAggregateInputType = {
    id?: true
    prospectId?: true
    prospectName?: true
    report?: true
    createdAt?: true
  }

  export type ScoutingReportCountAggregateInputType = {
    id?: true
    prospectId?: true
    prospectName?: true
    report?: true
    createdAt?: true
    _all?: true
  }

  export type ScoutingReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScoutingReport to aggregate.
     */
    where?: ScoutingReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScoutingReports to fetch.
     */
    orderBy?: ScoutingReportOrderByWithRelationInput | ScoutingReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScoutingReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScoutingReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScoutingReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ScoutingReports
    **/
    _count?: true | ScoutingReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScoutingReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScoutingReportMaxAggregateInputType
  }

  export type GetScoutingReportAggregateType<T extends ScoutingReportAggregateArgs> = {
        [P in keyof T & keyof AggregateScoutingReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScoutingReport[P]>
      : GetScalarType<T[P], AggregateScoutingReport[P]>
  }




  export type ScoutingReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScoutingReportWhereInput
    orderBy?: ScoutingReportOrderByWithAggregationInput | ScoutingReportOrderByWithAggregationInput[]
    by: ScoutingReportScalarFieldEnum[] | ScoutingReportScalarFieldEnum
    having?: ScoutingReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScoutingReportCountAggregateInputType | true
    _min?: ScoutingReportMinAggregateInputType
    _max?: ScoutingReportMaxAggregateInputType
  }

  export type ScoutingReportGroupByOutputType = {
    id: string
    prospectId: string
    prospectName: string
    report: string
    createdAt: Date
    _count: ScoutingReportCountAggregateOutputType | null
    _min: ScoutingReportMinAggregateOutputType | null
    _max: ScoutingReportMaxAggregateOutputType | null
  }

  type GetScoutingReportGroupByPayload<T extends ScoutingReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScoutingReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScoutingReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScoutingReportGroupByOutputType[P]>
            : GetScalarType<T[P], ScoutingReportGroupByOutputType[P]>
        }
      >
    >


  export type ScoutingReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    prospectId?: boolean
    prospectName?: boolean
    report?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scoutingReport"]>

  export type ScoutingReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    prospectId?: boolean
    prospectName?: boolean
    report?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scoutingReport"]>

  export type ScoutingReportSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    prospectId?: boolean
    prospectName?: boolean
    report?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scoutingReport"]>

  export type ScoutingReportSelectScalar = {
    id?: boolean
    prospectId?: boolean
    prospectName?: boolean
    report?: boolean
    createdAt?: boolean
  }

  export type ScoutingReportOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "prospectId" | "prospectName" | "report" | "createdAt", ExtArgs["result"]["scoutingReport"]>

  export type $ScoutingReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ScoutingReport"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      prospectId: string
      prospectName: string
      report: string
      createdAt: Date
    }, ExtArgs["result"]["scoutingReport"]>
    composites: {}
  }

  type ScoutingReportGetPayload<S extends boolean | null | undefined | ScoutingReportDefaultArgs> = $Result.GetResult<Prisma.$ScoutingReportPayload, S>

  type ScoutingReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScoutingReportFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScoutingReportCountAggregateInputType | true
    }

  export interface ScoutingReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ScoutingReport'], meta: { name: 'ScoutingReport' } }
    /**
     * Find zero or one ScoutingReport that matches the filter.
     * @param {ScoutingReportFindUniqueArgs} args - Arguments to find a ScoutingReport
     * @example
     * // Get one ScoutingReport
     * const scoutingReport = await prisma.scoutingReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScoutingReportFindUniqueArgs>(args: SelectSubset<T, ScoutingReportFindUniqueArgs<ExtArgs>>): Prisma__ScoutingReportClient<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ScoutingReport that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScoutingReportFindUniqueOrThrowArgs} args - Arguments to find a ScoutingReport
     * @example
     * // Get one ScoutingReport
     * const scoutingReport = await prisma.scoutingReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScoutingReportFindUniqueOrThrowArgs>(args: SelectSubset<T, ScoutingReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScoutingReportClient<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScoutingReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoutingReportFindFirstArgs} args - Arguments to find a ScoutingReport
     * @example
     * // Get one ScoutingReport
     * const scoutingReport = await prisma.scoutingReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScoutingReportFindFirstArgs>(args?: SelectSubset<T, ScoutingReportFindFirstArgs<ExtArgs>>): Prisma__ScoutingReportClient<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScoutingReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoutingReportFindFirstOrThrowArgs} args - Arguments to find a ScoutingReport
     * @example
     * // Get one ScoutingReport
     * const scoutingReport = await prisma.scoutingReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScoutingReportFindFirstOrThrowArgs>(args?: SelectSubset<T, ScoutingReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScoutingReportClient<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ScoutingReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoutingReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScoutingReports
     * const scoutingReports = await prisma.scoutingReport.findMany()
     * 
     * // Get first 10 ScoutingReports
     * const scoutingReports = await prisma.scoutingReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scoutingReportWithIdOnly = await prisma.scoutingReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScoutingReportFindManyArgs>(args?: SelectSubset<T, ScoutingReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ScoutingReport.
     * @param {ScoutingReportCreateArgs} args - Arguments to create a ScoutingReport.
     * @example
     * // Create one ScoutingReport
     * const ScoutingReport = await prisma.scoutingReport.create({
     *   data: {
     *     // ... data to create a ScoutingReport
     *   }
     * })
     * 
     */
    create<T extends ScoutingReportCreateArgs>(args: SelectSubset<T, ScoutingReportCreateArgs<ExtArgs>>): Prisma__ScoutingReportClient<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ScoutingReports.
     * @param {ScoutingReportCreateManyArgs} args - Arguments to create many ScoutingReports.
     * @example
     * // Create many ScoutingReports
     * const scoutingReport = await prisma.scoutingReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScoutingReportCreateManyArgs>(args?: SelectSubset<T, ScoutingReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ScoutingReports and returns the data saved in the database.
     * @param {ScoutingReportCreateManyAndReturnArgs} args - Arguments to create many ScoutingReports.
     * @example
     * // Create many ScoutingReports
     * const scoutingReport = await prisma.scoutingReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ScoutingReports and only return the `id`
     * const scoutingReportWithIdOnly = await prisma.scoutingReport.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScoutingReportCreateManyAndReturnArgs>(args?: SelectSubset<T, ScoutingReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ScoutingReport.
     * @param {ScoutingReportDeleteArgs} args - Arguments to delete one ScoutingReport.
     * @example
     * // Delete one ScoutingReport
     * const ScoutingReport = await prisma.scoutingReport.delete({
     *   where: {
     *     // ... filter to delete one ScoutingReport
     *   }
     * })
     * 
     */
    delete<T extends ScoutingReportDeleteArgs>(args: SelectSubset<T, ScoutingReportDeleteArgs<ExtArgs>>): Prisma__ScoutingReportClient<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ScoutingReport.
     * @param {ScoutingReportUpdateArgs} args - Arguments to update one ScoutingReport.
     * @example
     * // Update one ScoutingReport
     * const scoutingReport = await prisma.scoutingReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScoutingReportUpdateArgs>(args: SelectSubset<T, ScoutingReportUpdateArgs<ExtArgs>>): Prisma__ScoutingReportClient<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ScoutingReports.
     * @param {ScoutingReportDeleteManyArgs} args - Arguments to filter ScoutingReports to delete.
     * @example
     * // Delete a few ScoutingReports
     * const { count } = await prisma.scoutingReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScoutingReportDeleteManyArgs>(args?: SelectSubset<T, ScoutingReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScoutingReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoutingReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScoutingReports
     * const scoutingReport = await prisma.scoutingReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScoutingReportUpdateManyArgs>(args: SelectSubset<T, ScoutingReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScoutingReports and returns the data updated in the database.
     * @param {ScoutingReportUpdateManyAndReturnArgs} args - Arguments to update many ScoutingReports.
     * @example
     * // Update many ScoutingReports
     * const scoutingReport = await prisma.scoutingReport.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ScoutingReports and only return the `id`
     * const scoutingReportWithIdOnly = await prisma.scoutingReport.updateManyAndReturn({
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
    updateManyAndReturn<T extends ScoutingReportUpdateManyAndReturnArgs>(args: SelectSubset<T, ScoutingReportUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ScoutingReport.
     * @param {ScoutingReportUpsertArgs} args - Arguments to update or create a ScoutingReport.
     * @example
     * // Update or create a ScoutingReport
     * const scoutingReport = await prisma.scoutingReport.upsert({
     *   create: {
     *     // ... data to create a ScoutingReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScoutingReport we want to update
     *   }
     * })
     */
    upsert<T extends ScoutingReportUpsertArgs>(args: SelectSubset<T, ScoutingReportUpsertArgs<ExtArgs>>): Prisma__ScoutingReportClient<$Result.GetResult<Prisma.$ScoutingReportPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ScoutingReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoutingReportCountArgs} args - Arguments to filter ScoutingReports to count.
     * @example
     * // Count the number of ScoutingReports
     * const count = await prisma.scoutingReport.count({
     *   where: {
     *     // ... the filter for the ScoutingReports we want to count
     *   }
     * })
    **/
    count<T extends ScoutingReportCountArgs>(
      args?: Subset<T, ScoutingReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScoutingReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ScoutingReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoutingReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ScoutingReportAggregateArgs>(args: Subset<T, ScoutingReportAggregateArgs>): Prisma.PrismaPromise<GetScoutingReportAggregateType<T>>

    /**
     * Group by ScoutingReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoutingReportGroupByArgs} args - Group by arguments.
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
      T extends ScoutingReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScoutingReportGroupByArgs['orderBy'] }
        : { orderBy?: ScoutingReportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ScoutingReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScoutingReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ScoutingReport model
   */
  readonly fields: ScoutingReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ScoutingReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScoutingReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ScoutingReport model
   */
  interface ScoutingReportFieldRefs {
    readonly id: FieldRef<"ScoutingReport", 'String'>
    readonly prospectId: FieldRef<"ScoutingReport", 'String'>
    readonly prospectName: FieldRef<"ScoutingReport", 'String'>
    readonly report: FieldRef<"ScoutingReport", 'String'>
    readonly createdAt: FieldRef<"ScoutingReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ScoutingReport findUnique
   */
  export type ScoutingReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * Filter, which ScoutingReport to fetch.
     */
    where: ScoutingReportWhereUniqueInput
  }

  /**
   * ScoutingReport findUniqueOrThrow
   */
  export type ScoutingReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * Filter, which ScoutingReport to fetch.
     */
    where: ScoutingReportWhereUniqueInput
  }

  /**
   * ScoutingReport findFirst
   */
  export type ScoutingReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * Filter, which ScoutingReport to fetch.
     */
    where?: ScoutingReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScoutingReports to fetch.
     */
    orderBy?: ScoutingReportOrderByWithRelationInput | ScoutingReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScoutingReports.
     */
    cursor?: ScoutingReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScoutingReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScoutingReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScoutingReports.
     */
    distinct?: ScoutingReportScalarFieldEnum | ScoutingReportScalarFieldEnum[]
  }

  /**
   * ScoutingReport findFirstOrThrow
   */
  export type ScoutingReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * Filter, which ScoutingReport to fetch.
     */
    where?: ScoutingReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScoutingReports to fetch.
     */
    orderBy?: ScoutingReportOrderByWithRelationInput | ScoutingReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScoutingReports.
     */
    cursor?: ScoutingReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScoutingReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScoutingReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScoutingReports.
     */
    distinct?: ScoutingReportScalarFieldEnum | ScoutingReportScalarFieldEnum[]
  }

  /**
   * ScoutingReport findMany
   */
  export type ScoutingReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * Filter, which ScoutingReports to fetch.
     */
    where?: ScoutingReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScoutingReports to fetch.
     */
    orderBy?: ScoutingReportOrderByWithRelationInput | ScoutingReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ScoutingReports.
     */
    cursor?: ScoutingReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScoutingReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScoutingReports.
     */
    skip?: number
    distinct?: ScoutingReportScalarFieldEnum | ScoutingReportScalarFieldEnum[]
  }

  /**
   * ScoutingReport create
   */
  export type ScoutingReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * The data needed to create a ScoutingReport.
     */
    data: XOR<ScoutingReportCreateInput, ScoutingReportUncheckedCreateInput>
  }

  /**
   * ScoutingReport createMany
   */
  export type ScoutingReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScoutingReports.
     */
    data: ScoutingReportCreateManyInput | ScoutingReportCreateManyInput[]
  }

  /**
   * ScoutingReport createManyAndReturn
   */
  export type ScoutingReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * The data used to create many ScoutingReports.
     */
    data: ScoutingReportCreateManyInput | ScoutingReportCreateManyInput[]
  }

  /**
   * ScoutingReport update
   */
  export type ScoutingReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * The data needed to update a ScoutingReport.
     */
    data: XOR<ScoutingReportUpdateInput, ScoutingReportUncheckedUpdateInput>
    /**
     * Choose, which ScoutingReport to update.
     */
    where: ScoutingReportWhereUniqueInput
  }

  /**
   * ScoutingReport updateMany
   */
  export type ScoutingReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ScoutingReports.
     */
    data: XOR<ScoutingReportUpdateManyMutationInput, ScoutingReportUncheckedUpdateManyInput>
    /**
     * Filter which ScoutingReports to update
     */
    where?: ScoutingReportWhereInput
    /**
     * Limit how many ScoutingReports to update.
     */
    limit?: number
  }

  /**
   * ScoutingReport updateManyAndReturn
   */
  export type ScoutingReportUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * The data used to update ScoutingReports.
     */
    data: XOR<ScoutingReportUpdateManyMutationInput, ScoutingReportUncheckedUpdateManyInput>
    /**
     * Filter which ScoutingReports to update
     */
    where?: ScoutingReportWhereInput
    /**
     * Limit how many ScoutingReports to update.
     */
    limit?: number
  }

  /**
   * ScoutingReport upsert
   */
  export type ScoutingReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * The filter to search for the ScoutingReport to update in case it exists.
     */
    where: ScoutingReportWhereUniqueInput
    /**
     * In case the ScoutingReport found by the `where` argument doesn't exist, create a new ScoutingReport with this data.
     */
    create: XOR<ScoutingReportCreateInput, ScoutingReportUncheckedCreateInput>
    /**
     * In case the ScoutingReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScoutingReportUpdateInput, ScoutingReportUncheckedUpdateInput>
  }

  /**
   * ScoutingReport delete
   */
  export type ScoutingReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
    /**
     * Filter which ScoutingReport to delete.
     */
    where: ScoutingReportWhereUniqueInput
  }

  /**
   * ScoutingReport deleteMany
   */
  export type ScoutingReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScoutingReports to delete
     */
    where?: ScoutingReportWhereInput
    /**
     * Limit how many ScoutingReports to delete.
     */
    limit?: number
  }

  /**
   * ScoutingReport without action
   */
  export type ScoutingReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScoutingReport
     */
    select?: ScoutingReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScoutingReport
     */
    omit?: ScoutingReportOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const DraftSessionScalarFieldEnum: {
    id: 'id',
    teamId: 'teamId',
    teamName: 'teamName',
    status: 'status',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    grade: 'grade',
    gradeScore: 'gradeScore'
  };

  export type DraftSessionScalarFieldEnum = (typeof DraftSessionScalarFieldEnum)[keyof typeof DraftSessionScalarFieldEnum]


  export const DraftPickScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    overall: 'overall',
    round: 'round',
    pickInRound: 'pickInRound',
    teamId: 'teamId',
    teamName: 'teamName',
    prospectId: 'prospectId',
    prospectName: 'prospectName',
    prospectPosition: 'prospectPosition',
    prospectGrade: 'prospectGrade',
    isUserPick: 'isUserPick',
    isTrade: 'isTrade',
    createdAt: 'createdAt'
  };

  export type DraftPickScalarFieldEnum = (typeof DraftPickScalarFieldEnum)[keyof typeof DraftPickScalarFieldEnum]


  export const GameResultScalarFieldEnum: {
    id: 'id',
    homeTeamId: 'homeTeamId',
    homeTeamName: 'homeTeamName',
    homeScore: 'homeScore',
    awayTeamId: 'awayTeamId',
    awayTeamName: 'awayTeamName',
    awayScore: 'awayScore',
    league: 'league',
    playedAt: 'playedAt'
  };

  export type GameResultScalarFieldEnum = (typeof GameResultScalarFieldEnum)[keyof typeof GameResultScalarFieldEnum]


  export const ScoutingReportScalarFieldEnum: {
    id: 'id',
    prospectId: 'prospectId',
    prospectName: 'prospectName',
    report: 'report',
    createdAt: 'createdAt'
  };

  export type ScoutingReportScalarFieldEnum = (typeof ScoutingReportScalarFieldEnum)[keyof typeof ScoutingReportScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type DraftSessionWhereInput = {
    AND?: DraftSessionWhereInput | DraftSessionWhereInput[]
    OR?: DraftSessionWhereInput[]
    NOT?: DraftSessionWhereInput | DraftSessionWhereInput[]
    id?: StringFilter<"DraftSession"> | string
    teamId?: StringFilter<"DraftSession"> | string
    teamName?: StringFilter<"DraftSession"> | string
    status?: StringFilter<"DraftSession"> | string
    startedAt?: DateTimeFilter<"DraftSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"DraftSession"> | Date | string | null
    grade?: StringNullableFilter<"DraftSession"> | string | null
    gradeScore?: IntNullableFilter<"DraftSession"> | number | null
    picks?: DraftPickListRelationFilter
  }

  export type DraftSessionOrderByWithRelationInput = {
    id?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    grade?: SortOrderInput | SortOrder
    gradeScore?: SortOrderInput | SortOrder
    picks?: DraftPickOrderByRelationAggregateInput
  }

  export type DraftSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DraftSessionWhereInput | DraftSessionWhereInput[]
    OR?: DraftSessionWhereInput[]
    NOT?: DraftSessionWhereInput | DraftSessionWhereInput[]
    teamId?: StringFilter<"DraftSession"> | string
    teamName?: StringFilter<"DraftSession"> | string
    status?: StringFilter<"DraftSession"> | string
    startedAt?: DateTimeFilter<"DraftSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"DraftSession"> | Date | string | null
    grade?: StringNullableFilter<"DraftSession"> | string | null
    gradeScore?: IntNullableFilter<"DraftSession"> | number | null
    picks?: DraftPickListRelationFilter
  }, "id">

  export type DraftSessionOrderByWithAggregationInput = {
    id?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    grade?: SortOrderInput | SortOrder
    gradeScore?: SortOrderInput | SortOrder
    _count?: DraftSessionCountOrderByAggregateInput
    _avg?: DraftSessionAvgOrderByAggregateInput
    _max?: DraftSessionMaxOrderByAggregateInput
    _min?: DraftSessionMinOrderByAggregateInput
    _sum?: DraftSessionSumOrderByAggregateInput
  }

  export type DraftSessionScalarWhereWithAggregatesInput = {
    AND?: DraftSessionScalarWhereWithAggregatesInput | DraftSessionScalarWhereWithAggregatesInput[]
    OR?: DraftSessionScalarWhereWithAggregatesInput[]
    NOT?: DraftSessionScalarWhereWithAggregatesInput | DraftSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DraftSession"> | string
    teamId?: StringWithAggregatesFilter<"DraftSession"> | string
    teamName?: StringWithAggregatesFilter<"DraftSession"> | string
    status?: StringWithAggregatesFilter<"DraftSession"> | string
    startedAt?: DateTimeWithAggregatesFilter<"DraftSession"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"DraftSession"> | Date | string | null
    grade?: StringNullableWithAggregatesFilter<"DraftSession"> | string | null
    gradeScore?: IntNullableWithAggregatesFilter<"DraftSession"> | number | null
  }

  export type DraftPickWhereInput = {
    AND?: DraftPickWhereInput | DraftPickWhereInput[]
    OR?: DraftPickWhereInput[]
    NOT?: DraftPickWhereInput | DraftPickWhereInput[]
    id?: StringFilter<"DraftPick"> | string
    sessionId?: StringFilter<"DraftPick"> | string
    overall?: IntFilter<"DraftPick"> | number
    round?: IntFilter<"DraftPick"> | number
    pickInRound?: IntFilter<"DraftPick"> | number
    teamId?: StringFilter<"DraftPick"> | string
    teamName?: StringFilter<"DraftPick"> | string
    prospectId?: StringFilter<"DraftPick"> | string
    prospectName?: StringFilter<"DraftPick"> | string
    prospectPosition?: StringFilter<"DraftPick"> | string
    prospectGrade?: IntFilter<"DraftPick"> | number
    isUserPick?: BoolFilter<"DraftPick"> | boolean
    isTrade?: BoolFilter<"DraftPick"> | boolean
    createdAt?: DateTimeFilter<"DraftPick"> | Date | string
    session?: XOR<DraftSessionScalarRelationFilter, DraftSessionWhereInput>
  }

  export type DraftPickOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    overall?: SortOrder
    round?: SortOrder
    pickInRound?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    prospectPosition?: SortOrder
    prospectGrade?: SortOrder
    isUserPick?: SortOrder
    isTrade?: SortOrder
    createdAt?: SortOrder
    session?: DraftSessionOrderByWithRelationInput
  }

  export type DraftPickWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DraftPickWhereInput | DraftPickWhereInput[]
    OR?: DraftPickWhereInput[]
    NOT?: DraftPickWhereInput | DraftPickWhereInput[]
    sessionId?: StringFilter<"DraftPick"> | string
    overall?: IntFilter<"DraftPick"> | number
    round?: IntFilter<"DraftPick"> | number
    pickInRound?: IntFilter<"DraftPick"> | number
    teamId?: StringFilter<"DraftPick"> | string
    teamName?: StringFilter<"DraftPick"> | string
    prospectId?: StringFilter<"DraftPick"> | string
    prospectName?: StringFilter<"DraftPick"> | string
    prospectPosition?: StringFilter<"DraftPick"> | string
    prospectGrade?: IntFilter<"DraftPick"> | number
    isUserPick?: BoolFilter<"DraftPick"> | boolean
    isTrade?: BoolFilter<"DraftPick"> | boolean
    createdAt?: DateTimeFilter<"DraftPick"> | Date | string
    session?: XOR<DraftSessionScalarRelationFilter, DraftSessionWhereInput>
  }, "id">

  export type DraftPickOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    overall?: SortOrder
    round?: SortOrder
    pickInRound?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    prospectPosition?: SortOrder
    prospectGrade?: SortOrder
    isUserPick?: SortOrder
    isTrade?: SortOrder
    createdAt?: SortOrder
    _count?: DraftPickCountOrderByAggregateInput
    _avg?: DraftPickAvgOrderByAggregateInput
    _max?: DraftPickMaxOrderByAggregateInput
    _min?: DraftPickMinOrderByAggregateInput
    _sum?: DraftPickSumOrderByAggregateInput
  }

  export type DraftPickScalarWhereWithAggregatesInput = {
    AND?: DraftPickScalarWhereWithAggregatesInput | DraftPickScalarWhereWithAggregatesInput[]
    OR?: DraftPickScalarWhereWithAggregatesInput[]
    NOT?: DraftPickScalarWhereWithAggregatesInput | DraftPickScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DraftPick"> | string
    sessionId?: StringWithAggregatesFilter<"DraftPick"> | string
    overall?: IntWithAggregatesFilter<"DraftPick"> | number
    round?: IntWithAggregatesFilter<"DraftPick"> | number
    pickInRound?: IntWithAggregatesFilter<"DraftPick"> | number
    teamId?: StringWithAggregatesFilter<"DraftPick"> | string
    teamName?: StringWithAggregatesFilter<"DraftPick"> | string
    prospectId?: StringWithAggregatesFilter<"DraftPick"> | string
    prospectName?: StringWithAggregatesFilter<"DraftPick"> | string
    prospectPosition?: StringWithAggregatesFilter<"DraftPick"> | string
    prospectGrade?: IntWithAggregatesFilter<"DraftPick"> | number
    isUserPick?: BoolWithAggregatesFilter<"DraftPick"> | boolean
    isTrade?: BoolWithAggregatesFilter<"DraftPick"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"DraftPick"> | Date | string
  }

  export type GameResultWhereInput = {
    AND?: GameResultWhereInput | GameResultWhereInput[]
    OR?: GameResultWhereInput[]
    NOT?: GameResultWhereInput | GameResultWhereInput[]
    id?: StringFilter<"GameResult"> | string
    homeTeamId?: StringFilter<"GameResult"> | string
    homeTeamName?: StringFilter<"GameResult"> | string
    homeScore?: IntFilter<"GameResult"> | number
    awayTeamId?: StringFilter<"GameResult"> | string
    awayTeamName?: StringFilter<"GameResult"> | string
    awayScore?: IntFilter<"GameResult"> | number
    league?: StringFilter<"GameResult"> | string
    playedAt?: DateTimeFilter<"GameResult"> | Date | string
  }

  export type GameResultOrderByWithRelationInput = {
    id?: SortOrder
    homeTeamId?: SortOrder
    homeTeamName?: SortOrder
    homeScore?: SortOrder
    awayTeamId?: SortOrder
    awayTeamName?: SortOrder
    awayScore?: SortOrder
    league?: SortOrder
    playedAt?: SortOrder
  }

  export type GameResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GameResultWhereInput | GameResultWhereInput[]
    OR?: GameResultWhereInput[]
    NOT?: GameResultWhereInput | GameResultWhereInput[]
    homeTeamId?: StringFilter<"GameResult"> | string
    homeTeamName?: StringFilter<"GameResult"> | string
    homeScore?: IntFilter<"GameResult"> | number
    awayTeamId?: StringFilter<"GameResult"> | string
    awayTeamName?: StringFilter<"GameResult"> | string
    awayScore?: IntFilter<"GameResult"> | number
    league?: StringFilter<"GameResult"> | string
    playedAt?: DateTimeFilter<"GameResult"> | Date | string
  }, "id">

  export type GameResultOrderByWithAggregationInput = {
    id?: SortOrder
    homeTeamId?: SortOrder
    homeTeamName?: SortOrder
    homeScore?: SortOrder
    awayTeamId?: SortOrder
    awayTeamName?: SortOrder
    awayScore?: SortOrder
    league?: SortOrder
    playedAt?: SortOrder
    _count?: GameResultCountOrderByAggregateInput
    _avg?: GameResultAvgOrderByAggregateInput
    _max?: GameResultMaxOrderByAggregateInput
    _min?: GameResultMinOrderByAggregateInput
    _sum?: GameResultSumOrderByAggregateInput
  }

  export type GameResultScalarWhereWithAggregatesInput = {
    AND?: GameResultScalarWhereWithAggregatesInput | GameResultScalarWhereWithAggregatesInput[]
    OR?: GameResultScalarWhereWithAggregatesInput[]
    NOT?: GameResultScalarWhereWithAggregatesInput | GameResultScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GameResult"> | string
    homeTeamId?: StringWithAggregatesFilter<"GameResult"> | string
    homeTeamName?: StringWithAggregatesFilter<"GameResult"> | string
    homeScore?: IntWithAggregatesFilter<"GameResult"> | number
    awayTeamId?: StringWithAggregatesFilter<"GameResult"> | string
    awayTeamName?: StringWithAggregatesFilter<"GameResult"> | string
    awayScore?: IntWithAggregatesFilter<"GameResult"> | number
    league?: StringWithAggregatesFilter<"GameResult"> | string
    playedAt?: DateTimeWithAggregatesFilter<"GameResult"> | Date | string
  }

  export type ScoutingReportWhereInput = {
    AND?: ScoutingReportWhereInput | ScoutingReportWhereInput[]
    OR?: ScoutingReportWhereInput[]
    NOT?: ScoutingReportWhereInput | ScoutingReportWhereInput[]
    id?: StringFilter<"ScoutingReport"> | string
    prospectId?: StringFilter<"ScoutingReport"> | string
    prospectName?: StringFilter<"ScoutingReport"> | string
    report?: StringFilter<"ScoutingReport"> | string
    createdAt?: DateTimeFilter<"ScoutingReport"> | Date | string
  }

  export type ScoutingReportOrderByWithRelationInput = {
    id?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    report?: SortOrder
    createdAt?: SortOrder
  }

  export type ScoutingReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ScoutingReportWhereInput | ScoutingReportWhereInput[]
    OR?: ScoutingReportWhereInput[]
    NOT?: ScoutingReportWhereInput | ScoutingReportWhereInput[]
    prospectId?: StringFilter<"ScoutingReport"> | string
    prospectName?: StringFilter<"ScoutingReport"> | string
    report?: StringFilter<"ScoutingReport"> | string
    createdAt?: DateTimeFilter<"ScoutingReport"> | Date | string
  }, "id">

  export type ScoutingReportOrderByWithAggregationInput = {
    id?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    report?: SortOrder
    createdAt?: SortOrder
    _count?: ScoutingReportCountOrderByAggregateInput
    _max?: ScoutingReportMaxOrderByAggregateInput
    _min?: ScoutingReportMinOrderByAggregateInput
  }

  export type ScoutingReportScalarWhereWithAggregatesInput = {
    AND?: ScoutingReportScalarWhereWithAggregatesInput | ScoutingReportScalarWhereWithAggregatesInput[]
    OR?: ScoutingReportScalarWhereWithAggregatesInput[]
    NOT?: ScoutingReportScalarWhereWithAggregatesInput | ScoutingReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ScoutingReport"> | string
    prospectId?: StringWithAggregatesFilter<"ScoutingReport"> | string
    prospectName?: StringWithAggregatesFilter<"ScoutingReport"> | string
    report?: StringWithAggregatesFilter<"ScoutingReport"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ScoutingReport"> | Date | string
  }

  export type DraftSessionCreateInput = {
    id?: string
    teamId: string
    teamName: string
    status?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    grade?: string | null
    gradeScore?: number | null
    picks?: DraftPickCreateNestedManyWithoutSessionInput
  }

  export type DraftSessionUncheckedCreateInput = {
    id?: string
    teamId: string
    teamName: string
    status?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    grade?: string | null
    gradeScore?: number | null
    picks?: DraftPickUncheckedCreateNestedManyWithoutSessionInput
  }

  export type DraftSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    gradeScore?: NullableIntFieldUpdateOperationsInput | number | null
    picks?: DraftPickUpdateManyWithoutSessionNestedInput
  }

  export type DraftSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    gradeScore?: NullableIntFieldUpdateOperationsInput | number | null
    picks?: DraftPickUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type DraftSessionCreateManyInput = {
    id?: string
    teamId: string
    teamName: string
    status?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    grade?: string | null
    gradeScore?: number | null
  }

  export type DraftSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    gradeScore?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DraftSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    gradeScore?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DraftPickCreateInput = {
    id?: string
    overall: number
    round: number
    pickInRound: number
    teamId: string
    teamName: string
    prospectId: string
    prospectName: string
    prospectPosition: string
    prospectGrade: number
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: Date | string
    session: DraftSessionCreateNestedOneWithoutPicksInput
  }

  export type DraftPickUncheckedCreateInput = {
    id?: string
    sessionId: string
    overall: number
    round: number
    pickInRound: number
    teamId: string
    teamName: string
    prospectId: string
    prospectName: string
    prospectPosition: string
    prospectGrade: number
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: Date | string
  }

  export type DraftPickUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    overall?: IntFieldUpdateOperationsInput | number
    round?: IntFieldUpdateOperationsInput | number
    pickInRound?: IntFieldUpdateOperationsInput | number
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    prospectPosition?: StringFieldUpdateOperationsInput | string
    prospectGrade?: IntFieldUpdateOperationsInput | number
    isUserPick?: BoolFieldUpdateOperationsInput | boolean
    isTrade?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: DraftSessionUpdateOneRequiredWithoutPicksNestedInput
  }

  export type DraftPickUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    overall?: IntFieldUpdateOperationsInput | number
    round?: IntFieldUpdateOperationsInput | number
    pickInRound?: IntFieldUpdateOperationsInput | number
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    prospectPosition?: StringFieldUpdateOperationsInput | string
    prospectGrade?: IntFieldUpdateOperationsInput | number
    isUserPick?: BoolFieldUpdateOperationsInput | boolean
    isTrade?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftPickCreateManyInput = {
    id?: string
    sessionId: string
    overall: number
    round: number
    pickInRound: number
    teamId: string
    teamName: string
    prospectId: string
    prospectName: string
    prospectPosition: string
    prospectGrade: number
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: Date | string
  }

  export type DraftPickUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    overall?: IntFieldUpdateOperationsInput | number
    round?: IntFieldUpdateOperationsInput | number
    pickInRound?: IntFieldUpdateOperationsInput | number
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    prospectPosition?: StringFieldUpdateOperationsInput | string
    prospectGrade?: IntFieldUpdateOperationsInput | number
    isUserPick?: BoolFieldUpdateOperationsInput | boolean
    isTrade?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftPickUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    overall?: IntFieldUpdateOperationsInput | number
    round?: IntFieldUpdateOperationsInput | number
    pickInRound?: IntFieldUpdateOperationsInput | number
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    prospectPosition?: StringFieldUpdateOperationsInput | string
    prospectGrade?: IntFieldUpdateOperationsInput | number
    isUserPick?: BoolFieldUpdateOperationsInput | boolean
    isTrade?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameResultCreateInput = {
    id?: string
    homeTeamId: string
    homeTeamName: string
    homeScore: number
    awayTeamId: string
    awayTeamName: string
    awayScore: number
    league: string
    playedAt?: Date | string
  }

  export type GameResultUncheckedCreateInput = {
    id?: string
    homeTeamId: string
    homeTeamName: string
    homeScore: number
    awayTeamId: string
    awayTeamName: string
    awayScore: number
    league: string
    playedAt?: Date | string
  }

  export type GameResultUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeamId?: StringFieldUpdateOperationsInput | string
    homeTeamName?: StringFieldUpdateOperationsInput | string
    homeScore?: IntFieldUpdateOperationsInput | number
    awayTeamId?: StringFieldUpdateOperationsInput | string
    awayTeamName?: StringFieldUpdateOperationsInput | string
    awayScore?: IntFieldUpdateOperationsInput | number
    league?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameResultUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeamId?: StringFieldUpdateOperationsInput | string
    homeTeamName?: StringFieldUpdateOperationsInput | string
    homeScore?: IntFieldUpdateOperationsInput | number
    awayTeamId?: StringFieldUpdateOperationsInput | string
    awayTeamName?: StringFieldUpdateOperationsInput | string
    awayScore?: IntFieldUpdateOperationsInput | number
    league?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameResultCreateManyInput = {
    id?: string
    homeTeamId: string
    homeTeamName: string
    homeScore: number
    awayTeamId: string
    awayTeamName: string
    awayScore: number
    league: string
    playedAt?: Date | string
  }

  export type GameResultUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeamId?: StringFieldUpdateOperationsInput | string
    homeTeamName?: StringFieldUpdateOperationsInput | string
    homeScore?: IntFieldUpdateOperationsInput | number
    awayTeamId?: StringFieldUpdateOperationsInput | string
    awayTeamName?: StringFieldUpdateOperationsInput | string
    awayScore?: IntFieldUpdateOperationsInput | number
    league?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameResultUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeamId?: StringFieldUpdateOperationsInput | string
    homeTeamName?: StringFieldUpdateOperationsInput | string
    homeScore?: IntFieldUpdateOperationsInput | number
    awayTeamId?: StringFieldUpdateOperationsInput | string
    awayTeamName?: StringFieldUpdateOperationsInput | string
    awayScore?: IntFieldUpdateOperationsInput | number
    league?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScoutingReportCreateInput = {
    id?: string
    prospectId: string
    prospectName: string
    report: string
    createdAt?: Date | string
  }

  export type ScoutingReportUncheckedCreateInput = {
    id?: string
    prospectId: string
    prospectName: string
    report: string
    createdAt?: Date | string
  }

  export type ScoutingReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    report?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScoutingReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    report?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScoutingReportCreateManyInput = {
    id?: string
    prospectId: string
    prospectName: string
    report: string
    createdAt?: Date | string
  }

  export type ScoutingReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    report?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScoutingReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    report?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DraftPickListRelationFilter = {
    every?: DraftPickWhereInput
    some?: DraftPickWhereInput
    none?: DraftPickWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DraftPickOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DraftSessionCountOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    grade?: SortOrder
    gradeScore?: SortOrder
  }

  export type DraftSessionAvgOrderByAggregateInput = {
    gradeScore?: SortOrder
  }

  export type DraftSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    grade?: SortOrder
    gradeScore?: SortOrder
  }

  export type DraftSessionMinOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    grade?: SortOrder
    gradeScore?: SortOrder
  }

  export type DraftSessionSumOrderByAggregateInput = {
    gradeScore?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
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

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
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

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DraftSessionScalarRelationFilter = {
    is?: DraftSessionWhereInput
    isNot?: DraftSessionWhereInput
  }

  export type DraftPickCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    overall?: SortOrder
    round?: SortOrder
    pickInRound?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    prospectPosition?: SortOrder
    prospectGrade?: SortOrder
    isUserPick?: SortOrder
    isTrade?: SortOrder
    createdAt?: SortOrder
  }

  export type DraftPickAvgOrderByAggregateInput = {
    overall?: SortOrder
    round?: SortOrder
    pickInRound?: SortOrder
    prospectGrade?: SortOrder
  }

  export type DraftPickMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    overall?: SortOrder
    round?: SortOrder
    pickInRound?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    prospectPosition?: SortOrder
    prospectGrade?: SortOrder
    isUserPick?: SortOrder
    isTrade?: SortOrder
    createdAt?: SortOrder
  }

  export type DraftPickMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    overall?: SortOrder
    round?: SortOrder
    pickInRound?: SortOrder
    teamId?: SortOrder
    teamName?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    prospectPosition?: SortOrder
    prospectGrade?: SortOrder
    isUserPick?: SortOrder
    isTrade?: SortOrder
    createdAt?: SortOrder
  }

  export type DraftPickSumOrderByAggregateInput = {
    overall?: SortOrder
    round?: SortOrder
    pickInRound?: SortOrder
    prospectGrade?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type GameResultCountOrderByAggregateInput = {
    id?: SortOrder
    homeTeamId?: SortOrder
    homeTeamName?: SortOrder
    homeScore?: SortOrder
    awayTeamId?: SortOrder
    awayTeamName?: SortOrder
    awayScore?: SortOrder
    league?: SortOrder
    playedAt?: SortOrder
  }

  export type GameResultAvgOrderByAggregateInput = {
    homeScore?: SortOrder
    awayScore?: SortOrder
  }

  export type GameResultMaxOrderByAggregateInput = {
    id?: SortOrder
    homeTeamId?: SortOrder
    homeTeamName?: SortOrder
    homeScore?: SortOrder
    awayTeamId?: SortOrder
    awayTeamName?: SortOrder
    awayScore?: SortOrder
    league?: SortOrder
    playedAt?: SortOrder
  }

  export type GameResultMinOrderByAggregateInput = {
    id?: SortOrder
    homeTeamId?: SortOrder
    homeTeamName?: SortOrder
    homeScore?: SortOrder
    awayTeamId?: SortOrder
    awayTeamName?: SortOrder
    awayScore?: SortOrder
    league?: SortOrder
    playedAt?: SortOrder
  }

  export type GameResultSumOrderByAggregateInput = {
    homeScore?: SortOrder
    awayScore?: SortOrder
  }

  export type ScoutingReportCountOrderByAggregateInput = {
    id?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    report?: SortOrder
    createdAt?: SortOrder
  }

  export type ScoutingReportMaxOrderByAggregateInput = {
    id?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    report?: SortOrder
    createdAt?: SortOrder
  }

  export type ScoutingReportMinOrderByAggregateInput = {
    id?: SortOrder
    prospectId?: SortOrder
    prospectName?: SortOrder
    report?: SortOrder
    createdAt?: SortOrder
  }

  export type DraftPickCreateNestedManyWithoutSessionInput = {
    create?: XOR<DraftPickCreateWithoutSessionInput, DraftPickUncheckedCreateWithoutSessionInput> | DraftPickCreateWithoutSessionInput[] | DraftPickUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: DraftPickCreateOrConnectWithoutSessionInput | DraftPickCreateOrConnectWithoutSessionInput[]
    createMany?: DraftPickCreateManySessionInputEnvelope
    connect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
  }

  export type DraftPickUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<DraftPickCreateWithoutSessionInput, DraftPickUncheckedCreateWithoutSessionInput> | DraftPickCreateWithoutSessionInput[] | DraftPickUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: DraftPickCreateOrConnectWithoutSessionInput | DraftPickCreateOrConnectWithoutSessionInput[]
    createMany?: DraftPickCreateManySessionInputEnvelope
    connect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DraftPickUpdateManyWithoutSessionNestedInput = {
    create?: XOR<DraftPickCreateWithoutSessionInput, DraftPickUncheckedCreateWithoutSessionInput> | DraftPickCreateWithoutSessionInput[] | DraftPickUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: DraftPickCreateOrConnectWithoutSessionInput | DraftPickCreateOrConnectWithoutSessionInput[]
    upsert?: DraftPickUpsertWithWhereUniqueWithoutSessionInput | DraftPickUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: DraftPickCreateManySessionInputEnvelope
    set?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
    disconnect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
    delete?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
    connect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
    update?: DraftPickUpdateWithWhereUniqueWithoutSessionInput | DraftPickUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: DraftPickUpdateManyWithWhereWithoutSessionInput | DraftPickUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: DraftPickScalarWhereInput | DraftPickScalarWhereInput[]
  }

  export type DraftPickUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<DraftPickCreateWithoutSessionInput, DraftPickUncheckedCreateWithoutSessionInput> | DraftPickCreateWithoutSessionInput[] | DraftPickUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: DraftPickCreateOrConnectWithoutSessionInput | DraftPickCreateOrConnectWithoutSessionInput[]
    upsert?: DraftPickUpsertWithWhereUniqueWithoutSessionInput | DraftPickUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: DraftPickCreateManySessionInputEnvelope
    set?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
    disconnect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
    delete?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
    connect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[]
    update?: DraftPickUpdateWithWhereUniqueWithoutSessionInput | DraftPickUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: DraftPickUpdateManyWithWhereWithoutSessionInput | DraftPickUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: DraftPickScalarWhereInput | DraftPickScalarWhereInput[]
  }

  export type DraftSessionCreateNestedOneWithoutPicksInput = {
    create?: XOR<DraftSessionCreateWithoutPicksInput, DraftSessionUncheckedCreateWithoutPicksInput>
    connectOrCreate?: DraftSessionCreateOrConnectWithoutPicksInput
    connect?: DraftSessionWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DraftSessionUpdateOneRequiredWithoutPicksNestedInput = {
    create?: XOR<DraftSessionCreateWithoutPicksInput, DraftSessionUncheckedCreateWithoutPicksInput>
    connectOrCreate?: DraftSessionCreateOrConnectWithoutPicksInput
    upsert?: DraftSessionUpsertWithoutPicksInput
    connect?: DraftSessionWhereUniqueInput
    update?: XOR<XOR<DraftSessionUpdateToOneWithWhereWithoutPicksInput, DraftSessionUpdateWithoutPicksInput>, DraftSessionUncheckedUpdateWithoutPicksInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
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

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
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

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
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
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DraftPickCreateWithoutSessionInput = {
    id?: string
    overall: number
    round: number
    pickInRound: number
    teamId: string
    teamName: string
    prospectId: string
    prospectName: string
    prospectPosition: string
    prospectGrade: number
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: Date | string
  }

  export type DraftPickUncheckedCreateWithoutSessionInput = {
    id?: string
    overall: number
    round: number
    pickInRound: number
    teamId: string
    teamName: string
    prospectId: string
    prospectName: string
    prospectPosition: string
    prospectGrade: number
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: Date | string
  }

  export type DraftPickCreateOrConnectWithoutSessionInput = {
    where: DraftPickWhereUniqueInput
    create: XOR<DraftPickCreateWithoutSessionInput, DraftPickUncheckedCreateWithoutSessionInput>
  }

  export type DraftPickCreateManySessionInputEnvelope = {
    data: DraftPickCreateManySessionInput | DraftPickCreateManySessionInput[]
  }

  export type DraftPickUpsertWithWhereUniqueWithoutSessionInput = {
    where: DraftPickWhereUniqueInput
    update: XOR<DraftPickUpdateWithoutSessionInput, DraftPickUncheckedUpdateWithoutSessionInput>
    create: XOR<DraftPickCreateWithoutSessionInput, DraftPickUncheckedCreateWithoutSessionInput>
  }

  export type DraftPickUpdateWithWhereUniqueWithoutSessionInput = {
    where: DraftPickWhereUniqueInput
    data: XOR<DraftPickUpdateWithoutSessionInput, DraftPickUncheckedUpdateWithoutSessionInput>
  }

  export type DraftPickUpdateManyWithWhereWithoutSessionInput = {
    where: DraftPickScalarWhereInput
    data: XOR<DraftPickUpdateManyMutationInput, DraftPickUncheckedUpdateManyWithoutSessionInput>
  }

  export type DraftPickScalarWhereInput = {
    AND?: DraftPickScalarWhereInput | DraftPickScalarWhereInput[]
    OR?: DraftPickScalarWhereInput[]
    NOT?: DraftPickScalarWhereInput | DraftPickScalarWhereInput[]
    id?: StringFilter<"DraftPick"> | string
    sessionId?: StringFilter<"DraftPick"> | string
    overall?: IntFilter<"DraftPick"> | number
    round?: IntFilter<"DraftPick"> | number
    pickInRound?: IntFilter<"DraftPick"> | number
    teamId?: StringFilter<"DraftPick"> | string
    teamName?: StringFilter<"DraftPick"> | string
    prospectId?: StringFilter<"DraftPick"> | string
    prospectName?: StringFilter<"DraftPick"> | string
    prospectPosition?: StringFilter<"DraftPick"> | string
    prospectGrade?: IntFilter<"DraftPick"> | number
    isUserPick?: BoolFilter<"DraftPick"> | boolean
    isTrade?: BoolFilter<"DraftPick"> | boolean
    createdAt?: DateTimeFilter<"DraftPick"> | Date | string
  }

  export type DraftSessionCreateWithoutPicksInput = {
    id?: string
    teamId: string
    teamName: string
    status?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    grade?: string | null
    gradeScore?: number | null
  }

  export type DraftSessionUncheckedCreateWithoutPicksInput = {
    id?: string
    teamId: string
    teamName: string
    status?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    grade?: string | null
    gradeScore?: number | null
  }

  export type DraftSessionCreateOrConnectWithoutPicksInput = {
    where: DraftSessionWhereUniqueInput
    create: XOR<DraftSessionCreateWithoutPicksInput, DraftSessionUncheckedCreateWithoutPicksInput>
  }

  export type DraftSessionUpsertWithoutPicksInput = {
    update: XOR<DraftSessionUpdateWithoutPicksInput, DraftSessionUncheckedUpdateWithoutPicksInput>
    create: XOR<DraftSessionCreateWithoutPicksInput, DraftSessionUncheckedCreateWithoutPicksInput>
    where?: DraftSessionWhereInput
  }

  export type DraftSessionUpdateToOneWithWhereWithoutPicksInput = {
    where?: DraftSessionWhereInput
    data: XOR<DraftSessionUpdateWithoutPicksInput, DraftSessionUncheckedUpdateWithoutPicksInput>
  }

  export type DraftSessionUpdateWithoutPicksInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    gradeScore?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DraftSessionUncheckedUpdateWithoutPicksInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    gradeScore?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DraftPickCreateManySessionInput = {
    id?: string
    overall: number
    round: number
    pickInRound: number
    teamId: string
    teamName: string
    prospectId: string
    prospectName: string
    prospectPosition: string
    prospectGrade: number
    isUserPick?: boolean
    isTrade?: boolean
    createdAt?: Date | string
  }

  export type DraftPickUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    overall?: IntFieldUpdateOperationsInput | number
    round?: IntFieldUpdateOperationsInput | number
    pickInRound?: IntFieldUpdateOperationsInput | number
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    prospectPosition?: StringFieldUpdateOperationsInput | string
    prospectGrade?: IntFieldUpdateOperationsInput | number
    isUserPick?: BoolFieldUpdateOperationsInput | boolean
    isTrade?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftPickUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    overall?: IntFieldUpdateOperationsInput | number
    round?: IntFieldUpdateOperationsInput | number
    pickInRound?: IntFieldUpdateOperationsInput | number
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    prospectPosition?: StringFieldUpdateOperationsInput | string
    prospectGrade?: IntFieldUpdateOperationsInput | number
    isUserPick?: BoolFieldUpdateOperationsInput | boolean
    isTrade?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftPickUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    overall?: IntFieldUpdateOperationsInput | number
    round?: IntFieldUpdateOperationsInput | number
    pickInRound?: IntFieldUpdateOperationsInput | number
    teamId?: StringFieldUpdateOperationsInput | string
    teamName?: StringFieldUpdateOperationsInput | string
    prospectId?: StringFieldUpdateOperationsInput | string
    prospectName?: StringFieldUpdateOperationsInput | string
    prospectPosition?: StringFieldUpdateOperationsInput | string
    prospectGrade?: IntFieldUpdateOperationsInput | number
    isUserPick?: BoolFieldUpdateOperationsInput | boolean
    isTrade?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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