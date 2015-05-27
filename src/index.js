import clsify from 'cls-middleware';
import {createNamespace} from 'continuation-local-storage';

const DEFAULT_NAME = 'cls-isoflux';
const APP = 'app';

export default class Isoflux {
  constructor(name = DEFAULT_NAME) {
    this._namespace = createNamespace(name);
    this._boundClsify = clsify(this._namespace);
  }

  middleware = (req, res, next) => {
    this._boundClsify(req, res, () => this._middlewareInternal(next));
  };

  _middlewareInternal(next) {
    this._namespace.set(APP, this.createApp());
    next();
  }

  createApp() {
    throw Error('not implemented');
  }

  getApp() {
    return this._namespace.get(APP);
  }

  createProxy(Class, options) {
    const proxy = {};

    const isoflux = this;
    function defineProxiedProperty(propertyName) {
      proxy[propertyName] = function (...args) {
        const proxiedObject = isoflux._getProxiedObject(Class, options);
        return proxiedObject[propertyName].apply(proxiedObject, args);
      };
    }

    // Walk up prototype chain and proxy all available prototype properties.
    // Only handle methods for now.
    let prototype = Class.prototype;
    while (prototype) {
      Object.getOwnPropertyNames(prototype).forEach(defineProxiedProperty);
      prototype = Object.getPrototypeOf(prototype);
    }

    Object.defineProperty(proxy, 'name', {value: Class.name});
    return proxy;
  }

  _getProxiedObject(Class, options) {  // eslint-disable-line no-unused-vars
    throw Error('not implemented');
  }
}
