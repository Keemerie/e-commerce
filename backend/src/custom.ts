export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined | null;

export type OptionalBoolean = Optional<boolean>;
export type OptionalString = Optional<string>;
export type OptionalNumber = Optional<number>;

export type NullableBoolean = Nullable<boolean>;
export type NullableString = Nullable<string>;
export type NullableNumber = Nullable<number>;

export type Dictionary<T> = { [key: string]: T };
