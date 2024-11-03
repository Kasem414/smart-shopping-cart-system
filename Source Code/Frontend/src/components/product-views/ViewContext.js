class ViewContext {
  constructor(strategy) {
    this._strategy = strategy;
  }

  setStrategy(strategy) {
    this._strategy = strategy;
  }

  executeStrategy(products, categories, user, addToList, setError) {
    return this._strategy.render(products, categories, user, addToList, setError);
  }
}

export default ViewContext; 