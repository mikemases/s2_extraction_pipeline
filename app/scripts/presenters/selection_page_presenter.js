define(['views/selection_page_view'], function(SelectionPageView) {

  var SelectionPagePresenter = function (owner) {
    /* constructor
     *
     * Arguments
     * ---------
     * owner : the owner of this presenter. Expected to be the application controller
     */
    this.owner = owner;
    this.model = new selectionPageModel(this.owner.userBC);


    var order;
    var that = this;
    order_rsc_path = 'components/apiExample/order.json';
    new rsc(order_rsc_path, "read")
        .done(function (s2order) {
          order = s2order;
        })
        .fail(function () {
          // TODO: deal with error reading the order
        })
        .then(function () {
          console.log("order has been found ");
          that.model.addOrder(order);
          that.update();
        });


    this.view = undefined;
    return this;
  };

  SelectionPagePresenter.prototype.init = function (selection) {
    /* initialises this instance by instantiating the view
     */
    this.view = new SelectionPageView(this, selection);
    return this;
  };

  SelectionPagePresenter.prototype.update = function () {
    /* Updates the data for the current view
     *
     * Tells the presenter that the model has been updated
     *
     */


    if (this.view) {
      this.view.clear();
      this.view.render(this.model);
    }
    return this;
  };

  SelectionPagePresenter.prototype.release = function () {
    /* Tells the presenter to get ready for being deleted.
     *
     * This should only be called at the end of the life. It will
     * tell the view component to tell itself to disappear from the 
     * open page.
     */
    this.view.clear();
    return this;
  };

  SelectionPagePresenter.prototype.childDone = function (presenter, action, data) {
    /* Handles done messages from the page view and child presenters.
     *
     * Any messages that happen to come from the PageView will be delegated over to
     * selfDone.
     *
     * Arguments
     * ---------
     * presenter : the presenter instance the done message is coming from. Can be
     *             either the PagePresenter or one of the PartialPresenters
     * action:     a string representing the action request, e.g. 'next' for someone
     *             clicking on the next button
     * data:       Any data associated with the action.
     * 
     */
    if (presenter === this) {
      this.selfDone(action, data);
    }
    return this;
  };

  SelectionPagePresenter.prototype.selfDone = function (action, data) {
    /* Handles done messages that arose from within this object or the view
     *
     * Arguments
     * ---------
     * presenter : the presenter instance the done message is coming from. Can be
     *             either the PagePresenter or one of the PartialPresenters
     * action:     a string representing the action request, e.g. 'next' for someone
     *             clicking on the next button
     * data:       Any data associated with the action.
     * 
     */
    if (action == "tube") {
      this.owner.childDone(this, "done", data);
    }
    return this;
  };

  return SelectionPagePresenter;
});
