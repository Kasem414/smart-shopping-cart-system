// This is our strategy interface
class ViewStrategy {
  render(products, categories, user, addToList, setError) {
    throw new Error('render method must be implemented');
  }
}

export default ViewStrategy; 