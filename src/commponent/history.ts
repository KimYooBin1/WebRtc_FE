import { createBrowserHistory, createMemoryHistory } from 'history';

const isServer = typeof window === 'undefined';

export const history = isServer ? createMemoryHistory() : createBrowserHistory();
