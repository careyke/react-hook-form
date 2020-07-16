import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import generateId from './logic/generateId';
import get from './utils/get';
import isArray from './utils/isArray';
import {
  UseWatchOptions,
  FieldValues,
  UnpackNestedValue,
  Control,
} from './types/form';
import { LiteralToPrimitive, DeepPartial } from './types/utils';

/**
 * 使用这种方式可以隔离刷新
 * 可以做到只刷新部分组件，而不是直接刷新整个表单
 * 本质就是抛弃useForm中的刷新，转而使用useWatch提供的刷新
 * @param props 
 */
export function useWatch<TWatchFieldValues extends FieldValues>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: Control;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<TWatchFieldValue extends any>(props: {
  name: string;
  control?: Control;
}): undefined | UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
export function useWatch<TWatchFieldValue extends any>(props: {
  name: string;
  defaultValue: UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
  control?: Control;
}): UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
export function useWatch<TWatchFieldValues extends FieldValues>(props: {
  name: string[];
  defaultValue?: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: Control;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<TWatchFieldValues>({
  control,
  name,
  defaultValue,
}: UseWatchOptions): TWatchFieldValues {
  const methods = useFormContext();
  const {
    watchFieldsHookRef,
    watchFieldsHookRenderRef,
    watchInternal,
    defaultValuesRef,
  } = control || methods.control;
  /**
   * 这里多余使用一个useState，就是为了隔离刷新
   */
  const [value, setValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? isString(name)
        ? get(defaultValuesRef.current, name)
        : isArray(name)
        ? name.reduce(
            (previous, inputName) => ({
              ...previous,
              [inputName]: get(defaultValuesRef.current, inputName),
            }),
            {},
          )
        : defaultValuesRef.current
      : defaultValue,
  );
  const idRef = React.useRef<string>();
  const defaultValueRef = React.useRef(defaultValue);
  const nameRef = React.useRef(name);

  const updateWatchValue = React.useCallback(
    () =>
      setValue(
        watchInternal(nameRef.current, defaultValueRef.current, idRef.current),
      ),
    [setValue, watchInternal, defaultValueRef, nameRef, idRef],
  );

  React.useEffect(() => {
    const id = (idRef.current = generateId());
    const watchFieldsHookRender = watchFieldsHookRenderRef.current;
    const watchFieldsHook = watchFieldsHookRef.current;
    watchFieldsHook[id] = new Set();
    watchFieldsHookRender[id] = updateWatchValue;
    watchInternal(nameRef.current, defaultValueRef.current, id);

    return () => {
      delete watchFieldsHook[id];
      delete watchFieldsHookRender[id];
    };
  }, [
    nameRef,
    updateWatchValue,
    watchFieldsHookRenderRef,
    watchFieldsHookRef,
    watchInternal,
    defaultValueRef,
  ]);

  return (isUndefined(value) ? defaultValue : value) as TWatchFieldValues;
}
