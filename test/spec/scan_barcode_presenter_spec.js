define(['scripts/presenters/scan_barcode_presenter'], function (ScanBarcodePresenter) {
  'use strict';

  describe("ScanBarcodePresenter", function () {
    describe("default presenter", function () {

      var model = undefined;
      var presenter = undefined;
      var view = undefined;
      var app = undefined;

      function configureSpyView() {
        view = {};

        view.clear = function () {
        };

        view.render = function (data) {
        };

        spyOn(view, 'clear');
        spyOn(view, 'render');
      }

      function configureSpyAppController() {
        app = {};
        app.childDone = function (presenter, action, data) {
        };

        spyOn(app, 'childDone');
      }


      beforeEach(function () {
        configureSpyView();
        configureSpyAppController();

        presenter = new ScanBarcodePresenter(app);
        presenter.setupPresenter("tube", function () {
          return $("#content");
        });
        presenter.view = view;
      });

      it("presenter render calls view render", function () {
        presenter.renderView();
        expect(view.clear).not.toHaveBeenCalled();
        expect(view.render).toHaveBeenCalledWith(presenter.model);
      });

      it("presenter release calls clear", function () {
        presenter.release();
        expect(view.clear).toHaveBeenCalled();
        expect(view.render).not.toHaveBeenCalled();
      });

      it("scanned barcode sends message to owner", function () {
        presenter.childDone(presenter, "barcodeScanned", "tube0001");
        expect(app.childDone).toHaveBeenCalled();
      });

      it("scanned barcode sends correct message to owner", function () {
        presenter.childDone(presenter, "barcodeScanned", "tube0001");
        expect(app.childDone).toHaveBeenCalledWith([presenter, 'barcodeScanned', {BC:'tube0001'}]);
      });
    });
  });
});
