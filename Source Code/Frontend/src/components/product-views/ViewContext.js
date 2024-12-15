class ViewContext {
  constructor(strategy) {
    this._strategy = strategy;
  }

  setStrategy(strategy) {
    this._strategy = strategy;
  }


  executeStrategy(products, categories, user, addToList, setError, showMessage) {
    return this._strategy.render(products, categories, user, addToList, setError, showMessage);
  }
}

export default ViewContext; 