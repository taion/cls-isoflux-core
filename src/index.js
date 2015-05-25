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
    this._boundClsify(req, res, this._middlewareInternal(next));
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
    const isoflux = this;

    class Proxy {
      _getProxiedObject() {
        return isoflux._getProxiedObject(Class, options);
      }
    }

    function defineProxiedProperty(propertyName) {
      Proxy.prototype[propertyName] = function (...args) {
        const proxiedObject = this._getProxiedObject();
        return proxiedObject[propertyName].apply(proxiedObject, args);
      };
    }

    for (let propertyName in Class.prototype) {
      // Intentially capture prototype properties as well here.
      defineProxiedProperty(propertyName);
    }

    return Proxy;
  }

  _getProxiedObject(Class, options) {  // eslint-disable-line no-unused-vars
    throw Error('not implemented');
  }
}
