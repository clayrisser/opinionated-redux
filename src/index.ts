/**
 * Copyright 2020 Silicon Hills LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  PersistConfig,
  Persistor,
  persistReducer,
  persistStore
} from 'redux-persist';
import {
  AnyAction,
  Middleware,
  PreloadedState,
  Reducer,
  ReducersMapObject,
  Store,
  applyMiddleware,
  combineReducers,
  createStore as reduxCreateStore
} from 'redux';
import { StoreCreatorOptions } from './types';

export default class OpinionatedRedux<State> {
  private middlewares: Middleware[];

  private options: StoreCreatorOptions<State>;

  private persist?: PersistConfig<State>;

  private reducer: Reducer<State>;

  persistor?: Persistor;

  store: Store;

  constructor(
    public reducers: ReducersMapObject<State>,
    private initialState: PreloadedState<State>,
    public epics: Epic[] = [],
    options: Partial<StoreCreatorOptions<State>> = {},
    middlewares: Middleware[] = []
  ) {
    this.options = {
      devTools:
        (typeof process !== 'undefined' &&
          process?.env?.NODE_ENV === 'development') ||
        (typeof __DEV__ !== 'undefined' && __DEV__),
      ...options
    };
    if (this.options.persist) this.persist = this.options.persist;
    const epicMiddleware = createEpicMiddleware(this.options.reduxObservable);
    this.middlewares = [epicMiddleware, ...middlewares];
    this.reducer = (this.persist
      ? persistReducer<State>(
          this.persist,
          combineReducers<State>(this.reducers)
        )
      : combineReducers<State>(this.reducers)) as Reducer<State, AnyAction>;
    const composeEnhancers = this.options.devTools
      ? composeWithDevTools(
          typeof this.options.devTools === 'object' ? this.options.devTools : {}
        )
      : null;
    this.store = reduxCreateStore<State, any, any, any>(
      this.reducer,
      this.initialState,
      composeEnhancers
        ? composeEnhancers(applyMiddleware(...this.middlewares))
        : applyMiddleware(...this.middlewares)
    );
    const rootEpic = combineEpics(...epics);
    epicMiddleware.run(rootEpic);
    if (this.persist) this.persistor = persistStore(this.store);
  }
}
